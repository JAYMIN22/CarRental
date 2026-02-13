import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import CarDetails from './pages/CarDetails'
import Cars from './pages/Cars'
import MyBookings from './pages/MyBookings'
import Footer from './components/Footer'
import Layout from './pages/owner/Layout'
import Dashboard from './pages/owner/Dashboard'
import AddCar from './pages/owner/AddCar'
import ManageCars from './pages/owner/ManageCars'
import ManageBookings from './pages/owner/ManageBookings'
import DriverDashboard from './pages/driver/DriverDashboard'
import Profile from './pages/Profile'
import Login from './components/Login'
import { Toaster } from 'react-hot-toast'
import { useAppContext } from './context/AppContext'

const App = () => {

  const {showLogin, isDriver, isRenter, isClient, token, user} = useAppContext()
  const location = useLocation()
  const isOwnerPath = location.pathname.startsWith('/owner')
  const isDriverPath = location.pathname.startsWith('/driver')

  const showShellNavbar = !isOwnerPath && !isDriverPath
  const showShellFooter = !isOwnerPath && !isDriverPath

  return (
    <>
     <Toaster />
      {showLogin && <Login/>}

      {showShellNavbar && <Navbar/>}

    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/car-details/:id' element={<CarDetails/>}/>
      <Route path='/cars' element={<Cars/>}/>
      <Route
        path='/profile'
        element={user ? <Profile/> : <Navigate to='/' replace />}
      />
      <Route
        path='/my-bookings'
        element={isRenter || (token && !user) ? <MyBookings/> : <Navigate to='/' replace />}
      />

      {/* Client (car owner) area - require current role = client */}
      <Route path='/owner' element={isClient || (token && !user) ? <Layout /> : <Navigate to='/' replace />}>
        <Route index element={<Dashboard />}/>
        <Route path="add-car" element={<AddCar />}/>
        <Route path="manage-cars" element={<ManageCars />}/>
        <Route path="manage-bookings" element={<ManageBookings />}/>
      </Route>

      {/* Driver dashboard (protected client-side by isDriver) */}
      <Route
        path='/driver'
        element={isDriver || (token && !user) ? <DriverDashboard /> : <Navigate to='/' replace />}
      />
    </Routes>

    {showShellFooter && <Footer />}
    
    </>
  )
}

export default App
