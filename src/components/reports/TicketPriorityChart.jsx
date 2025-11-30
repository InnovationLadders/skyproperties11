import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';

const COLORS = {
  low: '#22c55e',
  medium: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
};

export function TicketPriorityChart({ data }) {
  const { t } = useTranslation();

  const chartData = [
    { name: t('reports.priority.low'), value: data.low || 0, color: COLORS.low },
    { name: t('reports.priority.medium'), value: data.medium || 0, color: COLORS.medium },
    { name: t('reports.priority.high'), value: data.high || 0, color: COLORS.high },
    { name: t('reports.priority.urgent'), value: data.urgent || 0, color: COLORS.urgent },
  ].filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('reports.ticketsByPriority')}</h3>
        <p className="text-gray-500 text-center py-8">{t('reports.noData')}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{t('reports.ticketsByPriority')}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
