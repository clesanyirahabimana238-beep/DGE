import api from './api';

export const orderService = {
  /**
   * Place an order with delivery address and product items.
   */
  async createOrder(orderData) {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },

  /**
   * Fetch current client's order history.
   */
  async getMyOrders() {
    const response = await api.get('/api/orders/my-orders');
    return response.data.orders;
  },

  /**
   * Fetch single order details by ID.
   */
  async getOrderById(id) {
    const response = await api.get(`/api/orders/${id}`);
    return response.data.order;
  },
};

export default orderService;
