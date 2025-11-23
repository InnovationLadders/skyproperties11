import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, File, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { validateFile, FILE_CATEGORIES, formatFileSize } from '../../utils/fileService';

export const FileUploadModal = ({ isOpen, onClose, onUpload, properties, selectedPropertyId }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [propertyId, setPropertyId] = useState(selectedPropertyId || '');
  const [category, setCategory] = useState(FILE_CATEGORIES.OTHER);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    const validationErrors = [];
    const validFiles = [];

    files.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        validationErrors.push({
          fileName: file.name,
          error: t(`files.errors.${validation.error}`),
        });
      }
    });

    setErrors(validationErrors);
    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!propertyId) {
      setErrors([{ error: t('files.selectProperty') }]);
      return;
    }

    if (selectedFiles.length === 0) {
      return;
    }

    setUploading(true);
    const tagArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    try {
      const selectedProperty = properties.find((p) => p.id === propertyId);
      const propertyName = selectedProperty?.name || '';

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        await onUpload(
          file,
          propertyId,
          propertyName,
          category,
          description,
          tagArray,
          (progress) => {
            setUploadProgress((prev) => ({
              ...prev,
              [i]: progress,
            }));
          }
        );
      }

      setSelectedFiles([]);
      setDescription('');
      setTags('');
      setUploadProgress({});
      setErrors([]);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      setErrors([{ error: t('files.errors.uploadFailed') }]);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFiles([]);
      setDescription('');
      setTags('');
      setUploadProgress({});
      setErrors([]);
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-bold">
              {t('files.uploadFiles')}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm" disabled={uploading}>
                <X className="h-5 w-5" />
              </Button>
            </Dialog.Close>
          </div>

          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              {errors.map((error, index) => (
                <div key={index} className="flex items-center text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    {error.fileName && `${error.fileName}: `}
                    {error.error}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="property">{t('files.selectProperty')} *</Label>
              <select
                id="property"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={uploading || !!selectedPropertyId}
              >
                <option value="">{t('files.selectProperty')}</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="category">{t('files.fileCategory')} *</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={uploading}
              >
                {Object.values(FILE_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`files.categories.${cat}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="description">{t('files.description')}</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('files.descriptionPlaceholder')}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                disabled={uploading}
              />
            </div>

            <div>
              <Label htmlFor="tags">{t('files.tags')}</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={t('files.tagsPlaceholder')}
                disabled={uploading}
              />
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />

              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">{t('files.dragDropFiles')}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {t('files.orClickToSelect')}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {t('files.browseFiles')}
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                {t('files.supportedFormats')}: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, MP4, ZIP
              </p>
              <p className="text-xs text-muted-foreground">
                {t('files.maxFileSize')}: 50 MB
              </p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>{t('files.filesSelected')} ({selectedFiles.length})</Label>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <File className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>

                      {uploading && uploadProgress[index] !== undefined && (
                        <div className="flex items-center gap-2 mr-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${uploadProgress[index]}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(uploadProgress[index])}%
                          </span>
                        </div>
                      )}

                      {!uploading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={handleClose} disabled={uploading}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploading || selectedFiles.length === 0 || !propertyId}
            >
              {uploading ? t('files.uploading') : t('files.uploadFiles')}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
