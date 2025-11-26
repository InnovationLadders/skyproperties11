import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Building2, MapPin, Layers, Calendar, DollarSign, FileText, Home, Phone, Mail, Wrench, CreditCard, Image as ImageIcon } from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { CONTRACT_STATUS, UNIT_STATUS } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';

export const MyRentalPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [rentedUnit, setRentedUnit] = useState(null);
  const [property, setProperty] = useState(null);
  const [contract, setContract] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentalData();
  }, [currentUser]);

  const fetchRentalData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const unitsQuery = query(
        collection(db, 'units'),
        where('tenantId', '==', currentUser.uid)
      );
      const unitsSnapshot = await getDocs(unitsQuery);

      if (unitsSnapshot.empty) {
        setLoading(false);
        return;
      }

      const unitData = {
        id: unitsSnapshot.docs[0].id,
        ...unitsSnapshot.docs[0].data(),
      };
      setRentedUnit(unitData);

      if (unitData.propertyId) {
        const propertiesSnapshot = await getDocs(collection(db, 'properties'));
        const propertyDoc = propertiesSnapshot.docs.find(doc => doc.id === unitData.propertyId);
        if (propertyDoc) {
          setProperty({ id: propertyDoc.id, ...propertyDoc.data() });
        }
      }

      const contractsQuery = query(
        collection(db, 'contracts'),
        where('tenantId', '==', currentUser.uid),
        where('status', '==', CONTRACT_STATUS.ACTIVE),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const contractsSnapshot = await getDocs(contractsQuery);
      if (!contractsSnapshot.empty) {
        setContract({
          id: contractsSnapshot.docs[0].id,
          ...contractsSnapshot.docs[0].data(),
        });
      }

      const billsQuery = query(
        collection(db, 'bills'),
        where('recipientId', '==', currentUser.uid),
        orderBy('dueDate', 'desc'),
        limit(5)
      );
      const billsSnapshot = await getDocs(billsQuery);
      const billsData = billsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBills(billsData);

    } catch (error) {
      console.error('Error fetching rental data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return t('unit.na');
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString(t('common.language') === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateMonthsRemaining = () => {
    if (!contract?.endDate) return 0;
    const endDate = contract.endDate.toDate ? contract.endDate.toDate() : new Date(contract.endDate);
    const now = new Date();
    const months = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24 * 30)));
    return months;
  };

  const getUnpaidBillsTotal = () => {
    return bills
      .filter(bill => bill.status !== 'paid')
      .reduce((sum, bill) => sum + (bill.amount || 0), 0);
  };

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

  if (!rentedUnit) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-4">
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              <Home className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
          </div>
          <Card>
            <CardContent className="py-16 text-center">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('dashboard.myRental')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('user.noUnitsAssignedDescription')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const monthsRemaining = calculateMonthsRemaining();
  const unpaidTotal = getUnpaidBillsTotal();

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
                <h1 className="text-3xl font-bold mb-2">{t('dashboard.myRental')}</h1>
                <p className="text-muted-foreground">
                  {t('dashboard.viewRentalDetails')}
                </p>
              </div>
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                <Home className="h-4 w-4 mr-2" />
                {t('common.back')}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>{t('contract.rentAmount')}</CardDescription>
                  <CardTitle className="text-3xl text-primary">
                    ${contract?.rentAmount?.toLocaleString() || '0'}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>{t('billing.amountDue')}</CardDescription>
                  <CardTitle className="text-3xl text-orange-600">
                    ${unpaidTotal.toLocaleString()}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>{t('contract.duration')}</CardDescription>
                  <CardTitle className="text-3xl text-green-600">
                    {monthsRemaining} {t('contract.months')}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle>{t('unit.unit')} {rentedUnit.unitNumber}</CardTitle>
                  </div>
                  <CardDescription>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property?.name || t('unit.unknownProperty')}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Layers className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-2">{t('unit.floor')}:</span>
                      <span className="font-medium">{rentedUnit.floor || t('unit.na')}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-2">{t('unit.type')}:</span>
                      <span className="font-medium">
                        {rentedUnit.type ? t(`unit.${rentedUnit.type}`) : t('unit.na')}
                      </span>
                    </div>
                    {rentedUnit.size && (
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">{t('unit.size')}:</span>
                        <span className="font-medium">{rentedUnit.size} {t('unit.sqm')}</span>
                      </div>
                    )}
                    {rentedUnit.viewType && (
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">{t('unit.view')}:</span>
                        <span className="font-medium">
                          {t(`unit.${rentedUnit.viewType}View`)}
                        </span>
                      </div>
                    )}
                  </div>
                  {rentedUnit.description && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">{rentedUnit.description}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    onClick={() => navigate('/tickets/create')}
                    variant="outline"
                    className="flex-1"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    {t('ticket.createTicket')}
                  </Button>
                  {property && (
                    <Button
                      onClick={() => navigate(`/property/${property.id}`)}
                      variant="outline"
                      className="flex-1"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {t('property.viewDetails')}
                    </Button>
                  )}
                </CardFooter>
              </Card>

              {contract && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle>{t('contract.contractDetails')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between pb-2 border-b">
                        <span className="text-muted-foreground flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {t('contract.startDate')}:
                        </span>
                        <span className="font-medium">{formatDate(contract.startDate)}</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b">
                        <span className="text-muted-foreground flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {t('contract.endDate')}:
                        </span>
                        <span className="font-medium">{formatDate(contract.endDate)}</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b">
                        <span className="text-muted-foreground flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          {t('contract.rentAmount')}:
                        </span>
                        <span className="font-medium text-lg text-primary">
                          ${contract.rentAmount?.toLocaleString()}
                        </span>
                      </div>
                      {contract.depositAmount && (
                        <div className="flex items-center justify-between pb-2 border-b">
                          <span className="text-muted-foreground">{t('contract.depositAmount')}:</span>
                          <span className="font-medium">${contract.depositAmount.toLocaleString()}</span>
                        </div>
                      )}
                      {contract.paymentFrequency && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{t('contract.paymentFrequency')}:</span>
                          <span className="font-medium">
                            {t(`contract.frequencies.${contract.paymentFrequency}`)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => navigate(`/contracts/${contract.id}`)}
                      variant="outline"
                      className="w-full"
                    >
                      {t('contract.contractDetails')} →
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {bills.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <CardTitle>{t('billing.myBills')}</CardTitle>
                      </div>
                      <Button
                        onClick={() => navigate('/billing/my-bills')}
                        variant="ghost"
                        size="sm"
                      >
                        {t('common.viewDetails')} →
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {bills.slice(0, 3).map((bill) => (
                        <div
                          key={bill.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/billing/${bill.id}`)}
                        >
                          <div>
                            <p className="font-medium">{bill.description || t('billing.billNumber')} #{bill.billNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              {t('billing.dueDate')}: {formatDate(bill.dueDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">${bill.amount?.toLocaleString()}</p>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                bill.status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : bill.status === 'overdue'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {t(`billing.statuses.${bill.status}`)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('common.actions')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => navigate('/billing/my-bills')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t('billing.myBills')}
                  </Button>
                  <Button
                    onClick={() => navigate('/tickets')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    {t('ticket.tickets')}
                  </Button>
                  <Button
                    onClick={() => navigate('/contracts')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {t('contract.contracts')}
                  </Button>
                  <Button
                    onClick={() => navigate('/permits')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {t('permit.myPermits')}
                  </Button>
                </CardContent>
              </Card>

              {property && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('contactModal.contactInfo')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">{t('property.propertyName')}</p>
                      <p className="font-medium">{property.name}</p>
                    </div>
                    {property.address && (
                      <div>
                        <p className="text-muted-foreground mb-1">{t('property.address')}</p>
                        <p className="font-medium">{property.address}</p>
                      </div>
                    )}
                    {property.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <a href={`tel:${property.phone}`} className="text-primary hover:underline">
                          {property.phone}
                        </a>
                      </div>
                    )}
                    {property.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <a href={`mailto:${property.email}`} className="text-primary hover:underline">
                          {property.email}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
