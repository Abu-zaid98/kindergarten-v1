import { formatDate } from '../../utils/dates';

export function PrintLayout({ kindergartenName, title, children }) {
  return (
    <div className="print-root">
      <div className="print-header">
        <div>
          <h1 className="text-xl font-extrabold">{kindergartenName || 'الروضة'}</h1>
          <p className="text-sm text-slate-600">{title}</p>
        </div>
        <p className="text-sm">{formatDate(new Date().toISOString())}</p>
      </div>
      {children}
      <div className="print-footer">
        <span>سري — للاستخدام الداخلي</span>
        <span>نظام إدارة الدفع الشهري</span>
      </div>
    </div>
  );
}
