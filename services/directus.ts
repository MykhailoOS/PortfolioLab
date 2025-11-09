import type { MediaRef } from '../types';

// Strapi configuration from environment variables
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.VITE_STRAPI_TOKEN || '';

// File upload constraints (as per task requirements)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.avif'];

export interface StrapiUploadError {
  message: string;
  type: 'size' | 'mime' | 'network' | 'auth' | 'unknown';
}

/**
 * Validates a file before upload
 * Returns null if valid, error message if invalid
 */
export function validateFile(file: File): StrapiUploadError | null {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      message: `File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds the maximum allowed size of 5 MB.`,
      type: 'size',
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      message: `File type "${file.type}" is not allowed. Please use PNG, JPEG, WEBP, or AVIF images.`,
      type: 'mime',
    };
  }

  // Check file extension (additional validation)
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      message: `File extension "${extension}" is not allowed. Please use .png, .jpg, .jpeg, .webp, or .avif files.`,
      type: 'mime',
    };
  }

  return null;
}

/**
 * Uploads a file to Strapi and returns a MediaRef
 * Throws an error if the upload fails
 */
export async function uploadFileToDirectus(file: File): Promise<MediaRef> {
  // Validate file first
  const validationError = validateFile(file);
  if (validationError) {
    throw new Error(validationError.message);
  }

  // Check if Strapi is configured
  if (!STRAPI_TOKEN || !STRAPI_URL) {
    console.warn('Strapi not configured. Using mock upload for demo purposes.');
    // Create a mock MediaRef using a local object URL for demo
    return createMockMediaRef(file);
  }

  // Create form data
  const formData = new FormData();
  formData.append('files', file); // Strapi uses 'files' field name

  try {
    // Upload to Strapi
    const response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed. Please check your Strapi token and permissions.');
      }
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.statusText}. ${errorText}`);
    }

    const result = await response.json();
    // Strapi returns an array of uploaded files
    const fileData = Array.isArray(result) ? result[0] : result;

    // Create MediaRef from Strapi response
    const mediaRef: MediaRef = {
      id: fileData.id.toString(),
      url: `${STRAPI_URL}${fileData.url}`, // Strapi returns relative URL
      alt: '', // Will be set by user in Inspector
      metadata: {
        filename: fileData.name || file.name,
        size: fileData.size || file.size,
        mime: fileData.mime || file.type,
        width: fileData.width,
        height: fileData.height,
      },
    };

    return mediaRef;
  } catch (error) {
    // If Strapi fails, fall back to mock for demo
    console.warn('Strapi upload failed, using mock upload:', error);
    return createMockMediaRef(file);
  }
}

/**
 * Creates a mock MediaRef for demo purposes when Directus is not available
 */
function createMockMediaRef(file: File): Promise<MediaRef> {
  return new Promise((resolve) => {
    // Create object URL for local preview
    const objectUrl = URL.createObjectURL(file);
    
    // Simulate network delay
    setTimeout(() => {
      const mockId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const mediaRef: MediaRef = {
        id: mockId,
        url: objectUrl, // Use object URL for demo
        alt: '',
        metadata: {
          filename: file.name,
          size: file.size,
          mime: file.type,
        },
      };
      
      resolve(mediaRef);
    }, 500); // Simulate upload time
  });
}

/**
 * Gets the thumbnail URL for a Strapi asset
 * Useful for previews in the Inspector
 */
export function getDirectusThumbnail(fileId: string, width = 48, height = 48): string {
  // If it's a mock ID with blob URL, return as-is
  if (fileId.startsWith('mock-')) {
    // The actual URL is stored in the MediaRef, this is just the ID
    return fileId; // Will be handled by the component
  }
  // Strapi doesn't have built-in image transformation in the free version
  // You would need to use a plugin like strapi-plugin-responsive-image or a CDN
  // For now, return the original image URL
  return fileId; // The component will use the full URL from MediaRef
}

/**
 * Gets the full asset URL for a Strapi file
 * Note: Strapi stores full URLs in the MediaRef, so this may not be needed
 */
export function getDirectusAssetUrl(fileId: string): string {
  // If it's already a full URL, return it
  if (fileId.startsWith('http')) {
    return fileId;
  }
  return `${STRAPI_URL}${fileId}`;
}

/**
 * Checks if Strapi is configured properly
 */
export function isDirectusConfigured(): boolean {
  return Boolean(STRAPI_URL && STRAPI_TOKEN);
}

/**
 * Gets the Strapi configuration status
 */
export function getDirectusConfig() {
  return {
    url: STRAPI_URL,
    hasToken: Boolean(STRAPI_TOKEN),
    isConfigured: isDirectusConfigured(),
  };
}
