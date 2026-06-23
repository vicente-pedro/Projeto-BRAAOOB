import { todayISO } from '../utils/date.js';

const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function pad(n) { return String(n).padStart(2, '0'); }
function toISO(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

export default function CalendarDayPanel({ selectedDate, onSelectDate, taskDatesSet }) {
  const today = todayISO();
  const selected = new Date(`${selectedDate}T12:00:00`);

  const sunday = new Date(selected);
  sunday.setDate(selected.getDate() - selected.getDay());

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });

  return (
    <div className="week-strip-card">
      <p className="week-strip-label">SEMANA ATUAL — SELECIONE UM DIA</p>
      <div className="week-strip-row">
        {days.map((d) => {
          const iso = toISO(d);
          const isSelected = iso === selectedDate;
          const isToday = iso === today;
          const hasTask = taskDatesSet.has(iso);

          return (
            <button
              key={iso}
              className={[
                'week-day-btn',
                isSelected ? 'week-day-selected' : '',
                isToday && !isSelected ? 'week-day-today' : '',
              ].join(' ')}
              onClick={() => onSelectDate(iso)}
            >
              <span className="week-day-name">{WEEKDAYS_SHORT[d.getDay()]}</span>
              <span className="week-day-number">{d.getDate()}</span>
              {hasTask && <span className="week-day-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
