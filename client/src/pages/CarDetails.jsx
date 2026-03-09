import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'
import axiosLib from 'axios'

const paymentsAxios = axiosLib.create({
  baseURL: import.meta.env.VITE_PAYMENTS_URL || import.meta.env.VITE_BASE_URL || '',
})

const CarDetails = () => {

  const {id} = useParams()
  const [searchParams] = useSearchParams()
  
  // Get dates from URL params first (when coming from search), then fallback to context
  const urlPickupDate = searchParams.get('pickupDate')
  const urlReturnDate = searchParams.get('returnDate')

  const {cars, axios, pickupDate: contextPickupDate, setPickupDate, returnDate: contextReturnDate, setReturnDate, user, isRenter, isClient, setShowLogin, isDriver, currency} = useAppContext()
  
  // Use URL params if available, otherwise use context values
  const pickupDate = urlPickupDate || contextPickupDate
  const returnDate = urlReturnDate || contextReturnDate

  // Only renters and guests can see booking form. Clients/drivers: no rent UI.
  // NOTE: don't use legacy isOwner here; it can be true for multi-role accounts even in renter mode.
  const showBookingForm = (isRenter || !user) && !isClient && !isDriver

  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [driveOption, setDriveOption] = useState('self') // 'self' | 'driver'
  const [isProcessing, setIsProcessing] = useState(false)
  const DRIVER_FEE_PER_DAY = 500

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const calculateDays = () => {
    if (!pickupDate || !returnDate) return 0
    const start = new Date(pickupDate)
    const end = new Date(returnDate)
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const handleSubmit = async (e)=>{
    e.preventDefault();

    // Prevent non-renter roles from booking
    if (!user) {
      setShowLogin(true)
      return;
    }

    if (!isRenter) {
      toast.error('Only renter accounts can book cars')
      return;
    }

    const days = calculateDays()
    if (days <= 0) {
      toast.error('Please select a valid rental period')
      return
    }

    if (!car) {
      toast.error('Car details not loaded yet')
      return
    }

    const needsDriver = driveOption === 'driver'
    const rentalBase = car.pricePerDay * days
    const driverCost = needsDriver ? DRIVER_FEE_PER_DAY * days : 0
    const totalAmount = rentalBase + driverCost

    if (!totalAmount || totalAmount <= 0) {
      toast.error('Invalid booking amount')
      return
    }

    try {
      setIsProcessing(true)

      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error('Unable to load payment gateway. Please try again.')
        setIsProcessing(false)
        return
      }

      const { data } = await paymentsAxios.post('/api/payments/create-order', {
        amount: totalAmount * 100, // convert to smallest currency unit
        currency,
        meta: {
          carId: id,
          pickupDate,
          returnDate,
          needsDriver,
        },
      })

      if (!data?.success || !data?.order || !data?.key) {
        toast.error(data?.message || 'Unable to start payment')
        setIsProcessing(false)
        return
      }

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Car Rental',
        description: `${car.brand} ${car.model} booking`,
        order_id: data.order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        notes: {
          booking_type: 'car_rental',
          car_id: id,
        },
        handler: async (response) => {
          try {
            const verifyRes = await paymentsAxios.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              meta: {
                car: id,
                pickupDate,
                returnDate,
                needsDriver,
                amount: totalAmount,
              },
            })

            if (!verifyRes.data?.success) {
              toast.error(verifyRes.data?.message || 'Payment verification failed')
              return
            }

            const bookingRes = await axios.post('/api/bookings/create', {
              car: id,
              pickupDate,
              returnDate,
              needsDriver,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              amount: totalAmount,
              paymentMode: 'online',
            })

            if (bookingRes.data?.success) {
              toast.success('Payment successful and booking created')
              navigate('/my-bookings')
            } else {
              toast.error(bookingRes.data?.message || 'Booking creation failed after payment')
            }
          } catch (err) {
            toast.error(err?.message || 'Something went wrong after payment')
          } finally {
            setIsProcessing(false)
          }
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled')
            setIsProcessing(false)
          },
        },
        theme: {
          color: '#2563eb',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      toast.error(error.message)
      setIsProcessing(false)
    }
  }

  useEffect(()=>{
    setCar(cars.find(car => car._id === id))
  },[cars, id])

  // Sync URL params to context when component mounts or URL params change
  useEffect(() => {
    if (urlPickupDate && urlPickupDate !== contextPickupDate) {
      setPickupDate(urlPickupDate)
    }
    if (urlReturnDate && urlReturnDate !== contextReturnDate) {
      setReturnDate(urlReturnDate)
    }
  }, [urlPickupDate, urlReturnDate, contextPickupDate, contextReturnDate, setPickupDate, setReturnDate])

  return car ? (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>

      <button onClick={()=> navigate(-1)} className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'>
        <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65'/>
        Back to all cars
       </button>

       <div className={`grid grid-cols-1 gap-8 lg:gap-12 ${showBookingForm ? 'lg:grid-cols-3' : ''}`}>
          {/* Left: Car Image & Details */}
          <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}

          className={showBookingForm ? 'lg:col-span-2' : ''}>
              <motion.img 
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}

              src={car.image} alt="" className='w-full h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md'/>
              <motion.div className='space-y-6'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div>
                  <h1 className='text-3xl font-bold'>{car.brand} {car.model}</h1>
                  <p className='text-gray-500 text-lg'>{car.category} • {car.year}</p>
                </div>
                <hr className='border-borderColor my-6'/>

                <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                  {[
                    {icon: assets.users_icon, text: `${car.seating_capacity} Seats`},
                    {icon: assets.fuel_icon, text: car.fuel_type},
                    {icon: assets.car_icon, text: car.transmission},
                    {icon: assets.location_icon, text: car.location},
                  ].map(({icon, text})=>(
                    <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    
                    key={text} className='flex flex-col items-center bg-light p-4 rounded-lg'>
                      <img src={icon} alt="" className='h-5 mb-2'/>
                      {text}
                    </motion.div>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <h1 className='text-xl font-medium mb-3'>Description</h1>
                  <p className='text-gray-500'>{car.description}</p>
                </div>

                {/* Features */}
                <div>
                  <h1 className='text-xl font-medium mb-3'>Features</h1>
                  <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    {
                      ["360 Camera", "Bluetooth", "GPS", "Heated Seats", "Rear View Mirror"].map((item)=>(
                        <li key={item} className='flex items-center text-gray-500'>
                          <img src={assets.check_icon} className='h-4 mr-2' alt="" />
                          {item}
                        </li>
                      ))
                    }
                  </ul>
                </div>

              </motion.div>
          </motion.div>

          {/* Right: Booking Form (renters/guests only) or Price (clients/drivers) */}
          {showBookingForm ? (
          <motion.form 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}

          onSubmit={handleSubmit} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500'>

            <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>{currency}{car.pricePerDay}<span className='text-base text-gray-400 font-normal'>per day</span></p> 

            <hr className='border-borderColor my-6'/>

            <div className='flex flex-col gap-2'>
              <label htmlFor="pickup-date">Pickup Date</label>
              <input value={pickupDate} onChange={(e)=>setPickupDate(e.target.value)}
              type="date" className='border border-borderColor px-3 py-2 rounded-lg' required id='pickup-date' min={new Date().toISOString().split('T')[0]}/>
            </div>

            <div className='flex flex-col gap-2'>
              <label htmlFor="return-date">Return Date</label>
              <input value={returnDate} onChange={(e)=>setReturnDate(e.target.value)}
              type="date" className='border border-borderColor px-3 py-2 rounded-lg' required id='return-date'/>
            </div>

            <div className='flex flex-col gap-2'>
              <label>Drive option</label>
              <div className='flex gap-4'>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input type="radio" name="driveOption" checked={driveOption === 'self'} onChange={()=>setDriveOption('self')}/>
                  Self Drive
                </label>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input type="radio" name="driveOption" checked={driveOption === 'driver'} onChange={()=>setDriveOption('driver')}/>
                  With Driver (+{currency}{DRIVER_FEE_PER_DAY}/day)
                </label>
              </div>
            </div>

            <button
              disabled={isProcessing}
              className={`w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {isProcessing ? 'Processing...' : 'Pay & Book Now'}
            </button>

            <p className='text-center text-sm'>No credit card required to reserve</p>

          </motion.form>
          ) : (
          <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className='shadow-lg h-max sticky top-18 rounded-xl p-6 text-gray-500'>
            <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>{currency}{car.pricePerDay}<span className='text-base text-gray-400 font-normal'>per day</span></p>
            {isClient && <p className='text-sm mt-2 text-gray-400'>You manage cars. Renters book through the platform.</p>}
            {isDriver && <p className='text-sm mt-2 text-gray-400'>Drivers do not rent cars.</p>}
          </motion.div>
          )}
       </div>

    </div>
  ) : <Loader />
}

export default CarDetails
