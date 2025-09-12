const Application = require('../models/Application');
const Field = require('../models/Field');
const User = require('../models/User');

// GET /api/lender/applications?status=&crop=&minScore=&maxScore=&q=
module.exports.listApplications = async (req, res) => {
  try {
    const { status, crop, minScore, maxScore, q } = req.query;
    const match = {};
    if (status) match.status = status;
    if (crop) match.crop = crop;

    // We will populate field to filter by latestClimaScore if provided
    const apps = await Application.find(match)
      .populate({ path: 'field', select: 'name areaHa latestClimaScore geometry' })
      .populate({ path: 'farmer', select: 'firstName lastName email' })
      .sort({ createdAt: -1 })
      .lean();

    let filtered = apps;
    const min = minScore ? Number(minScore) : undefined;
    const max = maxScore ? Number(maxScore) : undefined;
    if (min !== undefined || max !== undefined) {
      filtered = filtered.filter(a => {
        const s = a.field?.latestClimaScore;
        if (s == null) return false;
        if (min !== undefined && s < min) return false;
        if (max !== undefined && s > max) return false;
        return true;
      });
    }

    if (q) {
      const ql = String(q).toLowerCase();
      filtered = filtered.filter(a => (
        (a.farmer?.firstName||'').toLowerCase().includes(ql) ||
        (a.farmer?.lastName||'').toLowerCase().includes(ql) ||
        (a.field?.name||'').toLowerCase().includes(ql) ||
        (a.crop||'').toLowerCase().includes(ql)
      ));
    }

    res.json({ applications: filtered });
  } catch (e) {
    console.error('lender listApplications error', e);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// GET /api/lender/applications/:id
module.exports.getApplication = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate({ path: 'field', select: 'name areaHa latestClimaScore geometry' })
      .populate({ path: 'farmer', select: 'firstName lastName email' });
    if (!app) return res.status(404).json({ error: 'Application not found' });
    res.json({ application: app });
  } catch (e) {
    console.error('lender getApplication error', e);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
};

// POST /api/lender/applications/:id/decision { action, amount?, interestRate?, comments? }
module.exports.decideApplication = async (req, res) => {
  try {
    const { action, amount, interestRate, comments } = req.body;
    if (!['approve','deny','needs_info'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    const decision = {
      amount: amount != null ? Number(amount) : undefined,
      interestRate: interestRate != null ? Number(interestRate) : undefined,
      comments: comments || '',
      decidedBy: req.user.id,
      decidedAt: new Date()
    };

    app.status = action === 'approve' ? 'approved' : (action === 'deny' ? 'denied' : 'needs_info');
    app.lenderDecision = decision;

    await app.save();

    res.json({ application: app });
  } catch (e) {
    console.error('lender decideApplication error', e);
    res.status(500).json({ error: 'Failed to update application' });
  }
};
