import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Mail, Phone, Building2, Calendar, User, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { ContactRequestStatusBadge } from './ContactRequestStatusBadge';
import { updateRequestStatus } from '../../utils/contactRequestService';
import { CONTACT_REQUEST_STATUS } from '../../utils/constants';
import { format } from 'date-fns';

export const ContactRequestDetailModal = ({ isOpen, onClose, request, onUpdate }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  if (!isOpen || !request) return null;

  const formatDate = (date) => {
    if (!date) return '';
    try {
      if (date.toDate) {
        return format(date.toDate(), 'dd/MM/yyyy HH:mm');
      }
      return format(new Date(date), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return '';
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      await updateRequestStatus(request.id, newStatus, request.source);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      alert(t('contactRequest.updateError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('contactRequest.requestDetails')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <ContactRequestStatusBadge status={request.status} />
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(request.createdAt)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <User className="w-4 h-4 mr-2" />
                {t('contactRequest.name')}
              </label>
              <p className="text-gray-900">{request.name}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {t('contactRequest.email')}
              </label>
              <p className="text-gray-900">{request.email}</p>
            </div>

            {(request.phoneNumber || request.phone) && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {t('contactRequest.phoneNumber')}
                </label>
                <p className="text-gray-900">{request.phoneNumber || request.phone}</p>
              </div>
            )}

            {request.propertyName && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  {t('property.property')}
                </label>
                <p className="text-gray-900">
                  {request.propertyName}
                  {request.unitNumber && ` - ${t('unit.unitNumber')}: ${request.unitNumber}`}
                </p>
              </div>
            )}
          </div>

          {request.message && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                {t('contactRequest.message')}
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{request.message}</p>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              {t('contactRequest.changeStatus')}
            </label>
            <div className="flex flex-wrap gap-2">
              {request.status !== CONTACT_REQUEST_STATUS.READ && (
                <Button
                  onClick={() => handleStatusChange(CONTACT_REQUEST_STATUS.READ)}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  {t('contactRequest.markAsRead')}
                </Button>
              )}
              {request.status !== CONTACT_REQUEST_STATUS.RESPONDED && (
                <Button
                  onClick={() => handleStatusChange(CONTACT_REQUEST_STATUS.RESPONDED)}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  {t('contactRequest.markAsResponded')}
                </Button>
              )}
              {request.status !== CONTACT_REQUEST_STATUS.CLOSED && (
                <Button
                  onClick={() => handleStatusChange(CONTACT_REQUEST_STATUS.CLOSED)}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  {t('contactRequest.markAsClosed')}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end border-t">
          <Button onClick={onClose} variant="outline" disabled={loading}>
            {t('common.close')}
          </Button>
        </div>
      </div>
    </div>
  );
};
