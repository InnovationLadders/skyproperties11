import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ChevronDown, ChevronUp, Phone, Mail, Edit } from 'lucide-react';
import { getRegulationsContent } from '../../utils/saudiRegulationsService';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../utils/constants';

export const SaudiRegulationsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    fetchContent();
  }, [i18n.language]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const result = await getRegulationsContent(i18n.language);
      if (result.success) {
        setContent(result.data);
      }
    } catch (error) {
      console.error('Error fetching regulations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="p-8">
          <p className="text-center text-muted-foreground">
            {t('saudiRegulations.noContent')}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {userProfile?.role === USER_ROLES.ADMIN && (
          <div className="mb-6 flex justify-end">
            <Button
              onClick={() => navigate('/admin/saudi-regulations')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              {t('saudiRegulations.editContent')}
            </Button>
          </div>
        )}

        <Card className="p-8 md:p-12">
          <div className="space-y-8">
            <div className="border-b pb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {content.title}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                {content.subtitle}
              </p>
              {content.lastUpdatedAt && (
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  {t('saudiRegulations.lastUpdated')}: {new Date(content.lastUpdatedAt?.toDate?.() || content.lastUpdatedAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {content.mainContent && (
              <div className="space-y-3">
                <div
                  className="text-slate-600 dark:text-slate-400 leading-relaxed prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: content.mainContent }}
                />
              </div>
            )}

            <div className="space-y-4 pt-6">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6">
                {t('saudiRegulations.questionsAnswers')}
              </h2>

              {content.sections && content.sections.map((section, index) => (
                <div
                  key={index}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden transition-all hover:shadow-md"
                >
                  <button
                    onClick={() => toggleSection(index)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors text-left"
                  >
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex-1 pr-4">
                      {section.question}
                    </h3>
                    {expandedSections[index] ? (
                      <ChevronUp className="h-5 w-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedSections[index] && (
                    <div className="px-6 py-4 bg-white dark:bg-slate-900">
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {section.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-200">
                {t('legal.privacyPolicy.contact')}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {t('saudiRegulations.contactText')}
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
        </Card>
      </div>
    </div>
  );
};

export default SaudiRegulationsPage;
