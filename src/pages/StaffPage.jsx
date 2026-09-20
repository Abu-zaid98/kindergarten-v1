import { useEffect, useState } from 'react';
import { Banknote, CheckCircle2, Pencil, Plus, ReceiptText, Trash2, Users, XCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useSalaryRows, useStaff, useStaffSalaryHistory } from '../hooks/useStaff';
import { deleteStaff, saveSalaryPayment, saveStaff, summarizeSalaryRows } from '../db/staff';
import { PAYMENT_METHODS, STATUS_LABELS, methodLabel } from '../db/payments';
import { formatILS } from '../utils/currency';
import { monthName, todayISO } from '../utils/dates';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { PeriodFilter } from '../components/ui/PeriodFilter';
import { StatsCard } from '../components/dashboard/StatsCard';
import { useSettings } from '../hooks/useAuth';
import { ExportToolbar } from '../components/reports/ExportToolbar';
import { exportSalaryReport } from '../utils/exportExcel';

const blankMember = { fullName: '', role: 'معلمة', phone: '', monthlySalary: '', notes: '', isActive: true };

export function StaffPage() {
  const month = useAppStore((s) => s.selectedMonth);
  const year = useAppStore((s) => s.selectedYear);
  const { staff } = useStaff();
  const settings = useSettings();
  const rows = useSalaryRows(year, month);
  const stats = summarizeSalaryRows(rows);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [target, setTarget] = useState(null);
  const [opened, setOpened] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [unpaidOnly, setUnpaidOnly] = useState(false);
  const visible = unpaidOnly ? rows.filter((row) => row.payment.status !== 'paid') : rows;

  async function saveMember(data) { await saveStaff(data); setFormOpen(false); }
  async function saveSalary(payment) { await saveSalaryPayment(payment); setTarget(null); }
  function newMember() { setEditing(null); setFormOpen(true); }
  function editMember(member) { setEditing(member); setFormOpen(true); }

  return <div>
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-xl font-extrabold">المعلمات والمعلمون</h2><p className="text-sm text-slate-500">متابعة رواتب الهيئة التعليمية لشهر {monthName(month)} {year}</p></div><div className="flex flex-wrap items-end gap-2"><PeriodFilter withSearch /><Button onClick={newMember}><Plus size={16} />إضافة موظف</Button></div></div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3"><StatsCard icon={Users} title="إجمالي الموظفين" value={stats.total} /><StatsCard icon={Banknote} title="إجمالي الرواتب" value={formatILS(stats.due)} /><StatsCard icon={CheckCircle2} title="الرواتب المدفوعة" value={stats.paidCount} tone="green" /><StatsCard icon={ReceiptText} title="المصروف" value={formatILS(stats.paid)} tone="green" /><StatsCard icon={XCircle} title="بانتظار الدفع" value={stats.unpaidCount} tone="amber" /><StatsCard icon={Banknote} title="المتبقي" value={formatILS(stats.deficit)} tone="red" /></div>
    <ExportToolbar reportTitle={`تقرير الرواتب — ${monthName(month)} ${year}`} onExcelExport={() => exportSalaryReport({ kindergartenName: settings?.kindergartenName || 'روضتي', month, year, stats, rows: rows.map(({ member, payment }) => [member.fullName, member.role || '', payment.amountDue, payment.amountPaid, STATUS_LABELS[payment.status], methodLabel(payment.paymentMethod, payment.paymentMethodNote), payment.paymentDate || '', payment.note || '']) })} onPrint={() => window.print()} />
    <div className="mt-6 rounded-3xl bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><h3 className="font-extrabold">سجل الرواتب الشهري</h3><label className="flex items-center gap-2 text-sm text-slate-500"><input type="checkbox" checked={unpaidOnly} onChange={(e) => setUnpaidOnly(e.target.checked)} />إظهار غير المدفوع فقط</label></div>
      <div className="grid gap-3">{visible.map(({ member, payment }) => <StaffRow key={member.id} member={member} payment={payment} onPay={() => setTarget({ member, payment })} onOpen={() => setOpened(member)} onEdit={() => editMember(member)} onDelete={() => setDeleteTarget(member)} />)}{visible.length === 0 && <p className="rounded-2xl bg-slate-50 p-7 text-center text-sm text-slate-500">لا توجد رواتب مطابقة لهذه الفترة.</p>}</div>
    </div>
    <StaffFormModal open={formOpen} member={editing} onClose={() => setFormOpen(false)} onSave={saveMember} />
    <SalaryModal target={target} onClose={() => setTarget(null)} onSave={saveSalary} />
    <StaffDetails member={opened} onClose={() => setOpened(null)} onEdit={() => { setOpened(null); editMember(opened); }} />
    <ConfirmModal open={!!deleteTarget} title="حذف موظف" message={`هل تريد حذف ${deleteTarget?.fullName}؟ سيُحذف سجل رواتبه أيضًا.`} confirmLabel="حذف" cancelLabel="إلغاء" danger onConfirm={async () => { await deleteStaff(deleteTarget.id); setDeleteTarget(null); }} onClose={() => setDeleteTarget(null)} />
  </div>;
}

function StaffRow({ member, payment, onPay, onOpen, onEdit, onDelete }) {
  const tone = payment.status === 'paid' ? 'text-emerald-600' : payment.status === 'partial' ? 'text-amber-600' : 'text-red-600';
  return <div className="rounded-2xl border border-slate-100 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><button type="button" className="text-right" onClick={onOpen}><p className="font-extrabold">{member.fullName}</p><p className="mt-1 text-sm text-slate-500">{member.role || 'معلم/ة'}{member.phone ? ` · ${member.phone}` : ''}</p></button><div className="flex items-center justify-between gap-4 sm:justify-end"><div className="text-left"><p className="font-extrabold text-blue-700">{formatILS(payment.amountDue)}</p><p className={`mt-1 text-xs font-bold ${tone}`}>{STATUS_LABELS[payment.status]}</p></div><Button onClick={onPay}>{payment.status === 'paid' ? 'عرض الدفعة' : 'تسجيل الدفع'}</Button></div></div><div className="mt-3 flex gap-3 border-t border-slate-100 pt-3"><button onClick={onEdit} className="text-xs font-bold text-blue-600"><Pencil size={14} className="ml-1 inline" />تعديل البيانات</button><button onClick={onDelete} className="text-xs font-bold text-red-600"><Trash2 size={14} className="ml-1 inline" />حذف</button></div></div>;
}

function StaffFormModal({ open, member, onClose, onSave }) {
  const [form, setForm] = useState(blankMember);
  useEffect(() => setForm(member ? { ...blankMember, ...member } : blankMember), [member, open]);
  return <Modal open={open} title={member ? 'تعديل بيانات موظف' : 'إضافة معلم / معلمة'} onClose={onClose} wide><form onSubmit={(e) => { e.preventDefault(); if (form.fullName.trim()) onSave(form); }} className="grid gap-4 sm:grid-cols-2"><Input label="الاسم الكامل *" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /><Select label="الصفة" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="معلمة">معلمة</option><option value="معلم">معلم</option><option value="مساعدة معلمة">مساعدة معلمة</option><option value="إداري/ة">إداري/ة</option></Select><Input label="رقم الجوال" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /><Input label="الراتب الشهري (₪) *" type="number" min="0" value={form.monthlySalary} onChange={(e) => setForm({ ...form, monthlySalary: e.target.value })} required /><Select label="الحالة" value={String(form.isActive !== false)} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}><option value="true">نشط</option><option value="false">غير نشط</option></Select><Textarea className="sm:col-span-2" label="ملاحظات" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /><div className="sm:col-span-2 flex gap-2 border-t border-slate-100 pt-4"><Button type="submit" className="flex-1">حفظ</Button><Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button></div></form></Modal>;
}

function SalaryModal({ target, onClose, onSave }) {
  const [form, setForm] = useState(null);
  useEffect(() => { if (target) setForm({ ...target.payment, paymentDate: target.payment.paymentDate || todayISO(), paymentMethod: target.payment.paymentMethod || 'cash' }); }, [target]);
  if (!target || !form) return null;
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const apply = (status) => { const due = Number(form.amountDue) || 0; setForm((current) => ({ ...current, status, amountPaid: status === 'paid' ? due : status === 'unpaid' ? 0 : current.amountPaid, paymentDate: status === 'paid' ? (current.paymentDate || todayISO()) : current.paymentDate })); };
  function submit() { const due = Number(form.amountDue) || 0; const paid = Number(form.amountPaid) || 0; onSave({ ...form, staffId: target.member.id, amountDue: due, amountPaid: paid, status: paid <= 0 ? 'unpaid' : paid < due ? 'partial' : 'paid' }); }
  return <Modal open={!!target} title={`راتب ${target.member.fullName}`} onClose={onClose}><div className="mb-4 grid grid-cols-3 gap-2"><Button variant={form.status === 'paid' ? 'success' : 'secondary'} onClick={() => apply('paid')}>تم الدفع</Button><Button variant={form.status === 'partial' ? 'primary' : 'secondary'} onClick={() => apply('partial')}>جزئي</Button><Button variant={form.status === 'unpaid' ? 'danger' : 'secondary'} onClick={() => apply('unpaid')}>لم يدفع</Button></div><div className="grid gap-3"><Input label="الراتب المستحق (₪)" type="number" value={form.amountDue} onChange={(e) => set('amountDue', e.target.value)} /><Input label="المبلغ المدفوع (₪)" type="number" value={form.amountPaid} onChange={(e) => set('amountPaid', e.target.value)} /><Select label="طريقة الدفع" value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>{PAYMENT_METHODS.map((method) => <option key={method.id} value={method.id}>{method.label}</option>)}</Select>{form.paymentMethod === 'other' && <Input label="تفاصيل الطريقة" value={form.paymentMethodNote || ''} onChange={(e) => set('paymentMethodNote', e.target.value)} />}<Input label="تاريخ الدفع" type="date" value={form.paymentDate || ''} onChange={(e) => set('paymentDate', e.target.value)} /><Textarea label="ملاحظة" value={form.note || ''} onChange={(e) => set('note', e.target.value)} /><Button onClick={submit}>حفظ الراتب</Button></div></Modal>;
}

function StaffDetails({ member, onClose, onEdit }) {
  const history = useStaffSalaryHistory(member?.id);
  if (!member) return null;
  return <Modal open={!!member} title={`سجل ${member.fullName}`} onClose={onClose} wide><div className="grid gap-2 text-sm sm:grid-cols-2"><p><b>الصفة:</b> {member.role || '—'}</p><p><b>الجوال:</b> {member.phone || '—'}</p><p><b>الراتب الشهري:</b> {formatILS(member.monthlySalary)}</p>{member.notes && <p><b>ملاحظات:</b> {member.notes}</p>}</div><h3 className="mt-5 mb-2 font-extrabold">سجل الرواتب</h3><div className="overflow-hidden rounded-2xl border border-slate-100">{history.length ? history.map((payment) => <div key={payment.id} className="flex flex-wrap justify-between gap-2 border-b border-slate-100 p-3 text-sm"><span>{monthName(payment.month)} {payment.year}</span><span>{formatILS(payment.amountPaid)} من {formatILS(payment.amountDue)} · {STATUS_LABELS[payment.status]} · {methodLabel(payment.paymentMethod, payment.paymentMethodNote)}</span></div>) : <p className="p-4 text-sm text-slate-500">لا توجد رواتب مسجلة بعد.</p>}</div><Button className="mt-4" onClick={onEdit}>تعديل البيانات</Button></Modal>;
}
