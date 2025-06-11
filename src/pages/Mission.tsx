import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, MapPin, Star, Clock, Utensils, ArrowRight } from "lucide-react";

export default function Mission() {
  const handleJoinCommunity = () => {
    // TODO: Implement community join functionality
    console.log("Join community clicked");
  };

  return (
    <ProtectedRoute requireAuth={false}>
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

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Users className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Join Our Community</h2>
            </div>
            <p className="text-muted-foreground mb-6 text-lg">
              Together, we can make food access more equitable for everyone.
            </p>
            <Button 
              onClick={handleJoinCommunity}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Join Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
