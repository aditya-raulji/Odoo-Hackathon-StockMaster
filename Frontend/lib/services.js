import { api } from './api';

// Products
export const productService = {
  getAll: (page = 1, limit = 20, filters = {}) =>
    api.get('/products', { page, limit, ...filters }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.del(`/products/${id}`),
};

// Locations
export const locationService = {
  getAll: (page = 1, limit = 20, filters = {}) =>
    api.get('/locations', { page, limit, ...filters }),
  getById: (id) => api.get(`/locations/${id}`),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.del(`/locations/${id}`),
};

// Suppliers
export const supplierService = {
  getAll: (page = 1, limit = 20, filters = {}) =>
    api.get('/suppliers', { page, limit, ...filters }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.del(`/suppliers/${id}`),
};

// Stock Movements
export const movementService = {
  getAll: (page = 1, limit = 20, filters = {}) =>
    api.get('/movements', { page, limit, ...filters }),
  getById: (id) => api.get(`/movements/${id}`),
  createReceipt: (data) => api.post('/movements/receipts', data),
  createDelivery: (data) => api.post('/movements/deliveries', data),
  createTransfer: (data) => api.post('/movements/transfers', data),
  createAdjustment: (data) => api.post('/movements/adjustments', data),
  updateStatus: (id, status) => api.put(`/movements/${id}/status`, { status }),
  confirmPick: (id, pickedLines) => api.post(`/movements/${id}/confirm-pick`, { pickedLines }),
  complete: (id) => api.post(`/movements/${id}/complete`, {}),
};

// Inventory Counts
export const countService = {
  getAll: (page = 1, limit = 20, filters = {}) =>
    api.get('/counts', { page, limit, ...filters }),
  create: (data) => api.post('/counts', data),
  updateLine: (id, lineId, countedQuantity) =>
    api.put(`/counts/${id}/line`, { lineId, countedQuantity }),
  reconcile: (id) => api.post(`/counts/${id}/reconcile`, {}),
};

// Staff
export const staffService = {
  getAll: (page = 1, limit = 20, filters = {}) =>
    api.get('/staff', { page, limit, ...filters }),
  getById: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  updateRole: (id, role) => api.put(`/staff/${id}/role`, { role }),
  delete: (id) => api.del(`/staff/${id}`),
};

// Reports
export const reportService = {
  getStockValuation: (filters = {}) =>
    api.get('/reports/stock-val', filters),
  getMovementsReport: (filters = {}) =>
    api.get('/reports/movements', filters),
  getAbcAnalysis: (filters = {}) =>
    api.get('/reports/abc-analysis', filters),
};

// Search
export const searchService = {
  searchProducts: (q, filters = {}) =>
    api.get('/search/products', { q, ...filters }),
  searchSuppliers: (q, filters = {}) =>
    api.get('/search/suppliers', { q, ...filters }),
};

// Notifications
export const notificationService = {
  getAll: (page = 1, limit = 20) =>
    api.get('/notifications', { page, limit }),
  markAsRead: (id) => api.post(`/notifications/${id}/mark-read`, {}),
  markAllAsRead: () => api.post('/notifications/mark-all-read', {}),
};

// Audit Log
export const auditService = {
  getAll: (page = 1, limit = 20, filters = {}) =>
    api.get('/audit-log', { page, limit, ...filters }),
  getById: (id) => api.get(`/audit-log/${id}`),
  getByEntity: (entity, entityId, page = 1, limit = 20) =>
    api.get(`/audit-log/entity/${entity}/${entityId}`, { page, limit }),
};
