import { axiosWrapper } from "../https/axiosWrapper";

class OrderService {
  // Get all orders with pagination
  async getOrders(page = 1, limit = 10) {
    try {
      const response = await axiosWrapper.get(`/api/order?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get single order
  async getOrderById(id) {
    try {
      const response = await axiosWrapper.get(`/api/order/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create new order
  async createOrder(orderData) {
    try {
      const response = await axiosWrapper.post('/api/order', orderData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update order status
  async updateOrderStatus(id, status) {
    try {
      const response = await axiosWrapper.put(`/api/order/${id}`, { orderStatus: status });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get orders by status
  async getOrdersByStatus(status) {
    try {
      const response = await axiosWrapper.get(`/api/order/status/${status}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get today's orders
  async getTodaysOrders() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axiosWrapper.get(`/api/order/date/${today}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    console.error('Order Service Error:', error);
    return error.response?.data || { message: 'An error occurred' };
  }
}

export default new OrderService();
