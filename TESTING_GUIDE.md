# Testing Guide - Car Rental System

## ✅ Server Status

- **Backend Server**: Running on `http://localhost:5000`
- **Frontend Server**: Starting on `http://localhost:3000` (will open automatically)

## 🧪 Testing Steps

### 1. Test Backend Health Check
Open in browser or use curl:
```
http://localhost:5000/api/health
```
Expected: `{"status":"OK","message":"Car Rental API is running"}`

### 2. Test Frontend
- Open browser: `http://localhost:3000`
- You should see the Login page

### 3. Create Test Users

#### Register as Customer:
- Click "Register"
- Fill in:
  - Name: Test Customer
  - Email: customer@test.com
  - Phone: 1234567890
  - Password: test123
  - Role: Customer
- Click Register

#### Register as Host:
- Logout (if logged in)
- Register with:
  - Name: Test Host
  - Email: host@test.com
  - Phone: 1234567891
  - Password: test123
  - Role: Host

#### Register as Driver:
- Logout
- Register with:
  - Name: Test Driver
  - Email: driver@test.com
  - Phone: 1234567892
  - Password: test123
  - Role: Driver

### 4. Admin Setup

#### Create Admin User:
```bash
cd backend
node -e "require('./middleware/createAdmin.js')"
```

Default Admin Credentials:
- Email: `admin@carrental.com`
- Password: `admin123`

#### Login as Admin:
1. Login with admin credentials
2. Go to "Pending User Approvals"
3. Approve the test users (Customer, Host, Driver)

### 5. Test Host Features

1. Login as Host
2. Click "Add New Vehicle"
3. Fill in vehicle details:
   - Make: Toyota
   - Model: Innova
   - Registration: TN01AB1234
   - Fuel Type: Diesel
   - Transmission: Manual
   - Base Price: 1500
   - City: Chennai
   - Latitude: 13.0827
   - Longitude: 80.2707
   - Upload at least one image
4. Click "Add Vehicle"
5. Try "Manage Availability" to block dates

### 6. Test Customer Features

1. Login as Customer
2. Upload KYC Documents (optional for testing)
3. Search for vehicles:
   - Location: Chennai (or any city)
   - Select start and end dates
   - Choose "Self-Drive" or "With Driver"
   - Click Search
4. Book a vehicle
5. View "My Bookings"

### 7. Test Driver Features

1. Login as Driver
2. Enter your city (e.g., "Chennai")
3. Click "Go Online"
4. If there's a booking with "With Driver" mode, you'll see trip requests
5. Accept a trip
6. Start trip (when date arrives)
7. End trip (when completed)

### 8. Test Admin Dashboard

1. Login as Admin
2. View Dashboard Analytics
3. Check revenue, bookings, fleet statistics
4. Approve/reject pending users

## 🔍 Common Issues & Solutions

### Backend not starting:
- Check if MongoDB connection is working
- Verify `.env` file exists in `backend/` folder
- Check if port 5000 is already in use

### Frontend not starting:
- Check if port 3000 is available
- Verify `node_modules` is installed: `cd frontend && npm install`

### Login not working:
- Verify `.env` file has `JWT_SECRET` set
- Check backend console for errors
- Ensure MongoDB is connected

### File upload not working:
- Verify `backend/uploads/` directory exists
- Check file size (max 5MB)
- Ensure images are in correct format

## 📝 API Testing with Postman/Thunder Client

### Test Login:
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "customer@test.com",
  "password": "test123"
}
```

### Test Search (requires auth token):
```
GET http://localhost:5000/api/customer/search?location=Chennai&startDate=2024-02-01&endDate=2024-02-05&type=Self-Drive
Authorization: Bearer YOUR_TOKEN_HERE
```

## ✅ Success Criteria

- [ ] Backend server runs without errors
- [ ] Frontend opens in browser
- [ ] Can register new users
- [ ] Can login with credentials
- [ ] Admin can approve users
- [ ] Host can add vehicles
- [ ] Customer can search and book
- [ ] Driver can see trip requests
- [ ] Real-time updates work (Socket.IO)

## 🚀 Next Steps

Once everything is tested:
1. Share repository with team members
2. Set up MongoDB Atlas (if not already)
3. Configure production environment variables
4. Deploy to hosting (Heroku, Vercel, etc.)
