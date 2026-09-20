import { db } from './db';

export async function listClassrooms() {
  const rows = await db.classrooms.toArray();
  return rows.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
}

export async function saveClassroom(classroom) {
  const name = String(classroom.name || '').trim();
  if (!name) throw new Error('اسم الفصل مطلوب');
  const duplicate = await db.classrooms.where('name').equals(name).first();
  if (duplicate && duplicate.id !== classroom.id) throw new Error('يوجد فصل بهذا الاسم بالفعل');
  const now = new Date().toISOString();
  const record = { ...classroom, id: classroom.id || crypto.randomUUID(), name, createdAt: classroom.createdAt || now, updatedAt: now };
  await db.classrooms.put(record);
  // Keep the human-readable legacy field aligned, and adopt matching legacy classroom text.
  await db.students.where('classroomId').equals(record.id).modify({ classroom: name, updatedAt: now });
  const legacyStudents = await db.students.where('classroom').equals(name).toArray();
  await Promise.all(legacyStudents.filter((student) => !student.classroomId).map((student) =>
    db.students.update(student.id, { classroomId: record.id, updatedAt: now }),
  ));
  return record;
}

export async function deleteClassroom(id) {
  await db.transaction('rw', db.classrooms, db.students, async () => {
    await db.students.where('classroomId').equals(id).modify({ classroomId: null, classroom: '', updatedAt: new Date().toISOString() });
    await db.classrooms.delete(id);
  });
}
