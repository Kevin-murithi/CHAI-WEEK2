const SensorDevice = require('../models/SensorDevice');
const SensorReading = require('../models/SensorReading');
const Field = require('../models/Field');

async function latestByField(fieldId, ownerId) {
  // Return latest reading per device for a field
  const devices = await SensorDevice.find({ field: fieldId, owner: ownerId }).lean();
  const out = [];
  for (const d of devices) {
    const r = await SensorReading.findOne({ device: d._id, owner: ownerId })
      .sort({ capturedAt: -1 })
      .lean();
    if (r) out.push({ device: { id: d._id, name: d.name, type: d.type }, metrics: r.metrics, capturedAt: r.capturedAt });
  }
  return out;
}

module.exports.registerDevice = async (req, res) => {
  try {
    const { fieldId, name, type = 'soil', meta = {} } = req.body;
    if (!fieldId || !name) return res.status(400).json({ error: 'fieldId and name are required' });
    const field = await Field.findOne({ _id: fieldId, owner: req.user.id });
    if (!field) return res.status(404).json({ error: 'Field not found' });
    const device = await SensorDevice.create({ owner: req.user.id, field: fieldId, name, type, meta });
    res.status(201).json({ device });
  } catch (e) {
    console.error('registerDevice error', e);
    res.status(500).json({ error: 'Failed to register device' });
  }
};

module.exports.ingestReading = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { metrics, capturedAt } = req.body;
    if (!metrics || typeof metrics !== 'object') return res.status(400).json({ error: 'metrics object required' });
    const device = await SensorDevice.findOne({ _id: deviceId, owner: req.user.id });
    if (!device) return res.status(404).json({ error: 'Device not found' });
    const reading = await SensorReading.create({ owner: req.user.id, field: device.field, device: device._id, metrics, capturedAt: capturedAt ? new Date(capturedAt) : new Date() });
    res.status(201).json({ reading });
  } catch (e) {
    console.error('ingestReading error', e);
    res.status(500).json({ error: 'Failed to ingest reading' });
  }
};

module.exports.listDevices = async (req, res) => {
  try {
    const { fieldId } = req.params;
    const devices = await SensorDevice.find({ field: fieldId, owner: req.user.id }).lean();
    res.json({ devices });
  } catch (e) {
    res.status(500).json({ error: 'Failed to list devices' });
  }
};

module.exports.latestForField = async (req, res) => {
  try {
    const { fieldId } = req.params;
    const field = await Field.findOne({ _id: fieldId, owner: req.user.id });
    if (!field) return res.status(404).json({ error: 'Field not found' });
    const readings = await latestByField(fieldId, req.user.id);
    res.json({ readings });
  } catch (e) {
    console.error('latestForField error', e);
    res.status(500).json({ error: 'Failed to get latest sensor readings' });
  }
};

module.exports.latestByFieldInternal = latestByField;
