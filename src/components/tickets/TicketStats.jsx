import { motion } from 'framer-motion';
import { Ticket, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { useTranslation } from 'react-i18next';
import { TICKET_STATUS } from '../../utils/constants';

export const TicketStats = ({ tickets }) => {
  const { t } = useTranslation();

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === TICKET_STATUS.OPEN).length,
    inProgress: tickets.filter(t =>
      t.status === TICKET_STATUS.ASSIGNED || t.status === TICKET_STATUS.IN_PROGRESS
    ).length,
    completed: tickets.filter(t => t.status === TICKET_STATUS.COMPLETED).length,
    closed: tickets.filter(t => t.status === TICKET_STATUS.CLOSED).length,
  };

  const statCards = [
    {
      label: t('ticket.stats.total'),
      value: stats.total,
      icon: Ticket,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: t('ticket.stats.open'),
      value: stats.open,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: t('ticket.stats.inProgress'),
      value: stats.inProgress,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: t('ticket.stats.completed'),
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
