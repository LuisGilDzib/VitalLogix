import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', 
});

// Interceptor para añadir el token JWT si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Login real
export const login = (username, password) =>
  api.post('/auth/login', { username, password });

// Registro real
export const register = (username, password) =>
  api.post('/auth/register', { username, password });

// reportes
export const getSalesReport = (from, to) => api.get(`/reports/sales?from=${from}&to=${to}`);
export const getInventoryReport = () => api.get('/reports/inventory');

//productos
export const getProducts = () => api.get('/products');
export const createProduct = (product) => api.post('/products', product);
export const updateProduct = (id, product) => api.put(`/products/${id}`, product);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const addStockToProduct = (id, quantity) => api.patch(`/products/${id}/stock`, { quantity });

//ventas
export const createSale = (saleData) => api.post('/sales', saleData);
export const getReceipt = (saleId) => api.get(`/receipts/${saleId}`);
export const suggestCombo = (budget, prioritizedProductIds = [], maxRecommendations = 6) =>
  api.post('/optimization/personalized-recommendations', {
    budget,
    prioritizedProductIds,
    maxRecommendations,
  });

//clientes
export const getCustomers = () => api.get('/customers');
export const getCustomerPurchaseHistory = (customerId) => api.get(`/customers/${customerId}/purchases`);
export const validateClienteAmigoCode = (code) => api.get(`/customers/validate-clienteamigo?code=${encodeURIComponent(code)}`);

//get ventas
export const getSales = () => api.get('/sales');

export default api;