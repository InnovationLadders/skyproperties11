import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Maximize2, Minimize2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

export const Virtual360Viewer = ({ url, unitNumber, className = '' }) => {
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!url) return null;

  const handleFullscreen = () => {
    const element = document.getElementById('virtual-360-container');
    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {t('unit.virtual360Tour')}
              </CardTitle>
              {unitNumber && (
                <p className="text-sm text-muted-foreground mt-1">
                  {t('unit.exploreUnit360', { unitNumber })}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullscreen}
            className="hidden md:flex"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 mr-2" />
            ) : (
              <Maximize2 className="h-4 w-4 mr-2" />
            )}
            {isFullscreen ? t('unit.exitFullscreen') : t('unit.viewFullscreen')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          id="virtual-360-container"
          className="relative w-full overflow-hidden rounded-lg border border-border bg-slate-100"
          style={{ aspectRatio: '16/9' }}
        >
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">{t('unit.loading360Tour')}</p>
              </div>
            </div>
          )}
          {hasError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">{t('unit.error360Tour')}</p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {t('unit.openInNewTab')}
                </a>
              </div>
            </div>
          ) : (
            <iframe
              src={url}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              allow="xr-spatial-tracking; gyroscope; accelerometer"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              loading="lazy"
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          {t('unit.virtual360Hint')}
        </p>
      </CardContent>
    </Card>
  );
};
