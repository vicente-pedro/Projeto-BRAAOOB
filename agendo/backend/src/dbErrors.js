function mapDbError(err) {
  if (!err || !err.code) return 'Erro no banco de dados';

  switch (err.code) {
    case 'ER_ACCESS_DENIED_ERROR':
      return 'MySQL recusou o login. Confira DB_USER e DB_PASSWORD em backend/.env';
    case 'ECONNREFUSED':
    case 'ENOTFOUND':
      return 'MySQL não está acessível. Inicie o serviço ou rode: docker compose up -d';
    case 'ER_BAD_DB_ERROR':
      return 'Banco não existe. Use AUTO_INIT_DB=true ou crie o banco agendo';
    default:
      return err.sqlMessage || err.message || 'Erro no banco de dados';
  }
}

function sendDbError(res, err, fallback = 'Erro na operação') {
  console.error(err);
  res.status(503).json({ error: mapDbError(err) || fallback });
}

module.exports = { mapDbError, sendDbError };
