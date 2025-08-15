const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const controller = require('../controllers/analyticsController');

const router = express.Router();

/**
 * @swagger
 * /api/analytics/summary:
 *   get:
 *     summary: Get admin dashboard summary metrics
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/summary', protect, authorize('admin'), controller.getSummary);

/**
 * @swagger
 * /api/analytics/attendance:
 *   get:
 *     summary: Get attendance analytics data
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/attendance', protect, authorize('admin'), controller.getAttendance);

module.exports = router;

// Mount in your main server file:
// const analyticsRouter = require('./routes/analytics');
// app.use('/api/analytics', analyticsRouter);
