import { X } from 'lucide-react';

export function Modal({ open, title, onClose, children, wide = false, layer = 'z-50' }) {
  if (!open) return null;
  return (
    <div className={`fixed inset-0 ${layer} flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4`}>
      <button className="absolute inset-0" aria-label="إغلاق" onClick={onClose} />
      <div
        className={`relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl ${wide ? 'max-w-3xl' : 'max-w-lg'}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
