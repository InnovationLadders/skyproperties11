import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Building2, User, CheckCircle } from 'lucide-react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../utils/constants';

export const PropertyManagerAssignment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [properties, setProperties] = useState([]);
  const [propertyManagers, setPropertyManagers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (userProfile?.role !== USER_ROLES.ADMIN) {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [userProfile]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propertiesSnapshot, managersSnapshot] = await Promise.all([
        getDocs(collection(db, 'properties')),
        getDocs(query(collection(db, 'users'), where('role', '==', USER_ROLES.PROPERTY_MANAGER))),
      ]);

      const propertiesData = propertiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const managersData = managersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProperties(propertiesData);
      setPropertyManagers(managersData);

      const initialAssignments = {};
      propertiesData.forEach(property => {
        initialAssignments[property.id] = property.managerId || '';
      });
      setAssignments(initialAssignments);

      console.log('[PropertyManagerAssignment] Loaded:', {
        properties: propertiesData.length,
        managers: managersData.length,
      });
    } catch (error) {
      console.error('[PropertyManagerAssignment] Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentChange = (propertyId, managerId) => {
    setAssignments(prev => ({
      ...prev,
      [propertyId]: managerId,
    }));
    setSuccessMessage('');
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSuccessMessage('');

    try {
      const updates = Object.entries(assignments).map(([propertyId, managerId]) => {
        const propertyRef = doc(db, 'properties', propertyId);
        return updateDoc(propertyRef, { managerId: managerId || null });
      });

      await Promise.all(updates);

      console.log('[PropertyManagerAssignment] Updated all property assignments');
      setSuccessMessage('All property manager assignments saved successfully!');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('[PropertyManagerAssignment] Error saving assignments:', error);
      alert('Failed to save assignments. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getManagerName = (managerId) => {
    if (!managerId) return 'Unassigned';
    const manager = propertyManagers.find(m => m.id === managerId);
    return manager ? (manager.displayName || manager.email) : 'Unknown Manager';
  };

  const getAssignedPropertiesCount = (managerId) => {
    return Object.values(assignments).filter(id => id === managerId).length;
  };

  if (userProfile?.role !== USER_ROLES.ADMIN) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/properties')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Property Manager Assignment</h1>
          <p className="text-muted-foreground">
            Assign property managers to properties
          </p>
        </div>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800"
          >
            <CheckCircle className="h-5 w-5" />
            {successMessage}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Property Managers</CardTitle>
              <CardDescription>Available managers</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : propertyManagers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No property managers found</p>
              ) : (
                <div className="space-y-2">
                  {propertyManagers.map(manager => (
                    <div
                      key={manager.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">
                            {manager.displayName || manager.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getAssignedPropertiesCount(manager.id)} properties
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Property Assignments</CardTitle>
              <CardDescription>Assign managers to properties</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <p className="text-sm text-muted-foreground">No properties found</p>
              ) : (
                <div className="space-y-4">
                  {properties.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:border-primary transition-colors"
                    >
                      <Building2 className="h-8 w-8 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{property.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {property.address}
                        </p>
                      </div>
                      <div className="w-64">
                        <select
                          value={assignments[property.id] || ''}
                          onChange={(e) => handleAssignmentChange(property.id, e.target.value)}
                          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                        >
                          <option value="">Unassigned</option>
                          {propertyManagers.map(manager => (
                            <option key={manager.id} value={manager.id}>
                              {manager.displayName || manager.email}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {!loading && properties.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSaveAll}
                    disabled={saving}
                    size="lg"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save All Assignments'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Assign property managers to each property using the dropdown menus</li>
              <li>Property managers will only see and manage their assigned properties</li>
              <li>Admins continue to have access to all properties</li>
              <li>Click "Save All Assignments" to apply the changes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
