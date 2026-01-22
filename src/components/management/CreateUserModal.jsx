import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Mail, Lock, User, Phone, Shield, Building2, Home, CheckSquare } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { createUser } from '../../utils/userService';
import { USER_ROLES, UNIT_STATUS } from '../../utils/constants';

const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    phoneNumber: '',
    role: USER_ROLES.TENANT,
    propertyId: '',
    unitId: '',
    selectedProperties: []
  });

  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProperties();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.propertyId && needsUnitSelection(formData.role)) {
      fetchUnits(formData.propertyId);
    } else {
      setUnits([]);
      setFormData(prev => ({ ...prev, unitId: '' }));
    }
  }, [formData.propertyId, formData.role]);

  useEffect(() => {
    if (formData.role) {
      setFormData(prev => ({
        ...prev,
        propertyId: '',
        unitId: '',
        selectedProperties: []
      }));
      setUnits([]);
    }
  }, [formData.role]);

  const fetchProperties = async () => {
    try {
      setLoadingData(true);
      const propertiesSnapshot = await getDocs(collection(db, 'properties'));
      const propertiesData = propertiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProperties(propertiesData);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchUnits = async (propertyId) => {
    try {
      setLoadingData(true);
      const unitsRef = collection(db, 'units');
      const unitsQuery = query(unitsRef, where('propertyId', '==', propertyId));
      const unitsSnapshot = await getDocs(unitsQuery);
      const unitsData = unitsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUnits(unitsData);
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const needsPropertySelection = (role) => {
    return role === USER_ROLES.PROPERTY_MANAGER || role === USER_ROLES.SERVICE_PROVIDER;
  };

  const needsUnitSelection = (role) => {
    return role === USER_ROLES.UNIT_OWNER || role === USER_ROLES.TENANT;
  };

  const allowsMultipleProperties = (role) => {
    return role === USER_ROLES.PROPERTY_MANAGER || role === USER_ROLES.SERVICE_PROVIDER;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handlePropertyToggle = (propertyId) => {
    setFormData(prev => {
      const isSelected = prev.selectedProperties.includes(propertyId);
      return {
        ...prev,
        selectedProperties: isSelected
          ? prev.selectedProperties.filter(id => id !== propertyId)
          : [...prev.selectedProperties, propertyId]
      };
    });
  };

  const getAvailableUnits = () => {
    if (formData.role === USER_ROLES.UNIT_OWNER) {
      return units.filter(unit =>
        unit.status === UNIT_STATUS.AVAILABLE ||
        unit.status === UNIT_STATUS.RESERVED
      );
    } else if (formData.role === USER_ROLES.TENANT) {
      return units.filter(unit =>
        unit.status === UNIT_STATUS.AVAILABLE &&
        unit.listingType === 'rent'
      );
    }
    return units;
  };

  const getUnitStatusColor = (status) => {
    switch (status) {
      case UNIT_STATUS.AVAILABLE:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case UNIT_STATUS.RESERVED:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case UNIT_STATUS.SOLD:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case UNIT_STATUS.RENTED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const validateForm = () => {
    if (!formData.email) {
      setError(t('user.emailRequired'));
      return false;
    }

    if (!formData.email.includes('@')) {
      setError(t('user.invalidEmail'));
      return false;
    }

    if (!formData.password) {
      setError(t('user.passwordRequired'));
      return false;
    }

    if (formData.password.length < 8) {
      setError(t('user.passwordTooShort'));
      return false;
    }

    if (!formData.displayName) {
      setError(t('user.displayNameRequired'));
      return false;
    }

    if (!formData.role) {
      setError(t('user.roleRequired'));
      return false;
    }

    if (allowsMultipleProperties(formData.role) && formData.selectedProperties.length === 0) {
      setError(t('user.propertySelectionRequired'));
      return false;
    }

    if (needsUnitSelection(formData.role)) {
      if (!formData.propertyId) {
        setError(t('user.propertyRequired'));
        return false;
      }
      if (!formData.unitId) {
        setError(t('user.unitRequired'));
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      await createUser(formData);

      alert(t('user.createSuccess'));
      setFormData({
        email: '',
        password: '',
        displayName: '',
        phoneNumber: '',
        role: USER_ROLES.TENANT,
        propertyId: '',
        unitId: '',
        selectedProperties: []
      });
      onUserCreated();
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError(t('user.emailAlreadyExists'));
      } else if (error.code === 'auth/weak-password') {
        setError(t('user.weakPassword'));
      } else {
        setError(error.message || t('user.createError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case USER_ROLES.PROPERTY_MANAGER:
        return t('user.propertyManagerDescription');
      case USER_ROLES.UNIT_OWNER:
        return t('user.unitOwnerDescription');
      case USER_ROLES.TENANT:
        return t('user.tenantDescription');
      case USER_ROLES.SERVICE_PROVIDER:
        return t('user.serviceProviderDescription');
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  const availableUnits = getAvailableUnits();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('user.createUser')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <Label htmlFor="email" required>
              <Mail className="w-4 h-4 inline mr-2" />
              {t('user.email')}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('user.emailPlaceholder')}
              required
            />
          </div>

          <div>
            <Label htmlFor="password" required>
              <Lock className="w-4 h-4 inline mr-2" />
              {t('user.password')}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('user.passwordPlaceholder')}
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('user.passwordHint')}
            </p>
          </div>

          <div>
            <Label htmlFor="displayName" required>
              <User className="w-4 h-4 inline mr-2" />
              {t('user.displayName')}
            </Label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleChange}
              placeholder={t('user.displayNamePlaceholder')}
              required
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">
              <Phone className="w-4 h-4 inline mr-2" />
              {t('user.phoneNumber')}
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder={t('user.phoneNumberPlaceholder')}
            />
          </div>

          <div>
            <Label htmlFor="role" required>
              <Shield className="w-4 h-4 inline mr-2" />
              {t('user.role')}
            </Label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            >
              <option value={USER_ROLES.ADMIN}>{t('user.roles.admin')}</option>
              <option value={USER_ROLES.PROPERTY_MANAGER}>{t('user.roles.propertyManager')}</option>
              <option value={USER_ROLES.UNIT_OWNER}>{t('user.roles.unitOwner')}</option>
              <option value={USER_ROLES.TENANT}>{t('user.roles.tenant')}</option>
              <option value={USER_ROLES.SERVICE_PROVIDER}>{t('user.roles.serviceProvider')}</option>
            </select>
            {getRoleDescription(formData.role) && (
              <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                {getRoleDescription(formData.role)}
              </p>
            )}
          </div>

          {allowsMultipleProperties(formData.role) && (
            <div className="border-t pt-4">
              <Label required>
                <Building2 className="w-4 h-4 inline mr-2" />
                {t('user.selectProperties')}
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {t('user.selectPropertiesHint')}
              </p>
              {loadingData ? (
                <div className="text-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500">
                  {t('user.noPropertiesAvailable')}
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                  {properties.map(property => (
                    <label
                      key={property.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedProperties.includes(property.id)}
                        onChange={() => handlePropertyToggle(property.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {property.name}
                        </div>
                        {property.location && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {property.location}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {formData.selectedProperties.length > 0 && (
                <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                  {t('user.propertiesSelected', { count: formData.selectedProperties.length })}
                </p>
              )}
            </div>
          )}

          {needsUnitSelection(formData.role) && (
            <div className="border-t pt-4 space-y-4">
              <div>
                <Label htmlFor="propertyId" required>
                  <Building2 className="w-4 h-4 inline mr-2" />
                  {t('user.selectProperty')}
                </Label>
                <select
                  id="propertyId"
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="">{t('user.chooseProperty')}</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.name} {property.location && `- ${property.location}`}
                    </option>
                  ))}
                </select>
              </div>

              {formData.propertyId && (
                <div>
                  <Label htmlFor="unitId" required>
                    <Home className="w-4 h-4 inline mr-2" />
                    {t('user.selectUnit')}
                  </Label>
                  {loadingData ? (
                    <div className="text-center py-4">
                      <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  ) : availableUnits.length === 0 ? (
                    <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      {t('user.noUnitsAvailable')}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                      {availableUnits.map(unit => (
                        <label
                          key={unit.id}
                          className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer border border-transparent hover:border-blue-300 dark:hover:border-blue-600"
                        >
                          <input
                            type="radio"
                            name="unitId"
                            value={unit.id}
                            checked={formData.unitId === unit.id}
                            onChange={handleChange}
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {unit.unitNumber}
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded ${getUnitStatusColor(unit.status)}`}>
                                {t(`unit.${unit.status}`)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {t('unit.floor')}: {unit.floor} • {unit.size} {t('unit.sqm')} • ${unit.price?.toLocaleString()}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || loadingData}
            >
              {loading ? t('common.creating') : t('user.createUser')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
