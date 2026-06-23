import { pool } from './db.js';
import { todayStr } from './recurrence.js';
import {
  DEFAULT_CATEGORIES,
  slugifyCategory,
  pickCategoryColor,
} from './categories.js';

function parseCompletedDates(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

function toISODate(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function rowToTask(row) {
  return {
    ...row,
    id:               Number(row.id),
    user_id:          Number(row.user_id),
    is_recurring:     Number(row.is_recurring),
    completed_dates:  parseCompletedDates(row.completed_dates),
    due_date:         toISODate(row.due_date),
    due_time:         row.due_time         ? String(row.due_time).slice(0, 5) : null,
    recurrence_start: toISODate(row.recurrence_start),
  };
}

export const store = {

  // ── usuários ──────────────────────────────────────────────

  async getUserByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email.toLowerCase()]
    );
    return rows[0] || null;
  },

  async getUserById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async createUser({ name, email, passwordHash }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email.toLowerCase(), passwordHash]
    );
    return {
      id:            result.insertId,
      name,
      email:         email.toLowerCase(),
      password_hash: passwordHash,
      created_at:    new Date().toISOString(),
    };
  },

  // ── categorias ────────────────────────────────────────────

  async listCategories(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY label',
      [userId]
    );
    const custom = rows.map((c) => ({
      value:  c.value,
      label:  c.label,
      color:  c.color || '#6366f1',
      custom: true,
    }));
    const customValues = new Set(custom.map((c) => c.value));
    const merged = [
      ...DEFAULT_CATEGORIES.filter((c) => !customValues.has(c.value)),
      ...custom,
    ];
    return merged.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
  },

  async getCategoryLabel(userId, value) {
    const cats = await this.listCategories(userId);
    return cats.find((c) => c.value === value)?.label || value;
  },

  async getCategoryColor(userId, value) {
    const cats = await this.listCategories(userId);
    return cats.find((c) => c.value === value)?.color || '#3b82f6';
  },

  async isValidCategory(userId, value) {
    if (!value) return false;
    const cats = await this.listCategories(userId);
    return cats.some((c) => c.value === value);
  },

  async createCategory(userId, label) {
    const value = slugifyCategory(label);
    const existing = await this.listCategories(userId);
    if (existing.some((c) => c.value === value)) {
      throw new Error('Já existe uma categoria com esse nome');
    }
    const [rows] = await pool.query(
      'SELECT color FROM categories WHERE user_id = ?',
      [userId]
    );
    const usedColors = [
      ...DEFAULT_CATEGORIES.map((c) => c.color),
      ...rows.map((r) => r.color),
    ];
    const color = pickCategoryColor(usedColors);
    await pool.query(
      'INSERT INTO categories (user_id, value, label, color) VALUES (?, ?, ?, ?)',
      [userId, value, label.trim(), color]
    );
    return { value, label: label.trim(), color, custom: true };
  },

  // ── tarefas ───────────────────────────────────────────────

  async listTasks(userId, filters = {}) {
    let sql = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [userId];

    if (filters.status)   { sql += ' AND status = ?';   params.push(filters.status); }
    if (filters.priority) { sql += ' AND priority = ?'; params.push(filters.priority); }
    if (filters.category && await this.isValidCategory(userId, filters.category)) {
      sql += ' AND category = ?';
      params.push(filters.category);
    }
    if (filters.dueDate) {
      const day = filters.dueDate.slice(0, 10);
      sql += ` AND (
        (is_recurring = 0 AND due_date = ?) OR
        (is_recurring = 1 AND recurrence_start <= ? AND due_date >= ?)
      )`;
      params.push(day, day, day);
    }
    if (filters.search) {
      sql += ' AND (title LIKE ? OR description LIKE ?)';
      const term = `%${filters.search}%`;
      params.push(term, term);
    }

    const [rows] = await pool.query(sql, params);
    const tasks = rows.map(rowToTask);

    const priorityOrder = { alta: 0, media: 1, baixa: 2 };
    tasks.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'pendente' ? -1 : 1;
      if (priorityOrder[a.priority] !== priorityOrder[b.priority])
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      const aDate = a.recurrence_start || a.due_date;
      const bDate = b.recurrence_start || b.due_date;
      if (aDate && bDate) return aDate.localeCompare(bDate);
      if (aDate) return -1;
      if (bDate) return 1;
      return b.created_at > a.created_at ? 1 : -1;
    });

    return tasks;
  },

  async getTask(id, userId) {
    const [rows] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ? LIMIT 1',
      [Number(id), userId]
    );
    return rows[0] ? rowToTask(rows[0]) : null;
  },

  async createTask(userId, fields) {
    const category =
      fields.category && (await this.isValidCategory(userId, fields.category))
        ? fields.category
        : 'pessoal';

    const isRecurring = Boolean(fields.isRecurring && fields.recurrence);
    let dueDate = fields.dueDate || todayStr();
    let recurrenceStart = fields.recurrenceStart || null;

    if (isRecurring) {
      recurrenceStart = (recurrenceStart || dueDate || todayStr()).slice(0, 10);
      dueDate = (fields.dueDate || recurrenceStart).slice(0, 10);
      if (dueDate < recurrenceStart) [dueDate, recurrenceStart] = [recurrenceStart, dueDate];
    }

    const [result] = await pool.query(
      `INSERT INTO tasks
        (user_id, title, description, priority, category, status,
         due_date, due_time, recurrence_start, is_recurring, recurrence, completed_dates)
       VALUES (?, ?, ?, ?, ?, 'pendente', ?, ?, ?, ?, ?, JSON_ARRAY())`,
      [
        userId,
        fields.title,
        fields.description || '',
        fields.priority || 'media',
        category,
        dueDate || null,
        fields.dueTime || null,
        isRecurring ? recurrenceStart : null,
        isRecurring ? 1 : 0,
        isRecurring ? fields.recurrence : null,
      ]
    );
    return this.getTask(result.insertId, userId);
  },

  async updateTask(id, userId, fields) {
    const task = await this.getTask(id, userId);
    if (!task) return null;

    const isRecurring =
      fields.isRecurring !== undefined
        ? Boolean(fields.isRecurring && fields.recurrence)
        : Boolean(task.is_recurring && task.recurrence);

    let dueDate         = fields.dueDate         !== undefined ? fields.dueDate         : task.due_date;
    let recurrenceStart = fields.recurrenceStart !== undefined ? fields.recurrenceStart : task.recurrence_start;
    const recurrence    = fields.recurrence      !== undefined ? fields.recurrence      : task.recurrence;
    const dueTime       = fields.dueTime         !== undefined ? fields.dueTime         : task.due_time;

    if (isRecurring && recurrenceStart && dueDate && dueDate < recurrenceStart)
      [dueDate, recurrenceStart] = [recurrenceStart, dueDate];
    if (!isRecurring) recurrenceStart = null;

    const category = fields.category !== undefined ? fields.category : task.category;
    if (fields.category && !(await this.isValidCategory(userId, fields.category))) return null;

    await pool.query(
      `UPDATE tasks SET
        title            = ?,
        description      = ?,
        priority         = ?,
        category         = ?,
        status           = ?,
        due_date         = ?,
        due_time         = ?,
        recurrence_start = ?,
        is_recurring     = ?,
        recurrence       = ?
       WHERE id = ? AND user_id = ?`,
      [
        fields.title       !== undefined ? fields.title       : task.title,
        fields.description !== undefined ? fields.description : task.description,
        fields.priority    !== undefined ? fields.priority    : task.priority,
        category,
        fields.status      !== undefined ? fields.status      : task.status,
        dueDate  || null,
        dueTime  || null,
        recurrenceStart || null,
        isRecurring ? 1 : 0,
        isRecurring ? recurrence : null,
        Number(id),
        userId,
      ]
    );
    return this.getTask(id, userId);
  },

  async toggleCompleteOnDate(id, userId, dateStr) {
    const task = await this.getTask(id, userId);
    if (!task) return null;

    const day   = dateStr?.slice(0, 10);
    if (!day) return null;

    const dates = Array.isArray(task.completed_dates) ? [...task.completed_dates] : [];
    const idx   = dates.indexOf(day);
    if (idx >= 0) dates.splice(idx, 1);
    else          dates.push(day), dates.sort();

    let newStatus = task.status;
    if (!task.is_recurring || !task.recurrence) {
      if (task.due_date?.slice(0, 10) === day)
        newStatus = dates.includes(day) ? 'concluida' : 'pendente';
    } else {
      const lastDay = task.due_date?.slice(0, 10);
      newStatus = dates.includes(lastDay) ? 'concluida' : 'pendente';
    }

    await pool.query(
      'UPDATE tasks SET completed_dates = ?, status = ? WHERE id = ? AND user_id = ?',
      [JSON.stringify(dates), newStatus, Number(id), userId]
    );
    return this.getTask(id, userId);
  },

  async deleteTask(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [Number(id), userId]
    );
    return result.affectedRows > 0;
  },

  async getStats(userId) {
    const [rows] = await pool.query(
      `SELECT
         COUNT(*)                                        AS total,
         SUM(status = 'pendente')                        AS pendente,
         SUM(status = 'concluida')                       AS concluida
       FROM tasks WHERE user_id = ?`,
      [userId]
    );
    const { total, pendente, concluida } = rows[0];
    const t = Number(total), p = Number(pendente), c = Number(concluida);
    return { total: t, pendente: p, concluida: c, progress: t ? Math.round((c / t) * 100) : 0 };
  },

  isCompletedOnDate(task, dateStr) {
    const dates = parseCompletedDates(task.completed_dates);
    const day   = dateStr.slice(0, 10);
    if (dates.includes(day)) return true;
    if (!task.is_recurring && task.status === 'concluida' && task.due_date?.slice(0, 10) === day) return true;
    return false;
  },

  runMigrations() { /* não necessário no MySQL */ },
};
