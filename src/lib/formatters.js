export const currency = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0
});

export const number = new Intl.NumberFormat('es-MX');

export function formatCurrency(value) {
  return currency.format(Number(value || 0));
}

export function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

export function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(new Date(`${value}T12:00:00`));
}

export function daysUntil(value) {
  if (!value) return null;
  const today = new Date('2026-06-29T12:00:00');
  const target = new Date(`${value}T12:00:00`);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}
