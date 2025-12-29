import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, User, Mail, Phone, Calendar, MessageSquare, Send } from 'lucide-react';
import { ComplaintStatusBadge } from './ComplaintStatusBadge';
import { ComplaintPriorityBadge } from './ComplaintPriorityBadge';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { updateComplaintStatus, updateComplaintPriority, addComplaintResponse } from '../../utils/complaintService';
import { COMPLAINT_STATUS, COMPLAINT_PRIORITY } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../utils/constants';

export const ComplaintDetailModal = ({ complaint, isOpen, onClose, onUpdate }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return format(dateObj, 'PPp', { locale: isRTL ? ar : undefined });
  };

  const getTypeLabel = (type) => {
    return t(`complaint.types.${type}`);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateComplaintStatus(complaint.id, newStatus);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      await updateComplaintPriority(complaint.id, newPriority);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const handleAddResponse = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) return;

    setIsSubmitting(true);
    try {
      await addComplaintResponse(complaint.id, {
        text: responseText,
        userName: user?.name || 'Admin',
        userId: user?.uid,
      });
      setResponseText('');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error adding response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
                {complaint.referenceNumber}
              </span>
              <ComplaintStatusBadge status={complaint.status} />
              {complaint.priority && (
                <ComplaintPriorityBadge priority={complaint.priority} />
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {complaint.subject}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <User className="h-4 w-4" />
              <span className="font-medium">{t('complaint.name')}:</span>
              <span>{complaint.name}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Mail className="h-4 w-4" />
              <span className="font-medium">{t('complaint.email')}:</span>
              <span>{complaint.email}</span>
            </div>
            {complaint.phone && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Phone className="h-4 w-4" />
                <span className="font-medium">{t('complaint.phone')}:</span>
                <span dir="ltr">{complaint.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{t('complaint.submittedAt')}:</span>
              <span>{formatDate(complaint.createdAt)}</span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2">
              {t('complaint.type')}
            </Label>
            <p className="text-slate-700 dark:text-slate-300">
              {getTypeLabel(complaint.type)}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2">
              {t('complaint.description')}
            </Label>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2">
                  {t('complaint.changeStatus')}
                </Label>
                <select
                  value={complaint.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  {Object.values(COMPLAINT_STATUS).map((status) => (
                    <option key={status} value={status}>
                      {t(`complaint.status.${status.replace('_', '')}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2">
                  {t('complaint.changePriority')}
                </Label>
                <select
                  value={complaint.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  {Object.values(COMPLAINT_PRIORITY).map((priority) => (
                    <option key={priority} value={priority}>
                      {t(`complaint.priority.${priority}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {t('complaint.responsesTitle')}
              </h3>
            </div>

            {complaint.responses && complaint.responses.length > 0 ? (
              <div className="space-y-4 mb-4">
                {complaint.responses.map((response, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {response.userName}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {format(new Date(response.timestamp), 'PPp', {
                          locale: isRTL ? ar : undefined,
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {response.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {t('complaint.noResponses')}
              </p>
            )}

            {isAdmin && (
              <form onSubmit={handleAddResponse} className="space-y-3">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder={t('complaint.addResponsePlaceholder')}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 min-h-[100px] resize-y"
                  disabled={isSubmitting}
                />
                <Button type="submit" disabled={isSubmitting || !responseText.trim()}>
                  <Send className="h-4 w-4" />
                  {t('complaint.submitResponse')}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
