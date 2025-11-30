import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Star,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DateRangePicker } from '../../components/reports/DateRangePicker';
import { ReportCard } from '../../components/reports/ReportCard';
import { TicketPriorityChart } from '../../components/reports/TicketPriorityChart';
import { TicketCategoryChart } from '../../components/reports/TicketCategoryChart';
import { TicketTimelineChart } from '../../components/reports/TicketTimelineChart';
import { ExportButton } from '../../components/reports/ExportButton';
import { getTicketsReport, getDateRange, getComparisonData } from '../../utils/reportsService';
import { REPORT_PERIODS } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';

export default function TicketReportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, userProfile } = useAuth();
  const propertyId = searchParams.get('propertyId');

  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(REPORT_PERIODS.MONTHLY);
  const [reportData, setReportData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [dateRange, setDateRange] = useState(() => getDateRange(REPORT_PERIODS.MONTHLY));

  useEffect(() => {
    if (propertyId) {
      loadReport();
    }
  }, [propertyId, dateRange]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const [report, comparison] = await Promise.all([
        getTicketsReport(propertyId, dateRange.startDate, dateRange.endDate),
        getComparisonData(propertyId, selectedPeriod),
      ]);
      setReportData(report);
      setComparisonData(comparison);
    } catch (error) {
      console.error('Error loading ticket report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (period, customStart, customEnd) => {
    if (period === REPORT_PERIODS.CUSTOM && customStart && customEnd) {
      setDateRange({ startDate: customStart, endDate: customEnd });
    } else {
      setDateRange(getDateRange(period));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">{t('reports.noData')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('reports.ticketReport')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('reports.detailedAnalysis')}
              </p>
            </div>
          </div>
          <ExportButton
            data={reportData}
            reportType="tickets"
            propertyName={userProfile?.propertyName || 'Property'}
          />
        </div>

        <DateRangePicker
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          onRangeChange={handleRangeChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ReportCard
            title={t('reports.totalTickets')}
            value={reportData.summary.total}
            change={comparisonData?.tickets.change}
            icon={BarChart3}
            color="blue"
          />
          <ReportCard
            title={t('reports.openTickets')}
            value={reportData.summary.open}
            icon={AlertCircle}
            color="orange"
          />
          <ReportCard
            title={t('reports.completionRate')}
            value={`${(reportData.metrics.completionRate * 100).toFixed(1)}%`}
            change={comparisonData?.completionRate.change}
            icon={CheckCircle}
            color="green"
          />
          <ReportCard
            title={t('reports.avgRating')}
            value={reportData.metrics.avgRating.toFixed(1)}
            subtitle={`${t('reports.outOf')} 5`}
            icon={Star}
            color="yellow"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReportCard
            title={t('reports.avgResponseTime')}
            value={`${reportData.metrics.avgResponseTime.toFixed(1)} ${t('reports.hours')}`}
            icon={Clock}
            color="purple"
          />
          <ReportCard
            title={t('reports.avgResolutionTime')}
            value={`${reportData.metrics.avgResolutionTime.toFixed(1)} ${t('reports.hours')}`}
            change={comparisonData?.avgResolutionTime.change}
            icon={TrendingUp}
            color="blue"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TicketPriorityChart data={reportData.byPriority} />
          <TicketCategoryChart data={reportData.byCategory} />
        </div>

        <TicketTimelineChart data={reportData.timeline} />

        {reportData.topIssues && reportData.topIssues.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('reports.topIssues')}</h3>
            <div className="space-y-3">
              {reportData.topIssues.map((issue, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <span className="text-gray-900 dark:text-white">{issue.issue}</span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    {issue.count} {t('reports.occurrences')}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {reportData.slowestTickets && reportData.slowestTickets.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('reports.slowestTickets')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4">{t('tickets.ticketNumber')}</th>
                    <th className="text-left py-3 px-4">{t('tickets.title')}</th>
                    <th className="text-right py-3 px-4">{t('reports.resolutionTime')}</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.slowestTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-4">{ticket.ticketNumber}</td>
                      <td className="py-3 px-4">{ticket.title}</td>
                      <td className="py-3 px-4 text-right">
                        {ticket.resolutionTime.toFixed(1)} {t('reports.hours')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('reports.statusBreakdown')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(reportData.summary).map(([status, count]) => (
              <div key={status} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t(`tickets.status.${status}`)}
                </p>
              </div>
            ))}
          </div>
        </Card>
    </div>
  );
}
