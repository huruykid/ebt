import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReportIssueRequest {
  storeId: string;
  storeName: string;
  issueType: string;
  description: string;
  userEmail?: string;
}

// Rate limiting map: userId -> array of timestamps
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 3600000; // 1 hour in ms
const MAX_REQUESTS_PER_HOUR = 5;

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
        JSON.stringify({ error: 'Rate limit exceeded. Maximum 5 reports per hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { storeId, storeName, issueType, description, userEmail }: ReportIssueRequest = await req.json();

    // Validate and sanitize inputs
    if (!storeId || !storeName || !issueType || !description) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (userEmail && !isValidEmail(userEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitizedStoreId = sanitizeInput(storeId);
    const sanitizedStoreName = sanitizeInput(storeName);
    const sanitizedIssueType = sanitizeInput(issueType);
    const sanitizedDescription = sanitizeInput(description);
    const sanitizedUserEmail = userEmail ? sanitizeInput(userEmail) : undefined;

    const emailResponse = await resend.emails.send({
      from: "Store Reports <onboarding@resend.dev>",
      to: ["huruydesigns@gmail.com"],
      subject: `Store Issue Report: ${sanitizedStoreName} (#${sanitizedStoreId})`,
      html: `
        <h1>Store Issue Report</h1>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Store Information</h2>
          <p><strong>Store Name:</strong> ${sanitizedStoreName}</p>
          <p><strong>Store ID:</strong> ${sanitizedStoreId}</p>
        </div>
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Issue Details</h2>
          <p><strong>Issue Type:</strong> ${sanitizedIssueType}</p>
          <p><strong>Description:</strong></p>
          <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #ffc107;">${sanitizedDescription}</p>
        </div>
        ${sanitizedUserEmail ? `
        <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Reporter Information</h2>
          <p><strong>Email:</strong> ${sanitizedUserEmail}</p>
        </div>
        ` : ''}
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">This report was submitted through the store directory application.</p>
      `,
    });

    console.log("Report issue email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-report-issue function:", error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while submitting your report. Please try again later.' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
