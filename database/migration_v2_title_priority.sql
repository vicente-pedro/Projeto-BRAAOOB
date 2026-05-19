-- Execute se o banco já existia antes da versão com título e prioridade (RF01 / RF07)
USE agendo;

ALTER TABLE tasks
  ADD COLUMN title VARCHAR(200) NOT NULL DEFAULT '' AFTER id;

ALTER TABLE tasks
  ADD COLUMN priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium' AFTER description;

UPDATE tasks SET title = LEFT(COALESCE(description, ''), 200) WHERE title = '';

CREATE INDEX idx_tasks_priority ON tasks (priority);
