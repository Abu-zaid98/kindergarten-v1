import { useState } from 'react';
import { AlertTriangle, Banknote, CheckCircle2, Users, Wallet, XCircle } from 'lucide-react';
import { useMonthPayments } from '../hooks/usePayments';
import { useAppStore } from '../store/appStore';
import { summarizeRows } from '../db/payments';
import { formatILS } from '../utils/currency';
import { monthName } from '../utils/dates';
import { StatsCard } from '../components/dashboard/StatsCard';
import { UnpaidList } from '../components/dashboard/UnpaidList';
import { PeriodFilter } from '../components/ui/PeriodFilter';

export function DashboardPage() {
  const month = Number(useAppStore((s) => s.selectedMonth));
  const year = Number(useAppStore((s) => s.selectedYear));
  const rows = useMonthPayments(year, month);
  const stats = summarizeRows(rows);
  const [unpaidOnly, setUnpaidOnly] = useState(true);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold">لوحة التحكم</h2>
          <p className="text-sm text-slate-500">{monthName(month)} {year}</p>
        </div>
        <PeriodFilter withSearch />
      </div>

      <div key={`${year}-${month}`} className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatsCard icon={Wallet} title="إجمالي المحصّل" value={formatILS(stats.paid)} tone="green" />
        <StatsCard icon={Users} title="إجمالي الطلاب" value={stats.totalStudents} />
        <StatsCard icon={Banknote} title="المبلغ المطلوب" value={formatILS(stats.due)} />
        <StatsCard icon={AlertTriangle} title="العجز" value={formatILS(stats.deficit)} tone="red" />
        <StatsCard icon={CheckCircle2} title="دفعوا" value={stats.paidCount} tone="green" />
        <StatsCard icon={XCircle} title="لم يدفعوا" value={stats.unpaidCount} tone="amber" />
      </div>

      <div className="mt-6 rounded-3xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-extrabold">غير المدفوعين</h3>
          <label className="text-sm text-slate-500">
            <input type="checkbox" className="ml-2" checked={unpaidOnly} onChange={(e) => setUnpaidOnly(e.target.checked)} />
            عرض غير المدفوعين فقط
          </label>
        </div>
        <UnpaidList rows={unpaidOnly ? stats.unpaid : rows} hasStudents={rows.length > 0} />
      </div>
    </div>
  );
}
