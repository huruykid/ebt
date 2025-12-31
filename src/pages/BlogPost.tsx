import { SEOHead } from '@/components/SEOHead';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import type { BlogPostWithCategory } from '@/types/blogTypes';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useState, useMemo } from 'react';
import { ArticleSchema } from '@/components/blog/ArticleSchema';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { SocialShare } from '@/components/blog/SocialShare';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';
import DOMPurify from 'dompurify';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [imageOpen, setImageOpen] = useState(false);

  const { data: post, isLoading } = useQuery<BlogPostWithCategory>({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select(`
          *,
          blog_categories (
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Post not found');
      return data as unknown as BlogPostWithCategory;
    },
  });

  // Sanitize blog content - must be called before any early returns to follow React hooks rules
  const sanitizedHtml = useMemo(() => {
    if (!post?.body) return '';
    return DOMPurify.sanitize(post.body.replace(/\n/g, '<br />'), {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'img', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'id']
    });
  }, [post?.body]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <Button onClick={() => navigate('/blog')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={post.meta_title || `${post.title} | EBT Finder Blog`}
        description={post.meta_description || post.excerpt || ''}
        keywords={post.blog_categories?.name || 'SNAP, EBT, food assistance'}
      />
      <ArticleSchema post={post} />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <BreadcrumbNavigation
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: post.title }
            ]}
          />
        </div>
        
        <div className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 max-w-3xl">
              <Button 
                onClick={() => navigate('/blog')} 
                variant="ghost" 
                className="mb-8"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>

              <article>
                {post.featured_image && (
                  <Dialog open={imageOpen} onOpenChange={setImageOpen}>
                    <DialogTrigger asChild>
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-64 md:h-96 object-cover rounded-lg mb-8 cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-7xl w-full max-h-[90vh] p-2">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-contain"
                      />
                    </DialogContent>
                  </Dialog>
                )}

                {post.blog_categories && (
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm mb-6">
                    {post.blog_categories.name}
                  </span>
                )}

                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight">{post.title}</h1>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(post.created_at), 'MMMM dd, yyyy')}</span>
                  </div>
                </div>

                <SocialShare 
                  title={post.title} 
                  url={`/blog/${post.slug}`} 
                />

                {post.excerpt && (
                  <p className="text-xl text-muted-foreground my-8 leading-relaxed font-medium">
                    {post.excerpt}
                  </p>
                )}

                {/* Blog content - sanitized above to prevent XSS attacks */}
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:text-foreground prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
                    prose-h2:text-3xl prose-h3:text-2xl
                    prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-6
                    prose-a:text-primary hover:prose-a:text-primary/80
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-ul:text-foreground prose-ul:my-6
                    prose-ol:text-foreground prose-ol:my-6
                    prose-li:text-foreground prose-li:mb-2
                    prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
                    prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                    prose-pre:bg-muted prose-pre:text-foreground"
                  dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />

                <SocialShare 
                  title={post.title} 
                  url={`/blog/${post.slug}`} 
                />

                <RelatedPosts 
                  currentPostId={post.id} 
                  categoryId={post.category_id} 
                />
              </article>
            </div>

            <div className="lg:col-span-4">
              <TableOfContents content={post.body} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}