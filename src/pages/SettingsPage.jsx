import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, LoaderCircle, Upload } from 'lucide-react';
import { useAuth, useSettings } from '../hooks/useAuth';
import { db, updateSettings } from '../db/db';
import { listStudents } from '../db/students';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { PwaInstallCard } from '../components/settings/PwaInstallCard';
import { downloadJson, exportAllData, importAllData } from '../utils/export';
import { exportStudentsList } from '../utils/exportExcel';
import { pinError, sanitizePin } from '../utils/password';
import { ARABIC_MONTHS } from '../utils/dates';
import { useAppStore } from '../store/appStore';

export function SettingsPage() {
  const settings = useSettings();
  const { changePassword, logout } = useAuth();
  const setPeriod = useAppStore((s) => s.setPeriod);
  const selectedMonth = useAppStore((s) => s.selectedMonth);
  const selectedYear = useAppStore((s) => s.selectedYear);
  const [form, setForm] = useState({
    kindergartenName: '',
    defaultMonthlyFee: 200,
    defaultEnrollmentFee: 0,
    currentAcademicYear: '',
    workingMonths: [],
  });
  const [pw, setPw] = useState({ old: '', next: '' });
  const [message, setMessage] = useState('');
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [wipeOpen, setWipeOpen] = useState(false);
  const [backupState, setBackupState] = useState(null);

  useEffect(() => {
    if (settings) {
      setForm({
        kindergartenName: settings.kindergartenName || '',
        defaultMonthlyFee: settings.defaultMonthlyFee || 200,
        defaultEnrollmentFee: settings.defaultEnrollmentFee || 0,
        currentAcademicYear: settings.currentAcademicYear || '',
        workingMonths: Array.isArray(settings.workingMonths) ? settings.workingMonths.map(Number) : ARABIC_MONTHS.map((_, index) => index + 1),
      });
    }
  }, [settings]);

  async function save() {
    const workingMonths = form.workingMonths.map(Number).sort((a, b) => a - b);
    if (!workingMonths.length) { setMessage('اختر شهر عمل واحدًا على الأقل.'); return; }
    await updateSettings({
      kindergartenName: form.kindergartenName.trim() || 'روضتي',
      defaultMonthlyFee: Number(form.defaultMonthlyFee) || 0,
      defaultEnrollmentFee: Number(form.defaultEnrollmentFee) || 0,
      currentAcademicYear: form.currentAcademicYear,
      workingMonths,
    });
    if (!workingMonths.includes(Number(selectedMonth))) setPeriod(workingMonths[0], selectedYear);
    setMessage('تم حفظ الإعدادات.');
  }

  function toggleWorkingMonth(month) {
    setForm((current) => ({ ...current, workingMonths: current.workingMonths.includes(month) ? current.workingMonths.filter((item) => item !== month) : [...current.workingMonths, month] }));
  }

  async function handlePassword() {
    const err = pinError(pw.next);
    if (err) {
      setMessage(err);
      return;
    }
    const ok = await changePassword(pw.old, pw.next);
    setMessage(ok ? 'تم تغيير كلمة المرور.' : 'كلمة المرور الحالية غير صحيحة.');
    if (ok) setPw({ old: '', next: '' });
  }

  async function handleExportJson() {
    setBackupState({ type: 'loading', text: 'جارٍ تجهيز النسخة الاحتياطية…' });
    try {
      const data = await exportAllData();
      downloadJson(`${form.kindergartenName || 'روضة'}_نسخة_احتياطية.json`, data);
      setBackupState({ type: 'success', text: 'تم تصدير النسخة الاحتياطية بنجاح. ستجد الملف في “التنزيلات” أو في المكان الذي حدده المتصفح.' });
    } catch {
      setBackupState({ type: 'error', text: 'تعذر تصدير النسخة الاحتياطية. حاول مرة أخرى.' });
    }
  }

  async function handleImportJson(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackupState({ type: 'loading', text: `جارٍ استيراد بيانات «${file.name}»…` });
    try {
      const payload = JSON.parse(await file.text());
      await importAllData(payload);
      setBackupState({ type: 'success', text: 'تم استيراد البيانات بنجاح، وتم تحديث بيانات التطبيق.' });
    } catch {
      setBackupState({ type: 'error', text: 'فشل الاستيراد. تحقق من أن الملف نسخة احتياطية صالحة.' });
    }
    e.target.value = '';
  }

  async function handleExportStudents() {
    const students = await listStudents();
    exportStudentsList({
      kindergartenName: form.kindergartenName,
      rows: students.map((s) => [
        s.fullName,
        s.guardianName,
        s.guardianRelation,
        s.phone1,
        s.phone2 || '',
        s.email || '',
        s.classroom || '',
        s.monthlyFee,
        s.isActive === false ? 'غير نشط' : 'نشط',
      ]),
    });
  }

  async function wipe() {
    await db.transaction('rw', db.students, db.payments, db.classrooms, db.staff, db.salaryPayments, db.enrollmentPayments, async () => {
      await db.students.clear();
      await db.payments.clear();
      await db.classrooms.clear();
      await db.staff.clear();
      await db.salaryPayments.clear();
      await db.enrollmentPayments.clear();
    });
    setMessage('تم حذف بيانات الطلاب والمدفوعات.');
  }

  async function handleLogoutConfirm() {
    await logout();
    setLogoutOpen(false);
  }

  async function handleWipeConfirm() {
    await wipe();
    setWipeOpen(false);
  }

  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-extrabold">الإعدادات</h2>
      {message ? <p className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p> : null}

      <section className="rounded-3xl bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-extrabold">بيانات الروضة</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="اسم الروضة" value={form.kindergartenName} onChange={(e) => setForm({ ...form, kindergartenName: e.target.value })} />
          <Input label="الرسوم الشهرية الافتراضية (₪)" type="number" value={form.defaultMonthlyFee} onChange={(e) => setForm({ ...form, defaultMonthlyFee: e.target.value })} />
          <Input label="رسوم التسجيل الافتراضية (₪)" type="number" value={form.defaultEnrollmentFee} onChange={(e) => setForm({ ...form, defaultEnrollmentFee: e.target.value })} />
          <Input label="السنة الدراسية الحالية" value={form.currentAcademicYear} onChange={(e) => setForm({ ...form, currentAcademicYear: e.target.value })} />
        </div>
        <div className="mt-4"><p className="mb-2 text-sm font-bold text-slate-600">أشهر العمل المعتمدة</p><p className="mb-3 text-xs text-slate-500">تظهر هذه الأشهر فقط في فلاتر المدفوعات والتقارير والرواتب، وتُستخدم في جدول متابعة الطلاب.</p><div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">{ARABIC_MONTHS.map((name, index) => { const month = index + 1; const selected = form.workingMonths.includes(month); return <button key={month} type="button" onClick={() => toggleWorkingMonth(month)} className={`min-h-[42px] rounded-xl border px-2 text-sm font-bold transition ${selected ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-100' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200'}`}><span className="ml-1 text-xs">{month}</span>{name}</button>; })}</div></div>
        <Button className="mt-4" onClick={save}>حفظ</Button>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-extrabold">تغيير كلمة المرور</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="الحالية"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={pw.old}
            onChange={(e) => setPw({ ...pw, old: e.target.value })}
          />
          <Input
            label="الجديدة من 4 إلى 6 أرقام"
            type="password"
            inputMode="numeric"
            maxLength={6}
            autoComplete="off"
            value={pw.next}
            onChange={(e) => setPw({ ...pw, next: sanitizePin(e.target.value) })}
          />
        </div>
        <Button className="mt-4" onClick={handlePassword}>تحديث كلمة المرور</Button>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-extrabold">النسخ الاحتياطي</h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExportJson} disabled={backupState?.type === 'loading'}>{backupState?.type === 'loading' ? <LoaderCircle size={16} className="animate-spin" /> : <Download size={16} />}تصدير JSON</Button>
          <Button variant="secondary" onClick={handleExportStudents}>تصدير قائمة الطلاب Excel</Button>
          <label className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-bold text-slate-700 ${backupState?.type === 'loading' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer border-slate-200'}`}>
            <Upload size={16} />استيراد JSON
            <input type="file" accept="application/json" className="hidden" disabled={backupState?.type === 'loading'} onChange={handleImportJson} />
          </label>
        </div>
        {backupState ? <BackupFeedback state={backupState} /> : null}
        <p className="mt-2 text-xs text-slate-500">يُفضّل تصدير نسخة احتياطية بانتظام لأن البيانات محلية على هذا الجهاز فقط.</p>
      </section>

      <PwaInstallCard />

      <section className="rounded-3xl bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-extrabold text-amber-700">حماية البيانات</h3>
        <div className="space-y-2 text-sm leading-6 text-slate-600">
          <p>• البيانات محفوظة محلياً داخل المتصفح/IndexedDB على نفس الجهاز، ولا يتم حذفها تلقائياً أثناء استخدام التطبيق.</p>
          <p>• ينصح دائماً بعمل نسخة احتياطية قبل أي مسح شامل أو إعادة تثبيت التطبيق.</p>
          <p>• عند حذف كل البيانات، يتم طلب تأكيد واضح داخل التطبيق قبل التنفيذ.</p>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-extrabold text-red-700">منطقة الخطر</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setLogoutOpen(true)}>تسجيل الخروج</Button>
          <Button variant="danger" onClick={() => setWipeOpen(true)}>حذف كل البيانات</Button>
        </div>
      </section>

      <ConfirmModal
        open={logoutOpen}
        title="تأكيد تسجيل الخروج"
        message="هل أنت متأكد من تسجيل الخروج؟ ستحتاج إلى إدخال كلمة المرور مرة أخرى عند العودة."
        confirmLabel="تسجيل الخروج"
        cancelLabel="إلغاء"
        danger
        onConfirm={handleLogoutConfirm}
        onClose={() => setLogoutOpen(false)}
      />

      <ConfirmModal
        open={wipeOpen}
        title="حذف كل البيانات"
        message="هذا الإجراء يحذف جميع الطلاب والمدفوعات والبيانات المحلية. قبل المتابعة, يفضل تصدير نسخة احتياطية. هل تريد المتابعة فعلاً؟"
        confirmLabel="حذف نهائياً"
        cancelLabel="إلغاء"
        danger
        onConfirm={handleWipeConfirm}
        onClose={() => setWipeOpen(false)}
      />
    </div>
  );
}

function BackupFeedback({ state }) {
  const styles = state.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : state.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-blue-200 bg-blue-50 text-blue-800';
  const Icon = state.type === 'success' ? CheckCircle2 : state.type === 'error' ? AlertCircle : LoaderCircle;
  return <div className={`mt-3 flex items-start gap-2 rounded-2xl border p-3 text-sm font-bold ${styles}`}><Icon size={18} className={state.type === 'loading' ? 'mt-0.5 shrink-0 animate-spin' : 'mt-0.5 shrink-0'} /><span>{state.text}</span></div>;
}
