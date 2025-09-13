# ClimaScore Platform 🌱

**AI-Powered Climate Risk Assessment for Agricultural Financing**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://mongodb.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-orange.svg)](https://openai.com/)

## 🚀 Project Overview

ClimaScore is a revolutionary platform that bridges the gap between farmers and lenders through AI-powered climate risk assessment. Built for the CHAI Hackathon, it provides transparent, data-driven insights that enable sustainable agricultural financing while empowering farmers with actionable field intelligence.

### 🎯 Problem Statement

Traditional agricultural lending relies on outdated risk assessment methods that don't account for climate variability. Farmers struggle to access financing due to opaque risk evaluation, while lenders face uncertainty in agricultural loan portfolios. Climate change amplifies these challenges, creating a need for intelligent, transparent risk assessment tools.

### 💡 Solution

ClimaScore leverages multiple climate data sources, IoT sensors, and AI analytics to provide:

- **Real-time Climate Risk Scoring**: Dynamic ClimaScore (0-100) based on drought, flood, and heat stress risks
- **AI-Powered Field Analytics**: Satellite imagery analysis, soil health assessment, and yield predictions
- **Transparent Loan Recommendations**: Data-driven financing terms with clear risk explanations
- **Farmer Advisory System**: Personalized recommendations for irrigation, fertilization, and crop management

## 🏗️ Architecture

### Frontend (React + Vite)
```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── advisory/        # AI advisory components
│   │   └── ui/             # Base UI components
│   ├── pages/              # Route-specific pages
│   │   ├── Farmer*/        # Farmer dashboard pages
│   │   └── Lender*/        # Lender console pages
│   ├── context/            # React context providers
│   └── styles/             # CSS and styling
```

### Backend (Node.js + Express)
```
server/
├── controllers/            # Route handlers
├── models/                # MongoDB schemas
├── routes/                # API endpoints
├── services/              # Business logic
│   ├── aiService.js       # OpenAI integration
│   └── climateService.js  # Climate data processing
├── middleware/            # Authentication & validation
└── config/               # Database configuration
```

## 🔧 Technology Stack

### Core Technologies
- **Frontend**: React 19.1.1, Vite, React Router, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT, bcrypt, cookie-based sessions
- **Maps & Visualization**: Leaflet, React-Leaflet, Chart.js

### AI & Data Integration
- **AI Engine**: OpenAI GPT-3.5 Turbo via OpenRouter API
- **Climate Data**: Open-Meteo, NASA POWER, ERA5 reanalysis
- **Geospatial**: GeoJSON polygon support for field mapping
- **IoT Integration**: Sensor data collection and analysis

### Key Features
- **Multi-source Climate Analysis**: Compares NASA POWER, Open-Meteo, and ERA5 data
- **Real-time Risk Assessment**: 30-day historical + 7-day forecast analysis
- **AI Field Analytics**: Satellite NDVI, soil analysis, fertilizer recommendations
- **Interactive Field Mapping**: Draw and manage field boundaries
- **Application Management**: Complete loan application workflow

## 📊 Data Sources & APIs

### Climate Data Providers
1. **Open-Meteo API** (Primary)
   - Real-time weather data and forecasts
   - No API key required
   - 30-day historical + 7-day forecast

2. **NASA POWER** (Validation)
   - Satellite-based agricultural data
   - Historical precipitation and temperature
   - High accuracy for agricultural applications

3. **ERA5 Reanalysis** (Comparison)
   - European Centre for Medium-Range Weather Forecasts
   - Comprehensive historical climate data
   - Used for model validation

### AI Services
- **OpenAI GPT-3.5**: Field analysis, recommendations, risk assessment
- **Custom Algorithms**: ClimaScore computation, risk categorization
- **Caching System**: 30-minute TTL for API optimization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key (via OpenRouter)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kevin-murithi/CHAI-WEEK2.git
   cd CHAI-WEEK2
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   
   # Create .env file
   echo "MONGODB_URI=mongodb://localhost:27017/climascore" > .env
   echo "JWT_SECRET=your-jwt-secret-key" >> .env
   echo "OPENAI_API_KEY=your-openai-api-key" >> .env
   
   # Start development server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Environment Variables

**Server (.env)**
```env
MONGODB_URI=mongodb://localhost:27017/climascore
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=development
```

## 🎮 User Roles & Features

### 👨‍🌾 Farmer Portal ("Grow Portal")
- **Field Management**: Draw, edit, and monitor field boundaries
- **ClimaScore Monitoring**: Real-time climate risk assessment
- **AI Advisory Feed**: Personalized farming recommendations
- **Loan Applications**: Submit and track financing requests
- **IoT Integration**: Connect and monitor sensor devices
- **Resource Library**: Access educational content and best practices

### 🏦 Lender Console ("Risk Console")
- **Executive Dashboard**: Portfolio overview and risk metrics
- **Application Queue**: Review and process loan applications
- **Risk Assessment**: Detailed ClimaScore analysis and explanations
- **Portfolio Management**: Track loan performance and risk exposure
- **Admin Tools**: User management and system configuration

## 🤖 AI Features

### Field Analytics Engine
```javascript
// Comprehensive AI analysis includes:
- Satellite NDVI analysis and vegetation health
- Soil composition and nutrient analysis (N-P-K)
- Fertilizer recommendations with cost estimates
- Optimal planting window predictions
- Yield forecasting and risk warnings
- Real-time sensor data interpretation
```

### ClimaScore Algorithm
```javascript
// Risk factors weighted by crop type:
const riskWeights = {
  drought: 0.5,    // Primary risk factor
  flood: 0.3,      // Secondary risk factor  
  heat: 0.2        // Tertiary risk factor
};

// Score calculation (0-100):
climaScore = 100 - (weightedRiskSum * 100)
```

### AI Recommendations
- **Irrigation Management**: Soil moisture-based scheduling
- **Fertilizer Optimization**: Nutrient-specific recommendations
- **Pest & Disease Alerts**: Early warning systems
- **Harvest Timing**: Optimal harvest window predictions

## 📱 User Interface

### Design System
- **Dark Theme**: Professional agricultural aesthetic
- **Responsive Design**: Mobile-first approach
- **Interactive Maps**: Leaflet-based field visualization
- **Real-time Updates**: Live data synchronization
- **Accessibility**: WCAG 2.1 compliant components

### Key UI Components
- **Field Mapping**: Interactive polygon drawing and editing
- **ClimaScore Visualization**: Color-coded risk indicators
- **Advisory Cards**: AI-generated recommendation display
- **Application Workflow**: Multi-step form with validation
- **Dashboard Analytics**: Charts and metrics visualization

## 🔐 Security & Authentication

### Security Features
- **JWT Authentication**: Secure token-based sessions
- **Role-based Access Control**: Farmer/Lender permission system
- **Password Hashing**: bcrypt with salt rounds
- **CORS Protection**: Configured for development and production
- **Input Validation**: Comprehensive data sanitization

### API Security
- **Protected Routes**: Authentication middleware
- **Rate Limiting**: API call throttling (planned)
- **Data Encryption**: Sensitive information protection
- **Audit Logging**: User action tracking (planned)

## 🧪 Testing & Development

### Development Workflow
```bash
# Backend development
cd server && npm run dev    # Nodemon auto-restart

# Frontend development  
cd client && npm run dev    # Vite hot reload

# Production build
cd client && npm run build  # Optimized build
```

### API Testing
```bash
# Health check
curl http://localhost:3000/check-auth

# ClimaScore calculation
curl -X POST http://localhost:3000/api/clima/score \
  -H "Content-Type: application/json" \
  -d '{"lat": -1.2921, "lon": 36.8219, "crop": "maize"}'
```

## 🌍 Climate Data Integration

### Risk Assessment Model
```javascript
// Multi-source climate analysis
const sources = ['open-meteo', 'nasa-power', 'era5'];
const riskFactors = {
  drought: calculateDroughtRisk(precipitationData),
  flood: calculateFloodRisk(heavyRainDays),
  heat: calculateHeatStress(temperatureData)
};
```

### Data Processing Pipeline
1. **Data Collection**: Fetch from multiple climate APIs
2. **Validation**: Cross-reference between sources
3. **Risk Calculation**: Apply crop-specific algorithms
4. **Caching**: Store results for performance
5. **AI Enhancement**: GPT-3.5 analysis and insights

## 📈 Performance Optimization

### Caching Strategy
- **Climate Data**: 15-minute TTL for API responses
- **AI Analytics**: 30-minute TTL for field analysis
- **User Sessions**: JWT with configurable expiration

### Database Optimization
- **Indexed Queries**: Geospatial and user-based indexes
- **Aggregation Pipelines**: Efficient data processing
- **Connection Pooling**: Mongoose connection management

## 🚀 Deployment

### Production Deployment
```bash
# Build frontend
cd client && npm run build

# Start production server
cd server && npm start

# Environment setup
export NODE_ENV=production
export MONGODB_URI=mongodb+srv://...
export OPENAI_API_KEY=sk-...
```

### Docker Support (Planned)
```dockerfile
# Multi-stage build for optimized containers
FROM node:18-alpine AS builder
# ... build configuration
```

## 🤝 Team Collaboration

### Development Roles
- **AI/ML Engineer**: OpenAI integration, analytics algorithms
- **Backend Engineer**: API development, database design
- **Frontend Engineer**: React components, user experience
- **Data Analyst**: Climate data processing, risk modeling

### Git Workflow
```bash
# Feature development
git checkout -b feature/ai-recommendations
git commit -m "feat: add fertilizer recommendations"
git push origin feature/ai-recommendations
```

## 📋 API Documentation

### Core Endpoints

#### Authentication
```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /check-auth
```

#### ClimaScore
```http
POST /api/clima/score          # Calculate ClimaScore
POST /api/clima/compare        # Compare multiple sources
```

#### Farmer Operations
```http
GET    /api/farmer/fields      # List farmer fields
POST   /api/farmer/fields      # Create new field
GET    /api/farmer/applications # List applications
POST   /api/farmer/applications # Submit application
```

#### AI Services
```http
POST /api/ai/advisory          # Generate recommendations
POST /api/ai/field-analysis    # Comprehensive field analysis
```

## 🎯 Hackathon Objectives

### Primary Goals
1. **Climate Risk Transparency**: Make agricultural risk assessment accessible
2. **AI-Powered Insights**: Provide actionable farming recommendations
3. **Financial Inclusion**: Enable data-driven agricultural lending
4. **Sustainable Agriculture**: Promote climate-resilient farming practices

### Success Metrics
- **User Engagement**: Farmer adoption and daily active usage
- **Risk Accuracy**: ClimaScore prediction validation
- **Loan Performance**: Default rate reduction through better risk assessment
- **AI Effectiveness**: Recommendation implementation and outcomes

## 🔮 Future Roadmap

### Phase 1: Enhanced AI (Q1 2025)
- [ ] Crop yield prediction models
- [ ] Satellite imagery integration
- [ ] Weather alert system
- [ ] Mobile application

### Phase 2: Market Expansion (Q2 2025)
- [ ] Multi-country climate data
- [ ] Local language support
- [ ] Regional crop databases
- [ ] Insurance integration

### Phase 3: Advanced Analytics (Q3 2025)
- [ ] Machine learning risk models
- [ ] Predictive analytics dashboard
- [ ] Blockchain verification
- [ ] Carbon credit tracking

## 🏆 Hackathon Innovation

### Novel Features
1. **Multi-Source Climate Validation**: First platform to compare NASA, ECMWF, and Open-Meteo
2. **AI-Enhanced Risk Scoring**: GPT-3.5 integration for contextual analysis
3. **Real-time Field Monitoring**: IoT sensor integration with AI interpretation
4. **Transparent Lending**: Open-source risk assessment algorithms

### Technical Achievements
- **Zero-API-Key Climate Data**: Leverages free, high-quality weather APIs
- **Intelligent Caching**: Optimized performance with smart data retention
- **Responsive Design**: Mobile-first agricultural interface
- **Scalable Architecture**: Microservices-ready backend design

## 📞 Support & Contact

### Development Team
- **Project Lead**: Kevin Murithi
- **Repository**: [GitHub - CHAI-WEEK2](https://github.com/Kevin-murithi/CHAI-WEEK2)
- **Documentation**: This README and inline code comments

### Contributing
1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request
5. Participate in code review

## 📄 License

This project is developed for the CHAI Hackathon. Please refer to the hackathon guidelines for usage and distribution terms.

---

**Built with ❤️ for sustainable agriculture and climate resilience**

*ClimaScore: Empowering farmers, enabling lenders, protecting our planet.*
