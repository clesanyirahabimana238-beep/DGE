const { pool } = require('../src/config/database');

async function inspectDb() {
  try {
    const res = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('Existing tables in public schema:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('Error inspecting tables:', err.message);
  } finally {
    await pool.end();
  }
}

inspectDb();
