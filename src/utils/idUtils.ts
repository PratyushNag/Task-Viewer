/**
 * Utility functions for generating unique IDs
 */

/**
 * Generate a unique ID
 * Uses a combination of timestamp and random string
 */
export const generateId = (): string => {
  const timestamp = new Date().getTime().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
};
