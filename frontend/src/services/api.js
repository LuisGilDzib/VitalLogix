import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', 
});

export const getProducts = () => api.get('/products');
export const createProduct = (product) => api.post('/products', product);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export default api;