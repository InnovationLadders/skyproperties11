import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Upload,
  Search,
  Filter,
  Download,
  Trash2,
  FolderOpen,
  Grid3x3,
  List,
  FileText,
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { FileCard } from '../../components/files/FileCard';
import { FileUploadModal } from '../../components/files/FileUploadModal';
import { FileDetailModal } from '../../components/files/FileDetailModal';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../utils/constants';
import {
  getFiles,
  uploadFile,
  deleteFile,
  updateFileMetadata,
  downloadFile,
  searchFiles,
  filterFiles,
  sortFiles,
  FILE_CATEGORIES,
  formatFileSize,
} from '../../utils/fileService';

export const FilesManagementPage = () => {
  const { t } = useTranslation();
  const { currentUser, userProfile } = useAuth();
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState(new Set());

  const isAdmin = userProfile?.role === USER_ROLES.ADMIN;
  const isPropertyManager = userProfile?.role === USER_ROLES.PROPERTY_MANAGER;

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (properties.length > 0 || !isPropertyManager) {
      fetchFiles();
    }
  }, [properties]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [files, searchTerm, selectedCategory, selectedType, selectedProperty, sortBy, sortOrder]);

  const fetchProperties = async () => {
    try {
      const propertiesRef = collection(db, 'properties');
      let q;

      if (isPropertyManager) {
        q = query(propertiesRef, where('managerId', '==', currentUser.uid));
      } else {
        q = propertiesRef;
      }

      const snapshot = await getDocs(q);
      const propertiesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProperties(propertiesData);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      let propertyIds = null;

      if (isPropertyManager && properties.length > 0) {
        const managerProperties = properties.filter(
          (p) => p.managerId === currentUser.uid
        );
        propertyIds = managerProperties.map((p) => p.id);
      }

      const filesData = await getFiles(
        null,
        currentUser.uid,
        isAdmin ? 'admin' : isPropertyManager ? 'propertyManager' : 'user',
        propertyIds
      );

      setFiles(filesData);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...files];

    if (searchTerm) {
      result = searchFiles(result, searchTerm);
    }

    result = filterFiles(result, {
      category: selectedCategory,
      type: selectedType,
      propertyId: selectedProperty,
    });

    result = sortFiles(result, sortBy, sortOrder);

    setFilteredFiles(result);
  };

  const handleUpload = async (
    file,
    propertyId,
    propertyName,
    category,
    description,
    tags,
    onProgress
  ) => {
    try {
      const uploadedFile = await uploadFile(
        file,
        propertyId,
        propertyName,
        category,
        currentUser.uid,
        userProfile?.displayName || currentUser.email,
        description,
        tags,
        onProgress
      );

      setFiles((prev) => [uploadedFile, ...prev]);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleDownload = async (file) => {
    try {
      await downloadFile(file.storageUrl, file.fileName);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert(t('files.errors.downloadFailed'));
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm(t('files.deleteConfirm'))) {
      return;
    }

    try {
      await deleteFile(file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      setDetailModalOpen(false);
    } catch (error) {
      console.error('Error deleting file:', error);
      alert(t('files.errors.deleteFailed'));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) return;

    if (!window.confirm(t('files.deleteMultipleConfirm'))) {
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedFiles).map((fileId) => {
          const file = files.find((f) => f.id === fileId);
          return deleteFile(file.id);
        })
      );

      setFiles((prev) => prev.filter((f) => !selectedFiles.has(f.id)));
      setSelectedFiles(new Set());
    } catch (error) {
      console.error('Error deleting files:', error);
      alert(t('files.errors.deleteFailed'));
    }
  };

  const handleUpdate = async (fileId, updates) => {
    try {
      await updateFileMetadata(fileId, updates);
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, ...updates } : f))
      );
      setDetailModalOpen(false);
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    }
  };

  const handleViewFile = (file) => {
    setSelectedFile(file);
    setDetailModalOpen(true);
  };

  const handleFileSelect = (fileId, checked) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(fileId);
      } else {
        newSet.delete(fileId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map((f) => f.id)));
    }
  };

  const totalSize = files.reduce((acc, file) => acc + (file.fileSize || 0), 0);
  const fileTypes = [...new Set(files.map((f) => f.fileType))];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('files.fileManagement')}</h1>
            <p className="text-muted-foreground">
              {isAdmin ? t('files.viewAllFiles') : t('files.managePropertyFiles')}
            </p>
          </div>
          <Button onClick={() => setUploadModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            {t('files.uploadFile')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('files.totalFiles')}</p>
                  <p className="text-2xl font-bold">{files.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('files.totalSize')}</p>
                  <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('property.properties')}</p>
                  <p className="text-2xl font-bold">{properties.length}</p>
                </div>
                <Filter className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('files.filesByType')}</p>
                  <p className="text-2xl font-bold">{fileTypes.length}</p>
                </div>
                <Grid3x3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder={t('files.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">{t('files.allCategories')}</option>
                  {Object.values(FILE_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`files.categories.${cat}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">{t('files.allTypes')}</option>
                  {fileTypes.map((type) => (
                    <option key={type} value={type}>
                      {t(`files.types.${type}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">{t('files.allProperties')}</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? (
                    <List className="h-4 w-4" />
                  ) : (
                    <Grid3x3 className="h-4 w-4" />
                  )}
                </Button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="date">{t('files.sortByDate')}</option>
                  <option value="name">{t('files.sortByName')}</option>
                  <option value="size">{t('files.sortBySize')}</option>
                  <option value="type">{t('files.sortByType')}</option>
                </select>
              </div>
            </div>

            {selectedFiles.size > 0 && (
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedFiles.size} {t('files.filesSelected')}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedFiles.size === filteredFiles.length
                      ? t('files.deselectAll')
                      : t('files.selectAll')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteSelected}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('files.deleteSelected')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="p-4">
                  <div className="h-20 bg-gray-200 rounded mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredFiles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('files.noFilesFound')}</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedType !== 'all'
                  ? t('files.tryAdjustingFilters')
                  : t('files.getStarted')}
              </p>
              {!searchTerm && selectedCategory === 'all' && selectedType === 'all' && (
                <Button onClick={() => setUploadModalOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  {t('files.uploadFile')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <FileCard
                  file={file}
                  onView={handleViewFile}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  selected={selectedFiles.has(file.id)}
                  onSelect={handleFileSelect}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <FileUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUpload}
        properties={properties}
      />

      {selectedFile && (
        <FileDetailModal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          file={selectedFile}
          onUpdate={handleUpdate}
          onDownload={handleDownload}
          canEdit={isAdmin || isPropertyManager}
        />
      )}
    </div>
  );
};
