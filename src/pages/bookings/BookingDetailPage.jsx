import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Clock, MapPin, Building2, User, FileText, X, CheckCircle, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { getBookingById, cancelBooking, approveBooking, rejectBooking } from '../../utils/bookingService';
import { BookingStatusBadge } from '../../components/bookings/BookingStatusBadge';
import { BOOKING_STATUS, USER_ROLES } from '../../utils/constants';

export const BookingDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { currentUser, userProfile, hasRole } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const data = await getBookingById(bookingId);
      setBooking(data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
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

  const canManage = () => {
    return hasRole([USER_ROLES.ADMIN, USER_ROLES.PROPERTY_MANAGER]);
  };

  const canCancel = () => {
    return (
      booking.userId === currentUser.uid &&
      (booking.status === BOOKING_STATUS.PENDING || booking.status === BOOKING_STATUS.APPROVED)
    );
  };

  const handleCancel = async () => {
    if (!window.confirm(t('booking.confirmCancel'))) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await cancelBooking(bookingId, currentUser.uid);
      if (result.success) {
        fetchBooking();
      } else {
        alert(t('booking.actionFailed'));
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(t('booking.actionFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    const notes = prompt(t('booking.enterApprovalNotes'));
    if (notes === null) return;

    setActionLoading(true);
    try {
      const result = await approveBooking(bookingId, notes, currentUser.uid);
      if (result.success) {
        fetchBooking();
      } else {
        alert(t('booking.actionFailed'));
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      alert(t('booking.actionFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const notes = prompt(t('booking.enterRejectionReason'));
    if (notes === null) return;

    setActionLoading(true);
    try {
      const result = await rejectBooking(bookingId, notes, currentUser.uid);
      if (result.success) {
        fetchBooking();
      } else {
        alert(t('booking.actionFailed'));
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert(t('booking.actionFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-xl font-semibold mb-2">{t('booking.notFound')}</h3>
              <p className="text-muted-foreground mb-4">{t('booking.notFoundMessage')}</p>
              <Button onClick={() => navigate('/bookings')}>
                {t('booking.backToBookings')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/bookings')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('booking.backToBookings')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{booking.unitNumber}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground mt-2">
                      <Building2 className="h-4 w-4" />
                      <span>{booking.propertyName}</span>
                    </div>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">{t('booking.date')}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(booking.startDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">{t('booking.time')}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(booking.startDate)} - {formatTime(booking.endDate)}
                      </div>
                    </div>
                  </div>

                  {booking.facilityType && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">{t('booking.facilityType')}</div>
                        <div className="text-sm text-muted-foreground">
                          {t(`unit.${booking.facilityType}`)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">{t('booking.bookedBy')}</div>
                      <div className="text-sm text-muted-foreground">
                        {booking.userEmail}
                      </div>
                    </div>
                  </div>
                </div>

                {booking.bookingPrice > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{t('booking.totalCost')}:</span>
                      <span className="text-2xl font-bold text-primary">
                        ${booking.bookingPrice}
                      </span>
                    </div>
                  </div>
                )}

                {booking.notes && (
                  <div className="border-t pt-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium mb-1">{t('booking.notes')}</div>
                        <div className="text-sm text-muted-foreground">{booking.notes}</div>
                      </div>
                    </div>
                  </div>
                )}

                {booking.managerNotes && (
                  <div className="border-t pt-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium mb-1">{t('booking.managerNotes')}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.managerNotes}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              {canCancel() && (
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleCancel}
                  disabled={actionLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  {t('booking.cancelBooking')}
                </Button>
              )}

              {canManage() && booking.status === BOOKING_STATUS.PENDING && (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={handleApprove}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('booking.approve')}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleReject}
                    disabled={actionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {t('booking.reject')}
                  </Button>
                </>
              )}
            </div>
          </div>

          <div>
            {booking.status === BOOKING_STATUS.APPROVED && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('booking.bookingQRCode')}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG
                      value={`booking:${booking.id}`}
                      size={200}
                      level="H"
                      includeMargin
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    {t('booking.qrCodeDescription')}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t('booking.bookingInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="text-muted-foreground">{t('booking.bookingId')}</div>
                  <div className="font-mono text-xs">{booking.id}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t('booking.createdAt')}</div>
                  <div>{formatDate(booking.createdAt)}</div>
                </div>
                {booking.requiresApproval && (
                  <div>
                    <div className="text-yellow-700 bg-yellow-50 p-2 rounded text-xs">
                      {t('booking.requiresApprovalNote')}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
