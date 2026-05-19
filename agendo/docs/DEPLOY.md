# Deploy na nuvem (Vercel + banco automático)

A **Vercel** hospeda o frontend. O **MySQL** e a **API** ficam em um serviço que cria o banco por você (recomendado: **Railway**).

Ao subir a API, as tabelas e categorias são criadas **automaticamente** — não é preciso rodar `mysql < schema.sql` manualmente.

---

## Visão geral

| Parte | Onde | O quê |
|-------|------|--------|
| Interface | Vercel | React (pasta `agendo/frontend`) |
| API + init do banco | Railway | Node.js (pasta `agendo/backend`) |
| MySQL | Railway (plugin) | Banco gerenciado, URL automática |

---

## Passo 1 — Railway (API + MySQL)

1. Acesse [railway.app](https://railway.app) e conecte o GitHub.
2. **New Project** → **Deploy from GitHub** → repositório `Projeto-BRAAOOB`.
3. No serviço criado, em **Settings** → **Root Directory**: `agendo/backend`.
4. **+ New** → **Database** → **MySQL** (no mesmo projeto).
5. No serviço **MySQL**, aba **Variables**, copie `MYSQL_URL` ou `DATABASE_URL`.
6. No serviço da **API** (backend), **Variables** → adicione:

   | Variável | Valor |
   |----------|--------|
   | `DATABASE_URL` | Cole a URL do MySQL (referência: `${{MySQL.MYSQL_URL}}` no Railway) |
   | `NODE_ENV` | `production` |
   | `AUTO_INIT_DB` | `true` |
   | `FRONTEND_URL` | URL da Vercel (passo 2), ex: `https://projeto-braaoob.vercel.app` |

7. **Settings** → gere um **Public Domain** (ex: `agendo-api-production.up.railway.app`).
8. Aguarde o deploy. Teste: `https://SUA-API.railway.app/api/health` → deve retornar `{"status":"ok"}`.

Na primeira inicialização a API executa `initDb.js` e cria tabelas + categorias.

---

## Passo 2 — Vercel (frontend)

1. Acesse [vercel.com](https://vercel.com) → **Add New Project** → importe o mesmo repositório.
2. **Root Directory**: `agendo/frontend`
3. **Environment Variables**:

   | Nome | Valor |
   |------|--------|
   | `VITE_API_URL` | `https://SUA-API.railway.app/api` |

4. Deploy.

5. Volte ao Railway e atualize `FRONTEND_URL` com a URL real da Vercel (ex: `https://xxx.vercel.app`).

---

## Alternativa: tudo no Railway

1. Deploy do backend (como acima) + MySQL.
2. No backend, faça build do frontend e sirva em produção:

   ```bash
   cd agendo
   npm run build
   ```

   Com `NODE_ENV=production`, a API já serve os arquivos de `frontend/dist` na mesma URL.

3. Use só o domínio público do Railway — sem Vercel.

---

## Variáveis de ambiente

### Backend (`agendo/backend`)

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim (nuvem) | URL MySQL do Railway/planetScale |
| `AUTO_INIT_DB` | Não | `true` (padrão) cria schema ao iniciar |
| `FRONTEND_URL` | Recomendado | URL do site na Vercel (CORS) |
| `PORT` | Não | Railway define automaticamente |

### Frontend (`agendo/frontend`)

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `VITE_API_URL` | Sim (Vercel) | URL da API + `/api` |

---

## Desenvolvimento local

Continua funcionando com MySQL local **ou** com `DATABASE_URL` de um banco na nuvem:

```bash
cd agendo
npm run install:all
copy backend\.env.example backend\.env
npm run dev
```

Com `AUTO_INIT_DB=true` no `.env`, tabelas locais também são criadas ao iniciar a API.

---

## Outros provedores de MySQL

Qualquer host que forneça URL `mysql://...` funciona:

- **PlanetScale**
- **Aiven**
- **Render** (MySQL pago)
- **AWS RDS**

Configure `DATABASE_URL` na API e `VITE_API_URL` no frontend.
