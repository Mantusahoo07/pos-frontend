import { axiosWrapper } from "../https/axiosWrapper";

class TableService {
  // Get all tables
  async getTables() {
    try {
      const response = await axiosWrapper.get('/api/table');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get available tables
  async getAvailableTables() {
    try {
      const response = await axiosWrapper.get('/api/table/available');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Add new table
  async addTable(tableData) {
    try {
      const response = await axiosWrapper.post('/api/table', tableData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update table status
  async updateTableStatus(id, status, orderId = null) {
    try {
      const response = await axiosWrapper.put(`/api/table/${id}`, {
        status,
        orderId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    console.error('Table Service Error:', error);
    return error.response?.data || { message: 'An error occurred' };
  }
}

export default new TableService();
