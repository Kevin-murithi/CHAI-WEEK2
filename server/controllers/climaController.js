const { computeClimaScore } = require('../services/climateService');
const { compareClimaScores } = require('../services/climateService');

// GET /climascore?lat=..&lon=..&crop=maize&planting_date=2025-03-15
async function getClimaScore(req, res) {
  try {
    const { lat, lon, crop = 'maize', planting_date, source, compare } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat and lon are required query parameters' });
    }

    const args = {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      crop: String(crop).toLowerCase(),
      planting_date: planting_date ? new Date(planting_date) : null,
      source: source ? String(source).toLowerCase() : undefined,
    };

    if (String(compare).toLowerCase() === 'true' || String(source).toLowerCase() === 'compare') {
      const result = await compareClimaScores(args);
      return res.json(result);
    }

    const { climascore, risk_breakdown, recommended_loan_terms, data_sources_used, debug } = await computeClimaScore(args);

    return res.json({
      climascore,
      risk_breakdown,
      recommended_loan_terms,
      data_sources_used,
      debug,
    });
  } catch (err) {
    console.error('Error in getClimaScore:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}

module.exports = { getClimaScore };
