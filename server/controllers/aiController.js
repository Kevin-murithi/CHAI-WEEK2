const aiService = require('../services/aiService');
const Field = require('../models/Field');
const Application = require('../models/Application');
const SensorDevice = require('../models/SensorDevice');
const SensorReading = require('../models/SensorReading');

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
