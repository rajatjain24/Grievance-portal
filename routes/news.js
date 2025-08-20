const express = require('express');
const router = express.Router();

// Mock news data related to Rajasthan Seva Portal
// In a real implementation, you would integrate with a news API like NewsAPI, RSS feeds, or government news sources
const mockNews = [
  {
    id: 1,
    title: "Rajasthan Government Launches New Digital Grievance System",
    description: "The state government has introduced an enhanced digital platform for citizens to register and track their complaints more efficiently.",
    date: "2025-01-18",
    category: "Government Services",
    imageUrl: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=400&h=200&fit=crop",
    source: "Rajasthan Government Portal"
  },
  {
    id: 2,
    title: "Water Supply Complaints Resolution Rate Improves to 95%",
    description: "Rajasthan Seva Portal reports significant improvement in resolving water supply related complaints across major cities.",
    date: "2025-01-17",
    category: "Infrastructure",
    imageUrl: "https://images.unsplash.com/photo-1544200478-d8bb6894cba8?w=400&h=200&fit=crop",
    source: "Rajasthan News Today"
  },
  {
    id: 3,
    title: "Mobile App for Rajasthan Seva Portal Under Development",
    description: "Citizens will soon be able to access government services through a dedicated mobile application for better convenience.",
    date: "2025-01-16",
    category: "Technology",
    imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop",
    source: "Digital Rajasthan Initiative"
  },
  {
    id: 4,
    title: "Road Infrastructure Complaints See Faster Response Times",
    description: "The transportation department has streamlined processes resulting in 40% faster response times for road-related grievances.",
    date: "2025-01-15",
    category: "Infrastructure",
    imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop",
    source: "Rajasthan Transport Authority"
  },
  {
    id: 5,
    title: "Electricity Board Partners with Seva Portal for Better Service",
    description: "New integration allows citizens to directly report power outages and track restoration progress through the seva portal.",
    date: "2025-01-14",
    category: "Utilities",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=200&fit=crop",
    source: "Rajasthan Electricity Board"
  },
  {
    id: 6,
    title: "Citizen Satisfaction Survey Shows 90% Approval Rating",
    description: "Recent survey indicates high satisfaction levels among users of the Rajasthan Seva Portal grievance system.",
    date: "2025-01-13",
    category: "Public Feedback",
    imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop",
    source: "Government Survey Department"
  }
];

// GET /api/news - Fetch latest news
router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const category = req.query.category;
    
    let filteredNews = mockNews;
    
    // Filter by category if provided
    if (category && category !== 'all') {
      filteredNews = mockNews.filter(news => 
        news.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Sort by date (newest first) and limit results
    const sortedNews = filteredNews
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
    
    res.json({
      success: true,
      news: sortedNews,
      total: filteredNews.length
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news'
    });
  }
});

// GET /api/news/:id - Fetch specific news article
router.get('/:id', (req, res) => {
  try {
    const newsId = parseInt(req.params.id);
    const newsItem = mockNews.find(item => item.id === newsId);
    
    if (!newsItem) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }
    
    res.json({
      success: true,
      news: newsItem
    });
  } catch (error) {
    console.error('Error fetching news article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news article'
    });
  }
});

// GET /api/news/categories - Get available news categories
router.get('/meta/categories', (req, res) => {
  try {
    const categories = [...new Set(mockNews.map(item => item.category))];
    res.json({
      success: true,
      categories: ['all', ...categories]
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

module.exports = router;
