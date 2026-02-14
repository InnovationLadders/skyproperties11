import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Image as ImageIcon, Video, Loader2, AlertCircle, Play, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { uploadUnitMedia, addMediaToUnit } from '../../utils/mediaUpload';

export const MediaUploader = ({ unitId, userId, onUploadComplete, disabled }) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState({ completed: 0, failed: 0, total: 0 });
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    if (disabled) return;
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const newUploads = files.map((file, index) => ({
      id: `${Date.now()}_${index}_${file.name}`,
      file,
      progress: 0,
      status: 'queued',
      error: null,
      preview: null,
    }));

    newUploads.forEach((upload) => {
      if (upload.file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === upload.id ? { ...item, preview: reader.result } : item
            )
          );
        };
        reader.readAsDataURL(upload.file);
      }
    });

    setUploadQueue((prev) => [...prev, ...newUploads]);
    setUploadStats(prev => ({ ...prev, total: prev.total + newUploads.length }));
  };

  const startUploads = async (uploads) => {
    setIsUploading(true);

    for (const upload of uploads) {
      if (upload.status !== 'queued' && upload.status !== 'pending') {
        continue;
      }

      try {
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === upload.id ? { ...item, status: 'uploading' } : item
          )
        );

        const mediaData = await uploadUnitMedia(
          unitId,
          upload.file,
          userId,
          (progress) => {
            setUploadQueue((prev) =>
              prev.map((item) =>
                item.id === upload.id ? { ...item, progress } : item
              )
            );
          }
        );

        await addMediaToUnit(unitId, mediaData);

        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === upload.id ? { ...item, status: 'completed', progress: 100 } : item
          )
        );

        setUploadStats(prev => ({ ...prev, completed: prev.completed + 1 }));

        if (onUploadComplete) {
          onUploadComplete(mediaData);
        }

        setTimeout(() => {
          setUploadQueue((prev) => prev.filter((item) => item.id !== upload.id));
        }, 2000);
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === upload.id
              ? { ...item, status: 'error', error: error.message }
              : item
          )
        );
        setUploadStats(prev => ({ ...prev, failed: prev.failed + 1 }));
      }
    }

    setIsUploading(false);
  };

  const startAllUploads = () => {
    const queuedItems = uploadQueue.filter(item => item.status === 'queued');
    if (queuedItems.length > 0) {
      startUploads(queuedItems);
    }
  };

  const clearCompleted = () => {
    setUploadQueue(prev => prev.filter(item =>
      item.status !== 'completed' && item.status !== 'error'
    ));
    setUploadStats({ completed: 0, failed: 0, total: uploadQueue.filter(item =>
      item.status === 'queued' || item.status === 'uploading'
    ).length });
  };

  const clearAll = () => {
    setUploadQueue([]);
    setUploadStats({ completed: 0, failed: 0, total: 0 });
  };

  const removeFromQueue = (uploadId) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== uploadId));
  };

  const retryUpload = (upload) => {
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.id === upload.id
          ? { ...item, status: 'pending', error: null, progress: 0 }
          : item
      )
    );
    startUploads([upload]);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">
          {disabled ? t('media.uploadDisabled') : t('media.dropFilesOrClick')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('media.uploadLimits')}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {uploadQueue.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">
              {uploadQueue.filter(item => item.status === 'queued').length} {t('media.filesInQueue')}
            </span>
            {uploadStats.completed > 0 && (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                {uploadStats.completed} {t('media.completed')}
              </span>
            )}
            {uploadStats.failed > 0 && (
              <span className="text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {uploadStats.failed} {t('media.failed')}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {!isUploading && uploadQueue.some(item => item.status === 'queued') && (
              <Button
                size="sm"
                onClick={startAllUploads}
                disabled={disabled}
              >
                <Play className="h-4 w-4 mr-1" />
                {t('media.startUpload')}
              </Button>
            )}
            {uploadQueue.some(item => item.status === 'completed' || item.status === 'error') && (
              <Button
                size="sm"
                variant="outline"
                onClick={clearCompleted}
                disabled={isUploading}
              >
                {t('media.clearCompleted')}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={clearAll}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {uploadQueue.length > 0 && (
        <div className="space-y-2">
          {uploadQueue.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {upload.preview ? (
                  <img
                    src={upload.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : upload.file.type.startsWith('video/') ? (
                  <Video className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{upload.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                {upload.status === 'queued' && (
                  <p className="text-xs text-blue-600 mt-1">
                    {t('media.waitingToUpload')}
                  </p>
                )}

                {upload.status === 'uploading' && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${upload.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(upload.progress)}%
                    </p>
                  </div>
                )}

                {upload.status === 'completed' && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {t('media.uploadCompleted')}
                  </p>
                )}

                {upload.status === 'error' && (
                  <div className="mt-1">
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {upload.error}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => retryUpload(upload)}
                      className="mt-1 h-6 text-xs"
                    >
                      {t('media.retry')}
                    </Button>
                  </div>
                )}
              </div>

              {upload.status === 'uploading' ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
              ) : upload.status === 'error' || upload.status === 'queued' ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromQueue(upload.id)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
