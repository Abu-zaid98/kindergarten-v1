import { db } from './db';

export async function listStaff() {
  const rows = await db.staff.toArray();
  return rows.sort((a, b) => a.fullName.localeCompare(b.fullName, 'ar'));
}

export async function saveStaff(member) {
  const now = new Date().toISOString();
  const record = {
    ...member,
    id: member.id || crypto.randomUUID(),
    monthlySalary: Number(member.monthlySalary) || 0,
    isActive: member.isActive !== false,
    createdAt: member.createdAt || now,
    updatedAt: now,
  };
  await db.staff.put(record);
  return record;
}

export async function deleteStaff(id) {
  await db.transaction('rw', db.staff, db.salaryPayments, async () => {
    await db.staff.delete(id);
    await db.salaryPayments.where('staffId').equals(id).delete();
  });
}

export function emptySalaryPayment(member, month, year) {
  return { id: null, staffId: member.id, month: Number(month), year: Number(year), status: 'unpaid', amountDue: Number(member.monthlySalary) || 0, amountPaid: 0, paymentMethod: 'cash', paymentMethodNote: '', paymentDate: '', note: '' };
}

export async function salaryRowsForMonth(year, month, { activeOnly = true } = {}) {
  const staff = await listStaff();
  const members = activeOnly ? staff.filter((member) => member.isActive !== false) : staff;
  const payments = (await db.salaryPayments.toArray()).filter((payment) => Number(payment.year) === Number(year) && Number(payment.month) === Number(month));
  const paymentByStaff = new Map(payments.map((payment) => [payment.staffId, payment]));
  return members.map((member) => ({ member, payment: paymentByStaff.get(member.id) || emptySalaryPayment(member, month, year) }));
}

export async function saveSalaryPayment(payment) {
  const now = new Date().toISOString();
  const record = { ...payment, id: payment.id || crypto.randomUUID(), month: Number(payment.month), year: Number(payment.year), amountDue: Number(payment.amountDue) || 0, amountPaid: Number(payment.amountPaid) || 0, createdAt: payment.createdAt || now, updatedAt: now };
  await db.salaryPayments.put(record);
  return record;
}

export async function listSalaryPayments(staffId) {
  const rows = await db.salaryPayments.where('staffId').equals(staffId).toArray();
  return rows.sort((a, b) => b.year - a.year || b.month - a.month);
}

export function summarizeSalaryRows(rows) {
  const due = rows.reduce((sum, row) => sum + (Number(row.payment.amountDue) || 0), 0);
  const paid = rows.reduce((sum, row) => sum + (Number(row.payment.amountPaid) || 0), 0);
  const unpaid = rows.filter((row) => row.payment.status !== 'paid');
  return { total: rows.length, due, paid, deficit: Math.max(due - paid, 0), paidCount: rows.length - unpaid.length, unpaidCount: unpaid.length, unpaid };
}
