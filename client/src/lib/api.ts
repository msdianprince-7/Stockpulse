import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('stockpulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: { email: string; name: string; password: string }) =>
    api.post('/users/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/users/login', data),
  getProfile: () => api.get('/users/profile'),
};

// Stock API
export const stockAPI = {
  search: (query: string) => api.get(`/stocks/search?q=${query}`),
  getBySymbol: (symbol: string) => api.get(`/stocks/${symbol}`),
  getAll: () => api.get('/stocks/all'),
  getTopGainers: () => api.get('/stocks/top-gainers'),
  getTopLosers: () => api.get('/stocks/top-losers'),
};

// Watchlist API
export const watchlistAPI = {
  get: () => api.get('/watchlist'),
  add: (stockId: string) => api.post('/watchlist', { stockId }),
  remove: (stockId: string) => api.delete(`/watchlist/${stockId}`),
};

// Portfolio API
export const portfolioAPI = {
  get: () => api.get('/portfolio'),
  addHolding: (data: { stockId: string; quantity: number; avgPrice: number }) =>
    api.post('/portfolio/holdings', data),
  removeHolding: (stockId: string, data: { quantity: number; price: number }) =>
    api.put(`/portfolio/holdings/${stockId}`, data),
  getTransactions: () => api.get('/portfolio/transactions'),
};

// Alert API
export const alertAPI = {
  get: () => api.get('/alerts'),
  create: (data: { stockId: string; targetPrice: number; condition: 'ABOVE' | 'BELOW' }) =>
    api.post('/alerts', data),
  delete: (id: string) => api.delete(`/alerts/${id}`),
  toggle: (id: string) => api.patch(`/alerts/${id}/toggle`),
};

// News API
export const newsAPI = {
  get: (params?: { stockId?: string; sentiment?: string; limit?: number }) =>
    api.get('/news', { params }),
  getMarketNews: () => api.get('/news/market'),
  getStockNews: (symbol: string) => api.get(`/news/stock/${symbol}`),
};

// Market API
export const marketAPI = {
  getStatus: () => api.get('/market/status'),
};

export default api;
