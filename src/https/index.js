import { axiosWrapper } from "./axiosWrapper";

// Auth Endpoints
export const login = (data) => axiosWrapper.post("/api/user/login", data);
export const register = (data) => axiosWrapper.post("/api/user/register", data);
export const getUserData = () => axiosWrapper.get("/api/user");
export const logout = () => axiosWrapper.post("/api/user/logout");

// Table Endpoints
export const getTables = () => axiosWrapper.get("/api/table");
export const addTable = (data) => axiosWrapper.post("/api/table/", data);
export const updateTable = (id, data) => axiosWrapper.put(`/api/table/${id}`, data);
export const deleteTable = (id) => axiosWrapper.delete(`/api/table/${id}`);

// Category Endpoints
export const getCategories = () => axiosWrapper.get("/api/category");
export const addCategory = (data) => axiosWrapper.post("/api/category", data);
export const updateCategory = (id, data) => axiosWrapper.put(`/api/category/${id}`, data);
export const deleteCategory = (id) => axiosWrapper.delete(`/api/category/${id}`);

// Menu Item Endpoints
export const getMenuItems = () => axiosWrapper.get("/api/menu-item");
export const addMenuItem = (data) => axiosWrapper.post("/api/menu-item", data);
export const updateMenuItem = (id, data) => axiosWrapper.put(`/api/menu-item/${id}`, data);
export const deleteMenuItem = (id) => axiosWrapper.delete(`/api/menu-item/${id}`);
export const toggleMenuItemAvailability = (id) => axiosWrapper.patch(`/api/menu-item/${id}/toggle`);

// Payment Endpoints
export const createOrderRazorpay = (data) =>
  axiosWrapper.post("/api/payment/create-order", data);
export const verifyPaymentRazorpay = (data) =>
  axiosWrapper.post("/api/payment//verify-payment", data);

// Order Endpoints
export const addOrder = (data) => axiosWrapper.post("/api/order/", data);
export const getOrders = () => axiosWrapper.get("/api/order");
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  axiosWrapper.put(`/api/order/${orderId}`, { orderStatus });
