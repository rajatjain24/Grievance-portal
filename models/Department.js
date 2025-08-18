const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  head: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  categories: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  workingHours: {
    type: String,
    default: '9:00 AM - 5:00 PM'
  },
  establishedYear: {
    type: Number,
    min: 1950,
    max: new Date().getFullYear()
  },
  totalStaff: {
    type: Number,
    default: 0,
    min: 0
  },
  budget: {
    type: Number,
    default: 0,
    min: 0
  },
  achievements: [{
    title: String,
    description: String,
    year: Number
  }],
  services: [{
    name: String,
    description: String,
    processingTime: String
  }]
}, {
  timestamps: true
});

// Index for better search performance
departmentSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Department', departmentSchema);
