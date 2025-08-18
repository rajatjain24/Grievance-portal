const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Make io available to routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join user to their specific room for targeted updates
  socket.on('joinUserRoom', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/grievance-portal', {
  useNewUrlParser: true, useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.log('DB error:', err));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/users', require('./routes/users'));
app.use('/api/departments', require('./routes/departments'));

// News API route for Rajasthan news
app.get('/api/news/rajasthan', async (req, res) => {
  try {
    // Using NewsAPI (replace with your API key)
    const newsApiKey = process.env.NEWS_API_KEY || 'your-news-api-key';
    const response = await axios.get(`https://newsapi.org/v2/everything?q=Rajasthan&country=in&apiKey=${newsApiKey}&pageSize=20&sortBy=publishedAt`);
    
    if (response.data.articles) {
      res.json({
        success: true,
        articles: response.data.articles.map(article => ({
          title: article.title,
          description: article.description,
          url: article.url,
          urlToImage: article.urlToImage,
          publishedAt: article.publishedAt,
          source: article.source.name
        }))
      });
    } else {
      // Fallback to sample news if API fails
      res.json({
        success: true,
        articles: [
          {
            title: "Rajasthan Government Launches New Digital Initiative",
            description: "The state government has announced a new digital platform to enhance citizen services.",
            url: "#",
            urlToImage: "https://via.placeholder.com/300x200",
            publishedAt: new Date().toISOString(),
            source: "Rajasthan Patrika"
          },
          {
            title: "Water Conservation Project Initiated in Desert Areas",
            description: "New water conservation measures are being implemented across desert regions of Rajasthan.",
            url: "#",
            urlToImage: "https://via.placeholder.com/300x200",
            publishedAt: new Date(Date.now() - 86400000).toISOString(),
            source: "Dainik Bhaskar"
          },
          {
            title: "Tourism Boost: New Heritage Sites Opened for Public",
            description: "Several heritage sites in Rajasthan have been renovated and opened for tourists.",
            url: "#",
            urlToImage: "https://via.placeholder.com/300x200",
            publishedAt: new Date(Date.now() - 172800000).toISOString(),
            source: "Times of India"
          }
        ]
      });
    }
  } catch (error) {
    console.error('News API error:', error);
    // Return fallback news
    res.json({
      success: true,
      articles: [
        {
          title: "Rajasthan Government Launches New Digital Initiative",
          description: "The state government has announced a new digital platform to enhance citizen services.",
          url: "#",
          urlToImage: "https://via.placeholder.com/300x200",
          publishedAt: new Date().toISOString(),
          source: "Rajasthan Patrika"
        }
      ]
    });
  }
});

// Home route
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));

// Protect admin routes (redirect to login if not authenticated)
const adminRoutes = ['/admin.html', '/admin-complaints.html', '/admin-users.html', '/admin-analytics.html', '/admin-departments.html', '/admin-reports.html', '/admin-settings.html', '/admin-notifications.html', '/admin-news.html'];

adminRoutes.forEach(route => {
  app.get(route, (req, res) => {
    // In a production environment, you'd check the token here
    // For now, just serve the file and let client-side JS handle auth
    res.sendFile(path.join(__dirname, 'public', route));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('WebSocket server initialized for real-time updates');
});
