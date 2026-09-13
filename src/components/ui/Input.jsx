export function Input({ label, error, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      {label ? <span className="mb-1.5 block text-sm font-bold text-slate-600">{label}</span> : null}
      <input
        className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function Select({ label, children, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      {label ? <span className="mb-1.5 block text-sm font-bold text-slate-600">{label}</span> : null}
      <select
        className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Textarea({ label, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      {label ? <span className="mb-1.5 block text-sm font-bold text-slate-600">{label}</span> : null}
      <textarea
        className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        rows={3}
        {...props}
      />
    </label>
  );
}
