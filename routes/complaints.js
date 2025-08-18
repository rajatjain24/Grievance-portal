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
  try {
    let c = await Complaint.findByIdAndUpdate(
      req.params.id, 
      { 
        status: req.body.status,
        updatedAt: new Date(),
        ...(req.body.adminNotes && { adminNotes: req.body.adminNotes })
      }, 
      { new: true }
    ).populate('createdBy', 'name email');
    
    if (!c) return res.status(404).json({ msg: "Not found" });
    
    // Emit real-time update to user (if WebSocket is available)
    if (req.app.get('io')) {
      req.app.get('io').emit('complaintStatusUpdate', {
        complaintId: c._id,
        status: c.status,
        userId: c.createdBy._id
      });
    }
    
    res.json({ msg: "Status updated", complaint: c });
  } catch (error) {
    res.status(500).json({ msg: "Failed to update complaint status" });
  }
});

// Admin: Get dashboard statistics
router.get('/admin/dashboard-stats', auth('admin'), async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total complaints
    const totalComplaints = await Complaint.countDocuments();
    
    // Complaints this month
    const complaintsThisMonth = await Complaint.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // Complaints last month
    const complaintsLastMonth = await Complaint.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });
    
    // Status breakdown
    const statusStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Category breakdown
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Priority breakdown
    const priorityStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Monthly trends (last 12 months)
    const monthlyTrends = await Complaint.aggregate([
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
    
    const resolvedCount = statusStats.find(s => s._id === 'Resolved')?.count || 0;
    const pendingCount = totalComplaints - resolvedCount;
    const resolutionRate = totalComplaints > 0 ? (resolvedCount / totalComplaints * 100).toFixed(1) : 0;
    
    const monthlyGrowth = complaintsLastMonth > 0 
      ? ((complaintsThisMonth - complaintsLastMonth) / complaintsLastMonth * 100).toFixed(1)
      : 0;
    
    res.json({
      complaints: {
        total: totalComplaints,
        thisMonth: complaintsThisMonth,
        growth: parseFloat(monthlyGrowth),
        resolved: resolvedCount,
        pending: pendingCount,
        resolutionRate: parseFloat(resolutionRate)
      },
      statusBreakdown: statusStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      categoryBreakdown: categoryStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      priorityBreakdown: priorityStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      monthlyTrends: monthlyTrends.map(item => ({
        month: new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' }),
        complaints: item.count
      }))
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ msg: "Failed to get dashboard statistics" });
  }
});

// Admin: Delete complaint
router.delete('/:id', auth('admin'), async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ msg: "Complaint not found" });
    }
    res.json({ msg: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to delete complaint" });
  }
});

module.exports = router;
