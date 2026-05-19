USE agendo;

INSERT INTO categories (name, slug, icon, border_color) VALUES
  ('Sem categoria', 'none', 'circle', '#94a3b8'),
  ('Atividades da Faculdade', 'faculdade', 'graduation', '#3b82f6'),
  ('Reuniões', 'reunioes', 'briefcase', '#92400e'),
  ('Pessoal', 'pessoal', 'home', '#ea580c'),
  ('Saúde e Bem-estar', 'saude', 'heart', '#16a34a')
ON DUPLICATE KEY UPDATE name = VALUES(name);
