import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { todayISO } from '../utils/date.js';

const RECURRENCE_OPTIONS = [
  { value: null, label: 'Sem recorrência' },
  { value: 'diaria', label: 'Diária' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensal', label: 'Mensal' },
];

export default function TaskModal({ open, onClose, onSaved, initialDate, task = null }) {
  const isEditing = Boolean(task);

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(initialDate || todayISO());
  const [recurrenceEnd, setRecurrenceEnd] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [category, setCategory] = useState('pessoal');
  const [recurrence, setRecurrence] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    api.listCategories().then(setCategories).catch(() => {});

    if (task) {
      setTitle(task.title || '');
      setDueDate(task.isRecurring ? (task.recurrenceStart || todayISO()) : (task.dueDate || todayISO()));
      setRecurrenceEnd(task.isRecurring ? (task.dueDate || '') : '');
      setDueTime(task.dueTime || '');
      setCategory(task.category || 'pessoal');
      setRecurrence(task.isRecurring ? task.recurrence : null);
    } else {
      setTitle('');
      setDueDate(initialDate || todayISO());
      setRecurrenceEnd('');
      setDueTime('');
      setCategory('pessoal');
      setRecurrence(null);
    }
    setError('');
    setShowNewCategory(false);
    setNewCategoryLabel('');
  }, [open, task, initialDate]);

  if (!open) return null;

  async function handleCreateCategory() {
    if (!newCategoryLabel.trim()) return;
    try {
      const created = await api.createCategory(newCategoryLabel.trim());
      setCategories((prev) => [...prev, created]);
      setCategory(created.value);
      setShowNewCategory(false);
      setNewCategoryLabel('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Descreva a tarefa');
      return;
    }

    if (recurrence && recurrenceEnd && recurrenceEnd < dueDate) {
      setError('A data de fim deve ser igual ou posterior à data de início');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      title: title.trim(),
      dueDate: recurrence ? (recurrenceEnd || dueDate) : dueDate,
      dueTime: dueTime || null,
      category,
      isRecurring: Boolean(recurrence),
      recurrence: recurrence || null,
      recurrenceStart: recurrence ? dueDate : null,
    };

    try {
      if (isEditing) {
        await api.updateTask(task.id, payload);
      } else {
        await api.createTask(payload);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {isEditing ? 'Editar Tarefa' : 'Adicionar Tarefa'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && <div className="auth-error" style={{ margin: '0 24px 12px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Descrição da tarefa</label>
              <input
                type="text"
                placeholder="O que precisa ser feito?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="modal-input"
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>📅 {recurrence ? 'Data de início *' : 'Data *'}</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="modal-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>🕒 Horário (opcional)</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="modal-input"
                />
              </div>
            </div>

            {recurrence && (
              <div className="form-group">
                <label>📅 Data de fim da recorrência *</label>
                <input
                  type="date"
                  value={recurrenceEnd}
                  min={dueDate}
                  onChange={(e) => setRecurrenceEnd(e.target.value)}
                  className="modal-input"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>🏷️ Categoria</label>
              <div className="chip-row">
                <button
                  type="button"
                  className={`chip ${category === 'pessoal' ? 'chip-active' : ''}`}
                  onClick={() => setCategory('pessoal')}
                  style={category === 'pessoal' ? { background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' } : {}}
                >
                  Sem categoria
                </button>
                {categories.filter((c) => c.value !== 'pessoal').map((c) => (
                  <button
                    type="button"
                    key={c.value}
                    className="chip"
                    onClick={() => setCategory(c.value)}
                    style={
                      category === c.value
                        ? { background: c.color, color: '#fff', borderColor: c.color }
                        : { color: c.color, borderColor: c.color + '55' }
                    }
                  >
                    {c.label}
                  </button>
                ))}
                <button
                  type="button"
                  className="chip chip-add"
                  onClick={() => setShowNewCategory((v) => !v)}
                >
                  + Nova
                </button>
              </div>

              {showNewCategory && (
                <div className="new-category-row">
                  <input
                    type="text"
                    placeholder="Nome da categoria"
                    value={newCategoryLabel}
                    onChange={(e) => setNewCategoryLabel(e.target.value)}
                    className="modal-input"
                  />
                  <button type="button" className="btn-secondary" onClick={handleCreateCategory}>
                    Criar
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>🔁 Recorrência</label>
              <div className="chip-row">
                {RECURRENCE_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.label}
                    className={`chip ${recurrence === opt.value ? 'chip-active-blue' : ''}`}
                    onClick={() => { setRecurrence(opt.value); setRecurrenceEnd(''); }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} disabled={saving}>
              {saving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Adicionar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
