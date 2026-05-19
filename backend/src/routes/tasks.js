const express = require('express');
const pool = require('../db');

const router = express.Router();

const TASK_SELECT = `
  SELECT
    t.id,
    t.title,
    t.description,
    t.priority,
    DATE_FORMAT(t.task_date, '%Y-%m-%d') AS taskDate,
    TIME_FORMAT(t.start_time, '%H:%i') AS startTime,
    t.category_id AS categoryId,
    t.recurrence,
    t.is_completed AS isCompleted,
    c.name AS categoryName,
    c.slug AS categorySlug,
    c.icon AS categoryIcon,
    c.border_color AS categoryBorderColor
  FROM tasks t
  LEFT JOIN categories c ON c.id = t.category_id
`;

function normalizeTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    taskDate: row.taskDate,
    startTime: row.startTime,
    categoryId: row.categoryId,
    recurrence: row.recurrence,
    isCompleted: Boolean(row.isCompleted),
    category: row.categoryId
      ? {
          id: row.categoryId,
          name: row.categoryName,
          slug: row.categorySlug,
          icon: row.categoryIcon,
          borderColor: row.categoryBorderColor,
        }
      : null,
  };
}

function buildWhere(filters) {
  const clauses = [];
  const params = [];

  if (filters.date) {
    clauses.push('t.task_date = ?');
    params.push(filters.date);
  } else if (filters.start && filters.end) {
    clauses.push('t.task_date BETWEEN ? AND ?');
    params.push(filters.start, filters.end);
  }

  if (filters.status === 'active') {
    clauses.push('t.is_completed = 0');
  } else if (filters.status === 'completed') {
    clauses.push('t.is_completed = 1');
  }

  if (filters.priority) {
    clauses.push('t.priority = ?');
    params.push(filters.priority);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
}

router.get('/', async (req, res) => {
  const { date, start, end, year, month, status, priority } = req.query;

  try {
    if (date) {
      const { where, params } = buildWhere({ date, status, priority });
      const [rows] = await pool.query(
        `${TASK_SELECT} ${where} ORDER BY t.is_completed, t.priority DESC, t.start_time, t.id`,
        params
      );
      return res.json(rows.map(normalizeTask));
    }

    if (year && month) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(Number(year), Number(month), 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
      const { where, params } = buildWhere({ start: startDate, end: endDate, status, priority });
      const [rows] = await pool.query(
        `${TASK_SELECT} ${where} ORDER BY t.task_date, t.start_time`,
        params
      );
      return res.json(rows.map(normalizeTask));
    }

    if (start && end) {
      const { where, params } = buildWhere({ start, end, status, priority });
      const [rows] = await pool.query(
        `${TASK_SELECT} ${where} ORDER BY t.task_date, t.start_time`,
        params
      );
      return res.json(rows.map(normalizeTask));
    }

    res.status(400).json({ error: 'Informe date ou year/month ou start/end' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
});

router.get('/stats', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN is_completed = 0 THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) AS completed
      FROM tasks`
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

router.post('/', async (req, res) => {
  const { title, description, taskDate, startTime, categoryId, recurrence, priority } =
    req.body;

  const taskTitle = (title || description || '').trim();
  if (!taskTitle || !taskDate) {
    return res.status(400).json({ error: 'Título e data são obrigatórios' });
  }

  try {
    const catId = categoryId && Number(categoryId) > 1 ? categoryId : null;
    const [result] = await pool.query(
      `INSERT INTO tasks (title, description, priority, task_date, start_time, category_id, recurrence)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        taskTitle,
        description?.trim() || null,
        priority || 'medium',
        taskDate,
        startTime || null,
        catId,
        recurrence || 'none',
      ]
    );

    const [rows] = await pool.query(`${TASK_SELECT} WHERE t.id = ?`, [result.insertId]);
    res.status(201).json(normalizeTask(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    taskDate,
    startTime,
    categoryId,
    recurrence,
    priority,
    isCompleted,
  } = req.body;

  try {
    const catId = categoryId && Number(categoryId) > 1 ? categoryId : null;
    await pool.query(
      `UPDATE tasks SET
        title = COALESCE(?, title),
        description = ?,
        priority = COALESCE(?, priority),
        task_date = COALESCE(?, task_date),
        start_time = ?,
        category_id = ?,
        recurrence = COALESCE(?, recurrence),
        is_completed = COALESCE(?, is_completed)
      WHERE id = ?`,
      [
        title?.trim(),
        description?.trim() || null,
        priority,
        taskDate,
        startTime || null,
        catId,
        recurrence,
        isCompleted !== undefined ? (isCompleted ? 1 : 0) : null,
        id,
      ]
    );

    const [rows] = await pool.query(`${TASK_SELECT} WHERE t.id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json(normalizeTask(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { isCompleted, taskDate } = req.body;

  try {
    if (isCompleted !== undefined) {
      await pool.query('UPDATE tasks SET is_completed = ? WHERE id = ?', [
        isCompleted ? 1 : 0,
        id,
      ]);
    }
    if (taskDate) {
      const [task] = await pool.query('SELECT recurrence FROM tasks WHERE id = ?', [id]);
      if (!task.length) return res.status(404).json({ error: 'Tarefa não encontrada' });
      if (task[0].recurrence !== 'none') {
        return res.status(400).json({ error: 'Tarefas recorrentes não podem ser movidas' });
      }
      await pool.query('UPDATE tasks SET task_date = ? WHERE id = ?', [taskDate, id]);
    }

    const [rows] = await pool.query(`${TASK_SELECT} WHERE t.id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json(normalizeTask(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir tarefa' });
  }
});

module.exports = router;
