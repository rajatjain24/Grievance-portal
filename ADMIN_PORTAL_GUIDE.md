# Admin Portal Guide - Rajasthan Seva Portal

## Overview
The Admin Portal allows authorized administrators to view and manage all user complaints in the grievance portal system. Admins can view complaint details, change status updates, and track complaint resolution progress.

## Features Implemented

### 1. Admin Portal Button in Home Page
- Added a prominent "Admin Portal" button in the main navigation bar on `index.html`
- Button is styled with a distinct red background to differentiate it from regular user options
- Links to the dedicated admin login page

### 2. Admin Login System (`admin-login.html`)
- **Two-mode interface**: Login and Account Creation
- **Login Mode**: 
  - Email and password authentication
  - Validates admin role before granting access
  - Automatic redirection to admin dashboard upon successful login
- **Account Creation Mode**:
  - Allows creation of new admin accounts
  - Requires special admin key: `ADMIN_SECRET_2024`
  - Full name, email, password, and admin key validation

### 3. Admin Dashboard (`admin.html`)
- **Complete Complaint Management Interface**
- **View All User Complaints**: 
  - Shows all complaints from all users
  - Displays user name, category, location, description, date/time, and current status
- **Filtering Options**:
  - Filter by category (Water, Electricity, Road, Sanitation, Other)
  - Filter by status (Registered, Processing, Review, Resolved)
- **Status Update Functionality**:
  - Dropdown menus for each complaint to change status
  - Real-time status updates via API calls
  - Status changes are immediately saved to database

### 4. Real-time Status Synchronization
- **Instant Updates**: When admin changes complaint status, it's immediately reflected:
  - In user dashboard (`dashboard.html`)
  - In status tracking page (`status.html`)
  - In all admin views
- **Database Consistency**: All status changes are persisted to MongoDB

### 5. Role-based Access Control
- **Admin Authentication**: Only users with 'admin' role can access admin features
- **Protected Routes**: Admin pages redirect to login if not authenticated
- **JWT Token Validation**: All admin operations require valid admin tokens

## How to Use the Admin Portal

### Step 1: Access Admin Portal
1. Go to the home page (`http://localhost:3000`)
2. Click the red "Admin Portal" button in the navigation bar
3. You'll be redirected to `admin-login.html`

### Step 2: Create Admin Account (First Time Only)
1. Click "Create Admin Account" tab
2. Fill in the required information:
   - Full Name
   - Email Address
   - Password
   - Admin Key: `ADMIN_SECRET_2024`
3. Click "Create Admin Account"
4. Wait for success message and switch to login

### Step 3: Login as Admin
1. Use the "Login" tab (default)
2. Enter your admin email and password
3. Click "Login as Admin"
4. You'll be redirected to the admin dashboard

### Step 4: Manage Complaints
1. **View All Complaints**: The dashboard shows all user complaints in a table format
2. **Filter Complaints**: Use category and status filters to find specific complaints
3. **Update Status**: 
   - Find the complaint you want to update
   - Use the dropdown in "Update Status" column
   - Select new status (Registered → Processing → Review → Resolved)
   - Status is automatically saved when changed
4. **Monitor Progress**: Status updates are immediately visible to users

### Step 5: User Experience
When you update a complaint status:
- Users see the updated status in their dashboard immediately
- Status tracking page reflects the new status
- Users get real-time feedback on complaint progress

## Technical Details

### Database Schema
- **User Model**: Includes role field ('customer' or 'admin')
- **Complaint Model**: Links to user via createdBy field
- **Status Enum**: 'Registered', 'Processing', 'Review', 'Resolved'

### API Endpoints Used
- `POST /api/auth/admin-signup` - Create admin account
- `POST /api/auth/login` - Admin login
- `GET /api/complaints` - Fetch all complaints (admin) or user's complaints
- `PUT /api/complaints/:id` - Update complaint status (admin only)

### Security Features
- JWT token-based authentication
- Role-based route protection
- Admin key verification for account creation
- Secure password hashing with bcrypt

## Testing the System

### Test Scenario 1: Admin Account Creation
1. Go to admin login page
2. Create admin account with key `ADMIN_SECRET_2024`
3. Verify account creation success
4. Login with new admin credentials

### Test Scenario 2: Status Updates
1. Create a test user complaint
2. Login as admin
3. Change complaint status from "Registered" to "Processing"
4. Login as the user and verify status update is visible
5. Check status tracking page with complaint ID

### Test Scenario 3: Filtering and Management
1. Create multiple complaints with different categories
2. Login as admin
3. Test category and status filters
4. Update multiple complaint statuses
5. Verify all changes persist correctly

## File Structure
```
public/
├── index.html          # Home page with Admin Portal button
├── admin-login.html    # Admin login and signup page
├── admin.html         # Admin dashboard for complaint management
├── dashboard.html     # User dashboard (shows updated statuses)
├── status.html       # Status tracking (reflects admin changes)
└── ...other files

routes/
├── auth.js           # Authentication routes (includes admin signup)
├── complaints.js     # Complaint management routes
└── ...

models/
├── User.js          # User model with role field
└── Complaint.js     # Complaint model
```

## Summary
The admin portal is now fully functional with:
- ✅ Admin Portal button in home page navigation
- ✅ Dedicated admin login interface with account creation
- ✅ Complete complaint management dashboard
- ✅ Real-time status update functionality
- ✅ Synchronized status display across all user interfaces
- ✅ Role-based security and access control
- ✅ Filtering and search capabilities
- ✅ Professional UI design consistent with the portal theme

Administrators can now efficiently manage all user complaints, update their status, and provide real-time feedback to citizens through the portal system.
