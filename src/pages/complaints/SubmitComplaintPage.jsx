import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { MessageSquare, CheckCircle, ArrowLeft } from 'lucide-react';
import { createComplaint } from '../../utils/complaintService';
import { COMPLAINT_TYPES } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';

export const SubmitComplaintPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    type: COMPLAINT_TYPES.SERVICE,
    subject: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('complaint.errors.nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('complaint.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('complaint.errors.emailInvalid');
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t('complaint.errors.subjectRequired');
    }

    if (!formData.description.trim()) {
      newErrors.description = t('complaint.errors.descriptionRequired');
    } else if (formData.description.trim().length < 20) {
      newErrors.description = t('complaint.errors.descriptionTooShort');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const complaintData = {
        ...formData,
        userId: user?.uid || null,
      };

      const result = await createComplaint(complaintData);
      setReferenceNumber(result.referenceNumber);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert(t('complaint.errors.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              {t('complaint.submitSuccess')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {t('complaint.submitSuccessMessage')}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                {t('complaint.referenceNumberLabel')}
              </p>
              <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
                {referenceNumber}
              </p>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              {t('complaint.submitSuccessNote')}
            </p>
            <Button onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('common.backToHome')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t('complaint.submitComplaintTitle')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t('complaint.submitComplaintSubtitle')}
          </p>
        </div>

        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">
                  {t('complaint.name')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t('complaint.namePlaceholder')}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">
                  {t('complaint.email')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t('complaint.emailPlaceholder')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phone">{t('complaint.phone')}</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={t('complaint.phonePlaceholder')}
                  dir="ltr"
                />
              </div>

              <div>
                <Label htmlFor="type">
                  {t('complaint.type')} <span className="text-red-500">*</span>
                </Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  {Object.values(COMPLAINT_TYPES).map((type) => (
                    <option key={type} value={type}>
                      {t(`complaint.types.${type}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="subject">
                {t('complaint.subject')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder={t('complaint.subjectPlaceholder')}
                className={errors.subject ? 'border-red-500' : ''}
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">
                {t('complaint.description')} <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('complaint.descriptionPlaceholder')}
                rows="6"
                className={`w-full px-3 py-2 border ${
                  errors.description
                    ? 'border-red-500'
                    : 'border-slate-300 dark:border-slate-600'
                } rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 resize-y`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('complaint.descriptionHint')}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('common.submitting') : t('complaint.submitButton')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
