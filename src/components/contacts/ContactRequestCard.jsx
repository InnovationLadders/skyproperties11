import { useTranslation } from 'react-i18next';
import { Mail, Phone, Building2, Calendar, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { ContactRequestStatusBadge } from './ContactRequestStatusBadge';
import { format } from 'date-fns';

export const ContactRequestCard = ({ request, onClick }) => {
  const { t } = useTranslation();

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

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(request)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{request.name}</h3>
            <ContactRequestStatusBadge status={request.status} />
          </div>
          <div className="text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 inline mr-1" />
            {formatDate(request.createdAt)}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Mail className="w-4 h-4 mr-2" />
            {request.email}
          </div>

          {request.phoneNumber && (
            <div className="flex items-center text-muted-foreground">
              <Phone className="w-4 h-4 mr-2" />
              {request.phoneNumber || request.phone}
            </div>
          )}

          {request.phone && !request.phoneNumber && (
            <div className="flex items-center text-muted-foreground">
              <Phone className="w-4 h-4 mr-2" />
              {request.phone}
            </div>
          )}

          {(request.propertyName || request.unitNumber) && (
            <div className="flex items-center text-muted-foreground">
              <Building2 className="w-4 h-4 mr-2" />
              {request.propertyName}
              {request.unitNumber && ` - ${t('unit.unitNumber')}: ${request.unitNumber}`}
            </div>
          )}

          {request.message && (
            <div className="flex items-start text-muted-foreground mt-2 pt-2 border-t">
              <MessageSquare className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <p className="line-clamp-2">{request.message}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
