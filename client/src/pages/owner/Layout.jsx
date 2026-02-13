import React, { useEffect } from 'react'
import NavbarOwner from '../../components/owner/NavbarOwner'
import Sidebar from '../../components/owner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Layout = () => {
  const { isClient, navigate, roles, setActiveRole } = useAppContext()

  useEffect(() => {
    if (!isClient) {
      navigate('/')
      return
    }
    // Keep active role as client when viewing client dashboard
    const hasClient = Array.isArray(roles) && (roles.includes('client') || roles.includes('owner'))
    if (hasClient) setActiveRole('client')
  }, [isClient, navigate, roles, setActiveRole])

  return (
    <div className='h-screen flex flex-col pt-16'>
      <NavbarOwner />
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar />
        <div className='flex-1 overflow-y-auto'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout
