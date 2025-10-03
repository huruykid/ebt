import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Facebook, Twitter, Share2 } from "lucide-react";
import { useEffect } from "react";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
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
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: relatedPosts } = useQuery({
    queryKey: ['related-posts', post?.category_id],
    queryFn: async () => {
      if (!post) return [];
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories (
            name,
            slug
          )
        `)
        .eq('category_id', post.category_id)
        .eq('is_published', true)
        .neq('id', post.id)
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!post,
  });

  useEffect(() => {
    if (post) {
      // Increment view count
      supabase
        .from('blog_posts')
        .update({ view_count: (post.view_count || 0) + 1 })
        .eq('id', post.id)
        .then();
    }
  }, [post]);

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post?.title || '');
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    };

    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-4xl py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4 w-3/4" />
            <div className="h-64 bg-muted rounded mb-6" />
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <Link to="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "SNAP Savvy",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ebtfinder.org/ebt-logo.png"
      }
    },
    "datePublished": post.published_at,
    "dateModified": post.updated_at,
    "image": post.featured_image,
    "articleSection": post.blog_categories?.name
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <SEOHead
        title={post.meta_title || `${post.title} | SNAP Savvy Blog`}
        description={post.meta_description || post.excerpt || ''}
        keywords={post.blog_categories?.name || 'SNAP, EBT, food assistance'}
        canonicalUrl={`https://ebtfinder.org/blog/${post.slug}`}
        structuredData={structuredData}
        ogImage={post.featured_image}
      />

      <div className="min-h-screen bg-background">
        <BreadcrumbNavigation
          items={[
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: post.title, href: `/blog/${post.slug}` }
          ]}
        />

        {/* Article Hero */}
        <article className="pb-12">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Header */}
            <header className="mb-8">
              <Badge className="mb-4">{post.blog_categories?.name}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.published_at!).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>

              {/* Social Share */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShare('facebook')}
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShare('twitter')}
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Tweet
                </Button>
              </div>
            </header>

            {/* Featured Image */}
            {post.featured_image && (
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
              />
            )}

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />

            {/* Related Articles */}
            {relatedPosts && relatedPosts.length > 0 && (
              <section className="mt-12 pt-8 border-t">
                <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-1">
                        {relatedPost.featured_image && (
                          <img
                            src={relatedPost.featured_image}
                            alt={relatedPost.title}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <CardContent className="p-4">
                          <Badge className="mb-2 text-xs">{relatedPost.blog_categories?.name}</Badge>
                          <h3 className="font-bold text-foreground mb-2 line-clamp-2 text-sm">
                            {relatedPost.title}
                          </h3>
                          <p className="text-muted-foreground text-xs line-clamp-2">
                            {relatedPost.excerpt}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
      </div>
    </ProtectedRoute>
  );
}
