/**
 * Utility functions for handling image paths and URLs
 */

/**
 * Get the correct image path for display
 * @param imagePath - The image path from database or props
 * @returns Properly formatted image path
 */
export function getImagePath(imagePath: string | undefined): string {
  if (!imagePath) return "/placeholder.svg"
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('//')) {
    return imagePath
  }
  
  // If it starts with /agents/, it's our database path - use directly
  if (imagePath.startsWith('/agents/')) {
    return imagePath
  }
  
  // If it starts with /, use as is (public directory)
  if (imagePath.startsWith('/')) {
    return imagePath
  }
  
  // Otherwise, assume it's a relative path and add /
  return `/${imagePath}`
}

/**
 * Check if an image exists at the given path
 * @param imagePath - Path to check
 * @returns Promise that resolves to boolean
 */
export async function imageExists(imagePath: string): Promise<boolean> {
  try {
    const response = await fetch(imagePath, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Get fallback image based on content type
 * @param type - Type of content (agent, post, etc.)
 * @returns Fallback image path
 */
export function getFallbackImage(type: 'agent' | 'post' | 'general' = 'general'): string {
  switch (type) {
    case 'agent':
      return "/placeholder-user.jpg"
    case 'post':
      return "/placeholder.jpg"
    default:
      return "/placeholder.svg"
  }
}

/**
 * Generate initials from a name
 * @param name - Full name
 * @returns Initials (max 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return '?'
  
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Detect if text contains Persian/Arabic characters
 * @param text - Text to analyze
 * @returns Boolean indicating if text contains Persian characters
 */
export function containsPersianText(text: string): boolean {
  const persianRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
  return persianRegex.test(text)
}