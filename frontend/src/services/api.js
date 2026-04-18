import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  withCredentials: true,
});

// Interceptor that adds the JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Real login
export const login = (username, password) =>
  api.post('/auth/login', { username, password });

// Real registration
export const register = (username, password) =>
  api.post('/auth/register', { username, password });

// Reports
export const getSalesReport = (from, to) => api.get(`/reports/sales?from=${from}&to=${to}`);
export const getInventoryReport = () => api.get('/reports/inventory');

// Products
export const getProducts = () => api.get('/products');
export const createProduct = (product) => api.post('/products', product);
export const updateProduct = (id, product) => api.put(`/products/${id}`, product);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const addStockToProduct = (id, quantity) => api.patch(`/products/${id}/stock`, { quantity });

// Sales
export const createSale = (saleData) => api.post('/sales', saleData);
export const getReceipt = (saleId) => api.get(`/receipts/${saleId}`);
export const suggestCombo = (prioritizedProductIds = [], maxRecommendations = 6) =>
  api.post('/optimization/personalized-recommendations', {
    prioritizedProductIds,
    maxRecommendations,
  });

// Customers
export const getCustomers = () => api.get('/customers');
export const createCustomer = (customerData) => api.post('/customers', customerData);
export const updateCustomer = (customerId, customerData) => api.put(`/customers/${customerId}`, customerData);
export const deleteCustomer = (customerId) => api.delete(`/customers/${customerId}`);
export const getCustomerPurchaseHistory = (customerId) => api.get(`/customers/${customerId}/purchases`);
export const validateClienteAmigoCode = (code) => api.get(`/customers/validate-clienteamigo?code=${encodeURIComponent(code)}`);

// Get sales
export const getSales = () => api.get('/sales');

// Categories
export const getActiveCategories = () => api.get('/categories/active');
export const getPredefinedCategories = () => api.get('/categories/predefined');
export const getCustomCategories = () => api.get('/categories/custom');
export const getPendingCategories = () => api.get('/categories/pending');
export const getAllCategories = () => api.get('/categories');
export const getCategoryById = (id) => api.get(`/categories/${id}`);
export const createCustomCategory = (name, description = '') => 
  api.post('/categories/custom', { name, description });
export const createPredefinedCategory = (name, description = '') =>
  api.post('/categories/predefined', { name, description });
export const updateCategory = (id, name, description = '') =>
  api.put(`/categories/${id}`, { name, description });
export const updateCategorySuggestionVisibility = (id, visibleInSuggestions) =>
  api.patch(`/categories/${id}/suggestion-visibility`, { visibleInSuggestions });
export const approveCategory = (id) => api.put(`/categories/${id}/approve`);
export const rejectCategory = (id) => api.delete(`/categories/${id}/reject`);
export const deactivateCategory = (id) => api.put(`/categories/${id}/deactivate`);
export const updateProductVisibility = (id, visibilityPatch) =>
  api.patch(`/products/${id}/visibility`, visibilityPatch);

// Admin user management
export const getSystemUsers = () => api.get('/admin/users');
export const promoteUserToAdmin = (userId) => api.post(`/admin/users/${userId}/promote`);
export const deleteSystemUser = (userId) => api.delete(`/admin/users/${userId}`);
export const createAdminUser = (username, password) => api.post('/admin/users', { username, password });

export default api;