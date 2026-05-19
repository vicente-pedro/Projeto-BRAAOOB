# Agendo — Gerenciador de Tarefas

## Documentação

- [docs/Equipe05_ListagemRequisitos.pdf](docs/Equipe05_ListagemRequisitos.pdf)
- [docs/Equipe05_DiagramaCasoUso.pdf](docs/Equipe05_DiagramaCasoUso.pdf)
- [docs/REQUISITOS.md](docs/REQUISITOS.md)
- [docs/CASOS_DE_USO.md](docs/CASOS_DE_USO.md)
- [docs/DEPLOY.md](docs/DEPLOY.md) — Vercel + Railway

## Início rápido (local com Docker)

**1. MySQL automático (recomendado)**

```bash
cd agendo
docker compose up -d
```

Aguarde ~15 segundos até o MySQL ficar pronto.

**2. Configure o backend**

```bash
copy backend\.env.example backend\.env
```

O `.env.example` já usa `DB_PASSWORD=agendo` (igual ao Docker).

Se você usa **XAMPP/MySQL instalado**, troque `DB_PASSWORD` pela **sua senha do root**.

**3. Instale e rode**

```bash
npm install
npm run install:all
npm run dev
```

- Interface: http://localhost:5173  
- API: http://localhost:3001/api/health  

Se o banco falhar, a API **continua no ar** e a tela mostra a mensagem exata do erro (senha errada, MySQL parado, etc.).

### Problema comum

| Erro | Solução |
|------|---------|
| `Access denied (using password: NO)` | Coloque `DB_PASSWORD=agendo` (Docker) ou sua senha em `backend/.env` |
| `ECONNREFUSED` | Rode `docker compose up -d` ou inicie o MySQL |
| `Failed running src/server.js` | Corrija o `.env`; a API não deve mais encerrar sozinha |

## Banco manual (sem Docker)

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Com `AUTO_INIT_DB=true`, as tabelas também são criadas ao iniciar a API.

## Produção

```bash
npm run build
set NODE_ENV=production
npm start --prefix backend
```

## Requisitos atendidos

| RF | Descrição |
|----|-----------|
| RF01 | Cadastrar tarefa (título, descrição, data, prioridade) |
| RF02 | Editar tarefa |
| RF03 | Excluir tarefa |
| RF04 | Marcar como concluída |
| RF05 | Listar tarefas |
| RF06 | Definir prazos (data) |
| RF07 | Filtrar por status e prioridade |
