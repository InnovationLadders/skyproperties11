import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Filter, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAllBookings,
  getBookingsByProperty,
  getPendingBookings,
  approveBooking,
  rejectBooking
} from '../../utils/bookingService';
import { getUserAccessibleProperties } from '../../utils/bookingService';
import { BookingCard } from '../../components/bookings/BookingCard';
import { BOOKING_STATUS, USER_ROLES } from '../../utils/constants';

export const ManageBookingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [properties, setProperties] = useState([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [managerNotes, setManagerNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await fetchProperties();
      await fetchBookings();
    };
    if (currentUser && userProfile) {
      loadData();
    }
  }, [currentUser, userProfile]);

  useEffect(() => {
    if (currentUser && userProfile) {
      fetchBookings();
    }
  }, [propertyFilter]);

  const fetchProperties = async () => {
    try {
      const data = await getUserAccessibleProperties(currentUser.uid, userProfile.role);
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let data = [];

      if (userProfile.role === USER_ROLES.ADMIN) {
        if (propertyFilter === 'all') {
          data = await getAllBookings();
        } else {
          data = await getBookingsByProperty(propertyFilter);
        }
      } else if (userProfile.role === USER_ROLES.PROPERTY_MANAGER) {
        let managedProperties = properties;

        if (managedProperties.length === 0) {
          console.log('[ManageBookingsPage] Properties not loaded yet, fetching...');
          managedProperties = await getUserAccessibleProperties(currentUser.uid, userProfile.role);
        }

        console.log('[ManageBookingsPage] Manager properties:', managedProperties.length);

        if (managedProperties.length === 0) {
          console.warn('[ManageBookingsPage] No properties assigned to this manager');
          setBookings([]);
          setLoading(false);
          return;
        }

        if (propertyFilter === 'all') {
          const bookingsArrays = await Promise.all(
            managedProperties.map(property => getBookingsByProperty(property.id))
          );
          data = bookingsArrays.flat();
        } else {
          data = await getBookingsByProperty(propertyFilter);
        }
      }

      console.log('[ManageBookingsPage] Fetched bookings:', data.length);
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (booking) => {
    setSelectedBooking(booking);
    setShowApprovalModal(true);
  };

  const handleReject = async (booking) => {
    const notes = prompt(t('booking.enterRejectionReason'));
    if (notes === null) return;

    setActionLoading(true);
    try {
      const result = await rejectBooking(booking.id, notes, currentUser.uid);
      if (result.success) {
        fetchBookings();
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

  const confirmApproval = async () => {
    if (!selectedBooking) return;

    setActionLoading(true);
    try {
      const result = await approveBooking(selectedBooking.id, managerNotes, currentUser.uid);
      if (result.success) {
        setShowApprovalModal(false);
        setManagerNotes('');
        setSelectedBooking(null);
        fetchBookings();
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

  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter === 'all') return true;
    return booking.status === statusFilter;
  });

  const pendingBookings = filteredBookings.filter((b) => b.status === BOOKING_STATUS.PENDING);
  const approvedBookings = filteredBookings.filter((b) => b.status === BOOKING_STATUS.APPROVED);
  const otherBookings = filteredBookings.filter(
    (b) => b.status !== BOOKING_STATUS.PENDING && b.status !== BOOKING_STATUS.APPROVED
  );

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === BOOKING_STATUS.PENDING).length,
    approved: bookings.filter((b) => b.status === BOOKING_STATUS.APPROVED).length,
    rejected: bookings.filter((b) => b.status === BOOKING_STATUS.REJECTED).length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('booking.manageBookings')}</h1>
            <p className="text-muted-foreground">{t('booking.reviewAndApprove')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('booking.totalBookings')}</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('booking.pending')}</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('booking.approved')}</div>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('booking.rejected')}</div>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex gap-4 flex-wrap">
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

            {properties.length > 1 && (
              <select
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                className="px-4 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">{t('booking.allProperties')}</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            )}
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
              <p className="text-muted-foreground">
                {statusFilter !== 'all'
                  ? t('booking.tryAdjustingFilters')
                  : t('booking.noBookingsYet')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {pendingBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t('booking.pendingApproval')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <BookingCard booking={booking} showActions={false} />
                        <div className="px-4 pb-4 flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(booking)}
                            disabled={actionLoading}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {t('booking.approve')}
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleReject(booking)}
                            disabled={actionLoading}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {t('booking.reject')}
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {approvedBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t('booking.approvedBookings')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {approvedBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <BookingCard booking={booking} onCancel={null} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {otherBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t('booking.otherBookings')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <BookingCard booking={booking} onCancel={null} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{t('booking.approveBooking')}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {t('booking.approvalConfirmation')}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerNotes">{t('booking.approvalNotes')}</Label>
                <textarea
                  id="managerNotes"
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                  placeholder={t('booking.approvalNotesPlaceholder')}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowApprovalModal(false);
                    setManagerNotes('');
                    setSelectedBooking(null);
                  }}
                  disabled={actionLoading}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  className="flex-1"
                  onClick={confirmApproval}
                  disabled={actionLoading}
                >
                  {actionLoading ? t('common.submitting') : t('booking.confirm')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
