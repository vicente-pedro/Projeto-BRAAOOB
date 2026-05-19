import { format } from 'date-fns';
import { getWeekDays, isSameDay, isToday, toDateString, WEEKDAY_SHORT } from '../utils/dates';

export default function WeeklyCalendar({
  selectedDate,
  onSelectDate,
  monthTasks,
  onDropTask,
}) {
  const weekDays = getWeekDays(selectedDate);

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
    <section className="card weekly-card">
      <h2 className="card-label">SEMANA ATUAL — ARRASTE TAREFAS PARA MOVER</h2>
      <div className="week-row">
        {weekDays.map((day, i) => {
          const selected = isSameDay(day, selectedDate);
          const today = isToday(day);
          const dayTasks = monthTasks.filter((t) => t.taskDate === toDateString(day));

          return (
            <button
              key={day.toISOString()}
              type="button"
              className={`week-day ${selected ? 'selected' : ''} ${today ? 'is-today' : ''}`}
              onClick={() => onSelectDate(day)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, day)}
            >
              <span className="week-day-name">{WEEKDAY_SHORT[i]}</span>
              <span className="week-day-num">{format(day, 'd')}</span>
              {dayTasks.length > 0 && (
                <span className="week-dots">
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
    </section>
  );
}
