import { useMemo, useState } from 'react';
import { useEnrollmentRows, useMonthPayments } from '../hooks/usePayments';
import { useAppStore } from '../store/appStore';
import { savePayment, methodLabel, STATUS_LABELS, summarizeRows } from '../db/payments';
import { useSettings } from '../hooks/useAuth';
import { PaymentRow } from '../components/payments/PaymentRow';
import { PaymentModal } from '../components/payments/PaymentModal';
import { PeriodFilter } from '../components/ui/PeriodFilter';
import { ExportToolbar } from '../components/reports/ExportToolbar';
import { PrintLayout } from '../components/reports/PrintLayout';
import { formatILS } from '../utils/currency';
import { monthName } from '../utils/dates';
import { exportEnrollmentReport, exportMonthlyPayments } from '../utils/exportExcel';
import { useClassrooms } from '../hooks/useClassrooms';
import { Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { saveEnrollmentPayment } from '../db/enrollmentPayments';

export function PaymentsPage() {
  const month = useAppStore((s) => s.selectedMonth);
  const year = useAppStore((s) => s.selectedYear);
  const settings = useSettings();
  const rows = useMonthPayments(year, month);
  const enrollment = useEnrollmentRows();
  const { classrooms } = useClassrooms();
  const [target, setTarget] = useState(null);
  const [unpaidOnly, setUnpaidOnly] = useState(false);
  const [paymentType, setPaymentType] = useState('monthly');
  const [classroomId, setClassroomId] = useState('');
  const sourceRows = paymentType === 'monthly' ? rows : enrollment;
  const stats = summarizeRows(sourceRows);
  const visible = sourceRows.filter((r) => (!unpaidOnly || r.payment.status !== 'paid') && (!classroomId || r.student.classroomId === classroomId));
  const kindergartenName = settings?.kindergartenName || 'روضتي';
  const title = `كشف المدفوعات — ${monthName(month)} ${year}`;

  const excelRows = useMemo(
    () =>
      rows.map(({ student, payment }) => [
        student.fullName,
        payment.amountDue,
        payment.amountPaid,
        STATUS_LABELS[payment.status],
        methodLabel(payment.paymentMethod, payment.paymentMethodNote),
        payment.paymentDate || '',
        payment.note || '',
      ]),
    [rows],
  );

  async function handleSave(payment) {
    if (paymentType === 'enrollment') await saveEnrollmentPayment(payment);
    else await savePayment(payment);
    setTarget(null);
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-xl font-extrabold">تتبع المدفوعات</h2><p className="text-sm text-slate-500">{paymentType === 'monthly' ? 'الرسوم الشهرية' : 'رسوم التسجيل (مرة واحدة)'}</p></div>
        <PeriodFilter withSearch />
      </div>
      <div className="no-print mb-4 flex gap-2"><Button variant={paymentType === 'monthly' ? 'primary' : 'secondary'} onClick={() => setPaymentType('monthly')}>الاشتراكات الشهرية</Button><Button variant={paymentType === 'enrollment' ? 'primary' : 'secondary'} onClick={() => setPaymentType('enrollment')}>رسوم التسجيل</Button></div>
      <ExportToolbar
        reportTitle={paymentType === 'monthly' ? title : 'تقرير رسوم التسجيل'}
        onExcelExport={() =>
          paymentType === 'enrollment' ? exportEnrollmentReport({
            kindergartenName,
            stats,
            rows: sourceRows.map(({ student, payment }) => [student.fullName, payment.amountDue, payment.amountPaid, STATUS_LABELS[payment.status], methodLabel(payment.paymentMethod, payment.paymentMethodNote), payment.paymentDate || '', payment.note || '']),
          }) : exportMonthlyPayments({
            kindergartenName,
            month,
            year,
            stats,
            rows: excelRows,
          })
        }
        onPrint={() => window.print()}
      />
      <div className="no-print mb-3 flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={unpaidOnly} onChange={(e) => setUnpaidOnly(e.target.checked)} />عرض غير المدفوعين فقط</label><div className="min-w-52"><Select value={classroomId} onChange={(e) => setClassroomId(e.target.value)} aria-label="تصفية المدفوعات حسب الفصل"><option value="">جميع الفصول</option>{classrooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</Select></div></div>
      <div className="no-print grid gap-3">
        {visible.map((row) => (
          <PaymentRow key={row.student.id} {...row} onPay={setTarget} />
        ))}
        {visible.length === 0 ? (
          <p className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500">لا توجد بيانات لهذا الشهر.</p>
        ) : null}
      </div>
      <PaymentModal open={!!target} target={target} onClose={() => setTarget(null)} onSave={handleSave} title={paymentType === 'enrollment' ? 'رسوم تسجيل' : undefined} />

      <div className="print-only">
        <PrintLayout kindergartenName={kindergartenName} title={title}>
          <table className="print-table">
            <thead>
              <tr>
                <th>الطالب</th>
                <th>المطلوب</th>
                <th>المدفوع</th>
                <th>الحالة</th>
                <th>التوقيع</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ student, payment }) => (
                <tr key={student.id}>
                  <td>{student.fullName}</td>
                  <td>{formatILS(payment.amountDue)}</td>
                  <td>{formatILS(payment.amountPaid)}</td>
                  <td>{STATUS_LABELS[payment.status]}</td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </PrintLayout>
      </div>
    </div>
  );
}
