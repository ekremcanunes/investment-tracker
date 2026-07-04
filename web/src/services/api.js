import axios from 'axios'

const api = axios.create({ baseURL: '', withCredentials: true })

export const portfolioApi = {
  getAll: () => api.get('/api/portfolios'),
  getById: (id) => api.get(`/api/portfolios/${id}`),
  create: (data) => api.post('/api/portfolios', data),
  delete: (id) => api.delete(`/api/portfolios/${id}`),
  getAssets: (id) => api.get(`/api/portfolios/${id}/assets`),
  addAsset: (id, data) => api.post(`/api/portfolios/${id}/assets`, data),
  deleteAsset: (portfolioId, assetId) => api.delete(`/api/portfolios/${portfolioId}/assets/${assetId}`),
  getSummary: (id) => api.get(`/api/portfolios/${id}/summary`),
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
