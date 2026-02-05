import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ClaimBusinessRequest {
  storeId: string;
  storeName: string;
  businessRole: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  verificationMethod: string;
  additionalInfo?: string;
}

// Rate limiting map: userId -> array of timestamps
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 3600000; // 1 hour in ms
const MAX_REQUESTS_PER_HOUR = 3; // Stricter limit for business claims

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userRequests = rateLimitMap.get(userId) || [];
  
  // Filter out requests older than 1 hour
  const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_HOUR) {
    return false;
  }
  
  // Add current request and update map
  recentRequests.push(now);
  rateLimitMap.set(userId, recentRequests);
  return true;
}

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>'"&]/g, '')
    .substring(0, 2000);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Maximum 3 business claims per hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { 
      storeId, 
      storeName, 
      businessRole, 
      ownerName, 
      ownerEmail, 
      phone, 
      verificationMethod, 
      additionalInfo 
    }: ClaimBusinessRequest = await req.json();

    // Validate required fields
    if (!storeId || !storeName || !businessRole || !ownerName || !ownerEmail || !phone || !verificationMethod) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email and phone
    if (!isValidEmail(ownerEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidPhone(phone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize all inputs
    const sanitizedStoreId = sanitizeInput(storeId);
    const sanitizedStoreName = sanitizeInput(storeName);
    const sanitizedBusinessRole = sanitizeInput(businessRole);
    const sanitizedOwnerName = sanitizeInput(ownerName);
    const sanitizedOwnerEmail = sanitizeInput(ownerEmail);
    const sanitizedPhone = sanitizeInput(phone);
    const sanitizedVerificationMethod = sanitizeInput(verificationMethod);
    const sanitizedAdditionalInfo = additionalInfo ? sanitizeInput(additionalInfo) : undefined;

    const emailResponse = await resend.emails.send({
      from: "Business Claims <onboarding@resend.dev>",
      to: ["huruydesigns@gmail.com"],
      subject: `Business Claim Request: ${sanitizedStoreName} (#${sanitizedStoreId})`,
      html: `
        <h1>New Business Claim Request</h1>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Store Information</h2>
          <p><strong>Store Name:</strong> ${sanitizedStoreName}</p>
          <p><strong>Store ID:</strong> ${sanitizedStoreId}</p>
        </div>
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Claimant Information</h2>
          <p><strong>Name:</strong> ${sanitizedOwnerName}</p>
          <p><strong>Email:</strong> ${sanitizedOwnerEmail}</p>
          <p><strong>Phone:</strong> ${sanitizedPhone}</p>
          <p><strong>Role:</strong> ${sanitizedBusinessRole}</p>
          <p><strong>Preferred Verification:</strong> ${sanitizedVerificationMethod}</p>
        </div>
        ${sanitizedAdditionalInfo ? `
        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Additional Information</h2>
          <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #ff9800;">${sanitizedAdditionalInfo}</p>
        </div>
        ` : ''}
        <div style="background: #f1f8e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Next Steps</h2>
          <ul>
            <li>Review the claim request</li>
            <li>Verify business ownership using the preferred method</li>
            <li>Contact the claimant within 2-3 business days</li>
            <li>If verified, grant business owner access to manage the listing</li>
          </ul>
        </div>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">This claim request was submitted through the store directory application.</p>
      `,
    });

    // Mask email for privacy-compliant logging
    const maskedEmail = sanitizedOwnerEmail.replace(/^(.{2})(.*)(@.*)$/, '$1***$3');
    console.log("Claim business email sent successfully for:", maskedEmail);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-claim-business function:", error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while submitting your claim. Please try again later.' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
