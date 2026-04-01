import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Loader as Loader2, CreditCard as Edit, Mail } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ContactRequestModal } from '../../components/property/ContactRequestModal';
import { foreignServicesService } from '../../utils/foreignServicesService';
import { useAuth } from '../../contexts/AuthContext';

export default function ForeignServicesPage() {
  const { t, i18n } = useTranslation();
  const { userProfile } = useAuth();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const currentLanguage = i18n.language;

  useEffect(() => {
    fetchContent();
  }, [currentLanguage]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await foreignServicesService.getContent(currentLanguage);
      setContent(data);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatContent = (text) => {
    if (!text) return [];
    return text.split('\n').filter(line => line.trim());
  };

  const isAdmin = userProfile?.role === 'admin';

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    );
  }

  if (error || !content) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <p className="text-red-600">{t('foreignServices.errorLoading')}</p>
            <Button onClick={fetchContent} className="mt-4">
              {t('common.retry')}
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {content.page_title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {content.page_subtitle}
            </p>
          </div>
          {isAdmin && (
            <Link to="/admin/foreign-services">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                {t('foreignServices.editContent')}
              </Button>
            </Link>
          )}
        </div>

        <div className="space-y-8">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {content.section_1_title}
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              {formatContent(content.section_1_content).map((line, idx) => (
                <p key={idx} className="text-gray-700 dark:text-gray-300 mb-2">
                  {line}
                </p>
              ))}
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {content.section_2_title}
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              {formatContent(content.section_2_content).map((line, idx) => (
                <p key={idx} className="text-gray-700 dark:text-gray-300 mb-2">
                  {line}
                </p>
              ))}
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {content.section_3_title}
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              {formatContent(content.section_3_content).map((line, idx) => (
                <p key={idx} className="text-gray-700 dark:text-gray-300 mb-2">
                  {line}
                </p>
              ))}
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {content.section_4_title}
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              {formatContent(content.section_4_content).map((line, idx) => (
                <p key={idx} className="text-gray-700 dark:text-gray-300 mb-2">
                  {line}
                </p>
              ))}
            </div>
          </Card>

          <Card className="p-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <Mail className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('foreignServices.contactUs')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('foreignServices.contactUsDescription')}
              </p>
              <Button
                onClick={() => setShowContactModal(true)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="w-5 h-5 mr-2" />
                {t('contactRequest.requestContact')}
              </Button>
            </div>
          </Card>
        </div>

        {content.last_updated_by && (
          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">
            {t('foreignServices.lastUpdated')}: {new Date(content.updated_at).toLocaleDateString()} |{' '}
            {t('foreignServices.updatedBy')}: {content.last_updated_by}
          </div>
        )}
      </div>

      <ContactRequestModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        property={{ id: null, name: 'Foreign Services Inquiry' }}
        unit={null}
      />
    </MainLayout>
  );
}
