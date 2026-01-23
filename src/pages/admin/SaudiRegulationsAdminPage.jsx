import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { ArrowLeft, Save, Plus, Trash2, Eye } from 'lucide-react';
import { getRegulationsContent, updateRegulationsContent, publishContent } from '../../utils/saudiRegulationsService';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../utils/constants';

export const SaudiRegulationsAdminPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { userProfile, currentUser } = useAuth();
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    mainContent: '',
    sections: [],
    isPublished: true
  });

  useEffect(() => {
    if (userProfile?.role !== USER_ROLES.ADMIN) {
      navigate('/');
      return;
    }
    fetchContent();
  }, [language, userProfile]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const result = await getRegulationsContent(language);
      if (result.success && result.data) {
        setFormData({
          title: result.data.title || '',
          subtitle: result.data.subtitle || '',
          mainContent: result.data.mainContent || '',
          sections: result.data.sections || [],
          isPublished: result.data.isPublished !== false
        });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateRegulationsContent(language, formData, currentUser.uid);
      if (result.success) {
        alert(t('saudiRegulations.saveSuccess'));
      } else {
        alert(t('saudiRegulations.saveFailed'));
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert(t('saudiRegulations.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await updateRegulationsContent(language, formData, currentUser.uid);
      const result = await publishContent(language, currentUser.uid);
      if (result.success) {
        alert(t('saudiRegulations.publishSuccess'));
        fetchContent();
      } else {
        alert(t('saudiRegulations.publishFailed'));
      }
    } catch (error) {
      console.error('Error publishing content:', error);
      alert(t('saudiRegulations.publishFailed'));
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { question: '', answer: '' }]
    }));
  };

  const updateSection = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const removeSection = (index) => {
    if (window.confirm(t('saudiRegulations.deleteQuestionConfirm'))) {
      setFormData(prev => ({
        ...prev,
        sections: prev.sections.filter((_, i) => i !== index)
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/saudi-regulations')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{t('saudiRegulations.editContent')}</h1>
              <p className="text-muted-foreground">{t('saudiRegulations.adminDescription')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/saudi-regulations')}
            >
              <Eye className="h-4 w-4 mr-2" />
              {t('common.preview')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <Label>{t('saudiRegulations.language')}</Label>
          <div className="flex gap-2 mt-2">
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              onClick={() => setLanguage('en')}
            >
              English
            </Button>
            <Button
              variant={language === 'ar' ? 'default' : 'outline'}
              onClick={() => setLanguage('ar')}
            >
              العربية
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('saudiRegulations.basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">{t('saudiRegulations.pageTitle')}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('saudiRegulations.titlePlaceholder')}
                  className={language === 'ar' ? 'text-right' : ''}
                />
              </div>
              <div>
                <Label htmlFor="subtitle">{t('saudiRegulations.pageSubtitle')}</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder={t('saudiRegulations.subtitlePlaceholder')}
                  className={language === 'ar' ? 'text-right' : ''}
                />
              </div>
              <div>
                <Label htmlFor="mainContent">{t('saudiRegulations.introContent')}</Label>
                <RichTextEditor
                  value={formData.mainContent}
                  onChange={(value) => setFormData(prev => ({ ...prev, mainContent: value }))}
                  placeholder={t('saudiRegulations.contentPlaceholder')}
                  isRTL={language === 'ar'}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t('saudiRegulations.questionsAnswers')}</CardTitle>
                <Button onClick={addSection} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('saudiRegulations.addQuestion')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.sections.map((section, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">
                      {t('saudiRegulations.question')} {index + 1}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <Label>{t('saudiRegulations.questionText')}</Label>
                    <Input
                      value={section.question}
                      onChange={(e) => updateSection(index, 'question', e.target.value)}
                      placeholder={t('saudiRegulations.questionPlaceholder')}
                      className={language === 'ar' ? 'text-right' : ''}
                    />
                  </div>
                  <div>
                    <Label>{t('saudiRegulations.answerText')}</Label>
                    <textarea
                      value={section.answer}
                      onChange={(e) => updateSection(index, 'answer', e.target.value)}
                      placeholder={t('saudiRegulations.answerPlaceholder')}
                      rows={4}
                      className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${language === 'ar' ? 'text-right' : ''}`}
                    />
                  </div>
                </div>
              ))}
              {formData.sections.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {t('saudiRegulations.noQuestions')}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/saudi-regulations')}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={saving}
            >
              {saving ? t('common.saving') : t('saudiRegulations.publishContent')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaudiRegulationsAdminPage;
