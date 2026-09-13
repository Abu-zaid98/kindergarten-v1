import { useEffect, useState } from 'react';
import { Input, Select, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { todayISO } from '../../utils/dates';

const empty = (defaults) => ({
  fullName: '',
  birthDate: '',
  gender: 'male',
  classroom: '',
  notes: '',
  guardianName: '',
  guardianRelation: 'أب',
  phone1: '',
  phone2: '',
  email: '',
  monthlyFee: defaults.defaultMonthlyFee || 200,
  enrollmentDate: todayISO(),
  isActive: true,
});

export function StudentForm({ student, defaults, onSubmit, onCancel }) {
  const defaultFee = defaults?.defaultMonthlyFee || 200;
  const [form, setForm] = useState(() => empty({ defaultMonthlyFee: defaultFee }));

  useEffect(() => {
    const base = empty({ defaultMonthlyFee: defaultFee });
    setForm(student ? { ...base, ...student } : base);
  }, [student, defaultFee]);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.fullName.trim() || !form.guardianName.trim() || !form.phone1.trim()) return;
    onSubmit({
      ...form,
      monthlyFee: Number(form.monthlyFee) || 0,
      isActive: form.isActive === true || form.isActive === 'true',
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <Input label="الاسم الكامل للطالب *" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required />
      <Input label="تاريخ الميلاد" type="date" value={form.birthDate || ''} onChange={(e) => set('birthDate', e.target.value)} />
      <Select label="الجنس" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
        <option value="male">ذكر</option>
        <option value="female">أنثى</option>
      </Select>
      <Input label="الصف / الفصل" value={form.classroom} onChange={(e) => set('classroom', e.target.value)} />
      <Input label="اسم ولي الأمر *" value={form.guardianName} onChange={(e) => set('guardianName', e.target.value)} required />
      <Select label="صلة القرابة" value={form.guardianRelation} onChange={(e) => set('guardianRelation', e.target.value)}>
        <option>أب</option>
        <option>أم</option>
        <option>جد</option>
        <option>غيره</option>
      </Select>
      <Input label="رقم الجوال الأساسي *" value={form.phone1} onChange={(e) => set('phone1', e.target.value)} required />
      <Input label="رقم الجوال الثانوي" value={form.phone2} onChange={(e) => set('phone2', e.target.value)} />
      <Input label="البريد الإلكتروني" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
      <Input label="الرسوم الشهرية (₪) *" type="number" min="0" value={form.monthlyFee} onChange={(e) => set('monthlyFee', e.target.value)} required />
      <Input label="تاريخ التسجيل" type="date" value={form.enrollmentDate || ''} onChange={(e) => set('enrollmentDate', e.target.value)} />
      <Select label="الحالة" value={String(form.isActive !== false)} onChange={(e) => set('isActive', e.target.value === 'true')}>
        <option value="true">نشط</option>
        <option value="false">غير نشط</option>
      </Select>
      <Textarea className="sm:col-span-2" label="ملاحظات خاصة" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      <div className="sm:col-span-2 mt-2 flex gap-2">
        <Button type="submit" className="flex-1">حفظ</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>إلغاء</Button>
      </div>
    </form>
  );
}
