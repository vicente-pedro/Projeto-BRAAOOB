import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  getDay,
  addDays,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export { format, parseISO, isSameDay, isToday, addMonths, subMonths };

export function toDateString(date) {
  return format(date, 'yyyy-MM-dd');
}

export function formatDisplayDate(date) {
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function formatHeaderDate(date) {
  const label = format(date, "d 'de' MMMM", { locale: ptBR });
  if (isToday(date)) return `Hoje, ${label}`;
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function formatMonthYear(date) {
  const str = format(date, 'MMMM yyyy', { locale: ptBR });
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getWeekDays(date) {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

export function getCalendarDays(date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = addDays(monthStart, -getDay(monthStart));
  const gridEnd = addDays(monthEnd, 6 - getDay(monthEnd));

  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
