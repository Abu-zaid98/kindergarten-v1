import { Download, Printer } from 'lucide-react';
import { Button } from '../ui/Button';

export function ExportToolbar({ onExcelExport, onPrint, reportTitle }) {
  return (
    <div className="no-print mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-bold text-slate-600">{reportTitle}</p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onExcelExport}>
          <Download size={16} />
          تصدير Excel
        </Button>
        <Button variant="secondary" onClick={onPrint}>
          <Printer size={16} />
          طباعة
        </Button>
      </div>
    </div>
  );
}
