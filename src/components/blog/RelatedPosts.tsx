import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { BlogPostWithCategory } from '@/types/blogTypes';

interface RelatedPostsProps {
  currentPostId: string;
  categoryId?: string | null;
}

export function RelatedPosts({ currentPostId, categoryId }: RelatedPostsProps) {
  const { data: posts, isLoading } = useQuery<BlogPostWithCategory[]>({
    queryKey: ['related-posts', currentPostId, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts' as any)
        .select(`
          *,
          blog_categories (
            name,
            slug
          )
        `)
        .eq('is_published', true)
        .neq('id', currentPostId)
        .order('created_at', { ascending: false })
        .limit(3);

      // Prefer posts from the same category
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as unknown as BlogPostWithCategory[];
    },
  });

  if (isLoading || !posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-border pt-12">
      <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id} to={`/blog/${post.slug}`}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              {post.featured_image && (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <CardHeader>
                {post.blog_categories && (
                  <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs mb-2 w-fit">
                    {post.blog_categories.name}
                  </span>
                )}
                <CardTitle className="text-lg line-clamp-2 hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(post.created_at), 'MMM dd, yyyy')}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
