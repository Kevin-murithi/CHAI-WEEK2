const https = require('https');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    // Using latest Gemini model - fast and cost-effective for chat
    this.model = 'gemini-2.0-flash-exp';
  }

  async generateResponse(prompt, context = '') {
    return new Promise((resolve) => {
      try {
        if (!this.apiKey) {
          throw new Error('GEMINI_API_KEY is not configured');
        }

        const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

        const requestBody = JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        });

        const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
        const urlObj = new URL(url);

        const options = {
          hostname: urlObj.hostname,
          path: urlObj.pathname + urlObj.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
          }
        };

        const req = https.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const rawLen = typeof data === 'string' ? data.length : 0;
              console.debug('Gemini HTTP response debug:', {
                statusCode: res.statusCode,
                headers: res.headers,
                rawLength: rawLen,
                head: (data || '').slice(0, 200),
                tail: (data || '').slice(-200)
              });
              const jsonData = JSON.parse(data);

              if (res.statusCode !== 200) {
                console.error('Gemini API error:', { statusCode: res.statusCode, headers: res.headers, body: jsonData });
                resolve({
                  success: false,
                  error: `Gemini API error: ${res.statusCode} - ${JSON.stringify(jsonData)}`,
                  response: null
                });
                return;
              }

              if (!jsonData.candidates || !jsonData.candidates[0] || !jsonData.candidates[0].content) {
                resolve({
                  success: false,
                  error: 'Invalid response format from Gemini API',
                  response: null
                });
                return;
              }

              const parts = jsonData.candidates[0].content.parts || [];
              const generatedText = parts.map(p => p.text || '').join('');

              resolve({
                success: true,
                response: generatedText,
                model: this.model
              });
            } catch (parseError) {
              const rawLen = typeof data === 'string' ? data.length : 0;
              console.error('Failed to parse Gemini response:', {
                message: parseError?.message,
                statusCode: res.statusCode,
                headers: res.headers,
                rawLength: rawLen,
                head: (data || '').slice(0, 300),
                tail: (data || '').slice(-300)
              });
              resolve({
                success: false,
                error: 'Failed to parse API response',
                response: null
              });
            }
          });
        });

        req.on('error', (error) => {
          console.error('Gemini request error:', error);
          resolve({
            success: false,
            error: error.message || 'Request failed',
            response: null
          });
        });

        req.write(requestBody);
        req.end();

      } catch (error) {
        console.error('Gemini service error:', error);
        resolve({
          success: false,
          error: error.message || 'Failed to generate response',
          response: null
        });
      }
    });
  }

  async chatWithContext(userMessage, cropData, sensorData) {
    try {
      const { cropInfo, realTimeData } = cropData;
      
      // Build context with crop-specific data
      const context = `You are an AI assistant for a post-harvest monitoring system. You're currently monitoring ${cropInfo.name}.

Current Status:
- Crop: ${cropInfo.name}
- Status: ${cropInfo.status}
- Location: ${cropInfo.location}
- Quality: ${cropInfo.quality}
- Shelf Life: ${cropInfo.shelfLife}
${cropInfo.status === "In Transit" ? `- Driver: ${cropInfo.driver}
- Vehicle: ${cropInfo.numberPlate}
- Distance Remaining: ${cropInfo.distanceRemaining}
- ETA: ${cropInfo.timeRemaining}
- Destination: ${cropInfo.destination}` : `- Operator: ${cropInfo.operator}
- Storage ID: ${cropInfo.siloId}
- Capacity: ${cropInfo.capacity}
- Time in Storage: ${cropInfo.timeInStorage}
- Destination: ${cropInfo.destination}`}

Current Sensor Readings:
- Temperature: ${realTimeData.temperature}°C
- Humidity: ${realTimeData.humidity}%
- Light Exposure: ${realTimeData.lightExposure} lux
- Shock Level: ${realTimeData.shock}g
${sensorData.moisture ? `- Moisture: ${realTimeData.moisture}%` : `- Ethylene: ${realTimeData.ethylene} ppm`}
- CO2: ${realTimeData.co2} ppm

Please provide helpful, concise, and professional responses to the farmer's questions. Focus on actionable insights and recommendations based on the data.`;

      const prompt = `Farmer's question: ${userMessage}\n\nProvide a helpful response:`;
      
      return await this.generateResponse(prompt, context);

    } catch (error) {
      console.error('Chat with context error:', error);
      return {
        success: false,
        error: error.message,
        response: null
      };
    }
  }
}

module.exports = new GeminiService();
