# Agendo — Sistema de Gerenciamento de Tarefas

## Sobre o projeto

O **Agendo** auxilia na organização de atividades diárias, com controle de tarefas, prazos, prioridades e calendário. Projeto semestral da **Equipe 05** (Engenharia de Software — Profª Ana Paula Muller Giancoli).

**Repositório:** [github.com/vicente-pedro/Projeto-BRAAOOB](https://github.com/vicente-pedro/Projeto-BRAAOOB)

## Equipe

| Integrante | RA |
|------------|-----|
| Henrique Martinelli de Godoy | BP3062741 |
| Luiz Tozeti Costa | BP3061965 |
| Miguel Augusto de Oliveira | BP3061418 |
| Pedro Alcantara Meneses | BP3062791 |
| Pedro Pereira Vicente | BP3062716 |

## Funcionalidades

- Cadastro, edição e exclusão de tarefas
- Marcação como concluída
- Prazos (data), prioridade (baixa/média/alta) e filtros
- Calendário semanal/mensal, categorias, recorrência e timeline
- Interface **Agendo** (logo azul, amarelo e vermelho)

## Documentação acadêmica

- [docs/Equipe05_ListagemRequisitos.pdf](docs/Equipe05_ListagemRequisitos.pdf)
- [docs/Equipe05_DiagramaCasoUso.pdf](docs/Equipe05_DiagramaCasoUso.pdf)
- [docs/REQUISITOS.md](docs/REQUISITOS.md) — rastreabilidade RF/RNF
- [docs/CASOS_DE_USO.md](docs/CASOS_DE_USO.md) — casos de uso

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React + Vite + CSS |
| Backend | Node.js + Express |
| Banco | MySQL |

## Pré-requisitos

- Node.js 18+
- MySQL 8+ (ou MariaDB)

## Instalação

### 1. Banco de dados

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Se o banco já existia sem `title` e `priority`:

```bash
mysql -u root -p < database/migration_v2_title_priority.sql
```

### 2. Backend

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

API: `http://localhost:3001`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

## Requisitos atendidos

| ID | Funcionalidade |
|----|----------------|
| RF01 | Cadastrar (título, descrição, data, prioridade) |
| RF02 | Editar tarefas |
| RF03 | Excluir tarefas |
| RF04 | Marcar como concluída |
| RF05 | Listar tarefas |
| RF06 | Definir prazos (data) |
| RF07 | Filtrar por status e prioridade |

## Estrutura

```
├── backend/       # API Express
├── frontend/      # React (Vite)
├── database/      # SQL schema, seed e migrations
├── docs/          # PDFs e rastreabilidade
└── README.md
```

## Status do projeto

Implementado (frontend, backend e banco de dados).
