import { useState, useEffect } from 'react';
import { MessageCircle, Sun, Moon, Shield, Lock, RotateCcw, ChevronLeft, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../store/appStore';
import { Button } from '../components/ui/Button';
import { pinError } from '../utils/password';

/* ─── CSS Keyframes (injected once) ─── */
const STYLES = `
  @keyframes blob1 {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(60px,40px) scale(1.15); }
    66%      { transform: translate(-30px,60px) scale(0.9); }
  }
  @keyframes blob2 {
    0%,100% { transform: translate(0,0) scale(1); }
    40%      { transform: translate(-50px,-40px) scale(1.1); }
    70%      { transform: translate(40px,-60px) scale(0.95); }
  }
  @keyframes blob3 {
    0%,100% { transform: translate(0,0) scale(1); }
    30%      { transform: translate(30px,-50px) scale(1.08); }
    65%      { transform: translate(-40px,30px) scale(1.05); }
  }
  @keyframes fadeSlideDown {
    from { opacity:0; transform:translateY(-10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .anim-up  { animation: fadeSlideUp 0.38s ease both; }
  .anim-err { animation: fadeSlideDown 0.25s ease both; }
`;

/* ─── Animated Blob Background ─── */
function Blobs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-[0.22] dark:opacity-[0.12]"
        style={{ background: 'radial-gradient(circle,#0ea5e9 0%,#6366f1 60%,transparent 80%)', animation: 'blob1 18s ease-in-out infinite' }} />
      <div className="absolute top-1/2 -right-40 h-[400px] w-[400px] rounded-full opacity-[0.18] dark:opacity-[0.08]"
        style={{ background: 'radial-gradient(circle,#0f766e 0%,#0ea5e9 60%,transparent 80%)', animation: 'blob2 22s ease-in-out infinite' }} />
      <div className="absolute -bottom-24 left-1/4 h-[350px] w-[350px] rounded-full opacity-[0.15] dark:opacity-[0.07]"
        style={{ background: 'radial-gradient(circle,#8b5cf6 0%,#0f766e 60%,transparent 80%)', animation: 'blob3 26s ease-in-out infinite' }} />
    </div>
  );
}

/* ─── Pin Dots ─── */
function PinDots({ value, max }) {
  return (
    <div className="flex justify-center gap-2 mb-0.5" dir="ltr">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className="relative flex h-3 w-3 items-center justify-center">
          <span className={`absolute inset-0 rounded-full transition-all duration-300 ${
            i < value.length
              ? 'scale-100 bg-gradient-to-br from-sky-400 to-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]'
              : 'scale-75 border-2 border-slate-300 dark:border-slate-600'
          }`} />
        </span>
      ))}
    </div>
  );
}

/* ─── PinKeyboard ─── */
const PIN_KEYS = ['1','2','3','4','5','6','7','8','9','back','0','clear'];

function PinKeyboard({ value, onChange, max = 6 }) {
  function press(d) { if (value.length < max) onChange(`${value}${d}`); }
  return (
    <div className="w-full select-none">
      <PinDots value={value} max={max} />
      <p className="text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-2 mt-0.5" dir="ltr">
        {value.length} / {max}
      </p>
      <div className="mx-auto grid max-w-[270px] grid-cols-3 gap-2" dir="ltr">
        {PIN_KEYS.map((key) => {
          const isBack  = key === 'back';
          const isClear = key === 'clear';
          return (
            <button
              key={key}
              type="button"
              onClick={() => isBack ? onChange(value.slice(0,-1)) : isClear ? onChange('') : press(key)}
              aria-label={isBack ? 'حذف' : isClear ? 'مسح' : key}
              className={`
                flex h-[44px] items-center justify-center rounded-xl border text-lg font-bold
                transition-all duration-150 active:scale-[0.91]
                ${(isBack || isClear)
                  ? 'border-slate-200/60 bg-slate-100/80 text-slate-500 hover:bg-slate-200/80 dark:border-slate-600/40 dark:bg-slate-700/60 dark:text-slate-400 dark:hover:bg-slate-700'
                  : 'border-white/60 bg-white/90 text-slate-800 shadow-[0_3px_8px_rgba(15,23,42,0.07)] hover:bg-white dark:border-slate-600/30 dark:bg-slate-800/80 dark:text-white dark:hover:bg-slate-700/90'
                }
              `}
            >
              {isBack ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                  <line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/>
                </svg>
              ) : isClear ? <RotateCcw size={15} /> : key}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Error Banner ─── */
function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="anim-err flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/80 px-3 py-2 backdrop-blur-sm dark:border-red-900/40 dark:bg-red-950/30 mb-2">
      <AlertTriangle size={13} className="shrink-0 text-red-500 dark:text-red-400" />
      <p className="text-[11.5px] font-semibold text-red-600 dark:text-red-300">{message}</p>
    </div>
  );
}

/* ─── Warning Banner ─── */
function WarningBanner({ children }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 backdrop-blur-sm dark:border-amber-900/40 dark:bg-amber-950/30">
      <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-500 dark:text-amber-400" />
      <p className="text-[11.5px] font-medium leading-snug text-amber-700 dark:text-amber-300">{children}</p>
    </div>
  );
}

/* ─── Logo Mark ─── */
function LogoMark({ size = 'md' }) {
  const isLg = size === 'lg';
  return (
    <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#1d4ed8] ring-white/60 dark:ring-slate-800/60 ${
      isLg
        ? 'h-[96px] w-[96px] rounded-[28px] p-5 shadow-[0_22px_60px_rgba(13,148,136,0.32),0_8px_20px_rgba(99,102,241,0.2)] ring-4'
        : 'h-[52px] w-[52px] rounded-[15px] p-3 shadow-[0_8px_20px_rgba(13,148,136,0.25)] ring-2'
    }`}>
      <img src="/icons/icon.svg" alt="شعار النظام" className="h-full w-full object-contain" />
      {isLg && (
        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-emerald-100 bg-white px-3 py-0.5 text-[8px] font-black tracking-[0.3em] text-emerald-700 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900 dark:text-emerald-300">
          SECURE
        </span>
      )}
    </div>
  );
}

/* ─── Theme Toggle ─── */
function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:scale-105 hover:bg-white dark:border-slate-600/50 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-700/80"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

/* ══════════════════════════════
   LOADING SCREEN
══════════════════════════════ */
function LoadingScreen({ isDark, onToggle }) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#f0f7ff] dark:bg-[#0f1221]">
      <style>{STYLES}</style>
      <Blobs />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5">
        <ThemeToggle isDark={isDark} onToggle={onToggle} />
        <div className="text-right">
          <p className="text-[9px] font-black tracking-[0.25em] text-slate-400 dark:text-slate-500">DESIGNED BY</p>
          <p className="text-[12px] font-black text-slate-700 dark:text-slate-200">م. محمد الجوجو</p>
        </div>
      </div>

      {/* Center */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <LogoMark size="lg" />
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-[9px] font-black tracking-[0.3em] text-slate-400 dark:text-slate-500">
            <span className="h-px w-6 bg-current opacity-40" />KINDERGARTEN SYSTEM<span className="h-px w-6 bg-current opacity-40" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">نظام الروضة</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">جارٍ تجهيز النظام…</p>
        </div>
        <div className="flex items-center gap-2">
          {[0,150,300].map(d => (
            <span key={d} className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 animate-pulse"
              style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-5 pb-6">
        <div className="flex items-center justify-between rounded-3xl border border-white/70 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50">
          <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">تطوير وإدارة</p>
            <p className="text-[13px] font-black text-slate-900 dark:text-white">م. محمد الجوجو</p>
          </div>
          <a href="https://wa.me/972592133357" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-[11.5px] font-extrabold text-white shadow-[0_4px_12px_rgba(16,185,129,0.4)] transition hover:scale-105 hover:bg-emerald-600 active:scale-95">
            <MessageCircle size={15} />واتساب
          </a>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   MAIN EXPORT
══════════════════════════════ */
export function LoginPage() {
  const { ready, needsSetup, login, setupPassword, resetPassword } = useAuth();
  const { theme, toggleTheme } = useAppStore();
  const isDark = theme === 'dark';

  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [setupStep,   setSetupStep]   = useState('create');
  const [remember,    setRemember]    = useState(false);
  const [error,       setError]       = useState('');
  const [resetOpen,   setResetOpen]   = useState(false);
  const [resetConfirm,setResetConfirm]= useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [busy,        setBusy]        = useState(false);
  const [mounted,     setMounted]     = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  async function handleSetup() {
    const err = pinError(password);
    if (err) return setError(err);
    if (setupStep === 'create') { setSetupStep('confirm'); setConfirm(''); setError(''); return; }
    if (password !== confirm) return setError('كلمتا المرور غير متطابقتين. أعد الإدخال.');
    setBusy(true); await setupPassword(password); setBusy(false);
  }

  async function handleLogin() {
    if (!password) return setError('أدخل كلمة المرور من لوحة الأرقام.');
    setBusy(true);
    const ok = await login(password, remember);
    setBusy(false);
    if (!ok) { setError('كلمة المرور غير صحيحة.'); setPassword(''); }
  }

  async function handleReset() {
    const err = pinError(newPassword);
    if (err) return setError(err);
    setBusy(true); await resetPassword(newPassword); setBusy(false);
  }

  if (!ready) return <LoadingScreen isDark={isDark} onToggle={toggleTheme} />;

  const view = needsSetup ? 'setup' : resetOpen ? 'reset' : 'login';

  const headings = {
    login: { title: 'أهلاً بعودتك',        sub: 'أدخل رمز الوصول للمتابعة' },
    setup: { title: setupStep === 'create' ? 'إعداد كلمة المرور' : 'تأكيد كلمة المرور',
             sub:   setupStep === 'create' ? 'أنشئ رمزاً سرياً لحماية النظام' : 'أعد إدخال الرمز للتأكيد' },
    reset: { title: 'إعادة التعيين',        sub: 'تعيين رمز وصول جديد' },
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f0f7ff] dark:bg-[#0f1221]" dir="rtl">
      <style>{STYLES}</style>
      <Blobs />

      <div className="relative z-10 mx-auto flex h-full max-w-[430px] flex-col px-4 pt-3 pb-3">

        {/* ── Header: logo + title + theme toggle ── */}
        <header className={`flex items-center justify-between transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          {/* Logo + title inline */}
          <div className="flex items-center gap-2.5">
            <LogoMark size="sm" />
            <div>
              <div className="flex items-center gap-1.5 text-[8px] font-black tracking-[0.28em] text-slate-400 dark:text-slate-500">
                <span className="h-px w-4 bg-current opacity-50" />KG SYSTEM<span className="h-px w-4 bg-current opacity-50" />
              </div>
              <h1 className="text-[1.05rem] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {headings[view].title}
              </h1>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight">{headings[view].sub}</p>
            </div>
          </div>
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </header>

        {/* Glass Card */}
        <div className={`mt-3 flex-1 rounded-[28px] border border-white/70 bg-white/65 px-4 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.09),0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/50 transition-all duration-500 overflow-hidden flex flex-col ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

          <ErrorBanner message={error} />

          {/* ── SETUP ── */}
          {view === 'setup' && (
            <div className="anim-up flex flex-col gap-3 flex-1 justify-center">
              <PinKeyboard
                value={setupStep === 'create' ? password : confirm}
                max={6}
                onChange={(v) => { setError(''); setupStep === 'create' ? setPassword(v) : setConfirm(v); }}
              />
              <Button className="w-full rounded-xl py-2.5 text-[13.5px] shadow-[0_6px_16px_rgba(37,99,235,0.28)]" disabled={busy} onClick={handleSetup}>
                <Lock size={14} />{setupStep === 'create' ? 'التالي' : 'حفظ وابدأ'}
              </Button>
              {setupStep === 'confirm' && (
                <button type="button"
                  className="flex items-center justify-center gap-1.5 text-[12px] font-bold text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  onClick={() => { setSetupStep('create'); setConfirm(''); setError(''); }}>
                  <ChevronLeft size={13} />رجوع
                </button>
              )}
            </div>
          )}

          {/* ── RESET ── */}
          {view === 'reset' && (
            <div className="anim-up flex flex-col gap-3 flex-1 justify-center">
              <WarningBanner>إعادة التعيين لا تحذف بيانات الطلاب أو المدفوعات.</WarningBanner>
              {!resetConfirm ? (
                <Button variant="danger" className="w-full rounded-xl py-2.5 text-[13.5px] shadow-[0_6px_16px_rgba(220,38,38,0.25)]" onClick={() => setResetConfirm(true)}>
                  <RotateCcw size={14} />تأكيد إعادة التعيين
                </Button>
              ) : (
                <>
                  <PinKeyboard value={newPassword} max={6} onChange={(v) => { setError(''); setNewPassword(v); }} />
                  <Button className="w-full rounded-xl py-2.5 text-[13.5px] shadow-[0_6px_16px_rgba(37,99,235,0.28)]" disabled={busy} onClick={handleReset}>
                    <Lock size={14} />حفظ كلمة المرور
                  </Button>
                </>
              )}
              <button type="button"
                className="flex items-center justify-center gap-1.5 text-[12px] font-bold text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                onClick={() => { setResetOpen(false); setResetConfirm(false); setNewPassword(''); setError(''); }}>
                <ChevronLeft size={13} />رجوع إلى تسجيل الدخول
              </button>
            </div>
          )}

          {/* ── LOGIN ── */}
          {view === 'login' && (
            <div className="anim-up flex flex-col gap-3 flex-1 justify-center">
              <PinKeyboard value={password} max={6} onChange={(v) => { setError(''); setPassword(v); }} />

              {/* Toggle remember me */}
              <label className="flex cursor-pointer items-center justify-center gap-2">
                <div className="relative">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="sr-only peer" />
                  <div className="h-4 w-8 rounded-full border border-slate-300 bg-slate-200 transition-all peer-checked:border-sky-500 peer-checked:bg-sky-500 dark:border-slate-600 dark:bg-slate-700 dark:peer-checked:border-sky-400 dark:peer-checked:bg-sky-500" />
                  <div className="absolute top-px left-px h-[14px] w-[14px] rounded-full bg-white shadow transition-all peer-checked:translate-x-4" />
                </div>
                <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">تذكرني</span>
              </label>

              {/* Login button */}
              <Button
                className="w-full rounded-xl py-2.5 text-[14px] shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_10px_24px_rgba(37,99,235,0.42)] active:scale-[0.98]"
                disabled={busy}
                onClick={handleLogin}
              >
                {busy ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                ) : <Shield size={15} />}
                {busy ? 'جارٍ التحقق…' : 'دخول آمن'}
              </Button>

              <button type="button"
                className="text-[11.5px] font-semibold text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                onClick={() => { setResetOpen(true); setError(''); }}>
                نسيت كلمة المرور؟
              </button>
            </div>
          )}
        </div>

        {/* Footer — compact single row */}
        <footer className="mt-1.5">
          <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/55 px-3 py-2 shadow-sm backdrop-blur-sm dark:border-slate-700/40 dark:bg-slate-900/40">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#0f766e] to-[#1d4ed8] shadow-sm">
                <img src="/icons/icon.svg" alt="" className="h-4 w-4 object-contain" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">تطوير وإدارة</p>
                <p className="text-[11.5px] font-black leading-tight text-slate-800 dark:text-slate-100">م. محمد الجوجو</p>
              </div>
            </div>
            <a href="https://wa.me/972592133357" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-[11px] font-extrabold text-white shadow-[0_3px_10px_rgba(16,185,129,0.4)] transition hover:scale-105 hover:bg-emerald-600 active:scale-95">
              <MessageCircle size={13} />واتساب
            </a>
          </div>
        </footer>

      </div>
    </div>
  );
}

