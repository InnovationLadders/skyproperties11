import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PERMIT_STATUS, PERMIT_TYPES, USER_ROLES } from './constants';
import { notifyPermitRequested, notifyPermitStatusChanged } from './internalNotificationsService';

export const createPermitRequest = async (permitData, userProfile) => {
  try {
    const permit = {
      userId: userProfile.uid,
      userName: userProfile.displayName || userProfile.email,
      userEmail: userProfile.email,
      userRole: userProfile.role,
      propertyId: permitData.propertyId,
      propertyName: permitData.propertyName,
      unitId: permitData.unitId || null,
      unitNumber: permitData.unitNumber || null,
      accessTypes: permitData.accessTypes || [],
      startDate: Timestamp.fromDate(new Date(permitData.startDate)),
      endDate: Timestamp.fromDate(new Date(permitData.endDate)),
      governmentId: permitData.governmentId || '',
      passportNumber: permitData.passportNumber || '',
      carPlateNumber: permitData.carPlateNumber || '',
      mobileNumber: permitData.mobileNumber || userProfile.phoneNumber || '',
      purpose: permitData.purpose || '',
      status: PERMIT_STATUS.PENDING,
      qrCode: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log('Creating permit request:', {
      userId: permit.userId,
      propertyId: permit.propertyId,
      accessTypes: permit.accessTypes,
    });

    const docRef = await addDoc(collection(db, 'permits'), permit);
    console.log('Permit request created successfully with ID:', docRef.id);

    const createdPermit = { id: docRef.id, ...permit };
    await notifyPermitRequested(createdPermit, permit.userName).catch(err =>
      console.error('Error sending notification:', err)
    );

    return createdPermit;
  } catch (error) {
    console.error('Error creating permit request:', error);
    throw error;
  }
};

export const getPermitById = async (permitId) => {
  try {
    const permitDoc = await getDoc(doc(db, 'permits', permitId));
    if (permitDoc.exists()) {
      return { id: permitDoc.id, ...permitDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting permit:', error);
    throw error;
  }
};

export const getUserPermits = async (userId) => {
  try {
    const q = query(
      collection(db, 'permits'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const permits = [];
    querySnapshot.forEach((doc) => {
      permits.push({ id: doc.id, ...doc.data() });
    });

    permits.sort((a, b) => {
      const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });

    return permits;
  } catch (error) {
    console.error('Error getting user permits:', error);
    throw error;
  }
};

export const getAllPermits = async (filters = {}) => {
  try {
    console.log('[getAllPermits] Called with filters:', filters);
    let managedPropertyIds = [];

    if (filters.managerId) {
      console.log('[getAllPermits] Fetching properties for managerId:', filters.managerId);
      const propertiesSnapshot = await getDocs(
        query(collection(db, 'properties'), where('managerId', '==', filters.managerId))
      );
      managedPropertyIds = propertiesSnapshot.docs.map((doc) => doc.id);
      console.log('[getAllPermits] Found managed properties:', managedPropertyIds);

      if (managedPropertyIds.length === 0) {
        console.log('[getAllPermits] No properties found for this manager. Returning empty array.');
        return [];
      }
    }

    let permits = [];

    if (filters.managerId && managedPropertyIds.length > 0) {
      console.log('[getAllPermits] Querying permits for managed properties');
      for (let i = 0; i < managedPropertyIds.length; i += 10) {
        const batch = managedPropertyIds.slice(i, i + 10);
        console.log('[getAllPermits] Processing batch:', batch);
        const constraints = [where('propertyId', 'in', batch)];

        if (filters.status) {
          constraints.push(where('status', '==', filters.status));
        }

        if (filters.userId) {
          constraints.push(where('userId', '==', filters.userId));
        }

        if (filters.userRole) {
          constraints.push(where('userRole', '==', filters.userRole));
        }

        const q = query(collection(db, 'permits'), ...constraints);
        const querySnapshot = await getDocs(q);
        console.log('[getAllPermits] Batch returned', querySnapshot.size, 'permits');
        querySnapshot.forEach((doc) => {
          const permitData = { id: doc.id, ...doc.data() };
          console.log('[getAllPermits] Found permit:', {
            id: permitData.id,
            propertyId: permitData.propertyId,
            status: permitData.status,
            userName: permitData.userName
          });
          permits.push(permitData);
        });
      }

      permits.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      console.log('[getAllPermits] Total permits found for manager:', permits.length);
    } else {
      console.log('[getAllPermits] Querying all permits (no manager filter)');
      const constraints = [];

      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters.userId) {
        constraints.push(where('userId', '==', filters.userId));
      }

      if (filters.propertyId) {
        constraints.push(where('propertyId', '==', filters.propertyId));
      }

      if (filters.userRole) {
        constraints.push(where('userRole', '==', filters.userRole));
      }

      let q;
      if (constraints.length > 0) {
        q = query(collection(db, 'permits'), ...constraints);
      } else {
        q = collection(db, 'permits');
      }

      const querySnapshot = await getDocs(q);
      console.log('[getAllPermits] Query returned', querySnapshot.size, 'permits');
      querySnapshot.forEach((doc) => {
        permits.push({ id: doc.id, ...doc.data() });
      });

      permits.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
    }

    console.log('[getAllPermits] Returning', permits.length, 'permits');
    return permits;
  } catch (error) {
    console.error('[getAllPermits] Error:', error);
    throw error;
  }
};

export const approvePermit = async (permitId, approvedBy, qrCodeData) => {
  try {
    const permitRef = doc(db, 'permits', permitId);
    const permitDoc = await getDoc(permitRef);
    const permitData = permitDoc.data();

    await updateDoc(permitRef, {
      status: PERMIT_STATUS.APPROVED,
      approvedBy: approvedBy,
      approvedAt: Timestamp.now(),
      qrCode: qrCodeData,
      updatedAt: Timestamp.now(),
    });

    const updatedPermit = { id: permitId, ...permitData, status: PERMIT_STATUS.APPROVED };
    await notifyPermitStatusChanged(updatedPermit, 'approved').catch(err =>
      console.error('Error sending notification:', err)
    );

    console.log('Permit approved successfully:', permitId);
  } catch (error) {
    console.error('Error approving permit:', error);
    throw error;
  }
};

export const rejectPermit = async (permitId, rejectedBy, rejectionReason) => {
  try {
    const permitRef = doc(db, 'permits', permitId);
    const permitDoc = await getDoc(permitRef);
    const permitData = permitDoc.data();

    await updateDoc(permitRef, {
      status: PERMIT_STATUS.REJECTED,
      rejectedBy: rejectedBy,
      rejectedAt: Timestamp.now(),
      rejectionReason: rejectionReason || '',
      updatedAt: Timestamp.now(),
    });

    const updatedPermit = { id: permitId, ...permitData, status: PERMIT_STATUS.REJECTED };
    await notifyPermitStatusChanged(updatedPermit, 'rejected', rejectionReason).catch(err =>
      console.error('Error sending notification:', err)
    );

    console.log('Permit rejected successfully:', permitId);
  } catch (error) {
    console.error('Error rejecting permit:', error);
    throw error;
  }
};

export const revokePermit = async (permitId, revokedBy, revocationReason) => {
  try {
    const permitRef = doc(db, 'permits', permitId);
    const permitDoc = await getDoc(permitRef);
    const permitData = permitDoc.data();

    await updateDoc(permitRef, {
      status: PERMIT_STATUS.REVOKED,
      revokedBy: revokedBy,
      revokedAt: Timestamp.now(),
      revocationReason: revocationReason || '',
      updatedAt: Timestamp.now(),
    });

    const updatedPermit = { id: permitId, ...permitData, status: PERMIT_STATUS.REVOKED };
    await notifyPermitStatusChanged(updatedPermit, 'revoked', revocationReason).catch(err =>
      console.error('Error sending notification:', err)
    );

    console.log('Permit revoked successfully:', permitId);
  } catch (error) {
    console.error('Error revoking permit:', error);
    throw error;
  }
};

export const extendPermit = async (permitId, newEndDate, extendedBy) => {
  try {
    const permitRef = doc(db, 'permits', permitId);
    await updateDoc(permitRef, {
      endDate: Timestamp.fromDate(new Date(newEndDate)),
      extendedBy: extendedBy,
      extendedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('Permit extended successfully:', permitId);
  } catch (error) {
    console.error('Error extending permit:', error);
    throw error;
  }
};

export const getActivePermits = async (userId) => {
  try {
    const now = Timestamp.now();
    const q = query(
      collection(db, 'permits'),
      where('userId', '==', userId),
      where('status', '==', PERMIT_STATUS.APPROVED)
    );
    const querySnapshot = await getDocs(q);
    const permits = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.endDate && data.endDate.toMillis() >= now.toMillis()) {
        permits.push({ id: doc.id, ...data });
      }
    });
    return permits;
  } catch (error) {
    console.error('Error getting active permits:', error);
    throw error;
  }
};

export const getPendingPermitsCount = async () => {
  try {
    const q = query(
      collection(db, 'permits'),
      where('status', '==', PERMIT_STATUS.PENDING)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting pending permits count:', error);
    throw error;
  }
};

export const isPermitActive = (permit) => {
  if (!permit) return false;
  if (permit.status !== PERMIT_STATUS.APPROVED) return false;
  const now = new Date();
  const endDate = permit.endDate?.toDate ? permit.endDate.toDate() : new Date(permit.endDate);
  return endDate >= now;
};

export const generatePermitQRData = (permitId) => {
  return JSON.stringify({
    permitId,
    verificationToken: `PERMIT-${permitId}-${Date.now()}`,
    timestamp: new Date().toISOString(),
  });
};
