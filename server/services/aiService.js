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
        timingRecommendations: await this.generateTimingRecommendations(fieldData),
        satelliteAnalysis: await this.analyzeSatelliteData(fieldData),
        soilAnalysis: await this.analyzeSoilData(fieldData),
        plantingWindowAdvice: await this.generatePlantingWindowAdvice(fieldData),
        fertilizerRecommendations: await this.generateFertilizerRecommendations(fieldData),
        fieldHealthScore: await this.calculateFieldHealthScore(fieldData)
      };

      const result = {
        ...analytics,
        generatedAt: new Date(),
        confidence: 0.87
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

  // Advanced field analysis methods
  async analyzeSatelliteData(fieldData) {
    const { field, crop } = fieldData;
    const seed = this.generateSeed(fieldData);
    
    // Mock satellite data analysis - replace with actual satellite API
    const ndviValue = 0.3 + this.seededRandom(seed + 10) * 0.5; // NDVI between 0.3-0.8
    const vegetationHealth = ndviValue > 0.6 ? 'excellent' : ndviValue > 0.4 ? 'good' : 'poor';
    
    return {
      ndvi: Math.round(ndviValue * 100) / 100,
      vegetationHealth,
      cropStage: this.determineCropStage(fieldData),
      stressIndicators: this.detectStressFromSatellite(ndviValue, seed),
      coveragePercentage: Math.round((85 + this.seededRandom(seed + 11) * 10) * 100) / 100,
      lastUpdated: new Date(Date.now() - Math.floor(this.seededRandom(seed + 12) * 3) * 24 * 60 * 60 * 1000)
    };
  }

  async analyzeSoilData(fieldData) {
    const { field, sensors } = fieldData;
    const seed = this.generateSeed(fieldData);
    
    // Combine sensor data with AI analysis
    const sensorSoilData = sensors?.filter(s => s.type === 'soil') || [];
    
    const soilAnalysis = {
      ph: this.calculateSoilPH(sensorSoilData, seed),
      nutrients: this.analyzeSoilNutrients(sensorSoilData, seed),
      organicMatter: Math.round((2.5 + this.seededRandom(seed + 20) * 2) * 100) / 100,
      compaction: this.assessSoilCompaction(seed),
      drainage: this.assessDrainage(sensorSoilData, seed),
      temperature: this.calculateSoilTemperature(sensorSoilData, seed),
      salinity: Math.round((0.1 + this.seededRandom(seed + 25) * 0.3) * 100) / 100
    };
    
    return {
      ...soilAnalysis,
      overallHealth: this.calculateSoilHealth(soilAnalysis),
      recommendations: this.generateSoilImprovementTips(soilAnalysis)
    };
  }

  async generatePlantingWindowAdvice(fieldData) {
    const { field, crop } = fieldData;
    const seed = this.generateSeed(fieldData);
    
    // Analyze weather patterns and soil conditions for optimal planting
    const currentDate = new Date();
    const optimalWindows = this.calculateOptimalPlantingWindows(crop, field, seed);
    
    return {
      currentSeason: this.getCurrentSeason(),
      optimalWindows,
      nextBestWindow: this.getNextPlantingWindow(optimalWindows, currentDate),
      riskFactors: this.assessPlantingRisks(fieldData, seed),
      soilReadiness: this.assessSoilReadiness(fieldData, seed),
      weatherForecast: this.generateWeatherInsights(seed)
    };
  }

  async generateFertilizerRecommendations(fieldData) {
    const { field, crop, sensors } = fieldData;
    const seed = this.generateSeed(fieldData);
    const soilData = await this.analyzeSoilData(fieldData);
    
    const recommendations = [];
    
    // Nitrogen recommendations
    if (soilData.nutrients.nitrogen < 50) {
      recommendations.push({
        type: 'nitrogen',
        product: 'Urea (46-0-0)',
        amount: Math.round((20 + this.seededRandom(seed + 30) * 15) * field.areaHa),
        unit: 'kg',
        timing: 'Apply 2 weeks after planting',
        reason: 'Low nitrogen levels detected in soil analysis',
        priority: 'high',
        cost: this.estimateFertilizerCost('nitrogen', field.areaHa, seed)
      });
    }
    
    // Phosphorus recommendations
    if (soilData.nutrients.phosphorus < 30) {
      recommendations.push({
        type: 'phosphorus',
        product: 'Triple Superphosphate (0-46-0)',
        amount: Math.round((15 + this.seededRandom(seed + 31) * 10) * field.areaHa),
        unit: 'kg',
        timing: 'Apply at planting',
        reason: 'Phosphorus deficiency may limit root development',
        priority: 'medium',
        cost: this.estimateFertilizerCost('phosphorus', field.areaHa, seed)
      });
    }
    
    // Potassium recommendations
    if (soilData.nutrients.potassium < 40) {
      recommendations.push({
        type: 'potassium',
        product: 'Muriate of Potash (0-0-60)',
        amount: Math.round((12 + this.seededRandom(seed + 32) * 8) * field.areaHa),
        unit: 'kg',
        timing: 'Apply during flowering stage',
        reason: 'Potassium supports disease resistance and yield quality',
        priority: 'medium',
        cost: this.estimateFertilizerCost('potassium', field.areaHa, seed)
      });
    }
    
    // Organic matter recommendations
    if (soilData.organicMatter < 3.0) {
      recommendations.push({
        type: 'organic',
        product: 'Compost or Well-rotted Manure',
        amount: Math.round((2 + this.seededRandom(seed + 33) * 1) * field.areaHa),
        unit: 'tons',
        timing: 'Apply before planting season',
        reason: 'Low organic matter affects soil structure and nutrient retention',
        priority: 'high',
        cost: this.estimateFertilizerCost('organic', field.areaHa, seed)
      });
    }
    
    return {
      recommendations,
      totalEstimatedCost: recommendations.reduce((sum, rec) => sum + rec.cost, 0),
      applicationSchedule: this.createFertilizerSchedule(recommendations),
      expectedYieldIncrease: Math.round((5 + this.seededRandom(seed + 35) * 10) * 100) / 100
    };
  }

  async calculateFieldHealthScore(fieldData) {
    const soilData = await this.analyzeSoilData(fieldData);
    const satelliteData = await this.analyzeSatelliteData(fieldData);
    const { sensors } = fieldData;
    const seed = this.generateSeed(fieldData);
    
    // Calculate weighted health score
    const soilScore = this.calculateSoilHealth(soilData);
    const vegetationScore = satelliteData.ndvi * 100;
    const sensorScore = this.calculateSensorHealthScore(sensors, seed);
    
    const overallScore = Math.round((
      soilScore * 0.4 + 
      vegetationScore * 0.35 + 
      sensorScore * 0.25
    ));
    
    return {
      overallScore: Math.min(100, Math.max(0, overallScore)),
      breakdown: {
        soilHealth: soilScore,
        vegetationHealth: Math.round(vegetationScore),
        sensorHealth: sensorScore
      },
      status: overallScore > 80 ? 'excellent' : overallScore > 60 ? 'good' : overallScore > 40 ? 'fair' : 'poor',
      improvementAreas: this.identifyImprovementAreas(soilData, satelliteData, sensors)
    };
  }

  // Helper methods for advanced analysis
  calculateSoilPH(sensorData, seed) {
    const sensorPH = sensorData.find(s => s.ph)?.ph;
    return sensorPH || Math.round((6.0 + this.seededRandom(seed + 15) * 2.0) * 100) / 100;
  }

  analyzeSoilNutrients(sensorData, seed) {
    return {
      nitrogen: Math.round((30 + this.seededRandom(seed + 16) * 40)),
      phosphorus: Math.round((20 + this.seededRandom(seed + 17) * 30)),
      potassium: Math.round((25 + this.seededRandom(seed + 18) * 35))
    };
  }

  assessSoilCompaction(seed) {
    const compactionLevel = this.seededRandom(seed + 21);
    return compactionLevel > 0.7 ? 'high' : compactionLevel > 0.4 ? 'moderate' : 'low';
  }

  assessDrainage(sensorData, seed) {
    const moistureReadings = sensorData.filter(s => s.soilMoisture).map(s => s.soilMoisture);
    const avgMoisture = moistureReadings.length ? 
      moistureReadings.reduce((a, b) => a + b, 0) / moistureReadings.length :
      50 + this.seededRandom(seed + 22) * 30;
    
    return avgMoisture > 80 ? 'poor' : avgMoisture > 60 ? 'moderate' : 'good';
  }

  calculateSoilTemperature(sensorData, seed) {
    const tempReadings = sensorData.filter(s => s.temperature).map(s => s.temperature);
    return tempReadings.length ?
      Math.round(tempReadings.reduce((a, b) => a + b, 0) / tempReadings.length * 100) / 100 :
      Math.round((18 + this.seededRandom(seed + 23) * 12) * 100) / 100;
  }

  calculateSoilHealth(soilData) {
    let score = 50; // Base score
    
    // pH factor
    const idealPH = 6.5;
    const phDiff = Math.abs(soilData.ph - idealPH);
    score += (1 - phDiff / 2) * 20;
    
    // Organic matter factor
    score += Math.min(soilData.organicMatter / 4 * 15, 15);
    
    // Drainage factor
    if (soilData.drainage === 'good') score += 10;
    else if (soilData.drainage === 'moderate') score += 5;
    
    // Compaction factor
    if (soilData.compaction === 'low') score += 5;
    else if (soilData.compaction === 'high') score -= 10;
    
    return Math.round(Math.min(100, Math.max(0, score)));
  }

  generateSoilImprovementTips(soilData) {
    const tips = [];
    
    if (soilData.ph < 6.0) {
      tips.push('Apply lime to raise soil pH for better nutrient availability');
    } else if (soilData.ph > 7.5) {
      tips.push('Consider sulfur application to lower soil pH');
    }
    
    if (soilData.organicMatter < 3.0) {
      tips.push('Increase organic matter through compost or cover crops');
    }
    
    if (soilData.compaction === 'high') {
      tips.push('Consider deep tillage or subsoiling to reduce compaction');
    }
    
    if (soilData.drainage === 'poor') {
      tips.push('Improve drainage through tile installation or raised beds');
    }
    
    return tips;
  }

  determineCropStage(fieldData) {
    const { plantingDate } = fieldData;
    if (!plantingDate) return 'unknown';
    
    const daysSincePlanting = Math.floor((Date.now() - new Date(plantingDate)) / (1000 * 60 * 60 * 24));
    
    if (daysSincePlanting < 14) return 'germination';
    if (daysSincePlanting < 45) return 'vegetative';
    if (daysSincePlanting < 75) return 'flowering';
    if (daysSincePlanting < 105) return 'grain_filling';
    return 'maturity';
  }

  detectStressFromSatellite(ndvi, seed) {
    const stressIndicators = [];
    
    if (ndvi < 0.4) {
      stressIndicators.push({
        type: 'vegetation_stress',
        severity: ndvi < 0.3 ? 'high' : 'moderate',
        description: 'Low vegetation index indicates potential stress'
      });
    }
    
    if (this.seededRandom(seed + 40) > 0.8) {
      stressIndicators.push({
        type: 'water_stress',
        severity: 'moderate',
        description: 'Irregular vegetation patterns suggest water stress'
      });
    }
    
    return stressIndicators;
  }

  calculateOptimalPlantingWindows(crop, field, seed) {
    const windows = [];
    const currentYear = new Date().getFullYear();
    
    // Crop-specific planting windows
    const cropWindows = {
      'maize': [{ start: 'March 15', end: 'May 15' }, { start: 'September 1', end: 'October 15' }],
      'wheat': [{ start: 'October 1', end: 'December 15' }],
      'sorghum': [{ start: 'March 1', end: 'April 30' }, { start: 'August 15', end: 'September 30' }]
    };
    
    const defaultWindows = cropWindows[crop] || cropWindows['maize'];
    
    defaultWindows.forEach((window, index) => {
      const riskFactor = this.seededRandom(seed + 50 + index);
      windows.push({
        ...window,
        year: currentYear,
        riskLevel: riskFactor > 0.7 ? 'high' : riskFactor > 0.4 ? 'moderate' : 'low',
        confidence: Math.round((0.7 + riskFactor * 0.2) * 100)
      });
    });
    
    return windows;
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  getNextPlantingWindow(windows, currentDate) {
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    
    for (const window of windows) {
      const startDate = new Date(`${window.start}, ${window.year}`);
      if (startDate > currentDate) {
        return {
          ...window,
          daysUntil: Math.ceil((startDate - currentDate) / (1000 * 60 * 60 * 24))
        };
      }
    }
    
    // If no window this year, return first window of next year
    const nextYearWindow = { ...windows[0], year: currentDate.getFullYear() + 1 };
    const nextStartDate = new Date(`${nextYearWindow.start}, ${nextYearWindow.year}`);
    return {
      ...nextYearWindow,
      daysUntil: Math.ceil((nextStartDate - currentDate) / (1000 * 60 * 60 * 24))
    };
  }

  assessPlantingRisks(fieldData, seed) {
    const risks = [];
    const riskFactors = {
      drought: this.seededRandom(seed + 60),
      flood: this.seededRandom(seed + 61),
      frost: this.seededRandom(seed + 62),
      pest: this.seededRandom(seed + 63)
    };
    
    Object.entries(riskFactors).forEach(([risk, factor]) => {
      if (factor > 0.6) {
        risks.push({
          type: risk,
          probability: Math.round(factor * 100),
          mitigation: this.getRiskMitigation(risk)
        });
      }
    });
    
    return risks;
  }

  assessSoilReadiness(fieldData, seed) {
    const readinessScore = 60 + this.seededRandom(seed + 70) * 30;
    return {
      score: Math.round(readinessScore),
      status: readinessScore > 80 ? 'ready' : readinessScore > 60 ? 'nearly_ready' : 'not_ready',
      factors: {
        moisture: readinessScore > 70 ? 'optimal' : 'needs_attention',
        temperature: readinessScore > 75 ? 'optimal' : 'suboptimal',
        structure: readinessScore > 65 ? 'good' : 'needs_improvement'
      }
    };
  }

  generateWeatherInsights(seed) {
    return {
      temperature: {
        trend: this.seededRandom(seed + 80) > 0.5 ? 'warming' : 'cooling',
        average: Math.round((22 + this.seededRandom(seed + 81) * 8) * 10) / 10
      },
      precipitation: {
        forecast: this.seededRandom(seed + 82) > 0.6 ? 'above_normal' : 'normal',
        amount: Math.round((50 + this.seededRandom(seed + 83) * 100) * 10) / 10
      },
      confidence: Math.round((0.7 + this.seededRandom(seed + 84) * 0.2) * 100)
    };
  }

  estimateFertilizerCost(type, areaHa, seed) {
    const baseCosts = {
      nitrogen: 1.2,
      phosphorus: 1.8,
      potassium: 1.5,
      organic: 25
    };
    
    const baseCost = baseCosts[type] || 1.0;
    const variability = 0.8 + this.seededRandom(seed + 90) * 0.4;
    return Math.round(baseCost * areaHa * variability * 100) / 100;
  }

  createFertilizerSchedule(recommendations) {
    return recommendations.map(rec => ({
      product: rec.product,
      timing: rec.timing,
      amount: `${rec.amount} ${rec.unit}`,
      priority: rec.priority
    })).sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  calculateSensorHealthScore(sensors, seed) {
    if (!sensors?.length) return 50;
    
    const activeDevices = sensors.filter(s => s.status === 'active').length;
    const totalDevices = sensors.length;
    const baseScore = (activeDevices / totalDevices) * 60;
    
    // Add variability based on sensor readings
    const variability = this.seededRandom(seed + 100) * 20;
    return Math.round(Math.min(100, baseScore + variability));
  }

  identifyImprovementAreas(soilData, satelliteData, sensors) {
    const areas = [];
    
    if (soilData.overallHealth < 70) {
      areas.push({
        area: 'soil_health',
        priority: 'high',
        description: 'Soil conditions need improvement for optimal crop growth'
      });
    }
    
    if (satelliteData.ndvi < 0.5) {
      areas.push({
        area: 'vegetation_health',
        priority: 'high',
        description: 'Vegetation shows signs of stress or poor growth'
      });
    }
    
    if (!sensors?.length || sensors.filter(s => s.status === 'active').length < 2) {
      areas.push({
        area: 'monitoring',
        priority: 'medium',
        description: 'Increase sensor coverage for better field monitoring'
      });
    }
    
    return areas;
  }

  getRiskMitigation(riskType) {
    const mitigations = {
      drought: 'Install irrigation systems and improve water retention',
      flood: 'Improve drainage and consider raised planting beds',
      frost: 'Use frost protection methods and select cold-resistant varieties',
      pest: 'Implement integrated pest management practices'
    };
    
    return mitigations[riskType] || 'Monitor conditions closely and consult agricultural experts';
  }

  getFallbackAnalytics() {
    return {
      yieldPrediction: { estimatedYield: 0, unit: 'tons', confidenceRange: { min: 0, max: 0 } },
      riskWarnings: [],
      timingRecommendations: [],
      satelliteAnalysis: { ndvi: 0, vegetationHealth: 'unknown' },
      soilAnalysis: { overallHealth: 'unknown' },
      plantingWindowAdvice: { optimalWindows: [] },
      fertilizerRecommendations: { recommendations: [] },
      fieldHealthScore: { overallScore: 0, status: 'unknown' },
      generatedAt: new Date(),
      confidence: 0.3
    };
  }
}

module.exports = new AIService();
