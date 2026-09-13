import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { PinPad } from '../components/ui/PinPad';
import { pinError } from '../utils/password';

export function LoginPage() {
  const { ready, needsSetup, login, setupPassword, resetPassword } = useAuth();
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
      <div className="fixed inset-0 z-[200] overflow-hidden bg-[radial-gradient(circle_at_top,_#f7fffd_0%,_#edf9f4_30%,_#eaf1ff_100%)] px-4 py-4 dark:bg-[radial-gradient(circle_at_top,_#071c1a_0%,_#081d2d_32%,_#0f172a_100%)]">
        <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(13,148,136,0.20)_0%,_rgba(13,148,136,0.06)_32%,_transparent_70%)]" />

        <div className="relative mx-auto flex h-full w-full max-w-[430px] flex-col justify-between">
          <header className="w-full rounded-[22px] border border-white/80 bg-white/70 px-3 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/70">
            <div className="flex items-center justify-between gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#0f766e] via-[#14532d] to-[#1d4ed8] p-1.5 shadow-[0_12px_24px_rgba(13,148,136,0.2)]">
                <img src="/icons/icon.svg" alt="شعار النظام" className="h-full w-full object-contain" />
              </div>

              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <p className="text-[7px] font-black tracking-[0.28em] text-slate-500 dark:text-slate-300">DESIGNED BY</p>
                <p className="text-[10.5px] font-black text-slate-800 dark:text-slate-100">م. محمد الجوجو</p>
              </div>

              <a
                href="https://wa.me/972592133357"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[8px] font-extrabold text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
              >
                <span className="text-[10px]">💬</span>
                واتساب
              </a>
            </div>
          </header>

          <main className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-[30px] bg-gradient-to-br from-[#0f766e] via-[#14532d] to-[#1d4ed8] p-3 shadow-[0_22px_56px_rgba(13,148,136,0.28)] ring-6 ring-white/80 dark:ring-slate-800">
                <img src="/icons/icon.svg" alt="شعار النظام" className="h-full w-full object-contain" />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-emerald-100 bg-white px-2 py-0.5 text-[7px] font-black tracking-[0.28em] text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-200">
                  SAFE
                </span>
              </div>

              <div className="mb-2 flex items-center gap-2 text-[8px] font-black tracking-[0.28em] text-slate-500 dark:text-slate-300">
                <span className="h-px w-6 bg-slate-300 dark:bg-slate-600" />
                KINDERGARTEN
                <span className="h-px w-6 bg-slate-300 dark:bg-slate-600" />
              </div>

              <h1 className="text-[1.9rem] font-black leading-none tracking-[-0.04em] text-slate-900 dark:text-white">نظام الروضة</h1>
              <p className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-300">جارٍ تجهيز النظام...</p>

              <div className="mt-6 flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 [animation-delay:150ms]" />
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 [animation-delay:300ms]" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top,_#f7fffd_0%,_#edf9f4_30%,_#eaf1ff_100%)] dark:bg-[radial-gradient(circle_at_top,_#071c1a_0%,_#081d2d_32%,_#0f172a_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col justify-start pt-4">
        <header className="px-3 pb-2">
          <div className="mx-auto flex w-full max-w-[360px] items-center justify-between gap-3 rounded-[24px] border border-white/80 bg-white/80 px-3 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/75">
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#0f766e] via-[#14532d] to-[#1d4ed8] p-1.5 shadow-[0_12px_24px_rgba(13,148,136,0.2)]">
              <img src="/icons/icon.svg" alt="شعار النظام" className="h-full w-full object-contain" />
            </div>

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-[7px] font-black tracking-[0.28em] text-slate-500 dark:text-slate-300">DESIGNED BY</p>
              <p className="text-[11px] font-black text-slate-800 dark:text-slate-100">م. محمد الجوجو</p>
            </div>

            <a
              href="https://wa.me/972592133357"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[8px] font-extrabold text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
            >
              <MessageCircle size={11} />
              واتساب
            </a>
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-center px-0 pb-2 pt-2">
          <section className="flex flex-col items-center justify-center px-3 text-center">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#0f766e] via-[#14532d] to-[#1d4ed8] p-2 shadow-[0_18px_40px_rgba(13,148,136,0.25)] ring-4 ring-white/80 dark:ring-slate-800">
              <img src="/icons/icon.svg" alt="شعار النظام" className="h-full w-full object-contain" />
            </div>

            <span className="mb-1 inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[7px] font-black tracking-[0.28em] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
              KINDERGARTEN
            </span>

            <h1 className="text-[1.5rem] font-black leading-tight text-slate-900 dark:text-white">نظام الروضة</h1>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-300">
              {needsSetup
                ? setupStep === 'create'
                  ? 'أنشئ كلمة مرور آمنة.'
                  : 'أعد إدخال كلمة المرور.'
                : 'أدخل كلمة المرور للمتابعة.'}
            </p>
          </section>

          <section className="mt-3 rounded-t-[30px] border border-slate-200/80 bg-white/90 px-3 pb-3 pt-4 shadow-[0_-8px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/85">
            {needsSetup ? (
              <div className="grid gap-2.5">
                <PinPad
                  label={setupStep === 'create' ? 'كلمة المرور الجديدة' : 'تأكيد كلمة المرور'}
                  value={setupStep === 'create' ? password : confirm}
                  onChange={(v) => {
                    setError('');
                    if (setupStep === 'create') setPassword(v);
                    else setConfirm(v);
                  }}
                />

                {error ? <p className="text-center text-[10px] font-bold text-red-600">{error}</p> : null}

                <Button className="w-full" disabled={busy} onClick={handleSetup}>
                  {setupStep === 'create' ? 'التالي' : 'ابدأ الآن'}
                </Button>

                {setupStep === 'confirm' ? (
                  <Button
                    variant="ghost"
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
              <div className="grid gap-2.5">
                <div className="rounded-2xl bg-amber-50 p-2 text-[10px] font-medium leading-5 text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
                  إعادة التعيين لا تحذف بيانات الطلاب أو المدفوعات.
                </div>

                {!resetConfirm ? (
                  <Button type="button" variant="danger" onClick={() => setResetConfirm(true)}>
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
                    {error ? <p className="text-center text-[10px] font-bold text-red-600">{error}</p> : null}
                    <Button disabled={busy} onClick={handleReset}>حفظ كلمة المرور</Button>
                  </>
                )}

                <Button
                  type="button"
                  variant="ghost"
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
              <div className="grid gap-2.5">
                <PinPad
                  label="كلمة المرور"
                  value={password}
                  onChange={(v) => {
                    setError('');
                    setPassword(v);
                  }}
                />

                <label className="flex items-center justify-center gap-2 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  تذكرني 7 أيام
                </label>

                {error ? <p className="text-center text-[10px] font-bold text-red-600">{error}</p> : null}

                <Button className="w-full" disabled={busy} onClick={handleLogin}>دخول</Button>

                <button
                  type="button"
                  className="text-[10px] font-bold text-slate-500 transition hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
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
      </div>
    </div>
  );
}
