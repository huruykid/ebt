import React from "react";
import { SEOHead } from "@/components/SEOHead";

export default function PrivacyPolicy() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "EBT Finder Privacy Policy",
    url: "https://ebtfinder.org/privacy-policy",
    description: "Read how EBT Finder collects, uses, and protects your data.",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="EBT Finder Privacy Policy"
        description="Read how EBT Finder collects, uses, and protects your data."
        keywords="EBT Finder privacy policy, data protection, user data, SNAP, EBT"
        canonicalUrl="https://ebtfinder.org/privacy-policy"
        structuredData={structuredData}
      />
      <main className="max-w-4xl mx-auto p-6">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <section className="space-y-6 text-foreground">
          <p className="text-muted-foreground">
            EBT Finder ("we", "our", or "us") is committed to protecting your privacy. This
            Privacy Policy explains what information we collect, how we use it, and your choices
            regarding your information when you use our services.
          </p>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">Information We Collect</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Account information you provide (e.g., email, display name).</li>
              <li>Location information you choose to share for nearby store search.</li>
              <li>Usage data such as pages visited and actions taken (analytics).</li>
              <li>Content you submit, including reviews and comments.</li>
            </ul>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Provide and improve the EBT Finder experience and features.</li>
              <li>Personalize results based on your search and location preferences.</li>
              <li>Monitor performance, prevent abuse, and maintain security.</li>
              <li>Communicate updates or respond to support requests you initiate.</li>
            </ul>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal information. We may share data with service providers
              who help us operate the app (e.g., analytics) under confidentiality obligations, or
              when required by law.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">Data Security</h2>
            <p className="text-muted-foreground">
              We use industry-standard security measures to protect your data. However, no method
              of transmission over the internet is completely secure, and we cannot guarantee
              absolute security.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">Your Choices</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>You can update or delete your account information within the app.</li>
              <li>You may disable location sharing in your device or browser settings.</li>
              <li>You can opt out of non-essential communications at any time.</li>
            </ul>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">Children's Privacy</h2>
            <p className="text-muted-foreground">
              EBT Finder is not directed to children under 13. We do not knowingly collect
              personal information from children under 13.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will post the updated date at
              the top of this page. Continued use of the app after changes means you accept the
              revised policy.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold">Contact Us</h2>
            <p className="text-muted-foreground">
              Questions about this policy? Email us at
              {" "}
              <a href="mailto:support@ebtfinder.org" className="text-primary underline">
                support@ebtfinder.org
              </a>
              .
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
