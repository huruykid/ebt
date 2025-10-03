import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";

export default function Recipes() {
  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "SNAP-Friendly Recipes",
    "description": "Affordable, healthy recipes perfect for SNAP/EBT recipients",
    "numberOfItems": recipes?.length || 0,
    "itemListElement": recipes?.map((recipe, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Recipe",
        "name": recipe.name,
        "description": recipe.description,
        "image": recipe.featured_image,
        "recipeYield": recipe.servings,
        "recipeCategory": recipe.category,
        "totalTime": `PT${(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)}M`,
        "recipeIngredient": recipe.ingredients,
        "recipeInstructions": recipe.instructions
      }
    }))
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <SEOHead
        title="Budget-Friendly SNAP Recipes | Under $5 Per Meal"
        description="Discover delicious, healthy recipes designed for SNAP/EBT budgets. All recipes under $5 per serving with nutritional information and shopping lists."
        keywords="SNAP recipes, EBT meals, budget recipes, cheap healthy meals, food stamp recipes"
        canonicalUrl="https://ebtfinder.org/recipes"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        <BreadcrumbNavigation
          items={[
            { label: 'Home', href: '/' },
            { label: 'Recipes', href: '/recipes' }
          ]}
        />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-success/10 via-accent/5 to-primary/5 py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              SNAP-Friendly Recipes
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Delicious, healthy meals under $5 per serving — all designed for SNAP/EBT budgets
            </p>
          </div>
        </section>

        {/* Recipes Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-48 bg-muted animate-pulse" />
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded mb-3 animate-pulse" />
                      <div className="h-6 bg-muted rounded mb-2 animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recipes && recipes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <Link key={recipe.id} to={`/recipes/${recipe.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-1">
                      {recipe.featured_image && (
                        <div className="relative">
                          <img
                            src={recipe.featured_image}
                            alt={recipe.name}
                            className="w-full h-48 object-cover"
                          />
                          {recipe.snap_eligible && (
                            <Badge className="absolute top-3 right-3 bg-success">
                              SNAP Eligible
                            </Badge>
                          )}
                        </div>
                      )}
                      <CardContent className="p-6">
                        {recipe.category && (
                          <Badge variant="outline" className="mb-3">
                            {recipe.category}
                          </Badge>
                        )}
                        <h3 className="text-xl font-bold text-foreground mb-2 hover:text-primary transition-colors line-clamp-2">
                          {recipe.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {recipe.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {recipe.cost_per_serving && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>${recipe.cost_per_serving}/serving</span>
                            </div>
                          )}
                          {recipe.servings && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{recipe.servings} servings</span>
                            </div>
                          )}
                          {(recipe.prep_time_minutes || recipe.cook_time_minutes) && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Recipes Coming Soon!
                </h3>
                <p className="text-muted-foreground">
                  We're working on delicious, budget-friendly recipes. Check back soon!
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
