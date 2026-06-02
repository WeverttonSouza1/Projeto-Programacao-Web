const { Pool } = require('pg');

const poolConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 5,
  idleTimeoutMillis: 30000,
};

let pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool(poolConfig);
} else {
  if (!global.postgresPool) {
    global.postgresPool = new Pool(poolConfig);
  }
  pool = global.postgresPool;
}

module.exports = pool;