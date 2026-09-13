import { useEffect, useState } from 'react';
import { LogOut, Menu, Moon, Palette, Sun } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAppStore } from '../../store/appStore';
import { ARABIC_WEEKDAYS, formatDate } from '../../utils/dates';
import { ConfirmModal } from '../ui/ConfirmModal';

function DateChip() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-w-0 text-center leading-tight">
      <p className="text-[11px] font-extrabold tracking-wide text-blue-600 dark:text-blue-300">{ARABIC_WEEKDAYS[now.getDay()]}</p>
      <p className="text-[10px] font-bold text-slate-500 dark:text-neutral-400">{formatDate(now)}</p>
    </div>
  );
}

export function Navbar({ title, links }) {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const { logout } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dark = theme === 'dark';

  async function handleLogout() {
    await logout();
    setLogoutOpen(false);
    setMenuOpen(false);
  }

  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-neutral-800 dark:bg-[#0d0d0f]/85">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold tracking-[0.08em] text-blue-600 dark:text-blue-300">نظام الدفع الشهري</p>
            <h1 className="truncate text-lg font-extrabold text-slate-900 dark:text-white">{title}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <DateChip />

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-neutral-700 dark:bg-[#111111] dark:text-neutral-100 dark:hover:bg-neutral-800"
                aria-label="قائمة الإعدادات السريعة"
                title="قائمة الإعدادات"
              >
                <Menu size={18} />
              </button>

              {menuOpen ? (
                <div className="absolute left-0 top-12 z-40 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-[#111111]">
                  <button
                    type="button"
                    onClick={() => { toggleTheme(); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-right text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:text-neutral-100 dark:hover:bg-neutral-800"
                  >
                    {dark ? <Sun size={16} /> : <Moon size={16} />}
                    {dark ? 'الوضع الفاتح' : 'الوضع الداكن'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLogoutOpen(true); setMenuOpen(false); }}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-right text-sm font-bold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    <LogOut size={16} />
                    تسجيل الخروج
                  </button>
                </div>
              ) : null}
            </div>

            <nav className="hidden items-center gap-1 sm:flex">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2 text-sm font-bold transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100 dark:bg-blue-950/70 dark:text-blue-200 dark:ring-blue-900/80'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <ConfirmModal
        open={logoutOpen}
        title="تأكيد تسجيل الخروج"
        message="هل أنت متأكد من تسجيل الخروج؟ ستحتاج إلى إدخال كلمة المرور مرة أخرى عند العودة."
        confirmLabel="تسجيل الخروج"
        cancelLabel="إلغاء"
        danger
        onConfirm={handleLogout}
        onClose={() => setLogoutOpen(false)}
      />
    </>
  );
}
