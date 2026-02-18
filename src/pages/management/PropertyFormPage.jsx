import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { CoordinatePicker } from '../../components/property/CoordinatePicker';
import { MediaGallery } from '../../components/property/MediaGallery';
import { ThumbnailUploader } from '../../components/property/ThumbnailUploader';
import { uploadCustomPropertyThumbnail, updatePropertyMediaThumbnail, generateVideoThumbnail } from '../../utils/propertyMediaUpload';
import { ArrowLeft, Save, Upload, MapPin, Plus, X, Image, Video } from 'lucide-react';

export const PropertyFormPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const isEditMode = !!propertyId;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    totalUnits: 0,
    availableUnits: 0,
    coordinates: { lat: 24.7136, lng: 46.6753 },
    yearBuilt: '',
    totalFloors: '',
    parkingSpaces: '',
    features: [],
    mediaGallery: [],
    model3DScale: 1,
  });
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [glbFile, setGlbFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showCoordinatePicker, setShowCoordinatePicker] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [newMediaType, setNewMediaType] = useState('image');
  const [newMediaFile, setNewMediaFile] = useState(null);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaCaption, setNewMediaCaption] = useState('');
  const [showThumbnailUploader, setShowThumbnailUploader] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailProgress, setThumbnailProgress] = useState(0);

  useEffect(() => {
    if (isEditMode) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
      if (propertyDoc.exists()) {
        setFormData(propertyDoc.data());
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      setError('Failed to load property');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'totalUnits' || name === 'availableUnits'
        ? parseInt(value) || 0
        : name === 'model3DScale'
        ? parseFloat(value) || 1
        : value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGlbChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.toLowerCase().endsWith('.glb')) {
        setGlbFile(file);
      } else {
        alert('Please select a valid GLB file');
        e.target.value = '';
      }
    }
  };

  const handleBannerChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleMediaFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewMediaFile(e.target.files[0]);
    }
  };

  const handleAddMedia = async () => {
    if (newMediaType === 'videoLink' && newMediaUrl.trim()) {
      const mediaId = `video_url_${Date.now()}`;
      setFormData(prev => ({
        ...prev,
        mediaGallery: [...(prev.mediaGallery || []), {
          id: mediaId,
          type: 'video',
          url: newMediaUrl.trim(),
          caption: newMediaCaption.trim(),
          isLocal: false,
          isPrimary: (prev.mediaGallery || []).length === 0
        }]
      }));
      setNewMediaUrl('');
      setNewMediaCaption('');
    } else if (newMediaFile) {
      const tempUrl = URL.createObjectURL(newMediaFile);
      const mediaId = `${Date.now()}_${newMediaFile.name}`;

      let thumbnailUrl = null;
      if (newMediaType === 'video') {
        try {
          const thumbnailBlob = await generateVideoThumbnail(newMediaFile);
          thumbnailUrl = URL.createObjectURL(thumbnailBlob);
        } catch (error) {
          console.error('Failed to generate video thumbnail:', error);
        }
      }

      setFormData(prev => ({
        ...prev,
        mediaGallery: [...(prev.mediaGallery || []), {
          id: mediaId,
          type: newMediaType === 'image' ? 'image' : 'video',
          url: tempUrl,
          caption: newMediaCaption.trim(),
          thumbnailUrl,
          isLocal: true,
          file: newMediaFile,
          isPrimary: (prev.mediaGallery || []).length === 0
        }]
      }));
      setNewMediaFile(null);
      setNewMediaCaption('');
    }
  };

  const handleRemoveMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      mediaGallery: prev.mediaGallery.filter((_, i) => i !== index)
    }));
  };

  const handleSetPrimaryMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      mediaGallery: prev.mediaGallery.map((item, i) => ({
        ...item,
        isPrimary: i === index
      }))
    }));
  };

  const handleUploadThumbnail = (index) => {
    setSelectedMediaIndex(index);
    setShowThumbnailUploader(true);
  };

  const handleThumbnailUpload = async (file) => {
    if (!isEditMode || !propertyId) {
      alert('Please save the property first before uploading custom thumbnails.');
      return;
    }

    const mediaItem = formData.mediaGallery[selectedMediaIndex];
    if (!mediaItem) return;

    setThumbnailUploading(true);
    setThumbnailProgress(0);

    try {
      const { thumbnailUrl, customThumbnailPath } = await uploadCustomPropertyThumbnail(
        propertyId,
        mediaItem.id,
        file,
        (progress) => setThumbnailProgress(progress)
      );

      const updatedMediaGallery = await updatePropertyMediaThumbnail(
        propertyId,
        formData.mediaGallery,
        selectedMediaIndex,
        thumbnailUrl,
        customThumbnailPath
      );

      setFormData(prev => ({
        ...prev,
        mediaGallery: updatedMediaGallery
      }));

      setShowThumbnailUploader(false);
      setSelectedMediaIndex(null);
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      alert(error.message || 'Failed to upload thumbnail');
    } finally {
      setThumbnailUploading(false);
      setThumbnailProgress(0);
    }
  };

  const handleCancelThumbnailUpload = () => {
    setShowThumbnailUploader(false);
    setSelectedMediaIndex(null);
    setThumbnailProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setUploading(true);

    try {
      let imageUrl = formData.imageUrl || '';
      let modelUrl = formData.modelUrl || '';
      let bannerImage = formData.bannerImage || '';

      if (imageFile) {
        const imageRef = ref(storage, `properties/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      if (bannerFile) {
        const bannerRef = ref(storage, `properties/banners/${Date.now()}_${bannerFile.name}`);
        await uploadBytes(bannerRef, bannerFile);
        bannerImage = await getDownloadURL(bannerRef);
      }

      if (glbFile) {
        const glbRef = ref(storage, `properties/${Date.now()}_${glbFile.name}`);
        await uploadBytes(glbRef, glbFile);
        modelUrl = await getDownloadURL(glbRef);
      }

      const uploadedMediaGallery = await Promise.all(
        (formData.mediaGallery || []).map(async (item) => {
          if (item.isLocal && item.file) {
            const timestamp = Date.now();
            const mediaRef = ref(storage, `properties/media/${timestamp}_${item.file.name}`);
            await uploadBytes(mediaRef, item.file);
            const url = await getDownloadURL(mediaRef);

            let uploadedThumbnailUrl = item.thumbnailUrl;

            if (item.type === 'video' && item.thumbnailUrl && item.thumbnailUrl.startsWith('blob:')) {
              try {
                const thumbnailBlob = await fetch(item.thumbnailUrl).then(r => r.blob());
                const thumbnailRef = ref(storage, `properties/thumbnails/${timestamp}_${item.file.name}_thumb.jpg`);
                await uploadBytes(thumbnailRef, thumbnailBlob);
                uploadedThumbnailUrl = await getDownloadURL(thumbnailRef);
              } catch (error) {
                console.error('Failed to upload auto-generated thumbnail:', error);
                uploadedThumbnailUrl = null;
              }
            }

            const { file, isLocal, ...rest } = item;
            return { ...rest, url, thumbnailUrl: uploadedThumbnailUrl, isLocal: false };
          }
          return item;
        })
      );

      const propertyData = {
        ...formData,
        imageUrl,
        bannerImage,
        modelUrl,
        mediaGallery: uploadedMediaGallery,
        mapCoordinates: formData.coordinates,
        updatedAt: serverTimestamp(),
      };

      if (isEditMode) {
        await updateDoc(doc(db, 'properties', propertyId), propertyData);
      } else {
        const newDocRef = doc(collection(db, 'properties'));
        await setDoc(newDocRef, {
          ...propertyData,
          createdAt: serverTimestamp(),
        });
      }

      navigate('/properties');
    } catch (error) {
      console.error('Error saving property:', error);
      setError('Failed to save property');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/properties')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Edit Property' : 'Create New Property'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Skyline Towers"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 123 Main St, City, Country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                  placeholder="Describe the property..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalUnits">Total Units</Label>
                  <Input
                    id="totalUnits"
                    name="totalUnits"
                    type="number"
                    value={formData.totalUnits}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availableUnits">Available Units</Label>
                  <Input
                    id="availableUnits"
                    name="availableUnits"
                    type="number"
                    value={formData.availableUnits}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Property Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {(imagePreview || formData.imageUrl) && (
                  <div className="mt-2">
                    <img
                      src={imagePreview || formData.imageUrl}
                      alt="Property preview"
                      className="w-full h-48 object-cover rounded-md"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {imageFile ? 'New image selected' : 'Current image'}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner">{t('property.bannerImage')}</Label>
                <p className="text-xs text-muted-foreground">{t('property.bannerImageDesc')}</p>
                <Input
                  id="banner"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                />
                {(bannerPreview || formData.bannerImage) && (
                  <div className="mt-2">
                    <img
                      src={bannerPreview || formData.bannerImage}
                      alt="Banner preview"
                      className="w-full h-48 object-cover rounded-md"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {bannerFile ? t('property.changeBanner') : t('property.currentBanner')}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearBuilt">{t('property.yearBuilt')}</Label>
                  <Input
                    id="yearBuilt"
                    name="yearBuilt"
                    type="number"
                    value={formData.yearBuilt}
                    onChange={handleChange}
                    placeholder="2020"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalFloors">{t('property.totalFloors')}</Label>
                  <Input
                    id="totalFloors"
                    name="totalFloors"
                    type="number"
                    value={formData.totalFloors}
                    onChange={handleChange}
                    placeholder="10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parkingSpaces">{t('property.parkingSpaces')}</Label>
                  <Input
                    id="parkingSpaces"
                    name="parkingSpaces"
                    type="number"
                    value={formData.parkingSpaces}
                    onChange={handleChange}
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="glbFile">3D Model File (GLB)</Label>
                <Input
                  id="glbFile"
                  type="file"
                  accept=".glb"
                  onChange={handleGlbChange}
                />
                <p className="text-xs text-muted-foreground">
                  Upload a GLB 3D model file for this property
                </p>
                {glbFile && (
                  <p className="text-sm text-green-600">
                    New model selected: {glbFile.name} ({(glbFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                {formData.modelUrl && !glbFile && (
                  <p className="text-sm text-muted-foreground">Current 3D model uploaded</p>
                )}
              </div>

              {(formData.modelUrl || glbFile) && (
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="model3DScale" className="text-sm font-semibold">
                      3D Model Scale (حجم النموذج)
                    </Label>
                    <span className="text-sm font-medium text-blue-600">
                      {formData.model3DScale}x
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Adjust the size of the 3D model. Use larger values (5-10) for small models, smaller values (0.1-0.5) for large models.
                  </p>
                  <Input
                    id="model3DScale"
                    name="model3DScale"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    value={formData.model3DScale}
                    onChange={handleChange}
                    className="text-center font-medium"
                  />
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, model3DScale: 0.1 }))}
                      className={formData.model3DScale === 0.1 ? 'bg-primary text-white' : ''}
                    >
                      0.1x
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, model3DScale: 0.5 }))}
                      className={formData.model3DScale === 0.5 ? 'bg-primary text-white' : ''}
                    >
                      0.5x
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, model3DScale: 1 }))}
                      className={formData.model3DScale === 1 ? 'bg-primary text-white' : ''}
                    >
                      1x
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, model3DScale: 2 }))}
                      className={formData.model3DScale === 2 ? 'bg-primary text-white' : ''}
                    >
                      2x
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, model3DScale: 5 }))}
                      className={formData.model3DScale === 5 ? 'bg-primary text-white' : ''}
                    >
                      5x
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, model3DScale: 10 }))}
                      className={formData.model3DScale === 10 ? 'bg-primary text-white' : ''}
                    >
                      10x
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t('map.propertyLocation')}
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCoordinatePicker(!showCoordinatePicker)}
                  >
                    {showCoordinatePicker ? t('map.hideMap') : t('map.showMap')}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">{t('map.latitude')}</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.000001"
                      value={formData.coordinates?.lat || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          coordinates: {
                            ...prev.coordinates,
                            lat: parseFloat(e.target.value) || 0,
                          },
                        }))
                      }
                      placeholder="24.7136"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">{t('map.longitude')}</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.000001"
                      value={formData.coordinates?.lng || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          coordinates: {
                            ...prev.coordinates,
                            lng: parseFloat(e.target.value) || 0,
                          },
                        }))
                      }
                      placeholder="46.6753"
                    />
                  </div>
                </div>

                {showCoordinatePicker && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {t('map.clickToSelectLocation')}
                    </p>
                    <CoordinatePicker
                      coordinates={formData.coordinates}
                      onCoordinatesChange={(coords) =>
                        setFormData((prev) => ({
                          ...prev,
                          coordinates: coords,
                        }))
                      }
                      address={formData.address}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg">{t('property.featuresSection')}</Label>
                    <p className="text-sm text-muted-foreground">{t('property.manageFeaturesDesc')}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder={t('property.featurePlaceholder')}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                  />
                  <Button type="button" onClick={handleAddFeature} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.features && formData.features.length > 0 && (
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <span className="text-sm">{feature}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFeature(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg">{t('property.mediaGallerySection')}</Label>
                    <p className="text-sm text-muted-foreground">{t('property.manageMediaDesc')}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={newMediaType}
                      onChange={(e) => setNewMediaType(e.target.value)}
                      className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="image">{t('property.imageFile')}</option>
                      <option value="video">{t('property.videoFile')}</option>
                      <option value="videoLink">{t('property.videoLink')}</option>
                    </select>
                  </div>

                  {newMediaType === 'videoLink' ? (
                    <Input
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      placeholder={t('property.videoUrlPlaceholder')}
                    />
                  ) : (
                    <Input
                      type="file"
                      accept={newMediaType === 'image' ? 'image/*' : 'video/*'}
                      onChange={handleMediaFileChange}
                    />
                  )}

                  <Input
                    value={newMediaCaption}
                    onChange={(e) => setNewMediaCaption(e.target.value)}
                    placeholder={t('property.captionPlaceholder')}
                  />

                  <Button type="button" onClick={handleAddMedia} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('property.addMedia')}
                  </Button>
                </div>

                {formData.mediaGallery && formData.mediaGallery.length > 0 && (
                  <MediaGallery
                    media={formData.mediaGallery}
                    onSetPrimary={(item) => {
                      const index = formData.mediaGallery.findIndex(m => m.id === item.id);
                      if (index !== -1) handleSetPrimaryMedia(index);
                    }}
                    onDelete={(item) => {
                      const index = formData.mediaGallery.findIndex(m => m.id === item.id);
                      if (index !== -1) handleRemoveMedia(index);
                    }}
                    onUploadThumbnail={(item) => {
                      const index = formData.mediaGallery.findIndex(m => m.id === item.id);
                      if (index !== -1) handleUploadThumbnail(index);
                    }}
                    canEdit={true}
                  />
                )}
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading files...' : loading ? 'Saving...' : isEditMode ? 'Update Property' : 'Create Property'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/properties')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {showThumbnailUploader && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {t('media.uploadThumbnail')}
              </h3>
              <ThumbnailUploader
                onUpload={handleThumbnailUpload}
                onCancel={handleCancelThumbnailUpload}
                isUploading={thumbnailUploading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
