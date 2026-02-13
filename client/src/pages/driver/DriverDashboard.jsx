import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { assets } from '../../assets/assets'

const DriverDashboard = () => {
  const { user, axios, currency, roles, setActiveRole } = useAppContext()

  // Keep active role as driver when viewing driver dashboard
  React.useEffect(() => {
    const hasDriver = Array.isArray(roles) && (roles.includes('driver') || roles.includes('user'))
    if (hasDriver) setActiveRole('driver')
  }, [roles, setActiveRole])
  const [availableJobs, setAvailableJobs] = useState([])
  const [myBookings, setMyBookings] = useState([])

  const fetchAvailableJobs = async () => {
    try {
      const { data } = await axios.get('/api/driver/available-jobs')
      if (data.success) setAvailableJobs(data.jobs)
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const fetchMyBookings = async () => {
    try {
      const { data } = await axios.get('/api/driver/my-bookings')
      if (data.success) setMyBookings(data.bookings)
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const acceptJob = async (bookingId) => {
    try {
      const { data } = await axios.post('/api/driver/accept-booking', { bookingId })
      if (data.success) {
        toast.success(data.message)
        fetchAvailableJobs()
        fetchMyBookings()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const cancelJob = async (bookingId) => {
    try {
      const { data } = await axios.post('/api/driver/cancel-job', { bookingId })
      if (data.success) {
        toast.success(data.message)
        fetchAvailableJobs()
        fetchMyBookings()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchAvailableJobs()
    fetchMyBookings()
  }, [])

  return (
    <div className="min-h-screen bg-light">
      <div className="flex items-center justify-between px-6 md:px-10 py-4 text-gray-500 border-b border-borderColor bg-white">
        <Link to="/">
          <img src={assets.logo} alt="" className="h-7" />
        </Link>
        <Link to="/profile" className="text-sm hover:text-primary transition-all">
          {user?.name ? `My Profile (${user.name})` : 'My Profile'}
        </Link>
      </div>

    <div className="px-4 pt-10 md:px-10 pb-12">
      <h1 className="text-2xl font-semibold mb-2">Driver Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome {user?.name || 'Driver'}. Accept jobs and manage your assigned bookings.</p>

      {/* Available Jobs */}
      <div className="mb-12">
        <h2 className="text-lg font-medium mb-4">Available Jobs</h2>
        <p className="text-gray-500 text-sm mb-4">Bookings that need a driver. Click Accept to assign yourself.</p>
        {availableJobs.length === 0 ? (
          <div className="border border-borderColor rounded-md p-6 text-gray-500 text-center">
            No available jobs at the moment.
          </div>
        ) : (
          <div className="grid gap-4">
            {availableJobs.map((job) => (
              <div key={job._id} className="border border-borderColor rounded-md p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex gap-4">
                  <img src={job.car?.image} alt="" className="h-20 w-28 object-cover rounded-md" />
                  <div>
                    <p className="font-medium">{job.car?.brand} {job.car?.model}</p>
                    <p className="text-sm text-gray-500">{job.car?.location} • {job.pickupDate?.split('T')[0]} to {job.returnDate?.split('T')[0]}</p>
                    <p className="text-sm text-gray-500">Renter: {job.user?.name}</p>
                    <p className="text-sm text-primary font-medium">{currency}{job.price} total</p>
                  </div>
                </div>
                <button
                  onClick={() => acceptJob(job._id)}
                  className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dull transition-all self-start"
                >
                  Accept Job
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Assigned Bookings */}
      <div>
        <h2 className="text-lg font-medium mb-4">My Assigned Bookings</h2>
        {myBookings.length === 0 ? (
          <div className="border border-borderColor rounded-md p-6 text-gray-500 text-center">
            No bookings assigned to you yet.
          </div>
        ) : (
          <div className="max-w-3xl w-full rounded-md overflow-hidden border border-borderColor">
            <table className="w-full border-collapse text-left text-sm text-gray-600">
              <thead className="text-gray-500 bg-light">
                <tr>
                  <th className="p-3 font-medium">Car</th>
                  <th className="p-3 font-medium max-md:hidden">Renter</th>
                  <th className="p-3 font-medium max-md:hidden">Dates</th>
                  <th className="p-3 font-medium">Total</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {myBookings.map((booking) => (
                  <tr key={booking._id} className="border-t border-borderColor">
                    <td className="p-3 flex items-center gap-2">
                      <img src={booking.car?.image} alt="" className="h-10 w-14 object-cover rounded" />
                      <span className="font-medium">{booking.car?.brand} {booking.car?.model}</span>
                    </td>
                    <td className="p-3 max-md:hidden">{booking.user?.name}</td>
                    <td className="p-3 max-md:hidden">
                      {booking.pickupDate?.split('T')[0]} to {booking.returnDate?.split('T')[0]}
                    </td>
                    <td className="p-3">{currency}{booking.price}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${booking.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => cancelJob(booking._id)}
                          className="px-3 py-1 text-xs border border-borderColor rounded-md hover:bg-gray-50"
                        >
                          Cancel job
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}

export default DriverDashboard
