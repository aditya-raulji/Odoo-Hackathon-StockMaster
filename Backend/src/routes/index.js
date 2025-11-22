import authRoutes from '../modules/auth/auth.routes.js';
import productRoutes from '../modules/products/products.routes.js';
import movementRoutes from '../modules/movements/movements.routes.js';
import countRoutes from '../modules/counts/counts.routes.js';
import locationRoutes from '../modules/locations/locations.routes.js';
import supplierRoutes from '../modules/suppliers/suppliers.routes.js';
import staffRoutes from '../modules/staff/staff.routes.js';
import reportRoutes from '../modules/reports/reports.routes.js';
import searchRoutes from '../modules/search/search.routes.js';
import notificationRoutes from '../modules/notifications/notifications.routes.js';
import auditRoutes from '../modules/audit/audit.routes.js';
import uploadRoutes from '../modules/uploads/uploads.routes.js';

export const registerRoutes = (app) => {
  app.get('/health', (req, res) => {
    res.json({
      ok: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.use('/auth', authRoutes);
  app.use('/products', productRoutes);
  app.use('/movements', movementRoutes);
  app.use('/counts', countRoutes);
  app.use('/locations', locationRoutes);
  app.use('/suppliers', supplierRoutes);
  app.use('/staff', staffRoutes);
  app.use('/reports', reportRoutes);
  app.use('/search', searchRoutes);
  app.use('/notifications', notificationRoutes);
  app.use('/audit-log', auditRoutes);
  app.use('/uploads', uploadRoutes);

  app.use((req, res) => {
    res.status(404).json({
      ok: false,
      error: {
        code: 404,
        message: 'Route not found',
      },
    });
  });
};

export default registerRoutes;
