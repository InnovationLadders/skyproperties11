import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { ComplaintStatusBadge } from './ComplaintStatusBadge';
import { ComplaintPriorityBadge } from './ComplaintPriorityBadge';
import { Calendar, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const ComplaintCard = ({ complaint, onClick }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const getTypeLabel = (type) => {
    return t(`complaint.types.${type}`);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return format(dateObj, 'PPp', { locale: isRTL ? ar : undefined });
  };

  return (
    <Card
      className="p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500"
      onClick={onClick}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
                {complaint.referenceNumber}
              </span>
              <ComplaintStatusBadge status={complaint.status} />
              {complaint.priority && (
                <ComplaintPriorityBadge priority={complaint.priority} />
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
              {complaint.subject}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {getTypeLabel(complaint.type)}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
          {complaint.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{complaint.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{complaint.email}</span>
          </div>
          {complaint.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span dir="ltr">{complaint.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{formatDate(complaint.createdAt)}</span>
          </div>
        </div>

        {complaint.responses && complaint.responses.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <MessageSquare className="h-4 w-4" />
            <span>
              {complaint.responses.length} {t('complaint.responses')}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
