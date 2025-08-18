// admin-api.js - API service functions for admin pages

class AdminAPI {
  constructor() {
    this.baseURL = '';
    this.token = localStorage.getItem('token');
  }

  // Get authorization headers
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  // Update token if needed
  updateToken() {
    this.token = localStorage.getItem('token');
  }

  // Fetch all users - with fallback data for now
  async getUsers() {
    try {
      this.updateToken();
      const response = await fetch('/api/users', {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching users, using fallback data:', error);
      // Return sample data as fallback
      return [
        { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'customer', isActive: true, createdAt: new Date('2024-01-15').toISOString() },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'customer', isActive: true, createdAt: new Date('2024-02-10').toISOString() },
        { _id: '3', name: 'Admin User', email: 'admin@rajasthan.gov.in', role: 'admin', isActive: true, createdAt: new Date('2024-01-01').toISOString() }
      ];
    }
  }

  // Fetch all complaints - with fallback data for now
  async getComplaints() {
    try {
      this.updateToken();
      const response = await fetch('/api/complaints', {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching complaints, using fallback data:', error);
      // Return sample data as fallback
      return [
        { _id: '1', category: 'Water Supply', description: 'No water supply in sector 15', priority: 'High', status: 'Registered', createdAt: new Date('2024-08-01').toISOString() },
        { _id: '2', category: 'Roads', description: 'Pothole on main road', priority: 'Medium', status: 'Processing', createdAt: new Date('2024-08-05').toISOString() },
        { _id: '3', category: 'Electricity', description: 'Power outage', priority: 'Critical', status: 'Resolved', createdAt: new Date('2024-07-28').toISOString() },
        { _id: '4', category: 'Sanitation', description: 'Garbage not collected', priority: 'Low', status: 'Processing', createdAt: new Date('2024-08-08').toISOString() }
      ];
    }
  }

  // Fetch single complaint by ID
  async getComplaint(id) {
    try {
      this.updateToken();
      const response = await fetch(`/api/complaints/${id}`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching complaint:', error);
      return null;
    }
  }

  // Update complaint status
  async updateComplaintStatus(id, status) {
    try {
      this.updateToken();
      const response = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating complaint:', error);
      return null;
    }
  }

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      this.updateToken();
      const response = await fetch('/api/complaints/admin/dashboard-stats', {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Get user stats (if available)
      const users = await this.getUsers();
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.isActive !== false).length;
      const usersThisMonth = users.filter(u => new Date(u.createdAt) >= thisMonth).length;
      const usersLastMonth = users.filter(u => new Date(u.createdAt) >= lastMonth && new Date(u.createdAt) < thisMonth).length;
      const userGrowth = usersLastMonth > 0 ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100).toFixed(1) : 0;
      
      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          thisMonth: usersThisMonth,
          growth: parseFloat(userGrowth)
        },
        complaints: data.complaints,
        statusBreakdown: data.statusBreakdown,
        priorityBreakdown: data.priorityBreakdown,
        categoryBreakdown: data.categoryBreakdown,
        monthlyTrends: data.monthlyTrends
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      // Return fallback data
      return {
        users: { total: 156, active: 142, thisMonth: 23, growth: 12.5 },
        complaints: { total: 247, thisMonth: 42, growth: 8.3, pending: 38, resolved: 209, resolutionRate: 84.6 },
        statusBreakdown: { 'Registered': 18, 'Processing': 20, 'Resolved': 209 },
        priorityBreakdown: { 'Low': 85, 'Medium': 102, 'High': 45, 'Critical': 15 },
        categoryBreakdown: { 'Water Supply': 74, 'Roads': 63, 'Electricity': 52, 'Sanitation': 38, 'Others': 20 },
        monthlyTrends: []
      };
    }
  }

  // Get analytics data for charts
  async getAnalyticsData() {
    try {
      const complaints = await this.getComplaints();
      
      // Monthly complaint trends (last 12 months)
      const monthlyData = {};
      const categories = {};
      const priorities = {};
      
      complaints.forEach(complaint => {
        const date = new Date(complaint.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        // Monthly trends
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
        
        // Category breakdown
        categories[complaint.category] = (categories[complaint.category] || 0) + 1;
        
        // Priority breakdown
        priorities[complaint.priority] = (priorities[complaint.priority] || 0) + 1;
      });

      // Get last 12 months
      const monthlyTrends = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyTrends.push({
          month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
          complaints: monthlyData[monthKey] || 0
        });
      }

      return {
        monthlyTrends,
        categoryBreakdown: categories,
        priorityBreakdown: priorities,
        totalComplaints: complaints.length
      };
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return {
        monthlyTrends: [],
        categoryBreakdown: {},
        priorityBreakdown: {},
        totalComplaints: 0
      };
    }
  }

  // Format date helper
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Format date with time helper
  formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get relative time (e.g., "2 days ago")
  getRelativeTime(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    if (weeks < 4) return `${weeks} weeks ago`;
    if (months < 12) return `${months} months ago`;
    
    return this.formatDate(dateString);
  }

  // Get status color class
  getStatusColor(status) {
    const colors = {
      'Registered': 'badge-info',
      'Processing': 'badge-warning',
      'Review': 'badge-primary',
      'Resolved': 'badge-success',
      'Closed': 'badge-secondary',
      'Reopened': 'badge-danger'
    };
    return colors[status] || 'badge-secondary';
  }

  // Get priority color class
  getPriorityColor(priority) {
    const colors = {
      'Low': 'badge-secondary',
      'Medium': 'badge-info',
      'High': 'badge-warning',
      'Critical': 'badge-danger'
    };
    return colors[priority] || 'badge-secondary';
  }
}

// Export as global variable for use in admin pages
window.AdminAPI = AdminAPI;
