
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const emailResponse = await resend.emails.send({
      from: "Business Claims <onboarding@resend.dev>",
      to: ["huruydesigns@gmail.com"],
      subject: `Business Claim Request: ${storeName} (#${storeId})`,
      html: `
        <h1>New Business Claim Request</h1>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Store Information</h2>
          <p><strong>Store Name:</strong> ${storeName}</p>
          <p><strong>Store ID:</strong> ${storeId}</p>
        </div>
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Claimant Information</h2>
          <p><strong>Name:</strong> ${ownerName}</p>
          <p><strong>Email:</strong> ${ownerEmail}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Role:</strong> ${businessRole}</p>
          <p><strong>Preferred Verification:</strong> ${verificationMethod}</p>
        </div>
        ${additionalInfo ? `
        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Additional Information</h2>
          <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #ff9800;">${additionalInfo}</p>
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

    console.log("Claim business email sent successfully:", emailResponse);

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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
