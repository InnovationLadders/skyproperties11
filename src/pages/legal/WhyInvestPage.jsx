import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui/Card';
import { Globe, MapPin } from 'lucide-react';

const WhyInvestPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const whyItems = t('whyInvest.whyJeddahItems', { returnObjects: true });
  const hnwiItems = t('whyInvest.hnwiItems', { returnObjects: true });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="relative w-full h-80 md:h-[480px] overflow-hidden">
        <img
          src="/Three_famous_tower_buildings_at_the_seafront_of_Jeddah.jpg"
          alt={t('whyInvest.image1Caption')}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 drop-shadow-lg">
            {t('whyInvest.title')}
          </h1>
          <p className="text-lg md:text-xl text-slate-200 drop-shadow">
            {t('whyInvest.subtitle')}
          </p>
          <p className="text-sm md:text-base text-slate-300 mt-2">
            {t('whyInvest.preparedFor')} &mdash; {t('whyInvest.presentedBy')}
          </p>
        </div>
      </div>
      <p className="text-center text-xs text-slate-500 dark:text-slate-400 py-2 bg-slate-100 dark:bg-slate-800">
        {t('whyInvest.image1Caption')}
      </p>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {/* Executive Summary */}
        <Card className="p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            {t('whyInvest.executiveSummaryTitle')}
          </h2>
          <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed text-base md:text-lg">
            <p>{t('whyInvest.executiveSummaryText')}</p>
            <p>{t('whyInvest.executiveSummaryText2')}</p>
          </div>
        </Card>

        {/* Why Invest in Jeddah */}
        <Card className="p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-400 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            {t('whyInvest.whyJeddahTitle')}
          </h2>
          <ul className="space-y-3">
            {Array.isArray(whyItems) && whyItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-base md:text-lg">
                <span className="mt-1 w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Luxury Market Dynamics */}
        <Card className="p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-400 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            {t('whyInvest.luxuryMarketTitle')}
          </h2>
          <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed text-base md:text-lg">
            <p>{t('whyInvest.luxuryMarketText')}</p>
          </div>
        </Card>

        {/* Luxury Park Hayat / Activities section with image */}
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img
              src="/Jeddah's_activities_never_stop_year-around.jpg"
              alt={t('whyInvest.image2Caption')}
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 italic">
            {t('whyInvest.image2Caption')}
          </p>
          <Card className="p-8 md:p-10">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base md:text-lg">
              {t('whyInvest.luxuryMarketText2')}
            </p>
          </Card>
        </div>

        {/* Activities Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 text-center">
            {t('whyInvest.activitiesTitle')}
          </h2>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="rounded-xl overflow-hidden shadow-md aspect-video">
              <img
                src="/Jeddah's_activities_never_stop_year-around_2.jpg"
                alt="Jeddah activities"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md aspect-video">
              <img
                src="/Jeddah's_activities_never_stop_year-around_3.png"
                alt="Jeddah activities"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md aspect-video">
              <img
                src="/Jeddah's_activities_never_stop_year-around_4.jpg"
                alt="Jeddah water sports"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md aspect-video">
              <img
                src="/1.jpg"
                alt="Jeddah activities"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 italic">
            {t('whyInvest.activitiesCaption')}
          </p>
        </div>

        {/* HNWI Advantages */}
        <Card className="p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-400 mb-8 pb-4 border-b border-slate-200 dark:border-slate-700">
            {t('whyInvest.hnwiTitle')}
          </h2>
          <div className="space-y-6">
            {Array.isArray(hnwiItems) && hnwiItems.map((item, idx) => (
              <div key={idx} className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                <span className="font-bold text-slate-800 dark:text-slate-100">{item.title}: </span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Corniche / outdoor image */}
        <div className="space-y-2">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img
              src="/Jeddah_residents_enjoy_high_quality_of_indoor_and_outdoor_activities.jpg"
              alt={t('whyInvest.image3Caption')}
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 italic">
            {t('whyInvest.image3Caption')}
          </p>
        </div>

        {/* About Sky Property KSA */}
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="rounded-xl overflow-hidden shadow-lg order-2 md:order-1">
            <img
              src="/Jeddah_residents_enjoy_high_quality_of_indoor_and_outdoor_activities_2.png"
              alt={t('whyInvest.image3Caption')}
              className="w-full h-64 md:h-72 object-cover"
            />
          </div>
          <Card className="p-8 order-1 md:order-2">
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
              {t('whyInvest.aboutTitle')}
            </h2>
            <div className="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>{t('whyInvest.aboutText')}</p>
              <p>{t('whyInvest.aboutText2')}</p>
            </div>
          </Card>
        </div>

        {/* Investment Outlook with tower image */}
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img
              src="/World's_tallest_tower_is_being_erected_in_Jeddah.jpg"
              alt={t('whyInvest.image4Caption')}
              className="w-full h-72 md:h-96 object-cover"
            />
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 italic">
            {t('whyInvest.image4Caption')}
          </p>
          <Card className="p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-400 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              {t('whyInvest.outlookTitle')}
            </h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed text-base md:text-lg">
              <p>{t('whyInvest.outlookText')}</p>
              <p className="font-medium text-slate-700 dark:text-slate-200">{t('whyInvest.outlookText2')}</p>
            </div>
          </Card>
        </div>

        {/* Contact / Footer info */}
        <Card className="p-6 md:p-8 bg-slate-800 dark:bg-slate-900 text-white">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <Globe className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span className="font-medium text-white">{t('whyInvest.website')}:</span>
                <a
                  href="https://www.skypropertyksa.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  dir="ltr"
                >
                  www.skypropertyksa.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span className="font-medium text-white">{t('whyInvest.location')}:</span>
                <span>{t('whyInvest.locationValue')}</span>
              </div>
            </div>
            <div className="text-slate-400 text-sm text-center sm:text-right">
              <p className="font-semibold text-white text-lg">Sky Property KSA</p>
              <p>{t('whyInvest.subtitle')}</p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default WhyInvestPage;
