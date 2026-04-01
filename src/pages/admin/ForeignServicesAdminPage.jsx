import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Save, Eye, Globe } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { foreignServicesService } from '../../utils/foreignServicesService';
import { useAuth } from '../../contexts/AuthContext';

export default function ForeignServicesAdminPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    page_title: '',
    page_subtitle: '',
    section_1_title: '',
    section_1_content: '',
    section_2_title: '',
    section_2_content: '',
    section_3_title: '',
    section_3_content: '',
    section_4_title: '',
    section_4_content: '',
  });

  useEffect(() => {
    if (userProfile?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchContent();
  }, [userProfile, selectedLanguage]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const data = await foreignServicesService.getContentForAdmin(selectedLanguage);
      if (data) {
        setFormData({
          page_title: data.page_title || '',
          page_subtitle: data.page_subtitle || '',
          section_1_title: data.section_1_title || '',
          section_1_content: data.section_1_content || '',
          section_2_title: data.section_2_title || '',
          section_2_content: data.section_2_content || '',
          section_3_title: data.section_3_title || '',
          section_3_content: data.section_3_content || '',
          section_4_title: data.section_4_title || '',
          section_4_content: data.section_4_content || '',
        });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      alert(t('foreignServices.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await foreignServicesService.updateContent(
        selectedLanguage,
        formData,
        userProfile?.email || 'admin'
      );
      alert(t('foreignServices.saveSuccess'));
    } catch (error) {
      console.error('Error saving content:', error);
      alert(t('foreignServices.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      await foreignServicesService.updateContent(
        selectedLanguage,
        formData,
        userProfile?.email || 'admin'
      );
      await foreignServicesService.publishContent(
        selectedLanguage,
        userProfile?.email || 'admin'
      );
      alert(t('foreignServices.publishSuccess'));
    } catch (error) {
      console.error('Error publishing content:', error);
      alert(t('foreignServices.publishFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('foreignServices.loading')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('foreignServices.adminTitle')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('foreignServices.adminDescription')}
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Label className="font-semibold">{t('foreignServices.language')}:</Label>
            <div className="flex gap-2">
              <Button
                variant={selectedLanguage === 'en' ? 'default' : 'outline'}
                onClick={() => setSelectedLanguage('en')}
                size="sm"
              >
                <Globe className="w-4 h-4 mr-2" />
                {t('foreignServices.english')}
              </Button>
              <Button
                variant={selectedLanguage === 'ar' ? 'default' : 'outline'}
                onClick={() => setSelectedLanguage('ar')}
                size="sm"
              >
                <Globe className="w-4 h-4 mr-2" />
                {t('foreignServices.arabic')}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/foreign-services')}
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              {t('common.view')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? t('foreignServices.saving') : t('foreignServices.saveChanges')}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              {saving ? t('foreignServices.publishing') : t('foreignServices.publishContent')}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">
              {t('saudiRegulations.basicInfo')}
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="page_title">{t('foreignServices.pageTitle')}</Label>
                <Input
                  id="page_title"
                  name="page_title"
                  value={formData.page_title}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="page_subtitle">{t('foreignServices.pageSubtitle')}</Label>
                <Input
                  id="page_subtitle"
                  name="page_subtitle"
                  value={formData.page_subtitle}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedLanguage === 'en' ? 'Section 1: Premium Residency Services' : 'القسم 1: خدمات الإقامة المميزة'}
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="section_1_title">{t('foreignServices.sectionTitle')}</Label>
                <Input
                  id="section_1_title"
                  name="section_1_title"
                  value={formData.section_1_title}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="section_1_content">{t('foreignServices.sectionContent')}</Label>
                <textarea
                  id="section_1_content"
                  name="section_1_content"
                  value={formData.section_1_content}
                  onChange={handleChange}
                  rows={6}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedLanguage === 'en' ? 'Section 2: Legal & Compliance Services' : 'القسم 2: الخدمات القانونية والامتثال'}
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="section_2_title">{t('foreignServices.sectionTitle')}</Label>
                <Input
                  id="section_2_title"
                  name="section_2_title"
                  value={formData.section_2_title}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="section_2_content">{t('foreignServices.sectionContent')}</Label>
                <textarea
                  id="section_2_content"
                  name="section_2_content"
                  value={formData.section_2_content}
                  onChange={handleChange}
                  rows={6}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedLanguage === 'en' ? 'Section 3: Specialized Real Estate Concierge' : 'القسم 3: الخدمات العقارية المتخصصة'}
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="section_3_title">{t('foreignServices.sectionTitle')}</Label>
                <Input
                  id="section_3_title"
                  name="section_3_title"
                  value={formData.section_3_title}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="section_3_content">{t('foreignServices.sectionContent')}</Label>
                <textarea
                  id="section_3_content"
                  name="section_3_content"
                  value={formData.section_3_content}
                  onChange={handleChange}
                  rows={6}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedLanguage === 'en' ? 'Section 4: Post-Purchase & Relocation Services' : 'القسم 4: خدمات ما بعد الشراء'}
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="section_4_title">{t('foreignServices.sectionTitle')}</Label>
                <Input
                  id="section_4_title"
                  name="section_4_title"
                  value={formData.section_4_title}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="section_4_content">{t('foreignServices.sectionContent')}</Label>
                <textarea
                  id="section_4_content"
                  name="section_4_content"
                  value={formData.section_4_content}
                  onChange={handleChange}
                  rows={6}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/foreign-services')}
          >
            <Eye className="w-4 h-4 mr-2" />
            {t('common.view')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? t('foreignServices.saving') : t('foreignServices.saveChanges')}
          </Button>
          <Button
            onClick={handlePublish}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            {saving ? t('foreignServices.publishing') : t('foreignServices.publishContent')}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
