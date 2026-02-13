import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import HostDashboard from './pages/HostDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role.toLowerCase()}/dashboard`} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={`/${user.role.toLowerCase()}/dashboard`} />} />
      
      <Route 
        path="/customer/dashboard" 
        element={
          <PrivateRoute allowedRoles={['Customer']}>
            <CustomerDashboard />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/host/dashboard" 
        element={
          <PrivateRoute allowedRoles={['Host']}>
            <HostDashboard />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/driver/dashboard" 
        element={
          <PrivateRoute allowedRoles={['Driver']}>
            <DriverDashboard />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/admin/dashboard" 
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } 
      />
      
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

export default App;
