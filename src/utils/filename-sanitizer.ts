/**
 * Sanitizes a filename by removing invalid characters and ensuring compatibility
 * across different operating systems.
 */
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[\u2500-\u257F]/g, '')           // Strip box drawing chars (├, └, │, ─, etc.)
    .replace(/[<>:"|?*\\\/\x00-\x1F]/g, '_')   // Replace invalid filename chars
    .replace(/\s+/g, ' ')                      // Normalize spaces
    .replace(/^[.]+/g, '')                     // Remove leading dots
    .trim() || 'unnamed';
}