const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');

// Test OpenAI API connectivity (no auth required)
router.get('/test', aiController.testOpenAI);

// Temporary test endpoint for AI recommendations (no auth required)
router.get('/test-advisory', aiController.testAdvisory);

// Temporary test endpoint for AI analytics (no auth required)
router.get('/test-analytics/:fieldId', aiController.testAnalytics);

// All AI routes require authentication and farmer role
router.use(requireRole(['farmer']));

// Advisory recommendations
router.get('/advisory', aiController.getAdvisoryRecommendations);

// Enhanced ClimaScore
router.get('/climascore/:fieldId', aiController.getEnhancedClimaScore);

// Predictive analytics
router.get('/analytics/:fieldId', aiController.getPredictiveAnalytics);

module.exports = router;
