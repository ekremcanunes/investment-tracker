import axios from 'axios'

const api = axios.create({ baseURL: '', withCredentials: true })

export const assetApi = {
  getAll: () => api.get('/api/assets'),
  buy: (data) => api.post('/api/assets/buy', data),
  sell: (id, data) => api.post(`/api/assets/${id}/sell`, data),
  update: (id, data) => api.put(`/api/assets/${id}`, data),
  delete: (id) => api.delete(`/api/assets/${id}`),
}

export const dashboardApi = {
  get: () => api.get('/api/dashboard'),
}

export const transactionApi = {
  getAll: (params) => api.get('/api/transactions', { params }),
  getById: (id) => api.get(`/api/transactions/${id}`),
  create: (data) => api.post('/api/transactions', data),
  update: (id, data) => api.put(`/api/transactions/${id}`, data),
  delete: (id) => api.delete(`/api/transactions/${id}`),
  getSummary: (params) => api.get('/api/transactions/summary', { params }),
}
