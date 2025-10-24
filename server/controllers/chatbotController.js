const geminiService = require('../services/geminiService');

// Post-harvest chatbot endpoint
module.exports.postHarvestChat = async (req, res) => {
  try {
    const { message, cropData, sensorData } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    if (!cropData || !sensorData) {
      return res.status(400).json({
        success: false,
        error: 'Crop data and sensor data are required'
      });
    }

    const result = await geminiService.chatWithContext(message, cropData, sensorData);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate AI response'
      });
    }

    res.json({
      success: true,
      response: result.response,
      model: result.model
    });

  } catch (error) {
    console.error('Post-harvest chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat request',
      details: error.message
    });
  }
};

// General chatbot endpoint (without context)
module.exports.generalChat = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const result = await geminiService.generateResponse(message, context);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate AI response'
      });
    }

    res.json({
      success: true,
      response: result.response,
      model: result.model
    });

  } catch (error) {
    console.error('General chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat request',
      details: error.message
    });
  }
};

// Test endpoint to verify Gemini API connectivity
module.exports.testGemini = async (req, res) => {
  try {
    const result = await geminiService.generateResponse(
      'Hello! Please confirm that you are working correctly by responding with a simple greeting.'
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Gemini API test failed'
      });
    }

    res.json({
      success: true,
      message: 'Gemini API is working correctly',
      response: result.response,
      model: result.model
    });

  } catch (error) {
    console.error('Gemini API test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Gemini API test failed',
      details: error.message
    });
  }
};
