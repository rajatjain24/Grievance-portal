const mongoose = require('mongoose');
const complaintSchema = new mongoose.Schema({
  category: String,
  description: String,
  location: String,
  status: { type: String, enum: ['Registered','Processing','Review','Resolved'], default: 'Registered' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Complaint', complaintSchema);
