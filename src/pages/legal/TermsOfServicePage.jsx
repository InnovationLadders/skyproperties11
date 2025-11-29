import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui/Card';
import { Phone, Mail } from 'lucide-react';

export const TermsOfServicePage = () => {
  const { t } = useTranslation();

  const sections = [
    {
      title: t('legal.termsOfService.introduction'),
      content: t('legal.termsOfService.introText'),
    },
    {
      title: t('legal.termsOfService.acceptance'),
      content: t('legal.termsOfService.acceptanceText'),
    },
    {
      title: t('legal.termsOfService.serviceDescription'),
      content: t('legal.termsOfService.serviceDescriptionText'),
    },
    {
      title: t('legal.termsOfService.userResponsibilities'),
      content: t('legal.termsOfService.userResponsibilitiesText'),
    },
    {
      title: t('legal.termsOfService.prohibitedUses'),
      content: t('legal.termsOfService.prohibitedUsesText'),
    },
    {
      title: t('legal.termsOfService.intellectualProperty'),
      content: t('legal.termsOfService.intellectualPropertyText'),
    },
    {
      title: t('legal.termsOfService.limitation'),
      content: t('legal.termsOfService.limitationText'),
    },
    {
      title: t('legal.termsOfService.termination'),
      content: t('legal.termsOfService.terminationText'),
    },
    {
      title: t('legal.termsOfService.changes'),
      content: t('legal.termsOfService.changesText'),
    },
    {
      title: t('legal.termsOfService.governingLaw'),
      content: t('legal.termsOfService.governingLawText'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 md:p-12">
          <div className="space-y-8">
            <div className="border-b pb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t('legal.termsOfService.title')}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('legal.termsOfService.lastUpdated')}
              </p>
            </div>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={index} className="space-y-3">
                  <h2 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-200">
                    {section.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}

              <div className="space-y-3 pt-6 border-t">
                <h2 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-200">
                  {t('legal.termsOfService.contact')}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {t('legal.termsOfService.contactText')}
                </p>
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <a
                      href="tel:+966554344899"
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      dir="ltr"
                    >
                      +966 55 434 4899
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <a
                      href="mailto:sales@innovationladders.com"
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      dir="ltr"
                    >
                      sales@innovationladders.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
