const mysql = require('mysql2/promise');

function buildConfig() {
  const url = process.env.DATABASE_URL || process.env.MYSQL_URL;

  if (url) {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: Number(parsed.port) || 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ''),
      ssl: process.env.DB_SSL !== 'false' ? { rejectUnauthorized: false } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agendo',
    waitForConnections: true,
    connectionLimit: 10,
  };
}

const pool = mysql.createPool(buildConfig());

module.exports = pool;
