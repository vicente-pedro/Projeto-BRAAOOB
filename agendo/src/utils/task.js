import { occursOnDate } from './date';

export function normalizeDate(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

function getTaskDueDate(task) {
  // compat: alguns fluxos podem trazer dueDate ou due_date
  return task.dueDate ?? task.due_date ?? null;
}

function getTaskRecurrenceStart(task) {
  return task.recurrenceStart ?? task.recurrence_start ?? getTaskDueDate(task);
}

export function taskShowsOnDate(task, dateStr) {
  const day = normalizeDate(dateStr);
  if (!day) return false;

  const due = normalizeDate(getTaskDueDate(task));

  // Mostrar no dia se a data de vencimento bater
  if (due && due === day) return true;

  // Mostrar no dia se estiver concluída no dia via completedDates (fallback)
  if (task.completedDates?.includes(day)) return true;

  // Recorrência: só dá match se conseguir calcular intervalo
  if (task.isRecurring && task.recurrence) {
    const start = normalizeDate(getTaskRecurrenceStart(task));
    const end = due;
    if (!start || !end) return false;
    return occursOnDate(start, task.recurrence, dateStr, end);
  }

  // concluídas cujo devido bate
  if (!task.isRecurring && task.status === 'concluida' && due === day) return true;

  return false;
}



export function isTaskDoneOnDate(task, dateStr) {
  const day = normalizeDate(dateStr);
  if (!day) return false;

  if (task.completedDates?.includes(day)) return true;

  const due = normalizeDate(getTaskDueDate(task));

  if (!task.isRecurring && task.status === 'concluida' && due === day) {
    return true;
  }

  return false;
}


export function getTasksForDate(tasks, dateStr) {
  return tasks.filter((t) => taskShowsOnDate(t, dateStr));
}
