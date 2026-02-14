import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image as ImageIcon, Video, Star, Trash2, Edit2, GripVertical, CheckSquare, Square } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';

export const MediaGallery = ({
  media = [],
  onDelete,
  onDeleteMultiple,
  onSetPrimary,
  onEditCaption,
  onReorder,
  onMediaClick,
  canEdit = false,
}) => {
  const { t } = useTranslation();
  const [editingCaption, setEditingCaption] = useState(null);
  const [captionValue, setCaptionValue] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const sortedMedia = [...media].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return a.order - b.order;
  });

  const handleEditCaption = (mediaItem) => {
    setEditingCaption(mediaItem.id);
    setCaptionValue(mediaItem.caption || '');
  };

  const handleSaveCaption = (mediaItem) => {
    if (onEditCaption) {
      onEditCaption(mediaItem, captionValue);
    }
    setEditingCaption(null);
  };

  const handleCancelEdit = () => {
    setEditingCaption(null);
    setCaptionValue('');
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedItems([]);
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const selectAll = () => {
    setSelectedItems(media.map(item => item.id));
  };

  const deselectAll = () => {
    setSelectedItems([]);
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;

    const itemsToDelete = media.filter(item => selectedItems.includes(item.id));

    if (window.confirm(t('media.deleteMultipleConfirm', { count: selectedItems.length }))) {
      if (onDeleteMultiple) {
        onDeleteMultiple(itemsToDelete);
      }
      setSelectedItems([]);
      setSelectionMode(false);
    }
  };

  if (media.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">{t('media.noMediaYet')}</p>
        {canEdit && (
          <p className="text-xs text-muted-foreground mt-1">
            {t('media.uploadMediaDescription')}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canEdit && media.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant={selectionMode ? "default" : "outline"}
              onClick={toggleSelectionMode}
            >
              {selectionMode ? (
                <>
                  <CheckSquare className="h-4 w-4 mr-1" />
                  {t('media.cancelSelection')}
                </>
              ) : (
                <>
                  <Square className="h-4 w-4 mr-1" />
                  {t('media.selectMultiple')}
                </>
              )}
            </Button>

            {selectionMode && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={selectAll}
                  disabled={selectedItems.length === media.length}
                >
                  {t('media.selectAll')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={deselectAll}
                  disabled={selectedItems.length === 0}
                >
                  {t('media.deselectAll')}
                </Button>
              </>
            )}
          </div>

          {selectionMode && selectedItems.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {selectedItems.length} {t('media.selected')}
              </span>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteSelected}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t('media.deleteSelected')}
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {sortedMedia.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="relative group"
        >
          <div
            className={`aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer transition-all ${
              selectionMode && selectedItems.includes(item.id)
                ? 'ring-4 ring-primary ring-offset-2'
                : ''
            }`}
            onClick={() => {
              if (selectionMode) {
                toggleItemSelection(item.id);
              } else if (onMediaClick) {
                onMediaClick(item);
              }
            }}
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.caption || 'Unit media'}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="relative w-full h-full">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.caption || 'Video thumbnail'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                    <div className="w-0 h-0 border-l-8 border-l-gray-800 border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>
            )}

            {selectionMode && (
              <div className="absolute top-2 right-2 z-10">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                    selectedItems.includes(item.id)
                      ? 'bg-primary text-white'
                      : 'bg-white/80 text-gray-600'
                  }`}
                >
                  {selectedItems.includes(item.id) ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </div>
              </div>
            )}

            {item.isPrimary && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                {t('media.primary')}
              </div>
            )}

            {canEdit && !selectionMode && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!item.isPrimary && onSetPrimary && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetPrimary(item);
                    }}
                    className="h-8"
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                )}
                {onEditCaption && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCaption(item);
                    }}
                    className="h-8"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(t('media.deleteMediaConfirm'))) {
                        onDelete(item);
                      }
                    }}
                    className="h-8 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {editingCaption === item.id ? (
            <div className="mt-2 space-y-2">
              <input
                type="text"
                value={captionValue}
                onChange={(e) => setCaptionValue(e.target.value)}
                placeholder={t('media.addCaption')}
                className="w-full px-2 py-1 text-xs border border-input bg-background rounded"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveCaption(item);
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => handleSaveCaption(item)}
                  className="flex-1 h-6 text-xs"
                >
                  {t('common.save')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex-1 h-6 text-xs"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          ) : (
            item.caption && (
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                {item.caption}
              </p>
            )
          )}

          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {item.type === 'image' ? (
                <ImageIcon className="h-3 w-3 inline mr-1" />
              ) : (
                <Video className="h-3 w-3 inline mr-1" />
              )}
              {t(`media.${item.type}`)}
            </span>
            {canEdit && onReorder && (
              <GripVertical className="h-3 w-3 cursor-move" />
            )}
          </div>
        </motion.div>
      ))}
      </div>
    </div>
  );
};
