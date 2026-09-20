import Dexie from 'dexie';

export const db = new Dexie('kindergartenPayments');

db.version(1).stores({
  students: 'id, fullName, guardianName, classroom, isActive, createdAt',
  payments: 'id, studentId, year, month, [studentId+year+month], status, paymentDate',
  settings: 'id',
});

// Keep classrooms separate from students so names can be managed consistently.
db.version(2).stores({
  students: 'id, fullName, guardianName, classroom, classroomId, isActive, createdAt',
  payments: 'id, studentId, year, month, [studentId+year+month], status, paymentDate',
  settings: 'id',
  classrooms: 'id, name, createdAt',
});

db.version(3).stores({
  students: 'id, fullName, guardianName, classroom, classroomId, isActive, createdAt',
  payments: 'id, studentId, year, month, [studentId+year+month], status, paymentDate',
  settings: 'id',
  classrooms: 'id, name, createdAt',
  staff: 'id, fullName, role, isActive, createdAt',
  salaryPayments: 'id, staffId, year, month, [staffId+year+month], status, paymentDate',
});

db.version(4).stores({
  students: 'id, fullName, guardianName, classroom, classroomId, isActive, createdAt',
  payments: 'id, studentId, year, month, [studentId+year+month], status, paymentDate',
  settings: 'id',
  classrooms: 'id, name, createdAt',
  staff: 'id, fullName, role, isActive, createdAt',
  salaryPayments: 'id, staffId, year, month, [staffId+year+month], status, paymentDate',
  enrollmentPayments: 'id, studentId, paymentDate, status',
});

export const DEFAULT_SETTINGS = {
  id: 'app_settings',
  kindergartenName: 'روضتي',
  defaultMonthlyFee: 200,
  defaultEnrollmentFee: 0,
  currentAcademicYear: '2026-2027',
  workingMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
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
