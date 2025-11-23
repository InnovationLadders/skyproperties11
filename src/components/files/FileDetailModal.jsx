import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Download, Edit2, Save, Building2, Calendar, User, Tag, FileText } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { formatFileSize, FILE_CATEGORIES } from '../../utils/fileService';

export const FileDetailModal = ({ isOpen, onClose, file, onUpdate, onDownload, canEdit = false }) => {
  const { t, i18n } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedFile, setEditedFile] = useState({
    description: file?.description || '',
    tags: file?.tags?.join(', ') || '',
    fileCategory: file?.fileCategory || '',
  });
  const [saving, setSaving] = useState(false);

  if (!file) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return t('common.unknown');

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const tagArray = editedFile.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await onUpdate(file.id, {
        description: editedFile.description,
        tags: tagArray,
        fileCategory: editedFile.fileCategory,
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating file:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedFile({
      description: file.description || '',
      tags: file.tags?.join(', ') || '',
      fileCategory: file.fileCategory || '',
    });
    setIsEditing(false);
  };

  const canPreview = ['image', 'pdf'].includes(file.fileType);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto z-50">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-bold">
              {t('files.fileDetails')}
            </Dialog.Title>
            <div className="flex items-center gap-2">
              {canEdit && !isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  {t('common.edit')}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => onDownload(file)}>
                <Download className="h-4 w-4 mr-2" />
                {t('files.downloadFile')}
              </Button>
              <Dialog.Close asChild>
                <Button variant="ghost" size="sm">
                  <X className="h-5 w-5" />
                </Button>
              </Dialog.Close>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  {t('files.fileInfo')}
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">{t('files.fileName')}:</span>
                    <p className="mt-1 break-all">{file.fileName}</p>
                  </div>
                  <div>
                    <span className="font-medium">{t('files.fileType')}:</span>
                    <p className="mt-1">{t(`files.types.${file.fileType}`)}</p>
                  </div>
                  <div>
                    <span className="font-medium">{t('files.fileSize')}:</span>
                    <p className="mt-1">{formatFileSize(file.fileSize)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  {t('files.relatedProperty')}
                </h3>
                <p className="text-sm">{file.propertyName || t('files.noProperty')}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {t('files.uploadedBy')}
                </h3>
                <p className="text-sm">{file.uploadedByName}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(file.uploadedAt)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="edit-category">{t('files.fileCategory')}</Label>
                      <select
                        id="edit-category"
                        value={editedFile.fileCategory}
                        onChange={(e) =>
                          setEditedFile({ ...editedFile, fileCategory: e.target.value })
                        }
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {Object.values(FILE_CATEGORIES).map((cat) => (
                          <option key={cat} value={cat}>
                            {t(`files.categories.${cat}`)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="edit-description">{t('files.description')}</Label>
                      <textarea
                        id="edit-description"
                        value={editedFile.description}
                        onChange={(e) =>
                          setEditedFile({ ...editedFile, description: e.target.value })
                        }
                        placeholder={t('files.descriptionPlaceholder')}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-tags">{t('files.tags')}</Label>
                      <Input
                        id="edit-tags"
                        value={editedFile.tags}
                        onChange={(e) =>
                          setEditedFile({ ...editedFile, tags: e.target.value })
                        }
                        placeholder={t('files.tagsPlaceholder')}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={saving} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? t('common.saving') : t('common.save')}
                      </Button>
                      <Button variant="outline" onClick={handleCancel} className="flex-1">
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold mb-3">{t('files.fileCategory')}</h3>
                    <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded text-sm">
                      {t(`files.categories.${file.fileCategory}`)}
                    </span>

                    {file.description && (
                      <>
                        <h3 className="font-semibold mb-2 mt-4">{t('files.description')}</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {file.description}
                        </p>
                      </>
                    )}

                    {file.tags && file.tags.length > 0 && (
                      <>
                        <h3 className="font-semibold mb-2 mt-4 flex items-center">
                          <Tag className="h-4 w-4 mr-2" />
                          {t('files.tags')}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {file.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">{t('files.filePreview')}</h3>
              {canPreview ? (
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  {file.fileType === 'image' && (
                    <img
                      src={file.storageUrl}
                      alt={file.fileName}
                      className="w-full h-auto max-h-[600px] object-contain"
                    />
                  )}
                  {file.fileType === 'pdf' && (
                    <iframe
                      src={file.storageUrl}
                      className="w-full h-[600px]"
                      title={file.fileName}
                    />
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-12 text-center bg-gray-50">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground mb-4">{t('files.noPreview')}</p>
                  <Button variant="outline" onClick={() => onDownload(file)}>
                    <Download className="h-4 w-4 mr-2" />
                    {t('files.downloadToView')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
