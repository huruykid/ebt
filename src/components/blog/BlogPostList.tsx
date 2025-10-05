import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { BlogPostWithCategory } from '@/types/blogTypes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface BlogPostListProps {
  posts: BlogPostWithCategory[];
  onEdit: (post: BlogPostWithCategory) => void;
}

export function BlogPostList({ posts, onEdit }: BlogPostListProps) {
  const queryClient = useQueryClient();

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('blog_posts' as any)
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Blog post deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No articles yet. Create your first one!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {post.featured_image && (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              
              <div className="flex items-center gap-2 mb-2">
                {post.blog_categories && (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                    {post.blog_categories.name}
                  </span>
                )}
                {!post.is_published && (
                  <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                    Draft
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold mb-1">{post.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                By {post.author} • {format(new Date(post.created_at), 'MMM dd, yyyy')}
              </p>
              
              {post.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(post)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Article</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{post.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deletePostMutation.mutate(post.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
