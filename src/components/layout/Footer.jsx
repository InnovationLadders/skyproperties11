import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Phone, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Footer = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';

  const quickLinks = [
    { label: t('footer.home'), path: '/' },
    { label: t('footer.publicDirectory'), path: '/public/directory' },
  ];

  if (user) {
    quickLinks.push(
      { label: t('dashboard.dashboard'), path: '/dashboard' },
      { label: t('property.properties'), path: '/properties' },
      { label: t('unit.units'), path: '/units' },
      { label: t('ticket.tickets'), path: '/tickets' },
      { label: t('profile.profile'), path: '/profile' }
    );
  }

  const legalLinks = [
    { label: t('footer.privacyPolicy'), path: '/privacy-policy' },
    { label: t('footer.termsOfService'), path: '/terms-of-service' },
    { label: t('footer.intellectualProperty'), path: '/intellectual-property' },
    { label: t('footer.submitComplaint'), path: '/submit-complaint' },
  ];

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-400" />
              <h3 className="text-xl font-bold text-white">
                {t('footer.companyName')}
              </h3>
            </div>
            <p className="text-sm text-slate-400">
              {t('footer.companyDescription')}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              {t('footer.contactInfo')}
            </h4>
            <div className="space-y-3 text-sm">
              <a
                href="tel:+966554344899"
                className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors"
                dir="ltr"
              >
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+966 55 434 4899</span>
              </a>
              <a
                href="mailto:sales@innovationladders.com"
                className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors break-all"
                dir="ltr"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>sales@innovationladders.com</span>
              </a>
              <div className="flex items-start gap-2 text-slate-400">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{t('footer.addressValue')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-blue-400 transition-colors block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              {t('footer.legalLinks')}
            </h4>
            <ul className="space-y-2 text-sm">
              {legalLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-blue-400 transition-colors block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>{t('footer.copyright')}</p>
            <p>{t('footer.allRightsReserved')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
