export function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  const styles = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm shadow-blue-500/20 hover:from-blue-500 hover:to-blue-600',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm dark:bg-[#111111] dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-sm shadow-red-500/20 hover:from-red-500 hover:to-red-600',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 border border-transparent dark:text-neutral-300 dark:hover:bg-neutral-900',
    success: 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-sm shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-600',
  };
  return (
    <button
      type={type}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
