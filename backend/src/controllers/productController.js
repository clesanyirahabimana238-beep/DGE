const { query } = require('../config/database');

/**
 * GET /api/products
 * Public endpoint to browse, search, and filter products.
 */
async function getAllProducts(req, res, next) {
  try {
    const { search, category, sellerId } = req.query;

    let sql = `
      SELECT p.id, p.name, p.description, p.price, p.category, p.image_url,
             p.stock_quantity, p.seller_id, p.is_featured, p.created_at, p.updated_at,
             u.name AS seller_name
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search && search.trim() !== '') {
      sql += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    if (category && category.trim() !== '' && category.trim().toLowerCase() !== 'all') {
      sql += ` AND LOWER(p.category) = LOWER($${paramIndex})`;
      params.push(category.trim());
      paramIndex++;
    }

    if (sellerId) {
      sql += ` AND p.seller_id = $${paramIndex}`;
      params.push(Number(sellerId));
      paramIndex++;
    }

    sql += ' ORDER BY p.created_at DESC';

    const result = await query(sql, params);
    return res.status(200).json({
      success: true,
      count: result.rows.length,
      products: result.rows
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/:id
 * Public endpoint to view a specific product's details.
 */
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT p.id, p.name, p.description, p.price, p.category, p.image_url,
              p.stock_quantity, p.seller_id, p.is_featured, p.created_at, p.updated_at,
              u.name AS seller_name, u.email AS seller_email
       FROM products p
       JOIN users u ON p.seller_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found' }
      });
    }

    return res.status(200).json({
      success: true,
      product: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/seller/my-products
 * Protected endpoint for sellers to view their own products.
 */
async function getMyProducts(req, res, next) {
  try {
    const sellerId = req.user.id;

    const result = await query(
      `SELECT id, name, description, price, category, image_url,
              stock_quantity, seller_id, created_at, updated_at
       FROM products
       WHERE seller_id = $1
       ORDER BY created_at DESC`,
      [sellerId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      products: result.rows
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/products
 * Protected endpoint: only authenticated sellers can create products.
 */
async function createProduct(req, res, next) {
  try {
    const { name, description, price, category, image_url, stock_quantity } = req.body;
    const sellerId = req.user.id;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Product name is required' }
      });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Price must be a valid non-negative number' }
      });
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Category is required' }
      });
    }

    const numStock = Number(stock_quantity ?? 0);
    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Stock quantity must be a non-negative integer' }
      });
    }

    const insertResult = await query(
      `INSERT INTO products (name, description, price, category, image_url, stock_quantity, seller_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, description, price, category, image_url, stock_quantity, seller_id, created_at, updated_at`,
      [
        name.trim(),
        description ? description.trim() : null,
        numPrice,
        category.trim(),
        image_url ? image_url.trim() : null,
        numStock,
        sellerId
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: insertResult.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/products/:id
 * Protected endpoint: only the seller who owns the product can update it.
 */
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, price, category, image_url, stock_quantity } = req.body;
    const sellerId = req.user.id;

    // Check if product exists
    const existing = await query('SELECT id, seller_id FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found' }
      });
    }

    // Enforce ownership: sellers may modify only their own products
    if (existing.rows[0].seller_id !== sellerId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Forbidden: You can only modify your own products' }
      });
    }

    // Validation
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Product name cannot be empty' }
      });
    }

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Price must be a valid non-negative number' }
        });
      }
    }

    if (stock_quantity !== undefined) {
      const numStock = Number(stock_quantity);
      if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Stock quantity must be a non-negative integer' }
        });
      }
    }

    const updateResult = await query(
      `UPDATE products
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           category = COALESCE($4, category),
           image_url = COALESCE($5, image_url),
           stock_quantity = COALESCE($6, stock_quantity),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND seller_id = $8
       RETURNING id, name, description, price, category, image_url, stock_quantity, seller_id, created_at, updated_at`,
      [
        name !== undefined ? name.trim() : null,
        description !== undefined ? description.trim() : null,
        price !== undefined ? Number(price) : null,
        category !== undefined ? category.trim() : null,
        image_url !== undefined ? image_url.trim() : null,
        stock_quantity !== undefined ? Number(stock_quantity) : null,
        id,
        sellerId
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updateResult.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/products/:id
 * Protected endpoint: only the seller who owns the product can delete it.
 */
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    // Check if product exists
    const existing = await query('SELECT id, seller_id FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found' }
      });
    }

    // Enforce ownership
    if (existing.rows[0].seller_id !== sellerId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Forbidden: You can only delete your own products' }
      });
    }

    await query('DELETE FROM products WHERE id = $1 AND seller_id = $2', [id, sellerId]);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
