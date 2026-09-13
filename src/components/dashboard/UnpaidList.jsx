import { formatILS } from '../../utils/currency';

export function UnpaidList({ rows, hasStudents = true }) {
  if (!rows.length) {
    return (
      <p className={`text-sm ${hasStudents ? 'text-emerald-700' : 'text-slate-500'}`}>
        {hasStudents ? 'جميع الطلاب دفعوا لهذا الشهر.' : 'لا يوجد طلاب بعد. أضف طالباً من صفحة الطلاب.'}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {rows.map(({ student, payment }) => {
        const remaining = Math.max((Number(payment.amountDue) || 0) - (Number(payment.amountPaid) || 0), 0);
        const isPartial = payment.status === 'partial';

        return (
          <li key={student.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="font-bold">{student.fullName}</p>
              <p className="text-xs text-slate-500">{student.guardianName} · {student.phone1}</p>
              {isPartial ? (
                <p className="mt-1 text-[11px] font-bold text-amber-700">دفع جزئي — المتبقي: {formatILS(remaining)}</p>
              ) : null}
            </div>
            <div className="text-left">
              <span className="block text-sm font-extrabold text-red-600">{formatILS(remaining)}</span>
              {isPartial ? (
                <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  جزئي
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
