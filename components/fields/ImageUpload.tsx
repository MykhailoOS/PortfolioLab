import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import type { MediaRef } from '../../types';
import { uploadFileToDirectus, validateFile, getDirectusThumbnail } from '../../services/directus';

interface ImageUploadProps {
  value?: MediaRef;
  onChange: (mediaRef: MediaRef | undefined) => void;
  label?: string;
  helpText?: string;
  accept?: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Image',
  helpText = 'Upload an image (max 5 MB, PNG/JPEG/WEBP/AVIF)',
  accept = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'],
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [altText, setAltText] = useState(value?.alt || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError.message);
      return;
    }

    // Upload file
    setIsUploading(true);
    try {
      const mediaRef = await uploadFileToDirectus(file);
      // Set default alt text to filename if not already set
      const altTextValue = altText || file.name.replace(/\.[^/.]+$/, '');
      const updatedMediaRef = { ...mediaRef, alt: altTextValue };
      setAltText(altTextValue);
      onChange(updatedMediaRef);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAltTextChange = (newAlt: string) => {
    setAltText(newAlt);
    if (value) {
      onChange({ ...value, alt: newAlt });
    }
  };

  const handleRemove = () => {
    setAltText('');
    setError(null);
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-brand-mist mb-1">
          {label}
        </label>
      )}

      {/* Upload Area */}
      {!value && (
        <div
          onClick={handleClick}
          className={`
            relative border-2 border-dashed rounded-md p-4 cursor-pointer
            transition-colors duration-200
            ${error ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-brand-accent bg-brand-night'}
            ${isUploading ? 'opacity-50 cursor-wait' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
                <p className="text-sm text-brand-mist">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-brand-mist" />
                <p className="text-sm text-brand-mist">
                  Click to upload or drag and drop
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="space-y-2">
          <div className="relative bg-brand-night border border-gray-600 rounded-md p-2 flex items-start gap-3">
            {/* Thumbnail */}
            <div className="flex-shrink-0 w-12 h-12 bg-gray-800 rounded overflow-hidden flex items-center justify-center">
              {value.url ? (
                <img
                  src={value.url}
                  alt={value.alt || 'Preview'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="h-6 w-6 text-gray-500" />
              )}
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0">
              <p className="text-sm text-white truncate">
                {value.metadata?.filename || 'Uploaded image'}
              </p>
              {value.metadata?.size && (
                <p className="text-xs text-brand-mist">
                  {(value.metadata.size / 1024).toFixed(0)} KB
                  {value.metadata.width && value.metadata.height &&
                    ` • ${value.metadata.width}×${value.metadata.height}`}
                </p>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              className="flex-shrink-0 text-red-500 hover:text-red-400 p-1"
              title="Remove image"
            >
              <X size={18} />
            </button>
          </div>

          {/* Alt Text Input */}
          <div>
            <label className="block text-xs text-brand-mist mb-1">
              Alt Text (required for accessibility)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => handleAltTextChange(e.target.value)}
              placeholder="Describe the image"
              className="w-full p-2 bg-brand-night border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent text-sm"
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 bg-red-500/20 border border-red-500 rounded-md">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Help Text */}
      {helpText && !error && (
        <p className="mt-1 text-xs text-brand-mist">{helpText}</p>
      )}
    </div>
  );
};
