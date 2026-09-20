import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, CreditCard, Home, Settings, Users, School, BriefcaseBusiness } from 'lucide-react';
import { useSettings } from '../../hooks/useAuth';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';

const links = [
  { to: '/', label: 'الرئيسية', icon: Home },
  { to: '/students', label: 'الطلاب', icon: Users },
  { to: '/classrooms', label: 'الفصول', icon: School },
  { to: '/staff', label: 'الكادر', icon: BriefcaseBusiness },
  { to: '/payments', label: 'المدفوعات', icon: CreditCard },
  { to: '/reports', label: 'التقارير', icon: BarChart3 },
  { to: '/settings', label: 'الإعدادات', icon: Settings },
];

export function AppShell() {
  const settings = useSettings();
  const location = useLocation();
  return (
    <div className="min-h-screen">
      <Navbar title={settings?.kindergartenName || 'نظام دفع الروضة'} links={links} />
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-4 sm:pb-10">
        <div key={location.pathname} className="page-enter-inner">
          <Outlet />
        </div>
      </main>
      <BottomNav links={links} />
    </div>
  );
}

export function AppLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 text-[11px] font-bold transition ${isActive ? 'text-blue-600 dark:text-blue-300' : 'text-slate-400 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-neutral-200'}`
      }
    >
      {children}
    </NavLink>
  );
}
