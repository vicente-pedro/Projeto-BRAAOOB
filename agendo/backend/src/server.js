require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { initDb } = require('./initDb');
const { mapDbError } = require('./dbErrors');
const tasksRouter = require('./routes/tasks');
const categoriesRouter = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

let dbReady = false;
let dbInitError = null;

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
  res.json({
    status: dbReady ? 'ok' : 'degraded',
    app: 'Agendo API',
    database: dbReady ? 'connected' : 'error',
    message: dbReady ? undefined : mapDbError(dbInitError),
  });
});

function requireDb(req, res, next) {
  if (dbReady) return next();
  res.status(503).json({
    error: mapDbError(dbInitError),
  });
}

app.use('/api/tasks', requireDb, tasksRouter);
app.use('/api/categories', requireDb, categoriesRouter);

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
    dbReady = true;
    console.log('Banco de dados conectado.');
  } catch (err) {
    dbInitError = err;
    console.error('Falha ao inicializar banco:', mapDbError(err));
    if (isProd) process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Agendo API rodando na porta ${PORT}`);
    if (!dbReady) {
      console.log('API no ar, mas o MySQL precisa ser configurado (veja README).');
    }
  });
}

start();
