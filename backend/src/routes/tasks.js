const express = require('express');
const pool = require('../db');

const router = express.Router();

const TASK_SELECT = `
  SELECT
    t.id,
    t.description,
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
    description: row.description,
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

router.get('/', async (req, res) => {
  const { date, start, end, year, month } = req.query;

  try {
    if (date) {
      const [rows] = await pool.query(
        `${TASK_SELECT} WHERE t.task_date = ? ORDER BY t.is_completed, t.start_time, t.id`,
        [date]
      );
      return res.json(rows.map(normalizeTask));
    }

    if (year && month) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(Number(year), Number(month), 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

      const [rows] = await pool.query(
        `${TASK_SELECT} WHERE t.task_date BETWEEN ? AND ? ORDER BY t.task_date, t.start_time`,
        [startDate, endDate]
      );
      return res.json(rows.map(normalizeTask));
    }

    if (start && end) {
      const [rows] = await pool.query(
        `${TASK_SELECT} WHERE t.task_date BETWEEN ? AND ? ORDER BY t.task_date, t.start_time`,
        [start, end]
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
  const { description, taskDate, startTime, categoryId, recurrence } = req.body;

  if (!description?.trim() || !taskDate) {
    return res.status(400).json({ error: 'Descrição e data são obrigatórias' });
  }

  try {
    const catId = categoryId && Number(categoryId) > 1 ? categoryId : null;
    const [result] = await pool.query(
      `INSERT INTO tasks (description, task_date, start_time, category_id, recurrence)
       VALUES (?, ?, ?, ?, ?)`,
      [
        description.trim(),
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
  const { description, taskDate, startTime, categoryId, recurrence, isCompleted } = req.body;

  try {
    const catId = categoryId && Number(categoryId) > 1 ? categoryId : null;
    await pool.query(
      `UPDATE tasks SET
        description = COALESCE(?, description),
        task_date = COALESCE(?, task_date),
        start_time = ?,
        category_id = ?,
        recurrence = COALESCE(?, recurrence),
        is_completed = COALESCE(?, is_completed)
      WHERE id = ?`,
      [
        description?.trim(),
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
