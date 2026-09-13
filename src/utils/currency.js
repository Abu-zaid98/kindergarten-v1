export function formatNumber(amount) {
  const value = Number(amount) || 0;
  return value.toLocaleString('en-US');
}

export function formatILS(amount) {
  return `${formatNumber(amount)} ₪`;
}

export function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
