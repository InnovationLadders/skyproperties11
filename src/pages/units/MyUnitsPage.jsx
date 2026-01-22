import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Building2, MapPin, Layers, Eye, Home } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { UNIT_STATUS } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';

export const MyUnitsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [units, setUnits] = useState([]);
  const [properties, setProperties] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyUnits();
  }, [currentUser]);

  const fetchMyUnits = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const unitsQuery = query(
        collection(db, 'units'),
        where('ownerId', '==', currentUser.uid)
      );
      const unitsSnapshot = await getDocs(unitsQuery);

      const unitsData = unitsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const propertiesSnapshot = await getDocs(collection(db, 'properties'));
      const propertiesData = {};
      propertiesSnapshot.docs.forEach((doc) => {
        propertiesData[doc.id] = doc.data();
      });

      setUnits(unitsData);
      setProperties(propertiesData);
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case UNIT_STATUS.AVAILABLE:
        return 'bg-green-100 text-green-800';
      case UNIT_STATUS.RESERVED:
        return 'bg-yellow-100 text-yellow-800';
      case UNIT_STATUS.SOLD:
        return 'bg-blue-100 text-blue-800';
      case UNIT_STATUS.RENTED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUnitStats = () => {
    return {
      total: units.length,
      available: units.filter(u => u.status === UNIT_STATUS.AVAILABLE).length,
      rented: units.filter(u => u.status === UNIT_STATUS.RENTED).length,
      sold: units.filter(u => u.status === UNIT_STATUS.SOLD).length,
    };
  };

  const stats = getUnitStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{t('dashboard.myUnits')}</h1>
                <p className="text-muted-foreground">
                  {t('dashboard.manageUnits')}
                </p>
              </div>
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                <Home className="h-4 w-4 mr-2" />
                {t('common.back')}
              </Button>
            </div>

            {units.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>{t('unit.totalUnits')}</CardDescription>
                    <CardTitle className="text-3xl">{stats.total}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>{t('unit.available')}</CardDescription>
                    <CardTitle className="text-3xl text-green-600">{stats.available}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>{t('unit.rented')}</CardDescription>
                    <CardTitle className="text-3xl text-purple-600">{stats.rented}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>{t('unit.sold')}</CardDescription>
                    <CardTitle className="text-3xl text-blue-600">{stats.sold}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            )}
          </div>

          {units.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('unit.noUnitsFound')}</h3>
                <p className="text-muted-foreground mb-6">
                  {t('user.noUnitsAssignedDescription')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {units.map((unit, index) => (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">
                            {unit.unitNumber}
                          </CardTitle>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            unit.status
                          )}`}
                        >
                          {t(`unit.${unit.status}`)}
                        </span>
                      </div>
                      <CardDescription>
                        <div className="flex items-center text-sm mt-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {properties[unit.propertyId]?.name || t('unit.unknownProperty')}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center">
                            <Layers className="h-4 w-4 mr-2" />
                            {t('unit.floor')}:
                          </span>
                          <span className="font-medium">{unit.floor || t('unit.na')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{t('unit.type')}:</span>
                          <span className="font-medium">
                            {unit.type ? t(`unit.${unit.type}`) : t('unit.na')}
                          </span>
                        </div>
                        {unit.size && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{t('unit.size')}:</span>
                            <span className="font-medium">{unit.size} {t('unit.sqm')}</span>
                          </div>
                        )}
                        {unit.price && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{t('unit.price')}:</span>
                            <span className="font-medium">${unit.price.toLocaleString()}</span>
                          </div>
                        )}
                        {unit.viewType && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{t('unit.view')}:</span>
                            <span className="font-medium">
                              {t(`unit.${unit.viewType}View`)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() => navigate(`/units/edit/${unit.id}`)}
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('common.viewDetails')}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
