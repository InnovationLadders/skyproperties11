import { useTranslation } from 'react-i18next';
import {
  Waves,
  Dumbbell,
  Shield,
  Wifi,
  Car,
  Wind,
  Sparkles,
  Trees,
  Baby,
  Store,
  Utensils,
  HeartPulse,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const iconMap = {
  pool: Waves,
  swimming: Waves,
  gym: Dumbbell,
  fitness: Dumbbell,
  security: Shield,
  guard: Shield,
  wifi: Wifi,
  internet: Wifi,
  parking: Car,
  garage: Car,
  ac: Wind,
  air: Wind,
  conditioning: Wind,
  elevator: Sparkles,
  lift: Sparkles,
  garden: Trees,
  park: Trees,
  playground: Baby,
  kids: Baby,
  shop: Store,
  store: Store,
  restaurant: Utensils,
  cafe: Utensils,
  dining: Utensils,
  medical: HeartPulse,
  clinic: HeartPulse,
  health: HeartPulse,
};

const getFeatureIcon = (featureName) => {
  const lowerFeature = featureName.toLowerCase();

  for (const [key, Icon] of Object.entries(iconMap)) {
    if (lowerFeature.includes(key)) {
      return Icon;
    }
  }

  return Check;
};

export const PropertyFeatures = ({ features = [] }) => {
  const { t } = useTranslation();

  if (!features || features.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{t('property.noFeaturesYet')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('property.keyFeatures')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = getFeatureIcon(feature);
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium text-sm">{feature}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
