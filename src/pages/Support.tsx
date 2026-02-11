import React from "react";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Mail, LifeBuoy } from "lucide-react";

export default function Support() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I contact EBT Finder support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can email support@ebtfinder.org for help with your account or app issues.",
        },
      },
      {
        "@type": "Question",
        name: "How can I report incorrect store information?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use the Report option on a store page or email us with the store name and location.",
        },
      },
    ],
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("Support Request - EBT Finder");
    const body = encodeURIComponent(
      "Please describe your issue here, including your device and steps to reproduce."
    );
    window.location.href = `mailto:support@ebtfinder.org?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="EBT Finder Support"
        description="Get help with EBT Finder. Find FAQs and contact support."
        keywords="EBT Finder support, help, contact, FAQ"
        canonicalUrl="https://ebtfinder.org/support"
        structuredData={structuredData}
      />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Support</h1>
          <p className="text-muted-foreground mt-2">
            We're here to help. Browse common topics or contact us directly.
          </p>
        </header>

        <section className="mb-10">
          <div className="flex flex-col items-center gap-3">
            <Button onClick={handleEmail} variant="default" className="px-6">
              <Mail className="h-4 w-4 mr-2" /> Email Support
            </Button>
            <p className="text-sm text-muted-foreground">
              Email: <a href="mailto:support@ebtfinder.org" className="text-primary underline">support@ebtfinder.org</a>
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Common Topics</h2>
          </div>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Finding EBT-accepting stores near you</li>
            <li>Using location search by city or ZIP code</li>
            <li>Reporting incorrect store details or hours</li>
            <li>Managing favorites and writing reviews</li>
          </ul>
        </section>

        <section className="mt-10 text-sm text-muted-foreground">
          <p>
            For privacy questions, view our <a href="/privacy-policy" className="text-primary underline">Privacy Policy</a>.
          </p>
        </section>
      </main>
    </div>
  );
}
