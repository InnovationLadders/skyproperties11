import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TICKET_STATUS, BILL_STATUS, CONTRACT_STATUS, BOOKING_STATUS, PERMIT_STATUS, UNIT_STATUS } from './constants';

export const getDateRange = (period) => {
  const now = new Date();
  const startDate = new Date();
  const endDate = new Date();

  switch (period) {
    case 'monthly':
      startDate.setMonth(now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'quarterly':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate.setMonth(quarter * 3, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(quarter * 3 + 3, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'yearly':
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      break;
  }

  return { startDate, endDate };
};

export const getPreviousPeriodRange = (period) => {
  const { startDate, endDate } = getDateRange(period);
  const diff = endDate.getTime() - startDate.getTime();

  const prevEndDate = new Date(startDate.getTime() - 1);
  const prevStartDate = new Date(prevEndDate.getTime() - diff);

  return { startDate: prevStartDate, endDate: prevEndDate };
};

export const getTicketsReport = async (propertyId, startDate, endDate) => {
  try {
    if (!propertyId || !startDate || !endDate) {
      console.error('[getTicketsReport] Missing required parameters');
      return {
        period: { startDate, endDate },
        summary: { total: 0, open: 0, assigned: 0, inProgress: 0, completed: 0, rated: 0, closed: 0 },
        byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
        byCategory: { maintenance: 0, repair: 0, complaint: 0, inquiry: 0, request: 0 },
        metrics: { avgResponseTime: 0, avgResolutionTime: 0, completionRate: 0, avgRating: 0 },
        timeline: [],
        topIssues: [],
        slowestTickets: [],
        tickets: [],
      };
    }

    console.log('[getTicketsReport] Fetching tickets for property:', propertyId);
    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, where('propertyId', '==', propertyId));

    const snapshot = await getDocs(q);
    let tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter by date range in JavaScript to avoid composite index requirement
    tickets = tickets.filter(ticket => {
      if (!ticket.createdAt) return false;
      const createdDate = ticket.createdAt?.toDate?.() || new Date(ticket.createdAt);
      return createdDate >= startDate && createdDate <= endDate;
    });

    console.log('[getTicketsReport] Filtered tickets count:', tickets.length);

    const summary = {
      total: tickets.length,
      open: tickets.filter(t => t.status === TICKET_STATUS.OPEN).length,
      assigned: tickets.filter(t => t.status === TICKET_STATUS.ASSIGNED).length,
      inProgress: tickets.filter(t => t.status === TICKET_STATUS.IN_PROGRESS).length,
      completed: tickets.filter(t => t.status === TICKET_STATUS.COMPLETED).length,
      rated: tickets.filter(t => t.status === TICKET_STATUS.RATED).length,
      closed: tickets.filter(t => t.status === TICKET_STATUS.CLOSED).length,
    };

    const byPriority = {
      low: tickets.filter(t => t.priority === 'low').length,
      medium: tickets.filter(t => t.priority === 'medium').length,
      high: tickets.filter(t => t.priority === 'high').length,
      urgent: tickets.filter(t => t.priority === 'urgent').length,
    };

    const byCategory = {
      maintenance: tickets.filter(t => t.category === 'maintenance').length,
      repair: tickets.filter(t => t.category === 'repair').length,
      complaint: tickets.filter(t => t.category === 'complaint').length,
      inquiry: tickets.filter(t => t.category === 'inquiry').length,
      request: tickets.filter(t => t.category === 'request').length,
    };

    const completedTickets = tickets.filter(t =>
      t.status === TICKET_STATUS.COMPLETED ||
      t.status === TICKET_STATUS.RATED ||
      t.status === TICKET_STATUS.CLOSED
    );

    const calculateAvgTime = (tickets, startField, endField) => {
      if (tickets.length === 0) return 0;
      const times = tickets
        .filter(t => t[startField] && t[endField])
        .map(t => {
          const start = t[startField]?.toDate?.() || new Date(t[startField]);
          const end = t[endField]?.toDate?.() || new Date(t[endField]);
          return (end - start) / (1000 * 60 * 60);
        });
      return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    };

    const avgResponseTime = calculateAvgTime(
      tickets.filter(t => t.assignedAt),
      'createdAt',
      'assignedAt'
    );

    const avgResolutionTime = calculateAvgTime(
      completedTickets,
      'createdAt',
      'completedAt'
    );

    const ratedTickets = tickets.filter(t => t.rating);
    const avgRating = ratedTickets.length > 0
      ? ratedTickets.reduce((sum, t) => sum + (t.rating || 0), 0) / ratedTickets.length
      : 0;

    const metrics = {
      avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      completionRate: tickets.length > 0 ? completedTickets.length / tickets.length : 0,
      avgRating: Math.round(avgRating * 10) / 10,
    };

    const ticketsByDate = tickets.reduce((acc, ticket) => {
      const date = ticket.createdAt?.toDate?.()?.toLocaleDateString('en-CA') ||
                   new Date(ticket.createdAt).toLocaleDateString('en-CA');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const timeline = Object.entries(ticketsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const categoryIssues = {};
    tickets.forEach(ticket => {
      const key = `${ticket.category}-${ticket.title?.substring(0, 50)}`;
      categoryIssues[key] = (categoryIssues[key] || 0) + 1;
    });

    const topIssues = Object.entries(categoryIssues)
      .map(([issue, count]) => ({ issue: issue.split('-')[1] || issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const slowestTickets = completedTickets
      .filter(t => t.createdAt && t.completedAt)
      .map(t => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        title: t.title,
        resolutionTime: (
          (t.completedAt?.toDate?.() || new Date(t.completedAt)) -
          (t.createdAt?.toDate?.() || new Date(t.createdAt))
        ) / (1000 * 60 * 60),
      }))
      .sort((a, b) => b.resolutionTime - a.resolutionTime)
      .slice(0, 10);

    return {
      period: { startDate, endDate },
      summary,
      byPriority,
      byCategory,
      metrics,
      timeline,
      topIssues,
      slowestTickets,
      tickets,
    };
  } catch (error) {
    console.error('[getTicketsReport] Error fetching tickets report:', error);
    return {
      period: { startDate, endDate },
      summary: { total: 0, open: 0, assigned: 0, inProgress: 0, completed: 0, rated: 0, closed: 0 },
      byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
      byCategory: { maintenance: 0, repair: 0, complaint: 0, inquiry: 0, request: 0 },
      metrics: { avgResponseTime: 0, avgResolutionTime: 0, completionRate: 0, avgRating: 0 },
      timeline: [],
      topIssues: [],
      slowestTickets: [],
      tickets: [],
    };
  }
};

export const getUnitsReport = async (propertyId, startDate, endDate) => {
  try {
    if (!propertyId) {
      console.error('[getUnitsReport] Missing propertyId');
      return {
        period: { startDate, endDate },
        summary: { total: 0, available: 0, reserved: 0, sold: 0, rented: 0 },
        occupancyRate: 0,
        byCategory: { normal: 0, facility: 0 },
        units: [],
      };
    }

    console.log('[getUnitsReport] Fetching units for property:', propertyId);
    const unitsRef = collection(db, 'units');
    const q = query(unitsRef, where('propertyId', '==', propertyId));
    const snapshot = await getDocs(q);
    const units = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const summary = {
      total: units.length,
      available: units.filter(u => u.status === UNIT_STATUS.AVAILABLE).length,
      reserved: units.filter(u => u.status === UNIT_STATUS.RESERVED).length,
      sold: units.filter(u => u.status === UNIT_STATUS.SOLD).length,
      rented: units.filter(u => u.status === UNIT_STATUS.RENTED).length,
    };

    const occupancyRate = units.length > 0
      ? ((summary.sold + summary.rented + summary.reserved) / units.length) * 100
      : 0;

    const byCategory = {
      normal: units.filter(u => u.category === 'normal').length,
      facility: units.filter(u => u.category === 'facility').length,
    };

    return {
      period: { startDate, endDate },
      summary,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      byCategory,
      units,
    };
  } catch (error) {
    console.error('[getUnitsReport] Error fetching units report:', error);
    return {
      period: { startDate, endDate },
      summary: { total: 0, available: 0, reserved: 0, sold: 0, rented: 0 },
      occupancyRate: 0,
      byCategory: { normal: 0, facility: 0 },
      units: [],
    };
  }
};

export const getContractsReport = async (propertyId, startDate, endDate) => {
  try {
    if (!propertyId || !startDate || !endDate) {
      console.error('[getContractsReport] Missing required parameters');
      return {
        period: { startDate, endDate },
        summary: { total: 0, draft: 0, active: 0, expiring: 0, expired: 0, terminated: 0 },
        byType: { rent: 0, operations: 0, maintenance: 0 },
        totalValue: 0,
        expiringContracts: [],
        contracts: [],
      };
    }

    console.log('[getContractsReport] Fetching contracts for property:', propertyId);
    const contractsRef = collection(db, 'contracts');
    const q = query(contractsRef, where('propertyId', '==', propertyId));
    const snapshot = await getDocs(q);
    const allContracts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter by date range in JavaScript
    const contracts = allContracts.filter(c => {
      if (!c.createdAt) return false;
      const createdDate = c.createdAt?.toDate?.() || new Date(c.createdAt);
      return createdDate >= startDate && createdDate <= endDate;
    });

    console.log('[getContractsReport] Filtered contracts count:', contracts.length);

    const summary = {
      total: contracts.length,
      draft: contracts.filter(c => c.status === CONTRACT_STATUS.DRAFT).length,
      active: contracts.filter(c => c.status === CONTRACT_STATUS.ACTIVE).length,
      expiring: contracts.filter(c => c.status === CONTRACT_STATUS.EXPIRING).length,
      expired: contracts.filter(c => c.status === CONTRACT_STATUS.EXPIRED).length,
      terminated: contracts.filter(c => c.status === CONTRACT_STATUS.TERMINATED).length,
    };

    const byType = {
      rent: contracts.filter(c => c.type === 'rent').length,
      operations: contracts.filter(c => c.type === 'operations').length,
      maintenance: contracts.filter(c => c.type === 'maintenance').length,
    };

    const totalValue = contracts.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

    const expiringContracts = allContracts.filter(c => {
      if (!c.endDate) return false;
      const endDate = c.endDate?.toDate?.() || new Date(c.endDate);
      const daysUntilExpiry = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 90;
    });

    return {
      period: { startDate, endDate },
      summary,
      byType,
      totalValue,
      expiringContracts,
      contracts,
    };
  } catch (error) {
    console.error('[getContractsReport] Error fetching contracts report:', error);
    return {
      period: { startDate, endDate },
      summary: { total: 0, draft: 0, active: 0, expiring: 0, expired: 0, terminated: 0 },
      byType: { rent: 0, operations: 0, maintenance: 0 },
      totalValue: 0,
      expiringContracts: [],
      contracts: [],
    };
  }
};

export const getBillingReport = async (propertyId, startDate, endDate) => {
  try {
    if (!propertyId || !startDate || !endDate) {
      console.error('[getBillingReport] Missing required parameters');
      return {
        period: { startDate, endDate },
        summary: { total: 0, unpaid: 0, pending: 0, paid: 0, overdue: 0, cancelled: 0 },
        byType: { rent: 0, commission: 0, serviceFees: 0, other: 0 },
        totalIssued: 0,
        totalCollected: 0,
        totalOutstanding: 0,
        collectionRate: 0,
        bills: [],
      };
    }

    console.log('[getBillingReport] Fetching bills for property:', propertyId);
    const billsRef = collection(db, 'bills');

    // Query by propertyId first (more efficient than createdAt range)
    // We'll get all bills for this property, then filter by date in JS
    const unitsRef = collection(db, 'units');
    const unitsQuery = query(unitsRef, where('propertyId', '==', propertyId));
    const unitsSnapshot = await getDocs(unitsQuery);
    const unitIds = unitsSnapshot.docs.map(doc => doc.id);

    // Get all bills (we need to check both propertyId and unitId)
    const snapshot = await getDocs(billsRef);
    let bills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter by property and date range in JavaScript
    bills = bills.filter(bill => {
      // Check if bill belongs to this property
      const belongsToProperty = bill.propertyId === propertyId ||
                               (bill.unitId && unitIds.includes(bill.unitId));

      if (!belongsToProperty) return false;

      // Check date range
      if (!bill.createdAt) return false;
      const createdDate = bill.createdAt?.toDate?.() || new Date(bill.createdAt);
      return createdDate >= startDate && createdDate <= endDate;
    });

    console.log('[getBillingReport] Filtered bills count:', bills.length);

    const summary = {
      total: bills.length,
      unpaid: bills.filter(b => b.status === BILL_STATUS.UNPAID).length,
      pending: bills.filter(b => b.status === BILL_STATUS.PENDING).length,
      paid: bills.filter(b => b.status === BILL_STATUS.PAID).length,
      overdue: bills.filter(b => b.status === BILL_STATUS.OVERDUE).length,
      cancelled: bills.filter(b => b.status === BILL_STATUS.CANCELLED).length,
    };

    const totalIssued = bills.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
    const totalCollected = bills
      .filter(b => b.status === BILL_STATUS.PAID)
      .reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
    const totalOutstanding = bills
      .filter(b => b.status === BILL_STATUS.UNPAID || b.status === BILL_STATUS.OVERDUE)
      .reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);

    const collectionRate = totalIssued > 0 ? (totalCollected / totalIssued) * 100 : 0;

    const byType = {
      rent: bills.filter(b => b.type === 'rent').length,
      commission: bills.filter(b => b.type === 'commission').length,
      serviceFees: bills.filter(b => b.type === 'serviceFees').length,
      other: bills.filter(b => b.type === 'other').length,
    };

    return {
      period: { startDate, endDate },
      summary,
      byType,
      totalIssued,
      totalCollected,
      totalOutstanding,
      collectionRate: Math.round(collectionRate * 10) / 10,
      bills,
    };
  } catch (error) {
    console.error('[getBillingReport] Error fetching billing report:', error);
    return {
      period: { startDate, endDate },
      summary: { total: 0, unpaid: 0, pending: 0, paid: 0, overdue: 0, cancelled: 0 },
      byType: { rent: 0, commission: 0, serviceFees: 0, other: 0 },
      totalIssued: 0,
      totalCollected: 0,
      totalOutstanding: 0,
      collectionRate: 0,
      bills: [],
    };
  }
};

export const getBookingsReport = async (propertyId, startDate, endDate) => {
  try {
    if (!propertyId || !startDate || !endDate) {
      console.error('[getBookingsReport] Missing required parameters');
      return {
        period: { startDate, endDate },
        summary: { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0, completed: 0 },
        approvalRate: 0,
        facilityUsage: {},
        totalRevenue: 0,
        bookings: [],
      };
    }

    console.log('[getBookingsReport] Fetching bookings for property:', propertyId);
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('propertyId', '==', propertyId));
    const snapshot = await getDocs(q);
    let bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter by date range in JavaScript
    bookings = bookings.filter(booking => {
      if (!booking.createdAt) return false;
      const createdDate = booking.createdAt?.toDate?.() || new Date(booking.createdAt);
      return createdDate >= startDate && createdDate <= endDate;
    });

    console.log('[getBookingsReport] Filtered bookings count:', bookings.length);

    const summary = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === BOOKING_STATUS.PENDING).length,
      approved: bookings.filter(b => b.status === BOOKING_STATUS.APPROVED).length,
      rejected: bookings.filter(b => b.status === BOOKING_STATUS.REJECTED).length,
      cancelled: bookings.filter(b => b.status === BOOKING_STATUS.CANCELLED).length,
      completed: bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED).length,
    };

    const approvalRate = bookings.length > 0
      ? (summary.approved / bookings.length) * 100
      : 0;

    const facilityUsage = bookings.reduce((acc, b) => {
      acc[b.unitId] = (acc[b.unitId] || 0) + 1;
      return acc;
    }, {});

    const totalRevenue = bookings
      .filter(b => b.status === BOOKING_STATUS.APPROVED || b.status === BOOKING_STATUS.COMPLETED)
      .reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0);

    return {
      period: { startDate, endDate },
      summary,
      approvalRate: Math.round(approvalRate * 10) / 10,
      facilityUsage,
      totalRevenue,
      bookings,
    };
  } catch (error) {
    console.error('[getBookingsReport] Error fetching bookings report:', error);
    return {
      period: { startDate, endDate },
      summary: { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0, completed: 0 },
      approvalRate: 0,
      facilityUsage: {},
      totalRevenue: 0,
      bookings: [],
    };
  }
};

export const getPermitsReport = async (propertyId, startDate, endDate) => {
  try {
    if (!propertyId || !startDate || !endDate) {
      console.error('[getPermitsReport] Missing required parameters');
      return {
        period: { startDate, endDate },
        summary: { total: 0, pending: 0, approved: 0, rejected: 0, active: 0, expired: 0, revoked: 0 },
        approvalRate: 0,
        byType: {},
        permits: [],
      };
    }

    console.log('[getPermitsReport] Fetching permits for property:', propertyId);
    const permitsRef = collection(db, 'permits');
    const q = query(permitsRef, where('propertyId', '==', propertyId));
    const snapshot = await getDocs(q);
    let permits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter by date range in JavaScript
    permits = permits.filter(permit => {
      if (!permit.createdAt) return false;
      const createdDate = permit.createdAt?.toDate?.() || new Date(permit.createdAt);
      return createdDate >= startDate && createdDate <= endDate;
    });

    console.log('[getPermitsReport] Filtered permits count:', permits.length);

    const summary = {
      total: permits.length,
      pending: permits.filter(p => p.status === PERMIT_STATUS.PENDING).length,
      approved: permits.filter(p => p.status === PERMIT_STATUS.APPROVED).length,
      rejected: permits.filter(p => p.status === PERMIT_STATUS.REJECTED).length,
      active: permits.filter(p => p.status === PERMIT_STATUS.ACTIVE).length,
      expired: permits.filter(p => p.status === PERMIT_STATUS.EXPIRED).length,
      revoked: permits.filter(p => p.status === PERMIT_STATUS.REVOKED).length,
    };

    const approvalRate = permits.length > 0
      ? (summary.approved / permits.length) * 100
      : 0;

    const byType = permits.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {});

    return {
      period: { startDate, endDate },
      summary,
      approvalRate: Math.round(approvalRate * 10) / 10,
      byType,
      permits,
    };
  } catch (error) {
    console.error('[getPermitsReport] Error fetching permits report:', error);
    return {
      period: { startDate, endDate },
      summary: { total: 0, pending: 0, approved: 0, rejected: 0, active: 0, expired: 0, revoked: 0 },
      approvalRate: 0,
      byType: {},
      permits: [],
    };
  }
};

export const getComparisonData = async (propertyId, period) => {
  try {
    if (!propertyId || !period) {
      console.error('[getComparisonData] Missing required parameters');
      return {
        tickets: { current: 0, previous: 0, change: 0 },
        completionRate: { current: 0, previous: 0, change: 0 },
        avgResolutionTime: { current: 0, previous: 0, change: 0 },
      };
    }

    console.log('[getComparisonData] Fetching comparison data for:', propertyId, period);
    const currentRange = getDateRange(period);
    const previousRange = getPreviousPeriodRange(period);

    const currentTickets = await getTicketsReport(
      propertyId,
      currentRange.startDate,
      currentRange.endDate
    );
    const previousTickets = await getTicketsReport(
      propertyId,
      previousRange.startDate,
      previousRange.endDate
    );

    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      tickets: {
        current: currentTickets.summary.total,
        previous: previousTickets.summary.total,
        change: calculateChange(currentTickets.summary.total, previousTickets.summary.total),
      },
      completionRate: {
        current: currentTickets.metrics.completionRate * 100,
        previous: previousTickets.metrics.completionRate * 100,
        change: calculateChange(
          currentTickets.metrics.completionRate,
          previousTickets.metrics.completionRate
        ),
      },
      avgResolutionTime: {
        current: currentTickets.metrics.avgResolutionTime,
        previous: previousTickets.metrics.avgResolutionTime,
        change: calculateChange(
          previousTickets.metrics.avgResolutionTime,
          currentTickets.metrics.avgResolutionTime
        ),
      },
    };
  } catch (error) {
    console.error('[getComparisonData] Error fetching comparison data:', error);
    return {
      tickets: { current: 0, previous: 0, change: 0 },
      completionRate: { current: 0, previous: 0, change: 0 },
      avgResolutionTime: { current: 0, previous: 0, change: 0 },
    };
  }
};

export const getOverviewReport = async (propertyId, startDate, endDate) => {
  try {
    if (!propertyId || !startDate || !endDate) {
      console.error('[getOverviewReport] Missing required parameters');
      throw new Error('Missing required parameters for overview report');
    }

    console.log('[getOverviewReport] Fetching overview for property:', propertyId);

    // Use Promise.allSettled to get all reports even if some fail
    const results = await Promise.allSettled([
      getTicketsReport(propertyId, startDate, endDate),
      getUnitsReport(propertyId, startDate, endDate),
      getContractsReport(propertyId, startDate, endDate),
      getBillingReport(propertyId, startDate, endDate),
      getBookingsReport(propertyId, startDate, endDate),
      getPermitsReport(propertyId, startDate, endDate),
    ]);

    // Extract data from settled promises, use default values for failed ones
    const reportNames = ['tickets', 'units', 'contracts', 'billing', 'bookings', 'permits'];
    const [tickets, units, contracts, billing, bookings, permits] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`[getOverviewReport] ${reportNames[index]} report failed:`, result.reason);
        // Return the default error value from the failed function
        return result.reason || {};
      }
    });

    console.log('[getOverviewReport] Overview report completed');

    return {
      period: { startDate, endDate },
      tickets,
      units,
      contracts,
      billing,
      bookings,
      permits,
    };
  } catch (error) {
    console.error('[getOverviewReport] Error fetching overview report:', error);
    throw error;
  }
};
