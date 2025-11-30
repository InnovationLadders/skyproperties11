import { collection, addDoc, getDocs, getDoc, doc, updateDoc, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BOOKING_STATUS, USER_ROLES } from './constants';

export const createBooking = async (bookingData, currentUser) => {
  try {
    const { unitId, startDate, endDate, notes } = bookingData;

    const isAvailable = await checkAvailability(unitId, new Date(startDate), new Date(endDate));

    if (!isAvailable) {
      throw new Error('The facility is not available for the selected time period');
    }

    const unitDoc = await getDoc(doc(db, 'units', unitId));
    if (!unitDoc.exists()) {
      throw new Error('Unit not found');
    }

    const unitData = unitDoc.data();
    const propertyDoc = await getDoc(doc(db, 'properties', unitData.propertyId));

    if (!propertyDoc.exists()) {
      throw new Error('Property not found');
    }

    const propertyData = propertyDoc.data();

    const booking = {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      unitId,
      unitNumber: unitData.unitNumber,
      propertyId: unitData.propertyId,
      propertyName: propertyData.name,
      facilityType: unitData.facilityType,
      startDate: Timestamp.fromDate(new Date(startDate)),
      endDate: Timestamp.fromDate(new Date(endDate)),
      notes: notes || '',
      status: unitData.requiresApproval ? BOOKING_STATUS.PENDING : BOOKING_STATUS.APPROVED,
      requiresApproval: unitData.requiresApproval || false,
      bookingPrice: unitData.bookingPrice || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'bookings'), booking);

    return { success: true, bookingId: docRef.id };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: error.message };
  }
};

export const getBookingsByUser = async (userId) => {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return [];
  }
};

export const getBookingsByUnit = async (unitId) => {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('unitId', '==', unitId),
      orderBy('startDate', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching unit bookings:', error);
    return [];
  }
};

export const getBookingsByProperty = async (propertyId) => {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('propertyId', '==', propertyId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching property bookings:', error);
    return [];
  }
};

export const getAllBookings = async () => {
  try {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return [];
  }
};

export const getPendingBookings = async (propertyId = null) => {
  try {
    let q;
    if (propertyId) {
      q = query(
        collection(db, 'bookings'),
        where('propertyId', '==', propertyId),
        where('status', '==', BOOKING_STATUS.PENDING),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'bookings'),
        where('status', '==', BOOKING_STATUS.PENDING),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching pending bookings:', error);
    return [];
  }
};

export const checkAvailability = async (unitId, startDate, endDate) => {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const q = query(
      collection(db, 'bookings'),
      where('unitId', '==', unitId),
      where('status', 'in', [BOOKING_STATUS.APPROVED, BOOKING_STATUS.PENDING])
    );

    const snapshot = await getDocs(q);

    for (const doc of snapshot.docs) {
      const booking = doc.data();
      const bookingStart = booking.startDate.toDate();
      const bookingEnd = booking.endDate.toDate();

      if (
        (startDate >= bookingStart && startDate < bookingEnd) ||
        (endDate > bookingStart && endDate <= bookingEnd) ||
        (startDate <= bookingStart && endDate >= bookingEnd)
      ) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking availability:', error);
    return false;
  }
};

export const updateBookingStatus = async (bookingId, status, notes = '', updatedBy) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingDoc = await getDoc(bookingRef);

    if (!bookingDoc.exists()) {
      throw new Error('Booking not found');
    }

    const bookingData = bookingDoc.data();

    await updateDoc(bookingRef, {
      status,
      managerNotes: notes,
      updatedAt: serverTimestamp(),
      updatedBy,
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating booking status:', error);
    return { success: false, error: error.message };
  }
};

export const approveBooking = async (bookingId, notes = '', approvedBy) => {
  return updateBookingStatus(bookingId, BOOKING_STATUS.APPROVED, notes, approvedBy);
};

export const rejectBooking = async (bookingId, notes = '', rejectedBy) => {
  return updateBookingStatus(bookingId, BOOKING_STATUS.REJECTED, notes, rejectedBy);
};

export const cancelBooking = async (bookingId, cancelledBy) => {
  return updateBookingStatus(bookingId, BOOKING_STATUS.CANCELLED, '', cancelledBy);
};

export const getBookingById = async (bookingId) => {
  try {
    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));

    if (!bookingDoc.exists()) {
      return null;
    }

    return {
      id: bookingDoc.id,
      ...bookingDoc.data(),
    };
  } catch (error) {
    console.error('Error fetching booking:', error);
    return null;
  }
};

export const getBookableUnits = async (propertyId = null) => {
  try {
    let q;
    if (propertyId) {
      q = query(
        collection(db, 'units'),
        where('propertyId', '==', propertyId),
        where('isBookable', '==', true)
      );
    } else {
      q = query(
        collection(db, 'units'),
        where('isBookable', '==', true)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching bookable units:', error);
    return [];
  }
};

export const getUserAccessibleProperties = async (userId, userRole) => {
  try {
    if (userRole === USER_ROLES.ADMIN) {
      const snapshot = await getDocs(collection(db, 'properties'));
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    if (userRole === USER_ROLES.PROPERTY_MANAGER) {
      const q = query(
        collection(db, 'properties'),
        where('managerId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    const unitsQuery = query(
      collection(db, 'units'),
      where('ownerId', '==', userId)
    );
    const unitsSnapshot = await getDocs(unitsQuery);

    const propertyIds = [...new Set(unitsSnapshot.docs.map(doc => doc.data().propertyId))];

    if (propertyIds.length === 0) {
      const tenantQuery = query(
        collection(db, 'units'),
        where('tenantId', '==', userId)
      );
      const tenantSnapshot = await getDocs(tenantQuery);
      const tenantPropertyIds = [...new Set(tenantSnapshot.docs.map(doc => doc.data().propertyId))];

      if (tenantPropertyIds.length === 0) {
        return [];
      }

      propertyIds.push(...tenantPropertyIds);
    }

    const properties = [];
    for (const propertyId of propertyIds) {
      const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
      if (propertyDoc.exists()) {
        properties.push({
          id: propertyDoc.id,
          ...propertyDoc.data(),
        });
      }
    }

    return properties;
  } catch (error) {
    console.error('Error fetching user accessible properties:', error);
    return [];
  }
};
