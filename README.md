# Car Rental System - MERN Stack

A comprehensive car rental system built with MongoDB, Express.js, React, and Node.js. This system supports multiple user roles: Customers, Hosts, Drivers, and Admins.

## Features

### Module 1: Authentication & Profile Management
- User registration with role selection (Customer/Host/Driver)
- Email and password validation
- KYC document upload (Driving License/RC Book)
- Profile verification workflow

### Module 2: Host Module
- Add new vehicles with details (make, model, registration, fuel type, etc.)
- Upload vehicle images
- Manage vehicle availability calendar
- Block dates for maintenance/unavailability
- View bookings for their vehicles

### Module 3: Customer Module
- Search vehicles by location, dates, and type (Self-Drive/With Driver)
- View available cars with pricing
- Create bookings with payment integration
- View booking history
- Upload KYC documents

### Module 4: Driver Module
- Real-time trip request notifications (Socket.IO)
- Go online/offline
- Accept trip requests
- Start and end trips with odometer readings
- Calculate extra charges (km, late fees)
- View trip history

### Module 5: Admin Module
- Approve/reject user profiles
- View dashboard analytics
- Revenue and commission tracking
- Fleet management statistics
- User management

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Socket.IO for real-time updates
- Multer for file uploads
- Bcrypt for password hashing

### Frontend
- React.js
- React Router
- Axios for API calls
- Socket.IO Client
- Material-UI components
- Recharts for analytics
- React DatePicker

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/carrental
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CLOUD_STORAGE_URL=http://localhost:5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

4. Create uploads directory:
```bash
mkdir uploads
```

5. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/upload-documents` - Upload KYC documents
- `GET /api/auth/me` - Get current user

### Host Routes
- `POST /api/host/vehicles` - Add new vehicle
- `GET /api/host/vehicles` - Get host's vehicles
- `POST /api/host/vehicles/:carId/availability` - Block dates
- `GET /api/host/bookings` - Get host's bookings

### Customer Routes
- `GET /api/customer/search` - Search vehicles
- `POST /api/customer/bookings` - Create booking
- `GET /api/customer/bookings` - Get customer's bookings

### Driver Routes
- `POST /api/driver/go-online` - Set driver online
- `POST /api/driver/go-offline` - Set driver offline
- `GET /api/driver/trip-requests` - Get trip requests
- `POST /api/driver/accept-trip/:bookingId` - Accept trip
- `POST /api/driver/start-trip/:bookingId` - Start trip
- `POST /api/driver/end-trip/:bookingId` - End trip
- `GET /api/driver/my-trips` - Get driver's trips

### Admin Routes
- `GET /api/admin/users/pending` - Get pending users
- `PUT /api/admin/users/:userId/approve` - Approve/reject user
- `GET /api/admin/dashboard` - Get dashboard analytics
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/cars` - Get all cars

## Database Models

### User
- name, email, password, phone, role
- isVerified, profileStatus
- documents array
- city, isOnline

### Car
- hostId, make, model, registrationNumber
- fuelType, transmission, basePrice
- images array, location (lat/long/city)
- status, allowDriver

### Booking
- customerId, carId, driverId
- bookingMode, startDate, endDate
- status, paymentStatus
- keyCode, odometer readings
- charges (base, extra km, late fees)

### CarAvailability
- carId, startDate, endDate, reason

## Real-time Features

The system uses Socket.IO for real-time updates:
- New trip requests broadcast to online drivers
- Driver acceptance notifications to customers
- Trip status updates

## Payment Integration

Currently uses a test payment ID. Integrate with actual payment gateway (Razorpay, Stripe, etc.) in production.

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- File upload validation
- Optimistic locking for bookings

## Future Enhancements

- Email verification system
- AI OCR for document reading
- GPS tracking integration
- Push notifications
- Rating and review system
- Advanced analytics and reporting

## License

MIT License
