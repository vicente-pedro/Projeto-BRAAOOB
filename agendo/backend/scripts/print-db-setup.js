console.log(`
=== Configuração do MySQL (Agendo) ===

Execute na pasta agendo/database:

  mysql -u root -p < schema.sql
  mysql -u root -p < seed.sql

Se o banco já existia:

  mysql -u root -p < migration_v2_title_priority.sql

Configure backend/.env (copie de .env.example) e inicie:

  cd agendo/backend && npm run dev
`);
