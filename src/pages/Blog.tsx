import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { NewsletterSignup } from "@/components/blog/NewsletterSignup";
import { useState } from "react";

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories (
            name,
            slug
          )
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (selectedCategory) {
        const { data: category } = await supabase
          .from('blog_categories')
          .select('id')
          .eq('slug', selectedCategory)
          .single();
        
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      const { data, error } = await query;
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

  const featuredPost = posts?.[0];
  const recentPosts = posts?.slice(1) || [];

  return (
    <ProtectedRoute requireAuth={false}>
      <SEOHead
        title="SNAP Savvy Blog | EBT Hacks, Recipes & Resources"
        description="Discover practical tips to maximize your SNAP benefits, find EBT-accepting stores, try budget-friendly recipes, and access resources for SNAP recipients and store owners."
        keywords="SNAP blog, EBT tips, SNAP hacks, budget recipes, food assistance, store owner guide, SNAP benefits"
        canonicalUrl="https://ebtfinder.org/blog"
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-info/5 py-12 md:py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                SNAP Savvy Blog
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Your trusted resource for maximizing SNAP benefits, discovering EBT-friendly stores, and accessing food assistance programs
              </p>
            </div>

            {/* Featured Article */}
            {featuredPost && (
              <Link to={`/blog/${featuredPost.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <div className="md:flex">
                    {featuredPost.featured_image && (
                      <div className="md:w-1/2">
                        <img
                          src={featuredPost.featured_image}
                          alt={featuredPost.title}
                          className="w-full h-64 md:h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="md:w-1/2 p-6 md:p-8">
                      <Badge className="mb-3">{featuredPost.blog_categories?.name}</Badge>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{featuredPost.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(featuredPost.published_at!).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button variant="default">
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            )}
          </div>
        </section>

        {/* Category Navigation */}
        <section className="border-b bg-card">
          <div className="container mx-auto px-4 max-w-6xl py-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                size="sm"
              >
                All Articles
              </Button>
              {categories?.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.slug ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.slug)}
                  size="sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Articles Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {selectedCategory ? `${categories?.find(c => c.slug === selectedCategory)?.name} Articles` : 'Recent Articles'}
            </h2>
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
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
            ) : recentPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentPosts.map((post) => (
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
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(post.published_at!).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No articles found in this category.</p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-primary/5 py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <NewsletterSignup />
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
