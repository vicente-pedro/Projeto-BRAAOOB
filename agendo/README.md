# Agendo — Gerenciador de Tarefas

## Documentação

- [docs/Equipe05_ListagemRequisitos.pdf](docs/Equipe05_ListagemRequisitos.pdf)
- [docs/Equipe05_DiagramaCasoUso.pdf](docs/Equipe05_DiagramaCasoUso.pdf)
- [docs/REQUISITOS.md](docs/REQUISITOS.md)
- [docs/CASOS_DE_USO.md](docs/CASOS_DE_USO.md)

## Instalação

### Banco de dados

**Local (manual):**

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

**Local ou nuvem (automático):** com `AUTO_INIT_DB=true` no `backend/.env`, as tabelas são criadas ao iniciar a API (`npm run dev`).

**Deploy:** veja [docs/DEPLOY.md](docs/DEPLOY.md) — MySQL no Railway + site na Vercel.

### Ambiente

```bash
copy backend\.env.example backend\.env
npm install
npm run install:all
npm run dev
```

### Produção (opcional)

```bash
npm run build
set NODE_ENV=production
npm start --prefix backend
```

Acesse http://localhost:3001

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

## Funcionalidades extras

- Calendário semanal e mensal com arrastar para mover tarefas
- Categorias, recorrência e timeline do dia
- Modal de categorias no cabeçalho
