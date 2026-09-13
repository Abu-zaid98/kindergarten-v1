import { db } from './db';

export async function listStudents() {
  const rows = await db.students.toArray();
  return rows.sort((a, b) => a.fullName.localeCompare(b.fullName, 'ar'));
}

export async function getStudent(id) {
  return db.students.get(id);
}

export async function saveStudent(student) {
  const now = new Date().toISOString();
  const record = {
    ...student,
    id: student.id || crypto.randomUUID(),
    createdAt: student.createdAt || now,
    updatedAt: now,
  };
  await db.students.put(record);
  return record;
}

export async function deleteStudent(id) {
  await db.transaction('rw', db.students, db.payments, async () => {
    await db.students.delete(id);
    await db.payments.where('studentId').equals(id).delete();
  });
}
