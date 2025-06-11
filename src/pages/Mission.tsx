
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, MapPin, Star, Clock, Utensils } from "lucide-react";

export default function Mission() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Our Mission</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Making it easier for individuals and families who rely on SNAP/EBT benefits to discover places where they can shop with dignity, convenience, and confidence.
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="prose prose-gray max-w-none">
                <p className="text-foreground leading-relaxed mb-6">
                  We believe that access to food shouldn't be frustrating or confusing — especially for those who need it most. 
                  By combining real-time data from the USDA SNAP program with user-friendly technology, our platform helps people:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Find EBT-accepting stores nearby</h3>
                      <p className="text-muted-foreground text-sm">Locate stores in your area that accept SNAP/EBT benefits with ease.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Utensils className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Identify RMP locations</h3>
                      <p className="text-muted-foreground text-sm">Find places that participate in the Restaurant Meals Program for hot meals.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Star className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Read honest reviews</h3>
                      <p className="text-muted-foreground text-sm">Share and discover authentic experiences from the community.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Store info before visiting</h3>
                      <p className="text-muted-foreground text-sm">View store hours, contact information, and photos ahead of time.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/50 p-6 rounded-lg my-8">
                  <div className="flex items-start gap-3">
                    <Heart className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-foreground leading-relaxed mb-4">
                        We're building this tool not just for convenience, but to restore a sense of agency and empowerment 
                        for low-income individuals navigating complex food systems.
                      </p>
                      <p className="text-foreground font-semibold text-lg">
                        This isn't just an app — it's a bridge between access and equity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="h-8 w-8 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Join Our Community</h2>
            </div>
            <p className="text-muted-foreground">
              Together, we can make food access more equitable for everyone.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
