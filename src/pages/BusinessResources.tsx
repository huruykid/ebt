import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, ExternalLink, FileText, Phone, Mail } from "lucide-react";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";

export default function BusinessResources() {
  const checklist = [
    "Verify you meet USDA eligibility requirements",
    "Gather all necessary business documentation",
    "Complete online application at USDA FNS website",
    "Prepare for site inspection",
    "Research and select EBT equipment provider",
    "Set up transaction processing account",
    "Train all staff on EBT procedures",
    "Display authorization and signage prominently",
    "Maintain required inventory levels",
    "Keep accurate records of EBT transactions"
  ];

  const resources = [
    {
      title: "USDA SNAP Retailer Application",
      description: "Official application portal for SNAP authorization",
      url: "https://www.fns.usda.gov/snap/retailer",
      icon: ExternalLink
    },
    {
      title: "FNS Retailer Service Center",
      description: "Call for application support and questions",
      phone: "1-877-823-4369",
      icon: Phone
    },
    {
      title: "Restaurant Meals Program (RMP)",
      description: "Information for restaurants accepting EBT",
      url: "https://www.fns.usda.gov/snap/retailer/restaurant-meals-program",
      icon: ExternalLink
    },
    {
      title: "SNAP Retailer Management",
      description: "Portal to manage your authorization",
      url: "https://www.fns.usda.gov/snap/retailer/apply",
      icon: ExternalLink
    }
  ];

  const faqItems = [
    {
      question: "How long does the application process take?",
      answer: "Typical processing time is 45-60 days from submission to approval, assuming all documentation is complete."
    },
    {
      question: "What are the costs to accept EBT?",
      answer: "Application is free. EBT equipment costs $0-$300 upfront or $20-$40/month rental. Transaction fees are typically 1-2%."
    },
    {
      question: "Do I need a specific type of store?",
      answer: "You must stock staple foods in at least 3 categories (dairy, bread/cereal, fruits/vegetables, meat/fish) with perishables in 2 categories."
    },
    {
      question: "Can food trucks accept EBT?",
      answer: "Yes, mobile food vendors can apply but have additional requirements. Contact the FNS Retailer Service Center for details."
    }
  ];

  return (
    <ProtectedRoute requireAuth={false}>
      <SEOHead
        title="Business Resources: How to Accept EBT/SNAP | SNAP Savvy"
        description="Complete guide for small businesses and restaurants to start accepting EBT/SNAP benefits. Includes step-by-step instructions, downloadable checklist, and resources."
        keywords="accept EBT, SNAP retailer, business EBT guide, restaurant meals program, EBT authorization"
        canonicalUrl="https://ebtfinder.org/business-resources"
      />

      <div className="min-h-screen bg-background">
        <BreadcrumbNavigation
          items={[
            { label: 'Home', href: '/' },
            { label: 'Business Resources', href: '/business-resources' }
          ]}
        />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-info/5 py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Business Resources
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything small businesses and restaurants need to start accepting EBT/SNAP benefits
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl space-y-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle>Why Accept EBT/SNAP?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  With over 42 million Americans using SNAP benefits, becoming an authorized EBT retailer can significantly expand your customer base and increase sales. The process is straightforward, and we're here to guide you through every step.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">42M+</div>
                    <div className="text-sm text-muted-foreground">SNAP Recipients</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">$120B</div>
                    <div className="text-sm text-muted-foreground">Annual Benefits</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">Free</div>
                    <div className="text-sm text-muted-foreground">Application Cost</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  EBT Authorization Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {checklist.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Printable Checklist (PDF)
                </Button>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Helpful Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                    <div className="p-2 rounded-full bg-primary/10">
                      <resource.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">{resource.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Visit Website <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {resource.phone && (
                        <a
                          href={`tel:${resource.phone}`}
                          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {resource.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {faqItems.map((item, index) => (
                  <div key={index}>
                    <h4 className="font-semibold text-foreground mb-2">{item.question}</h4>
                    <p className="text-muted-foreground text-sm">{item.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact CTA */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Need Help Getting Started?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Our team can answer your questions about accepting EBT at your business
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button asChild>
                    <a href="/blog/small-stores-accept-ebt-guide">
                      Read Full Guide
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="mailto:support@ebtfinder.org">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Support
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
