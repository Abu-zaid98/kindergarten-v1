import { useState } from 'react';
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
      <div className="flex min-h-screen items-center justify-center text-slate-500">جاري التحميل...</div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-slate-100 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="mt-1 text-2xl font-extrabold">نظام الدفع الشهري</h1>
        <p className="mt-2 text-sm text-slate-500">
          {needsSetup
            ? setupStep === 'create'
              ? 'اضغط الأرقام لإنشاء كلمة مرور من 4 إلى 6 أرقام.'
              : 'أعد إدخال نفس الأرقام للتأكيد.'
            : 'اضغط الأرقام لإدخال كلمة المرور.'}
        </p>

        {needsSetup ? (
          <div className="mt-6 grid gap-4">
            <PinPad
              label={setupStep === 'create' ? 'كلمة المرور الجديدة' : 'تأكيد كلمة المرور'}
              value={setupStep === 'create' ? password : confirm}
              onChange={(v) => {
                setError('');
                if (setupStep === 'create') setPassword(v);
                else setConfirm(v);
              }}
            />
            {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
            <Button className="w-full" disabled={busy} onClick={handleSetup}>
              {setupStep === 'create' ? 'التالي' : 'بدء الاستخدام'}
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
          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
              إعادة التعيين لا تحذف بيانات الطلاب أو المدفوعات. تأكد أنك صاحب الجهاز.
            </div>
            {!resetConfirm ? (
              <Button type="button" variant="danger" onClick={() => setResetConfirm(true)}>
                أفهم، أريد إعادة التعيين
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
                {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
                <Button disabled={busy} onClick={handleReset}>حفظ كلمة المرور الجديدة</Button>
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
              رجوع لتسجيل الدخول
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            <PinPad
              label="كلمة المرور"
              value={password}
              onChange={(v) => {
                setError('');
                setPassword(v);
              }}
            />
            <label className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              تذكرني لمدة 7 أيام
            </label>
            {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
            <Button className="w-full" disabled={busy} onClick={handleLogin}>دخول</Button>
            <button
              type="button"
              className="text-sm font-bold text-slate-500"
              onClick={() => {
                setResetOpen(true);
                setError('');
              }}
            >
              نسيت كلمة المرور؟
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
