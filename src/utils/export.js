import { db } from '../db/db';

export async function exportAllData() {
  const [students, payments, settings, classrooms, staff, salaryPayments, enrollmentPayments] = await Promise.all([
    db.students.toArray(),
    db.payments.toArray(),
    db.settings.toArray(),
    db.classrooms.toArray(),
    db.staff.toArray(),
    db.salaryPayments.toArray(),
    db.enrollmentPayments.toArray(),
  ]);
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    students,
    payments,
    settings,
    classrooms,
    staff,
    salaryPayments,
    enrollmentPayments,
  };
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importAllData(payload) {
  if (!payload || !Array.isArray(payload.students) || !Array.isArray(payload.payments)) {
    throw new Error('ملف غير صالح');
  }
  await db.transaction('rw', db.students, db.payments, db.settings, db.classrooms, db.staff, db.salaryPayments, db.enrollmentPayments, async () => {
    await db.students.clear();
    await db.payments.clear();
    await db.classrooms.clear();
    await db.staff.clear();
    await db.salaryPayments.clear();
    await db.enrollmentPayments.clear();
    await db.students.bulkPut(payload.students);
    await db.payments.bulkPut(payload.payments);
    if (Array.isArray(payload.classrooms)) await db.classrooms.bulkPut(payload.classrooms);
    if (Array.isArray(payload.staff)) await db.staff.bulkPut(payload.staff);
    if (Array.isArray(payload.salaryPayments)) await db.salaryPayments.bulkPut(payload.salaryPayments);
    if (Array.isArray(payload.enrollmentPayments)) await db.enrollmentPayments.bulkPut(payload.enrollmentPayments);
    if (Array.isArray(payload.settings) && payload.settings.length) {
      await db.settings.clear();
      await db.settings.bulkPut(payload.settings);
    }
  });
}
