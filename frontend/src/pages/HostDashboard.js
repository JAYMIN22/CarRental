import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Dashboard.css';

const HostDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAvailability, setShowAvailability] = useState(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    registrationNumber: '',
    fuelType: 'Petrol',
    transmission: 'Manual',
    basePrice: '',
    latitude: '',
    longitude: '',
    city: '',
    allowDriver: false
  });
  const [images, setImages] = useState([]);
  const [availabilityData, setAvailabilityData] = useState({
    startDate: null,
    endDate: null,
    reason: 'Unavailable'
  });

  useEffect(() => {
    fetchVehicles();
    fetchBookings();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('/api/host/vehicles');
      setVehicles(response.data);
    } catch (error) {
      toast.error('Failed to fetch vehicles');
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/host/bookings');
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'allowDriver') {
        formDataToSend.append(key, formData[key]);
      }
    });
    formDataToSend.append('allowDriver', formData.allowDriver);
    images.forEach(image => {
      formDataToSend.append('images', image);
    });

    try {
      await axios.post('/api/host/vehicles', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Vehicle added successfully');
      setShowAddVehicle(false);
      setFormData({
        make: '',
        model: '',
        registrationNumber: '',
        fuelType: 'Petrol',
        transmission: 'Manual',
        basePrice: '',
        latitude: '',
        longitude: '',
        city: '',
        allowDriver: false
      });
      setImages([]);
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add vehicle');
    }
  };

  const handleBlockDates = async (carId) => {
    if (!availabilityData.startDate || !availabilityData.endDate) {
      toast.error('Please select dates');
      return;
    }

    try {
      await axios.post(`/api/host/vehicles/${carId}/availability`, {
        startDate: availabilityData.startDate.toISOString(),
        endDate: availabilityData.endDate.toISOString(),
        reason: availabilityData.reason
      });
      toast.success('Calendar updated successfully');
      setShowAvailability(null);
      setAvailabilityData({
        startDate: null,
        endDate: null,
        reason: 'Unavailable'
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    }
  };

  return (
    <div className="container">
      <h1>Host Dashboard</h1>

      <div className="card">
        <h2>My Vehicles</h2>
        <button onClick={() => setShowAddVehicle(!showAddVehicle)} className="btn btn-primary">
          {showAddVehicle ? 'Cancel' : 'Add New Vehicle'}
        </button>

        {showAddVehicle && (
          <form onSubmit={handleAddVehicle} style={{ marginTop: '20px' }}>
            <div className="form-row">
              <div className="form-group">
                <label>Make</label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Registration Number</label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Base Price (per day)</label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Fuel Type</label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div className="form-group">
                <label>Transmission</label>
                <select
                  value={formData.transmission}
                  onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                >
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.allowDriver}
                  onChange={(e) => setFormData({ ...formData, allowDriver: e.target.checked })}
                />
                Allow Driver Service
              </label>
            </div>
            <div className="form-group">
              <label>Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImages(Array.from(e.target.files))}
                required
              />
            </div>
            <button type="submit" className="btn btn-success">Add Vehicle</button>
          </form>
        )}

        <div className="vehicles-list" style={{ marginTop: '20px' }}>
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="vehicle-item">
              {vehicle.images && vehicle.images[0] && (
                <img src={vehicle.images[0]} alt={vehicle.make} className="vehicle-image" />
              )}
              <div>
                <h3>{vehicle.make} {vehicle.model}</h3>
                <p><strong>Registration:</strong> {vehicle.registrationNumber}</p>
                <p><strong>Price:</strong> ₹{vehicle.basePrice}/day</p>
                <p><strong>Status:</strong> {vehicle.status}</p>
                <button
                  onClick={() => setShowAvailability(vehicle._id)}
                  className="btn btn-primary"
                >
                  Manage Availability
                </button>
              </div>
            </div>
          ))}
        </div>

        {showAvailability && (
          <div className="card" style={{ marginTop: '20px' }}>
            <h3>Block Dates</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <DatePicker
                  selected={availabilityData.startDate}
                  onChange={(date) => setAvailabilityData({ ...availabilityData, startDate: date })}
                  minDate={new Date()}
                  dateFormat="yyyy-MM-dd"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <DatePicker
                  selected={availabilityData.endDate}
                  onChange={(date) => setAvailabilityData({ ...availabilityData, endDate: date })}
                  minDate={availabilityData.startDate || new Date()}
                  dateFormat="yyyy-MM-dd"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <select
                  value={availabilityData.reason}
                  onChange={(e) => setAvailabilityData({ ...availabilityData, reason: e.target.value })}
                >
                  <option value="Unavailable">Unavailable</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => handleBlockDates(showAvailability)}
              className="btn btn-success"
            >
              Block Dates
            </button>
            <button
              onClick={() => setShowAvailability(null)}
              className="btn btn-danger"
              style={{ marginLeft: '10px' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Bookings</h2>
        {bookings.length === 0 ? (
          <p>No bookings yet</p>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-item">
                <h3>{booking.carId?.make} {booking.carId?.model}</h3>
                <p><strong>Customer:</strong> {booking.customerId?.name} - {booking.customerId?.phone}</p>
                <p><strong>Status:</strong> {booking.status}</p>
                <p><strong>Dates:</strong> {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                <p><strong>Amount:</strong> ₹{booking.totalAmount}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostDashboard;
