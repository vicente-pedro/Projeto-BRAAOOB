const PRIORITY_LABELS = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
const RECURRENCE_LABELS = { diaria: 'Diária', semanal: 'Semanal', mensal: 'Mensal' };

export default function TaskCard({ task, category, done, onToggle, onEdit, onDelete }) {
  function handleDragStart(e) {
    e.dataTransfer.setData('taskId', String(task.id));
    e.dataTransfer.effectAllowed = 'move';
  }

  return (
    <div
      className={`task-card ${done ? 'task-card-done' : ''}`}
      draggable
      onDragStart={handleDragStart}
      style={{ cursor: 'grab' }}
    >
      <button className="task-check" onClick={onToggle} aria-label="Concluir tarefa">
        {done ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#22c55e">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        )}
      </button>

      <div className="task-content" onClick={onEdit}>
        <p className={`task-title ${done ? 'task-title-done' : ''}`}>{task.title}</p>
        <div className="task-meta">
          {task.dueTime && (
            <span className="task-time">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              {task.dueTime}
            </span>
          )}
          {category && (
            <span className="task-category" style={{ background: category.color + '1f', color: category.color }}>
              {category.label}
            </span>
          )}
          {task.isRecurring && task.recurrence && (
            <span className="task-recurrence">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              {RECURRENCE_LABELS[task.recurrence]}
            </span>
          )}
          {task.priority && task.priority !== 'media' && (
            <span className={`task-priority priority-${task.priority}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
          )}
        </div>
      </div>

      {/* ícone de arrastar */}
      <span className="task-drag-handle" title="Arrastar para outro dia">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
          <circle cx="9" cy="5" r="1" fill="#9ca3af"/><circle cx="15" cy="5" r="1" fill="#9ca3af"/>
          <circle cx="9" cy="12" r="1" fill="#9ca3af"/><circle cx="15" cy="12" r="1" fill="#9ca3af"/>
          <circle cx="9" cy="19" r="1" fill="#9ca3af"/><circle cx="15" cy="19" r="1" fill="#9ca3af"/>
        </svg>
      </span>

      <button className="task-delete" onClick={onDelete} aria-label="Excluir tarefa">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  );
}
