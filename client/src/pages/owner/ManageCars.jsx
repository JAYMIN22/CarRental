import React, { useEffect, useState } from 'react'
import { assets} from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ManageCars = () => {

  const {isOwner, axios, currency} = useAppContext()

  const [cars, setCars] = useState([])
  const [editingCar, setEditingCar] = useState(null)
  const [editData, setEditData] = useState({
    brand: '',
    model: '',
    year: '',
    pricePerDay: '',
    category: '',
    transmission: '',
    fuel_type: '',
    seating_capacity: '',
    location: '',
    description: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const fetchOwnerCars = async ()=>{
    try {
      const {data} = await axios.get('/api/owner/cars')
      if(data.success){
        setCars(data.cars)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const toggleAvailability = async (carId)=>{
    try {
      const {data} = await axios.post('/api/owner/toggle-car', {carId})
      if(data.success){
        toast.success(data.message)
        fetchOwnerCars()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteCar = async (carId)=>{
    try {

      const confirm = window.confirm('Are you sure you want to delete this car?')

      if(!confirm) return null

      const {data} = await axios.post('/api/owner/delete-car', {carId})
      if(data.success){
        toast.success(data.message)
        fetchOwnerCars()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const openEditModal = (car)=>{
    setEditingCar(car)
    setEditData({
      brand: car.brand || '',
      model: car.model || '',
      year: car.year || '',
      pricePerDay: car.pricePerDay || '',
      category: car.category || '',
      transmission: car.transmission || '',
      fuel_type: car.fuel_type || '',
      seating_capacity: car.seating_capacity || '',
      location: car.location || '',
      description: car.description || '',
    })
  }

  const closeEditModal = ()=>{
    setEditingCar(null)
    setEditData({
      brand: '',
      model: '',
      year: '',
      pricePerDay: '',
      category: '',
      transmission: '',
      fuel_type: '',
      seating_capacity: '',
      location: '',
      description: '',
    })
    setIsSaving(false)
  }

  const handleUpdateCar = async (e)=>{
    e.preventDefault()
    if(!editingCar || isSaving) return
    try {
      setIsSaving(true)
      const { data } = await axios.post('/api/owner/update-car', {
        carId: editingCar._id,
        carData: editData
      })
      if(data.success){
        toast.success(data.message)
        closeEditModal()
        fetchOwnerCars()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally{
      setIsSaving(false)
    }
  }

  useEffect(()=>{
    isOwner && fetchOwnerCars()
  },[isOwner])

  return (
    <div className='px-4 pt-10 md:px-10 w-full'>
      
      <Title title="Manage Cars" subTitle="View all listed cars, update their details, or remove them from the booking platform."/>

      <div className='max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6'>

        <table className='w-full border-collapse text-left text-sm text-gray-600'>
          <thead className='text-gray-500'>
            <tr>
              <th className="p-3 font-medium">Car</th>
              <th className="p-3 font-medium max-md:hidden">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium max-md:hidden">Status</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car, index)=>(
              <tr key={index} className='border-t border-borderColor'>

                <td className='p-3 flex items-center gap-3'>
                  <img src={car.image} alt="" className="h-12 w-12 aspect-square rounded-md object-cover"/>
                  <div className='max-md:hidden'>
                    <p className='font-medium'>{car.brand} {car.model}</p>
                    <p className='text-xs text-gray-500'>{car.seating_capacity} • {car.transmission}</p>
                  </div>
                </td>

                <td className='p-3 max-md:hidden'>{car.category}</td>
                <td className='p-3'>{currency}{car.pricePerDay}/day</td>

                <td className='p-3 max-md:hidden'>
                  <span className={`px-3 py-1 rounded-full text-xs ${car.isAvaliable ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                    {car.isAvaliable ? "Available" : "Unavailable" }
                  </span>
                </td>

                <td className='flex items-center gap-3 p-3'>

                  <img
                    onClick={()=> toggleAvailability(car._id)}
                    src={car.isAvaliable ? assets.eye_close_icon : assets.eye_icon}
                    alt=""
                    className='cursor-pointer w-5 h-5 opacity-70 hover:opacity-100 transition-all'
                  />

                  <button
                    type="button"
                    onClick={()=> openEditModal(car)}
                    className="px-3 py-1 text-xs rounded-md border border-borderColor text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    Edit
                  </button>

                  <img
                    onClick={()=> deleteCar(car._id)}
                    src={assets.delete_icon}
                    alt=""
                    className='cursor-pointer w-5 h-5 opacity-70 hover:opacity-100 transition-all'
                  />
                </td>

              </tr>
            ))}
          </tbody>
        </table>

      </div>

      {editingCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-md shadow-lg w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Edit Car Details</h2>
              <button onClick={closeEditModal}>
                <img src={assets.close_icon} alt="Close" className="w-5 h-5 opacity-70 hover:opacity-100" />
              </button>
            </div>

            <form onSubmit={handleUpdateCar} className="flex flex-col gap-4 text-gray-600 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label>Brand</label>
                  <input
                    type="text"
                    className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                    value={editData.brand}
                    onChange={e => setEditData({ ...editData, brand: e.target.value })}
                  />
                </div>
                <div className="flex flex-col">
                  <label>Model</label>
                  <input
                    type="text"
                    className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                    value={editData.model}
                    onChange={e => setEditData({ ...editData, model: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label>Year</label>
                  <input
                    type="number"
                    className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                    value={editData.year}
                    onChange={e => setEditData({ ...editData, year: e.target.value })}
                  />
                </div>
                <div className="flex flex-col">
                  <label>Daily Price ({currency})</label>
                  <input
                    type="number"
                    className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                    value={editData.pricePerDay}
                    onChange={e => setEditData({ ...editData, pricePerDay: e.target.value })}
                  />
                </div>
                <div className="flex flex-col">
                  <label>Category</label>
                  <select
                    className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                    value={editData.category}
                    onChange={e => setEditData({ ...editData, category: e.target.value })}
                  >
                    <option value="">Select category</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Van">Van</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label>Transmission</label>
                  <select
                    className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                    value={editData.transmission}
                    onChange={e => setEditData({ ...editData, transmission: e.target.value })}
                  >
                    <option value="">Select transmission</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                    <option value="Semi-Automatic">Semi-Automatic</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label>Fuel Type</label>
                  <select
                    className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                    value={editData.fuel_type}
                    onChange={e => setEditData({ ...editData, fuel_type: e.target.value })}
                  >
                    <option value="">Select fuel type</option>
                    <option value="Gas">Gas</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label>Seating Capacity</label>
                  <input
                    type="number"
                    className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                    value={editData.seating_capacity}
                    onChange={e => setEditData({ ...editData, seating_capacity: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label>Location</label>
                <input
                  type="text"
                  className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                  value={editData.location}
                  onChange={e => setEditData({ ...editData, location: e.target.value })}
                />
              </div>

              <div className="flex flex-col">
                <label>Description</label>
                <textarea
                  rows={4}
                  className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
                  value={editData.description}
                  onChange={e => setEditData({ ...editData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 border border-borderColor rounded-md text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md font-medium"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default ManageCars
