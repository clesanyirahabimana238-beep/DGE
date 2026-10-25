import api from './api';

export const productService = {
  /**
   * Fetch all products with optional search and category filters.
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
    const response = await api.get('/api/products', { params: queryParams });
    return response.data.products;
  },

  /**
   * Fetch details of a single product.
   */
  async getProductById(id) {
    const response = await api.get(`/api/products/${id}`);
    return response.data.product;
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
