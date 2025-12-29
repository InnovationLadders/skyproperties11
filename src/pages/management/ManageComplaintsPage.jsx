import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Search, Filter, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { ComplaintDetailModal } from '../../components/complaints/ComplaintDetailModal';
import { getAllComplaints, getComplaintsStats } from '../../utils/complaintService';
import { COMPLAINT_STATUS, COMPLAINT_TYPES, USER_ROLES } from '../../utils/constants';

export const ManageComplaintsPage = () => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (userProfile?.role !== USER_ROLES.ADMIN) {
      navigate('/dashboard');
      return;
    }
    loadComplaints();
    loadStats();
  }, [userProfile, navigate]);

  useEffect(() => {
    filterComplaints();
  }, [complaints, searchTerm, statusFilter, typeFilter]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllComplaints();
      console.log('Loaded complaints:', data.length);
      setComplaints(data);
    } catch (error) {
      console.error('Error loading complaints:', error);
      setError(t('complaint.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getComplaintsStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filterComplaints = () => {
    let filtered = [...complaints];

    if (searchTerm) {
      filtered = filtered.filter(
        (complaint) =>
          complaint.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((complaint) => complaint.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((complaint) => complaint.type === typeFilter);
    }

    setFilteredComplaints(filtered);
  };

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
  };

  const handleComplaintUpdate = () => {
    loadComplaints();
    loadStats();
    if (selectedComplaint) {
      const updated = complaints.find((c) => c.id === selectedComplaint.id);
      if (updated) setSelectedComplaint(updated);
    }
  };

  const statsCards = [
    {
      title: t('complaint.stats.total'),
      value: stats?.total || 0,
      icon: MessageSquare,
      color: 'bg-blue-500',
    },
    {
      title: t('complaint.stats.new'),
      value: stats?.new || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: t('complaint.stats.inProgress'),
      value: stats?.inProgress || 0,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: t('complaint.stats.resolved'),
      value: stats?.resolved || 0,
      icon: CheckCircle,
      color: 'bg-emerald-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t('complaint.manageComplaintsTitle')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t('complaint.manageComplaintsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {error && (
          <Card className="p-6 mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 dark:text-red-200 mb-3">{error}</p>
                <Button onClick={loadComplaints} variant="outline" size="sm">
                  {t('common.retry')}
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder={t('complaint.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="all">{t('complaint.filters.allStatuses')}</option>
                {Object.values(COMPLAINT_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {t(`complaint.status.${status.replace('_', '')}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="all">{t('complaint.filters.allTypes')}</option>
                {Object.values(COMPLAINT_TYPES).map((type) => (
                  <option key={type} value={type}>
                    {t(`complaint.types.${type}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {filteredComplaints.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {t('complaint.noComplaints')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t('complaint.noComplaintsMessage')}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onClick={() => handleComplaintClick(complaint)}
              />
            ))}
          </div>
        )}

        {selectedComplaint && (
          <ComplaintDetailModal
            complaint={selectedComplaint}
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onUpdate={handleComplaintUpdate}
          />
        )}
      </div>
    </div>
  );
};
