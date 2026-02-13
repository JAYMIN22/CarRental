import React from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const NavbarOwner = () => {

    const {user} = useAppContext()

  return (
    <div className='fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-10 py-4 text-gray-500 border-b border-borderColor bg-white transition-all'>
      <Link to='/'>
        <img src={assets.logo} alt="" className="h-7"/>
      </Link>
      <Link to="/profile" className='text-sm hover:text-primary transition-all'>
        {user?.name ? `My Profile (${user.name})` : 'My Profile'}
      </Link>
    </div>
  )
}

export default NavbarOwner
