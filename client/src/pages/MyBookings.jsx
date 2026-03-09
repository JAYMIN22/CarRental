import React, { useEffect, useState } from 'react'
import { assets} from '../assets/assets'
import Title from '../components/Title'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const MyBookings = () => {

  const { axios, user, currency, isRenter } = useAppContext()

  const [bookings, setBookings] = useState([])

  const fetchMyBookings = async ()=>{
    try {
      const { data } = await axios.get('/api/bookings/user')
      if (data.success){
        setBookings(data.bookings)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    if (user && isRenter) {
      fetchMyBookings()
    }
  },[user, isRenter])

  if (!user || !isRenter) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16 text-center'>
        <Title title='My Bookings' subTitle='Please login as a renter to view your bookings'/>
      </motion.div>
    )
  }

  return (
    <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    
    className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>

      <Title title='My Bookings'
       subTitle='View and manage your all car bookings'
       align="left"/>

       {bookings.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className='text-center py-20'>
          <p className='text-gray-500 text-lg'>No bookings yet</p>
          <p className='text-gray-400 mt-2'>Start by searching for a car to rent</p>
        </motion.div>
       ) : (
        <div className='mt-12 space-y-8'>
          {bookings.map((booking, index)=>(
            <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            
            key={booking._id} className='bg-white rounded-xl shadow-lg overflow-hidden'>
              
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 lg:p-8'>
                {/* Left: Car Image & Details */}
                <div className='lg:col-span-2'>
                  <motion.img 
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    src={booking.car.image} 
                    alt={booking.car.brand} 
                    className='w-full h-auto max-h-80 object-cover rounded-xl mb-6 shadow-md'/>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className='space-y-6'>
                    <div>
                      <h1 className='text-3xl font-bold'>{booking.car.brand} {booking.car.model}</h1>
                      <p className='text-gray-500 text-lg'>{booking.car.category} • {booking.car.year}</p>
                    </div>
                    <hr className='border-borderColor my-6'/>

                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                      {[
                        {icon: assets.users_icon, text: `${booking.car.seating_capacity || 'N/A'} Seats`},
                        {icon: assets.fuel_icon, text: booking.car.fuel_type || 'N/A'},
                        {icon: assets.car_icon, text: booking.car.transmission || 'N/A'},
                        {icon: assets.location_icon, text: booking.car.location || 'N/A'},
                      ].map(({icon, text})=>(
                        <div 
                          key={text} 
                          className='flex flex-col items-center bg-light p-4 rounded-lg'>
                          <img src={icon} alt="" className='h-5 mb-2'/>
                          <span className='text-sm text-center'>{text}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Right: Booking Info Panel */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500 bg-light'>
                  
                  <div className='flex items-center justify-between mb-4'>
                    <p className='px-3 py-1.5 bg-white rounded text-sm font-medium'>Booking #{index+1}</p>
                    <p className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-600' 
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {booking.status}
                    </p>
                  </div>

                  <div>
                    <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold mb-2'>
                      {currency}{booking.price}
                      <span className='text-base text-gray-400 font-normal'>total</span>
                    </p>
                    <hr className='border-borderColor my-4'/>
                  </div>

                  <div className='space-y-4'>
                    <div className='flex items-start gap-3'>
                      <img src={assets.calendar_icon_colored} alt="" className='w-5 h-5 mt-0.5'/>
                      <div>
                        <p className='text-gray-500 text-sm'>Rental Period</p>
                        <p className='font-medium'>{new Date(booking.pickupDate).toLocaleDateString()} - {new Date(booking.returnDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3'>
                      <img src={assets.location_icon_colored} alt="" className='w-5 h-5 mt-0.5'/>
                      <div>
                        <p className='text-gray-500 text-sm'>Pick-up Location</p>
                        <p className='font-medium'>{booking.car.location}</p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3'>
                      <img src={assets.car_icon} alt="" className='w-5 h-5 mt-0.5 opacity-60'/>
                      <div>
                        <p className='text-gray-500 text-sm'>Drive Option</p>
                        <p className='font-medium'>
                          {booking.needsDriver 
                            ? `With Driver${booking.driver ? ` • ${booking.driver.name}` : ' (awaiting driver)'}` 
                            : 'Self Drive'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <hr className='border-borderColor my-4'/>

                  <div className='text-sm text-gray-400'>
                    <p>Booked on {new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>

                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
       )}
      
    </motion.div>
  )
}

export default MyBookings
