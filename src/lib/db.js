import mysql from "mysql2/promise";

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true,
    });
  }
  return pool;
}

// SELECT — returns array of rows
export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

// INSERT / UPDATE / DELETE — returns result metadata
export async function execute(sql, params = []) {
  const [result] = await getPool().execute(sql, params);
  return result;
}

// For multi-step operations that must succeed together
export async function withTransaction(callback) {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}