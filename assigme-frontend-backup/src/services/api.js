import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token à toutes les requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = Bearer ;
  }
  return config;
});

// Services Auth
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// Services Annonces
export const annoncesService = {
  getAll: () => api.get('/annonces'),
  getById: (id) => api.get(/annonces/),
  create: (annonceData) => api.post('/annonces', annonceData),
  update: (id, annonceData) => api.put(/annonces/, annonceData),
  delete: (id) => api.delete(/annonces/),
  getMesAnnonces: () => api.get('/annonces/mes-annonces'),
};

// Services Catégories
export const categoriesService = {
  getAll: () => api.get('/categories'),
};

// Services Favoris
export const favorisService = {
  getAll: () => api.get('/favoris'),
  add: (annonceId) => api.post(/favoris/),
  remove: (annonceId) => api.delete(/favoris/),
  check: (annonceId) => api.get(/favoris//check),
};

export default api;
