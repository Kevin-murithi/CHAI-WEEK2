const mongoose = require('mongoose');

const SensorReadingSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  field: { type: mongoose.Schema.Types.ObjectId, ref: 'field', required: true },
  device: { type: mongoose.Schema.Types.ObjectId, ref: 'sensor_device', required: true },
  metrics: { type: Object, required: true }, // e.g., { soil_moisture: 23.4, soil_temp: 18.1, ph: 6.4 }
  capturedAt: { type: Date, default: Date.now }
}, { timestamps: true });

SensorReadingSchema.index({ field: 1, capturedAt: -1 });
SensorReadingSchema.index({ device: 1, capturedAt: -1 });

module.exports = mongoose.model('sensor_reading', SensorReadingSchema);
