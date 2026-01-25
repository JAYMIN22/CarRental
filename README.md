# Car Rental Booking System (MERN Stack)

A fully functional, production‑ready **Car Rental Booking Website** built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)** with **ImageKit** integration for media storage.

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
