import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export function Modal({ open, title, onClose, children, wide = false, layer = 'z-50' }) {
  if (!open) return null;
  return createPortal(
    (
      <div className={`fixed inset-0 ${layer} flex items-center justify-center overflow-hidden bg-slate-900/40 p-1 sm:p-2`}>
        <button className="absolute inset-0" aria-label="إغلاق" onClick={onClose} />
        <div
          className={`relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full min-h-0 flex-col overflow-hidden rounded-[28px] bg-white p-6 shadow-xl sm:max-h-[calc(100dvh-2rem)] sm:p-4 ${wide ? 'max-w-3xl' : 'max-w-lg'}`}
        >
          <div className="mb-6 flex shrink-0 items-center justify-between">
            <h2 className="text-lg font-extrabold">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
        </div>
      </div>
    ),
    document.body,
  );
}
