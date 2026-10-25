import api from './api';

export const sellerService = {
  /**
   * Fetch customer orders containing products owned by the seller.
   */
  async getSellerOrders() {
    const response = await api.get('/api/seller/orders');
    return response.data.orders;
  },

  /**
   * Update order status (Pending -> Confirmed -> Shipped -> Delivered, or Cancelled).
   */
  async updateOrderStatus(orderId, status) {
    const response = await api.patch(`/api/seller/orders/${orderId}/status`, { status });
    return response.data;
  },

  /**
   * Fetch sales summary: delivered orders count and total sales amount.
   */
  async getSalesSummary() {
    const response = await api.get('/api/seller/sales-summary');
    return response.data.summary;
  },
};

export default sellerService;
