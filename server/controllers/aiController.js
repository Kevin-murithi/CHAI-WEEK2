const aiService = require('../services/aiService');
const Field = require('../models/Field');
const Application = require('../models/Application');
const SensorDevice = require('../models/SensorDevice');
const SensorReading = require('../models/SensorReading');
const OpenAI = require('openai');

// Test OpenRouter API connectivity
module.exports.testOpenAI = async (req, res) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://openrouter.ai/api/v1"
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: "Hello! Can you confirm that the OpenRouter API is working? Please respond with a simple confirmation."
        }
      ],
      max_tokens: 50,
      temperature: 0.5
    });

    const response = completion.choices[0].message.content;

    res.json({
      success: true,
      message: "OpenAI API is working correctly",
      response: response,
      model: completion.model,
      usage: completion.usage
    });
  } catch (error) {
    console.error('OpenAI API test failed:', error);
    res.status(500).json({
      success: false,
      error: 'OpenAI API test failed',
      details: error.message
    });
  }
};

// Test AI advisory recommendations (no auth required)
module.exports.testAdvisory = async (req, res) => {
  try {
    // Create mock farmer data for testing
    const mockFarmerData = {
      fields: [
        {
          _id: 'test-field-1',
          name: 'North Field',
          areaHa: 5.2,
          crop: 'maize',
          location: 'Farm Location'
        }
      ],
      sensors: [
        {
          type: 'soil',
          soilMoisture: 45,
          temperature: 22,
          capturedAt: new Date().toISOString()
        }
      ],
      applications: [
        {
          status: 'approved',
          amount: 2500,
          purpose: 'Equipment purchase'
        }
      ]
    };

    const advisory = await aiService.generateAdvisoryRecommendations(mockFarmerData);

    res.json({
      success: true,
      message: "AI advisory recommendations generated successfully",
      advisory,
      testData: mockFarmerData
    });
  } catch (error) {
    console.error('AI advisory test failed:', error);
    res.status(500).json({
      success: false,
      error: 'AI advisory test failed',
      details: error.message
    });
  }
};

// Test AI predictive analytics (no auth required)
module.exports.testAnalytics = async (req, res) => {
  try {
    const { fieldId } = req.params;
    const { crop } = req.query;

    // Create mock field data for testing
    const mockFieldData = {
      field: {
        _id: fieldId,
        name: 'Test Field',
        areaHa: 5.2,
        crop: crop || 'maize'
      },
      sensors: [
        {
          type: 'soil',
          soilMoisture: 45,
          temperature: 22,
          capturedAt: new Date().toISOString()
        },
        {
          type: 'weather',
          humidity: 65,
          windSpeed: 12,
          capturedAt: new Date().toISOString()
        }
      ],
      weather: {
        temperature: 25,
        humidity: 70,
        rainfall: 2.5
      },
      crop: crop || 'maize',
      plantingDate: '2025-03-15'
    };

    const analytics = await aiService.generatePredictiveAnalytics(mockFieldData);

    res.json({
      success: true,
      message: "AI predictive analytics generated successfully",
      analytics,
      testData: mockFieldData
    });
  } catch (error) {
    console.error('AI analytics test failed:', error);
    res.status(500).json({
      success: false,
      error: 'AI analytics test failed',
      details: error.message
    });
  }
};

// Get AI-powered advisory recommendations for farmer
module.exports.getAdvisoryRecommendations = async (req, res) => {
  try {
    const farmerId = req.user.id;

    // Gather farmer's data
    const fields = await Field.find({ owner: farmerId }).lean();
    const applications = await Application.find({ farmer: farmerId }).lean();

    // Get sensor data for all fields
    const sensors = [];
    for (const field of fields) {
      const devices = await SensorDevice.find({ fieldId: field._id }).lean();
      for (const device of devices) {
        const readings = await SensorReading.find({ deviceId: device._id })
          .sort({ capturedAt: -1 })
          .limit(10)
          .lean();
        sensors.push(...readings);
      }
    }

    const farmerData = {
      fields,
      applications,
      sensors,
      weather: {}, // Could integrate with weather API
    };

    const advisory = await aiService.generateAdvisoryRecommendations(farmerData);

    res.json({
      success: true,
      advisory,
      dataPoints: {
        fieldsCount: fields.length,
        sensorsCount: sensors.length,
        applicationsCount: applications.length
      }
    });
  } catch (error) {
    console.error('Advisory recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate advisory recommendations' });
  }
};



// Enhanced ClimaScore with AI
module.exports.getEnhancedClimaScore = async (req, res) => {
  try {
    const { fieldId } = req.params;
    const { crop, plantingDate, source } = req.query;
    
    const field = await Field.findById(fieldId).lean();
    if (!field) {
      return res.status(404).json({ error: 'Field not found' });
    }

    // Get base ClimaScore (existing computation)
    const { computeClimaScore } = require('../services/climateService');
    const centroid = polygonCentroid(field.geometry);
    
    const baseScoreData = await computeClimaScore({
      lat: centroid.lat,
      lon: centroid.lon,
      crop: String(crop).toLowerCase(),
      planting_date: plantingDate ? new Date(plantingDate) : null,
      source: source ? String(source).toLowerCase() : undefined
    });

    // Gather context data for AI enhancement
    const sensorTrends = await SensorReading.find({ 
      deviceId: { $in: await SensorDevice.find({ fieldId }).distinct('_id') }
    }).sort({ capturedAt: -1 }).limit(50).lean();

    const historicalPerformance = await Application.find({ 
      field: fieldId 
    }).lean();

    const regionalData = {}; // Could add regional climate/crop data

    const contextData = {
      sensorTrends,
      historicalPerformance,
      regionalData
    };

    const enhancedScore = await aiService.enhanceClimaScore(
      baseScoreData.climascore,
      contextData
    );

    res.json({
      success: true,
      baseScore: baseScoreData,
      enhancedScore,
      field: {
        id: field._id,
        name: field.name,
        area: field.areaHa
      }
    });
  } catch (error) {
    console.error('Enhanced ClimaScore error:', error);
    res.status(500).json({ error: 'Failed to compute enhanced ClimaScore' });
  }
};

// Predictive analytics for field
module.exports.getPredictiveAnalytics = async (req, res) => {
  try {
    const { fieldId } = req.params;
    const { crop, plantingDate } = req.query;
    
    const field = await Field.findById(fieldId).lean();
    if (!field) {
      return res.status(404).json({ error: 'Field not found' });
    }

    // Get recent sensor data
    const devices = await SensorDevice.find({ fieldId }).lean();
    const sensors = [];
    for (const device of devices) {
      const readings = await SensorReading.find({ deviceId: device._id })
        .sort({ capturedAt: -1 })
        .limit(20)
        .lean();
      sensors.push(...readings);
    }

    const fieldData = {
      field,
      sensors,
      weather: {}, // Weather API integration
      crop: crop || 'maize',
      plantingDate: plantingDate || '2025-03-15' // Fixed default date for consistency
    };

    const analytics = await aiService.generatePredictiveAnalytics(fieldData);
    
    res.json({
      success: true,
      analytics,
      field: {
        id: field._id,
        name: field.name,
        area: field.areaHa
      }
    });
  } catch (error) {
    console.error('Predictive analytics error:', error);
    res.status(500).json({ error: 'Failed to generate predictive analytics' });
  }
};

// Helper function (duplicate from farmerController - should be moved to utils)
function polygonCentroid(polygon) {
  const ring = polygon.coordinates?.[0] || [];
  if (ring.length === 0) return null;
  let x = 0, y = 0, f = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i+1];
    const a = x1 * y2 - x2 * y1;
    f += a; x += (x1 + x2) * a; y += (y1 + y2) * a;
  }
  if (f === 0) {
    const sum = ring.reduce((acc, [lng,lat]) => { acc.lng += lng; acc.lat += lat; return acc; }, {lng:0, lat:0});
    const n = ring.length;
    return { lat: sum.lat / n, lon: sum.lng / n };
  }
  f *= 0.5; x /= (6*f); y /= (6*f);
  return { lat: y, lon: x };
}
