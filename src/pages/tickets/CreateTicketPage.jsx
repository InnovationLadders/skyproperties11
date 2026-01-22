import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, setDoc, serverTimestamp, collection, getDocs, query, where, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ArrowLeft, Save, Building2, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { TICKET_STATUS, USER_ROLES } from '../../utils/constants';
import { getManagedPropertyIds, getUserUnitIds } from '../../utils/permissionsService';
import { notifyTicketCreated } from '../../utils/internalNotificationsService';

export const CreateTicketPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [availablePropertyIds, setAvailablePropertyIds] = useState([]);
  const [userUnits, setUserUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isTenant, setIsTenant] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyId: '',
    unitNumber: '',
    unitId: '',
    category: 'general',
    priority: 'medium',
    status: TICKET_STATUS.OPEN,
  });
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const role = userProfile?.role;
      setIsTenant(role === USER_ROLES.TENANT);

      let allowedPropertyIds = [];
      let propertiesData = [];

      if (role === USER_ROLES.ADMIN) {
        const snapshot = await getDocs(collection(db, 'properties'));
        propertiesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        allowedPropertyIds = propertiesData.map(p => p.id);
        setProperties(propertiesData);
        setAvailablePropertyIds(allowedPropertyIds);
      } else if (role === USER_ROLES.PROPERTY_MANAGER) {
        const managedIds = await getManagedPropertyIds(currentUser.uid);

        if (managedIds.length === 0) {
          setError(t('ticket.noManagedProperties') || 'You do not manage any properties. Please contact the administrator.');
          return;
        }

        const snapshot = await getDocs(collection(db, 'properties'));
        propertiesData = snapshot.docs
          .filter(doc => managedIds.includes(doc.id))
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        allowedPropertyIds = managedIds;
        setProperties(propertiesData);
        setAvailablePropertyIds(allowedPropertyIds);
      } else if (role === USER_ROLES.TENANT) {
        await fetchTenantUnits();
      } else if (role === USER_ROLES.UNIT_OWNER) {
        await fetchOwnerUnits();
      } else {
        setError(t('ticket.noPermission') || 'You do not have permission to create tickets.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(t('ticket.fetchPropertiesError') || 'Failed to load data. Please try again.');
    }
  };

  const fetchTenantUnits = async () => {
    try {
      const unitsQuery = query(
        collection(db, 'units'),
        where('tenantId', '==', currentUser.uid)
      );
      const unitsSnapshot = await getDocs(unitsQuery);

      if (unitsSnapshot.empty) {
        setError(t('ticket.noUnitsAssigned') || 'You do not have any units assigned. Please contact the administrator.');
        return;
      }

      const units = unitsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUserUnits(units);

      const propertyIds = [...new Set(units.map(unit => unit.propertyId).filter(Boolean))];
      const propertiesSnapshot = await getDocs(collection(db, 'properties'));
      const propertiesData = propertiesSnapshot.docs
        .filter(doc => propertyIds.includes(doc.id))
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setProperties(propertiesData);
      setAvailablePropertyIds(propertyIds);

      if (units.length === 1) {
        const unit = units[0];
        const property = propertiesData.find(p => p.id === unit.propertyId);
        setSelectedUnit(unit);
        setFormData(prev => ({
          ...prev,
          propertyId: unit.propertyId || '',
          unitNumber: unit.unitNumber || '',
          unitId: unit.id || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching tenant units:', error);
      setError(t('ticket.fetchPropertiesError') || 'Failed to load your units. Please try again.');
    }
  };

  const fetchOwnerUnits = async () => {
    try {
      const unitIds = await getUserUnitIds(currentUser.uid);

      if (unitIds.length === 0) {
        setError(t('ticket.noUnitsAssigned') || 'You do not have any units assigned. Please contact the administrator.');
        return;
      }

      const unitsSnapshot = await getDocs(collection(db, 'units'));
      const units = unitsSnapshot.docs
        .filter(doc => unitIds.includes(doc.id))
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

      setUserUnits(units);

      const propertyIds = [...new Set(units.map(unit => unit.propertyId).filter(Boolean))];

      if (propertyIds.length === 0) {
        setError(t('ticket.noPropertiesForUnits') || 'Your units are not associated with any properties.');
        return;
      }

      const propertiesSnapshot = await getDocs(collection(db, 'properties'));
      const propertiesData = propertiesSnapshot.docs
        .filter(doc => propertyIds.includes(doc.id))
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setProperties(propertiesData);
      setAvailablePropertyIds(propertyIds);
    } catch (error) {
      console.error('Error fetching owner units:', error);
      setError(t('ticket.fetchPropertiesError') || 'Failed to load your units. Please try again.');
    }
  };

  const handleUnitChange = (e) => {
    const unitId = e.target.value;
    const unit = userUnits.find(u => u.id === unitId);

    if (unit) {
      setSelectedUnit(unit);
      setFormData(prev => ({
        ...prev,
        propertyId: unit.propertyId || '',
        unitNumber: unit.unitNumber || '',
        unitId: unit.id || '',
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.propertyId) {
      setError(t('ticket.propertyRequired') || 'Please select a property');
      return;
    }

    if (!availablePropertyIds.includes(formData.propertyId)) {
      setError(t('ticket.unauthorizedProperty') || 'You do not have permission to create tickets for this property');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = '';

      if (imageFile) {
        const imageRef = ref(storage, `tickets/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const newDocRef = doc(collection(db, 'tickets'));
      const ticketData = {
        ...formData,
        imageUrl,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(newDocRef, ticketData);

      console.log('[CreateTicketPage] Ticket created successfully, now sending notifications');
      console.log('[CreateTicketPage] Ticket ID:', newDocRef.id);
      console.log('[CreateTicketPage] Property ID:', formData.propertyId);

      const creatorName = userProfile?.name || userProfile?.email || 'Unknown User';

      await notifyTicketCreated(
        {
          id: newDocRef.id,
          ...formData,
          imageUrl,
          createdBy: currentUser.uid,
        },
        creatorName
      );

      console.log('[CreateTicketPage] Notification sent successfully');

      navigate('/tickets');
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError(t('ticket.createError') || 'Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.name || t('unit.unknownProperty');
  };

  const renderPropertyAndUnitFields = () => {
    if (isTenant && userUnits.length === 1 && selectedUnit) {
      return (
        <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 font-medium">
            <Building2 className="h-5 w-5" />
            <span>{t('ticket.ticketWillBeCreatedFor')}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">{t('property.propertyName')}</Label>
              <div className="mt-1 px-3 py-2 bg-white border border-input rounded-md text-sm font-medium">
                {getPropertyName(selectedUnit.propertyId)}
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">{t('unit.unitNumber')}</Label>
              <div className="mt-1 px-3 py-2 bg-white border border-input rounded-md text-sm font-medium">
                {selectedUnit.unitNumber || t('unit.na')}
                {selectedUnit.floor && ` - ${t('unit.floor')} ${selectedUnit.floor}`}
              </div>
            </div>
          </div>
          {selectedUnit.type && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{t('unit.type')}:</span> {t(`unit.${selectedUnit.type}`)}
            </div>
          )}
        </div>
      );
    }

    if (isTenant && userUnits.length > 1) {
      return (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>{t('ticket.selectUnitForTicket')}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitSelect">{t('unit.selectUnit')} *</Label>
            <select
              id="unitSelect"
              value={selectedUnit?.id || ''}
              onChange={handleUnitChange}
              required
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="">{t('unit.selectUnit')}</option>
              {userUnits.map((unit) => {
                const propertyName = getPropertyName(unit.propertyId);
                return (
                  <option key={unit.id} value={unit.id}>
                    {propertyName} - {unit.unitNumber}
                    {unit.floor ? ` - ${t('unit.floor')} ${unit.floor}` : ''}
                    {unit.type ? ` (${t(`unit.${unit.type}`)})` : ''}
                  </option>
                );
              })}
            </select>
          </div>
          {selectedUnit && (
            <div className="p-3 bg-gray-50 border rounded-lg">
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-muted-foreground">{t('property.propertyName')}:</span>{' '}
                  <span className="font-medium">{getPropertyName(selectedUnit.propertyId)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('unit.unitNumber')}:</span>{' '}
                  <span className="font-medium">{selectedUnit.unitNumber}</span>
                </div>
                {selectedUnit.floor && (
                  <div>
                    <span className="text-muted-foreground">{t('unit.floor')}:</span>{' '}
                    <span className="font-medium">{selectedUnit.floor}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="propertyId">{t('property.propertyName')} *</Label>
          <select
            id="propertyId"
            name="propertyId"
            value={formData.propertyId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="">{t('ticket.selectProperty')}</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitNumber">{t('unit.unitNumber')}</Label>
          <Input
            id="unitNumber"
            name="unitNumber"
            value={formData.unitNumber}
            onChange={handleChange}
            placeholder={t('ticket.unitNumberPlaceholder')}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/tickets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('ticket.backToTickets')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('ticket.createMaintenance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">{t('ticket.ticketTitle')} *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder={t('ticket.briefDescription')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('ticket.description')} *</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full min-h-[120px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                  placeholder={t('ticket.detailedDescription')}
                />
              </div>

              {renderPropertyAndUnitFields()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">{t('ticket.category')} *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="general">{t('ticket.categories.general')}</option>
                    <option value="plumbing">{t('ticket.categories.plumbing')}</option>
                    <option value="electrical">{t('ticket.categories.electrical')}</option>
                    <option value="hvac">{t('ticket.categories.hvac')}</option>
                    <option value="appliance">{t('ticket.categories.appliance')}</option>
                    <option value="structural">{t('ticket.categories.structural')}</option>
                    <option value="other">{t('ticket.categories.other')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">{t('ticket.priority')} *</Label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="low">{t('ticket.priorities.low')}</option>
                    <option value="medium">{t('ticket.priorities.medium')}</option>
                    <option value="high">{t('ticket.priorities.high')}</option>
                    <option value="urgent">{t('ticket.priorities.urgent')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">{t('ticket.attachImage')}</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                <p className="text-sm text-muted-foreground">
                  {t('ticket.uploadPhoto')}
                </p>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? t('ticket.creating') : t('ticket.createTicket')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/tickets')}
                  disabled={loading}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
