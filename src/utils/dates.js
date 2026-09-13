export const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export const ARABIC_WEEKDAYS = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

function pad2(n) {
  return String(n).padStart(2, '0');
}

export function monthName(month) {
  return ARABIC_MONTHS[(month || 1) - 1] || '';
}

export function currentPeriod() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function formatDate(iso) {
  if (!iso) return '—';
  if (typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}/.test(iso)) {
    const [y, m, d] = iso.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }
  const date = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatDayDate(date = new Date()) {
  return `${ARABIC_WEEKDAYS[date.getDay()]} ${formatDate(date)}`;
}

export function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

export function yearsAround(center = new Date().getFullYear()) {
  const start = Number(center) - 5;
  const end = Number(center) + 2;
  const years = [];
  for (let y = start; y <= end; y += 1) years.push(y);
  return years;
}
