import { Router } from 'express';
import { store } from '../store.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

const VALID_PRIORITIES = ['baixa', 'media', 'alta'];
const VALID_STATUSES   = ['pendente', 'concluida'];

function mapTask(row) {
  return {
    id:              row.id,
    title:           row.title,
    description:     row.description,
    priority:        row.priority,
    category:        row.category,
    status:          row.status,
    dueDate:         row.due_date,
    dueTime:         row.due_time ?? null,
    recurrenceStart: row.recurrence_start ?? null,
    isRecurring:     Boolean(row.is_recurring),
    recurrence:      row.recurrence,
    completedDates:  Array.isArray(row.completed_dates) ? row.completed_dates : [],
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

router.get('/', async (req, res) => {
  const { status, priority, category, dueDate, search } = req.query;
  const filters = {};
  if (status   && VALID_STATUSES.includes(status))     filters.status   = status;
  if (priority && VALID_PRIORITIES.includes(priority)) filters.priority = priority;
  if (category && await store.isValidCategory(req.userId, category)) filters.category = category;
  if (dueDate)         filters.dueDate = dueDate;
  if (search?.trim())  filters.search  = search.trim();

  try {
    const tasks = await store.listTasks(req.userId, filters);
    res.json(tasks.map(mapTask));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    res.json(await store.getStats(req.userId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const task = await store.getTask(req.params.id, req.userId);
    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json(mapTask(task));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { title, description, priority, category, dueDate, dueTime, recurrenceStart, isRecurring, recurrence } = req.body;

  if (!title?.trim()) return res.status(400).json({ error: 'Título é obrigatório' });
  if (priority  && !VALID_PRIORITIES.includes(priority)) return res.status(400).json({ error: 'Prioridade inválida' });
  if (category  && !(await store.isValidCategory(req.userId, category))) return res.status(400).json({ error: 'Categoria inválida' });
  if (isRecurring && recurrence && dueDate && recurrenceStart && dueDate < recurrenceStart) {
    return res.status(400).json({ error: 'O prazo final deve ser igual ou posterior à data de início' });
  }

  try {
    const task = await store.createTask(req.userId, {
      title: title.trim(),
      description: description?.trim() || '',
      priority:    priority  || 'media',
      category:    category  || 'pessoal',
      dueDate:     dueDate   || null,
      dueTime:     dueTime   || null,
      recurrenceStart: recurrenceStart || null,
      isRecurring: Boolean(isRecurring),
      recurrence:  recurrence || null,
    });
    res.status(201).json(mapTask(task));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await store.getTask(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ error: 'Tarefa não encontrada' });

    const { title, description, priority, category, status, dueDate, dueTime, recurrenceStart, isRecurring, recurrence } = req.body;

    if (priority && !VALID_PRIORITIES.includes(priority)) return res.status(400).json({ error: 'Prioridade inválida' });
    if (category && !(await store.isValidCategory(req.userId, category))) return res.status(400).json({ error: 'Categoria inválida' });
    if (status   && !VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Status inválido' });

    const task = await store.updateTask(req.params.id, req.userId, {
      title:           title?.trim()       ?? existing.title,
      description:     description !== undefined ? description.trim() : existing.description,
      priority:        priority             ?? existing.priority,
      category:        category             ?? existing.category,
      status:          status               ?? existing.status,
      dueDate:         dueDate    !== undefined ? dueDate || null : existing.due_date,
      dueTime:         dueTime    !== undefined ? dueTime || null : existing.due_time,
      recurrenceStart: recurrenceStart !== undefined ? recurrenceStart : existing.recurrence_start,
      isRecurring:     isRecurring !== undefined ? Boolean(isRecurring) : Boolean(existing.is_recurring),
      recurrence:      recurrence  !== undefined ? recurrence : existing.recurrence,
    });

    if (!task) return res.status(400).json({ error: 'Categoria inválida' });
    res.json(mapTask(task));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/complete-day', async (req, res) => {
  const { date } = req.body;
  if (!date?.slice(0, 10)) return res.status(400).json({ error: 'Data é obrigatória' });

  try {
    const task = await store.toggleCompleteOnDate(req.params.id, req.userId, date);
    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json(mapTask(task));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/complete', async (req, res) => {
  try {
    const existing = await store.getTask(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ error: 'Tarefa não encontrada' });

    const newStatus = existing.status === 'concluida' ? 'pendente' : 'concluida';
    const task = await store.updateTask(req.params.id, req.userId, { status: newStatus });
    res.json(mapTask(task));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await store.deleteTask(req.params.id, req.userId);
    if (!deleted) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
