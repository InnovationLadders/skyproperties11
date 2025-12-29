import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const COMPLAINTS_COLLECTION = 'complaints';

export const COMPLAINT_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const COMPLAINT_TYPES = {
  SERVICE: 'service',
  PROPERTY: 'property',
  SYSTEM: 'system',
  OTHER: 'other',
};

export const COMPLAINT_PRIORITY = {
  NORMAL: 'normal',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const createComplaint = async (complaintData) => {
  try {
    const complaintRef = await addDoc(collection(db, COMPLAINTS_COLLECTION), {
      ...complaintData,
      status: COMPLAINT_STATUS.NEW,
      priority: complaintData.priority || COMPLAINT_PRIORITY.NORMAL,
      responses: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const referenceNumber = `CMP-${complaintRef.id.substring(0, 8).toUpperCase()}`;

    await updateDoc(complaintRef, {
      referenceNumber,
    });

    return { id: complaintRef.id, referenceNumber };
  } catch (error) {
    console.error('Error creating complaint:', error);
    throw error;
  }
};

export const getAllComplaints = async () => {
  try {
    const q = query(
      collection(db, COMPLAINTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting complaints:', error);
    throw error;
  }
};

export const getComplaintsByUserId = async (userId) => {
  try {
    const q = query(
      collection(db, COMPLAINTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting user complaints:', error);
    throw error;
  }
};

export const getComplaintById = async (complaintId) => {
  try {
    const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting complaint:', error);
    throw error;
  }
};

export const updateComplaintStatus = async (complaintId, status) => {
  try {
    const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating complaint status:', error);
    throw error;
  }
};

export const updateComplaintPriority = async (complaintId, priority) => {
  try {
    const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
    await updateDoc(docRef, {
      priority,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating complaint priority:', error);
    throw error;
  }
};

export const addComplaintResponse = async (complaintId, response) => {
  try {
    const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
    await updateDoc(docRef, {
      responses: arrayUnion({
        ...response,
        timestamp: new Date().toISOString(),
      }),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding complaint response:', error);
    throw error;
  }
};

export const getComplaintsStats = async () => {
  try {
    const complaints = await getAllComplaints();

    return {
      total: complaints.length,
      new: complaints.filter((c) => c.status === COMPLAINT_STATUS.NEW).length,
      inProgress: complaints.filter((c) => c.status === COMPLAINT_STATUS.IN_PROGRESS).length,
      resolved: complaints.filter((c) => c.status === COMPLAINT_STATUS.RESOLVED).length,
      closed: complaints.filter((c) => c.status === COMPLAINT_STATUS.CLOSED).length,
    };
  } catch (error) {
    console.error('Error getting complaints stats:', error);
    throw error;
  }
};

export const getComplaintsByStatus = async (status) => {
  try {
    const q = query(
      collection(db, COMPLAINTS_COLLECTION),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting complaints by status:', error);
    throw error;
  }
};

export const getComplaintsByType = async (type) => {
  try {
    const q = query(
      collection(db, COMPLAINTS_COLLECTION),
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting complaints by type:', error);
    throw error;
  }
};
