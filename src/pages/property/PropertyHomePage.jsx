import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { BuildingModel3D } from '../../components/property/BuildingModel3D';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Building2, MapPin, DollarSign, Ruler } from 'lucide-react';
import { motion } from 'framer-motion';

export const PropertyHomePage = () => {
  const { t } = useTranslation();
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    fetchPropertyData();
  }, [propertyId]);

  const fetchPropertyData = async () => {
    setLoading(true);
    try {
      const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
      if (propertyDoc.exists()) {
        setProperty({ id: propertyDoc.id, ...propertyDoc.data() });
      }

      const unitsQuery = query(
        collection(db, 'units'),
        where('propertyId', '==', propertyId)
      );
      const unitsSnapshot = await getDocs(unitsQuery);
      const unitsData = unitsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUnits(unitsData);
    } catch (error) {
      console.error('Error fetching property data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hotspots = units
    .filter((unit) => unit.coordinates)
    .map((unit) => ({
      position: unit.coordinates,
      type: unit.status === 'available' && unit.listingType === 'sale'
        ? (unit.viewType === 'external' ? 'saleExternal' : 'saleInternal')
        : (unit.viewType === 'external' ? 'rentExternal' : 'rentInternal'),
      label: unit.unitNumber,
      unit: unit,
    }));

  const handleHotspotClick = (hotspot) => {
    navigate(`/property/${propertyId}/unit/${hotspot.unit.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="py-12">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-center">{t('property.propertyNotFound')}</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{property.address}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <div className="mb-3 px-1">
              <p className="text-sm text-muted-foreground">
                {t('property.clickHotspot')}
              </p>
            </div>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="h-[600px] bg-gray-100 relative">
                  <BuildingModel3D
                    modelUrl={property.modelUrl}
                    hotspots={hotspots}
                    onHotspotClick={handleHotspotClick}
                  />
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200">
                    <h4 className="text-xs font-semibold mb-2 text-gray-700">{t('property.legend')}</h4>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-xs text-gray-700">{t('property.forSaleExternal')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-700">{t('property.forSaleInternal')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="text-xs text-gray-700">{t('property.forRentExternal')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-gray-700">{t('property.forRentInternal')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t('property.availableUnits')}</CardTitle>
                <CardDescription>
                  {units.length} {t('property.unitsTotal')}, {units.filter(u => u.status === 'available').length} {t('property.available')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {units.map((unit) => (
                    <motion.div
                      key={unit.id}
                      whileHover={{ scale: 1.02 }}
                      className="border rounded-lg cursor-pointer hover:border-primary transition-colors overflow-hidden"
                      onClick={() => navigate(`/property/${propertyId}/unit/${unit.id}`)}
                    >
                      {unit.media && unit.media.length > 0 ? (
                        <div className="relative aspect-video bg-gray-100 overflow-hidden">
                          <img
                            src={(unit.media.find(m => m.isPrimary) || unit.media[0]).url}
                            alt={`Unit ${unit.unitNumber}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <span
                              className={`text-xs px-2 py-1 rounded font-medium ${
                                unit.listingType === 'sale'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-blue-500 text-white'
                              }`}
                            >
                              {unit.listingType === 'sale' ? t('property.forSale') : t('property.forRent')}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
                          <Building2 className="h-12 w-12 text-muted-foreground" />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <span
                              className={`text-xs px-2 py-1 rounded font-medium ${
                                unit.listingType === 'sale'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-blue-500 text-white'
                              }`}
                            >
                              {unit.listingType === 'sale' ? t('property.forSale') : t('property.forRent')}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-lg">{t('unit.units')} {unit.unitNumber}</h4>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              unit.status === 'available'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {t(`unit.${unit.status}`)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center">
                              <Ruler className="h-3 w-3 mr-1" />
                              {unit.size} {t('unit.size')}
                            </span>
                            <span className="font-medium">{t('unit.floor')} {unit.floor}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center font-semibold text-primary">
                              <DollarSign className="h-3 w-3 mr-1" />
                              ${unit.price?.toLocaleString()}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              unit.viewType === 'external'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {unit.viewType === 'external' ? t('property.external') : t('property.internal')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
