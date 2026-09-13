const styles = {
  paid: 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900',
  partial: 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900',
  unpaid: 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900',
};

const labels = {
  paid: 'تم الدفع',
  partial: 'دفع جزئي',
  unpaid: 'لم يدفع',
};

export function PaymentBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${styles[status] || styles.unpaid}`}>
      {labels[status] || labels.unpaid}
    </span>
  );
}
