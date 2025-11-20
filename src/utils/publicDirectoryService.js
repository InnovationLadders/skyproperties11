import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const UNITS_COLLECTION = 'units';
const PROPERTIES_COLLECTION = 'properties';

export const getPublicUnits = async (filters = {}) => {
  try {
    const unitsRef = collection(db, UNITS_COLLECTION);
    let q = query(unitsRef, where('isPublicDirectory', '==', true), orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    const units = [];

    for (const unitDoc of snapshot.docs) {
      const unitData = { id: unitDoc.id, ...unitDoc.data() };

      if (unitData.propertyId) {
        const propertyDoc = await getDoc(doc(db, PROPERTIES_COLLECTION, unitData.propertyId));
        if (propertyDoc.exists()) {
          unitData.property = { id: propertyDoc.id, ...propertyDoc.data() };
        }
      }

      units.push(unitData);
    }

    let filteredUnits = units;

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredUnits = filteredUnits.filter(unit =>
        unit.businessName?.toLowerCase().includes(searchLower) ||
        unit.businessDescription?.toLowerCase().includes(searchLower) ||
        unit.unitNumber?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.businessCategory && filters.businessCategory !== 'all') {
      filteredUnits = filteredUnits.filter(unit => unit.businessCategory === filters.businessCategory);
    }

    if (filters.propertyId && filters.propertyId !== 'all') {
      filteredUnits = filteredUnits.filter(unit => unit.propertyId === filters.propertyId);
    }

    if (filters.floor && filters.floor !== 'all') {
      filteredUnits = filteredUnits.filter(unit => unit.floor === parseInt(filters.floor));
    }

    return filteredUnits;
  } catch (error) {
    console.error('Error fetching public units:', error);
    throw error;
  }
};

export const getPublicUnitById = async (unitId) => {
  try {
    const unitRef = doc(db, UNITS_COLLECTION, unitId);
    const unitDoc = await getDoc(unitRef);

    if (!unitDoc.exists()) {
      throw new Error('Unit not found');
    }

    const unitData = { id: unitDoc.id, ...unitDoc.data() };

    if (!unitData.isPublicDirectory) {
      throw new Error('Unit is not in public directory');
    }

    if (unitData.propertyId) {
      const propertyDoc = await getDoc(doc(db, PROPERTIES_COLLECTION, unitData.propertyId));
      if (propertyDoc.exists()) {
        unitData.property = { id: propertyDoc.id, ...propertyDoc.data() };
      }
    }

    return unitData;
  } catch (error) {
    console.error('Error fetching public unit by ID:', error);
    throw error;
  }
};

export const toggleUnitPublicDirectory = async (unitId, isPublic) => {
  try {
    const unitRef = doc(db, UNITS_COLLECTION, unitId);
    const unitDoc = await getDoc(unitRef);

    if (!unitDoc.exists()) {
      throw new Error('Unit not found');
    }

    await updateDoc(unitRef, {
      isPublicDirectory: isPublic,
      updatedAt: Timestamp.now()
    });

    return true;
  } catch (error) {
    console.error('Error toggling unit public directory:', error);
    throw error;
  }
};

export const updateUnitBusinessInfo = async (unitId, businessInfo) => {
  try {
    const unitRef = doc(db, UNITS_COLLECTION, unitId);
    const unitDoc = await getDoc(unitRef);

    if (!unitDoc.exists()) {
      throw new Error('Unit not found');
    }

    const updateData = {
      businessName: businessInfo.businessName || '',
      businessDescription: businessInfo.businessDescription || '',
      businessCategory: businessInfo.businessCategory || '',
      contactPhone: businessInfo.contactPhone || '',
      contactEmail: businessInfo.contactEmail || '',
      workingHours: businessInfo.workingHours || '',
      updatedAt: Timestamp.now()
    };

    await updateDoc(unitRef, updateData);

    return {
      id: unitId,
      ...unitDoc.data(),
      ...updateData
    };
  } catch (error) {
    console.error('Error updating unit business info:', error);
    throw error;
  }
};

export const getAllPropertiesForFilter = async () => {
  try {
    const propertiesRef = collection(db, PROPERTIES_COLLECTION);
    const snapshot = await getDocs(propertiesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching properties for filter:', error);
    throw error;
  }
};

export const getAvailableFloorsForProperty = (units, propertyId) => {
  if (!propertyId || propertyId === 'all') return [];

  const floors = new Set();
  units
    .filter(unit => unit.propertyId === propertyId)
    .forEach(unit => {
      if (unit.floor !== undefined && unit.floor !== null) {
        floors.add(unit.floor);
      }
    });

  return Array.from(floors).sort((a, b) => a - b);
};
