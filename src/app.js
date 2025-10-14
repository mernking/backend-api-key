const express = require('express');
const bodyParser = require('body-parser');
const requestLogger = require('./middleware/requestLogger');
const rateLimiter = require('./middleware/rateLimiter');
const jwtAuth = require('./middleware/jwtAuth');
const apiKeyAuth = require('./middleware/apiKeyAuth');
const adminAuth = require('./middleware/adminAuth');
const authController = require('./controllers/auth.controller');
const linksController = require('./controllers/links.controller');
const trackController = require('./controllers/track.controller');
const adminController = require('./controllers/admin.controller');
const { setupSwagger, swaggerSpec } = require('./swagger');

const app = express();
app.set('trust proxy', 1); // Trust first proxy
app.use(bodyParser.json());
app.use(requestLogger);
app.use(rateLimiter);

// public api
app.post('/signup', authController.signup);
app.post('/login', authController.login);

// swagger docs
setupSwagger(app);
app.get('/swagger.json', (req, res) => res.json(swaggerSpec));

// API endpoints for authenticated users (JWT)
app.post('/api/api-keys', jwtAuth, authController.createApiKey);

// API-key protected endpoints
app.post('/api/links', apiKeyAuth, linksController.createLink);
app.get('/api/links', apiKeyAuth, linksController.listLinks);
app.put('/api/links/:id', apiKeyAuth, linksController.updateLink);
app.delete('/api/links/:id', apiKeyAuth, linksController.deleteLink);
app.get('/api/links/:slug/stats', apiKeyAuth, linksController.getLinkStats);
app.post('/api/links/bulk', apiKeyAuth, linksController.bulkCreateLinks);
app.put('/api/links/bulk', apiKeyAuth, linksController.bulkUpdateLinks);
app.delete('/api/links/bulk', apiKeyAuth, linksController.bulkDeleteLinks);

// public redirect endpoint (tracks clicks)
app.get('/:slug', trackController.redirectHandler);

// admin routes
app.post('/admin/login', adminController.adminLogin);
app.get('/admin/logs', adminAuth, adminController.getLogs);
app.get('/admin/stats', adminAuth, adminController.getStats);
app.get('/admin/analytics', adminAuth, adminController.getAnalytics);

// admin user management
app.get('/admin/users', adminAuth, adminController.getAdminUsers);
app.post('/admin/users', adminAuth, adminController.createAdminUser);
app.put('/admin/users/:id', adminAuth, adminController.updateAdminUser);
app.delete('/admin/users/:id', adminAuth, adminController.deleteAdminUser);

// admin link management
// admin routes
app.post('/admin/login', adminController.adminLogin);
app.get('/admin/logs', adminAuth, adminController.getLogs);
app.get('/admin/stats', adminAuth, adminController.getStats);
app.get('/admin/analytics', adminAuth, adminController.getAnalytics);

// admin link management
app.get('/admin/links', adminAuth, adminController.getAllLinks);
app.post('/admin/links', adminAuth, adminController.createAdminLink);
app.put('/admin/links/:id', adminAuth, adminController.updateAdminLink);
app.delete('/admin/links/:id', adminAuth, adminController.deleteAdminLink);
app.delete('/admin/links', adminAuth, adminController.bulkDeleteAdminLinks);
app.get('/admin/tags', adminAuth, adminController.getAdminTags);

// health
app.get('/health', (req,res)=>res.json({ok:true}));

module.exports = app;