import { SearchBar } from '../ui/SearchBar';
import { StudentCard } from './StudentCard';
import { Select } from '../ui/Input';
import { formatILS } from '../../utils/currency';
import { ARABIC_MONTHS } from '../../utils/dates';

function normalizeSearch(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .replace(/[\u0640\u200c]/g, '');
}

export function StudentList({ students, classrooms = [], classroomId, onClassroomChange, query, onQuery, onOpen, onEdit, view = 'cards', payments = [], months = [], year }) {
  const filtered = students.filter((s) => {
    if (classroomId && s.classroomId !== classroomId) return false;
    const rawQuery = normalizeSearch(query);
    if (!rawQuery) return true;

    const fields = [
      s.fullName,
      s.guardianName,
      s.guardianRelation,
      s.phone1,
      s.phone2,
      s.classroom,
      s.notes,
    ].map(normalizeSearch);

    const tokens = rawQuery.split(' ').filter(Boolean);

    return fields.some((value) => {
      if (!value) return false;
      if (value.includes(rawQuery)) return true;
      return tokens.every((token) => value.includes(token));
    });
  });

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-[1fr_220px]">
        <SearchBar value={query} onChange={onQuery} placeholder="بحث بالاسم أو ولي الأمر" />
        <Select value={classroomId || ''} onChange={(e) => onClassroomChange?.(e.target.value)} aria-label="تصفية حسب الفصل">
          <option value="">جميع الفصول</option>
          {classrooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
        </Select>
      </div>
      <div className="mt-4 grid gap-3">
        {filtered.length === 0 ? (
          <p className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500">لا يوجد طلاب مطابقون.</p>
        ) : view === 'table' ? (
          <StudentPaymentTable students={filtered} payments={payments} months={months} year={year} onOpen={onOpen} />
        ) : (
          filtered.map((student) => (
            <StudentCard key={student.id} student={student} onOpen={onOpen} onEdit={onEdit} />
          ))
        )}
      </div>
    </div>
  );
}

function StudentPaymentTable({ students, payments, months, year, onOpen }) {
  const byStudentMonth = new Map(payments.map((payment) => [`${payment.studentId}-${payment.month}`, payment]));
  return <div className="overflow-x-auto rounded-3xl bg-white shadow-sm"><table className="min-w-max w-full text-sm"><thead className="border-b border-slate-100 bg-slate-50 text-slate-600"><tr><th className="sticky right-0 z-10 min-w-44 bg-slate-50 p-3 text-right">الطالب</th><th className="min-w-28 p-3 text-right">الفصل</th>{months.map((month) => <th key={month} className="min-w-32 p-3 text-center">{ARABIC_MONTHS[month - 1]}<span className="mr-1 text-xs font-normal">{year}</span></th>)}</tr></thead><tbody>{students.map((student) => <tr key={student.id} className="border-b border-slate-100 last:border-0"><td className="sticky right-0 z-10 bg-white p-3"><button type="button" onClick={() => onOpen(student)} className="text-right font-extrabold text-blue-700 hover:underline">{student.fullName}</button><p className="mt-1 text-xs font-normal text-slate-400">{formatILS(student.monthlyFee)} شهريًا</p></td><td className="p-3 text-slate-500">{student.classroom || '—'}</td>{months.map((month) => { const payment = byStudentMonth.get(`${student.id}-${month}`); const due = Number(payment?.amountDue ?? student.monthlyFee) || 0; const paid = Number(payment?.amountPaid) || 0; const status = payment?.status || 'unpaid'; const style = status === 'paid' ? 'bg-emerald-50 text-emerald-700' : status === 'partial' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'; return <td key={month} className="p-2 text-center"><div className={`rounded-xl px-2 py-2 font-bold ${style}`}><p>{formatILS(paid)}</p><p className="mt-0.5 text-[11px] font-medium opacity-75">من {formatILS(due)}</p></div></td>; })}</tr>)}</tbody></table></div>;
}
