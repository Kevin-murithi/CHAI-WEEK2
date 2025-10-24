const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Test Gemini API connectivity
router.get('/test', chatbotController.testGemini);

// Post-harvest chatbot with context
router.post('/post-harvest', chatbotController.postHarvestChat);

// General chatbot endpoint
router.post('/chat', chatbotController.generalChat);

module.exports = router;
