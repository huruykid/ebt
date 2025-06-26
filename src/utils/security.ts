
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
