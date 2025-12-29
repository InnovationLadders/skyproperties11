export const USER_ROLES = {
  ADMIN: 'admin',
  PROPERTY_MANAGER: 'propertyManager',
  UNIT_OWNER: 'unitOwner',
  TENANT: 'tenant',
  SERVICE_PROVIDER: 'serviceProvider',
  GUEST: 'guest',
  PUBLIC: 'public',
};

export const UNIT_CATEGORY = {
  NORMAL: 'normal',
  FACILITY: 'facility',
};

export const FACILITY_TYPES = {
  CAR_PARKING: 'carParking',
  OUTDOOR_PARK: 'outdoorPark',
  KIOSK: 'kiosk',
  MEETING_ROOM: 'meetingRoom',
  SWIMMING_POOL: 'swimmingPool',
  CONFERENCE_HALL: 'conferenceHall',
  GYM: 'gym',
  PLAYGROUND: 'playground',
  BBQ_AREA: 'bbqArea',
};

export const UNIT_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  SOLD: 'sold',
  RENTED: 'rented',
};

export const TICKET_STATUS = {
  OPEN: 'open',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  RATED: 'rated',
  CLOSED: 'closed',
};

export const HOTSPOT_TYPES = {
  SALE_EXTERNAL: 'saleExternal',
  SALE_INTERNAL: 'saleInternal',
  RENT_EXTERNAL: 'rentExternal',
  RENT_INTERNAL: 'rentInternal',
};

export const HOTSPOT_COLORS = {
  [HOTSPOT_TYPES.SALE_EXTERNAL]: '#22c55e',
  [HOTSPOT_TYPES.SALE_INTERNAL]: '#22c55e',
  [HOTSPOT_TYPES.RENT_EXTERNAL]: '#3b82f6',
  [HOTSPOT_TYPES.RENT_INTERNAL]: '#3b82f6',
};

export const CONTRACT_TYPES = {
  RENT: 'rent',
  OPERATIONS: 'operations',
  MAINTENANCE: 'maintenance',
};

export const CONTRACT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  EXPIRING: 'expiring',
  EXPIRED: 'expired',
  TERMINATED: 'terminated',
};

export const BILL_TYPES = {
  RENT: 'rent',
  COMMISSION: 'commission',
  SERVICE_FEES: 'serviceFees',
  OTHER: 'other',
};

export const BILL_STATUS = {
  UNPAID: 'unpaid',
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const NOTIFICATION_CHANNELS = {
  SMS: 'sms',
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
};

export const NOTIFICATION_TYPES = {
  BILL_ISSUED: 'billIssued',
  PAYMENT_REMINDER: 'paymentReminder',
  PAYMENT_CONFIRMED: 'paymentConfirmed',
  PAYMENT_FAILED: 'paymentFailed',
  OVERDUE_NOTICE: 'overdueNotice',
};

export const PAYMENT_METHODS = {
  VISA: 'visa',
  MASTERCARD: 'mastercard',
  MADA: 'mada',
  CASH: 'cash',
  BANK_TRANSFER: 'bankTransfer',
};

export const CURRENCY = {
  USD: 'USD',
  SAR: 'SAR',
  AED: 'AED',
};

export const PERMIT_TYPES = {
  MAIN_BUILDING: 'mainBuilding',
  PARKING: 'parking',
  UTILITY: 'utility',
};

export const PERMIT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
};

export const CONTACT_REQUEST_STATUS = {
  NEW: 'new',
  READ: 'read',
  RESPONDED: 'responded',
  CLOSED: 'closed',
};

export const BUSINESS_CATEGORIES = {
  CLINIC: 'clinic',
  OFFICE: 'office',
  RESTAURANT: 'restaurant',
  CAFE: 'cafe',
  SHOP: 'shop',
  GYM: 'gym',
  SALON: 'salon',
  PHARMACY: 'pharmacy',
  BANK: 'bank',
  EXCHANGE: 'exchange',
  TRAVEL_AGENCY: 'travelAgency',
  REAL_ESTATE: 'realEstate',
  EDUCATION: 'education',
  ENTERTAINMENT: 'entertainment',
  OTHER: 'other',
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const BOOKING_DURATION_TYPES = {
  HOURLY: 'hourly',
  HALF_DAY: 'halfDay',
  FULL_DAY: 'fullDay',
};

export const BOOKING_NOTIFICATION_TYPES = {
  BOOKING_CREATED: 'bookingCreated',
  BOOKING_APPROVED: 'bookingApproved',
  BOOKING_REJECTED: 'bookingRejected',
  BOOKING_CANCELLED: 'bookingCancelled',
  BOOKING_REMINDER: 'bookingReminder',
};

export const REPORT_PERIODS = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  CUSTOM: 'custom',
};

export const REPORT_TYPES = {
  TICKETS: 'tickets',
  UNITS: 'units',
  CONTRACTS: 'contracts',
  BILLING: 'billing',
  BOOKINGS: 'bookings',
  PERMITS: 'permits',
  OVERVIEW: 'overview',
};

export const TICKET_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const TICKET_CATEGORIES = {
  MAINTENANCE: 'maintenance',
  REPAIR: 'repair',
  COMPLAINT: 'complaint',
  INQUIRY: 'inquiry',
  REQUEST: 'request',
};

export const INTERNAL_NOTIFICATION_TYPES = {
  TICKET_CREATED: 'ticketCreated',
  TICKET_ASSIGNED: 'ticketAssigned',
  TICKET_STATUS_UPDATED: 'ticketStatusUpdated',
  TICKET_COMPLETED: 'ticketCompleted',
  TICKET_CLOSED: 'ticketClosed',
  TICKET_COMMENTED: 'ticketCommented',
  BILL_ISSUED: 'billIssued',
  BILL_REMINDER: 'billReminder',
  BILL_PAID: 'billPaid',
  BILL_OVERDUE: 'billOverdue',
  PERMIT_REQUESTED: 'permitRequested',
  PERMIT_APPROVED: 'permitApproved',
  PERMIT_REJECTED: 'permitRejected',
  PERMIT_REVOKED: 'permitRevoked',
  BOOKING_REQUESTED: 'bookingRequested',
  BOOKING_APPROVED: 'bookingApproved',
  BOOKING_REJECTED: 'bookingRejected',
  BOOKING_CANCELLED: 'bookingCancelled',
  BOOKING_REMINDER: 'bookingReminder',
  CONTRACT_CREATED: 'contractCreated',
  CONTRACT_EXPIRING: 'contractExpiring',
  CONTRACT_EXPIRED: 'contractExpired',
  CONTRACT_RENEWED: 'contractRenewed',
};

export const NOTIFICATION_CATEGORY = {
  TICKETS: 'tickets',
  BILLING: 'billing',
  PERMITS: 'permits',
  BOOKINGS: 'bookings',
  CONTRACTS: 'contracts',
  SYSTEM: 'system',
};

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
