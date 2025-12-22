import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Share2,
  ExternalLink,
  Loader2,
  Home,
  Calendar,
  Layers,
  Car
} from 'lucide-react';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { PropertyFeatures } from '../../components/property/PropertyFeatures';
import { PropertyMediaGallery } from '../../components/property/PropertyMediaGallery';
import { motion } from 'framer-motion';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [property, setProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPropertyDetails();
  }, [id]);

  const loadPropertyDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const propertyDoc = await getDoc(doc(db, 'properties', id));

      if (!propertyDoc.exists()) {
        setError(t('property.propertyNotFound'));
        return;
      }

      const propertyData = { id: propertyDoc.id, ...propertyDoc.data() };
      setProperty(propertyData);

      const unitsQuery = query(
        collection(db, 'units'),
        where('propertyId', '==', id),
        where('status', 'in', ['available', 'reserved']),
        limit(6)
      );

      const unitsSnapshot = await getDocs(unitsQuery);
      const unitsData = unitsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setUnits(unitsData);
    } catch (err) {
      console.error('Error loading property details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShareProperty = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert(t('property.linkCopied'));
  };

  const handleOpenMaps = () => {
    if (property?.mapCoordinates) {
      const { lat, lng } = property.mapCoordinates;
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('property.propertyNotFound')}</h2>
            <p className="text-muted-foreground mb-6">
              {error || t('property.propertyNotFound')}
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('property.backToProperties')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bannerImage = property.bannerImage || property.imageUrl || '/placeholder-property.jpg';
  const features = property.features || [];
  const mediaGallery = property.mediaGallery || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="relative h-[400px] md:h-[500px] w-full">
        <img
          src={bannerImage}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute top-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('property.backToProperties')}
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {property.name || t('property.unnamed')}
              </h1>
              {property.address && (
                <div className="flex items-center gap-2 text-white/90 text-lg mb-4">
                  <MapPin className="h-5 w-5" />
                  <span>{property.address}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleShareProperty}
                  className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                >
                  <Share2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('property.shareProperty')}
                </Button>
                {property.mapCoordinates && (
                  <Button
                    onClick={handleOpenMaps}
                    className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                  >
                    <ExternalLink className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('property.openInMaps')}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Home className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('property.totalUnits')}</p>
                  <p className="text-2xl font-bold">{property.totalUnits || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {property.yearBuilt && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('property.yearBuilt')}</p>
                    <p className="text-2xl font-bold">{property.yearBuilt}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {property.totalFloors && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Layers className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('property.totalFloors')}</p>
                    <p className="text-2xl font-bold">{property.totalFloors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {property.parkingSpaces && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Car className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('property.parkingSpaces')}</p>
                    <p className="text-2xl font-bold">{property.parkingSpaces}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {property.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{t('property.aboutProperty')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {features.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <PropertyFeatures features={features} />
          </motion.div>
        )}

        {mediaGallery.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <PropertyMediaGallery media={mediaGallery} propertyName={property.name} />
          </motion.div>
        )}

        {property.mapCoordinates && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{t('property.propertyLocation')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden border border-border">
                  <iframe
                    src={`https://www.google.com/maps?q=${property.mapCoordinates.lat},${property.mapCoordinates.lng}&output=embed`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <div className="mt-4 flex justify-center">
                  <Button onClick={handleOpenMaps}>
                    <MapPin className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('property.getDirections')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('property.availableUnitsSection')}</CardTitle>
                <Link to={`/property/${id}`}>
                  <Button variant="outline" size="sm">
                    {t('property.viewAllUnits')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {units.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {units.map((unit) => (
                    <div
                      key={unit.id}
                      className="border border-border rounded-lg p-4 hover:border-primary transition-colors"
                    >
                      <h3 className="font-semibold text-lg mb-2">{unit.unitNumber}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{t('unit.floor')}: {unit.floor}</p>
                        <p>{unit.size} {t('unit.sqm')}</p>
                        {unit.price && <p className="font-semibold text-foreground">${unit.price}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t('unit.noUnitsFound')}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{t('property.quickLinks')}</h3>
                  <p className="text-blue-100">
                    {t('property.viewDirectory')} & {t('property.viewIn3D')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to={`/public/directory?propertyId=${id}`}>
                    <Button variant="secondary">
                      <Building2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('property.viewDirectory')}
                    </Button>
                  </Link>
                  <Link to={`/property/${id}`}>
                    <Button variant="secondary">
                      {t('property.viewIn3D')}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
