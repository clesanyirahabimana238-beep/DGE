/**
 * Secure server-side script to create an authorized seller account.
 * Reads credentials from CLI arguments or environment variables.
 * Never allows public registration to create sellers.
 */

const bcrypt = require('bcryptjs');
const { pool, query } = require('../src/config/database');

async function createSeller() {
  const args = process.argv.slice(2);
  const name = args[0] || process.env.SELLER_NAME;
  const email = args[1] || process.env.SELLER_EMAIL;
  const password = args[2] || process.env.SELLER_PASSWORD;

  if (!name || !email || !password) {
    console.error('Usage: node scripts/createSeller.js <name> <email> <password>');
    console.error('Or set SELLER_NAME, SELLER_EMAIL, and SELLER_PASSWORD in the environment.');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('Error: Password must be at least 6 characters long.');
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Check if user already exists
    const existing = await query('SELECT id, role FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      if (existing.rows[0].role === 'seller') {
        console.log(`Seller account for "${normalizedEmail}" already exists with ID: ${existing.rows[0].id}`);
        return;
      }
      // Upgrade existing user to seller
      await query("UPDATE users SET role = 'seller' WHERE id = $1", [existing.rows[0].id]);
      console.log(`Updated user "${normalizedEmail}" (ID: ${existing.rows[0].id}) to role: seller`);
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const insertResult = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'seller')
       RETURNING id, name, email, role, created_at`,
      [name.trim(), normalizedEmail, passwordHash]
    );

    const newSeller = insertResult.rows[0];
    console.log('Seller account created successfully:');
    console.log({
      id: newSeller.id,
      name: newSeller.name,
      email: newSeller.email,
      role: newSeller.role,
      created_at: newSeller.created_at
    });
  } catch (err) {
    console.error('Error creating seller account:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  createSeller();
}

module.exports = createSeller;
