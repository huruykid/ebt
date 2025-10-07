import { SEOHead } from '@/components/SEOHead';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import type { BlogPostWithCategory } from '@/types/blogTypes';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

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
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button 
            onClick={() => navigate('/blog')} 
            variant="ghost" 
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>

          <article className="prose prose-lg max-w-none">
            {post.featured_image && (
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
              />
            )}

            {post.blog_categories && (
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm mb-4">
                {post.blog_categories.name}
              </span>
            )}

            <h1 className="text-4xl font-bold mb-4 text-foreground">{post.title}</h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 not-prose">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(post.created_at), 'MMMM dd, yyyy')}</span>
              </div>
            </div>

            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-6 italic">
                {post.excerpt}
              </p>
            )}

            <div 
              className="text-foreground"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          </article>
        </div>
      </div>
    </>
  );
}