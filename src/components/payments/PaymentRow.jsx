import { formatILS } from '../../utils/currency';
import { PaymentBadge } from './PaymentBadge';

export function PaymentRow({ student, payment, onPay }) {
  const remaining = Math.max((Number(payment.amountDue) || 0) - (Number(payment.amountPaid) || 0), 0);

  return (
    <button
      onClick={() => onPay({ student, payment })}
      className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white p-4 text-right shadow-sm"
    >
      <div>
        <p className="font-extrabold">{student.fullName}</p>
        <p className="mt-1 text-xs text-slate-500">
          المطلوب {formatILS(payment.amountDue)} · المدفوع {formatILS(payment.amountPaid)}
          {payment.status === 'partial' ? ` · المتبقي ${formatILS(remaining)}` : ''}
        </p>
      </div>
      <PaymentBadge status={payment.status} />
    </button>
  );
}
