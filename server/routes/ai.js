const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');

// All AI routes require authentication and farmer role
router.use(requireRole(['farmer']));

// Advisory recommendations
router.get('/advisory', aiController.getAdvisoryRecommendations);

// Enhanced ClimaScore
router.get('/climascore/:fieldId', aiController.getEnhancedClimaScore);

// Predictive analytics
router.get('/analytics/:fieldId', aiController.getPredictiveAnalytics);

module.exports = router;
