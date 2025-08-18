# 🏛️ Rajasthan Grievance Portal

A comprehensive citizen complaint management system built with Node.js, Express, MongoDB, and Socket.IO for real-time updates. This portal allows citizens to submit complaints and track their status, while providing administrators with powerful tools to manage and resolve issues efficiently.

## ✨ Features

### 🔐 User Authentication & Authorization
- Secure user registration and login system
- Role-based access control (Admin/User)
- JWT-based authentication
- Password encryption with bcryptjs

### 👨‍💼 Admin Portal
- **Dashboard**: Real-time statistics and analytics
- **Complaint Management**: View, filter, edit, and delete complaints
- **User Management**: Manage citizen accounts
- **Analytics**: Charts and graphs showing complaint trends
- **News Integration**: Latest Rajasthan news from external APIs
- **Real-time Updates**: Live status changes via Socket.IO

### 👤 Citizen Portal
- **Complaint Submission**: Easy-to-use complaint form
- **Status Tracking**: Real-time complaint status updates
- **Dashboard**: Personal complaint history
- **Notifications**: Instant updates when complaint status changes

### 📰 News Integration
- Fetches latest Rajasthan news from NewsAPI
- Admin can view and manage news articles
- Export functionality for news data

### 🔄 Real-time Features
- WebSocket integration for instant updates
- Live complaint status notifications
- Real-time dashboard updates

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd grievance-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on localhost:27017
   mongod
   ```

4. **Set up environment variables** (Optional)
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/grievance-portal
   JWT_SECRET=your-jwt-secret-key
   NEWS_API_KEY=your-news-api-key
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Main Portal: http://localhost:3000
   - Admin Login: http://localhost:3000/admin-login.html

## 📁 Project Structure

```
grievance-portal/
├── public/                 # Frontend files
│   ├── index.html         # Main landing page
│   ├── login.html         # User login
│   ├── signup.html        # User registration
│   ├── dashboard.html     # User dashboard
│   ├── complaint.html     # Complaint form
│   ├── status.html        # Status tracker
│   ├── admin-*.html       # Admin panel pages
│   ├── style.css          # Main styles
│   ├── script.js          # Frontend JavaScript
│   └── admin-api.js       # Admin API functions
├── routes/                # API routes
│   ├── auth.js           # Authentication routes
│   ├── complaints.js     # Complaint CRUD operations
│   └── users.js          # User management
├── models/               # MongoDB schemas
│   ├── User.js           # User model
│   └── Complaint.js      # Complaint model
├── services/             # Business logic
│   ├── geoService.js     # Location services
│   └── otpService.js     # OTP functionality
├── app.js               # Main application file
└── package.json         # Dependencies
```

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Complaints
- `GET /api/complaints` - Get complaints (filtered by role)
- `POST /api/complaints` - Submit new complaint
- `GET /api/complaints/:id` - Get specific complaint
- `PUT /api/complaints/:id` - Update complaint (Admin only)
- `DELETE /api/complaints/:id` - Delete complaint (Admin only)
- `GET /api/complaints/admin/dashboard-stats` - Get dashboard statistics

### News
- `GET /api/news/rajasthan` - Get latest Rajasthan news

## 🔧 Configuration

### Default Admin Account
Create an admin user by registering through the normal signup process, then manually update the database:

```javascript
// In MongoDB shell or through a database client
db.users.updateOne(
  { email: "admin@rajasthan.gov.in" }, 
  { $set: { role: "admin" } }
);
```

### News API Integration
1. Sign up at [NewsAPI.org](https://newsapi.org/)
2. Get your API key
3. Set the `NEWS_API_KEY` environment variable

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT tokens for authentication
- Role-based authorization
- Protected admin routes
- Input validation and sanitization
- CORS enabled for secure cross-origin requests

## 📊 Real-time Features

The application uses Socket.IO for real-time updates:

- **Complaint Status Updates**: When an admin updates a complaint status, users receive instant notifications
- **Dashboard Analytics**: Live updates of statistics and charts
- **Activity Feed**: Real-time activity updates in admin panel

## 🎨 Frontend Features

- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Beautiful glassmorphism design with animations
- **Interactive Charts**: Dashboard analytics with Chart.js
- **Real-time Notifications**: Toast notifications for status updates
- **Export Functionality**: Download data as CSV files

## 🔄 Deployment

### Production Setup

1. **Set environment variables**
   ```bash
   export NODE_ENV=production
   export PORT=3000
   export MONGODB_URI=mongodb://localhost:27017/grievance-portal
   export JWT_SECRET=your-secure-jwt-secret
   export NEWS_API_KEY=your-news-api-key
   ```

2. **Install PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start app.js --name "grievance-portal"
   ```

3. **Set up reverse proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Changelog

### Version 1.0.0
- ✅ Complete admin portal with real-time updates
- ✅ Backend API integration for all admin operations
- ✅ Rajasthan news integration with external API
- ✅ Socket.IO implementation for real-time notifications
- ✅ Enhanced complaint management system
- ✅ Improved security and authentication
- ✅ Mobile-responsive design

## 🔧 Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (not implemented yet)
```

### Development Tips
- Use `nodemon` for auto-reloading during development
- Monitor MongoDB logs for debugging database issues
- Use browser developer tools to debug frontend issues
- Check Socket.IO connection in browser console

## 📞 Support

For support and questions:
- Email: support@rajasthan-portal.gov.in
- Phone: +91-XXX-XXX-XXXX
- Office Hours: Monday-Friday, 9:00 AM - 6:00 PM IST

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Chart.js for beautiful analytics charts
- Socket.IO for real-time communication
- NewsAPI for news integration
- Font Awesome for icons
- Google Fonts for typography

---

**Made with ❤️ for the citizens of Rajasthan**
#   G r i e v a n c e - p o r t a l  
 