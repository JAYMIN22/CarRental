# Troubleshooting Guide

## Quick Diagnostic Steps

### 1. Check if Servers are Running

**Backend (Port 5000):**
```bash
# Check if backend is running
curl http://localhost:5000/api/health
# OR open in browser: http://localhost:5000/api/health
```

**Frontend (Port 3000):**
```bash
# Open in browser
http://localhost:3000
```

### 2. Common Issues and Solutions

#### Issue: "Cannot GET /" or Blank Page
**Solution:**
- Make sure frontend is running: `cd frontend && npm start`
- Check browser console (F12) for errors
- Clear browser cache and reload

#### Issue: "Network Error" or "Failed to fetch"
**Solution:**
- Verify backend is running on port 5000
- Check CORS settings in `backend/server.js`
- Verify `FRONTEND_URL` in `backend/.env` matches `http://localhost:3000`

#### Issue: Login Not Working
**Solution:**
1. Check browser console (F12) for errors
2. Verify `.env` file has `JWT_SECRET` set
3. Check backend terminal for error messages
4. Test API directly:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test123"}'
   ```

#### Issue: "MongoDB connection error"
**Solution:**
- Verify MongoDB Atlas connection string in `.env`
- Check if IP is whitelisted in MongoDB Atlas
- Test connection: The backend should show "MongoDB Connected" on startup

#### Issue: Frontend Won't Start
**Solution:**
```bash
cd frontend
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

#### Issue: Port Already in Use
**Solution:**
```bash
# Windows - Find process using port
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# OR change ports in .env file
```

### 3. Step-by-Step Restart

If nothing works, restart everything:

```bash
# 1. Stop all Node processes
# Press Ctrl+C in all terminal windows running npm

# 2. Backend restart
cd backend
npm run dev

# 3. Frontend restart (in new terminal)
cd frontend
npm start
```

### 4. Check Browser Console

1. Open browser (Chrome/Firefox)
2. Press F12 to open Developer Tools
3. Go to "Console" tab
4. Look for red error messages
5. Share the error message for help

### 5. Verify Environment Setup

**Backend `.env` file should have:**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLOUD_STORAGE_URL=http://localhost:5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend `package.json` should have:**
```json
"proxy": "http://localhost:5000"
```

### 6. Test Individual Components

**Test Backend API:**
```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","phone":"1234567890","role":"Customer"}'
```

**Test Frontend:**
- Open http://localhost:3000
- Check if login page appears
- Open browser console (F12) and check for errors

### 7. Common Error Messages

**"JWT_SECRET is not defined"**
- Add `JWT_SECRET` to `backend/.env` file
- Restart backend server

**"Cannot find module 'xyz'"**
- Run `npm install` in the directory
- Check if package is in `package.json`

**"EADDRINUSE: address already in use"**
- Port is already taken
- Kill the process or change port

**"MongooseError: Operation timed out"**
- MongoDB connection issue
- Check connection string
- Verify network/firewall settings

### 8. Get Help

If still not working, provide:
1. Error message from browser console (F12)
2. Error message from backend terminal
3. What you're trying to do (login, register, etc.)
4. Screenshot of the error
