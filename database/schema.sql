CREATE DATABASE IF NOT EXISTS agendo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE agendo;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  icon VARCHAR(30) NOT NULL DEFAULT 'tag',
  border_color VARCHAR(20) NOT NULL DEFAULT '#94a3b8'
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  description TEXT NOT NULL,
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
);

CREATE INDEX idx_tasks_date ON tasks (task_date);
CREATE INDEX idx_tasks_completed ON tasks (is_completed);
