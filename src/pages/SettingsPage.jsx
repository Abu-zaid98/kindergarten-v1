import { useEffect, useState } from 'react';
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

export function SettingsPage() {
  const settings = useSettings();
  const { changePassword, logout } = useAuth();
  const [form, setForm] = useState({
    kindergartenName: '',
    defaultMonthlyFee: 200,
    currentAcademicYear: '',
  });
  const [pw, setPw] = useState({ old: '', next: '' });
  const [message, setMessage] = useState('');
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [wipeOpen, setWipeOpen] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        kindergartenName: settings.kindergartenName || '',
        defaultMonthlyFee: settings.defaultMonthlyFee || 200,
        currentAcademicYear: settings.currentAcademicYear || '',
      });
    }
  }, [settings]);

  async function save() {
    await updateSettings({
      kindergartenName: form.kindergartenName.trim() || 'روضتي',
      defaultMonthlyFee: Number(form.defaultMonthlyFee) || 0,
      currentAcademicYear: form.currentAcademicYear,
    });
    setMessage('تم حفظ الإعدادات.');
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
    const data = await exportAllData();
    downloadJson(`${form.kindergartenName || 'روضة'}_نسخة_احتياطية.json`, data);
  }

  async function handleImportJson(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      await importAllData(payload);
      setMessage('تم استيراد البيانات.');
    } catch {
      setMessage('فشل الاستيراد. تحقق من الملف.');
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
    await db.transaction('rw', db.students, db.payments, async () => {
      await db.students.clear();
      await db.payments.clear();
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
          <Input label="السنة الدراسية الحالية" value={form.currentAcademicYear} onChange={(e) => setForm({ ...form, currentAcademicYear: e.target.value })} />
        </div>
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
          <Button onClick={handleExportJson}>تصدير JSON</Button>
          <Button variant="secondary" onClick={handleExportStudents}>تصدير قائمة الطلاب Excel</Button>
          <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 border border-slate-200">
            استيراد JSON
            <input type="file" accept="application/json" className="hidden" onChange={handleImportJson} />
          </label>
        </div>
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
