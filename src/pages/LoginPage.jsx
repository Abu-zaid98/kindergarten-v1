import { useState } from 'react';
import { MessageCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../store/appStore';
import { Button } from '../components/ui/Button';
import { PinPad } from '../components/ui/PinPad';
import { pinError } from '../utils/password';

export function LoginPage() {
  const { ready, needsSetup, login, setupPassword, resetPassword } = useAuth();
  const { theme, toggleTheme } = useAppStore();
  const isDark = theme === 'dark';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [setupStep, setSetupStep] = useState('create');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSetup() {
    const err = pinError(password);
    if (err) return setError(err);
    if (setupStep === 'create') {
      setSetupStep('confirm');
      setConfirm('');
      setError('');
      return;
    }
    if (password !== confirm) return setError('كلمتا المرور غير متطابقتين. أعد الإدخال.');
    setBusy(true);
    await setupPassword(password);
    setBusy(false);
  }

  async function handleLogin() {
    if (!password) return setError('أدخل كلمة المرور من لوحة الأرقام.');
    setBusy(true);
    const ok = await login(password, remember);
    setBusy(false);
    if (!ok) {
      setError('كلمة المرور غير صحيحة.');
      setPassword('');
    }
  }

  async function handleReset() {
    const err = pinError(newPassword);
    if (err) return setError(err);
    setBusy(true);
    await resetPassword(newPassword);
    setBusy(false);
  }

  if (!ready) {
    return (
      <div className="fixed inset-0 z-[200] overflow-hidden bg-[radial-gradient(circle_at_top,_#f7fffd_0%,_#edf9f4_30%,_#eaf1ff_100%)] px-4 py-4 dark:bg-[radial-gradient(circle_at_top,_#1a1d2d_0%,_#252a40_32%,_#2d3550_100%)]">
        <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(13,148,136,0.20)_0%,_rgba(13,148,136,0.06)_32%,_transparent_70%)]" />

        <div className="relative mx-auto flex h-full w-full max-w-[480px] flex-col justify-between">
          <header className="w-full rounded-[22px] border border-white/80 bg-white/70 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-600/60 dark:bg-slate-800/70">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 text-[11px] font-black tracking-[0.08em] text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-600/80 dark:bg-slate-700/80 dark:text-slate-100"
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
                <span>{isDark ? 'فاتح' : 'داكن'}</span>
              </button>

              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <p className="text-[8px] font-black tracking-[0.28em] text-slate-500 dark:text-slate-300">DESIGNED BY</p>
                <p className="text-[12px] font-black text-slate-800 dark:text-slate-100">م. محمد الجوجو</p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f766e] via-[#14532d] to-[#1d4ed8] p-2.5 shadow-[0_12px_24px_rgba(13,148,136,0.2)]">
                <img src="/icons/icon.svg" alt="شعار النظام" className="h-full w-full object-contain" />
              </div>
            </div>
          </header>

          <main className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative mb-6 flex h-28 w-28 items-center justify-center rounded-[32px] bg-gradient-to-br from-[#0f766e] via-[#14532d] to-[#1d4ed8] p-4 shadow-[0_22px_56px_rgba(13,148,136,0.28)] ring-6 ring-white/80 dark:ring-slate-700">
                <img src="/icons/icon.svg" alt="شعار النظام" className="h-full w-full object-contain" />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-[8px] font-black tracking-[0.28em] text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-200">
                  SAFE
                </span>
              </div>

              <div className="mb-3 flex items-center gap-2 text-[9px] font-black tracking-[0.28em] text-slate-500 dark:text-slate-300">
                <span className="h-px w-8 bg-slate-300 dark:bg-slate-600" />
                KINDERGARTEN
                <span className="h-px w-8 bg-slate-300 dark:bg-slate-600" />
              </div>

              <h1 className="text-[2.2rem] font-black leading-none tracking-[-0.04em] text-slate-900 dark:text-white">نظام الروضة</h1>
              <p className="mt-3 text-[13px] font-medium text-slate-500 dark:text-slate-300">جارٍ تجهيز النظام...</p>

              <div className="mt-8 flex items-center gap-2">
                <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
                <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500 [animation-delay:150ms]" />
                <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500 [animation-delay:300ms]" />
              </div>
            </div>
          </main>

          <footer className="w-full rounded-[22px] border border-white/80 bg-white/70 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-600/60 dark:bg-slate-800/70">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col items-start">
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">تطوير وإدارة</p>
                <p className="text-[13px] font-black text-slate-900 dark:text-white">م. محمد الجوجو</p>
              </div>

              <a
                href="https://wa.me/972592133357"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-[11px] font-extrabold text-emerald-700 shadow-md transition hover:bg-emerald-100 hover:scale-105 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
              >
                <MessageCircle size={16} />
                تواصل عبر واتساب
              </a>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top,_#f7fffd_0%,_#edf9f4_30%,_#eaf1ff_100%)] dark:bg-[radial-gradient(circle_at_top,_#1a1d2d_0%,_#252a40_32%,_#2d3550_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col justify-between px-4 py-4">
         <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 text-[11px] font-black tracking-[0.08em] text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-600/80 dark:bg-slate-700/80 dark:text-slate-100"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              <span>{isDark ? 'فاتح' : 'داكن'}</span>
            </button>
            </div>

        <main className="flex flex-1 flex-col justify-center px-0">
          <section className="flex flex-col items-center justify-center px-3 text-center">
            <div className="relative mb-3 flex h-24 w-24 items-center justify-center rounded-[36px] bg-gradient-to-br from-[#0f766e] via-[#14532d] to-[#1d4ed8] p-5 shadow-[0_22px_56px_rgba(13,148,136,0.28)] ring-6 ring-white/80 dark:ring-slate-700">
              <img src="/icons/icon.svg" alt="شعار النظام" className="h-full w-full object-contain" />
            
            </div>

            <div className="mb-3 flex items-center gap-2 text-[9px] font-black tracking-[0.28em] text-slate-500 dark:text-slate-300">
              <span className="h-px w-8 bg-slate-300 dark:bg-slate-600" />
              KINDERGARTEN
              <span className="h-px w-8 bg-slate-300 dark:bg-slate-600" />
            </div>

            <h4 className="text-lg font-black leading-none tracking-[-0.04em] text-slate-900 dark:text-white">نظام الروضة</h4>
            <p className="mt-2 text-[13px] font-medium text-slate-500 dark:text-slate-300">
              {needsSetup
                ? setupStep === 'create'
                  ? 'أنشئ كلمة مرور آمنة.'
                  : 'أعد إدخال كلمة المرور.'
                : 'أدخل كلمة المرور للمتابعة.'}
            </p>

            {error ? (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 dark:bg-red-950/20">
                <p className="text-[12px] font-bold text-red-600 dark:text-red-200">{error}</p>
              </div>
            ) : null}
          </section>

          <section className="mt-3 rounded-[32px] border border-slate-200/80 bg-white/90 px-4 pb-4 pt-5 shadow-[0_-8px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm dark:border-slate-600/60 dark:bg-slate-800/85">
            {needsSetup ? (
              <div className="grid gap-3">
                <PinPad
                  label={setupStep === 'create' ? 'كلمة المرور الجديدة' : 'تأكيد كلمة المرور'}
                  value={setupStep === 'create' ? password : confirm}
                  onChange={(v) => {
                    setError('');
                    if (setupStep === 'create') setPassword(v);
                    else setConfirm(v);
                  }}
                />

                <Button className="w-full text-[14px] py-3" disabled={busy} onClick={handleSetup}>
                  {setupStep === 'create' ? 'التالي' : 'ابدأ الآن'}
                </Button>

                {setupStep === 'confirm' ? (
                  <Button
                    variant="ghost"
                    className="text-[13px]"
                    onClick={() => {
                      setSetupStep('create');
                      setConfirm('');
                      setError('');
                    }}
                  >
                    رجوع
                  </Button>
                ) : null}
              </div>
            ) : resetOpen ? (
              <div className="grid gap-3">
                <div className="rounded-2xl bg-amber-50 p-3 text-[12px] font-medium leading-5 text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
                  إعادة التعيين لا تحذف بيانات الطلاب أو المدفوعات.
                </div>

                {!resetConfirm ? (
                  <Button type="button" variant="danger" className="text-[14px] py-3" onClick={() => setResetConfirm(true)}>
                    إعادة التعيين
                  </Button>
                ) : (
                  <>
                    <PinPad
                      label="كلمة المرور الجديدة"
                      value={newPassword}
                      onChange={(v) => {
                        setError('');
                        setNewPassword(v);
                      }}
                    />
                    <Button disabled={busy} className="text-[14px] py-3" onClick={handleReset}>حفظ كلمة المرور</Button>
                  </>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  className="text-[13px]"
                  onClick={() => {
                    setResetOpen(false);
                    setResetConfirm(false);
                    setNewPassword('');
                    setError('');
                  }}
                >
                  رجوع
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                <PinPad
                  label="كلمة المرور"
                  value={password}
                  onChange={(v) => {
                    setError('');
                    setPassword(v);
                  }}
                />

                <label className="flex items-center justify-center gap-2 text-[12px] font-medium text-slate-600 dark:text-slate-300">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4" />
                  تذكرني 
                </label>

                <Button className="w-full text-[14px] py-3" disabled={busy} onClick={handleLogin}>دخول</Button>

                <button
                  type="button"
                  className="text-[12px] font-bold text-slate-500 transition hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                  onClick={() => {
                    setResetOpen(true);
                    setError('');
                  }}
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
            )}
          </section>
        </main>

        <footer className="w-full rounded-[22px] border border-white/80 bg-white/70 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-600/60 dark:bg-slate-800/70">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col items-start">
              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">تطوير وإدارة</p>
              <p className="text-[13px] font-black text-slate-900 dark:text-white">م. محمد الجوجو</p>
            </div>

            <a
              href="https://wa.me/972592133357"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-[11px] font-extrabold text-emerald-700 shadow-md transition hover:bg-emerald-100 hover:scale-105 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
            >
              <MessageCircle size={16} />
              تواصل عبر واتساب
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
