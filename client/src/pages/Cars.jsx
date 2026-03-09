import React, { useEffect, useState, useCallback } from 'react'
import Title from '../components/Title'
import { assets, dummyCarData } from '../assets/assets'
import CarCard from '../components/CarCard'
import { useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const Cars = () => {

  // getting search params from url
  const [searchParams] = useSearchParams()
  const pickupLocation = searchParams.get('pickupLocation')
  const pickupDate = searchParams.get('pickupDate')
  const returnDate = searchParams.get('returnDate')
  const searchQuery = searchParams.get('q') || ''

  const {cars, axios, setPickupDate, setReturnDate} = useAppContext()

  const [input, setInput] = useState(searchQuery)

  const isSearchData = pickupLocation && pickupDate && returnDate
  const [baseCars, setBaseCars] = useState([])
  const [filteredCars, setFilteredCars] = useState([])

  const [userLocation, setUserLocation] = useState(null) // {lat, lng}
  const [radiusKm, setRadiusKm] = useState(5)
  const [useRadiusFilter, setUseRadiusFilter] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
    const toRad = deg => (deg * Math.PI) / 180
    const R = 6371 // km
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Sync URL params with context so CarDetails page can use them
  useEffect(() => {
    if (pickupDate) {
      setPickupDate(pickupDate)
    }
    if (returnDate) {
      setReturnDate(returnDate)
    }
  }, [pickupDate, returnDate, setPickupDate, setReturnDate])

  const recomputeFilters = useCallback(() => {
    if (!baseCars || baseCars.length === 0) {
      setFilteredCars([])
      return
    }

    let result = baseCars

    const q = input.trim().toLowerCase()
    if (q) {
      result = result.filter((car)=>{
        return car.brand.toLowerCase().includes(q)
        || car.model.toLowerCase().includes(q)
        || car.category.toLowerCase().includes(q)
        || car.transmission.toLowerCase().includes(q)
      })
    }

    if (useRadiusFilter && userLocation) {
      result = result.filter((car)=>{
        if (
          car.latitude == null ||
          car.longitude == null ||
          car.latitude === '' ||
          car.longitude === ''
        ) {
          return false
        }
        const lat = Number(car.latitude)
        const lng = Number(car.longitude)
        if (Number.isNaN(lat) || Number.isNaN(lng)) return false
        const d = haversineDistanceKm(userLocation.lat, userLocation.lng, lat, lng)
        return d <= radiusKm
      })
    }

    setFilteredCars(result)
  }, [baseCars, input, useRadiusFilter, userLocation, radiusKm])

  const searchCarAvailablity = async () =>{
    const {data} = await axios.post('/api/bookings/check-availability', {location: pickupLocation, pickupDate, returnDate})
    if (data.success) {
      setBaseCars(data.availableCars || [])
      if(data.availableCars.length === 0){
        toast('No cars available')
      }
      return null
    }
  }

  useEffect(()=>{
    if (isSearchData) {
      searchCarAvailablity()
    }
  },[isSearchData, pickupLocation, pickupDate, returnDate])

  useEffect(()=>{
    // keep input in sync with URL query when navigating from navbar
    if (searchQuery && searchQuery !== input) {
      setInput(searchQuery)
      return
    }
  }, [searchQuery])

  useEffect(()=>{
    if (!isSearchData && cars.length > 0) {
      setBaseCars(cars)
    }
  },[cars, isSearchData])

  useEffect(()=>{
    recomputeFilters()
  },[recomputeFilters])

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Your browser does not support location')
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
        setUseRadiusFilter(true)
        setIsLocating(false)
      },
      () => {
        toast.error('Unable to get your location')
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div>

      <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}

      className='flex flex-col items-center py-20 bg-light max-md:px-4'>
        <Title title='Available Cars' subTitle='Browse our selection of premium vehicles available for your next adventure'/>

        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}

        className='flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow'>
          <img src={assets.search_icon} alt="" className='w-4.5 h-4.5 mr-2'/>

          <input onChange={(e)=> setInput(e.target.value)} value={input} type="text" placeholder='Search by make, model, or features' className='w-full h-full outline-none text-gray-500'/>

          <img src={assets.filter_icon} alt="" className='w-4.5 h-4.5 ml-2'/>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}

      className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'>
        <div className='xl:px-20 max-w-7xl mx-auto flex flex-col gap-3 mb-4'>
          <p className='text-gray-500'>Showing {filteredCars.length} Cars</p>
          <div className='flex flex-col md:flex-row items-start md:items-center gap-3 text-sm text-gray-600'>
            <button
              type="button"
              onClick={handleUseMyLocation}
              className='px-3 py-1.5 rounded-full border border-borderColor bg-white hover:bg-gray-50 cursor-pointer'
            >
              {isLocating ? 'Detecting location…' : 'Use my current location'}
            </button>
            <div className='flex items-center gap-2 flex-wrap'>
              <label className='text-xs uppercase tracking-wide text-gray-400'>
                Radius
              </label>
              <select
                className='px-2 py-1 border border-borderColor rounded-md text-sm'
                value={radiusKm}
                onChange={e => setRadiusKm(Number(e.target.value))}
              >
                <option value={3}>3 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
              </select>
              <label className='flex items-center gap-1 text-xs'>
                <input
                  type="checkbox"
                  className='cursor-pointer'
                  checked={useRadiusFilter}
                  onChange={e => setUseRadiusFilter(e.target.checked)}
                />
                <span>Show only cars within radius</span>
              </label>
            </div>
            {useRadiusFilter && !userLocation && (
              <p className='text-xs text-red-400'>
                Turn on “Use my current location” or provide coordinates for cars to enable nearby filter.
              </p>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>
          {filteredCars.map((car, index)=> (
            <motion.div key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <CarCard
                car={car}
                searchParams={{pickupLocation, pickupDate, returnDate}}
                distanceKm={
                  userLocation &&
                  car.latitude != null &&
                  car.longitude != null &&
                  car.latitude !== '' &&
                  car.longitude !== ''
                    ? haversineDistanceKm(
                        userLocation.lat,
                        userLocation.lng,
                        Number(car.latitude),
                        Number(car.longitude)
                      )
                    : undefined
                }
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}

export default Cars
