import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, BookOpen, Utensils, Store, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { NewsletterSignup } from "@/components/blog/NewsletterSignup";

export default function BlogHome() {
  const { data: featuredPosts } = useQuery({
    queryKey: ['featured-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories (
            name,
            slug
          )
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  return (
    <ProtectedRoute requireAuth={false}>
      <SEOHead
        title="SNAP Savvy | EBT Tips, Recipes & Resources for SNAP Recipients"
        description="Your complete resource for maximizing SNAP benefits. Find EBT stores, budget recipes, matching programs, and guides for both recipients and store owners."
        keywords="SNAP benefits, EBT finder, food assistance, budget recipes, SNAP tips, store locator"
        canonicalUrl="https://ebtfinder.org"
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#2E7D32] via-[#388E3C] to-[#1B5E20] text-white py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMC0yaDJ2MmgtMnptLTJ2LTJoMnYyaC0yem0wIDBoLTJ2LTJoMnYyem0wIDJ2Mmg ydi0yaC0yem0yIDB2LTJoMnYyaC0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
          
          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-6 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                <img src="/ebt-logo.png" alt="EBT Logo" className="h-8 w-auto" />
                <h1 className="text-3xl md:text-4xl font-bold">SNAP Savvy</h1>
              </div>
              <p className="text-xl md:text-2xl font-medium mb-4 text-white/90">
                Your Trusted Resource for SNAP/EBT Success
              </p>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Maximize your benefits, find stores, discover recipes, and access resources to make the most of your SNAP assistance
              </p>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Link to="/search">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <Store className="h-8 w-8 mx-auto mb-3 text-[#FFD54F]" />
                    <h3 className="font-semibold text-white mb-1">Store Finder</h3>
                    <p className="text-sm text-white/70">Find EBT stores near you</p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/blog">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <BookOpen className="h-8 w-8 mx-auto mb-3 text-[#FFD54F]" />
                    <h3 className="font-semibold text-white mb-1">Blog & Tips</h3>
                    <p className="text-sm text-white/70">Learn to maximize benefits</p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/recipes">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <Utensils className="h-8 w-8 mx-auto mb-3 text-[#FFD54F]" />
                    <h3 className="font-semibold text-white mb-1">Recipes</h3>
                    <p className="text-sm text-white/70">Budget-friendly meals</p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/business-resources">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-3 text-[#FFD54F]" />
                    <h3 className="font-semibold text-white mb-1">For Businesses</h3>
                    <p className="text-sm text-white/70">Accept EBT guide</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-foreground">Featured Articles</h2>
              <Link to="/blog">
                <Button variant="outline">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredPosts?.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-1">
                    {post.featured_image && (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <CardContent className="p-6">
                      <Badge className="mb-3">{post.blog_categories?.name}</Badge>
                      <h3 className="text-xl font-bold text-foreground mb-2 hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(post.published_at!).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-accent/20 py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Browse by Topic</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories?.map((category) => (
                <Link key={category.id} to={`/blog?category=${category.slug}`}>
                  <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
                    <CardContent className="p-4 text-center">
                      <h3 className="font-semibold text-foreground text-sm">{category.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Get Weekly SNAP Tips
              </h2>
              <p className="text-muted-foreground">
                Join thousands of SNAP recipients getting practical tips delivered to their inbox
              </p>
            </div>
            <NewsletterSignup />
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-primary/5 py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">42M+</div>
                <div className="text-muted-foreground">SNAP Recipients Nationwide</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">$120B</div>
                <div className="text-muted-foreground">Annual SNAP Benefits</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">260K+</div>
                <div className="text-muted-foreground">EBT-Accepting Stores</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
