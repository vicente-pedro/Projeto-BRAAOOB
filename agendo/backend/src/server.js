require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { initDb } = require('./initDb');
const { setDbReady, isDbReady, getDbError } = require('./dbState');
const { mapDbError } = require('./dbErrors');
const requireDb = require('./middleware/requireDb');
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
  const ready = isDbReady();
  res.json({
    status: ready ? 'ok' : 'degraded',
    app: 'Agendo API',
    database: ready ? 'connected' : 'error',
    message: ready ? undefined : mapDbError(getDbError()),
  });
});

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
    setDbReady(true);
    console.log('Banco de dados conectado e inicializado.');
  } catch (err) {
    setDbReady(false, err);
    console.error('⚠ Banco indisponível:', mapDbError(err));
    console.error('  A API sobe mesmo assim. Na pasta agendo, execute:');
    console.error('  docker compose up -d');
    console.error('  Depois confira DB_PASSWORD=agendo em backend/.env');
  }

  app.listen(PORT, () => {
    console.log(`Agendo API rodando em http://localhost:${PORT}`);
    if (!isDbReady()) {
      console.log('  Rotas /api retornam 503 até o MySQL conectar.');
    }
  });
}

start();
