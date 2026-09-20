import { NavLink } from 'react-router-dom';

export function BottomNav({ links }) {
  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/90 px-2 py-2 shadow-[0_-8px_25px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:hidden dark:border-neutral-800 dark:bg-[#0d0d0f]/90">
      <div className="mx-auto grid max-w-xl grid-cols-7 gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[11px] font-bold transition ${isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300' : 'text-slate-400 hover:bg-slate-100 dark:text-neutral-500 dark:hover:bg-neutral-900'}`
              }
            >
              <Icon size={18} />
              <span className="leading-none">{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
