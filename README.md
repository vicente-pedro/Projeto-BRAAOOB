<div align="center">
 <img src="./docs/logo.jpeg" alt="Agendo Logo" width="220"/>
  
  # Agendo — Sistema de Agendamento Online

  **Plataforma completa para gerenciamento de agendamentos, desenvolvida pela Equipe 05.**

  ![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=node.js&logoColor=white)
  ![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react&logoColor=black)
  ![MySQL](https://img.shields.io/badge/Banco%20de%20Dados-MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
  ![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=flat-square)

</div>

---

## 📖 Sobre o Projeto

O **Agendo** é um sistema de gerenciamento de agendamentos desenvolvido como projeto acadêmico da disciplina de **Engenharia de Software** — Equipe 05. A plataforma oferece uma interface moderna para que prestadores de serviço e clientes possam organizar e gerenciar seus agendamentos de forma simples e eficiente.

---

## ✨ Funcionalidades

### Para Clientes
- 📅 **Agendamento Online:** Marque horários de forma rápida e intuitiva.
- 🔔 **Notificações:** Receba confirmações e lembretes dos seus compromissos.
- 👤 **Perfil Personalizado:** Gerencie suas informações e histórico de agendamentos.

### Para Prestadores de Serviço
- 🗓️ **Gestão de Agenda:** Visualize e controle todos os agendamentos do dia.
- ⚙️ **Configuração de Horários:** Defina sua disponibilidade e serviços oferecidos.
- 📊 **Painel Administrativo:** Acompanhe métricas e histórico de atendimentos.

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React + Vite + CSS |
| **Backend** | Node.js + Express |
| **Banco de Dados** | MySQL |
| **Deploy** | Vercel (frontend) + Railway (API + banco) |

---

## 📁 Estrutura do Projeto

```
agendo/
├── backend/     # API Node.js + Express
├── frontend/    # React + Vite + CSS
├── database/    # Scripts MySQL
├── docs/        # PDFs e rastreabilidade de requisitos
└── package.json # Scripts para rodar o projeto
```

---

## 🚀 Rodando Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (v18+)
- [MySQL](https://www.mysql.com/) (v8+)
- [Git](https://git-scm.com/)

### Instalação

**1. Clone o repositório**
```bash
git clone https://github.com/vicente-pedro/Projeto-BRAAOOB.git
cd Projeto-BRAAOOB/agendo
```

**2. Instale as dependências**
```bash
npm install
npm run install:all
```

**3. Configure o banco de dados**
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

**4. Configure as variáveis de ambiente**
```bash
# Windows
copy backend\.env.example backend\.env

# Linux / macOS
cp backend/.env.example backend/.env
```
> ⚠️ Abra o arquivo `backend/.env` e preencha com suas credenciais do MySQL.

**5. Inicie o projeto**
```bash
npm run dev
```

| Serviço | URL |
|---------|-----|
| Interface (frontend) | http://localhost:5173 |
| API (backend) | http://localhost:3001 |

---

## ☁️ Deploy (Vercel + Railway)

O banco de dados é criado automaticamente quando a API sobe na nuvem.

Consulte o guia completo de deploy passo a passo:  
📄 [`agendo/docs/DEPLOY.md`](https://github.com/vicente-pedro/Agendo/blob/main/agendo/docs/DEPLOY.md) — Railway (MySQL + API) + Vercel (frontend).

---

## 📚 Documentação

A documentação completa, incluindo requisitos, rastreabilidade e PDFs do projeto, está disponível em:  
📂 [`agendo/docs/`](https://github.com/vicente-pedro/Agendo/blob/main/agendo/docs)

---

## 👥 Equipe 05

Este projeto foi desenvolvido por:

| Nome |
|------|
| Henrique Martinelli de Godoy |
| Luiz Tozeti Costa |
| Miguel Augusto de Oliveira |
| Pedro Alcântara Meneses |
| Pedro Pereira Vicente |

---

<div align="center">
  Feito com ☕ pela Equipe 05 — Engenharia de Software
</div>
