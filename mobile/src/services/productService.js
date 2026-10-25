import api from './api';

export const SAMPLE_PRODUCTS = [
  {
    id: 101,
    name: 'Kitenge Tailored Shirt',
    category: 'Clothes',
    price: '15000',
    stock_quantity: 12,
    image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
    description: 'High-quality traditional cotton Kitenge shirt, tailored with modern style in Rwamagana.',
    seller_name: 'D&G Rwamagana Store',
    is_featured: true,
  },
  {
    id: 102,
    name: 'Handcrafted Leather Safari Shoes',
    category: 'Shoes',
    price: '28000',
    stock_quantity: 8,
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600',
    description: 'Durable genuine leather shoes designed for daily comfort and long-lasting durability.',
    seller_name: 'D&G Rwamagana Store',
    is_featured: true,
  },
  {
    id: 103,
    name: 'Agaseke Woven Sisal Basket Bag',
    category: 'Bags',
    price: '12000',
    stock_quantity: 15,
    image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600',
    description: 'Authentic Rwandan handwoven decorative and tote basket bag made with local sisal fibers.',
    seller_name: 'D&G Rwamagana Store',
    is_featured: true,
  },
  {
    id: 104,
    name: 'Stainless Steel Electric Kettle',
    category: 'Household equipment',
    price: '22000',
    stock_quantity: 6,
    image_url: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600',
    description: '2.0L fast-boiling stainless steel kettle with auto shut-off for safe home and office use.',
    seller_name: 'D&G Rwamagana Store',
    is_featured: false,
  },
  {
    id: 105,
    name: 'Traditional Imigongo Bead Jewellery Necklace',
    category: 'Jewellery',
    price: '8500',
    stock_quantity: 20,
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
    description: 'Handmade Rwandan artisan necklace featuring fine ceramic beads and vibrant Rwandan colors.',
    seller_name: 'D&G Rwamagana Store',
    is_featured: true,
  },
  {
    id: 106,
    name: 'Organic Shea Butter Moisturizing Cream',
    category: 'Cosmetics',
    price: '6500',
    stock_quantity: 25,
    image_url: 'https://images.unsplash.com/photo-1608248597359-52827157bc2b?w=600',
    description: '100% natural nourishing skin lotion formulated with organic botanicals for gentle all-day skin care.',
    seller_name: 'D&G Rwamagana Store',
    is_featured: false,
  },
];

export const productService = {
  /**
   * Fetch all products with optional search and category filters.
   * Gracefully falls back to development sample products if API is unreachable.
   */
  async getProducts(params = {}) {
    const { search, category } = params;
    const queryParams = {};
    if (search && search.trim() !== '') {
      queryParams.search = search.trim();
    }
    if (category && category !== 'All') {
      queryParams.category = category;
    }

    try {
      const response = await api.get('/api/products', { params: queryParams });
      if (response.data && response.data.products && response.data.products.length > 0) {
        return response.data.products;
      }
    } catch (err) {
      console.warn('API unavailable or returned error, using fallback sample catalogue:', err.message);
    }

    // Filter sample products by category and search
    return SAMPLE_PRODUCTS.filter((p) => {
      const matchCat =
        !category ||
        category === 'All' ||
        p.category.toLowerCase() === category.toLowerCase();
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase().trim());
      return matchCat && matchSearch;
    });
  },

  /**
   * Fetch details of a single product.
   */
  async getProductById(id) {
    try {
      const response = await api.get(`/api/products/${id}`);
      if (response.data && response.data.product) {
        return response.data.product;
      }
    } catch (err) {
      console.warn('API getProductById failed, checking sample catalog:', err.message);
    }

    const sample = SAMPLE_PRODUCTS.find((p) => String(p.id) === String(id));
    if (sample) return sample;
    throw new Error('Product not found');
  },

  /**
   * Fetch products managed by the current seller.
   */
  async getMyProducts() {
    const response = await api.get('/api/products/seller/my-products');
    return response.data.products;
  },

  /**
   * Create a new product (Seller only).
   */
  async createProduct(productData) {
    const response = await api.post('/api/products', productData);
    return response.data.product;
  },

  /**
   * Update an existing product (Seller only).
   */
  async updateProduct(id, productData) {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data.product;
  },

  /**
   * Delete a product (Seller only).
   */
  async deleteProduct(id) {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },
};

export default productService;
