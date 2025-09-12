const mongoose = require('mongoose');

const DecisionSchema = new mongoose.Schema({
  amount: { type: Number },
  interestRate: { type: Number },
  comments: { type: String },
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  decidedAt: { type: Date }
}, { _id: false });

const ApplicationSchema = new mongoose.Schema({
  field: { type: mongoose.Schema.Types.ObjectId, ref: 'field', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  crop: { type: String, required: true },
  plantingDate: { type: Date, required: true },
  requestedAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending','approved','denied','needs_info'], default: 'pending' },
  lenderDecision: { type: DecisionSchema, default: null },
  climascoreSnapshot: { type: Object, required: true },
}, { timestamps: true });

module.exports = mongoose.model('application', ApplicationSchema);
