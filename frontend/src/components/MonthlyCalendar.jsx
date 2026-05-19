import { format, isSameDay, isSameMonth, isToday } from 'date-fns';
import {
  getCalendarDays,
  formatMonthYear,
  toDateString,
  WEEKDAY_SHORT,
} from '../utils/dates';

export default function MonthlyCalendar({
  viewDate,
  selectedDate,
  monthTasks,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onDropTask,
}) {
  const days = getCalendarDays(viewDate);

  function tasksForDay(day) {
    return monthTasks.filter((t) => t.taskDate === toDateString(day));
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }

  function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  function handleDrop(e, day) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId && onDropTask) {
      onDropTask(Number(taskId), toDateString(day));
    }
  }

  return (
    <section className="card monthly-card">
      <div className="month-nav">
        <button type="button" className="nav-arrow" onClick={onPrevMonth} aria-label="Mês anterior">
          ‹
        </button>
        <h2>{formatMonthYear(viewDate)}</h2>
        <button type="button" className="nav-arrow" onClick={onNextMonth} aria-label="Próximo mês">
          ›
        </button>
      </div>
      <div className="month-weekdays">
        {WEEKDAY_SHORT.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="month-grid">
        {days.map((day) => {
          const inMonth = isSameMonth(day, viewDate);
          const selected = isSameDay(day, selectedDate);
          const today = isToday(day);
          const dayTasks = tasksForDay(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              className={`month-day ${!inMonth ? 'other-month' : ''} ${selected ? 'selected' : ''} ${today ? 'is-today' : ''}`}
              onClick={() => onSelectDate(day)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, day)}
            >
              <span>{format(day, 'd')}</span>
              {dayTasks.length > 0 && (
                <span className="month-dots">
                  {dayTasks.some((t) => !t.isCompleted) && (
                    <span className="dot dot-active" />
                  )}
                  {dayTasks.some((t) => t.isCompleted) && (
                    <span className="dot dot-done" />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="month-legend">
        <span>
          <span className="dot dot-active" /> Ativas
        </span>
        <span>
          <span className="dot dot-done" /> Concluídas
        </span>
        <span className="legend-today">☐ Hoje</span>
      </div>
    </section>
  );
}
