import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Video,
  Music,
  Archive,
  File,
  Download,
  Trash2,
  Eye,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatFileSize } from '../../utils/fileService';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const getFileIcon = (fileType) => {
  const iconProps = { className: 'h-12 w-12' };

  switch (fileType) {
    case 'pdf':
      return <FileText {...iconProps} className="h-12 w-12 text-red-500" />;
    case 'image':
      return <ImageIcon {...iconProps} className="h-12 w-12 text-blue-500" />;
    case 'document':
      return <FileText {...iconProps} className="h-12 w-12 text-blue-600" />;
    case 'spreadsheet':
      return <FileSpreadsheet {...iconProps} className="h-12 w-12 text-green-600" />;
    case 'video':
      return <Video {...iconProps} className="h-12 w-12 text-purple-500" />;
    case 'audio':
      return <Music {...iconProps} className="h-12 w-12 text-pink-500" />;
    case 'archive':
      return <Archive {...iconProps} className="h-12 w-12 text-yellow-600" />;
    default:
      return <File {...iconProps} className="h-12 w-12 text-gray-500" />;
  }
};

export const FileCard = ({ file, onView, onDownload, onDelete, selected, onSelect }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const formatDate = (timestamp) => {
    if (!timestamp) return t('common.unknown');

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-all duration-200 ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            {onSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => onSelect(file.id, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
            )}
            <div
              className="flex-shrink-0 cursor-pointer"
              onClick={() => onView && onView(file)}
            >
              {file.fileType === 'image' && file.storageUrl ? (
                <img
                  src={file.storageUrl}
                  alt={file.fileName}
                  className="h-16 w-16 object-cover rounded"
                />
              ) : (
                getFileIcon(file.fileType)
              )}
            </div>
          </div>

          <DropdownMenu.Root dir={isRTL ? 'rtl' : 'ltr'}>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[220px] bg-white rounded-md shadow-lg p-1 z-50"
                sideOffset={5}
              >
                <DropdownMenu.Item
                  className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded outline-none"
                  onSelect={() => onView && onView(file)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('files.viewFile')}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded outline-none"
                  onSelect={() => onDownload && onDownload(file)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('files.downloadFile')}
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                <DropdownMenu.Item
                  className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-red-50 text-red-600 rounded outline-none"
                  onSelect={() => onDelete && onDelete(file)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('files.deleteFile')}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        <div
          className="cursor-pointer"
          onClick={() => onView && onView(file)}
        >
          <h3 className="font-medium text-sm mb-2 line-clamp-2" title={file.fileName}>
            {file.fileName}
          </h3>

          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>{formatFileSize(file.fileSize)}</span>
              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                {t(`files.categories.${file.fileCategory}`)}
              </span>
            </div>

            {file.propertyName && (
              <div className="text-xs">
                <span className="font-medium">{t('files.property')}:</span> {file.propertyName}
              </div>
            )}

            <div>
              <span className="font-medium">{t('files.uploadedBy')}:</span> {file.uploadedByName}
            </div>

            <div>
              {formatDate(file.uploadedAt)}
            </div>

            {file.description && (
              <p className="text-xs mt-2 line-clamp-2" title={file.description}>
                {file.description}
              </p>
            )}

            {file.tags && file.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {file.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {file.tags.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                    +{file.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
