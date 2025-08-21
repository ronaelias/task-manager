const mysql = require('mysql2/promise'); // to use async/await

let pool;
async function getPool() {
  if (!pool) {
    pool = await mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectionLimit: 10,
      namedPlaceholders: true
    });
  }
  return pool;
}

// SELECT return rows
async function query(sql, params = {}) {
  try {
    const p = await getPool();
    const [rows] = await p.execute(sql, params);
    return rows;
  } catch (err) {
    err.source = 'DB_QUERY';
    throw err;
  }
}

// INSERT/UPDATE/DELETE return OkPacket
async function exec(sql, params = {}) {
  try {
    const p = await getPool();
    const [result] = await p.execute(sql, params);
    return result;
  } catch(err) {
    err.source = 'DB_EXEC';
    return err;
  }
}

module.exports = { getPool, query, exec };
