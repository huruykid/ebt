import { SEOHead } from "@/components/SEOHead";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { FAQSchema } from "@/components/FAQSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, DollarSign, ShoppingCart, AlertCircle, CreditCard, Users } from "lucide-react";

export default function SnapTips() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Complete 2025 SNAP Tips & Tricks Guide",
    "description": "Comprehensive guide to maximizing your SNAP benefits in 2025. Learn about eligible items, programs, and money-saving strategies.",
    "author": {
      "@type": "Organization",
      "name": "EBT Finder"
    },
    "publisher": {
      "@type": "Organization", 
      "name": "EBT Finder",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ebtfinder.org/ebt-logo.png"
      }
    },
    "datePublished": "2025-01-01",
    "dateModified": "2025-01-15",
    "url": "https://ebtfinder.org/snap-tips"
  };

  const faqData = [
    {
      question: "What items can I buy with SNAP benefits in 2025?",
      answer: "You can buy most food items including fruits, vegetables, meat, dairy, bread, cereals, snacks, and non-alcoholic beverages. Seeds and plants that produce food are also eligible. You cannot buy alcohol, tobacco, vitamins, hot prepared foods (unless you qualify for RMP), or non-food items."
    },
    {
      question: "What is the Restaurant Meals Program (RMP)?",
      answer: "RMP allows eligible SNAP recipients (elderly 60+, disabled, or homeless) to use benefits at participating restaurants. Not all states participate, and participating restaurants must be authorized."
    },
    {
      question: "How can I double my SNAP benefits?",
      answer: "Many farmers markets and grocery stores offer 'Double Up Food Bucks' or similar programs that match your SNAP spending on fruits and vegetables, effectively doubling your purchasing power for healthy foods."
    },
    {
      question: "Can I buy energy drinks with SNAP?",
      answer: "Energy drinks are SNAP-eligible if they have a nutrition facts label (like Red Bull, Monster). However, energy drinks with supplement facts labels are not eligible."
    },
    {
      question: "What's new with SNAP in 2025?",
      answer: "Key changes include updated income limits, expanded work requirements for some recipients, mandatory EMV chip cards in many states, and new fees for cash withdrawals at some retailers like Walmart."
    }
  ];

  return (
    <ProtectedRoute requireAuth={false}>
      <SEOHead
        title="Complete 2025 SNAP Tips & Tricks Guide | EBT Finder"
        description="Comprehensive guide to maximizing your SNAP benefits in 2025. Learn about eligible items, programs, and money-saving strategies."
        keywords="SNAP benefits 2025, EBT tips, Double Up Food Bucks, SNAP eligible items, Restaurant Meals Program, SNAP policy updates, EBT tricks, food assistance guide"
        canonicalUrl="https://ebtfinder.org/snap-tips"
        structuredData={structuredData}
      />
      <FAQSchema faqs={faqData} />
      <BreadcrumbNavigation items={[
        { label: 'Home', href: '/' },
        { label: 'SNAP Tips', href: '/snap-tips' }
      ]} />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <header className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              SNAP Tips & Tricks: 2025 Complete Guide
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Maximize your EBT benefits with these expert tips, policy updates, and money-saving strategies updated for 2025.
            </p>
          </header>

          {/* Quick Summary Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Quick Reference Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold">Tip Category</th>
                      <th className="text-left p-2 font-semibold">What to Know</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="p-2 font-medium">Double Up Programs</td>
                      <td className="p-2">Match SNAP dollars on produce—$20–$30/day in many states</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Restaurant Meals</td>
                      <td className="p-2">Use EBT at approved restaurants in limited states</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Eligible Items</td>
                      <td className="p-2">Includes birthday cakes, frozen meals, seeds, coffee</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Restrictions</td>
                      <td className="p-2">No alcohol, supplements, hot food, or household goods</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Online Shopping</td>
                      <td className="p-2">Watch for fees (e.g., Walmart's $6.99 minimum basket)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Tech Upgrades</td>
                      <td className="p-2">EMV chip EBT cards rolling out in some states</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Double Up Food Bucks */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-success" />
                Double Up Food Bucks & Market Match Programs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Double Up Food Bucks programs match SNAP dollars spent on fresh fruits and vegetables, often up to <strong>$20–$30 per day</strong>.
              </p>
              <div className="grid gap-3">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary">Michigan</Badge>
                  <span className="text-sm">$1 for $1 match up to $20/day</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary">Colorado</Badge>
                  <span className="text-sm">$20/day cap matching program</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary">Arizona</Badge>
                  <span className="text-sm">Includes dried beans, edible plants, and seeds</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary">Kansas/Missouri</Badge>
                  <span className="text-sm">50% discount up to $25/day at some markets</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary">Texas</Badge>
                  <span className="text-sm">Beaumont Farmers Market: dollar-for-dollar match up to $30/day</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Restaurant Meals Program */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Restaurant Meals Program (RMP)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Use your EBT card at participating restaurants in select states for prepared meals. Great for those unable to cook or without stable housing.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge>California</Badge>
                <Badge>New York</Badge>
                <Badge>Arizona</Badge>
                <Badge>Illinois</Badge>
                <Badge>Virginia</Badge>
                <Badge>Michigan</Badge>
                <Badge>Maryland</Badge>
                <Badge>Massachusetts</Badge>
                <Badge>Rhode Island</Badge>
              </div>
              <div className="bg-success/10 p-4 rounded-lg">
                <p className="text-sm text-success font-medium">2025 Update: Virginia expanded RMP access for eligible SNAP users</p>
              </div>
            </CardContent>
          </Card>

          {/* Eligible Items */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Surprising SNAP-Eligible Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">SNAP covers more than basic groceries. Here are some unexpected eligible items:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Birthday cakes & food baskets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Coffee & tea (beans, grounds, pods, K-cups)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Frozen prepared meals & pizza</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Take-and-bake pizzas</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Food-producing seeds & plants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Crushed or block ice</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Energy drinks (with nutrition facts)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Gift baskets with food items</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Not Eligible Items */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                What You CAN'T Buy with SNAP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Alcohol & tobacco products</span>
                  </div>
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Vitamins & supplements</span>
                  </div>
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Hot, ready-to-eat foods</span>
                  </div>
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">CBD or cannabis products</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Cleaning supplies</span>
                  </div>
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Pet food</span>
                  </div>
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Hygiene products</span>
                  </div>
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Household items</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policy Updates */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-warning" />
                2025 Policy Updates & Important Changes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-warning/10 p-4 rounded-lg">
                <h4 className="font-semibold text-warning mb-2">New Work Requirements (Effective Sept 1, 2025)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Able-bodied adults under 55 must work/train/study 20 hours/week</li>
                  <li>• Veterans and ages 55-64 now included in requirements</li>
                  <li>• Dependent cutoff age dropped from 18 to 7</li>
                  <li>• Violation = only 3 months of SNAP in 3 years</li>
                </ul>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">EMV Chip EBT Cards</h4>
                <p className="text-sm text-muted-foreground">
                  California and Oklahoma began rolling out EMV chip-enabled EBT cards for enhanced security against skimming.
                </p>
              </div>

              <div className="bg-destructive/10 p-4 rounded-lg">
                <h4 className="font-semibold text-destructive mb-2">Walmart Fee Reinstated</h4>
                <p className="text-sm text-muted-foreground">
                  As of April 2025, Walmart reinstated a $6.99 minimum basket fee for SNAP EBT customers placing grocery pickup or delivery orders under $35.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Income Eligibility */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Current Income Eligibility Limits (Oct 2024 - Sept 2025)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Single Person</h4>
                  <p className="text-sm text-muted-foreground">Gross Monthly: <strong>$1,632</strong></p>
                  <p className="text-sm text-muted-foreground">Net Monthly: <strong>$1,255</strong></p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Four-Person Household</h4>
                  <p className="text-sm text-muted-foreground">Gross Monthly: <strong>$3,380</strong></p>
                  <p className="text-sm text-muted-foreground">Net Monthly: <strong>$2,600</strong></p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Apply */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How to Apply & Check Your Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Apply for SNAP Benefits</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Apply through your state SNAP office via:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Online application portals</li>
                  <li>• In-person visits</li>
                  <li>• Mail or fax (varies by state)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Check Your EBT Balance</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Check your store purchase receipt</li>
                  <li>• Use your state's SNAP/EBT mobile app</li>
                  <li>• Call the customer service number on your card</li>
                  <li>• Check online through your state's EBT portal</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              This information is current as of September 2025. SNAP policies and eligibility requirements may vary by state. 
              Always consult your local SNAP office for the most current information specific to your area.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}