import { useTranslation } from 'react-i18next';
import { Search, Filter } from 'lucide-react';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { BUSINESS_CATEGORIES } from '../../utils/constants';

export const DirectoryFilters = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  properties = [],
  availableFloors = []
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-900">
          {t('publicDirectory.filters')}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="search">{t('publicDirectory.search')}</Label>
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('publicDirectory.searchPlaceholder')}
              className={isRTL ? 'pr-10' : 'pl-10'}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">{t('publicDirectory.category')}</Label>
          <select
            id="category"
            value={filters.businessCategory || 'all'}
            onChange={(e) => onFilterChange({ ...filters, businessCategory: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('publicDirectory.allCategories')}</option>
            {Object.values(BUSINESS_CATEGORIES).map(category => (
              <option key={category} value={category}>
                {t(`businessCategories.${category}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="property">{t('publicDirectory.property')}</Label>
          <select
            id="property"
            value={filters.propertyId || 'all'}
            onChange={(e) => onFilterChange({ ...filters, propertyId: e.target.value, floor: 'all' })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('publicDirectory.allProperties')}</option>
            {properties.map(property => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="floor">{t('publicDirectory.floor')}</Label>
          <select
            id="floor"
            value={filters.floor || 'all'}
            onChange={(e) => onFilterChange({ ...filters, floor: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!filters.propertyId || filters.propertyId === 'all'}
          >
            <option value="all">{t('publicDirectory.allFloors')}</option>
            {availableFloors.map(floor => (
              <option key={floor} value={floor}>
                {t('common.floor')} {floor}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
