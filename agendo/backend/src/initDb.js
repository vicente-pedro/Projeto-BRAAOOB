const pool = require('./db');

const CATEGORIES = [
  ['Sem categoria', 'none', 'circle', '#94a3b8'],
  ['Atividades da Faculdade', 'faculdade', 'graduation', '#3b82f6'],
  ['Reuniões', 'reunioes', 'briefcase', '#92400e'],
  ['Pessoal', 'pessoal', 'home', '#ea580c'],
  ['Saúde e Bem-estar', 'saude', 'heart', '#16a34a'],
];

async function ensureColumn(table, column, definition) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  if (Number(rows[0].c) === 0) {
    await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN ${definition}`);
  }
}

async function runIgnoreDuplicate(query, params = []) {
  try {
    await pool.query(query, params);
  } catch (err) {
    if (err.code !== 'ER_DUP_KEYNAME' && err.code !== 'ER_DUP_INDEX') throw err;
  }
}

async function initDb() {
  if (process.env.AUTO_INIT_DB === 'false') {
    console.log('AUTO_INIT_DB=false — pulando inicialização do banco');
    return;
  }

  console.log('Inicializando banco de dados (tabelas e categorias)...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(50) NOT NULL UNIQUE,
      icon VARCHAR(30) NOT NULL DEFAULT 'tag',
      border_color VARCHAR(20) NOT NULL DEFAULT '#94a3b8'
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT NULL,
      priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
      task_date DATE NOT NULL,
      start_time TIME NULL,
      category_id INT NULL,
      recurrence ENUM('none', 'daily', 'weekly', 'monthly') NOT NULL DEFAULT 'none',
      is_completed TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_task_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE SET NULL
    )
  `);

  await runIgnoreDuplicate('CREATE INDEX idx_tasks_date ON tasks (task_date)');
  await runIgnoreDuplicate('CREATE INDEX idx_tasks_completed ON tasks (is_completed)');
  await runIgnoreDuplicate('CREATE INDEX idx_tasks_priority ON tasks (priority)');

  await ensureColumn(
    'tasks',
    'title',
    "title VARCHAR(200) NOT NULL DEFAULT '' AFTER id"
  );
  await ensureColumn(
    'tasks',
    'priority',
    "priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium' AFTER description"
  );

  for (const row of CATEGORIES) {
    await pool.query(
      `INSERT INTO categories (name, slug, icon, border_color) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), icon = VALUES(icon), border_color = VALUES(border_color)`,
      row
    );
  }

  console.log('Banco pronto.');
}

module.exports = { initDb };
