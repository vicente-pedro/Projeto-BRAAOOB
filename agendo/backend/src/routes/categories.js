const express = require('express');
const pool = require('../db');
const { sendDbError } = require('../dbErrors');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, slug, icon, border_color AS borderColor FROM categories ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    sendDbError(res, err, 'Erro ao buscar categorias');
  }
});

module.exports = router;
