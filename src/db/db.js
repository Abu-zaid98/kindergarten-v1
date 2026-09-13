import Dexie from 'dexie';

export const db = new Dexie('kindergartenPayments');

db.version(1).stores({
  students: 'id, fullName, guardianName, classroom, isActive, createdAt',
  payments: 'id, studentId, year, month, [studentId+year+month], status, paymentDate',
  settings: 'id',
});

export const DEFAULT_SETTINGS = {
  id: 'app_settings',
  kindergartenName: 'روضتي',
  defaultMonthlyFee: 200,
  currentAcademicYear: '2026-2027',
  passwordHash: '',
  rememberUntil: '',
};

export async function ensureSettings() {
  const existing = await db.settings.get('app_settings');
  if (!existing) {
    await db.settings.put(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  return existing;
}

export async function updateSettings(patch) {
  const current = await ensureSettings();
  const next = { ...current, ...patch };
  await db.settings.put(next);
  return next;
}
