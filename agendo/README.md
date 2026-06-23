# Agendo — Gerenciador de Tarefas Inteligente

Sistema unificado (React + Node.js + MySQL) — Equipe 5.

## Estrutura

```
agendo/
├── package.json        # dependências e scripts (tudo em um lugar)
├── index.html          # entrada do React
├── vite.config.js
├── public/             # logo e arquivos estáticos
├── src/                # interface React (pages, components, context)
├── server/             # API Node.js + Express
├── database/           # schema.sql (MySQL)
└── .env.example         # modelo de configuração
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v18+)
- [MySQL](https://www.mysql.com/) (v8+) rodando localmente
- Git

## Como executar

### 1. Instalar dependências

```bash
cd agendo
npm install
```

### 2. Criar o banco de dados

```bash
mysql -u root -p < database/schema.sql
```

Isso cria o banco `agendo` com todas as tabelas, views, triggers e procedures.

### 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo e edite com suas credenciais do MySQL:

```bash
# Windows
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

Edite o `.env`:

```env
JWT_SECRET=troque-isto-por-um-segredo-forte

PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=agendo
```

### 4. Iniciar o projeto

```bash
npm run dev
```

Isso inicia a API (porta 3001) e o frontend (porta 5173) juntos.

| Serviço | URL |
|---------|-----|
| Interface (frontend) | http://localhost:5173 |
| API (backend) | http://localhost:3001 |

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia API + frontend juntos |
| `npm run server` | Inicia apenas a API |
| `npm run client` | Inicia apenas o frontend |
| `npm run build` | Build de produção do frontend |
| `npm run stop` | Encerra processos nas portas usadas |

## Banco de Dados (MySQL)

O schema (`database/schema.sql`) contém:

- **Tabelas:** `users`, `categories`, `tasks`, `historico_conclusao`
- **View:** `vw_detalhes_tarefas` — consulta consolidada de tarefas com categoria, dia da semana e status de atraso
- **Trigger:** `tg_registrar_historico_conclusao` — registra automaticamente quando uma tarefa é concluída
- **Procedures:** `sp_concluir_tarefa(id)` e `sp_stats_usuario(user_id)`

## Funcionalidades

- 🔐 Cadastro e login com autenticação JWT
- 📅 Calendário mensal e visão semanal
- ✅ Tarefas com prioridade, categoria, horário e recorrência (diária/semanal/mensal)
- 🏷️ Categorias customizáveis pelo usuário
- 📊 Progresso diário com estatísticas

## Solução de problemas comuns

**Erro de conexão MySQL (`ECONNREFUSED`):**
Verifique se o serviço MySQL está rodando e se as credenciais no `.env` estão corretas.

**`Unknown database 'agendo'`:**
Execute novamente o passo 2 (`mysql -u root -p < database/schema.sql`).

**Porta em uso:**
Execute `npm run stop` antes de rodar `npm run dev` novamente.
