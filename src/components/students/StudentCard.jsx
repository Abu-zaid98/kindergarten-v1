import { Phone, User } from 'lucide-react';
import { formatILS } from '../../utils/currency';

export function StudentCard({ student, onOpen, onEdit }) {
  return (
    <div className="w-full rounded-3xl bg-white p-4 text-right shadow-sm">
      <button type="button" onClick={() => onOpen(student)} className="flex w-full items-start justify-between gap-3">
        <div>
          <p className="text-base font-extrabold">{student.fullName}</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <User size={14} />
            {student.guardianName}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <Phone size={14} />
            {student.phone1}
          </p>
        </div>
        <div className="text-left">
          <p className="text-sm font-extrabold text-blue-700">{formatILS(student.monthlyFee)}</p>
          <p className={`mt-1 text-xs font-bold ${student.isActive === false ? 'text-slate-400' : 'text-emerald-600'}`}>
            {student.isActive === false ? 'غير نشط' : 'نشط'}
          </p>
          {student.classroom ? <p className="mt-1 text-xs text-slate-400">{student.classroom}</p> : null}
        </div>
      </button>
      <button type="button" className="mt-3 text-xs font-bold text-blue-600" onClick={() => onEdit(student)}>
        تعديل
      </button>
    </div>
  );
}
