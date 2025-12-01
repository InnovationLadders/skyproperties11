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
import { BILL_STATUS, BILL_TYPES } from './constants';
import { notifyBillIssued, notifyBillPaid, notifyBillOverdue, notifyBillReminder } from './internalNotificationsService';

export const createBill = async (billData) => {
  try {
    const bill = {
      ...billData,
      issueDate: billData.issueDate || Timestamp.now(),
      dueDate: Timestamp.fromDate(new Date(billData.dueDate)),
      status: BILL_STATUS.UNPAID,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log('Creating bill with data:', {
      recipientId: bill.recipientId,
      recipientName: bill.recipientName,
      amount: bill.amount,
      billType: bill.billType,
    });

    const docRef = await addDoc(collection(db, 'bills'), bill);
    console.log('Bill created successfully with ID:', docRef.id);

    await notifyBillIssued(
      {
        id: docRef.id,
        ...bill,
      },
      bill.recipientName
    );

    return { id: docRef.id, ...bill };
  } catch (error) {
    console.error('Error creating bill:', error);
    throw error;
  }
};

export const getBillById = async (billId) => {
  try {
    const billDoc = await getDoc(doc(db, 'bills', billId));
    if (billDoc.exists()) {
      return { id: billDoc.id, ...billDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting bill:', error);
    throw error;
  }
};

export const getAllBills = async (filters = {}) => {
  try {
    let q = collection(db, 'bills');
    const constraints = [];

    if (filters.recipientId) {
      console.log('Querying bills with recipientId:', filters.recipientId);
      constraints.push(where('recipientId', '==', filters.recipientId));
    }

    if (filters.recipientType) {
      constraints.push(where('recipientType', '==', filters.recipientType));
    }

    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }

    if (filters.billType) {
      constraints.push(where('billType', '==', filters.billType));
    }

    if (filters.issuedBy) {
      constraints.push(where('issuedBy', '==', filters.issuedBy));
    }

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);
    let bills = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log(`Found ${bills.length} bills matching filters:`, filters);

    bills.sort((a, b) => {
      const aDate = a.dueDate?.toDate?.() || new Date(a.dueDate);
      const bDate = b.dueDate?.toDate?.() || new Date(b.dueDate);
      return bDate - aDate;
    });

    return bills;
  } catch (error) {
    console.error('Error getting bills:', error);
    console.error('Error details:', error.message, error.code);
    throw error;
  }
};

export const updateBill = async (billId, updates) => {
  try {
    const billRef = doc(db, 'bills', billId);
    await updateDoc(billRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating bill:', error);
    throw error;
  }
};

export const updateBillStatus = async (billId, status) => {
  try {
    const billRef = doc(db, 'bills', billId);
    await updateDoc(billRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating bill status:', error);
    throw error;
  }
};

export const deleteBill = async (billId) => {
  try {
    await deleteDoc(doc(db, 'bills', billId));
  } catch (error) {
    console.error('Error deleting bill:', error);
    throw error;
  }
};

export const recordPayment = async (billId, paymentData) => {
  try {
    const payment = {
      billId,
      ...paymentData,
      paymentDate: Timestamp.now(),
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'payments'), payment);

    const billDoc = await getDoc(doc(db, 'bills', billId));
    const billData = billDoc.exists() ? billDoc.data() : {};

    await updateBill(billId, {
      status: BILL_STATUS.PAID,
      paidAmount: paymentData.amount,
      paidDate: Timestamp.now(),
      transactionId: paymentData.transactionId,
    });

    await notifyBillPaid({
      id: billId,
      ...billData,
      recipientId: billData.recipientId,
      amount: paymentData.amount,
      currency: billData.currency || 'SAR',
    });

    return { id: docRef.id, ...payment };
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
};

export const getPaymentsByBillId = async (billId) => {
  try {
    const q = query(
      collection(db, 'payments'),
      where('billId', '==', billId)
    );
    const snapshot = await getDocs(q);
    const payments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    payments.sort((a, b) => {
      const aDate = a.paymentDate?.toDate?.() || new Date(a.paymentDate);
      const bDate = b.paymentDate?.toDate?.() || new Date(b.paymentDate);
      return bDate - aDate;
    });

    return payments;
  } catch (error) {
    console.error('Error getting payments:', error);
    throw error;
  }
};

export const checkOverdueBills = async () => {
  try {
    const now = Timestamp.now();
    const q = query(
      collection(db, 'bills'),
      where('status', '==', BILL_STATUS.UNPAID),
      where('dueDate', '<', now)
    );

    const snapshot = await getDocs(q);
    const overdueBills = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    for (const bill of overdueBills) {
      await updateBillStatus(bill.id, BILL_STATUS.OVERDUE);

      await notifyBillOverdue(bill).catch(err =>
        console.error('Error sending overdue notification:', err)
      );
    }

    return overdueBills;
  } catch (error) {
    console.error('Error checking overdue bills:', error);
    throw error;
  }
};

export const checkUpcomingBills = async (daysAhead = 3) => {
  try {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const q = query(
      collection(db, 'bills'),
      where('status', '==', BILL_STATUS.UNPAID),
      where('dueDate', '>=', Timestamp.now()),
      where('dueDate', '<=', Timestamp.fromDate(futureDate))
    );

    const snapshot = await getDocs(q);
    const upcomingBills = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    for (const bill of upcomingBills) {
      const dueDate = bill.dueDate.toDate();
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      await notifyBillReminder(bill, daysUntilDue).catch(err =>
        console.error('Error sending bill reminder:', err)
      );
    }

    return upcomingBills;
  } catch (error) {
    console.error('Error checking upcoming bills:', error);
    throw error;
  }
};

export const getBillingStatistics = async (userId = null, managedPropertyIds = null) => {
  try {
    let billsQuery = collection(db, 'bills');

    if (userId) {
      billsQuery = query(billsQuery, where('recipientId', '==', userId));
    }

    const billsSnapshot = await getDocs(billsQuery);
    let bills = billsSnapshot.docs.map((doc) => doc.data());

    if (managedPropertyIds && managedPropertyIds.length > 0) {
      const unitsSnapshot = await getDocs(collection(db, 'units'));
      const managedUnitIds = unitsSnapshot.docs
        .filter(doc => managedPropertyIds.includes(doc.data().propertyId))
        .map(doc => doc.id);

      bills = bills.filter(bill => managedUnitIds.includes(bill.unitId));
    }

    const stats = {
      totalBills: bills.length,
      unpaidBills: bills.filter((b) => b.status === BILL_STATUS.UNPAID).length,
      overdueBills: bills.filter((b) => b.status === BILL_STATUS.OVERDUE).length,
      paidBills: bills.filter((b) => b.status === BILL_STATUS.PAID).length,
      totalAmount: bills.reduce((sum, b) => sum + (b.amount || 0), 0),
      paidAmount: bills
        .filter((b) => b.status === BILL_STATUS.PAID)
        .reduce((sum, b) => sum + (b.paidAmount || 0), 0),
      outstandingAmount: bills
        .filter((b) => [BILL_STATUS.UNPAID, BILL_STATUS.OVERDUE].includes(b.status))
        .reduce((sum, b) => sum + (b.amount || 0), 0),
    };

    return stats;
  } catch (error) {
    console.error('Error getting billing statistics:', error);
    throw error;
  }
};
