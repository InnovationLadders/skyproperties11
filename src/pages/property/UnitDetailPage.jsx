import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ContactModal } from '../../components/property/ContactModal';
import { MediaViewer } from '../../components/property/MediaViewer';
import { Virtual360Viewer } from '../../components/property/Virtual360Viewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Building2, ArrowLeft, DollarSign, Ruler, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { PlayButtonOverlay } from '../../components/property/PlayButtonOverlay';

export default function UnitDetailPage() {
  const { t } = useTranslation();
  const { propertyId, unitId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, [propertyId, unitId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
      if (propertyDoc.exists()) {
        setProperty({ id: propertyDoc.id, ...propertyDoc.data() });
      }

      const unitDoc = await getDoc(doc(db, 'units', unitId));
      if (unitDoc.exists()) {
        setUnit({ id: unitDoc.id, ...unitDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!unit || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="py-12">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-center mb-4">{t('unit.unitNotFound')}</h3>
            <Button onClick={() => navigate(`/property/${propertyId}`)}>
              {t('property.backToProperty')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/property/${propertyId}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('property.backToAvailableUnits')}
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{unit.unitNumber}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    {property.name} - {t('unit.floor')} {unit.floor}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  <span
                    className={`text-sm px-3 py-1 rounded font-medium ${
                      unit.listingType === 'sale'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {unit.listingType === 'sale' ? t('property.forSale') : t('property.forRent')}
                  </span>
                  <span
                    className={`text-sm px-3 py-1 rounded ${
                      unit.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {t(`unit.${unit.status}`)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {unit.virtual360Url && (
                <Virtual360Viewer
                  url={unit.virtual360Url}
                  unitNumber={unit.unitNumber}
                />
              )}

              {unit.media && unit.media.length > 0 ? (
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
                  <div
                    className="w-full h-full cursor-pointer"
                    onClick={() => {
                      setMediaViewerIndex(currentMediaIndex);
                      setShowMediaViewer(true);
                    }}
                  >
                    {unit.media[currentMediaIndex].type === 'image' ? (
                      <img
                        src={unit.media[currentMediaIndex].url}
                        alt={unit.media[currentMediaIndex].caption || 'Unit media'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <img
                          src={unit.media[currentMediaIndex].thumbnailUrl}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                        />
                        <PlayButtonOverlay size="large" />
                      </div>
                    )}
                  </div>

                  {unit.media.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentMediaIndex((prev) =>
                            prev > 0 ? prev - 1 : unit.media.length - 1
                          );
                        }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentMediaIndex((prev) =>
                            prev < unit.media.length - 1 ? prev + 1 : 0
                          );
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {unit.media.map((_, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentMediaIndex(index);
                            }}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              index === currentMediaIndex
                                ? 'bg-white w-4'
                                : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        {currentMediaIndex + 1} / {unit.media.length}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-muted-foreground" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">{t('property.listingType')}</span>
                  <span className={`font-medium px-2 py-1 rounded text-sm ${
                    unit.listingType === 'sale'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {unit.listingType === 'sale' ? t('property.forSale') : t('property.forRent')}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">{t('property.viewType')}</span>
                  <span className={`font-medium px-2 py-1 rounded text-sm ${
                    unit.viewType === 'external'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {unit.viewType === 'external' ? t('property.externalView') : t('property.internalView')}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">{t('unit.type')}</span>
                  <span className="font-medium">{unit.type}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">{t('unit.size')}</span>
                  <span className="font-medium flex items-center">
                    <Ruler className="h-4 w-4 mr-1" />
                    {unit.size} sqm
                  </span>
                </div>
                <div className="flex justify-between border-b pb-3 col-span-2">
                  <span className="text-muted-foreground">{t('unit.price')}</span>
                  <span className="font-medium text-primary text-lg flex items-center">
                    <DollarSign className="h-5 w-5 mr-1" />
                    {unit.price?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-3 col-span-2">
                  <span className="text-muted-foreground">{t('unit.status')}</span>
                  <span
                    className={`font-medium ${
                      unit.status === 'available'
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {t(`unit.${unit.status}`)}
                  </span>
                </div>
              </div>

              {unit.description && (
                <div>
                  <h4 className="font-semibold mb-2 text-lg">{t('property.description')}</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {unit.description}
                  </p>
                </div>
              )}

              <div className="pt-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setShowContactModal(true)}
                >
                  {t('property.requestContact')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        property={property}
        unit={unit}
      />

      <MediaViewer
        media={unit?.media || []}
        initialIndex={mediaViewerIndex}
        isOpen={showMediaViewer}
        onClose={() => setShowMediaViewer(false)}
      />
    </div>
  );
}
