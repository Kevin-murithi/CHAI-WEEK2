const { computeClimaScore } = require('./climateService');
const gemini = require('./geminiService');

// Pure AI service using OpenRouter API - no hardcoded logic or rules
class AIService {
  constructor() {
    // Uses Gemini via geminiService with GEMINI_API_KEY
    this.cache = new Map(); // Simple in-memory cache
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
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

      // Use OpenAI to generate intelligent recommendations
      const recommendations = await this.generateAIRecommendations(farmerData);

      return {
        recommendations,
        generatedAt: new Date(),
        confidence: 0.92
      };
    } catch (error) {
      console.error('AI Advisory generation failed:', error);
      return this.getFallbackRecommendations();
    }
  }

  async enhanceClimaScore(baseScore, contextData) {
    try {
      const { sensorTrends, historicalPerformance, regionalData } = contextData;

      // Use Gemini to enhance ClimaScore
      const prompt = `You are an expert agricultural risk analyst. Based on the following data, enhance a base ClimaScore of ${baseScore} by analyzing risk factors.

Context Data:
- Sensor Trends: ${JSON.stringify(sensorTrends?.slice(0, 10) || [])}
- Historical Performance: ${JSON.stringify(historicalPerformance?.slice(0, 5) || [])}
- Regional Data: ${JSON.stringify(regionalData || {})}

Please provide an enhanced ClimaScore analysis in this exact JSON format:
{
  "originalScore": ${baseScore},
  "enhancedScore": 75.5,
  "aiFactors": {
    "sensorTrendRisk": 2.5,
    "historicalRisk": -1.8,
    "regionalRisk": 1.2
  },
  "confidence": 0.85,
  "reasoning": "Brief explanation of the enhancement"
}

Consider how sensor data, historical performance, and regional patterns affect the risk level.`;

      const system = "You are an expert agricultural risk analyst. Output ONLY raw JSON. No markdown, no code fences, no commentary.";
      const { success, response, error } = await gemini.generateResponse(prompt, system);
      if (!success) throw new Error(error || 'Gemini call failed');

      const result = this.parseJsonSafe(response);

      return result;
    } catch (error) {
      console.error('AI ClimaScore enhancement failed:', error);
      return { originalScore: baseScore, enhancedScore: baseScore, confidence: 0.5 };
    }
  }

  async generatePredictiveAnalytics(fieldData) {
    try {
      console.log('Generating AI analytics for field:', fieldData.field?._id, 'crop:', fieldData.crop);

      const cacheKey = this.getCacheKey('analytics', fieldData);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('Returning cached AI result for:', cacheKey);
        return cached;
      }

      // Use pure AI to generate comprehensive field analytics
      const analytics = await this.generateAIPredictiveAnalytics(fieldData);

      const result = {
        ...analytics,
        generatedAt: new Date(),
        confidence: 0.87
      };

      console.log('Generated new AI result for field:', fieldData.field?._id);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('AI Predictive analytics failed:', error);
      return this.getFallbackAnalytics();
    }
  }

  // Pure AI-powered predictive analytics
  async generateAIPredictiveAnalytics(fieldData) {
    const { field, sensors, weather, crop, plantingDate } = fieldData;

    const prompt = `You are an expert agricultural AI analyst. Based on the following field data, generate comprehensive predictive analytics for a ${crop} field. Provide detailed, realistic analysis.

Field Data:
- Field Name: ${field?.name || 'Unknown'}
- Area: ${field?.areaHa || 1} hectares
- Crop: ${crop || 'maize'}
- Planting Date: ${plantingDate || '2025-03-15'}
- Sensor Readings: ${JSON.stringify(sensors?.slice(0, 5) || [])}
- Weather Data: ${JSON.stringify(weather || {})}

Please provide a complete analysis in this exact JSON format:
{
  "yieldPrediction": {
    "estimatedYield": 45.5,
    "unit": "tons",
    "confidenceRange": {"min": 36.4, "max": 54.6}
  },
  "riskWarnings": [
    {
      "type": "drought|pest|flood|disease",
      "severity": "low|medium|high",
      "message": "Description of the risk",
      "timeframe": "time period"
    }
  ],
  "timingRecommendations": [
    {
      "activity": "fertilization|irrigation|harvest_prep|pest_control",
      "recommendedDate": "2025-09-15T00:00:00.000Z",
      "description": "What to do and why"
    }
  ],
  "satelliteAnalysis": {
    "ndvi": 0.65,
    "vegetationHealth": "good|excellent|fair|poor",
    "cropStage": "germination|vegetative|flowering|grain_filling|maturity",
    "stressIndicators": [
      {
        "type": "water_stress|nutrient_stress|pest_damage",
        "severity": "low|medium|high",
        "description": "Description of the stress"
      }
    ],
    "coveragePercentage": 92.5,
    "lastUpdated": "2025-09-12T00:00:00.000Z"
  },
  "soilAnalysis": {
    "ph": 6.8,
    "nutrients": {"nitrogen": 45, "phosphorus": 28, "potassium": 52},
    "organicMatter": 3.2,
    "compaction": "low|moderate|high",
    "drainage": "good|moderate|poor",
    "temperature": 23.5,
    "salinity": 0.08,
    "overallHealth": 78,
    "recommendations": ["Specific improvement suggestions"]
  },
  "plantingWindowAdvice": {
    "currentSeason": "autumn",
    "optimalWindows": [
      {
        "start": "March 15",
        "end": "May 15",
        "year": 2025,
        "riskLevel": "low|medium|high",
        "confidence": 85
      }
    ],
    "nextBestWindow": {
      "start": "March 15",
      "end": "May 15",
      "year": 2026,
      "riskLevel": "low",
      "confidence": 85,
      "daysUntil": 183
    },
    "riskFactors": [
      {
        "type": "drought|flood|frost|pest",
        "probability": 65,
        "mitigation": "Specific mitigation strategy"
      }
    ],
    "soilReadiness": {
      "score": 75,
      "status": "ready|nearly_ready|not_ready",
      "factors": {
        "moisture": "optimal|needs_attention",
        "temperature": "optimal|suboptimal",
        "structure": "good|needs_improvement"
      }
    },
    "weatherForecast": {
      "temperature": {"trend": "warming|cooling", "average": 24.5},
      "precipitation": {"forecast": "normal|above_normal|below_normal", "amount": 125.5},
      "confidence": 80
    }
  },
  "fertilizerRecommendations": {
    "recommendations": [
      {
        "type": "nitrogen|phosphorus|potassium|organic",
        "product": "Specific product name",
        "amount": 150,
        "unit": "kg|tons",
        "timing": "When to apply",
        "reason": "Why this is recommended",
        "priority": "high|medium|low",
        "cost": 225.50
      }
    ],
    "totalEstimatedCost": 450.00,
    "applicationSchedule": [
      {"product": "Urea", "timing": "2 weeks after planting", "amount": "150 kg", "priority": "high"}
    ],
    "expectedYieldIncrease": 12.5
  },
  "fieldHealthScore": {
    "overallScore": 72,
    "breakdown": {
      "soilHealth": 78,
      "vegetationHealth": 65,
      "sensorHealth": 73
    },
    "status": "good|excellent|fair|poor",
    "improvementAreas": [
      {
        "area": "soil_health|vegetation_health|monitoring",
        "priority": "high|medium|low",
        "description": "What needs improvement"
      }
    ]
  }
}

Make all values realistic and data-driven. Consider the crop type, field conditions, and sensor data when making predictions.`;

    const system = "You are an expert agricultural AI providing comprehensive field analytics. Output ONLY raw JSON with realistic, data-driven predictions. No markdown or code fences.";
    const { success, response, error } = await gemini.generateResponse(prompt, system);
    if (!success) {
      console.error('Gemini analytics error:', error);
      return this.getFallbackAnalytics();
    }

    const analytics = this.parseJsonSafe(response);
    return analytics || this.getFallbackAnalytics();
  }

  // Real AI-powered recommendations using OpenAI
  async generateAIRecommendations(farmerData) {
    try {
      const { fields, sensors, weather, applications } = farmerData;

      // Prepare context data
      const fieldSummary = fields?.map(field => ({
        name: field.name,
        area: field.areaHa,
        crop: field.crop || 'unknown',
        location: field.location || 'unknown'
      })) || [];

      const sensorSummary = sensors?.slice(0, 10).map(sensor => ({
        type: sensor.type,
        soilMoisture: sensor.soilMoisture,
        temperature: sensor.temperature,
        timestamp: sensor.capturedAt
      })) || [];

      const applicationSummary = applications?.slice(0, 5).map(app => ({
        status: app.status,
        amount: app.amount,
        purpose: app.purpose
      })) || [];

      const prompt = `You are an expert agricultural AI advisor. Based on the following farmer data, generate 3-5 specific, actionable farming recommendations. Focus on irrigation, fertilization, pest management, and crop health.

Farmer Data:
- Fields: ${JSON.stringify(fieldSummary)}
- Recent Sensor Readings: ${JSON.stringify(sensorSummary)}
- Recent Applications: ${JSON.stringify(applicationSummary)}
- Current Season: ${this.getCurrentSeason()}

Please provide recommendations in this exact JSON format:
[
  {
    "id": "unique-id",
    "type": "irrigation|fertilizer|pest|weather|soil|general",
    "priority": "high|medium|low",
    "title": "Brief title",
    "description": "Detailed explanation",
    "actionItems": ["Action 1", "Action 2", "Action 3"],
    "confidence": 0.85
  }
]

Make recommendations specific to the data provided and prioritize based on potential impact.`;

      const system = "You are an expert agricultural consultant providing data-driven farming recommendations. Output ONLY raw JSON. No markdown or code fences.";
      const { success, response, error } = await gemini.generateResponse(prompt, system);
      if (!success) throw new Error(error || 'Gemini call failed');

      const recommendations = this.parseJsonSafe(response) || [];

      // Add fieldId to each recommendation
      const enhancedRecommendations = recommendations.map(rec => ({
        ...rec,
        fieldId: fields?.[0]?._id || 'unknown'
      }));

      return enhancedRecommendations;

    } catch (error) {
      console.error('Gemini recommendations failed:', error);
      return this.getFallbackRecommendations();
    }
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  getFallbackRecommendations() {
    return [{
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
      confidence: 0.5,
      fieldId: 'unknown'
    }];
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

  // Attempt to parse strict JSON, with a fallback that extracts the first JSON object/array block
  parseJsonSafe(text) {
    if (!text) return null;
    try {
      let input = String(text).trim();
      // Strip markdown code fences like ```json ... ``` or ``` ... ```
      const fenceStart = input.indexOf('```');
      const fenceEnd = input.lastIndexOf('```');
      if (fenceStart !== -1 && fenceEnd !== -1 && fenceEnd > fenceStart + 2) {
        let fenced = input.slice(fenceStart + 3, fenceEnd).trim();
        if (/^(json|JSON|javascript|js)/.test(fenced)) {
          const nl = fenced.indexOf('\n');
          fenced = nl !== -1 ? fenced.slice(nl + 1) : '';
        }
        input = fenced.trim();
      }

      // Try strict parse first
      try {
        return JSON.parse(input);
      } catch (_) {}

      // Clean trailing commas and try again
      try {
        const cleaned = input.replace(/,(\s*[}\]])/g, '$1');
        if (cleaned !== input) console.debug('Applied trailing comma cleanup before JSON.parse');
        return JSON.parse(cleaned);
      } catch (_) {}

      // Fallback: extract first JSON object/array slice and parse
      const startObj = input.indexOf('{');
      const startArr = input.indexOf('[');
      const start = (startObj === -1) ? startArr : (startArr === -1 ? startObj : Math.min(startObj, startArr));
      const endObj = input.lastIndexOf('}');
      const endArr = input.lastIndexOf(']');
      const end = Math.max(endObj, endArr);
      if (start >= 0 && end > start) {
        let slice = input.slice(start, end + 1);
        // Clean slice: remove trailing commas
        let cleanedSlice = slice.replace(/,(\s*[}\]])/g, '$1');
        if (cleanedSlice !== slice) console.debug('Applied trailing comma cleanup to slice before JSON.parse');
        // Balance braces/brackets if unbalanced
        const opens = (cleanedSlice.match(/[\[{]/g) || []).length;
        const closes = (cleanedSlice.match(/[\]}]/g) || []).length;
        let balanced = cleanedSlice;
        if (opens > closes) {
          const diff = opens - closes;
          const lastOpen = cleanedSlice.lastIndexOf('{') > cleanedSlice.lastIndexOf('[') ? '}' : ']';
          balanced = cleanedSlice + lastOpen.repeat(diff);
          console.debug('Appended closing braces/brackets to balance JSON slice:', { diff, lastOpen });
        }
        console.debug('Attempting JSON parse from slice indices', {
          start,
          end,
          sliceLength: end - start + 1,
          sliceHead: balanced.slice(0, 200),
          sliceTail: balanced.slice(-200)
        });
        return JSON.parse(balanced);
      }

      // Log diagnostics if still failing
      const len = typeof input === 'string' ? input.length : 0;
      console.error('Primary JSON parse failed. Response diagnostics:', {
        length: len,
        head: (input || '').slice(0, 300),
        tail: (input || '').slice(-300)
      });
      return null;
    } catch (e) {
      console.error('Failed to extract JSON from Gemini response', {
        message: e?.message,
        stack: e?.stack
      });
      return null;
    }
  }
}

module.exports = new AIService();
