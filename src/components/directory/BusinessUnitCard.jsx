import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Building2, FileText } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const BusinessUnitCard = ({ unit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/public/directory/unit/${unit.id}`);
  };

  const handleRequestPermit = () => {
    navigate(`/permits/request?propertyId=${unit.propertyId}&unitId=${unit.id}`);
  };

  const getCategoryLabel = (category) => {
    return t(`businessCategories.${category}`, category);
  };

  const primaryImage = unit.media?.find(m => m.type === 'image')?.url;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={unit.businessName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-16 h-16 text-slate-400" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-slate-700">
            {getCategoryLabel(unit.businessCategory)}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          {unit.businessName || t('publicDirectory.noBusinessName')}
        </h3>

        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {unit.businessDescription || t('publicDirectory.noDescription')}
        </p>

        <div className="space-y-2 mb-4">
          {unit.property && (
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                {unit.property.name} - {t('common.floor')} {unit.floor} - {t('common.unit')} {unit.unitNumber}
              </span>
            </div>
          )}

          {unit.workingHours && (
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{unit.workingHours}</span>
            </div>
          )}

          {unit.contactPhone && (
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <a href={`tel:${unit.contactPhone}`} className="hover:text-blue-600 transition-colors">
                {unit.contactPhone}
              </a>
            </div>
          )}

          {unit.contactEmail && (
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <a href={`mailto:${unit.contactEmail}`} className="hover:text-blue-600 transition-colors">
                {unit.contactEmail}
              </a>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleViewDetails} variant="outline" className="flex-1">
            {t('publicDirectory.viewDetails')}
          </Button>
          <Button onClick={handleRequestPermit} className="flex-1">
            <FileText className="w-4 h-4 mr-2" />
            {t('permit.requestPermit')}
          </Button>
        </div>
      </div>
    </Card>
  );
};
