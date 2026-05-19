import { useState } from 'react';
import { formatDisplayDate, isToday } from '../utils/dates';
import TaskItem from './TaskItem';

export default function TaskSidebar({
  selectedDate,
  tasks,
  filter,
  onFilterChange,
  onQuickAdd,
  onOpenModal,
  onToggle,
  onEdit,
  onDelete,
  onOpenTimeline,
}) {
  const [quickText, setQuickText] = useState('');

  const active = tasks.filter((t) => !t.isCompleted).length;
  const completed = tasks.filter((t) => t.isCompleted).length;

  const filtered = tasks.filter((t) => {
    if (filter === 'active') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    return true;
  });

  function handleQuickSubmit(e) {
    e.preventDefault();
    if (!quickText.trim()) return;
    onQuickAdd(quickText.trim());
    setQuickText('');
  }

  const dateLabel = formatDisplayDate(selectedDate);
  const capitalized =
    dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          {isToday(selectedDate) && <span className="badge-today">Hoje</span>}
          <button type="button" className="btn-timeline" onClick={onOpenTimeline}>
            🕐 Timeline
          </button>
        </div>
        <h2>{capitalized}</h2>
        <div className="sidebar-stats">
          <span className="pill pill-active">{active} ativas</span>
          <span className="pill pill-done">{completed} concluídas</span>
        </div>
      </div>

      <div className="sidebar-content">
        <form className="quick-add" onSubmit={handleQuickSubmit}>
          <input
            type="text"
            placeholder="Tarefa rápida... (Enter para adicionar)"
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
          />
          <button type="submit" className="btn-add" aria-label="Adicionar">
            +
          </button>
        </form>
        <button type="button" className="btn-advanced" onClick={() => onOpenModal(null)}>
          📅 + Adicionar com horário, categoria ou recorrência
        </button>

        <div className="task-filters">
          <span className="filter-icon">☰</span>
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              type="button"
              className={filter === f ? 'active' : ''}
              onClick={() => onFilterChange(f)}
            >
              {f === 'all' ? 'Todas' : f === 'active' ? 'Ativas' : 'Concluídas'}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📅</span>
            <p>Nenhuma tarefa para este dia.</p>
            <p className="empty-hint">Adicione uma tarefa acima.</p>
          </div>
        ) : (
          <ul className="task-list">
            {filtered.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
