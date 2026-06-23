/** Retorna data no formato YYYY-MM-DD */
export function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayStr() {
  return toDateStr(new Date());
}

export function addDaysStr(dateStr, days) {
  const d = new Date(`${dateStr.slice(0, 10)}T12:00:00`);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

export function getNextDueDate(dueDate, recurrence) {
  const d = new Date(`${dueDate.slice(0, 10)}T12:00:00`);
  if (recurrence === 'diaria') d.setDate(d.getDate() + 1);
  else if (recurrence === 'semanal') d.setDate(d.getDate() + 7);
  else if (recurrence === 'mensal') d.setMonth(d.getMonth() + 1);
  else return dueDate;
  return toDateStr(d);
}

export function getPreviousDueDate(dueDate, recurrence) {
  const d = new Date(`${dueDate.slice(0, 10)}T12:00:00`);
  if (recurrence === 'diaria') d.setDate(d.getDate() - 1);
  else if (recurrence === 'semanal') d.setDate(d.getDate() - 7);
  else if (recurrence === 'mensal') d.setMonth(d.getMonth() - 1);
  else return dueDate;
  return toDateStr(d);
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
