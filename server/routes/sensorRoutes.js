const { Router } = require('express');
const { requireRole } = require('../middleware/authMiddleware');
const sensors = require('../controllers/sensorsController');

const router = Router();

// Farmer-protected sensor routes
router.use(requireRole(['farmer']));

router.post('/devices', sensors.registerDevice);
router.get('/fields/:fieldId/devices', sensors.listDevices);
router.post('/devices/:deviceId/readings', sensors.ingestReading);
router.get('/fields/:fieldId/latest', sensors.latestForField);

module.exports = router;
