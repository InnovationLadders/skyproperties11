import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Filter, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ContactRequestCard } from '../../components/contacts/ContactRequestCard';
import { ContactRequestDetailModal } from '../../components/contacts/ContactRequestDetailModal';
import { getAllContactRequestsAndInquiries } from '../../utils/contactRequestService';
import { CONTACT_REQUEST_STATUS, USER_ROLES } from '../../utils/constants';

export const ContactRequestsPage = () => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (userProfile?.role !== USER_ROLES.ADMIN) {
      navigate('/dashboard');
      return;
    }
    fetchRequests();
  }, [userProfile, navigate]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
      const data = await getAllContactRequestsAndInquiries(filters);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching contact requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleUpdate = () => {
    fetchRequests();
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
  };

  useEffect(() => {
    if (userProfile?.role === USER_ROLES.ADMIN) {
      fetchRequests();
    }
  }, [statusFilter]);

  const stats = {
    total: requests.length,
    new: requests.filter(r => r.status === CONTACT_REQUEST_STATUS.NEW).length,
    read: requests.filter(r => r.status === CONTACT_REQUEST_STATUS.READ).length,
    responded: requests.filter(r => r.status === CONTACT_REQUEST_STATUS.RESPONDED).length,
    closed: requests.filter(r => r.status === CONTACT_REQUEST_STATUS.CLOSED).length,
  };

  if (userProfile?.role !== USER_ROLES.ADMIN) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <MessageSquare className="w-8 h-8 mr-3" />
                {t('contactRequest.contactRequests')}
              </h1>
              <p className="text-muted-foreground">
                {t('contactRequest.manageAllRequests')}
              </p>
            </div>
            <Button onClick={fetchRequests} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">{t('contactRequest.totalRequests')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
                <div className="text-sm text-muted-foreground">{t('contactRequest.newRequests')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.read}</div>
                <div className="text-sm text-muted-foreground">{t('contactRequest.readRequests')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.responded}</div>
                <div className="text-sm text-muted-foreground">{t('contactRequest.respondedRequests')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
                <div className="text-sm text-muted-foreground">{t('contactRequest.closedRequests')}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Filter className="w-5 h-5 mr-2" />
                {t('common.filter')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('all')}
                >
                  {t('common.all')}
                </Button>
                <Button
                  variant={statusFilter === CONTACT_REQUEST_STATUS.NEW ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange(CONTACT_REQUEST_STATUS.NEW)}
                >
                  {t('contactRequest.statusNew')}
                </Button>
                <Button
                  variant={statusFilter === CONTACT_REQUEST_STATUS.READ ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange(CONTACT_REQUEST_STATUS.READ)}
                >
                  {t('contactRequest.statusRead')}
                </Button>
                <Button
                  variant={statusFilter === CONTACT_REQUEST_STATUS.RESPONDED ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange(CONTACT_REQUEST_STATUS.RESPONDED)}
                >
                  {t('contactRequest.statusResponded')}
                </Button>
                <Button
                  variant={statusFilter === CONTACT_REQUEST_STATUS.CLOSED ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange(CONTACT_REQUEST_STATUS.CLOSED)}
                >
                  {t('contactRequest.statusClosed')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('contactRequest.noRequests')}</h3>
              <p className="text-muted-foreground">
                {t('contactRequest.noRequestsDescription')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <ContactRequestCard
                key={request.id}
                request={request}
                onClick={handleRequestClick}
              />
            ))}
          </div>
        )}

        <ContactRequestDetailModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          request={selectedRequest}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
};

export default ContactRequestsPage;
