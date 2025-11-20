import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Filter, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { PermitCard } from '../../components/permits/PermitCard';
import { useAuth } from '../../contexts/AuthContext';
import { getUserPermits } from '../../utils/permitsService';
import { PERMIT_STATUS } from '../../utils/constants';

const MyPermitsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [permits, setPermits] = useState([]);
  const [filteredPermits, setFilteredPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (userProfile) {
      fetchPermits();
    }
  }, [userProfile]);

  useEffect(() => {
    filterPermits();
  }, [permits, searchTerm, statusFilter]);

  const fetchPermits = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPermits = await getUserPermits(userProfile.uid);
      setPermits(fetchedPermits);
    } catch (error) {
      console.error('Error fetching permits:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const filterPermits = () => {
    let filtered = [...permits];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (permit) =>
          permit.propertyName?.toLowerCase().includes(search) ||
          permit.unitNumber?.toLowerCase().includes(search) ||
          permit.purpose?.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((permit) => permit.status === statusFilter);
    }

    setFilteredPermits(filtered);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8" />
            {t('permit.myPermits')}
          </h1>
          <p className="text-gray-600 mt-2">{t('permit.viewMyPermits')}</p>
        </div>
        <Button onClick={() => navigate('/permits/request')}>
          <Plus className="w-5 h-5 mr-2" />
          {t('permit.requestPermit')}
        </Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder={t('permit.searchPermits')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">{t('permit.allStatuses')}</option>
          <option value={PERMIT_STATUS.PENDING}>{t('permit.statuses.pending')}</option>
          <option value={PERMIT_STATUS.APPROVED}>{t('permit.statuses.approved')}</option>
          <option value={PERMIT_STATUS.REJECTED}>{t('permit.statuses.rejected')}</option>
          <option value={PERMIT_STATUS.EXPIRED}>{t('permit.statuses.expired')}</option>
          <option value={PERMIT_STATUS.REVOKED}>{t('permit.statuses.revoked')}</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">{t('permit.loadingPermits')}</p>
          </div>
        </div>
      ) : error ? (
        <Card>
          <div className="p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('permit.errorLoadingPermits')}
            </h3>
            <p className="text-gray-600 mb-6">
              {error.code === 'failed-precondition' && error.message.includes('index')
                ? t('permit.indexMissingMessage')
                : t('permit.errorTryAgain')}
            </p>
            {error.code === 'failed-precondition' && error.message.includes('index') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-right">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>{t('permit.indexSetupRequired')}</strong>
                </p>
                <p className="text-xs text-yellow-700 mb-3">
                  {t('permit.indexInstructions')}
                </p>
                {error.message.match(/https:\/\/[^\s]+/) && (
                  <a
                    href={error.message.match(/https:\/\/[^\s]+/)[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    {t('permit.createIndexLink')}
                  </a>
                )}
              </div>
            )}
            <Button onClick={fetchPermits} variant="outline">
              {t('common.retry')}
            </Button>
          </div>
        </Card>
      ) : filteredPermits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPermits.map((permit) => (
            <PermitCard key={permit.id} permit={permit} />
          ))}
        </div>
      ) : (
        <Card>
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('permit.noPermitsFound')}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? t('unit.tryAdjustingFilters')
                : t('permit.getStartedPermit')}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => navigate('/permits/request')}>
                <Plus className="w-5 h-5 mr-2" />
                {t('permit.requestPermit')}
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MyPermitsPage;
