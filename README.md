# Projeto-BRAAOOB — Agendo

Sistema de gerenciamento de tarefas da **Equipe 05** (Engenharia de Software).

**Repositório:** https://github.com/vicente-pedro/Projeto-BRAAOOB

## Estrutura

Todo o sistema está na pasta **`agendo/`**:

```
agendo/
├── backend/     # API Node.js + Express
├── frontend/    # React + Vite + CSS
├── database/    # Scripts MySQL
├── docs/        # PDFs e rastreabilidade de requisitos
└── package.json # Scripts para rodar o projeto
```

## Início rápido

```bash
cd agendo
npm install
npm run install:all

# Configure o MySQL (veja agendo/database/)
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql

# Copie e edite backend/.env
copy backend\.env.example backend\.env

# Inicia API + interface
npm run dev
```

- **Interface:** http://localhost:5173  
- **API:** http://localhost:3001  

Documentação completa, equipe e requisitos: [agendo/docs/](agendo/docs/).

## Deploy (Vercel + banco automático)

O banco é criado **sozinho** quando a API sobe na nuvem. Guia passo a passo:

**[agendo/docs/DEPLOY.md](agendo/docs/DEPLOY.md)** — Railway (MySQL + API) + Vercel (frontend).

## Equipe

Henrique Martinelli de Godoy · Luiz Tozeti Costa · Miguel Augusto de Oliveira · Pedro Alcantara Meneses · Pedro Pereira Vicente
