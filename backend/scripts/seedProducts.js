/**
 * Seed retail products into the Neon PostgreSQL database.
 * Products cover all 6 core business categories:
 * Clothes, Shoes, Bags, Household equipment, Jewellery, and Cosmetics.
 */

const { pool, query } = require('../src/config/database');

const PRODUCTS_DATA = [
  // Clothes
  {
    name: 'Traditional Rwandan Imishanana Fabric',
    description: 'Authentic ceremonial Rwandan Imishanana fabric with elegant patterns and vibrant colors. Perfect for weddings and cultural ceremonies in Rwamagana.',
    price: 35000,
    category: 'Clothes',
    image_url: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600',
    stock_quantity: 15,
    is_featured: true,
  },
  {
    name: 'Kitenge Tailored Shirt',
    description: 'High-quality traditional cotton Kitenge shirt, tailored with modern style in Rwamagana. Breathable fabric and vivid geometric patterns.',
    price: 15000,
    category: 'Clothes',
    image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
    stock_quantity: 20,
    is_featured: true,
  },
  {
    name: 'Cotton Summer Dress with African Print',
    description: 'Lightweight, comfortable cotton summer dress featuring authentic East African print motifs. Tailored for warm climates.',
    price: 22000,
    category: 'Clothes',
    image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',
    stock_quantity: 12,
    is_featured: false,
  },

  // Shoes
  {
    name: 'Handcrafted Leather Safari Shoes',
    description: 'Durable genuine leather safari shoes designed for daily comfort and long-lasting durability across varied terrain.',
    price: 28000,
    category: 'Shoes',
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600',
    stock_quantity: 10,
    is_featured: true,
  },
  {
    name: 'Classic Leather Loafers',
    description: 'Formal slip-on genuine leather loafers with cushioned insole for business and smart casual wear.',
    price: 32000,
    category: 'Shoes',
    image_url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600',
    stock_quantity: 8,
    is_featured: false,
  },
  {
    name: 'Breathable Sport Running Sneakers',
    description: 'Ultra-lightweight mesh running sneakers with anti-slip rubber outsoles and responsive shock absorption.',
    price: 24000,
    category: 'Shoes',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    stock_quantity: 14,
    is_featured: false,
  },

  // Bags
  {
    name: 'Agaseke Woven Sisal Basket Bag',
    description: 'Authentic Rwandan handwoven decorative and tote basket bag made with natural sisal fibers and sweetgrass.',
    price: 12000,
    category: 'Bags',
    image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600',
    stock_quantity: 25,
    is_featured: true,
  },
  {
    name: 'Everyday Canvas Laptop Backpack',
    description: 'Heavy-duty water-resistant canvas backpack with padded 15.6-inch laptop compartment and multiple utility organizer pockets.',
    price: 26000,
    category: 'Bags',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    stock_quantity: 18,
    is_featured: false,
  },
  {
    name: "Women's Elegant Leather Shoulder Bag",
    description: 'Sleek premium PU leather shoulder handbag with gold-tone hardware and adjustable crossbody strap.',
    price: 22000,
    category: 'Bags',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600',
    stock_quantity: 10,
    is_featured: false,
  },

  // Household equipment
  {
    name: 'Stainless Steel Electric Kettle 2.0L',
    description: 'Fast-boiling stainless steel electric kettle with automatic shut-off and boil-dry protection. Essential for home and office.',
    price: 22000,
    category: 'Household equipment',
    image_url: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600',
    stock_quantity: 16,
    is_featured: false,
  },
  {
    name: 'Non-Stick Ceramic Cooking Pan Set',
    description: '3-piece non-stick induction cookware pan set with heat-resistant ergonomic handles and scratch-resistant coating.',
    price: 38000,
    category: 'Household equipment',
    image_url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600',
    stock_quantity: 9,
    is_featured: true,
  },
  {
    name: 'Compact Electric Blender & Food Processor',
    description: 'Multi-functional 600W countertop blender with stainless steel 4-blade assembly for smoothies, juices, and spice grinding.',
    price: 34000,
    category: 'Household equipment',
    image_url: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600',
    stock_quantity: 11,
    is_featured: false,
  },

  // Jewellery
  {
    name: 'Traditional Imigongo Bead Jewellery Necklace',
    description: 'Handmade Rwandan artisan necklace featuring fine ceramic beads and vibrant Rwandan colors reflecting traditional artistry.',
    price: 8500,
    category: 'Jewellery',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
    stock_quantity: 30,
    is_featured: true,
  },
  {
    name: 'Handcrafted Brass Rwandan Bangle Bracelet',
    description: 'Solid recycled polished brass bangle bracelet shaped by Rwandan metal artisans. Adjustable wrist fit.',
    price: 6000,
    category: 'Jewellery',
    image_url: 'https://images.unsplash.com/photo-1611591475878-316238b975ec?w=600',
    stock_quantity: 22,
    is_featured: false,
  },
  {
    name: 'Silver Plated Freshwater Pearl Earrings',
    description: 'Delicate drop earrings featuring cultured freshwater pearls mounted on hypoallergenic silver-plated brass hooks.',
    price: 9500,
    category: 'Jewellery',
    image_url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600',
    stock_quantity: 15,
    is_featured: false,
  },

  // Cosmetics
  {
    name: 'Organic Shea Butter Moisturizing Cream',
    description: '100% natural nourishing skin lotion formulated with organic unrefined shea butter and vitamin E for deep hydration.',
    price: 6500,
    category: 'Cosmetics',
    image_url: 'https://images.unsplash.com/photo-1608248597359-52827157bc2b?w=600',
    stock_quantity: 40,
    is_featured: false,
  },
  {
    name: 'Pure Rwandan Avocado & Coconut Hair Oil',
    description: 'Cold-pressed natural hair treatment oil enriched with Rwandan avocado extract to strengthen roots and promote healthy shine.',
    price: 5000,
    category: 'Cosmetics',
    image_url: 'https://images.unsplash.com/photo-1608248597341-a39c09c2a233?w=600',
    stock_quantity: 35,
    is_featured: true,
  },
  {
    name: 'Herbal Aloe Vera Hydrating Facial Cleanser',
    description: 'Gentle foaming face wash infused with natural organic aloe vera leaf extract to soothe, balance, and cleanse all skin types.',
    price: 7500,
    category: 'Cosmetics',
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
    stock_quantity: 28,
    is_featured: false,
  },
];

async function seedProducts() {
  try {
    console.log('Connecting to database...');

    // 1. Ensure a seller exists to own the products
    const sellerResult = await query("SELECT id, name, email FROM users WHERE role = 'seller' ORDER BY id ASC");
    if (sellerResult.rows.length === 0) {
      console.error('Error: No seller user found in database. Please run npm run backend:seed:users first.');
      process.exit(1);
    }

    const sellers = sellerResult.rows;
    console.log(`Found ${sellers.length} seller accounts:`);
    sellers.forEach(s => console.log(`  - "${s.name}" (${s.email}, ID: ${s.id})`));

    // 2. Ensure table has is_featured column
    await query('ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE');

    // 3. Clear existing products to prevent duplicates upon re-seeding
    await query('DELETE FROM products');
    console.log('Cleared existing product records.');

    // 4. Insert each product, distributing across sellers
    let insertedCount = 0;
    for (let i = 0; i < PRODUCTS_DATA.length; i++) {
      const p = PRODUCTS_DATA[i];
      const assignedSeller = sellers[i % sellers.length];
      await query(
        `INSERT INTO products (name, description, price, category, image_url, stock_quantity, seller_id, is_featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          p.name,
          p.description,
          p.price,
          p.category,
          p.image_url,
          p.stock_quantity,
          assignedSeller.id,
          p.is_featured
        ]
      );
      insertedCount++;
    }

    console.log(`\nSuccessfully seeded ${insertedCount} products across ${sellers.length} sellers!`);

    // 5. Verification query by category
    const countByCategory = await query(
      `SELECT category, COUNT(*) as count, SUM(stock_quantity) as total_stock
       FROM products
       GROUP BY category
       ORDER BY category`
    );

    console.log('\n--- STORED PRODUCTS BY CATEGORY ---');
    countByCategory.rows.forEach(r => {
      console.log(`Category: ${r.category.padEnd(22)} Products: ${r.count} | Stock: ${r.total_stock}`);
    });

  } catch (err) {
    console.error('Error seeding products:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedProducts();
}

module.exports = seedProducts;
