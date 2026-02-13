# Car Rental Booking System (MERN Stack)

A fully functional, production‑ready **Car Rental Booking Website** built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)** with **ImageKit** integration for media storage.

---

## 💡 Problem It Solves

**For Renters:**
* Simplifies finding and booking luxury cars with easy search filters and location-based selection
* Secure booking system with verified car owners and transparent pricing
* Eliminates the hassle of traditional car rental processes with instant online bookings

**For Car Owners:**
* Enables effortless monetization of luxury vehicles without managing bookings manually
* Handles insurance, driver verification, and secure payments automatically
* Provides a platform to earn passive income from idle vehicles with minimal effort

**For Everyone:**
* Streamlined, digital-first car rental experience replacing time-consuming offline processes
* Safe and secure transactions with JWT authentication and verified users
* Centralized platform connecting car owners with renters efficiently

---

## 🚀 Features

### 👤 **User Features**

* User Registration & Login (JWT‑based authentication)
* Browse cars with filters
* Select pickup location & date
* View car details
* Make a booking
* View "My Bookings" page

### 🛠️ **Admin Features**

* Secure Admin Login
* Add new cars
* Manage all bookings
* Manage car inventory including images

### 🖼️ **Image Handling**

* Image upload handled via **ImageKit**
* Auto optimization, fast delivery

### 🌐 **Fully Deployed Application**

* Frontend deployed (e.g., on Vercel or Netlify)
* Backend deployed (e.g., on Render or Railway)
* Connected to MongoDB Atlas

---

## 📱 Platform Accessibility

**Supported Devices:**
* 💻 **Desktop** - Windows, macOS, Linux
* 📱 **Mobile** - iOS and Android smartphones
* 📲 **Tablets** - iPad, Android tablets
* 🌐 **Web Browsers** - Chrome, Firefox, Safari, Edge (latest versions)

**Access Requirements:**
* Internet connection
* Modern web browser with JavaScript enabled
* Responsive design optimized for all screen sizes (mobile-first approach)

**Access Methods:**
* Direct web URL (when deployed)
* Any device with a web browser
* No app installation required - fully web-based

---

## 🏗️ Tech Stack

### **Frontend**

* React.js
* React Router
* Axios
* Context API
* CSS / Tailwind (optional)

### **Backend**

* Node.js
* Express.js
* MongoDB & Mongoose
* JWT Authentication
* ImageKit SDK

### **Deployment**

* Frontend → Vercel / Netlify
* Backend → Render / Railway / VPS
* Database → MongoDB Atlas
* Media → ImageKit

---

## 📁 Folder Structure

```
CarRentalDUHACKS/
│
├── client/             # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   └── package.json
│
├── server/             # Node Backend
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── configs/
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 📦 Build for Production

### Frontend Build

```bash
cd client
npm run build
```

This generates a production-ready build inside `/dist`.

---

## ☁️ Deployment Steps

### **Frontend (Vercel / Netlify)**

1. Connect GitHub repo
2. Select the `client` folder
3. Build Command → `npm run build`
4. Output Directory → `dist`

### **Backend (Render / Railway)**

1. Create new web service
2. Use `server` folder
3. Add environment variables
4. Deploy

### **ImageKit Setup**

* Create a new ImageKit project
* Copy API Keys to `.env`
* Use `.upload()` method to upload car images

---

## 🔗 API Endpoints

### **Auth Routes**

| Method | Endpoint           | Description   |
| ------ | ------------------ | ------------- |
| POST   | /api/auth/register | Register user |
| POST   | /api/auth/login    | Login user    |

### **Car Routes**

| Method | Endpoint      | Description     |
| ------ | ------------- | --------------- |
| GET    | /api/cars     | List all cars   |
| GET    | /api/cars/:id | Get car details |
| POST   | /api/cars     | Add car (Admin) |

### **Booking Routes**

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| POST   | /api/bookings    | Create booking    |
| GET    | /api/bookings/me | Get user bookings |

---



---

## 🛡️ Authentication Flow

* User logs in → Backend generates JWT
* Frontend stores token in localStorage
* Token added in every protected request header
* Admin routes are protected using middleware

---

## 🐛 Challenges I Ran Into

**Image Upload & Storage:**
* Initially struggled with handling file uploads and storing images efficiently
* **Solution:** Integrated ImageKit for automatic image optimization and fast CDN delivery, simplifying the upload process

**Navigation & Routing:**
* Button clicks not properly routing to intended pages (e.g., "List your car" button)
* **Solution:** Implemented React Router's `useNavigate` hook to handle programmatic navigation correctly

**Date Validation:**
* Ensuring pickup dates are not in the past and return dates are after pickup dates
* **Solution:** Added date validation with `min` attributes and client-side checks before form submission

**State Management:**
* Managing complex state across multiple components (pickup location, dates, user authentication)
* **Solution:** Used React Context API to centralize state management and avoid prop drilling

**JWT Authentication:**
* Securing routes and maintaining user sessions across page refreshes
* **Solution:** Implemented JWT tokens stored in localStorage with middleware to protect backend routes

---

## ✨ Bonus Features You Can Add

* Payment gateway (Razorpay / Stripe)
* Advanced car filters (price, brand, fuel type)
* Reviews & ratings
* Coupon/discount system
* Admin analytics dashboard
* OTP login

---


## 📄 License

This project is open source and free to use.

---

## 💬 Feedback & Support

Feel free to fork the project, raise issues, or suggest improvements!
