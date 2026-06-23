-- =============================================================
--  Agendo — Schema MySQL
--  Execute: mysql -u root -p < database/schema.sql
-- =============================================================

CREATE DATABASE IF NOT EXISTS agendo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE agendo;

-- -------------------------------------------------------------
-- Usuários
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Categorias customizadas por usuário
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  value      VARCHAR(100) NOT NULL,
  label      VARCHAR(100) NOT NULL,
  color      VARCHAR(20)  NOT NULL DEFAULT '#6366f1',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_category (user_id, value),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Tarefas
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          INT UNSIGNED NOT NULL,
  title            VARCHAR(255) NOT NULL,
  description      TEXT,
  priority         ENUM('baixa','media','alta')  NOT NULL DEFAULT 'media',
  category         VARCHAR(100)                  NOT NULL DEFAULT 'pessoal',
  status           ENUM('pendente','concluida')  NOT NULL DEFAULT 'pendente',
  due_date         DATE,
  due_time         TIME         NULL,
  recurrence_start DATE,
  is_recurring     TINYINT(1)                    NOT NULL DEFAULT 0,
  recurrence       ENUM('diaria','semanal','mensal'),
  completed_dates  JSON                          NOT NULL DEFAULT (JSON_ARRAY()),
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Histórico de conclusão
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historico_conclusao (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  task_id        INT UNSIGNED NOT NULL,
  data_conclusao DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =============================================================
--  VIEW — Detalhes de tarefas
-- =============================================================
CREATE OR REPLACE VIEW vw_detalhes_tarefas AS
SELECT
    t.id                                                        AS tarefa_id,
    t.title                                                     AS titulo,
    t.description                                               AS descricao,
    t.due_date                                                  AS data,
    t.due_time                                                  AS horario,
    t.status,
    t.priority                                                  AS prioridade,
    t.is_recurring                                              AS recorrente,
    t.recurrence                                                AS tipo_recorrencia,
    t.recurrence_start                                          AS inicio_recorrencia,
    CASE
        WHEN t.status = 'pendente' AND t.due_date < CURDATE() THEN TRUE
        ELSE FALSE
    END                                                         AS atrasada,
    CASE DAYOFWEEK(t.due_date)
        WHEN 1 THEN 'Domingo'
        WHEN 2 THEN 'Segunda-feira'
        WHEN 3 THEN 'Terça-feira'
        WHEN 4 THEN 'Quarta-feira'
        WHEN 5 THEN 'Quinta-feira'
        WHEN 6 THEN 'Sexta-feira'
        WHEN 7 THEN 'Sábado'
    END                                                         AS dia_semana,
    t.category                                                  AS categoria_slug,
    c.label                                                     AS categoria_nome,
    c.color                                                     AS categoria_cor,
    u.name                                                      AS usuario_nome,
    u.email                                                     AS usuario_email
FROM tasks t
LEFT JOIN categories c ON c.value = t.category AND c.user_id = t.user_id
LEFT JOIN users u      ON u.id = t.user_id;


-- =============================================================
--  TRIGGERS
-- =============================================================

DELIMITER $$

CREATE TRIGGER tg_registrar_historico_conclusao
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    IF OLD.status = 'pendente' AND NEW.status = 'concluida' THEN
        INSERT INTO historico_conclusao (task_id) VALUES (NEW.id);
    END IF;
END$$


-- =============================================================
--  STORED PROCEDURES
-- =============================================================

CREATE PROCEDURE sp_concluir_tarefa(IN p_task_id INT)
BEGIN
    UPDATE tasks
    SET status = 'concluida'
    WHERE id = p_task_id;
END$$

CREATE PROCEDURE sp_stats_usuario(IN p_user_id INT)
BEGIN
    SELECT
        COUNT(*)                                                    AS total_tarefas,
        SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END)      AS tarefas_concluidas,
        SUM(CASE WHEN status = 'pendente'  THEN 1 ELSE 0 END)      AS tarefas_pendentes,
        ROUND(
          SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END)
          / COUNT(*) * 100, 2
        )                                                           AS porcentagem_conclusao
    FROM tasks
    WHERE user_id = p_user_id;
END$$

DELIMITER ;
