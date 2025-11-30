import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Calendar, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { getBookingsByUser, cancelBooking } from '../../utils/bookingService';
import { BookingCard } from '../../components/bookings/BookingCard';
import { BOOKING_STATUS } from '../../utils/constants';

export const MyBookingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, [currentUser]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getBookingsByUser(currentUser.uid);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(t('booking.confirmCancel'))) {
      return;
    }

    try {
      const result = await cancelBooking(bookingId, currentUser.uid);
      if (result.success) {
        fetchBookings();
      } else {
        alert(t('booking.cancelFailed'));
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(t('booking.cancelFailed'));
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter === 'all') return true;
    return booking.status === statusFilter;
  });

  const upcomingBookings = filteredBookings.filter((booking) => {
    const endDate = booking.endDate.toDate ? booking.endDate.toDate() : new Date(booking.endDate);
    return endDate > new Date() && booking.status === BOOKING_STATUS.APPROVED;
  });

  const pastBookings = filteredBookings.filter((booking) => {
    const endDate = booking.endDate.toDate ? booking.endDate.toDate() : new Date(booking.endDate);
    return endDate <= new Date() || booking.status === BOOKING_STATUS.COMPLETED;
  });

  const pendingBookings = filteredBookings.filter((booking) => {
    return booking.status === BOOKING_STATUS.PENDING;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('booking.myBookings')}</h1>
            <p className="text-muted-foreground">{t('booking.manageYourBookings')}</p>
          </div>
          <Button onClick={() => navigate('/bookings/create')}>
            <Plus className="h-4 w-4 mr-2" />
            {t('booking.newBooking')}
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">{t('booking.allStatuses')}</option>
              <option value={BOOKING_STATUS.PENDING}>{t('booking.pending')}</option>
              <option value={BOOKING_STATUS.APPROVED}>{t('booking.approved')}</option>
              <option value={BOOKING_STATUS.REJECTED}>{t('booking.rejected')}</option>
              <option value={BOOKING_STATUS.CANCELLED}>{t('booking.cancelled')}</option>
              <option value={BOOKING_STATUS.COMPLETED}>{t('booking.completed')}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('booking.noBookingsFound')}</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter !== 'all'
                  ? t('booking.tryAdjustingFilters')
                  : t('booking.startBooking')}
              </p>
              {statusFilter === 'all' && (
                <Button onClick={() => navigate('/bookings/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('booking.newBooking')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {pendingBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t('booking.pendingBookings')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <BookingCard
                        booking={booking}
                        onCancel={handleCancelBooking}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t('booking.upcomingBookings')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <BookingCard
                        booking={booking}
                        onCancel={handleCancelBooking}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t('booking.pastBookings')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <BookingCard
                        booking={booking}
                        onCancel={null}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
