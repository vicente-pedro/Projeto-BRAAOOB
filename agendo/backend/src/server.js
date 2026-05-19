require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const tasksRouter = require('./routes/tasks');
const categoriesRouter = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors());
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

app.listen(PORT, () => {
  console.log(`Agendo API rodando em http://localhost:${PORT}`);
  if (isProd) console.log('Frontend em modo produção servido pela API');
});
