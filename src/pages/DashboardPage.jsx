import { useState } from 'react';
import { AlertTriangle, Banknote, CheckCircle2, Users, Wallet, XCircle, School } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEnrollmentRows, useMonthPayments } from '../hooks/usePayments';
import { useAppStore } from '../store/appStore';
import { summarizeRows } from '../db/payments';
import { formatILS } from '../utils/currency';
import { monthName } from '../utils/dates';
import { StatsCard } from '../components/dashboard/StatsCard';
import { UnpaidList } from '../components/dashboard/UnpaidList';
import { PeriodFilter } from '../components/ui/PeriodFilter';
import { useClassrooms } from '../hooks/useClassrooms';
import { useStudents } from '../hooks/useStudents';

export function DashboardPage() {
  const month = Number(useAppStore((s) => s.selectedMonth));
  const year = Number(useAppStore((s) => s.selectedYear));
  const rows = useMonthPayments(year, month);
  const enrollmentRows = useEnrollmentRows();
  const { classrooms } = useClassrooms();
  const { students } = useStudents();
  const navigate = useNavigate();
  const stats = summarizeRows(rows);
  const enrollmentStats = summarizeRows(enrollmentRows);
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
        <StatsCard icon={Banknote} title="رسوم التسجيل المحصّلة" value={formatILS(enrollmentStats.paid)} tone="green" />
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between"><div><h3 className="font-extrabold">الفصول</h3><p className="text-sm text-slate-500">اضغط على الفصل لعرض طلابه وسجلاتهم</p></div><button onClick={() => navigate('/classrooms')} className="text-sm font-bold text-blue-600">إدارة الفصول</button></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((room) => { const count = students.filter((student) => student.classroomId === room.id && student.isActive !== false).length; return <button key={room.id} type="button" onClick={() => navigate(`/students?classroom=${room.id}`)} className="rounded-3xl bg-white p-4 text-right shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between"><span className="rounded-2xl bg-blue-50 p-2 text-blue-600"><School size={20} /></span><span className="rounded-xl bg-emerald-50 px-2.5 py-1 text-sm font-extrabold text-emerald-700">{count} طالب</span></div><p className="mt-4 text-lg font-extrabold">{room.name}</p><p className="mt-1 text-sm text-slate-500">عرض وإدارة طلاب الفصل</p></button>; })}
          {classrooms.length === 0 && <button type="button" onClick={() => navigate('/classrooms')} className="rounded-3xl border border-dashed border-blue-200 bg-blue-50/50 p-5 text-right text-sm font-bold text-blue-700">أضف أول فصل لعرض بطاقاته هنا</button>}
        </div>
      </section>

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
