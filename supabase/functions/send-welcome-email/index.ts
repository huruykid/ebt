import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  user_id: string;
  email: string;
  full_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, email, full_name }: WelcomeEmailRequest = await req.json();
    const name = full_name || "Friend";

    const emailResponse = await resend.emails.send({
      from: "The EBT Store Finder Team <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to EBT Store Finder! 🛒",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, hsl(222, 84%, 4.9%), hsl(221, 83%, 53%)); padding: 40px 30px; text-align: center;">
            <div style="color: white; font-size: 28px; font-weight: bold; margin-bottom: 8px;">
              🛒 EBT Store Finder
            </div>
            <div style="color: rgba(255, 255, 255, 0.9); font-size: 16px;">
              Making healthy food accessible to everyone
            </div>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px; font-weight: 600;">
              Hey ${name}! 👋
            </h1>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Welcome to our community! We're a small team of folks who believe that everyone deserves access to fresh, healthy food - regardless of their payment method.
            </p>

            <div style="background: linear-gradient(135deg, #f7fafc, #edf2f7); padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid hsl(221, 83%, 53%);">
              <h2 style="color: #2d3748; font-size: 18px; margin-bottom: 15px; font-weight: 600;">
                🎯 Our Mission
              </h2>
              <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0;">
                We're working to create the most comprehensive directory of EBT-accepting stores, farmers markets, and food resources. Every store you explore helps build a better map for families in need.
              </p>
            </div>

            <div style="background: #fff8dc; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #f6e05e;">
              <p style="color: #744210; font-size: 15px; line-height: 1.5; margin: 0;">
                <strong>💡 Quick tip:</strong> Use our search to find stores near you, save your favorites, and help others by leaving reviews and photos!
              </p>
            </div>

            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              As a community-driven platform, we rely on people like you to keep our information accurate and up-to-date. Whether you're sharing a great find or helping verify store details, every contribution makes a difference.
            </p>

            <!-- Call to Action -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://vpnaaaocqqmkslwqrkyd.lovable.app/" 
                 style="background: linear-gradient(135deg, hsl(221, 83%, 53%), hsl(221, 83%, 45%)); 
                        color: white; 
                        padding: 14px 28px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600; 
                        font-size: 16px; 
                        display: inline-block;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                Start Exploring Stores 🗺️
              </a>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 35px;">
              <h3 style="color: #2d3748; font-size: 16px; margin-bottom: 15px; font-weight: 600;">
                ❤️ Spread the word!
              </h3>
              <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
                Know someone who could benefit from easier access to EBT-friendly stores? Share EBT Store Finder with your friends and family. Together, we're building something that truly matters.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f7fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; font-size: 13px; margin: 0 0 8px 0;">
              Built with ❤️ by a small team passionate about food accessibility
            </p>
            <p style="color: #a0aec0; font-size: 12px; margin: 0;">
              If you have questions or feedback, we'd love to hear from you!
            </p>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent successfully to:", email, emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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