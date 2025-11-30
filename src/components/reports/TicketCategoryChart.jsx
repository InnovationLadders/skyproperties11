import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';

export function TicketCategoryChart({ data }) {
  const { t } = useTranslation();

  const chartData = [
    { name: t('reports.category.maintenance'), value: data.maintenance || 0 },
    { name: t('reports.category.repair'), value: data.repair || 0 },
    { name: t('reports.category.complaint'), value: data.complaint || 0 },
    { name: t('reports.category.inquiry'), value: data.inquiry || 0 },
    { name: t('reports.category.request'), value: data.request || 0 },
  ].filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('reports.ticketsByCategory')}</h3>
        <p className="text-gray-500 text-center py-8">{t('reports.noData')}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{t('reports.ticketsByCategory')}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#3b82f6" name={t('reports.count')} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
