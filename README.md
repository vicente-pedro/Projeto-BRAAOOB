# Agendo — Gerenciador de Tarefas

Sistema de gerenciamento de tarefas com calendário semanal/mensal, categorias, recorrência e timeline — inspirado no layout das referências do projeto.

## Stack

| Camada    | Tecnologia              |
|-----------|-------------------------|
| Frontend  | React + Vite + CSS      |
| Backend   | Node.js + Express       |
| Banco     | MySQL                   |

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [MySQL](https://www.mysql.com/) 8+ (ou MariaDB)

## 1. Banco de dados

No MySQL, execute os scripts na ordem:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Isso cria o banco `agendo`, as tabelas e as categorias padrão.

## 2. Backend

```bash
cd backend
copy .env.example .env
```

Edite `.env` com usuário e senha do MySQL:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=agendo
```

Instale e inicie:

```bash
npm install
npm run dev
```

API em `http://localhost:3001`.

## 3. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`. O Vite faz proxy de `/api` para o backend.

## Funcionalidades

- Calendário semanal e mensal com dia selecionado sincronizado
- Painel lateral com tarefas do dia, filtros e adição rápida
- Modal completo: descrição, data, horário, categoria e recorrência
- Arrastar tarefas não recorrentes para outro dia (semana/mês)
- Timeline com tarefas que têm horário
- Logo **Agendo** (azul, amarelo, vermelho) no cabeçalho

## Estrutura

```
GerenciadorDeTarefas/
├── backend/          # API Express
├── frontend/         # React (Vite)
├── database/         # schema.sql e seed.sql
└── README.md
```

## API (resumo)

| Método | Rota              | Descrição                    |
|--------|-------------------|------------------------------|
| GET    | /api/categories   | Lista categorias             |
| GET    | /api/tasks?date=  | Tarefas de um dia            |
| GET    | /api/tasks?year=&month= | Tarefas do mês        |
| POST   | /api/tasks        | Criar tarefa                 |
| PUT    | /api/tasks/:id    | Atualizar tarefa             |
| PATCH  | /api/tasks/:id    | Concluir ou mover data       |
| DELETE | /api/tasks/:id    | Excluir tarefa               |
