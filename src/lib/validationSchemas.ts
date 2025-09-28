import { z } from 'zod';

/**
 * Security validation schemas to prevent injection attacks and ensure data integrity
 */

// Review validation schema
export const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5, "Rating must be between 1-5"),
  review_text: z
    .string()
    .max(1000, "Review must be less than 1000 characters")
    .optional()
    .transform((val) => val?.trim() || null), // Sanitize whitespace
});

// Authentication validation schemas  
export const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be less than 128 characters"),
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, apostrophes, and hyphens"),
});

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must be less than 128 characters"),
});

// Comment validation schema (for future use)
export const commentSchema = z.object({
  comment_text: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(500, "Comment must be less than 500 characters"),
});

// Generic text validation helper
export const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/[<>'"&]/g, '') // Remove basic XSS characters
    .substring(0, 1000); // Enforce max length
};

// Validation helper types
export type ReviewInput = z.infer<typeof reviewSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type CommentInput = z.infer<typeof commentSchema>;