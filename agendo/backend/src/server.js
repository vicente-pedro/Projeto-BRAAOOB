require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { initDb } = require('./initDb');
const tasksRouter = require('./routes/tasks');
const categoriesRouter = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.some((o) => origin === o || origin.endsWith('.vercel.app'))) {
        callback(null, true);
      } else {
        callback(null, allowedOrigins[0] || true);
      }
    },
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'Agendo API' });
});

app.use('/api/tasks', tasksRouter);
app.use('/api/categories', categoriesRouter);

if (isProd) {
  const dist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(dist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(dist, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

async function start() {
  try {
    await initDb();
  } catch (err) {
    console.error('Falha ao inicializar banco:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Agendo API rodando na porta ${PORT}`);
    if (isProd) console.log('Modo produção');
  });
}

start();
