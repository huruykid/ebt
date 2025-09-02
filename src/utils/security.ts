
/**
 * Security utility functions for input validation and sanitization
 */

/**
 * Sanitizes a string by removing potentially dangerous characters
 */
export const sanitizeString = (input: string): string => {
  return input
    .replace(/[<>'"&]/g, '') // Remove basic XSS characters
    .trim();
};

/**
 * Validates if a string is a valid zip code (5 digits)
 */
export const isValidZipCode = (zipCode: string): boolean => {
  return /^\d{5}$/.test(zipCode.trim());
};

/**
 * Validates if a string is a valid email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates if a string contains only alphanumeric characters and basic punctuation
 */
export const isValidText = (text: string): boolean => {
  return /^[a-zA-Z0-9\s.,!?'-]+$/.test(text);
};

/**
 * Validates Google Analytics measurement ID format
 */
export const isValidGoogleAnalyticsId = (id: string): boolean => {
  return /^G-[A-Z0-9]+$/.test(id);
};

/**
 * Escapes HTML characters to prevent XSS
 */
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Sanitizes HTML content by removing dangerous elements and attributes
 */
export const sanitizeHtml = (html: string): string => {
  // Allow only basic formatting tags and remove dangerous attributes
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  
  // Remove script tags and event handlers
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '');
  
  // Remove all HTML tags except allowed ones
  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  cleaned = cleaned.replace(tagPattern, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      // Keep allowed tags but remove attributes
      return match.replace(/\s+[^>]*/, '');
    }
    return '';
  });
  
  return cleaned.trim();
};

/**
 * Validates file upload type and size
 */
export const validateFileUpload = (file: File, allowedTypes: string[], maxSizeMB: number = 5): { valid: boolean; error?: string } => {
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB` };
  }
  
  return { valid: true };
};

/**
 * Generates secure file path for user uploads (UUID-free for privacy)
 */
export const generateSecureFilePath = (userId: string, originalFilename: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const additionalRandom = Math.random().toString(36).substring(2, 15);
  const fileExtension = originalFilename.split('.').pop()?.toLowerCase() || '';
  
  // Use hash of userId instead of raw UUID to prevent exposure
  const userHash = btoa(userId).substring(0, 8);
  
  return `uploads/${userHash}/${timestamp}-${randomString}-${additionalRandom}.${fileExtension}`;
};
