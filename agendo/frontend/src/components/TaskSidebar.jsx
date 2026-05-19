import { useState } from 'react';
import { formatDisplayDate, isToday } from '../utils/dates';
import TaskItem from './TaskItem';

export default function TaskSidebar({
  selectedDate,
  tasks,
  filter,
  priorityFilter,
  onFilterChange,
  onPriorityFilterChange,
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
    if (filter === 'active' && t.isCompleted) return false;
    if (filter === 'completed' && !t.isCompleted) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
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
        <div className="task-filters priority-filters">
          <span className="filter-label">Prioridade:</span>
          {[
            { value: 'all', label: 'Todas' },
            { value: 'high', label: 'Alta' },
            { value: 'medium', label: 'Média' },
            { value: 'low', label: 'Baixa' },
          ].map((p) => (
            <button
              key={p.value}
              type="button"
              className={priorityFilter === p.value ? 'active' : ''}
              onClick={() => onPriorityFilterChange(p.value)}
            >
              {p.label}
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
