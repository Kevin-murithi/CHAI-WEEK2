const { computeClimaScore } = require('./climateService');

// Mock AI service - replace with actual OpenAI/Claude API integration
class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || 'mock-key';
    this.cache = new Map(); // Simple in-memory cache
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
  }

  // Deterministic pseudo-random based on seed
  seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // Generate consistent seed from field data
  generateSeed(fieldData) {
    const { fieldId, crop, plantingDate, areaHa, field } = fieldData;
    const actualFieldId = fieldId || field?._id || field?.id;
    const actualAreaHa = areaHa || field?.areaHa;
    
    let seed = 0;
    
    // Create deterministic seed from field characteristics
    if (actualFieldId) {
      for (let i = 0; i < actualFieldId.length; i++) {
        seed += actualFieldId.charCodeAt(i) * (i + 1);
      }
    }
    
    if (crop) {
      seed += crop.length * 1000;
    }
    
    if (plantingDate) {
      seed += new Date(plantingDate).getTime() / 1000000;
    }
    
    if (actualAreaHa) {
      seed += actualAreaHa * 100;
    }
    
    return Math.abs(seed) % 1000000;
  }

  getCacheKey(type, fieldData) {
    const { fieldId, crop, plantingDate, field } = fieldData;
    const actualFieldId = fieldId || field?._id || field?.id;
    return `${type}_${actualFieldId}_${crop}_${plantingDate}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async generateAdvisoryRecommendations(farmerData) {
    try {
      const { fields, sensors, weather, applications } = farmerData;
      
      // Mock AI response - replace with actual API call
      const recommendations = await this.mockAIRecommendations(farmerData);
      
      return {
        recommendations,
        generatedAt: new Date(),
        confidence: 0.85
      };
    } catch (error) {
      console.error('AI Advisory generation failed:', error);
      return this.getFallbackRecommendations();
    }
  }

  async enhanceClimaScore(baseScore, contextData) {
    try {
      const { sensorTrends, historicalPerformance, regionalData } = contextData;
      
      // AI-enhanced risk factors
      const aiFactors = {
        sensorTrendRisk: this.analyzeSensorTrends(sensorTrends),
        historicalRisk: this.analyzeHistoricalPerformance(historicalPerformance),
        regionalRisk: this.analyzeRegionalPatterns(regionalData)
      };

      // Weighted enhancement to base score
      const enhancement = (aiFactors.sensorTrendRisk * 0.3 + 
                          aiFactors.historicalRisk * 0.4 + 
                          aiFactors.regionalRisk * 0.3);
      
      const enhancedScore = Math.max(0, Math.min(100, baseScore + enhancement));
      
      return {
        originalScore: baseScore,
        enhancedScore: Math.round(enhancedScore * 100) / 100,
        aiFactors,
        confidence: 0.78
      };
    } catch (error) {
      console.error('ClimaScore enhancement failed:', error);
      return { originalScore: baseScore, enhancedScore: baseScore, confidence: 0.5 };
    }
  }

  async generatePredictiveAnalytics(fieldData) {
    try {
      // Debug logging
      console.log('Generating analytics for field:', fieldData.field?._id, 'crop:', fieldData.crop);
      
      const cacheKey = this.getCacheKey('analytics', fieldData);
      console.log('Cache key:', cacheKey);
      
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('Returning cached result for:', cacheKey);
        return cached;
      }

      const { field, sensors, weather, crop, plantingDate } = fieldData;
      
      const analytics = {
        yieldPrediction: await this.predictYield(fieldData),
        riskWarnings: await this.generateRiskWarnings(fieldData),
        timingRecommendations: await this.generateTimingRecommendations(fieldData)
      };

      const result = {
        ...analytics,
        generatedAt: new Date(),
        confidence: 0.82
      };

      console.log('Generated new result for field:', field?._id, 'yield:', analytics.yieldPrediction?.estimatedYield);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Predictive analytics failed:', error);
      return this.getFallbackAnalytics();
    }
  }

  // Mock implementations - replace with actual AI models
  async mockAIRecommendations(farmerData) {
    const { fields, sensors } = farmerData;
    
    const recommendations = [];
    
    if (fields?.length) {
      recommendations.push({
        id: 'irrigation-' + Date.now(),
        type: 'irrigation',
        priority: 'high',
        title: 'Optimize Irrigation Schedule',
        description: 'Based on soil moisture readings and weather forecast, adjust irrigation timing to improve water efficiency.',
        actionItems: [
          'Check soil moisture sensors daily',
          'Reduce watering frequency by 15% this week',
          'Focus irrigation on morning hours (6-8 AM)'
        ],
        fieldId: fields[0]._id,
        confidence: 0.87
      });
    }

    if (sensors?.length) {
      recommendations.push({
        id: 'fertilizer-' + Date.now(),
        type: 'fertilizer',
        priority: 'medium',
        title: 'Nutrient Management Alert',
        description: 'Sensor data indicates nitrogen levels are below optimal. Consider targeted fertilizer application.',
        actionItems: [
          'Test soil pH levels',
          'Apply nitrogen-rich fertilizer to affected areas',
          'Monitor sensor readings for improvement'
        ],
        fieldId: fields[0]._id,
        confidence: 0.79
      });
    }

    recommendations.push({
      id: 'weather-' + Date.now(),
      type: 'weather',
      priority: 'medium',
      title: 'Weather Pattern Advisory',
      description: 'Upcoming weather patterns suggest increased humidity. Monitor for potential fungal issues.',
      actionItems: [
        'Increase field monitoring frequency',
        'Prepare fungicide treatments if needed',
        'Ensure proper field drainage'
      ],
      confidence: 0.73
    });

    return recommendations;
  }

  analyzeSensorTrends(sensorData) {
    if (!sensorData?.length) return 0;
    
    // Mock trend analysis - replace with actual ML model
    const avgMoisture = sensorData.reduce((sum, s) => sum + (s.soilMoisture || 50), 0) / sensorData.length;
    const avgTemp = sensorData.reduce((sum, s) => sum + (s.temperature || 25), 0) / sensorData.length;
    
    let risk = 0;
    if (avgMoisture < 30) risk += 5; // Drought risk
    if (avgMoisture > 80) risk += 3; // Flood risk
    if (avgTemp > 35) risk += 4; // Heat stress
    if (avgTemp < 10) risk += 6; // Cold stress
    
    return Math.min(10, risk);
  }

  analyzeHistoricalPerformance(historicalData) {
    if (!historicalData?.length) return 0;
    
    // Mock historical analysis
    const successRate = historicalData.filter(h => h.status === 'approved').length / historicalData.length;
    return successRate > 0.8 ? -2 : successRate < 0.5 ? 5 : 0;
  }

  analyzeRegionalPatterns(regionalData) {
    // Mock regional analysis - deterministic based on current date
    const dayOfYear = Math.floor((Date.now() / (1000 * 60 * 60 * 24)) % 365);
    return Math.sin(dayOfYear / 365 * Math.PI * 2) * 1.5; // Seasonal pattern between -1.5 and 1.5
  }

  async predictYield(fieldData) {
    const { field, crop } = fieldData;
    
    // Generate deterministic seed for consistent predictions
    const seed = this.generateSeed({
      fieldId: field._id,
      crop,
      plantingDate: fieldData.plantingDate,
      areaHa: field.areaHa
    });
    
    // Mock yield prediction with deterministic randomness
    const baseYield = {
      'maize': 8.5,
      'wheat': 4.2,
      'sorghum': 6.8
    }[crop] || 5.0;

    const areaHa = field.areaHa || 1;
    const variabilityFactor = 0.85 + this.seededRandom(seed) * 0.3;
    const predictedYield = baseYield * areaHa * variabilityFactor;
    
    return {
      estimatedYield: Math.round(predictedYield * 100) / 100,
      unit: 'tons',
      confidenceRange: {
        min: Math.round(predictedYield * 0.8 * 100) / 100,
        max: Math.round(predictedYield * 1.2 * 100) / 100
      }
    };
  }

  async generateRiskWarnings(fieldData) {
    const { field, crop } = fieldData;
    const seed = this.generateSeed({
      fieldId: field._id,
      crop,
      plantingDate: fieldData.plantingDate,
      areaHa: field.areaHa
    });
    
    const warnings = [];
    
    // Deterministic risk warnings based on field characteristics
    const droughtRisk = this.seededRandom(seed + 1);
    const pestRisk = this.seededRandom(seed + 2);
    
    if (droughtRisk > 0.7) {
      warnings.push({
        type: 'drought',
        severity: droughtRisk > 0.85 ? 'high' : 'medium',
        message: 'Extended dry period forecasted. Monitor soil moisture closely.',
        timeframe: '7-14 days'
      });
    }
    
    if (pestRisk > 0.8) {
      warnings.push({
        type: 'pest',
        severity: 'low',
        message: 'Seasonal pest activity increasing in your region.',
        timeframe: '2-3 weeks'
      });
    }

    return warnings;
  }

  async generateTimingRecommendations(fieldData) {
    const { crop, plantingDate } = fieldData;
    
    const recommendations = [];
    
    // Mock timing recommendations
    const plantDate = new Date(plantingDate);
    const now = new Date();
    const daysSincePlanting = Math.floor((now - plantDate) / (1000 * 60 * 60 * 24));
    
    if (daysSincePlanting > 30 && daysSincePlanting < 60) {
      recommendations.push({
        activity: 'fertilization',
        recommendedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: 'Apply mid-season fertilizer for optimal growth'
      });
    }
    
    if (daysSincePlanting > 80) {
      recommendations.push({
        activity: 'harvest_prep',
        recommendedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        description: 'Begin harvest preparation and equipment checks'
      });
    }

    return recommendations;
  }

  getFallbackRecommendations() {
    return {
      recommendations: [{
        id: 'fallback-' + Date.now(),
        type: 'general',
        priority: 'low',
        title: 'General Farming Best Practices',
        description: 'Continue following standard agricultural practices for your crop type.',
        actionItems: [
          'Monitor field conditions regularly',
          'Maintain proper irrigation schedule',
          'Keep records of all farming activities'
        ],
        confidence: 0.5
      }],
      generatedAt: new Date(),
      confidence: 0.5
    };
  }

  getFallbackAnalytics() {
    return {
      yieldPrediction: { estimatedYield: 0, unit: 'tons', confidenceRange: { min: 0, max: 0 } },
      riskWarnings: [],
      timingRecommendations: [],
      generatedAt: new Date(),
      confidence: 0.3
    };
  }
}

module.exports = new AIService();
