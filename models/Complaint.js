const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  category: String,
  description: String,
  location: String,
  geolocation: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false
    },
    address: String,
    formattedAddress: String
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  citizenPhone: {
    type: String,
    required: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  estimatedResolutionDate: Date,
  actualResolutionDate: Date,
  adminComments: [{
    comment: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  citizenFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    providedAt: { type: Date, default: Date.now }
  },
  tags: [String],
  isUrgent: { type: Boolean, default: false },
  relatedComplaints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' }],
  status: { 
    type: String, 
    enum: ['Registered','Processing','Review','Resolved','Closed','Reopened'], 
    default: 'Registered' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create geospatial index for location-based queries
complaintSchema.index({ "geolocation.coordinates": "2dsphere" });

// Update the updatedAt field before saving
complaintSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
