import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  Building2,
  Loader2,
  ExternalLink,
  Share2,
  FileText
} from 'lucide-react';
import { getPublicUnitById } from '../../utils/publicDirectoryService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MediaGallery } from '../../components/property/MediaGallery';

export default function PublicUnitDetailPage() {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUnit();
  }, [unitId]);

  const loadUnit = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPublicUnitById(unitId);
      setUnit(data);
    } catch (err) {
      console.error('Error loading unit:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewIn3D = () => {
    if (unit?.propertyId) {
      navigate(`/property/${unit.propertyId}?unitId=${unit.id}`);
    }
  };

  const handleRequestPermitForProperty = () => {
    if (unit?.propertyId) {
      navigate(`/permits/request?propertyId=${unit.propertyId}`);
    }
  };

  const handleRequestPermitForUnit = () => {
    if (unit?.propertyId && unit?.id) {
      navigate(`/permits/request?propertyId=${unit.propertyId}&unitId=${unit.id}`);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: unit.businessName,
          text: unit.businessDescription,
          url: url
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert(t('publicDirectory.linkCopied'));
    }
  };

  const getCategoryLabel = (category) => {
    return t(`businessCategories.${category}`, category);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 p-8 text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {t('publicDirectory.unitNotFound')}
          </h2>
          <p className="text-slate-600 mb-6">{error || t('publicDirectory.unitNotFoundDescription')}</p>
          <Button onClick={() => navigate('/public/directory')}>
            {t('publicDirectory.backToDirectory')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/public/directory')}
            className="mb-4 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('publicDirectory.backToDirectory')}
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{unit.businessName}</h1>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                  {getCategoryLabel(unit.businessCategory)}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleShare}
              className="text-white hover:bg-white/10"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {unit.media && unit.media.length > 0 && (
              <Card className="overflow-hidden">
                <MediaGallery media={unit.media} />
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                {t('publicDirectory.aboutBusiness')}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {unit.businessDescription || t('publicDirectory.noDescription')}
              </p>
            </Card>

            {unit.property && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  {t('publicDirectory.location')}
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">{unit.property.name}</p>
                      <p className="text-sm text-slate-600">{unit.property.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <p className="text-slate-600">
                      {t('common.floor')} {unit.floor} - {t('common.unit')} {unit.unitNumber}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleViewIn3D} variant="outline" className="flex-1">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    {t('publicDirectory.viewIn3D')}
                  </Button>
                  <Button onClick={handleRequestPermitForProperty} className="flex-1">
                    <FileText className="w-5 h-5 mr-2" />
                    {t('permit.requestForProperty')}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                {t('publicDirectory.contactInfo')}
              </h2>

              <div className="space-y-4">
                {unit.workingHours && (
                  <div className="flex items-start gap-3 pb-4 border-b border-slate-200">
                    <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        {t('publicDirectory.workingHours')}
                      </p>
                      <p className="text-slate-600">{unit.workingHours}</p>
                    </div>
                  </div>
                )}

                {unit.contactPhone && (
                  <div className="flex items-start gap-3 pb-4 border-b border-slate-200">
                    <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        {t('publicDirectory.phone')}
                      </p>
                      <a
                        href={`tel:${unit.contactPhone}`}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {unit.contactPhone}
                      </a>
                    </div>
                  </div>
                )}

                {unit.contactEmail && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        {t('publicDirectory.email')}
                      </p>
                      <a
                        href={`mailto:${unit.contactEmail}`}
                        className="text-blue-600 hover:text-blue-700 transition-colors break-all"
                      >
                        {unit.contactEmail}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3">
                {unit.contactPhone && (
                  <Button
                    onClick={() => window.location.href = `tel:${unit.contactPhone}`}
                    variant="outline"
                    className="w-full"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    {t('publicDirectory.callNow')}
                  </Button>
                )}
                <Button
                  onClick={handleRequestPermitForUnit}
                  className="w-full"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  {t('permit.requestForUnit')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
