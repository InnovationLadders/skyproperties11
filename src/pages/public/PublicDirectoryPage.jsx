import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Building2, Loader2 } from 'lucide-react';
import { getPublicUnits, getAllPropertiesForFilter, getAvailableFloorsForProperty } from '../../utils/publicDirectoryService';
import { BusinessUnitCard } from '../../components/directory/BusinessUnitCard';
import { DirectoryFilters } from '../../components/directory/DirectoryFilters';

export default function PublicDirectoryPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    businessCategory: 'all',
    propertyId: 'all',
    floor: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const propertyIdFromUrl = searchParams.get('propertyId');
    if (propertyIdFromUrl && properties.length > 0) {
      setFilters(prev => ({
        ...prev,
        propertyId: propertyIdFromUrl
      }));
    }
  }, [searchParams, properties]);

  useEffect(() => {
    filterUnits();
  }, [searchTerm, filters, units]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [unitsData, propertiesData] = await Promise.all([
        getPublicUnits(),
        getAllPropertiesForFilter()
      ]);

      setUnits(unitsData);
      setFilteredUnits(unitsData);
      setProperties(propertiesData);
    } catch (err) {
      console.error('Error loading public directory:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterUnits = () => {
    let result = [...units];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(unit =>
        unit.businessName?.toLowerCase().includes(searchLower) ||
        unit.businessDescription?.toLowerCase().includes(searchLower) ||
        unit.unitNumber?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.businessCategory && filters.businessCategory !== 'all') {
      result = result.filter(unit => unit.businessCategory === filters.businessCategory);
    }

    if (filters.propertyId && filters.propertyId !== 'all') {
      result = result.filter(unit => unit.propertyId === filters.propertyId);
    }

    if (filters.floor && filters.floor !== 'all') {
      result = result.filter(unit => unit.floor === parseInt(filters.floor));
    }

    setFilteredUnits(result);
  };

  const availableFloors = getAvailableFloorsForProperty(units, filters.propertyId);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Building2 className="w-12 h-12" />
            <h1 className="text-4xl font-bold">{t('publicDirectory.title')}</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-2xl">
            {t('publicDirectory.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <DirectoryFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFilterChange={setFilters}
          properties={properties}
          availableFloors={availableFloors}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <p className="text-slate-600">
            {t('publicDirectory.resultsCount', { count: filteredUnits.length })}
          </p>
        </div>

        {filteredUnits.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {t('publicDirectory.noResults')}
            </h3>
            <p className="text-slate-600">
              {t('publicDirectory.noResultsDescription')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUnits.map(unit => (
              <BusinessUnitCard key={unit.id} unit={unit} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
