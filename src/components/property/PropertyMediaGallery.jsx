import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayButtonOverlay } from './PlayButtonOverlay';

export const PropertyMediaGallery = ({ media = [], propertyName = '' }) => {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!media || media.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('property.noMediaYet')}</p>
        </CardContent>
      </Card>
    );
  }

  const handleOpenFullscreen = (index) => {
    setSelectedIndex(index);
    setIsFullscreen(true);
  };

  const handleClose = () => {
    setIsFullscreen(false);
    setTimeout(() => setSelectedIndex(null), 300);
  };

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      handlePrevious();
    } else if (info.offset.x < -swipeThreshold) {
      handleNext();
    }
  };

  const selectedMedia = selectedIndex !== null ? media[selectedIndex] : null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('property.mediaGallery')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item, index) => (
              <div
                key={index}
                className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group border border-border hover:border-primary transition-colors"
                onClick={() => handleOpenFullscreen(index)}
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.caption || `Media ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    {item.thumbnailUrl ? (
                      <>
                        <img
                          src={item.thumbnailUrl}
                          alt={item.caption || `Video ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full hidden items-center justify-center bg-gray-200">
                          <Video className="h-12 w-12 text-gray-400" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Video className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <PlayButtonOverlay className="group-hover:bg-black/40 transition-colors" />
                  </div>
                )}
                {item.isPrimary && (
                  <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-md font-medium">
                    {t('property.primary')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {isFullscreen && selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={handleClose}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={handleClose}
            >
              <X className="h-6 w-6" />
            </Button>

            {media.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            <motion.div
              className="max-w-7xl max-h-[90vh] w-full px-4"
              onClick={(e) => e.stopPropagation()}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
            >
              {selectedMedia.type === 'image' ? (
                <motion.img
                  key={selectedIndex}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  src={selectedMedia.url}
                  alt={selectedMedia.caption || propertyName}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              ) : (
                <motion.div
                  key={selectedIndex}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <video
                    src={selectedMedia.url}
                    controls
                    autoPlay
                    className="w-full h-full max-h-[80vh] object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                </motion.div>
              )}

              {selectedMedia.caption && (
                <div className="mt-4 text-center pointer-events-none">
                  <p className="text-white text-sm">{selectedMedia.caption}</p>
                </div>
              )}

              {media.length > 1 && (
                <div className="mt-4 text-center pointer-events-none">
                  <p className="text-white/70 text-sm">
                    {selectedIndex + 1} / {media.length}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
