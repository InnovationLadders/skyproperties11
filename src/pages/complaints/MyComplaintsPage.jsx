import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { ComplaintDetailModal } from '../../components/complaints/ComplaintDetailModal';
import { getComplaintsByUserId } from '../../utils/complaintService';
import { useAuth } from '../../contexts/AuthContext';

export const MyComplaintsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadComplaints();
    }
  }, [user]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await getComplaintsByUserId(user.uid);
      setComplaints(data);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
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
    if (selectedComplaint) {
      const updated = complaints.find((c) => c.id === selectedComplaint.id);
      if (updated) setSelectedComplaint(updated);
    }
  };

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {t('complaint.myComplaintsTitle')}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {t('complaint.myComplaintsSubtitle')}
            </p>
          </div>
          <Button onClick={() => navigate('/submit-complaint')} className="gap-2">
            <Plus className="h-5 w-5" />
            {t('complaint.submitNew')}
          </Button>
        </div>

        {complaints.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {t('complaint.noComplaintsYet')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {t('complaint.noComplaintsYetMessage')}
            </p>
            <Button onClick={() => navigate('/submit-complaint')} className="gap-2">
              <Plus className="h-5 w-5" />
              {t('complaint.submitFirst')}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {complaints.map((complaint) => (
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
