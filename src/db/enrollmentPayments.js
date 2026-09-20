import { db } from './db';

export function emptyEnrollmentPayment(student) {
  return { id: null, studentId: student.id, status: 'unpaid', amountDue: Number(student.enrollmentFee) || 0, amountPaid: 0, paymentMethod: 'cash', paymentMethodNote: '', paymentDate: '', note: '' };
}

export async function getEnrollmentPayment(studentId) {
  return db.enrollmentPayments.where('studentId').equals(studentId).first();
}

export async function enrollmentRows({ activeOnly = true } = {}) {
  const students = await db.students.toArray();
  const visible = activeOnly ? students.filter((student) => student.isActive !== false) : students;
  const payments = await db.enrollmentPayments.toArray();
  const byStudent = new Map(payments.map((payment) => [payment.studentId, payment]));
  return visible.map((student) => ({ student, payment: byStudent.get(student.id) || emptyEnrollmentPayment(student) }));
}

export async function saveEnrollmentPayment(payment) {
  const now = new Date().toISOString();
  const record = { ...payment, id: payment.id || crypto.randomUUID(), amountDue: Number(payment.amountDue) || 0, amountPaid: Number(payment.amountPaid) || 0, createdAt: payment.createdAt || now, updatedAt: now };
  await db.enrollmentPayments.put(record);
  return record;
}
