const express = require('express');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();
const SECRET_KEY = 'super-secret-key';

// Auth middleware
function auth(role) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
      const user = jwt.verify(token, SECRET_KEY);
      if (role && user.role !== role) return res.status(403).json({ msg: 'Forbidden' });
      req.user = user;
      next();
    } catch {
      res.status(401).json({ msg: 'Invalid or expired token' });
    }
  };
}

// Submit new complaint (customer)
router.post('/', auth('customer'), async (req, res) => {
  const complaint = new Complaint({ ...req.body, createdBy: req.user.id });
  await complaint.save();
  res.json({ msg: "Complaint submitted", complaint });
});

// Get complaints (customer's only, or all if admin)
router.get('/', auth(), async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const complaints = await Complaint.find()
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
      res.json(complaints);
    } else {
      const complaints = await Complaint.find({ createdBy: req.user.id })
        .sort({ createdAt: -1 });
      res.json(complaints);
    }
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch complaints" });
  }
});

// Get single by ID (for status tracker)
router.get('/:id', auth(), async (req, res) => {
  let c = await Complaint.findById(req.params.id);
  if (!c) return res.status(404).json({ msg: "Not found" });
  // Only allow owner or admin to view
  if (req.user.role !== 'admin' && c.createdBy.toString() !== req.user.id)
    return res.status(403).json({ msg: "Forbidden" });
  res.json(c);
});

// Admin: update status
router.put('/:id', auth('admin'), async (req, res) => {
  let c = await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!c) return res.status(404).json({ msg: "Not found" });
  res.json({ msg: "Status updated", complaint: c });
});

module.exports = router;
