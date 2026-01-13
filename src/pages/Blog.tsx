import { SEOHead } from '@/components/SEOHead';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';
import { BlogPostForm } from '@/components/blog/BlogPostForm';
import { BlogPostList } from '@/components/blog/BlogPostList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import type { BlogPostWithCategory } from '@/types/blogTypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Blog() {
  const { isAdmin } = useUserRoles();
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostWithCategory | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: posts = [], isLoading } = useQuery<BlogPostWithCategory[]>({
    queryKey: ['blog-posts'],
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
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as BlogPostWithCategory[];
    },
  });

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    
    const query = searchQuery.toLowerCase();
    return posts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.excerpt?.toLowerCase().includes(query) ||
      post.body?.toLowerCase().includes(query) ||
      post.blog_categories?.name?.toLowerCase().includes(query) ||
      post.author?.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);
  useEffect(() => {
    if (posts.length > 0) {
      const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "SNAP Savvy Blog Articles",
        "description": "Articles about maximizing SNAP benefits, EBT tips, and food assistance resources",
        "numberOfItems": posts.length,
        "itemListElement": posts.slice(0, 10).map((post, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt || post.meta_description || '',
            "url": `https://ebtfinder.org/blog/${post.slug}`,
            "datePublished": post.published_at || post.created_at,
            "author": {
              "@type": "Organization",
              "name": post.author
            }
          }
        }))
      };

      const script = document.createElement('script');
      script.id = 'blog-itemlist-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(itemListSchema);
      document.head.appendChild(script);

      return () => {
        const existing = document.getElementById('blog-itemlist-schema');
        if (existing) existing.remove();
      };
    }
  }, [posts]);

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' }
  ];

  return (
    <>
      <SEOHead
        title="SNAP Savvy Blog - EBT Tips, Recipes & Resources | EBT Finder"
        description="Discover practical tips to maximize your SNAP benefits, find EBT-friendly recipes, and learn about programs that help stretch your food budget."
        keywords="SNAP tips, EBT recipes, food stamp resources, maximize SNAP benefits, budget recipes, SNAP blog, EBT guide"
        canonicalUrl="https://ebtfinder.org/blog"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">SNAP Savvy Blog</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Your resource for maximizing SNAP benefits, finding resources, and stretching your food budget.
          </p>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {searchQuery && (
            <p className="text-sm text-muted-foreground mb-4">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'} for "{searchQuery}"
            </p>
          )}

          {isAdmin && (
            <Tabs defaultValue="list" className="mb-8">
              <TabsList>
                <TabsTrigger value="list">Manage Articles</TabsTrigger>
                <TabsTrigger value="create">
                  <Plus className="mr-2 h-4 w-4" />
                  {editingPost ? 'Edit Article' : 'Create New'}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="mt-4">
                <BlogPostList 
                  posts={posts} 
                  onEdit={(post) => {
                    setEditingPost(post);
                    setShowForm(true);
                  }}
                />
              </TabsContent>
              
              <TabsContent value="create" className="mt-4">
                <BlogPostForm 
                  editingPost={editingPost}
                  onSuccess={() => {
                    setEditingPost(undefined);
                    setShowForm(false);
                  }}
                />
                {editingPost && (
                  <Button
                    variant="outline"
                    onClick={() => setEditingPost(undefined)}
                    className="mt-4"
                  >
                    Cancel Edit
                  </Button>
                )}
              </TabsContent>
            </Tabs>
          )}

          <div className="space-y-6">
            {isLoading ? (
              <p className="text-muted-foreground">Loading articles...</p>
            ) : filteredPosts.length === 0 && searchQuery ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">No articles found for "{searchQuery}"</p>
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              </div>
            ) : filteredPosts.length === 0 ? (
              <article className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-2xl font-semibold mb-2">Coming Soon: Blog Articles</h2>
                <p className="text-muted-foreground mb-4">
                  We're working on bringing you helpful content about maximizing your SNAP benefits, 
                  budget-friendly recipes, and resources to help you make the most of your benefits.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Tips & Tricks</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Recipes</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Resources</span>
                </div>
              </article>
            ) : (
              filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      loading="lazy"
                    />
                  )}
                  
                  <div className="flex items-center gap-2 mb-2">
                    {post.blog_categories && (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {post.blog_categories.name}
                      </span>
                    )}
                    {!post.is_published && (
                      <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                        Draft
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    By {post.author} • {format(new Date(post.created_at), 'MMM dd, yyyy')}
                  </p>
                  
                  {post.excerpt && (
                    <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                  )}
                  
                  <Link to={`/blog/${post.slug}`}>
                    <Button variant="link" className="p-0">
                      Read More →
                    </Button>
                  </Link>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}