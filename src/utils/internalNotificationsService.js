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

export const subscribeToNotifications = (userId, callback, errorCallback) => {
  try {
    console.log('[subscribeToNotifications] Setting up subscription for user:', userId);
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        console.log('[subscribeToNotifications] Snapshot received:', snapshot.docs.length, 'notifications');
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(notifications);
      },
      (error) => {
        console.error('[subscribeToNotifications] Snapshot error:', error);
        if (errorCallback) {
          errorCallback(error);
        }
      }
    );
  } catch (error) {
    console.error('[subscribeToNotifications] Setup error:', error);
    if (errorCallback) {
      errorCallback(error);
    }
    return () => {}; // Return empty unsubscribe function
  }
};

export const getPropertyManagerId = async (propertyId) => {
  try {
    console.log('[getPropertyManagerId] Fetching manager for propertyId:', propertyId);

    if (!propertyId) {
      console.warn('[getPropertyManagerId] No propertyId provided');
      return null;
    }

    const propertyDoc = await getDoc(doc(db, 'properties', propertyId));

    if (propertyDoc.exists()) {
      const managerId = propertyDoc.data().managerId;
      console.log('[getPropertyManagerId] Found managerId:', managerId);
      return managerId;
    }

    console.warn('[getPropertyManagerId] Property document does not exist for:', propertyId);
    return null;
  } catch (error) {
    console.error('[getPropertyManagerId] Error getting property manager:', error);
    return null;
  }
};

export const getAllAdmins = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'admin'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error('[getAllAdmins] Error getting admins:', error);
    return [];
  }
};

export const notifyTicketCreated = async (ticket, creatorName) => {
  try {
    console.log('[notifyTicketCreated] Starting notification for ticket:', ticket.id);
    console.log('[notifyTicketCreated] Ticket data:', {
      ticketNumber: ticket.ticketNumber,
      propertyId: ticket.propertyId,
      creatorName,
      priority: ticket.priority
    });

    const managerId = await getPropertyManagerId(ticket.propertyId);

    if (!managerId) {
      console.warn('[notifyTicketCreated] No property manager found, notifying all admins as fallback');

      const adminIds = await getAllAdmins();

      if (adminIds.length === 0) {
        console.error('[notifyTicketCreated] No admins found to notify!');
        return;
      }

      console.log('[notifyTicketCreated] Found', adminIds.length, 'admins to notify');

      const notifications = adminIds.map(adminId => ({
        userId: adminId,
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
      }));

      await createBulkNotifications(notifications);
      console.log('[notifyTicketCreated] Successfully notified all admins');
      return;
    }

    console.log('[notifyTicketCreated] Notifying property manager:', managerId);

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

    console.log('[notifyTicketCreated] Successfully notified property manager');
  } catch (error) {
    console.error('[notifyTicketCreated] Error sending notification:', error);
    console.error('[notifyTicketCreated] Error details:', error.message, error.stack);
  }
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

export const notifyTicketCommented = async (ticket, commentAuthorId, commentAuthorName, commentText) => {
  const userIdsToNotify = new Set();

  if (ticket.createdBy && ticket.createdBy !== commentAuthorId) {
    userIdsToNotify.add(ticket.createdBy);
  }

  if (ticket.assignedTo && ticket.assignedTo !== commentAuthorId) {
    userIdsToNotify.add(ticket.assignedTo);
  }

  const managerId = await getPropertyManagerId(ticket.propertyId);
  if (managerId && managerId !== commentAuthorId) {
    userIdsToNotify.add(managerId);
  }

  const notifications = Array.from(userIdsToNotify).map(userId => ({
    userId,
    type: INTERNAL_NOTIFICATION_TYPES.TICKET_COMMENTED,
    title: 'ticket.newComment',
    message: 'notifications.ticketCommented',
    relatedId: ticket.id,
    relatedType: 'ticket',
    actionUrl: `/tickets/${ticket.id}`,
    category: NOTIFICATION_CATEGORY.TICKETS,
    metadata: {
      ticketNumber: ticket.ticketNumber,
      commentAuthor: commentAuthorName,
      commentPreview: commentText.substring(0, 100),
    },
  }));

  if (notifications.length > 0) {
    await createBulkNotifications(notifications);
  }
};

export const notifyTicketCompleted = async (ticket) => {
  await createNotification({
    userId: ticket.createdBy,
    type: INTERNAL_NOTIFICATION_TYPES.TICKET_COMPLETED,
    title: 'ticket.completed',
    message: 'notifications.ticketCompleted',
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

export const notifyTicketClosed = async (ticket) => {
  await createNotification({
    userId: ticket.createdBy,
    type: INTERNAL_NOTIFICATION_TYPES.TICKET_CLOSED,
    title: 'ticket.closed',
    message: 'notifications.ticketClosed',
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

export const notifyBillOverdue = async (bill) => {
  const notifications = [
    {
      userId: bill.recipientId,
      type: INTERNAL_NOTIFICATION_TYPES.BILL_OVERDUE,
      title: 'billing.overdue',
      message: 'notifications.billOverdue',
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
    },
  ];

  const managerId = await getPropertyManagerId(bill.propertyId);
  if (managerId) {
    notifications.push({
      userId: managerId,
      type: INTERNAL_NOTIFICATION_TYPES.BILL_OVERDUE,
      title: 'billing.overdueNotice',
      message: 'notifications.billOverdueManager',
      relatedId: bill.id,
      relatedType: 'bill',
      actionUrl: `/billing/${bill.id}`,
      category: NOTIFICATION_CATEGORY.BILLING,
      metadata: {
        amount: bill.amount,
        currency: bill.currency,
        recipientName: bill.recipientName,
        daysOverdue: Math.floor((Date.now() - new Date(bill.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
      },
    });
  }

  await createBulkNotifications(notifications);
};

export const notifyBillReminder = async (bill, daysUntilDue) => {
  await createNotification({
    userId: bill.recipientId,
    type: INTERNAL_NOTIFICATION_TYPES.BILL_REMINDER,
    title: 'billing.reminder',
    message: 'notifications.billReminder',
    relatedId: bill.id,
    relatedType: 'bill',
    actionUrl: `/billing/${bill.id}`,
    category: NOTIFICATION_CATEGORY.BILLING,
    metadata: {
      amount: bill.amount,
      currency: bill.currency,
      dueDate: bill.dueDate,
      daysUntilDue,
      billType: bill.billType,
    },
  });
};

export const notifyBookingReminder = async (booking, hoursUntilBooking) => {
  await createNotification({
    userId: booking.userId,
    type: INTERNAL_NOTIFICATION_TYPES.BOOKING_REMINDER,
    title: 'booking.reminder',
    message: 'notifications.bookingReminder',
    relatedId: booking.id,
    relatedType: 'booking',
    actionUrl: `/bookings/${booking.id}`,
    category: NOTIFICATION_CATEGORY.BOOKINGS,
    metadata: {
      facilityName: booking.facilityName,
      date: booking.date,
      timeSlot: booking.timeSlot,
      hoursUntilBooking,
    },
  });
};

export const notifyContractCreated = async (contract) => {
  const userIds = [contract.partyAId, contract.partyBId].filter(Boolean);
  const managerId = await getPropertyManagerId(contract.propertyId);
  if (managerId && !userIds.includes(managerId)) {
    userIds.push(managerId);
  }

  const notifications = userIds.map(userId => ({
    userId,
    type: INTERNAL_NOTIFICATION_TYPES.CONTRACT_CREATED,
    title: 'contract.newContract',
    message: 'notifications.contractCreated',
    relatedId: contract.id,
    relatedType: 'contract',
    actionUrl: `/contracts/${contract.id}`,
    category: NOTIFICATION_CATEGORY.CONTRACTS,
    metadata: {
      contractType: contract.type,
      startDate: contract.startDate,
      endDate: contract.endDate,
    },
  }));

  await createBulkNotifications(notifications);
};

export const notifyContractExpired = async (contract) => {
  const userIds = [contract.partyAId, contract.partyBId].filter(Boolean);

  const notifications = userIds.map(userId => ({
    userId,
    type: INTERNAL_NOTIFICATION_TYPES.CONTRACT_EXPIRED,
    title: 'contract.expired',
    message: 'notifications.contractExpired',
    relatedId: contract.id,
    relatedType: 'contract',
    actionUrl: `/contracts/${contract.id}`,
    category: NOTIFICATION_CATEGORY.CONTRACTS,
    metadata: {
      contractType: contract.type,
      endDate: contract.endDate,
    },
  }));

  await createBulkNotifications(notifications);
};

export const notifyContractRenewed = async (contract, oldContractId) => {
  const userIds = [contract.partyAId, contract.partyBId].filter(Boolean);

  const notifications = userIds.map(userId => ({
    userId,
    type: INTERNAL_NOTIFICATION_TYPES.CONTRACT_RENEWED,
    title: 'contract.renewed',
    message: 'notifications.contractRenewed',
    relatedId: contract.id,
    relatedType: 'contract',
    actionUrl: `/contracts/${contract.id}`,
    category: NOTIFICATION_CATEGORY.CONTRACTS,
    metadata: {
      contractType: contract.type,
      newStartDate: contract.startDate,
      newEndDate: contract.endDate,
      oldContractId,
    },
  }));

  await createBulkNotifications(notifications);
};

export const createTestNotifications = async (userId) => {
  try {
    console.log('[createTestNotifications] Creating test notifications for user:', userId);

    const testNotifications = [
      {
        userId,
        type: INTERNAL_NOTIFICATION_TYPES.TICKET_CREATED,
        title: 'New Maintenance Ticket',
        message: 'A new maintenance ticket #T-001 has been created for broken AC unit',
        relatedId: 'test-ticket-1',
        relatedType: 'ticket',
        actionUrl: '/tickets',
        category: NOTIFICATION_CATEGORY.TICKETS,
        metadata: {
          ticketNumber: 'T-001',
          priority: 'high',
        },
      },
      {
        userId,
        type: INTERNAL_NOTIFICATION_TYPES.BILL_ISSUED,
        title: 'New Bill Issued',
        message: 'Your monthly rent bill for 2500 SAR has been issued',
        relatedId: 'test-bill-1',
        relatedType: 'bill',
        actionUrl: '/billing',
        category: NOTIFICATION_CATEGORY.BILLING,
        metadata: {
          amount: 2500,
          currency: 'SAR',
        },
      },
      {
        userId,
        type: INTERNAL_NOTIFICATION_TYPES.PERMIT_APPROVED,
        title: 'Permit Approved',
        message: 'Your parking permit request has been approved',
        relatedId: 'test-permit-1',
        relatedType: 'permit',
        actionUrl: '/permits',
        category: NOTIFICATION_CATEGORY.PERMITS,
        metadata: {
          permitType: 'parking',
        },
      },
      {
        userId,
        type: INTERNAL_NOTIFICATION_TYPES.BOOKING_APPROVED,
        title: 'Booking Confirmed',
        message: 'Your gym facility booking has been confirmed for tomorrow',
        relatedId: 'test-booking-1',
        relatedType: 'booking',
        actionUrl: '/bookings',
        category: NOTIFICATION_CATEGORY.BOOKINGS,
        metadata: {
          facilityName: 'Gym',
          date: new Date().toISOString(),
        },
      },
      {
        userId,
        type: INTERNAL_NOTIFICATION_TYPES.CONTRACT_EXPIRING,
        title: 'Contract Expiring Soon',
        message: 'Your rental contract will expire in 30 days',
        relatedId: 'test-contract-1',
        relatedType: 'contract',
        actionUrl: '/contracts',
        category: NOTIFICATION_CATEGORY.CONTRACTS,
        metadata: {
          daysUntilExpiry: 30,
          contractType: 'rent',
        },
      },
    ];

    // Create half as read, half as unread
    const notifications = testNotifications.map((notification, index) => ({
      ...notification,
      isRead: index < 2, // First 2 are read
      createdAt: Timestamp.fromDate(new Date(Date.now() - (index * 3600000))), // Stagger by 1 hour each
    }));

    const result = await createBulkNotifications(notifications);
    console.log('[createTestNotifications] Test notifications created:', result);
    return result;
  } catch (error) {
    console.error('[createTestNotifications] Error creating test notifications:', error);
    return { success: false, error: error.message };
  }
};
