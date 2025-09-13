const { Router } = require('express');
const { requireRole } = require('../middleware/authMiddleware');
const lender = require('../controllers/lenderController');

const router = Router();

// All lender routes require lender role
router.use(requireRole(['lender']));

router.get('/applications', lender.listApplications);
router.get('/applications/:id', lender.getApplication);
router.post('/applications/:id/decision', lender.decideApplication);
router.get('/applications/:id/sensors', lender.getApplicationSensors);

module.exports = router;
