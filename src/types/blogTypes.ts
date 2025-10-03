export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  excerpt: string | null;
  body: string;
  category_id: string | null;
  featured_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPostWithCategory extends BlogPost {
  blog_categories: BlogCategory | null;
}
