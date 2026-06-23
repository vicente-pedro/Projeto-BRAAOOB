import { useMemo, useState, useCallback } from 'react';
import { todayISO, occursOnDate } from '../utils/date.js';

const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function pad(n) { return String(n).padStart(2, '0'); }
function toISO(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

export default function CalendarView({
  viewDate, selectedDate, onSelectDate, onChangeMonth,
  taskDatesSet, completedDatesSet, tasks = [], onDropTask,
}) {
  const today = todayISO();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const [dragOverDate, setDragOverDate] = useState(null);

  const weeks = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];
    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, outside: true, iso: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, outside: false, iso: toISO(year, month, d) });
    }
    while (cells.length % 7 !== 0) {
      const day = cells.length - (startOffset + daysInMonth) + 1;
      cells.push({ day, outside: true, iso: null });
    }

    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [year, month]);

  // Calcula quais dias têm tarefas (incluindo recorrências)
  const recurringDatesSet = useMemo(() => {
    const set = new Set();
    const firstOfMonth = toISO(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const lastOfMonth = toISO(year, month, daysInMonth);

    tasks.forEach((task) => {
      if (task.isRecurring && task.recurrence && task.recurrenceStart && task.dueDate) {
        // Itera pelos dias do mês visível
        for (let d = 1; d <= daysInMonth; d++) {
          const iso = toISO(year, month, d);
          if (occursOnDate(task.recurrenceStart, task.recurrence, iso, task.dueDate)) {
            set.add(iso);
          }
        }
      } else if (task.dueDate) {
        set.add(task.dueDate.slice(0, 10));
      }
    });
    return set;
  }, [tasks, year, month]);

  const handleDragOver = useCallback((e, iso) => {
    e.preventDefault();
    setDragOverDate(iso);
  }, []);

  const handleDrop = useCallback((e, iso) => {
    e.preventDefault();
    setDragOverDate(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId && iso && onDropTask) {
      onDropTask(Number(taskId), iso);
    }
  }, [onDropTask]);

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <button className="calendar-nav" onClick={() => onChangeMonth(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="calendar-title">{MONTH_NAMES[month]} {year}</span>
        <button className="calendar-nav" onClick={() => onChangeMonth(1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <div className="calendar-grid calendar-weekday-row">
        {WEEKDAYS_SHORT.map((d) => <span key={d}>{d}</span>)}
      </div>

      {weeks.map((week, wi) => (
        <div className="calendar-grid" key={wi}>
          {week.map((cell, ci) => {
            const hasTask = cell.iso && recurringDatesSet.has(cell.iso);
            const allDone = cell.iso && completedDatesSet.has(cell.iso);
            const isToday = cell.iso === today;
            const isSelected = cell.iso === selectedDate;
            const isDragOver = cell.iso && cell.iso === dragOverDate;

            return (
              <button
                key={ci}
                disabled={cell.outside}
                className={[
                  'calendar-day',
                  cell.outside ? 'calendar-day-outside' : '',
                  isSelected ? 'calendar-day-selected' : '',
                  isToday && !isSelected ? 'calendar-day-today' : '',
                  isDragOver ? 'calendar-day-dragover' : '',
                ].join(' ')}
                onClick={() => cell.iso && onSelectDate(cell.iso)}
                onDragOver={(e) => !cell.outside && handleDragOver(e, cell.iso)}
                onDragLeave={() => setDragOverDate(null)}
                onDrop={(e) => !cell.outside && handleDrop(e, cell.iso)}
              >
                {cell.day}
                {hasTask && !cell.outside && (
                  <span className={`calendar-dot ${allDone ? 'calendar-dot-done' : 'calendar-dot-pending'}`} />
                )}
              </button>
            );
          })}
        </div>
      ))}

      <div className="calendar-legend">
        <span><i className="legend-dot legend-dot-pending" /> Ativas</span>
        <span><i className="legend-dot legend-dot-done" /> Concluídas</span>
        <span className="legend-today">Hoje</span>
      </div>
    </div>
  );
}
