export function StatsCard({ icon: Icon, title, value, hint, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/60',
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60',
    red: 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/60',
    amber: 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-neutral-900 dark:text-neutral-200 dark:border-neutral-700',
  };
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-neutral-800 dark:bg-[#111111]">
      <div className={`mb-3 inline-flex rounded-2xl p-2 ${tones[tone]}`}>
        {Icon ? <Icon size={18} /> : null}
      </div>
      <p className="text-sm text-slate-500 dark:text-neutral-400">{title}</p>
      <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400 dark:text-neutral-500">{hint}</p> : null}
    </div>
  );
}
