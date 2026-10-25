/**
 * Seed sample seller and buyer user accounts into Neon PostgreSQL database.
 */

const bcrypt = require('bcryptjs');
const { pool, query } = require('../src/config/database');

async function seedSampleAccounts() {
  try {
    const salt = await bcrypt.genSalt(10);
    const sharedPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(sharedPassword, salt);

    const accounts = [
      {
        name: 'D&G Official Seller',
        email: 'seller@dgecommerce.rw',
        role: 'seller',
        description: 'Primary seller account managing products, stock, and fulfillment in Rwamagana.'
      },
      {
        name: 'D&G Rwamagana Store Manager',
        email: 'seller@dg-rwamagana.rw',
        role: 'seller',
        description: 'Store manager seller account for Rwamagana retail operations.'
      },
      {
        name: 'Sample Buyer',
        email: 'buyer@dgecommerce.rw',
        role: 'client',
        description: 'Customer account for shopping, browsing products, placing orders, and checking out.'
      }
    ];

    console.log('Seeding sample accounts into database...\n');

    for (const acc of accounts) {
      const existing = await query('SELECT id, role FROM users WHERE email = $1', [acc.email]);
      if (existing.rows.length > 0) {
        await query(
          'UPDATE users SET name = $1, password_hash = $2, role = $3 WHERE email = $4',
          [acc.name, passwordHash, acc.role, acc.email]
        );
        console.log(`[UPDATED] ${acc.role.toUpperCase()}: ${acc.email} (ID: ${existing.rows[0].id})`);
      } else {
        const res = await query(
          `INSERT INTO users (name, email, password_hash, role)
           VALUES ($1, $2, $3, $4)
           RETURNING id, name, email, role, created_at`,
          [acc.name, acc.email, passwordHash, acc.role]
        );
        console.log(`[CREATED] ${acc.role.toUpperCase()}: ${acc.email} (ID: ${res.rows[0].id})`);
      }
    }

    console.log('\n--- VERIFICATION CREDENTIALS ---');
    console.log(`Password for all sample accounts: ${sharedPassword}\n`);
    accounts.forEach((acc) => {
      console.log(`Role: [${acc.role.toUpperCase()}]`);
      console.log(`Name:  ${acc.name}`);
      console.log(`Email: ${acc.email}`);
      console.log(`Pass:  ${sharedPassword}\n`);
    });

  } catch (err) {
    console.error('Error seeding sample accounts:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedSampleAccounts();
}

module.exports = seedSampleAccounts;
