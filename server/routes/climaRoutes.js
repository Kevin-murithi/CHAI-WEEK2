const { Router } = require('express');
const { getClimaScore } = require('../controllers/climaController');

const router = Router();

// GET /climascore?lat=..&lon=..&crop=maize&planting_date=2025-03-15
router.get('/climascore', getClimaScore);

module.exports = router;
