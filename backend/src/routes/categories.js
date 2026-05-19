const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, slug, icon, border_color AS borderColor FROM categories ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

module.exports = router;
