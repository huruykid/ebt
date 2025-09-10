import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, Users, MapPin, Star, Clock, Utensils, ArrowRight, Home, Stethoscope, GraduationCap, Zap, Bus, ExternalLink } from "lucide-react";
export default function Mission() {
  const handleJoinCommunity = () => {
    const subject = encodeURIComponent("Join Monthly Newsletter");
    const body = encodeURIComponent("Hi team,\n\nI would like to join the monthly newsletter. Please add me to your email list.\n\nThank you!");
    window.location.href = `mailto:support@ebtfinder.org?subject=${subject}&body=${body}`;
  };

  const helpfulPrograms = [
    {
      categoryIcon: Home,
      categoryTitle: "Housing",
      programs: [
        {
          name: "Section 8 Housing Choice Vouchers",
          description: "Helps low-income families pay rent in the private housing market",
          url: "https://www.hud.gov/topics/housing_choice_voucher_program_section_8"
        },
        {
          name: "Public Housing",
          description: "Affordable apartments managed by local housing authorities",
          url: "https://www.hud.gov/program_offices/public_indian_housing/programs/ph"
        },
        {
          name: "LIHEAP (Low Income Home Energy Assistance Program)",
          description: "Helps with heating, cooling, and utility bills",
          url: "https://www.acf.hhs.gov/ocs/low-income-home-energy-assistance-program-liheap"
        },
        {
          name: "Weatherization Assistance Program",
          description: "Free home upgrades to lower energy costs",
          url: "https://www.energy.gov/scep/wap/weatherization-assistance-program"
        }
      ]
    },
    {
      categoryIcon: Stethoscope,
      categoryTitle: "Healthcare & Nutrition",
      programs: [
        {
          name: "Medicaid & CHIP",
          description: "Free or low-cost health insurance for families, children, and seniors",
          url: "https://www.medicaid.gov/"
        },
        {
          name: "WIC (Women, Infants, and Children)",
          description: "Provides food, formula, and nutrition support for moms and kids under 5",
          url: "https://www.fns.usda.gov/wic"
        },
        {
          name: "Community Health Centers",
          description: "Low-cost medical, dental, and mental health services near you",
          url: "https://findahealthcenter.hrsa.gov/"
        }
      ]
    },
    {
      categoryIcon: GraduationCap,
      categoryTitle: "Education & Childcare",
      programs: [
        {
          name: "Head Start & Early Head Start",
          description: "Free preschool, childcare, and family support for low-income households",
          url: "https://www.acf.hhs.gov/ohs"
        },
        {
          name: "Pell Grants",
          description: "Federal grants that help pay for college (no repayment required)",
          url: "https://studentaid.gov/understand-aid/types/grants/pell"
        },
        {
          name: "Child Care & Development Fund (CCDF)",
          description: "Helps cover childcare costs for working parents",
          url: "https://www.acf.hhs.gov/occ/child-care-development-fund-ccdf"
        }
      ]
    },
    {
      categoryIcon: Zap,
      categoryTitle: "Utilities & Bills",
      programs: [
        {
          name: "Lifeline",
          description: "Discounted phone or internet service for low-income households",
          url: "https://www.fcc.gov/lifeline-consumers"
        },
        {
          name: "Affordable Connectivity Program (ACP)",
          description: "Internet discount up to $30/month (up to $75 on tribal lands)",
          url: "https://www.fcc.gov/acp"
        },
        {
          name: "State Utility Assistance Programs",
          description: "Extra help with water, gas, and electricity bills",
          url: "https://www.acf.hhs.gov/ocs/map/find-local-help"
        }
      ]
    },
    {
      categoryIcon: Bus,
      categoryTitle: "Transportation & Work Support",
      programs: [
        {
          name: "Low-Income Transit Discounts",
          description: "Reduced bus/train fares in many cities",
          url: "https://www.nyc.gov/fairfares"
        },
        {
          name: "TANF (Temporary Assistance for Needy Families)",
          description: "Monthly cash support and job training for families in need",
          url: "https://www.acf.hhs.gov/ofa/programs/tanf"
        },
        {
          name: "EITC (Earned Income Tax Credit)",
          description: "A refundable tax credit that boosts income for working families",
          url: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit-eitc"
        }
      ]
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Huruy Kidanemariam",
    "jobTitle": "UX Designer & Founder",
    "worksFor": {
      "@type": "Organization",
      "name": "EBT Finder"
    },
    "url": "https://ebtfinder.org/mission",
    "sameAs": [
      "https://www.linkedin.com/in/huruydesigns/"
    ],
    "description": "UX designer and founder of EBT Finder, passionate about creating equitable digital experiences for SNAP/EBT users"
  };

  return <ProtectedRoute requireAuth={false}>
      <SEOHead 
        title="Meet Huruy Kidanemariam - Founder of EBT Finder | Our Mission"
        description="Learn about Huruy Kidanemariam, UX designer and founder of EBT Finder. Discover our mission to make SNAP/EBT food access more equitable through inclusive design."
        keywords="Huruy Kidanemariam, UX designer, EBT Finder founder, equitable design, SNAP benefits, food access, inclusive digital experiences"
        canonicalUrl="https://ebtfinder.org/mission"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Our Mission</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              Making it easier for individuals and families who rely on SNAP/EBT benefits to discover places where they can shop with dignity, convenience, and confidence.
            </p>
            <p className="text-sm text-muted-foreground font-medium bg-accent/30 px-4 py-2 rounded-full inline-block">
              Powered by verified data from the USDA SNAP Program
            </p>
          </div>

          {/* Mission Statement Block - Moved Above Features */}
          <div className="mb-12">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-info/5">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <Heart className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-foreground leading-relaxed mb-4 text-lg">
                      We're building this tool not just for convenience, but to restore a sense of agency and empowerment 
                      for low-income individuals navigating complex food systems.
                    </p>
                    <p className="text-foreground font-semibold text-xl gradient-text">
                      This isn't just an app — it's a bridge between access and equity.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-12">
            <CardContent className="p-8">
              <div className="prose prose-gray max-w-none">
                <p className="text-foreground leading-relaxed mb-8 text-lg">
                  We believe that access to food shouldn't be frustrating or confusing — especially for those who need it most. 
                  By combining real-time data from the USDA SNAP program with user-friendly technology, our platform helps people:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
                  <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent/20 transition-colors duration-200 border-b md:border-b-0 md:border-r border-border/30 pb-6 md:pb-4 md:pr-6">
                    <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0 hover:scale-110 transition-transform duration-200" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 text-lg">Find EBT-accepting stores nearby</h3>
                      <p className="text-muted-foreground leading-relaxed">Locate stores in your area that accept SNAP/EBT benefits with ease.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent/20 transition-colors duration-200 border-b md:border-b-0 border-border/30 pb-6 md:pb-4">
                    <Utensils className="h-6 w-6 text-primary mt-1 flex-shrink-0 hover:scale-110 transition-transform duration-200" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 text-lg">Identify RMP locations</h3>
                      <p className="text-muted-foreground leading-relaxed">Find places that participate in the Restaurant Meals Program for hot meals.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent/20 transition-colors duration-200 border-b md:border-b-0 md:border-r border-border/30 pb-6 md:pb-4 md:pr-6">
                    <Star className="h-6 w-6 text-primary mt-1 flex-shrink-0 hover:scale-110 transition-transform duration-200" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 text-lg">Read honest reviews</h3>
                      <p className="text-muted-foreground leading-relaxed">Share and discover authentic experiences from the community.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent/20 transition-colors duration-200">
                    <Clock className="h-6 w-6 text-primary mt-1 flex-shrink-0 hover:scale-110 transition-transform duration-200" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 text-lg">Store info before visiting</h3>
                      <p className="text-muted-foreground leading-relaxed">View store hours, contact information, and photos ahead of time.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About the Founder Section */}
          <Card className="mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">Note from the Founder</h2>
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-foreground leading-relaxed mb-4 text-lg">Hi, I'm Huruy Kidanemariam, a UX designer with a passion for creating equitable and inclusive digital experiences. I built EBT Finder to make it easier for people to access essential services, because I believe good design should serve everyone - not just those with privilege or access.</p>
                <p className="text-muted-foreground">
                  You can connect with me on{" "}
                  <a href="https://www.linkedin.com/in/huruydesigns/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline transition-colors duration-200">
                    LinkedIn
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SNAP Resources Section */}
          <Card className="mb-12 bg-gradient-to-r from-success/5 to-primary/5 border-success/20">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Utensils className="h-8 w-8 text-success" />
                  <h2 className="text-2xl font-semibold text-foreground">SNAP Resources & Tips</h2>
                </div>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
                  Maximize your SNAP/EBT benefits with our comprehensive guide to programs, eligible items, and money-saving strategies.
                </p>
                <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-success/20">
                  <div className="flex items-start gap-4 text-left">
                    <div className="bg-success/10 p-3 rounded-lg">
                      <Star className="h-6 w-6 text-success" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2 text-lg">Complete 2025 SNAP Tips & Tricks Guide</h3>
                      <p className="text-muted-foreground mb-4">
                        Learn about Double Up Food Bucks programs, surprising eligible items, Restaurant Meals Program, and the latest policy updates that could save you money.
                      </p>
                      <Button 
                        asChild 
                        className="bg-success hover:bg-success/90 text-white hover:scale-105 transition-all duration-200"
                      >
                        <a href="/snap-tips" className="flex items-center gap-2">
                          View Complete Guide
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Helpful Programs Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Heart className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Helpful Programs</h2>
              </div>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Beyond EBT, there are many other programs available to support low-income families. 
                Explore these resources to find additional assistance.
              </p>
            </div>

            <Accordion type="multiple" className="max-w-4xl mx-auto space-y-4">
              {helpfulPrograms.map((category, categoryIndex) => {
                const CategoryIcon = category.categoryIcon;
                return (
                  <AccordionItem 
                    key={categoryIndex} 
                    value={`category-${categoryIndex}`}
                    className="border border-border/50 rounded-lg bg-card hover:bg-accent/5 transition-colors duration-200"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors duration-200">
                          <CategoryIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                            {category.categoryTitle}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {category.programs.length} program{category.programs.length !== 1 ? 's' : ''} available
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {category.programs.map((program, programIndex) => (
                          <Card key={programIndex} className="group hover:shadow-md transition-all duration-200 hover:border-primary/20 bg-background">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <h4 className="font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors duration-200">
                                  {program.name}
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {program.description}
                                </p>
                                <div className="pt-2">
                                  <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                                  >
                                    <a
                                      href={program.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label={`Learn more about ${program.name} (opens in new tab)`}
                                      className="flex items-center justify-center gap-2"
                                    >
                                      Learn More
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            {/* Bottom Note */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                This information is provided as a resource. Program availability and eligibility requirements may vary by location. 
                Please visit the official websites for the most current information and application details.
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Users className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Join Our Community</h2>
            </div>
            <p className="text-muted-foreground mb-6 text-lg">
              Together, we can make food access more equitable for everyone.
            </p>
            <Button onClick={handleJoinCommunity} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              Join Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>;
}