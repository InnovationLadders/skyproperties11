import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';

const FILES_COLLECTION = 'propertyFiles';

export const FILE_CATEGORIES = {
  CONTRACTS: 'contracts',
  PERMITS: 'permits',
  MAINTENANCE: 'maintenance',
  FINANCIAL: 'financial',
  LEGAL: 'legal',
  ARCHITECTURAL: 'architectural',
  PHOTOS: 'photos',
  REPORTS: 'reports',
  INVOICES: 'invoices',
  CERTIFICATES: 'certificates',
  INSURANCE: 'insurance',
  OTHER: 'other',
};

export const getFileType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  const documentExtensions = ['doc', 'docx', 'txt', 'rtf', 'odt'];
  const spreadsheetExtensions = ['xls', 'xlsx', 'csv', 'ods'];
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac'];
  const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz'];

  if (extension === 'pdf') return 'pdf';
  if (imageExtensions.includes(extension)) return 'image';
  if (documentExtensions.includes(extension)) return 'document';
  if (spreadsheetExtensions.includes(extension)) return 'spreadsheet';
  if (videoExtensions.includes(extension)) return 'video';
  if (audioExtensions.includes(extension)) return 'audio';
  if (archiveExtensions.includes(extension)) return 'archive';

  return 'other';
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const validateFile = (file, maxSize = 50 * 1024 * 1024) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'application/zip',
    'application/x-zip-compressed',
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'fileSizeExceeded' };
  }

  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png|gif|webp|doc|docx|xls|xlsx|csv|mp4|mov|avi|zip)$/i)) {
    return { valid: false, error: 'invalidFileType' };
  }

  return { valid: true };
};

export const uploadFile = async (file, propertyId, propertyName, category, userId, userDisplayName, description = '', tags = [], onProgress) => {
  try {
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `properties/${propertyId}/files/${timestamp}_${sanitizedFileName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            const fileData = {
              fileName: file.name,
              fileType: getFileType(file.name),
              fileSize: file.size,
              fileCategory: category,
              propertyId,
              propertyName,
              uploadedBy: userId,
              uploadedByName: userDisplayName || 'Unknown',
              uploadedAt: Timestamp.now(),
              storageUrl: downloadURL,
              storagePath,
              tags: tags || [],
              description: description || '',
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            };

            const docRef = await addDoc(collection(db, FILES_COLLECTION), fileData);

            resolve({
              id: docRef.id,
              ...fileData,
            });
          } catch (error) {
            console.error('Error saving file metadata:', error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getFiles = async (propertyId = null, userId = null, userRole = null) => {
  try {
    const filesRef = collection(db, FILES_COLLECTION);
    let q;

    if (userRole === 'admin') {
      q = query(filesRef, orderBy('uploadedAt', 'desc'));
    } else if (propertyId) {
      q = query(
        filesRef,
        where('propertyId', '==', propertyId),
        orderBy('uploadedAt', 'desc')
      );
    } else {
      q = query(filesRef, orderBy('uploadedAt', 'desc'));
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting files:', error);
    throw error;
  }
};

export const getFilesByProperty = async (propertyId) => {
  try {
    const filesRef = collection(db, FILES_COLLECTION);
    const q = query(
      filesRef,
      where('propertyId', '==', propertyId),
      orderBy('uploadedAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting files by property:', error);
    throw error;
  }
};

export const getFileById = async (fileId) => {
  try {
    const fileRef = doc(db, FILES_COLLECTION, fileId);
    const fileDoc = await getDoc(fileRef);

    if (fileDoc.exists()) {
      return {
        id: fileDoc.id,
        ...fileDoc.data(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting file:', error);
    throw error;
  }
};

export const updateFileMetadata = async (fileId, updates) => {
  try {
    const fileRef = doc(db, FILES_COLLECTION, fileId);

    await updateDoc(fileRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return true;
  } catch (error) {
    console.error('Error updating file metadata:', error);
    throw error;
  }
};

export const deleteFile = async (fileId) => {
  try {
    const fileData = await getFileById(fileId);

    if (!fileData) {
      throw new Error('File not found');
    }

    if (fileData.storagePath) {
      const storageRef = ref(storage, fileData.storagePath);
      await deleteObject(storageRef);
    }

    const fileRef = doc(db, FILES_COLLECTION, fileId);
    await deleteDoc(fileRef);

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const searchFiles = (files, searchTerm) => {
  if (!searchTerm) return files;

  const term = searchTerm.toLowerCase();

  return files.filter(file => {
    const nameMatch = file.fileName?.toLowerCase().includes(term);
    const descMatch = file.description?.toLowerCase().includes(term);
    const tagsMatch = file.tags?.some(tag => tag.toLowerCase().includes(term));
    const categoryMatch = file.fileCategory?.toLowerCase().includes(term);

    return nameMatch || descMatch || tagsMatch || categoryMatch;
  });
};

export const filterFiles = (files, filters) => {
  let filtered = [...files];

  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(file => file.fileCategory === filters.category);
  }

  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(file => file.fileType === filters.type);
  }

  if (filters.propertyId && filters.propertyId !== 'all') {
    filtered = filtered.filter(file => file.propertyId === filters.propertyId);
  }

  return filtered;
};

export const sortFiles = (files, sortBy, order = 'desc') => {
  const sorted = [...files];

  sorted.sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case 'name':
        valueA = a.fileName?.toLowerCase() || '';
        valueB = b.fileName?.toLowerCase() || '';
        break;
      case 'date':
        valueA = a.uploadedAt?.toMillis() || 0;
        valueB = b.uploadedAt?.toMillis() || 0;
        break;
      case 'size':
        valueA = a.fileSize || 0;
        valueB = b.fileSize || 0;
        break;
      case 'type':
        valueA = a.fileType || '';
        valueB = b.fileType || '';
        break;
      default:
        valueA = a.uploadedAt?.toMillis() || 0;
        valueB = b.uploadedAt?.toMillis() || 0;
    }

    if (order === 'asc') {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });

  return sorted;
};

export const downloadFile = async (fileUrl, fileName) => {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};
