# Setup Instructions

## Quick Start Guide

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/carrental
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
CLOUD_STORAGE_URL=http://localhost:5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Create the uploads directory:
```bash
mkdir uploads
```

Start MongoDB (if running locally):
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

Start the backend server:
```bash
npm run dev
```

Create admin user (optional, run once):
```bash
node -e "require('./middleware/createAdmin.js')"
```
Default admin credentials:
- Email: admin@carrental.com
- Password: admin123

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will automatically open at `http://localhost:3000`

## Testing the System

### 1. Register Users

1. Register as a **Customer**
2. Register as a **Host**
3. Register as a **Driver**
4. Login as **Admin** (use the default credentials above)

### 2. Admin Workflow

1. Login as Admin
2. Go to "Pending User Approvals"
3. Review and approve users (especially Host and Driver)

### 3. Host Workflow

1. Login as Host
2. Add a new vehicle with all details
3. Upload vehicle images
4. Optionally block dates for maintenance

### 4. Customer Workflow

1. Login as Customer
2. Upload KYC documents (wait for admin approval)
3. Search for vehicles by location and dates
4. Book a vehicle (Self-Drive or With Driver)

### 5. Driver Workflow

1. Login as Driver
2. Enter your city and go online
3. View available trip requests
4. Accept a trip request
5. Start trip when it begins
6. End trip when completed

## Important Notes

- Make sure MongoDB is running before starting the backend
- File uploads are stored locally in the `backend/uploads` directory
- For production, configure cloud storage (Azure Blob/AWS S3) in the `.env` file
- Payment integration is currently using test payment IDs - integrate with actual gateway for production
- Socket.IO is configured for real-time updates - ensure both frontend and backend are running

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is installed and running
- Check the MONGODB_URI in `.env` file
- For MongoDB Atlas, use the connection string format: `mongodb+srv://username:password@cluster.mongodb.net/carrental`

### Port Already in Use
- Change PORT in backend `.env` file
- Update FRONTEND_URL accordingly

### CORS Errors
- Ensure FRONTEND_URL in backend `.env` matches your frontend URL
- Check that both servers are running

### File Upload Issues
- Ensure `uploads` directory exists in backend folder
- Check file permissions
- Verify file size limits (currently 5MB)
