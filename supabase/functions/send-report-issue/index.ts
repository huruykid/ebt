
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storeId, storeName, issueType, description, userEmail }: ReportIssueRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Store Reports <onboarding@resend.dev>",
      to: ["huruydesigns@gmail.com"],
      subject: `Store Issue Report: ${storeName} (#${storeId})`,
      html: `
        <h1>Store Issue Report</h1>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Store Information</h2>
          <p><strong>Store Name:</strong> ${storeName}</p>
          <p><strong>Store ID:</strong> ${storeId}</p>
        </div>
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Issue Details</h2>
          <p><strong>Issue Type:</strong> ${issueType}</p>
          <p><strong>Description:</strong></p>
          <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #ffc107;">${description}</p>
        </div>
        ${userEmail ? `
        <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Reporter Information</h2>
          <p><strong>Email:</strong> ${userEmail}</p>
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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
