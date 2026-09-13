import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useMonthPayments, useDailyPayments } from '../hooks/usePayments';
import { useSettings } from '../hooks/useAuth';
import { useAppStore } from '../store/appStore';
import { listStudents } from '../db/students';
import { methodLabel, STATUS_LABELS, summarizeRows } from '../db/payments';
import { formatILS } from '../utils/currency';
import { ARABIC_MONTHS, monthName, todayISO } from '../utils/dates';
import { PeriodFilter } from '../components/ui/PeriodFilter';
import { ExportToolbar } from '../components/reports/ExportToolbar';
import { PrintLayout } from '../components/reports/PrintLayout';
import { UnpaidList } from '../components/dashboard/UnpaidList';
import { exportMonthlyPayments, exportUnpaidList, exportYearlyReport } from '../utils/exportExcel';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search } from 'lucide-react';

export function ReportsPage() {
  const month = useAppStore((s) => s.selectedMonth);
  const year = useAppStore((s) => s.selectedYear);
  const settings = useSettings();
  const rows = useMonthPayments(year, month);
  const [dayDraft, setDayDraft] = useState(todayISO());
  const [day, setDay] = useState(todayISO());
  const daily = useDailyPayments(day);
  const stats = summarizeRows(rows);
  const [tab, setTab] = useState('month');
  const kindergartenName = settings?.kindergartenName || 'روضتي';

  const yearly = useLiveQuery(async () => {
    const students = (await listStudents()).filter((s) => s.isActive !== false);
    const payments = (await db.payments.toArray()).filter((p) => Number(p.year) === Number(year));
    return ARABIC_MONTHS.map((name, i) => {
      const m = i + 1;
      const due = students.reduce((sum, s) => sum + (Number(s.monthlyFee) || 0), 0);
      const monthPays = payments.filter((p) => Number(p.month) === m);
      const paid = monthPays.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
      return {
        name,
        month: m,
        paid,
        due,
        deficit: Math.max(due - paid, 0),
        rate: due ? Math.round((paid / due) * 100) : 0,
      };
    });
  }, [year]) || [];

  const methodData = useMemo(() => {
    const map = {};
    rows.forEach(({ payment }) => {
      if (payment.status === 'unpaid') return;
      const key = methodLabel(payment.paymentMethod, '');
      map[key] = (map[key] || 0) + (Number(payment.amountPaid) || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [rows]);

  const yearTotals = yearly.reduce(
    (acc, r) => ({ paid: acc.paid + r.paid, due: acc.due + r.due, deficit: acc.deficit + r.deficit }),
    { paid: 0, due: 0, deficit: 0 },
  );
  const best = [...yearly].sort((a, b) => b.paid - a.paid)[0];
  const worst = [...yearly].sort((a, b) => a.paid - b.paid)[0];

  function exportCurrent() {
    if (tab === 'unpaid') {
      exportUnpaidList({
        kindergartenName,
        month,
        year,
        rows: stats.unpaid.map(({ student, payment }) => [student.fullName, student.phone1, payment.amountDue]),
      });
      return;
    }
    if (tab === 'year') {
      exportYearlyReport({
        kindergartenName,
        year,
        totals: yearTotals,
        rows: yearly.map((r) => [r.name, r.paid, r.due, r.deficit, `${r.rate}%`]),
      });
      return;
    }
    exportMonthlyPayments({
      kindergartenName,
      month,
      year,
      stats,
      rows: rows.map(({ student, payment }) => [
        student.fullName,
        payment.amountDue,
        payment.amountPaid,
        STATUS_LABELS[payment.status],
        methodLabel(payment.paymentMethod, payment.paymentMethodNote),
        payment.paymentDate || '',
        payment.note || '',
      ]),
    });
  }

  const title =
    tab === 'year'
      ? `التقرير السنوي ${year}`
      : tab === 'day'
        ? `تقرير اليوم ${day}`
        : `التقرير الشهري — ${monthName(month)} ${year}`;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-xl font-extrabold">الإحصائيات والتقارير</h2>
        {tab === 'day' ? (
          <div className="grid grid-cols-2 gap-2 sm:w-80">
            <Input
              label="اليوم"
              type="date"
              value={dayDraft}
              onChange={(e) => setDayDraft(e.target.value)}
            />
            <Button className="self-end w-full" onClick={() => setDay(dayDraft || todayISO())}>
              <Search size={16} />
              بحث
            </Button>
          </div>
        ) : (
          <PeriodFilter
            withSearch
            showMonth={tab !== 'year'}
            showYear
          />
        )}
      </div>
      <div className="no-print mb-4 flex flex-wrap gap-2">
        {[
          ['day', 'يومي'],
          ['month', 'شهري'],
          ['year', 'سنوي'],
          ['unpaid', 'المتأخرون'],
        ].map(([id, label]) => (
          <Button key={id} variant={tab === id ? 'primary' : 'secondary'} onClick={() => setTab(id)}>
            {label}
          </Button>
        ))}
      </div>
      <ExportToolbar reportTitle={title} onExcelExport={exportCurrent} onPrint={() => window.print()} />

      {tab === 'month' || tab === 'unpaid' ? (
        <div className="grid gap-4">
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex justify-between text-sm">
              <span>نسبة التحصيل</span>
              <b>{stats.rate}%</b>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${stats.rate}%` }} />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              المحصّل {formatILS(stats.paid)} من {formatILS(stats.due)}
            </p>
          </div>
          {methodData.length ? (
            <ChartCard title="توزيع طرق الدفع">
              <BarChartBox data={methodData} x="name" y="value" />
            </ChartCard>
          ) : null}
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <h3 className="mb-3 font-extrabold">غير المدفوعين</h3>
            <UnpaidList rows={stats.unpaid} hasStudents={rows.length > 0} />
          </div>
        </div>
      ) : null}

      {tab === 'year' ? (
        <div className="grid gap-4">
          <ChartCard title="التحصيل شهراً بشهر">
            <BarChartBox data={yearly} x="name" y="paid" />
          </ChartCard>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Info label="إجمالي التحصيل السنوي" value={formatILS(yearTotals.paid)} />
            <Info label="أعلى شهر" value={best ? `${best.name} (${formatILS(best.paid)})` : '—'} />
            <Info label="أدنى شهر" value={worst ? `${worst.name} (${formatILS(worst.paid)})` : '—'} />
          </div>
        </div>
      ) : null}

      {tab === 'day' ? (
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-extrabold">مدفوعات اليوم</h3>
          {daily.length === 0 ? (
            <p className="text-sm text-slate-500">لا توجد مدفوعات مسجّلة اليوم.</p>
          ) : (
            daily.map(({ student, payment }) => (
              <div key={payment.id} className="flex justify-between border-b border-slate-100 py-2 text-sm">
                <span>{student?.fullName || 'طالب محذوف'}</span>
                <span>{formatILS(payment.amountPaid)}</span>
              </div>
            ))
          )}
          <p className="mt-3 font-extrabold">
            مجموع اليوم: {formatILS(daily.reduce((s, r) => s + (Number(r.payment.amountPaid) || 0), 0))}
          </p>
        </div>
      ) : null}

      <div className="print-only">
        <PrintLayout kindergartenName={kindergartenName} title={title}>
          {tab === 'year' ? (
            <table className="print-table">
              <thead>
                <tr>
                  <th>الشهر</th>
                  <th>المحصّل</th>
                  <th>المطلوب</th>
                  <th>العجز</th>
                  <th>النسبة</th>
                </tr>
              </thead>
              <tbody>
                {yearly.map((r) => (
                  <tr key={r.month}>
                    <td>{r.name}</td>
                    <td>{formatILS(r.paid)}</td>
                    <td>{formatILS(r.due)}</td>
                    <td>{formatILS(r.deficit)}</td>
                    <td>{r.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="print-table">
              <thead>
                <tr>
                  <th>الطالب</th>
                  <th>ولي الأمر</th>
                  <th>الجوال</th>
                  <th>المطلوب</th>
                  <th>المدفوع</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {(tab === 'unpaid' ? stats.unpaid : rows).map(({ student, payment }) => (
                  <tr key={student.id}>
                    <td>{student.fullName}</td>
                    <td>{student.guardianName}</td>
                    <td>{student.phone1}</td>
                    <td>{formatILS(payment.amountDue)}</td>
                    <td>{formatILS(payment.amountPaid)}</td>
                    <td>{STATUS_LABELS[payment.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </PrintLayout>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-extrabold">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <h3 className="mb-3 font-extrabold">{title}</h3>
      <div className="h-64" dir="ltr">
        {children}
      </div>
    </div>
  );
}

function BarChartBox({ data, x, y }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={x} />
        <YAxis tickFormatter={(v) => Number(v).toLocaleString('en-US')} />
        <Tooltip formatter={(v) => Number(v).toLocaleString('en-US')} />
        <Bar dataKey={y} fill="#2563eb" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
