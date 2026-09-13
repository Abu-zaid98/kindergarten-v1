export function sanitizePin(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 6);
}

export function pinError(value) {
  if (!/^\d{4,6}$/.test(value || '')) {
    return 'كلمة المرور أرقام فقط، من 4 أرقام على الأقل و6 على الأكثر.';
  }
  return '';
}
