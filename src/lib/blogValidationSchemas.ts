import { z } from 'zod';

export const blogPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200, "Slug must be less than 200 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  
  author: z
    .string()
    .trim()
    .min(1, "Author is required")
    .max(100, "Author must be less than 100 characters"),
  
  excerpt: z
    .string()
    .trim()
    .max(300, "Excerpt must be less than 300 characters")
    .optional(),
  
  body: z
    .string()
    .trim()
    .min(1, "Content is required"),
  
  category_id: z
    .string()
    .uuid("Invalid category"),
  
  featured_image: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal('')),
  
  meta_title: z
    .string()
    .trim()
    .max(60, "Meta title must be less than 60 characters")
    .optional(),
  
  meta_description: z
    .string()
    .trim()
    .max(160, "Meta description must be less than 160 characters")
    .optional(),
  
  is_published: z.boolean().default(false),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;
