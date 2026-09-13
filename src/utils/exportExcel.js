import * as XLSX from 'xlsx';
import { formatILS } from './currency';
import { monthName } from './dates';

function safeName(text) {
  return String(text || 'روضة')
    .replace(/[\\/:*?"<>|]+/g, '_')
    .trim();
}

export function excelFileName(kindergartenName, reportName, month, year) {
  const parts = [safeName(kindergartenName), safeName(reportName)];
  if (month) parts.push(monthName(month));
  if (year) parts.push(String(year));
  return `${parts.join('_')}.xlsx`;
}

function applyRtlSheet(ws, colWidths) {
  ws['!dir'] = 'rtl';
  if (colWidths) {
    ws['!cols'] = colWidths.map((wch) => ({ wch }));
  }
}

function paintStatusRows(ws, rows, statusKey = 'الحالة') {
  const header = rows[0] || [];
  const statusIndex = header.indexOf(statusKey);
  if (statusIndex < 0) return;
  const fills = {
    'تم الدفع': 'C6F6D5',
    مدفوع: 'C6F6D5',
    'دفع جزئي': 'FEF3C7',
    جزئي: 'FEF3C7',
    'لم يدفع': 'FECACA',
  };
  rows.forEach((row, r) => {
    if (r === 0) return;
    const color = fills[row[statusIndex]];
    if (!color) return;
    const cell = XLSX.utils.encode_cell({ r, c: statusIndex });
    if (!ws[cell]) return;
    ws[cell].s = {
      fill: { fgColor: { rgb: color } },
    };
  });
}

function downloadWorkbook(wb, filename) {
  XLSX.writeFile(wb, filename);
}

export function exportWorkbook({ filename, summaryRows, detailRows, detailName = 'التفاصيل', colWidths }) {
  const wb = XLSX.utils.book_new();
  const summary = XLSX.utils.aoa_to_sheet(summaryRows);
  applyRtlSheet(summary, [28, 36]);
  XLSX.utils.book_append_sheet(wb, summary, 'ملخص');

  const detail = XLSX.utils.aoa_to_sheet(detailRows);
  applyRtlSheet(detail, colWidths);
  paintStatusRows(detail, detailRows);
  XLSX.utils.book_append_sheet(wb, detail, detailName);
  downloadWorkbook(wb, filename);
}

export function exportMonthlyPayments({ kindergartenName, month, year, stats, rows }) {
  const filename = excelFileName(kindergartenName, 'كشف_المدفوعات', month, year);
  exportWorkbook({
    filename,
    summaryRows: [
      ['اسم الروضة', kindergartenName],
      ['الشهر', `${monthName(month)} ${year}`],
      ['عدد الطلاب', stats.totalStudents],
      ['المطلوب', formatILS(stats.due)],
      ['المحصّل', formatILS(stats.paid)],
      ['العجز', formatILS(stats.deficit)],
    ],
    detailRows: [
      ['اسم الطالب', 'المبلغ المطلوب', 'المدفوع', 'الحالة', 'الطريقة', 'التاريخ', 'الملاحظة'],
      ...rows,
    ],
    colWidths: [24, 16, 14, 14, 16, 16, 28],
  });
}

export function exportUnpaidList({ kindergartenName, month, year, rows }) {
  const filename = excelFileName(kindergartenName, 'غير_المدفوعين', month, year);
  exportWorkbook({
    filename,
    summaryRows: [
      ['اسم الروضة', kindergartenName],
      ['الشهر', `${monthName(month)} ${year}`],
      ['عدد غير المدفوعين', rows.length],
    ],
    detailRows: [['اسم الطالب', 'رقم ولي الأمر', 'المبلغ المطلوب'], ...rows],
    colWidths: [24, 18, 16],
  });
}

export function exportYearlyReport({ kindergartenName, year, rows, totals }) {
  const filename = excelFileName(kindergartenName, 'التقرير_السنوي', null, year);
  exportWorkbook({
    filename,
    summaryRows: [
      ['اسم الروضة', kindergartenName],
      ['السنة', year],
      ['إجمالي المحصّل', formatILS(totals.paid)],
      ['إجمالي المطلوب', formatILS(totals.due)],
      ['العجز', formatILS(totals.deficit)],
    ],
    detailRows: [['الشهر', 'المحصّل', 'المطلوب', 'العجز', 'نسبة التحصيل'], ...rows],
    colWidths: [16, 16, 16, 16, 16],
  });
}

export function exportStudentLedger({ kindergartenName, studentName, rows }) {
  const filename = excelFileName(kindergartenName, `سجل_${studentName}`);
  exportWorkbook({
    filename,
    summaryRows: [
      ['اسم الروضة', kindergartenName],
      ['الطالب', studentName],
      ['عدد السجلات', rows.length],
    ],
    detailRows: [['الشهر', 'السنة', 'المطلوب', 'المدفوع', 'الحالة', 'الطريقة', 'التاريخ', 'ملاحظة'], ...rows],
    colWidths: [14, 10, 14, 14, 14, 16, 16, 24],
  });
}

export function exportStudentsList({ kindergartenName, rows }) {
  const filename = excelFileName(kindergartenName, 'قائمة_الطلاب');
  exportWorkbook({
    filename,
    summaryRows: [
      ['اسم الروضة', kindergartenName],
      ['عدد الطلاب', rows.length],
    ],
    detailRows: [
      [
        'الاسم',
        'ولي الأمر',
        'صلة القرابة',
        'الجوال',
        'جوال ثانوي',
        'البريد',
        'الفصل',
        'الرسوم الشهرية',
        'الحالة',
      ],
      ...rows,
    ],
    colWidths: [22, 20, 14, 16, 16, 24, 12, 16, 12],
  });
}
