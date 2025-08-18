const express = require('express');
const Department = require('../models/Department');
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

// Get all departments (Admin only)
router.get('/', auth('admin'), async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ msg: 'Failed to fetch departments' });
  }
});

// Get public departments list (for citizens)
router.get('/public', async (req, res) => {
  try {
    const departments = await Department.find({ status: 'Active' })
      .select('name description head email phone categories services workingHours')
      .sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    console.error('Error fetching public departments:', error);
    res.status(500).json({ msg: 'Failed to fetch departments' });
  }
});

// Get department by ID
router.get('/:id', auth('admin'), async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ msg: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ msg: 'Failed to fetch department' });
  }
});

// Create new department (Admin only)
router.post('/', auth('admin'), async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.status(201).json({ msg: 'Department created successfully', department });
  } catch (error) {
    console.error('Error creating department:', error);
    if (error.code === 11000) {
      return res.status(400).json({ msg: 'Department name already exists' });
    }
    res.status(400).json({ msg: 'Failed to create department', error: error.message });
  }
});

// Update department (Admin only)
router.put('/:id', auth('admin'), async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!department) {
      return res.status(404).json({ msg: 'Department not found' });
    }
    res.json({ msg: 'Department updated successfully', department });
  } catch (error) {
    console.error('Error updating department:', error);
    if (error.code === 11000) {
      return res.status(400).json({ msg: 'Department name already exists' });
    }
    res.status(400).json({ msg: 'Failed to update department', error: error.message });
  }
});

// Delete department (Admin only)
router.delete('/:id', auth('admin'), async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ msg: 'Department not found' });
    }
    res.json({ msg: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ msg: 'Failed to delete department' });
  }
});

// Get department statistics (Admin only)
router.get('/admin/stats', auth('admin'), async (req, res) => {
  try {
    const totalDepartments = await Department.countDocuments();
    const activeDepartments = await Department.countDocuments({ status: 'Active' });
    const inactiveDepartments = await Department.countDocuments({ status: 'Inactive' });
    
    // Get departments by categories
    const categoryStats = await Department.aggregate([
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get average staff count
    const staffStats = await Department.aggregate([
      { $group: { _id: null, avgStaff: { $avg: '$totalStaff' }, totalStaff: { $sum: '$totalStaff' } } }
    ]);
    
    res.json({
      totalDepartments,
      activeDepartments,
      inactiveDepartments,
      categoryStats,
      staffStats: staffStats[0] || { avgStaff: 0, totalStaff: 0 }
    });
  } catch (error) {
    console.error('Error fetching department stats:', error);
    res.status(500).json({ msg: 'Failed to fetch department statistics' });
  }
});

// Search departments (Admin only)
router.get('/search/:query', auth('admin'), async (req, res) => {
  try {
    const query = req.params.query;
    const departments = await Department.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { head: { $regex: query, $options: 'i' } },
        { categories: { $in: [new RegExp(query, 'i')] } }
      ]
    }).sort({ name: 1 });
    
    res.json(departments);
  } catch (error) {
    console.error('Error searching departments:', error);
    res.status(500).json({ msg: 'Failed to search departments' });
  }
});

module.exports = router;
