/** Formata YYYY-MM-DD para dd/mm/aaaa */
export function formatDateBR(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const [y, m, d] = dateStr.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

/** Converte dd/mm/aaaa para YYYY-MM-DD ou null se inválido */
export function parseDateBR(text) {
  const parts = text.replace(/\D/g, '');
  if (parts.length !== 8) return null;
  const d = parts.slice(0, 2);
  const m = parts.slice(2, 4);
  const y = parts.slice(4, 8);
  const day = Number(d);
  const month = Number(m);
  const year = Number(y);
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return `${y}-${m}-${d}`;
}

/** Máscara enquanto digita: dd/mm/aaaa */
export function maskDateBR(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function todayISO() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

/** Verifica se a recorrência cai nesta data (entre início e fim, inclusive). */
export function occursOnDate(startDateStr, recurrence, dateStr, endDateStr = null) {
  const start = startDateStr?.slice(0, 10);
  const end = endDateStr?.slice(0, 10) || null;
  const date = dateStr?.slice(0, 10);
  if (!start || !date || date < start) return false;
  if (end && date > end) return false;

  if (recurrence === 'diaria') return true;

  const s = new Date(`${start}T12:00:00`);
  const d = new Date(`${date}T12:00:00`);
  const diffDays = Math.round((d - s) / 86400000);

  if (recurrence === 'semanal') return diffDays % 7 === 0;
  if (recurrence === 'mensal') return d.getDate() === s.getDate();

  return false;
}
