const Field = require('../models/Field');
const Application = require('../models/Application');
const mongoose = require('mongoose');
const { computeClimaScore } = require('../services/climateService');

function polygonCentroid(polygon) {
  // polygon.coordinates: [ [ [lng,lat], ... ] ] first ring only
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
    // fallback simple average
    const sum = ring.reduce((acc, [lng,lat]) => { acc.lng += lng; acc.lat += lat; return acc; }, {lng:0, lat:0});
    const n = ring.length;
    return { lat: sum.lat / n, lon: sum.lng / n };
  }
  f *= 0.5; x /= (6*f); y /= (6*f);
  return { lat: y, lon: x };
}

function approximateAreaHa(polygon) {
  // Very rough planar approximation for MVP using centroid latitude for meters/deg
  const R = 6371000; // meters
  const ring = polygon.coordinates?.[0] || [];
  if (ring.length < 3) return 0;
  const toRad = (deg) => deg * Math.PI / 180;
  // Shoelace on projected coords
  const centroid = polygonCentroid(polygon) || { lat: 0, lon: 0 };
  const kx = Math.cos(toRad(centroid.lat)) * (Math.PI/180) * R; // meters per deg lon
  const ky = (Math.PI/180) * R; // meters per deg lat
  let area2 = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1deg, y1deg] = ring[i];
    const [x2deg, y2deg] = ring[i+1];
    const x1 = x1deg * kx, y1 = y1deg * ky;
    const x2 = x2deg * kx, y2 = y2deg * ky;
    area2 += (x1*y2 - x2*y1);
  }
  const areaM2 = Math.abs(area2) / 2;
  return areaM2 / 10000; // hectares
}

module.exports.createField = async (req, res) => {
  try {
    const { name, geometry, metadata } = req.body;
    if (!name || !geometry || geometry.type !== 'Polygon') {
      return res.status(400).json({ error: 'name and geometry Polygon required' });
    }
    const areaHa = approximateAreaHa(geometry);
    const field = await Field.create({ owner: req.user.id, name, geometry, areaHa, metadata: metadata || {} });
    
    // Calculate initial ClimaScore for the field
    try {
      const ctr = polygonCentroid(geometry);
      if (ctr) {
        const { computeClimaScore } = require('../services/climateService');
        const snapshot = await computeClimaScore({ 
          lat: ctr.lat, 
          lon: ctr.lon, 
          crop: 'maize', // default crop
          planting_date: null,
          source: 'nasa'
        });
        
        // Update field with initial score
        await Field.updateOne(
          { _id: field._id }, 
          { $set: { latestClimaScore: snapshot.climascore, latestRiskBreakdown: snapshot.risk_breakdown } }
        );
        
        // Return updated field data
        const updatedField = await Field.findById(field._id);
        res.status(201).json({ field: updatedField });
      } else {
        res.status(201).json({ field });
      }
    } catch (scoreError) {
      console.error('Failed to calculate initial ClimaScore:', scoreError);
      // Still return the field even if score calculation fails
      res.status(201).json({ field });
    }
  } catch (e) {
    console.error('createField error', e);
    res.status(500).json({ error: 'Failed to create field' });
  }
};

module.exports.listFields = async (req, res) => {
  try {
    const fields = await Field.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json({ fields });
  } catch (e) {
    res.status(500).json({ error: 'Failed to list fields' });
  }
};

module.exports.getField = async (req, res) => {
  try {
    const field = await Field.findOne({ _id: req.params.id, owner: req.user.id });
    if (!field) return res.status(404).json({ error: 'Field not found' });
    res.json({ field });
  } catch (e) {
    res.status(500).json({ error: 'Failed to get field' });
  }
};

module.exports.createApplication = async (req, res) => {
  try {
    const { fieldId, crop, plantingDate, requestedAmount, source, fieldMetadata } = req.body;
    if (!fieldId || !crop || !plantingDate || !requestedAmount) {
      return res.status(400).json({ error: 'fieldId, crop, plantingDate, requestedAmount are required' });
    }
    const field = await Field.findOne({ _id: fieldId, owner: req.user.id });
    if (!field) return res.status(404).json({ error: 'Field not found' });

    // Prevent duplicate applications when last status is pending or approved
    const lastApp = await Application.findOne({ field: fieldId, farmer: req.user.id }).sort({ createdAt: -1 }).lean();
    if (lastApp && (lastApp.status === 'pending' || lastApp.status === 'approved')) {
      return res.status(400).json({ error: 'An application for this field is already pending or approved. You can only reapply if it was denied.' });
    }

    // Optionally update field metadata if provided
    if (fieldMetadata && typeof fieldMetadata === 'object') {
      await Field.updateOne({ _id: field._id }, { $set: { metadata: fieldMetadata } })
    }

    const ctr = polygonCentroid(field.geometry);
    if (!ctr) return res.status(400).json({ error: 'Invalid field geometry' });

    const snapshot = await computeClimaScore({ lat: ctr.lat, lon: ctr.lon, crop: String(crop).toLowerCase(), planting_date: plantingDate ? new Date(plantingDate) : null, source: source ? String(source).toLowerCase() : undefined });

    // Update field latest score for map color
    await Field.updateOne({ _id: field._id }, { $set: { latestClimaScore: snapshot.climascore, latestRiskBreakdown: snapshot.risk_breakdown } });

    const application = await Application.create({
      field: field._id,
      farmer: req.user.id,
      crop,
      plantingDate: new Date(plantingDate),
      requestedAmount: Number(requestedAmount),
      status: 'pending',
      lenderDecision: null,
      climascoreSnapshot: snapshot,
      fieldMetadataSnapshot: field.metadata || null
    });

    res.status(201).json({ application });
  } catch (e) {
    console.error('createApplication error', e);
    res.status(500).json({ error: 'Failed to create application' });
  }
};

module.exports.listApplications = async (req, res) => {
  try {
    const apps = await Application.find({ farmer: req.user.id })
      .populate({ path: 'field', select: 'name areaHa latestClimaScore geometry' })
      .sort({ createdAt: -1 });
    res.json({ applications: apps });
  } catch (e) {
    res.status(500).json({ error: 'Failed to list applications' });
  }
};
