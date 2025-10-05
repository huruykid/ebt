import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { blogPostSchema, type BlogPostInput } from '@/lib/blogValidationSchemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { BlogCategory, BlogPostWithCategory } from '@/types/blogTypes';
import { BlogImageUpload } from './BlogImageUpload';
import { useEffect } from 'react';

interface BlogPostFormProps {
  editingPost?: BlogPostWithCategory;
  onSuccess?: () => void;
}

export function BlogPostForm({ editingPost, onSuccess }: BlogPostFormProps) {
  const queryClient = useQueryClient();
  
  const { data: categories = [] } = useQuery<BlogCategory[]>({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories' as any)
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as unknown as BlogCategory[];
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlogPostInput>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: editingPost ? {
      title: editingPost.title,
      slug: editingPost.slug,
      author: editingPost.author,
      category_id: editingPost.category_id || '',
      excerpt: editingPost.excerpt || '',
      body: editingPost.body,
      featured_image: editingPost.featured_image || '',
      meta_title: editingPost.meta_title || '',
      meta_description: editingPost.meta_description || '',
      is_published: editingPost.is_published,
    } : {
      is_published: false,
    },
  });

  useEffect(() => {
    if (editingPost) {
      setValue('title', editingPost.title);
      setValue('slug', editingPost.slug);
      setValue('author', editingPost.author);
      setValue('category_id', editingPost.category_id || '');
      setValue('excerpt', editingPost.excerpt || '');
      setValue('body', editingPost.body);
      setValue('featured_image', editingPost.featured_image || '');
      setValue('meta_title', editingPost.meta_title || '');
      setValue('meta_description', editingPost.meta_description || '');
      setValue('is_published', editingPost.is_published);
    }
  }, [editingPost, setValue]);

  const savePostMutation = useMutation({
    mutationFn: async (data: BlogPostInput) => {
      const postData = {
        ...data,
        published_at: data.is_published ? new Date().toISOString() : null,
      };
      
      if (editingPost) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts' as any)
          .update(postData)
          .eq('id', editingPost.id);
        
        if (error) throw error;
      } else {
        // Create new post
        const { error } = await supabase
          .from('blog_posts' as any)
          .insert([postData]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: editingPost ? "Blog post updated successfully!" : "Blog post created successfully!",
      });
      if (!editingPost) {
        reset();
      }
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BlogPostInput) => {
    savePostMutation.mutate(data);
  };

  const isPublished = watch('is_published');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card border border-border rounded-lg p-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Enter article title"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">URL Slug *</Label>
        <Input
          id="slug"
          {...register('slug')}
          placeholder="article-url-slug"
        />
        {errors.slug && (
          <p className="text-sm text-destructive">{errors.slug.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="author">Author *</Label>
        <Input
          id="author"
          {...register('author')}
          placeholder="Author name"
        />
        {errors.author && (
          <p className="text-sm text-destructive">{errors.author.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category_id">Category *</Label>
        <Select onValueChange={(value) => setValue('category_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category_id && (
          <p className="text-sm text-destructive">{errors.category_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          {...register('excerpt')}
          placeholder="Brief summary (optional)"
          rows={3}
        />
        {errors.excerpt && (
          <p className="text-sm text-destructive">{errors.excerpt.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Content *</Label>
        <Textarea
          id="body"
          {...register('body')}
          placeholder="Write your article content here..."
          rows={10}
        />
        {errors.body && (
          <p className="text-sm text-destructive">{errors.body.message}</p>
        )}
      </div>

      <BlogImageUpload
        label="Featured Image"
        currentImageUrl={watch('featured_image')}
        onImageUploaded={(url) => setValue('featured_image', url)}
      />

      <div className="space-y-2">
        <Label htmlFor="meta_title">Meta Title (SEO)</Label>
        <Input
          id="meta_title"
          {...register('meta_title')}
          placeholder="SEO title (max 60 chars)"
        />
        {errors.meta_title && (
          <p className="text-sm text-destructive">{errors.meta_title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="meta_description">Meta Description (SEO)</Label>
        <Textarea
          id="meta_description"
          {...register('meta_description')}
          placeholder="SEO description (max 160 chars)"
          rows={3}
        />
        {errors.meta_description && (
          <p className="text-sm text-destructive">{errors.meta_description.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_published"
          checked={isPublished}
          onCheckedChange={(checked) => setValue('is_published', checked)}
        />
        <Label htmlFor="is_published">Publish immediately</Label>
      </div>

      <Button 
        type="submit" 
        disabled={savePostMutation.isPending}
        className="w-full"
      >
        {savePostMutation.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {editingPost ? 'Update Article' : 'Create Article'}
      </Button>
    </form>
  );
}
