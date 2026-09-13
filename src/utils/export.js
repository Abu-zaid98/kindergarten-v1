import { db } from '../db/db';

export async function exportAllData() {
  const [students, payments, settings] = await Promise.all([
    db.students.toArray(),
    db.payments.toArray(),
    db.settings.toArray(),
  ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    students,
    payments,
    settings,
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
  await db.transaction('rw', db.students, db.payments, db.settings, async () => {
    await db.students.clear();
    await db.payments.clear();
    await db.students.bulkPut(payload.students);
    await db.payments.bulkPut(payload.payments);
    if (Array.isArray(payload.settings) && payload.settings.length) {
      await db.settings.clear();
      await db.settings.bulkPut(payload.settings);
    }
  });
}
