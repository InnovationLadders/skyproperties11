import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  BarChart3,
  Home,
  FileCheck,
  DollarSign,
  Calendar,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DateRangePicker } from '../../components/reports/DateRangePicker';
import { ReportCard } from '../../components/reports/ReportCard';
import { ExportButton } from '../../components/reports/ExportButton';
import {
  getOverviewReport,
  getDateRange,
  getComparisonData,
} from '../../utils/reportsService';
import { REPORT_PERIODS, REPORT_TYPES } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function ReportsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(REPORT_PERIODS.MONTHLY);
  const [overviewData, setOverviewData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [dateRange, setDateRange] = useState(() => getDateRange(REPORT_PERIODS.MONTHLY));
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    if (currentUser && userProfile) {
      loadProperties();
    }
  }, [currentUser, userProfile]);

  useEffect(() => {
    if (selectedProperty && dateRange) {
      loadOverview();
    } else if (properties.length === 0 && !loading) {
      setLoading(false);
    }
  }, [selectedProperty, dateRange, properties.length]);

  const loadProperties = async () => {
    if (!currentUser || !userProfile) {
      console.log('[ReportsPage] User not loaded yet');
      return;
    }

    try {
      const propertiesRef = collection(db, 'properties');
      let q;

      console.log('[ReportsPage] Loading properties for role:', userProfile.role);

      if (userProfile?.role === 'admin') {
        q = query(propertiesRef);
      } else {
        q = query(propertiesRef, where('managerId', '==', currentUser.uid));
      }

      const snapshot = await getDocs(q);
      const propertiesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('[ReportsPage] Loaded properties:', propertiesList.length);
      setProperties(propertiesList);

      if (propertiesList.length > 0) {
        setSelectedProperty(propertiesList[0].id);
      } else {
        console.warn('[ReportsPage] No properties found for this user');
        setLoading(false);
      }
    } catch (error) {
      console.error('[ReportsPage] Error loading properties:', error);
      setLoading(false);
    }
  };

  const loadOverview = async () => {
    try {
      setLoading(true);
      const [overview, comparison] = await Promise.all([
        getOverviewReport(selectedProperty, dateRange.startDate, dateRange.endDate),
        getComparisonData(selectedProperty, selectedPeriod),
      ]);
      setOverviewData(overview);
      setComparisonData(comparison);
    } catch (error) {
      console.error('Error loading overview:', error);
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

  const reportTypes = [
    {
      type: REPORT_TYPES.TICKETS,
      title: t('reports.ticketReport'),
      description: t('reports.ticketReportDesc'),
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      path: `/reports/tickets?propertyId=${selectedProperty}`,
    },
    {
      type: REPORT_TYPES.UNITS,
      title: t('reports.unitsReport'),
      description: t('reports.unitsReportDesc'),
      icon: Home,
      color: 'from-green-500 to-green-600',
      data: overviewData?.units,
    },
    {
      type: REPORT_TYPES.CONTRACTS,
      title: t('reports.contractsReport'),
      description: t('reports.contractsReportDesc'),
      icon: FileCheck,
      color: 'from-purple-500 to-purple-600',
      data: overviewData?.contracts,
    },
    {
      type: REPORT_TYPES.BILLING,
      title: t('reports.billingReport'),
      description: t('reports.billingReportDesc'),
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600',
      data: overviewData?.billing,
    },
    {
      type: REPORT_TYPES.BOOKINGS,
      title: t('reports.bookingsReport'),
      description: t('reports.bookingsReportDesc'),
      icon: Calendar,
      color: 'from-pink-500 to-pink-600',
      data: overviewData?.bookings,
    },
    {
      type: REPORT_TYPES.PERMITS,
      title: t('reports.permitsReport'),
      description: t('reports.permitsReportDesc'),
      icon: ShieldCheck,
      color: 'from-red-500 to-red-600',
      data: overviewData?.permits,
    },
  ];

  if (loading && !selectedProperty && properties.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!loading && properties.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('reports.noProperties')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('reports.noPropertiesDesc')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('reports.reports')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('reports.comprehensiveAnalytics')}
            </p>
          </div>
          {overviewData && (
            <ExportButton
              data={overviewData}
              reportType="overview"
              propertyName={
                properties.find(p => p.id === selectedProperty)?.name || 'Property'
              }
            />
          )}
        </div>

        {properties.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('reports.selectProperty')}
            </label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <DateRangePicker
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          onRangeChange={handleRangeChange}
        />

        {overviewData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ReportCard
                title={t('reports.totalTickets')}
                value={overviewData.tickets.summary.total}
                change={comparisonData?.tickets.change}
                icon={BarChart3}
                color="blue"
              />
              <ReportCard
                title={t('reports.openTickets')}
                value={overviewData.tickets.summary.open}
                icon={FileText}
                color="orange"
              />
              <ReportCard
                title={t('reports.totalUnits')}
                value={overviewData.units.summary.total}
                icon={Home}
                color="green"
              />
              <ReportCard
                title={t('reports.occupancyRate')}
                value={`${overviewData.units.occupancyRate.toFixed(1)}%`}
                icon={TrendingUp}
                color="purple"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">{t('reports.billing')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('reports.totalIssued')}
                    </span>
                    <span className="font-semibold">
                      {overviewData.billing.totalIssued.toLocaleString()} {t('common.sar')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('reports.totalCollected')}
                    </span>
                    <span className="font-semibold text-green-600">
                      {overviewData.billing.totalCollected.toLocaleString()} {t('common.sar')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('reports.outstanding')}
                    </span>
                    <span className="font-semibold text-red-600">
                      {overviewData.billing.totalOutstanding.toLocaleString()} {t('common.sar')}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">{t('reports.contracts')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('reports.activeContracts')}
                    </span>
                    <span className="font-semibold">{overviewData.contracts.summary.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('reports.expiringContracts')}
                    </span>
                    <span className="font-semibold text-yellow-600">
                      {overviewData.contracts.expiringContracts.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('reports.totalValue')}
                    </span>
                    <span className="font-semibold">
                      {overviewData.contracts.totalValue.toLocaleString()} {t('common.sar')}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">{t('reports.bookings')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('reports.totalBookings')}
                    </span>
                    <span className="font-semibold">{overviewData.bookings.summary.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('reports.approvalRate')}
                    </span>
                    <span className="font-semibold text-green-600">
                      {overviewData.bookings.approvalRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('reports.revenue')}
                    </span>
                    <span className="font-semibold">
                      {overviewData.bookings.totalRevenue.toLocaleString()} {t('common.sar')}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('reports.detailedReports')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((report) => (
              <Card
                key={report.type}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => report.path && navigate(report.path)}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${report.color} flex items-center justify-center mb-4`}>
                  <report.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {report.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {report.description}
                </p>
                {report.data && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {report.data.summary?.total || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('reports.total')}
                    </p>
                  </div>
                )}
                {report.path && (
                  <Button className="w-full mt-4" variant="outline">
                    {t('reports.viewDetails')}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
    </div>
  );
}
