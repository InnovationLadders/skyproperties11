import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui/Card';
import { Phone, Mail } from 'lucide-react';

export const IntellectualPropertyPage = () => {
  const { t } = useTranslation();

  const sections = [
    {
      title: t('legal.intellectualProperty.introduction'),
      content: t('legal.intellectualProperty.introText'),
    },
    {
      title: t('legal.intellectualProperty.copyright'),
      content: t('legal.intellectualProperty.copyrightText'),
    },
    {
      title: t('legal.intellectualProperty.trademarks'),
      content: t('legal.intellectualProperty.trademarksText'),
    },
    {
      title: t('legal.intellectualProperty.userContent'),
      content: t('legal.intellectualProperty.userContentText'),
    },
    {
      title: t('legal.intellectualProperty.mediaRights'),
      content: t('legal.intellectualProperty.mediaRightsText'),
    },
    {
      title: t('legal.intellectualProperty.fairUse'),
      content: t('legal.intellectualProperty.fairUseText'),
    },
    {
      title: t('legal.intellectualProperty.infringement'),
      content: t('legal.intellectualProperty.infringementText'),
    },
    {
      title: t('legal.intellectualProperty.licenses'),
      content: t('legal.intellectualProperty.licensesText'),
    },
    {
      title: t('legal.intellectualProperty.thirdParty'),
      content: t('legal.intellectualProperty.thirdPartyText'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 md:p-12">
          <div className="space-y-8">
            <div className="border-b pb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t('legal.intellectualProperty.title')}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('legal.intellectualProperty.lastUpdated')}
              </p>
            </div>

            {sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {index + 1}. {section.title}
                </h2>
                <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {section.content}
                </div>
              </div>
            ))}

            <div className="border-t pt-6 mt-8">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                {t('legal.intellectualProperty.contact')}
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                {t('legal.intellectualProperty.contactText')}
              </p>
              <div className="space-y-3">
                <a
                  href="tel:+966554344899"
                  className="flex items-center gap-3 text-blue-600 dark:text-blue-400 hover:underline"
                  dir="ltr"
                >
                  <Phone className="h-5 w-5" />
                  <span>+966 55 434 4899</span>
                </a>
                <a
                  href="mailto:sales@innovationladders.com"
                  className="flex items-center gap-3 text-blue-600 dark:text-blue-400 hover:underline"
                  dir="ltr"
                >
                  <Mail className="h-5 w-5" />
                  <span>sales@innovationladders.com</span>
                </a>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
