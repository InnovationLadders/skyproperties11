import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { USER_ROLES } from './constants';

export const getManagedPropertyIds = async (managerId) => {
  try {
    if (!managerId) return [];

    const propertiesRef = collection(db, 'properties');
    const q = query(propertiesRef, where('managerId', '==', managerId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Error fetching managed properties:', error);
    return [];
  }
};

export const getUserUnitIds = async (userId) => {
  try {
    if (!userId) return [];

    const unitsRef = collection(db, 'units');
    const ownerQuery = query(unitsRef, where('ownerId', '==', userId));
    const tenantQuery = query(unitsRef, where('tenantId', '==', userId));

    const [ownerSnapshot, tenantSnapshot] = await Promise.all([
      getDocs(ownerQuery),
      getDocs(tenantQuery)
    ]);

    const unitIds = new Set();
    ownerSnapshot.docs.forEach(doc => unitIds.add(doc.id));
    tenantSnapshot.docs.forEach(doc => unitIds.add(doc.id));

    return Array.from(unitIds);
  } catch (error) {
    console.error('Error fetching user units:', error);
    return [];
  }
};

export const canManageProperty = (userRole, propertyId, managedPropertyIds = []) => {
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  if (userRole === USER_ROLES.PROPERTY_MANAGER) {
    return managedPropertyIds.includes(propertyId);
  }

  return false;
};

export const canAccessProperty = (userRole, propertyId, managedPropertyIds = []) => {
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  if (userRole === USER_ROLES.PROPERTY_MANAGER) {
    return managedPropertyIds.includes(propertyId);
  }

  return false;
};

export const isUnitOwner = (userId, unit) => {
  return unit && unit.ownerId === userId;
};

export const isUnitTenant = (userId, unit) => {
  return unit && unit.tenantId === userId;
};

export const canAccessUnit = (userRole, userId, unit, managedPropertyIds = []) => {
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  if (userRole === USER_ROLES.PROPERTY_MANAGER) {
    return managedPropertyIds.includes(unit?.propertyId);
  }

  return isUnitOwner(userId, unit) || isUnitTenant(userId, unit);
};

export const canCreateUnit = (userRole, propertyId, managedPropertyIds = []) => {
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  if (userRole === USER_ROLES.PROPERTY_MANAGER) {
    return managedPropertyIds.includes(propertyId);
  }

  return false;
};

export const canEditUnit = (userRole, unit, managedPropertyIds = []) => {
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  if (userRole === USER_ROLES.PROPERTY_MANAGER) {
    return managedPropertyIds.includes(unit?.propertyId);
  }

  return false;
};

export const canDeleteUnit = (userRole, unit, managedPropertyIds = []) => {
  return canEditUnit(userRole, unit, managedPropertyIds);
};

export const canCreateTicket = (userId, unit) => {
  return isUnitOwner(userId, unit) || isUnitTenant(userId, unit);
};

export const canManageTicket = (userRole, ticket, managedPropertyIds = []) => {
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  if (userRole === USER_ROLES.PROPERTY_MANAGER) {
    return managedPropertyIds.includes(ticket?.propertyId);
  }

  return false;
};

export const canViewTicket = (userRole, userId, ticket, managedPropertyIds = []) => {
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  if (userRole === USER_ROLES.PROPERTY_MANAGER) {
    return managedPropertyIds.includes(ticket?.propertyId);
  }

  if (userRole === USER_ROLES.SERVICE_PROVIDER) {
    return ticket?.assignedTo === userId;
  }

  return ticket?.createdBy === userId;
};

export const canCreateContract = (userRole, propertyId, managedPropertyIds = []) => {
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  if (userRole === USER_ROLES.PROPERTY_MANAGER) {
    return managedPropertyIds.includes(propertyId);
  }

  return false;
};

export const canViewContract = (userRole, userId, contract, managedPropertyIds = []) => {
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  if (userRole === USER_ROLES.PROPERTY_MANAGER) {
    return managedPropertyIds.includes(contract?.propertyId);
  }

  return contract?.tenantId === userId || contract?.ownerId === userId;
};

export const canEditContract = (userRole, contract, managedPropertyIds = []) => {
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  if (userRole === USER_ROLES.PROPERTY_MANAGER) {
    return managedPropertyIds.includes(contract?.propertyId);
  }

  return false;
};

export const canDeleteContract = (userRole, contract, managedPropertyIds = []) => {
  return canEditContract(userRole, contract, managedPropertyIds);
};

export const canCreateBill = (userRole, propertyId, managedPropertyIds = []) => {
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  if (userRole === USER_ROLES.PROPERTY_MANAGER) {
    return managedPropertyIds.includes(propertyId);
  }

  return false;
};

export const canEditBill = (userRole, bill, managedPropertyIds = []) => {
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  if (userRole === USER_ROLES.PROPERTY_MANAGER) {
    return managedPropertyIds.includes(bill?.propertyId);
  }

  return false;
};

export const canDeleteBill = (userRole, bill, managedPropertyIds = []) => {
  return canEditBill(userRole, bill, managedPropertyIds);
};

export const canManageUsers = (userRole) => {
  return userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.PROPERTY_MANAGER;
};

export const canCreateUser = (userRole, targetPropertyId, managedPropertyIds = []) => {
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  if (userRole === USER_ROLES.PROPERTY_MANAGER && targetPropertyId) {
    return managedPropertyIds.includes(targetPropertyId);
  }

  return false;
};

export const canManagePermit = (userRole, permit, managedPropertyIds = []) => {
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  if (userRole === USER_ROLES.PROPERTY_MANAGER) {
    return managedPropertyIds.includes(permit?.propertyId);
  }

  return false;
};

export const canRequestPermit = (userId, unit) => {
  return isUnitOwner(userId, unit) || isUnitTenant(userId, unit);
};

export const canManageFiles = (userRole) => {
  return userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.PROPERTY_MANAGER;
};

export const canUploadFile = (userRole, propertyId, managedPropertyIds = []) => {
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  if (userRole === USER_ROLES.PROPERTY_MANAGER) {
    return managedPropertyIds.includes(propertyId);
  }

  return false;
};

export const canEditFile = (userRole, file, managedPropertyIds = []) => {
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  if (userRole === USER_ROLES.PROPERTY_MANAGER) {
    return managedPropertyIds.includes(file?.propertyId);
  }

  return false;
};

export const canDeleteFile = (userRole, file, managedPropertyIds = []) => {
  return canEditFile(userRole, file, managedPropertyIds);
};

export const canAccessPropertiesPage = (userRole) => {
  return userRole === USER_ROLES.ADMIN;
};

export const canAccessFilesPage = (userRole) => {
  return userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.PROPERTY_MANAGER;
};

export const canAccessUsersPage = (userRole) => {
  return userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.PROPERTY_MANAGER;
};
