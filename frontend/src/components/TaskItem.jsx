const CATEGORY_ICONS = {
  graduation: '🎓',
  briefcase: '💼',
  home: '🏠',
  heart: '❤️',
  circle: '○',
  tag: '🏷',
};

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const canDrag = task.recurrence === 'none' && !task.isCompleted;

  function handleDragStart(e) {
    if (!canDrag) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('taskId', String(task.id));
    e.dataTransfer.effectAllowed = 'move';
  }

  return (
    <li
      className={`task-item ${task.isCompleted ? 'completed' : ''}`}
      draggable={canDrag}
      onDragStart={handleDragStart}
    >
      <label className="task-check">
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={() => onToggle(task)}
        />
        <span className="checkmark" />
      </label>
      <div className="task-body">
        <p className="task-desc">{task.description}</p>
        <div className="task-meta">
          {task.startTime && <span className="task-time">🕐 {task.startTime}</span>}
          {task.category && (
            <span
              className="task-category"
              style={{ borderColor: task.category.borderColor }}
            >
              {CATEGORY_ICONS[task.category.icon] || '🏷'}{' '}
              {task.category.name}
            </span>
          )}
          {task.recurrence !== 'none' && (
            <span className="task-recurrence">↻ {task.recurrence}</span>
          )}
        </div>
      </div>
      <div className="task-actions">
        <button type="button" className="btn-icon" onClick={() => onEdit(task)} title="Editar">
          ✏️
        </button>
        <button type="button" className="btn-icon btn-danger" onClick={() => onDelete(task)} title="Excluir">
          🗑
        </button>
      </div>
    </li>
  );
}
