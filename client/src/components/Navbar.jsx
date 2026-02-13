import React, { useState } from 'react'
import { assets, menuLinks } from '../assets/assets'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import {motion} from 'motion/react'

const Navbar = () => {

    const {setShowLogin, user, isClient, isDriver, isRenter} = useAppContext()

    const location = useLocation()
    const [open, setOpen] = useState(false)
    const [searchText, setSearchText] = useState('')
    const navigate = useNavigate()

    const handleNavbarSearch = ()=>{
        const query = searchText.trim()
        if(!query) return
        navigate(`/cars?q=${encodeURIComponent(query)}`)
        setOpen(false)
    }

    // Role-based menu: My Bookings only for renters
    const filteredMenuLinks = menuLinks.filter(link => {
      if (link.path === '/my-bookings') return isRenter
      return true
    })

  return (
    <motion.div 
    initial={{y: -20, opacity: 0}}
    animate={{y: 0, opacity: 1}}
    transition={{duration: 0.5}}
    className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 text-gray-600 border-b border-borderColor relative transition-all ${location.pathname === "/" && "bg-light"}`}>

        <Link to='/'>
            <motion.img whileHover={{scale: 1.05}} src={assets.logo} alt="logo" className="h-8"/>
        </Link>

        <div className={`max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16 max-sm:border-t border-borderColor right-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4 transition-all duration-300 z-50 ${location.pathname === "/" ? "bg-light" : "bg-white"} ${open ? "max-sm:translate-x-0" : "max-sm:translate-x-full"}`}>
            {filteredMenuLinks.map((link, index)=> (
                <Link key={index} to={link.path}>
                    {link.name}
                </Link>
            ))}

            <div className='hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56'>
                <input
                    type="text"
                    className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
                    placeholder="Search cars"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            handleNavbarSearch()
                        }
                    }}
                />
                <button
                    type="button"
                    onClick={handleNavbarSearch}
                    className="flex items-center justify-center"
                    aria-label="Search cars"
                >
                    <img src={assets.search_icon} alt="search" />
                </button>
            </div>

            <div className='flex max-sm:flex-col items-start sm:items-center gap-6'>

                {/* Show dashboard for current active role only */}
                {isClient && (
                    <button onClick={()=> navigate('/owner')} className="cursor-pointer">
                        Client Dashboard
                    </button>
                )}
                {!user && (
                    <button onClick={()=> setShowLogin(true)} className="cursor-pointer">
                        List your car
                    </button>
                )}

                {isDriver && (
                    <button onClick={()=> navigate('/driver')} className="cursor-pointer">
                        Driver Dashboard
                    </button>
                )}

                <button
                  onClick={()=> {user ? navigate('/profile') : setShowLogin(true)}}
                  className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg"
                >
                  {user ? 'My Profile' : 'Login'}
                </button>
            </div>
        </div>

        <button className='sm:hidden cursor-pointer' aria-label="Menu" onClick={()=> setOpen(!open)}>
            <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
        </button>
      
    </motion.div>
  )
}

export default Navbar
