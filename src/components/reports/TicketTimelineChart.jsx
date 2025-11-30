import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Card } from '../ui/Card';

export function TicketTimelineChart({ data }) {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('reports.ticketsOverTime')}</h3>
        <p className="text-gray-500 text-center py-8">{t('reports.noData')}</p>
      </Card>
    );
  }

  const formattedData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd'),
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{t('reports.ticketsOverTime')}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            name={t('reports.tickets')}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
