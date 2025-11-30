import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { BookingCalendar } from '../../components/bookings/BookingCalendar';
import { TimeSlotPicker } from '../../components/bookings/TimeSlotPicker';
import {
  getUserAccessibleProperties,
  getBookableUnits,
  createBooking,
  checkAvailability,
  getBookingsByUnit
} from '../../utils/bookingService';

export const CreateBookingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [formData, setFormData] = useState({
    propertyId: '',
    unitId: '',
    selectedDate: null,
    startTime: '09:00',
    endTime: '17:00',
    notes: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, [currentUser, userProfile]);

  useEffect(() => {
    if (formData.propertyId) {
      fetchUnits();
    } else {
      setUnits([]);
      setFormData((prev) => ({ ...prev, unitId: '', selectedDate: null }));
    }
  }, [formData.propertyId]);

  useEffect(() => {
    if (formData.unitId) {
      fetchUnitDetails();
      fetchBookedDates();
    } else {
      setSelectedUnit(null);
      setBookedDates([]);
    }
  }, [formData.unitId]);

  const fetchProperties = async () => {
    try {
      const data = await getUserAccessibleProperties(currentUser.uid, userProfile.role);
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const data = await getBookableUnits(formData.propertyId);
      setUnits(data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const fetchUnitDetails = async () => {
    const unit = units.find((u) => u.id === formData.unitId);
    setSelectedUnit(unit);
  };

  const fetchBookedDates = async () => {
    try {
      const bookings = await getBookingsByUnit(formData.unitId);
      const dates = bookings
        .filter((b) => b.status === 'approved' || b.status === 'pending')
        .flatMap((b) => {
          const dates = [];
          const start = b.startDate.toDate();
          const end = b.endDate.toDate();
          const current = new Date(start);

          while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }

          return dates;
        });

      setBookedDates(dates);
    } catch (error) {
      console.error('Error fetching booked dates:', error);
    }
  };

  const calculatePrice = () => {
    if (!selectedUnit || !formData.startTime || !formData.endTime) return 0;

    const [startHour, startMinute] = formData.startTime.split(':').map(Number);
    const [endHour, endMinute] = formData.endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const durationHours = (endMinutes - startMinutes) / 60;

    return (selectedUnit.bookingPrice || 0) * durationHours;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.selectedDate) {
      setError(t('booking.selectDate'));
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      setError(t('booking.selectTime'));
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setError(t('booking.invalidTimeRange'));
      return;
    }

    const [startHour, startMinute] = formData.startTime.split(':');
    const [endHour, endMinute] = formData.endTime.split(':');

    const startDate = new Date(formData.selectedDate);
    startDate.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

    const endDate = new Date(formData.selectedDate);
    endDate.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

    const isAvailable = await checkAvailability(formData.unitId, startDate, endDate);

    if (!isAvailable) {
      setError(t('booking.timeSlotNotAvailable'));
      return;
    }

    setSubmitting(true);

    try {
      const result = await createBooking(
        {
          unitId: formData.unitId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          notes: formData.notes,
        },
        currentUser
      );

      if (result.success) {
        alert(t('booking.bookingCreatedSuccess'));
        navigate('/bookings');
      } else {
        setError(result.error || t('booking.bookingCreatedFailed'));
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(t('booking.bookingCreatedFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/bookings')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('booking.backToBookings')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('booking.newBooking')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="propertyId">{t('booking.selectProperty')} *</Label>
                <select
                  id="propertyId"
                  value={formData.propertyId}
                  onChange={(e) =>
                    setFormData({ ...formData, propertyId: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">{t('booking.chooseProperty')}</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.propertyId && (
                <div className="space-y-2">
                  <Label htmlFor="unitId">{t('booking.selectFacility')} *</Label>
                  <select
                    id="unitId"
                    value={formData.unitId}
                    onChange={(e) =>
                      setFormData({ ...formData, unitId: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">{t('booking.chooseFacility')}</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.unitNumber} - {t(`unit.${unit.facilityType}`)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedUnit && (
                <div className="p-4 bg-muted/20 rounded-lg space-y-2">
                  <h3 className="font-semibold">{t('booking.facilityDetails')}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t('unit.facilityType')}:</span>
                      <span className="ml-2 font-medium">
                        {t(`unit.${selectedUnit.facilityType}`)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('booking.price')}:</span>
                      <span className="ml-2 font-medium">
                        ${selectedUnit.bookingPrice}/hr
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('booking.availableHours')}:</span>
                      <span className="ml-2 font-medium">
                        {selectedUnit.bookingSettings?.startTime || '00:00'} -{' '}
                        {selectedUnit.bookingSettings?.endTime || '23:59'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('booking.maxDuration')}:</span>
                      <span className="ml-2 font-medium">
                        {selectedUnit.bookingSettings?.maxDuration || 8} hrs
                      </span>
                    </div>
                  </div>
                  {selectedUnit.requiresApproval && (
                    <div className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded mt-2">
                      {t('booking.requiresApprovalNote')}
                    </div>
                  )}
                </div>
              )}

              {formData.unitId && (
                <>
                  <div className="space-y-2">
                    <Label>
                      <CalendarIcon className="h-4 w-4 inline mr-2" />
                      {t('booking.selectDate')} *
                    </Label>
                    <BookingCalendar
                      selectedDate={formData.selectedDate}
                      onDateSelect={(date) =>
                        setFormData({ ...formData, selectedDate: date })
                      }
                      bookedDates={bookedDates}
                      minDate={new Date()}
                    />
                  </div>

                  {formData.selectedDate && (
                    <TimeSlotPicker
                      startTime={formData.startTime}
                      endTime={formData.endTime}
                      onStartTimeChange={(time) =>
                        setFormData({ ...formData, startTime: time })
                      }
                      onEndTimeChange={(time) =>
                        setFormData({ ...formData, endTime: time })
                      }
                      minTime={selectedUnit.bookingSettings?.startTime || '00:00'}
                      maxTime={selectedUnit.bookingSettings?.endTime || '23:59'}
                    />
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">{t('booking.notes')}</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                  placeholder={t('booking.notesPlaceholder')}
                />
              </div>

              {selectedUnit && formData.selectedDate && formData.startTime && formData.endTime && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t('booking.estimatedCost')}:</span>
                    <span className="text-2xl font-bold text-primary">
                      ${calculatePrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/bookings')}
                  disabled={submitting}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {submitting ? t('common.submitting') : t('booking.createBooking')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
