import { useEffect, useState } from 'react';

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'Sem recorrência' },
  { value: 'daily', label: 'Diária' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
];

const CATEGORY_ICONS = {
  graduation: '🎓',
  briefcase: '💼',
  home: '🏠',
  heart: '❤️',
  circle: '○',
};

export default function TaskModal({
  open,
  mode,
  task,
  categories,
  defaultDate,
  onClose,
  onSave,
}) {
  const [taskTitle, setTaskTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [taskDate, setTaskDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [recurrence, setRecurrence] = useState('none');

  useEffect(() => {
    if (!open) return;
    if (task) {
      setTaskTitle(task.title || task.description || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setTaskDate(task.taskDate);
      setStartTime(task.startTime || '');
      setCategoryId(task.categoryId || categories[0]?.id || null);
      setRecurrence(task.recurrence || 'none');
    } else {
      setTaskTitle('');
      setDescription('');
      setPriority('medium');
      setTaskDate(defaultDate);
      setStartTime('');
      setCategoryId(categories[0]?.id || null);
      setRecurrence('none');
    }
  }, [open, task, defaultDate, categories]);

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDate) return;
    onSave({
      title: taskTitle.trim(),
      description: description.trim() || null,
      priority,
      taskDate,
      startTime: startTime || null,
      categoryId: categoryId && Number(categoryId) > 1 ? categoryId : null,
      recurrence,
    });
  }

  const modalTitle = mode === 'edit' ? 'Editar Tarefa' : 'Nova Tarefa';

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="modal-header">
          <h2 id="modal-title">
            <span className="modal-icon">✏️</span> {modalTitle}
          </h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>
        <form className="modal-body" onSubmit={handleSubmit}>
          <label className="field">
            <span>Título da tarefa *</span>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
              placeholder="Ex.: Entregar trabalho de BD"
            />
          </label>
          <label className="field">
            <span>Descrição (opcional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detalhes adicionais..."
            />
          </label>
          <label className="field">
            <span>Prioridade *</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <div className="field-row">
            <label className="field">
              <span>Data *</span>
              <input
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Horário (opcional)</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>
          </div>
          <fieldset className="field">
            <legend>🏷 Categoria</legend>
            <div className="category-chips">
              {categories.map((cat) => {
                const selected =
                  categoryId === cat.id ||
                  ((!categoryId || categoryId === categories[0]?.id) &&
                    cat.slug === 'none');
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`chip ${selected ? 'selected' : ''} ${cat.slug === 'none' ? 'chip-none' : ''}`}
                    style={
                      cat.slug !== 'none'
                        ? { borderColor: cat.borderColor }
                        : undefined
                    }
                    onClick={() => setCategoryId(cat.id)}
                  >
                    {CATEGORY_ICONS[cat.icon] || '○'} {cat.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <fieldset className="field">
            <legend>↻ Recorrência</legend>
            <div className="segmented">
              {RECURRENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={recurrence === opt.value ? 'active' : ''}
                  onClick={() => setRecurrence(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>
          <footer className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {mode === 'edit' ? 'Salvar Alterações' : 'Adicionar Tarefa'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
