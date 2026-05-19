const { isDbReady, getDbError } = require('../dbState');
const { mapDbError } = require('../dbErrors');

function requireDb(_req, res, next) {
  if (isDbReady()) return next();

  const err = getDbError();
  const message = err
    ? mapDbError(err)
    : 'Banco não conectado. Rode "docker compose up -d" na pasta agendo e defina DB_PASSWORD=agendo em backend/.env';

  res.status(503).json({ error: message });
}

module.exports = requireDb;
