import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CONTRACT_STATUS } from './constants';
import { notifyContractExpiring, notifyContractCreated, notifyContractExpired, notifyContractRenewed } from './internalNotificationsService';

export const createContract = async (contractData) => {
  try {
    const newDocRef = doc(collection(db, 'contracts'));
    const contract = {
      ...contractData,
      startDate: typeof contractData.startDate === 'string'
        ? contractData.startDate
        : new Date(contractData.startDate).toISOString(),
      endDate: typeof contractData.endDate === 'string'
        ? contractData.endDate
        : new Date(contractData.endDate).toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(newDocRef, contract);

    const createdContract = { id: newDocRef.id, ...contract };
    await notifyContractCreated(createdContract).catch(err =>
      console.error('Error sending contract creation notification:', err)
    );

    return { success: true, contractId: newDocRef.id };
  } catch (error) {
    console.error('Error creating contract:', error);
    return { success: false, error: error.message };
  }
};

export const updateContract = async (contractId, contractData) => {
  try {
    const contractRef = doc(db, 'contracts', contractId);
    const updates = {
      ...contractData,
      updatedAt: serverTimestamp(),
    };

    if (contractData.startDate) {
      updates.startDate = typeof contractData.startDate === 'string'
        ? contractData.startDate
        : new Date(contractData.startDate).toISOString();
    }

    if (contractData.endDate) {
      updates.endDate = typeof contractData.endDate === 'string'
        ? contractData.endDate
        : new Date(contractData.endDate).toISOString();
    }

    await updateDoc(contractRef, updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating contract:', error);
    return { success: false, error: error.message };
  }
};

export const getContractById = async (contractId) => {
  try {
    const contractDoc = await getDoc(doc(db, 'contracts', contractId));
    if (!contractDoc.exists()) {
      return null;
    }
    return { id: contractDoc.id, ...contractDoc.data() };
  } catch (error) {
    console.error('Error fetching contract:', error);
    return null;
  }
};

export const getAllContracts = async (filters = {}) => {
  try {
    let q = collection(db, 'contracts');
    const constraints = [];

    if (filters.tenantId) {
      constraints.push(where('tenantId', '==', filters.tenantId));
    }

    if (filters.propertyId) {
      constraints.push(where('propertyId', '==', filters.propertyId));
    }

    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }

    if (filters.type) {
      constraints.push(where('type', '==', filters.type));
    }

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);
    const contracts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contracts.sort((a, b) => {
      const aDate = new Date(a.startDate);
      const bDate = new Date(b.startDate);
      return bDate - aDate;
    });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return [];
  }
};

export const checkExpiringContracts = async (daysThreshold = 30) => {
  try {
    const now = new Date();
    const thresholdDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

    const q = query(
      collection(db, 'contracts'),
      where('status', '==', CONTRACT_STATUS.ACTIVE)
    );

    const snapshot = await getDocs(q);
    const expiringContracts = [];

    for (const docSnapshot of snapshot.docs) {
      const contract = { id: docSnapshot.id, ...docSnapshot.data() };
      const endDate = new Date(contract.endDate);

      if (endDate > now && endDate <= thresholdDate) {
        const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

        await notifyContractExpiring(contract, daysUntilExpiry);

        await updateDoc(doc(db, 'contracts', contract.id), {
          status: CONTRACT_STATUS.EXPIRING,
          updatedAt: serverTimestamp(),
        });

        expiringContracts.push({ ...contract, daysUntilExpiry });
      }
    }

    return expiringContracts;
  } catch (error) {
    console.error('Error checking expiring contracts:', error);
    return [];
  }
};

export const checkExpiredContracts = async () => {
  try {
    const now = new Date();

    const q = query(
      collection(db, 'contracts'),
      where('status', 'in', [CONTRACT_STATUS.ACTIVE, CONTRACT_STATUS.EXPIRING])
    );

    const snapshot = await getDocs(q);
    const expiredContracts = [];

    for (const docSnapshot of snapshot.docs) {
      const contract = { id: docSnapshot.id, ...docSnapshot.data() };
      const endDate = new Date(contract.endDate);

      if (endDate < now) {
        await updateDoc(doc(db, 'contracts', contract.id), {
          status: CONTRACT_STATUS.EXPIRED,
          updatedAt: serverTimestamp(),
        });

        await notifyContractExpired(contract).catch(err =>
          console.error('Error sending contract expiration notification:', err)
        );

        expiredContracts.push(contract);
      }
    }

    return expiredContracts;
  } catch (error) {
    console.error('Error checking expired contracts:', error);
    return [];
  }
};

export const renewContract = async (oldContractId, newContractData) => {
  try {
    const oldContract = await getContractById(oldContractId);
    if (!oldContract) {
      return { success: false, error: 'Contract not found' };
    }

    await updateDoc(doc(db, 'contracts', oldContractId), {
      status: CONTRACT_STATUS.EXPIRED,
      renewedBy: newContractData.renewedById || null,
      updatedAt: serverTimestamp(),
    });

    const newContract = {
      ...newContractData,
      type: oldContract.type,
      propertyId: oldContract.propertyId,
      unitId: oldContract.unitId,
      partyAId: oldContract.partyAId,
      partyBId: oldContract.partyBId,
      previousContractId: oldContractId,
      status: CONTRACT_STATUS.ACTIVE,
    };

    const result = await createContract(newContract);

    if (result.success) {
      const renewedContract = { id: result.contractId, ...newContract };
      await notifyContractRenewed(renewedContract, oldContractId).catch(err =>
        console.error('Error sending contract renewal notification:', err)
      );
    }

    return result;
  } catch (error) {
    console.error('Error renewing contract:', error);
    return { success: false, error: error.message };
  }
};

export const getContractsByTenant = async (tenantId) => {
  try {
    const q = query(
      collection(db, 'contracts'),
      where('tenantId', '==', tenantId),
      orderBy('startDate', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching tenant contracts:', error);
    return [];
  }
};

export const getContractsByProperty = async (propertyId) => {
  try {
    const q = query(
      collection(db, 'contracts'),
      where('propertyId', '==', propertyId),
      orderBy('startDate', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching property contracts:', error);
    return [];
  }
};

export const getActiveContractForUnit = async (unitId) => {
  try {
    const q = query(
      collection(db, 'contracts'),
      where('unitId', '==', unitId),
      where('status', '==', CONTRACT_STATUS.ACTIVE)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    };
  } catch (error) {
    console.error('Error fetching active contract for unit:', error);
    return null;
  }
};
