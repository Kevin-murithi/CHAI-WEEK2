const mongoose = require('mongoose');

const SensorDeviceSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  field: { type: mongoose.Schema.Types.ObjectId, ref: 'field', required: true },
  name: { type: String, required: true },
  type: { type: String, default: 'soil' }, // soil, weather, etc.
  meta: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('sensor_device', SensorDeviceSchema);
