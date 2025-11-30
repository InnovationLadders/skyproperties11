import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { notifyTicketCreated, notifyTicketAssigned, notifyTicketStatusUpdated } from './internalNotificationsService';

const TICKETS_COLLECTION = 'tickets';
const TICKET_COMMENTS_COLLECTION = 'ticket_comments';
const TICKET_ATTACHMENTS_COLLECTION = 'ticket_attachments';

export const generateTicketNumber = async () => {
  const ticketsRef = collection(db, TICKETS_COLLECTION);
  const q = query(ticketsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  const lastNumber = snapshot.docs.length > 0 && snapshot.docs[0].data().ticketNumber
    ? parseInt(snapshot.docs[0].data().ticketNumber.split('-')[1])
    : 0;

  const nextNumber = lastNumber + 1;
  return `TKT-${String(nextNumber).padStart(4, '0')}`;
};

export const createTicket = async (ticketData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const ticketNumber = await generateTicketNumber();

    const ticket = {
      ticketNumber,
      title: ticketData.title,
      description: ticketData.description,
      status: 'open',
      priority: ticketData.priority || 'medium',
      category: ticketData.category || 'maintenance',
      propertyId: ticketData.propertyId || null,
      unitId: ticketData.unitId || null,
      createdBy: user.uid,
      assignedTo: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      resolvedAt: null,
      closedAt: null
    };

    const docRef = await addDoc(collection(db, TICKETS_COLLECTION), ticket);
    const createdTicket = { id: docRef.id, ...ticket };

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const creatorName = userDoc.exists() ? userDoc.data().name || user.email : user.email;

    await notifyTicketCreated(createdTicket, creatorName).catch(err =>
      console.error('Error sending notification:', err)
    );

    return createdTicket;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
};

export const getTicket = async (ticketId) => {
  try {
    const docRef = doc(db, TICKETS_COLLECTION, ticketId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting ticket:', error);
    throw error;
  }
};

export const getUserTickets = async (userId) => {
  try {
    const ticketsRef = collection(db, TICKETS_COLLECTION);
    const q = query(
      ticketsRef,
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting user tickets:', error);
    throw error;
  }
};

export const getAssignedTickets = async (userId) => {
  try {
    const ticketsRef = collection(db, TICKETS_COLLECTION);
    const q = query(
      ticketsRef,
      where('assignedTo', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting assigned tickets:', error);
    throw error;
  }
};

export const getAllTickets = async () => {
  try {
    const ticketsRef = collection(db, TICKETS_COLLECTION);
    const q = query(ticketsRef, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting all tickets:', error);
    throw error;
  }
};

export const updateTicketStatus = async (ticketId, status) => {
  try {
    const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
    const ticketDoc = await getDoc(ticketRef);
    const ticketData = ticketDoc.data();
    const previousStatus = ticketData.status;

    const updates = {
      status,
      updatedAt: serverTimestamp()
    };

    if (status === 'resolved') {
      updates.resolvedAt = serverTimestamp();
    } else if (status === 'closed') {
      updates.closedAt = serverTimestamp();
    }

    await updateDoc(ticketRef, updates);

    const updatedTicket = { id: ticketId, ...ticketData, ...updates };
    await notifyTicketStatusUpdated(updatedTicket, previousStatus).catch(err =>
      console.error('Error sending notification:', err)
    );
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw error;
  }
};

export const assignTicket = async (ticketId, userId) => {
  try {
    const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
    const ticketDoc = await getDoc(ticketRef);
    const ticketData = ticketDoc.data();

    await updateDoc(ticketRef, {
      assignedTo: userId,
      updatedAt: serverTimestamp()
    });

    const assigneeDoc = await getDoc(doc(db, 'users', userId));
    const assigneeName = assigneeDoc.exists() ? assigneeDoc.data().name || assigneeDoc.data().email : '';

    const updatedTicket = { id: ticketId, ...ticketData, assignedTo: userId };
    await notifyTicketAssigned(updatedTicket, assigneeName).catch(err =>
      console.error('Error sending notification:', err)
    );
  } catch (error) {
    console.error('Error assigning ticket:', error);
    throw error;
  }
};

export const updateTicket = async (ticketId, updates) => {
  try {
    const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
    await updateDoc(ticketRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }
};

export const addTicketComment = async (ticketId, commentText, isInternal = false) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const comment = {
      ticketId,
      userId: user.uid,
      comment: commentText,
      isInternal,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, TICKET_COMMENTS_COLLECTION), comment);

    const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
    await updateDoc(ticketRef, {
      updatedAt: serverTimestamp()
    });

    return { id: docRef.id, ...comment };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getTicketComments = async (ticketId) => {
  try {
    const commentsRef = collection(db, TICKET_COMMENTS_COLLECTION);
    const q = query(
      commentsRef,
      where('ticketId', '==', ticketId),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};

export const addTicketAttachment = async (ticketId, attachmentData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const attachment = {
      ticketId,
      fileName: attachmentData.fileName,
      fileUrl: attachmentData.fileUrl,
      fileType: attachmentData.fileType,
      uploadedBy: user.uid,
      uploadedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, TICKET_ATTACHMENTS_COLLECTION), attachment);

    const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
    await updateDoc(ticketRef, {
      updatedAt: serverTimestamp()
    });

    return { id: docRef.id, ...attachment };
  } catch (error) {
    console.error('Error adding attachment:', error);
    throw error;
  }
};

export const getTicketAttachments = async (ticketId) => {
  try {
    const attachmentsRef = collection(db, TICKET_ATTACHMENTS_COLLECTION);
    const q = query(
      attachmentsRef,
      where('ticketId', '==', ticketId),
      orderBy('uploadedAt', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting attachments:', error);
    throw error;
  }
};

export const getTicketStats = async (userId, role) => {
  try {
    let tickets;

    if (role === 'admin' || role === 'manager') {
      tickets = await getAllTickets();
    } else {
      tickets = await getUserTickets(userId);
    }

    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
      byPriority: {
        low: tickets.filter(t => t.priority === 'low').length,
        medium: tickets.filter(t => t.priority === 'medium').length,
        high: tickets.filter(t => t.priority === 'high').length,
        urgent: tickets.filter(t => t.priority === 'urgent').length
      },
      byCategory: {
        maintenance: tickets.filter(t => t.category === 'maintenance').length,
        repair: tickets.filter(t => t.category === 'repair').length,
        complaint: tickets.filter(t => t.category === 'complaint').length,
        request: tickets.filter(t => t.category === 'request').length,
        other: tickets.filter(t => t.category === 'other').length
      }
    };

    return stats;
  } catch (error) {
    console.error('Error getting ticket stats:', error);
    throw error;
  }
};
