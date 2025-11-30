import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
  onSnapshot,
  writeBatch,
  getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { INTERNAL_NOTIFICATION_TYPES, NOTIFICATION_CATEGORY } from './constants';

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedId = null,
  relatedType = null,
  actionUrl = null,
  category = NOTIFICATION_CATEGORY.SYSTEM,
  metadata = {},
}) => {
  try {
    const notification = {
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      actionUrl,
      category,
      metadata,
      isRead: false,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'notifications'), notification);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }
};

export const createBulkNotifications = async (notifications) => {
  try {
    const batch = writeBatch(db);
    const notificationsRef = collection(db, 'notifications');

    notifications.forEach((notification) => {
      const docRef = doc(notificationsRef);
      batch.set(docRef, {
        ...notification,
        isRead: false,
        createdAt: Timestamp.now(),
      });
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    return { success: false, error: error.message };
  }
};

export const getUserNotifications = async (userId, limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, notifications };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return { success: false, error: error.message, notifications: [] };
  }
};

export const getUnreadNotifications = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, notifications };
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    return { success: true, notifications: [] };
  }
};

export const getUnreadCount = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error('Error getting unread count:', error);
    return { success: true, count: 0 };
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      readAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};

export const markAllAsRead = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach((docSnapshot) => {
      batch.update(docSnapshot.ref, {
        isRead: true,
        readAt: Timestamp.now(),
      });
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error marking all as read:', error);
    return { success: false, error: error.message };
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeToNotifications = (userId, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(notifications);
  });
};

export const getPropertyManagerId = async (propertyId) => {
  try {
    const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
    if (propertyDoc.exists()) {
      return propertyDoc.data().managerId;
    }
    return null;
  } catch (error) {
    console.error('Error getting property manager:', error);
    return null;
  }
};

export const notifyTicketCreated = async (ticket, creatorName) => {
  const managerId = await getPropertyManagerId(ticket.propertyId);
  if (!managerId) return;

  await createNotification({
    userId: managerId,
    type: INTERNAL_NOTIFICATION_TYPES.TICKET_CREATED,
    title: 'ticket.newTicket',
    message: 'notifications.ticketCreated',
    relatedId: ticket.id,
    relatedType: 'ticket',
    actionUrl: `/tickets/${ticket.id}`,
    category: NOTIFICATION_CATEGORY.TICKETS,
    metadata: {
      ticketNumber: ticket.ticketNumber,
      creatorName,
      priority: ticket.priority,
    },
  });
};

export const notifyTicketAssigned = async (ticket, assigneeName) => {
  if (!ticket.assignedTo) return;

  await createNotification({
    userId: ticket.assignedTo,
    type: INTERNAL_NOTIFICATION_TYPES.TICKET_ASSIGNED,
    title: 'ticket.ticketAssigned',
    message: 'notifications.ticketAssigned',
    relatedId: ticket.id,
    relatedType: 'ticket',
    actionUrl: `/tickets/${ticket.id}`,
    category: NOTIFICATION_CATEGORY.TICKETS,
    metadata: {
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
    },
  });
};

export const notifyTicketStatusUpdated = async (ticket, previousStatus) => {
  await createNotification({
    userId: ticket.createdBy,
    type: INTERNAL_NOTIFICATION_TYPES.TICKET_STATUS_UPDATED,
    title: 'ticket.statusUpdated',
    message: 'notifications.ticketStatusUpdated',
    relatedId: ticket.id,
    relatedType: 'ticket',
    actionUrl: `/tickets/${ticket.id}`,
    category: NOTIFICATION_CATEGORY.TICKETS,
    metadata: {
      ticketNumber: ticket.ticketNumber,
      previousStatus,
      newStatus: ticket.status,
    },
  });
};

export const notifyPermitRequested = async (permit, requesterName) => {
  const managerId = await getPropertyManagerId(permit.propertyId);
  if (!managerId) return;

  await createNotification({
    userId: managerId,
    type: INTERNAL_NOTIFICATION_TYPES.PERMIT_REQUESTED,
    title: 'permit.newRequest',
    message: 'notifications.permitRequested',
    relatedId: permit.id,
    relatedType: 'permit',
    actionUrl: `/permits/${permit.id}`,
    category: NOTIFICATION_CATEGORY.PERMITS,
    metadata: {
      requesterName,
      permitType: permit.type,
    },
  });
};

export const notifyPermitStatusChanged = async (permit, status, reason = null) => {
  const notificationTypes = {
    approved: INTERNAL_NOTIFICATION_TYPES.PERMIT_APPROVED,
    rejected: INTERNAL_NOTIFICATION_TYPES.PERMIT_REJECTED,
    revoked: INTERNAL_NOTIFICATION_TYPES.PERMIT_REVOKED,
  };

  const messages = {
    approved: 'notifications.permitApproved',
    rejected: 'notifications.permitRejected',
    revoked: 'notifications.permitRevoked',
  };

  if (!notificationTypes[status]) return;

  await createNotification({
    userId: permit.userId,
    type: notificationTypes[status],
    title: `permit.${status}`,
    message: messages[status],
    relatedId: permit.id,
    relatedType: 'permit',
    actionUrl: `/permits/${permit.id}`,
    category: NOTIFICATION_CATEGORY.PERMITS,
    metadata: {
      permitType: permit.type,
      reason,
    },
  });
};

export const notifyBookingRequested = async (booking, requesterName) => {
  const managerId = await getPropertyManagerId(booking.propertyId);
  if (!managerId) return;

  await createNotification({
    userId: managerId,
    type: INTERNAL_NOTIFICATION_TYPES.BOOKING_REQUESTED,
    title: 'booking.newRequest',
    message: 'notifications.bookingRequested',
    relatedId: booking.id,
    relatedType: 'booking',
    actionUrl: `/bookings/${booking.id}`,
    category: NOTIFICATION_CATEGORY.BOOKINGS,
    metadata: {
      requesterName,
      facilityName: booking.facilityName,
      date: booking.date,
    },
  });
};

export const notifyBookingStatusChanged = async (booking, status, reason = null) => {
  const notificationTypes = {
    approved: INTERNAL_NOTIFICATION_TYPES.BOOKING_APPROVED,
    rejected: INTERNAL_NOTIFICATION_TYPES.BOOKING_REJECTED,
    cancelled: INTERNAL_NOTIFICATION_TYPES.BOOKING_CANCELLED,
  };

  const messages = {
    approved: 'notifications.bookingApproved',
    rejected: 'notifications.bookingRejected',
    cancelled: 'notifications.bookingCancelled',
  };

  if (!notificationTypes[status]) return;

  await createNotification({
    userId: booking.userId,
    type: notificationTypes[status],
    title: `booking.${status}`,
    message: messages[status],
    relatedId: booking.id,
    relatedType: 'booking',
    actionUrl: `/bookings/${booking.id}`,
    category: NOTIFICATION_CATEGORY.BOOKINGS,
    metadata: {
      facilityName: booking.facilityName,
      date: booking.date,
      reason,
    },
  });
};

export const notifyBillIssued = async (bill, recipientName) => {
  await createNotification({
    userId: bill.recipientId,
    type: INTERNAL_NOTIFICATION_TYPES.BILL_ISSUED,
    title: 'billing.newBill',
    message: 'notifications.billIssued',
    relatedId: bill.id,
    relatedType: 'bill',
    actionUrl: `/billing/${bill.id}`,
    category: NOTIFICATION_CATEGORY.BILLING,
    metadata: {
      amount: bill.amount,
      currency: bill.currency,
      dueDate: bill.dueDate,
      billType: bill.billType,
    },
  });
};

export const notifyBillPaid = async (bill) => {
  await createNotification({
    userId: bill.recipientId,
    type: INTERNAL_NOTIFICATION_TYPES.BILL_PAID,
    title: 'billing.paymentConfirmed',
    message: 'notifications.billPaid',
    relatedId: bill.id,
    relatedType: 'bill',
    actionUrl: `/billing/${bill.id}`,
    category: NOTIFICATION_CATEGORY.BILLING,
    metadata: {
      amount: bill.amount,
      currency: bill.currency,
    },
  });
};

export const notifyContractExpiring = async (contract, daysUntilExpiry) => {
  const userIds = [contract.partyAId, contract.partyBId].filter(Boolean);

  const notifications = userIds.map(userId => ({
    userId,
    type: INTERNAL_NOTIFICATION_TYPES.CONTRACT_EXPIRING,
    title: 'contract.expiringSoon',
    message: 'notifications.contractExpiring',
    relatedId: contract.id,
    relatedType: 'contract',
    actionUrl: `/contracts/${contract.id}`,
    category: NOTIFICATION_CATEGORY.CONTRACTS,
    metadata: {
      daysUntilExpiry,
      contractType: contract.type,
    },
  }));

  await createBulkNotifications(notifications);
};
