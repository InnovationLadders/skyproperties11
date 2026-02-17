import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';

const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;
const ALLOWED_THUMBNAIL_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function ThumbnailUploader({ onUpload, onCancel, isUploading }) {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateThumbnailFile = (file) => {
    if (!ALLOWED_THUMBNAIL_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload JPG, PNG, or WebP images.';
    }

    if (file.size > MAX_THUMBNAIL_SIZE) {
      return 'File size exceeds 5MB limit.';
    }

    return null;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateThumbnailFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setError(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (selectedFile && onUpload) {
      onUpload(selectedFile);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <p>Upload a custom thumbnail for this video</p>
        <p className="text-xs mt-1">Recommended: 16:9 aspect ratio, max 5MB</p>
      </div>

      {!previewUrl ? (
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Click to upload thumbnail</p>
          <p className="text-xs text-muted-foreground">JPG, PNG, or WebP</p>
        </div>
      ) : (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Thumbnail preview"
            className="w-full rounded-lg border border-border"
          />
          {!isUploading && (
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isUploading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Thumbnail
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
