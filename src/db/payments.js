import { db } from './db';
import { listStudents } from './students';

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'كاش (نقداً)' },
  { id: 'wallet', label: 'محفظة إلكترونية' },
  { id: 'bank', label: 'تحويل بنكي' },
  { id: 'jawwal_pay', label: 'جوال باي' },
  { id: 'pal_pay', label: 'بال باي' },
  { id: 'other', label: 'أخرى' },
];

export const STATUS_LABELS = {
  paid: 'تم الدفع',
  partial: 'دفع جزئي',
  unpaid: 'لم يدفع',
};

export function methodLabel(id, note = '') {
  const found = PAYMENT_METHODS.find((m) => m.id === id);
  if (!found) return '—';
  if (id === 'other' && note) return `${found.label}: ${note}`;
  return found.label;
}

export function emptyPayment(student, month, year) {
  return {
    id: null,
    studentId: student.id,
    month,
    year,
    status: 'unpaid',
    amountDue: Number(student.monthlyFee) || 0,
    amountPaid: 0,
    paymentMethod: 'cash',
    paymentMethodNote: '',
    paymentDate: '',
    note: '',
  };
}

export async function getPayment(studentId, year, month) {
  return db.payments.where('[studentId+year+month]').equals([studentId, year, month]).first();
}

export async function savePayment(payment) {
  const now = new Date().toISOString();
  const record = {
    ...payment,
    id: payment.id || crypto.randomUUID(),
    month: Number(payment.month),
    year: Number(payment.year),
    amountDue: Number(payment.amountDue) || 0,
    amountPaid: Number(payment.amountPaid) || 0,
    createdAt: payment.createdAt || now,
    updatedAt: now,
  };
  await db.payments.put(record);
  return record;
}

export async function deletePayment(id) {
  if (!id) return;
  await db.payments.delete(id);
}
export async function listPaymentsForStudent(studentId) {
  const rows = await db.payments.where('studentId').equals(studentId).toArray();
  return rows.sort((a, b) => b.year - a.year || b.month - a.month);
}

export async function paymentsForMonth(year, month, { activeOnly = true } = {}) {
  const y = Number(year);
  const m = Number(month);
  const students = await listStudents();
  const filtered = activeOnly ? students.filter((s) => s.isActive !== false) : students;
  const existing = (await db.payments.toArray()).filter(
    (p) => Number(p.year) === y && Number(p.month) === m,
  );
  const byStudent = new Map(existing.map((p) => [p.studentId, p]));
  return filtered.map((student) => {
    const payment = byStudent.get(student.id) || emptyPayment(student, m, y);
    return { student, payment };
  });
}

export async function paymentsOnDate(isoDate) {
  const rows = await db.payments.filter((p) => (p.paymentDate || '').startsWith(isoDate)).toArray();
  const students = await listStudents();
  const map = new Map(students.map((s) => [s.id, s]));
  return rows.map((payment) => ({ payment, student: map.get(payment.studentId) }));
}

export function summarizeRows(rows) {
  const due = rows.reduce((sum, r) => sum + (Number(r.payment.amountDue) || 0), 0);
  const paid = rows.reduce((sum, r) => sum + (Number(r.payment.amountPaid) || 0), 0);
  const paidCount = rows.filter((r) => r.payment.status === 'paid').length;
  const unpaid = rows.filter((r) => r.payment.status !== 'paid');
  return {
    totalStudents: rows.length,
    due,
    paid,
    deficit: Math.max(due - paid, 0),
    paidCount,
    unpaidCount: unpaid.length,
    unpaid,
    rate: due ? Math.round((paid / due) * 100) : 0,
  };
}
