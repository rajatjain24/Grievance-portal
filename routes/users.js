const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
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

// Get current user profile
router.get('/profile', auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ msg: 'Failed to fetch user profile' });
  }
});

// Update profile
router.put('/profile', auth(), async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    // If password is being updated, hash it
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      updateData.password = await bcryptjs.hash(password, salt);
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json({ msg: "Profile updated successfully", user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ msg: 'Failed to update profile' });
  }
});

// Admin: Get all users
router.get('/', auth('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    const query = {};
    
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by role
    if (role && role !== 'all') {
      query.role = role;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ msg: 'Failed to fetch users' });
  }
});

// Admin: Get user by ID
router.get('/:id', auth('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ msg: 'Failed to fetch user' });
  }
});

// Admin: Update user
router.put('/:id', auth('admin'), async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    // If password is being updated, hash it
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      updateData.password = await bcryptjs.hash(password, salt);
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json({ msg: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ msg: 'Failed to update user', error: error.message });
  }
});

// Admin: Delete user
router.delete('/:id', auth('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ msg: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ msg: 'Failed to delete user' });
  }
});

// Admin: Toggle user status
router.patch('/:id/toggle-status', auth('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ 
      msg: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, 
      user: { _id: user._id, isActive: user.isActive } 
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ msg: 'Failed to toggle user status' });
  }
});

// Admin: Get user statistics
router.get('/admin/stats', auth('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: { $ne: false } });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const customerUsers = await User.countDocuments({ role: 'customer' });
    
    // Get user registration trends (last 12 months)
    const now = new Date();
    const registrationTrends = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Get users by role distribution
    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      customerUsers,
      registrationTrends,
      roleDistribution
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ msg: 'Failed to fetch user statistics' });
  }
});

module.exports = router;
