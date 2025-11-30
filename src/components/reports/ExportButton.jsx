import { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function ExportButton({ data, reportType, propertyName }) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const exportToExcel = () => {
    try {
      setIsExporting(true);
      const workbook = XLSX.utils.book_new();

      if (data.summary) {
        const summaryData = Object.entries(data.summary).map(([key, value]) => ({
          [t('reports.metric')]: key,
          [t('reports.value')]: value,
        }));
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, t('reports.summary'));
      }

      if (data.tickets && Array.isArray(data.tickets)) {
        const ticketsData = data.tickets.map(ticket => ({
          [t('tickets.ticketNumber')]: ticket.ticketNumber,
          [t('tickets.title')]: ticket.title,
          [t('tickets.status')]: ticket.status,
          [t('tickets.priority')]: ticket.priority,
          [t('tickets.category')]: ticket.category,
          [t('common.createdAt')]: ticket.createdAt?.toDate?.()?.toLocaleDateString() || '',
        }));
        const ticketsSheet = XLSX.utils.json_to_sheet(ticketsData);
        XLSX.utils.book_append_sheet(workbook, ticketsSheet, t('reports.tickets'));
      }

      const fileName = `${propertyName}_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  const exportToPDF = () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text(`${t('reports.report')}: ${propertyName}`, 14, 20);

      doc.setFontSize(12);
      doc.text(`${t('reports.type')}: ${t(`reports.${reportType}`)}`, 14, 30);
      doc.text(`${t('reports.generatedOn')}: ${new Date().toLocaleDateString()}`, 14, 38);

      let yPosition = 50;

      if (data.summary) {
        doc.setFontSize(14);
        doc.text(t('reports.summary'), 14, yPosition);
        yPosition += 10;

        const summaryData = Object.entries(data.summary).map(([key, value]) => [key, value]);
        doc.autoTable({
          startY: yPosition,
          head: [[t('reports.metric'), t('reports.value')]],
          body: summaryData,
        });
        yPosition = doc.lastAutoTable.finalY + 10;
      }

      if (data.metrics) {
        doc.setFontSize(14);
        doc.text(t('reports.metrics'), 14, yPosition);
        yPosition += 10;

        const metricsData = Object.entries(data.metrics).map(([key, value]) => [
          key,
          typeof value === 'number' ? value.toFixed(2) : value,
        ]);
        doc.autoTable({
          startY: yPosition,
          head: [[t('reports.metric'), t('reports.value')]],
          body: metricsData,
        });
      }

      const fileName = `${propertyName}_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
      >
        <Download className="h-4 w-4 mr-2" />
        {t('reports.export')}
      </Button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          <button
            onClick={exportToPDF}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 rounded-t-lg"
          >
            <FileText className="h-4 w-4" />
            {t('reports.exportPDF')}
          </button>
          <button
            onClick={exportToExcel}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 rounded-b-lg"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {t('reports.exportExcel')}
          </button>
        </div>
      )}
    </div>
  );
}
