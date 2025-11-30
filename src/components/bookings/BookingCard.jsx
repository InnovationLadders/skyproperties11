import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, MapPin, Building2, X } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { BookingStatusBadge } from './BookingStatusBadge';
import { BOOKING_STATUS } from '../../utils/constants';

export const BookingCard = ({ booking, onCancel, showActions = true }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const canCancel = () => {
    return booking.status === BOOKING_STATUS.PENDING || booking.status === BOOKING_STATUS.APPROVED;
  };

  const handleViewDetails = () => {
    navigate(`/bookings/${booking.id}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{booking.unitNumber}</CardTitle>
          <BookingStatusBadge status={booking.status} />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>{booking.propertyName}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-primary" />
          <div>
            <div className="font-medium">{formatDate(booking.startDate)}</div>
            <div className="text-xs text-muted-foreground">
              {formatTime(booking.startDate)} - {formatTime(booking.endDate)}
            </div>
          </div>
        </div>

        {booking.facilityType && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{t(`unit.${booking.facilityType}`)}</span>
          </div>
        )}

        {booking.notes && (
          <div className="text-sm text-muted-foreground border-t pt-2">
            <div className="font-medium text-foreground mb-1">{t('booking.notes')}:</div>
            <p className="line-clamp-2">{booking.notes}</p>
          </div>
        )}

        {booking.managerNotes && (
          <div className="text-sm text-muted-foreground border-t pt-2">
            <div className="font-medium text-foreground mb-1">{t('booking.managerNotes')}:</div>
            <p className="line-clamp-2">{booking.managerNotes}</p>
          </div>
        )}

        {booking.bookingPrice > 0 && (
          <div className="flex items-center justify-between text-sm border-t pt-2">
            <span className="text-muted-foreground">{t('booking.price')}:</span>
            <span className="font-semibold text-primary">${booking.bookingPrice}/hr</span>
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleViewDetails}
          >
            {t('common.viewDetails')}
          </Button>
          {canCancel() && onCancel && (
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onCancel(booking.id)}
            >
              <X className="h-4 w-4 mr-2" />
              {t('common.cancel')}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};
