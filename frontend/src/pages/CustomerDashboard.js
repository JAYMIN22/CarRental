import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Dashboard.css';

const CustomerDashboard = () => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    startDate: null,
    endDate: null,
    type: 'Self-Drive'
  });
  const [searchResults, setSearchResults] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showUploadDocs, setShowUploadDocs] = useState(false);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/customer/bookings');
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchParams.startDate || !searchParams.endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    try {
      const params = {
        location: searchParams.location,
        startDate: searchParams.startDate.toISOString(),
        endDate: searchParams.endDate.toISOString(),
        type: searchParams.type
      };
      const response = await axios.get('/api/customer/search', { params });
      setSearchResults(response.data.results);
      toast.success(`Found ${response.data.count} available cars`);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleBook = async (carId) => {
    try {
      const response = await axios.post('/api/customer/bookings', {
        carId,
        bookingMode: searchParams.type,
        startDate: searchParams.startDate.toISOString(),
        endDate: searchParams.endDate.toISOString(),
        paymentId: 'test_payment_' + Date.now()
      });
      toast.success(response.data.message);
      setSearchResults([]);
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    documents.forEach((doc, index) => {
      formData.append('documents', doc.file);
      formData.append('documentTypes', doc.type);
    });

    try {
      await axios.post('/api/auth/upload-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Documents uploaded successfully');
      setShowUploadDocs(false);
      setDocuments([]);
    } catch (error) {
      toast.error('Document upload failed');
    }
  };

  return (
    <div className="container">
      <h1>Customer Dashboard</h1>

      <div className="card">
        <h2>Upload KYC Documents</h2>
        <button onClick={() => setShowUploadDocs(!showUploadDocs)} className="btn btn-primary">
          {showUploadDocs ? 'Cancel' : 'Upload Documents'}
        </button>
        {showUploadDocs && (
          <form onSubmit={handleDocumentUpload} style={{ marginTop: '20px' }}>
            {documents.map((doc, index) => (
              <div key={index} className="form-group">
                <label>Document Type</label>
                <select
                  value={doc.type}
                  onChange={(e) => {
                    const newDocs = [...documents];
                    newDocs[index].type = e.target.value;
                    setDocuments(newDocs);
                  }}
                >
                  <option value="Driving License">Driving License</option>
                  <option value="RC Book">RC Book</option>
                </select>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const newDocs = [...documents];
                    newDocs[index] = { ...newDocs[index], file: e.target.files[0] };
                    setDocuments(newDocs);
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setDocuments([...documents, { type: 'Driving License', file: null }])}
              className="btn btn-primary"
            >
              Add Document
            </button>
            <button type="submit" className="btn btn-success" style={{ marginLeft: '10px' }}>
              Upload
            </button>
          </form>
        )}
      </div>

      <div className="card">
        <h2>Search Vehicles</h2>
        <form onSubmit={handleSearch}>
          <div className="form-row">
            <div className="form-group">
              <label>Location (City)</label>
              <input
                type="text"
                value={searchParams.location}
                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                placeholder="Enter city"
              />
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <DatePicker
                selected={searchParams.startDate}
                onChange={(date) => setSearchParams({ ...searchParams, startDate: date })}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <DatePicker
                selected={searchParams.endDate}
                onChange={(date) => setSearchParams({ ...searchParams, endDate: date })}
                minDate={searchParams.startDate || new Date()}
                dateFormat="yyyy-MM-dd"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                value={searchParams.type}
                onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })}
              >
                <option value="Self-Drive">Self-Drive</option>
                <option value="With Driver">With Driver</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      {searchResults.length > 0 && (
        <div className="card">
          <h2>Available Vehicles</h2>
          <div className="car-grid">
            {searchResults.map((car) => (
              <div key={car._id} className="car-card">
                {car.images && car.images[0] && (
                  <img src={car.images[0]} alt={car.make} className="car-image" />
                )}
                <h3>{car.make} {car.model}</h3>
                <p><strong>Registration:</strong> {car.registrationNumber}</p>
                <p><strong>Fuel:</strong> {car.fuelType}</p>
                <p><strong>Transmission:</strong> {car.transmission}</p>
                <p><strong>Price:</strong> ₹{car.basePrice}/day</p>
                <p><strong>Estimated Cost:</strong> ₹{car.estimatedCost} ({car.days} days)</p>
                <button
                  onClick={() => handleBook(car._id)}
                  className="btn btn-success"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2>My Bookings</h2>
        {bookings.length === 0 ? (
          <p>No bookings yet</p>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-item">
                <h3>{booking.carId?.make} {booking.carId?.model}</h3>
                <p><strong>Status:</strong> {booking.status}</p>
                <p><strong>Mode:</strong> {booking.bookingMode}</p>
                <p><strong>Dates:</strong> {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> ₹{booking.totalAmount}</p>
                {booking.keyCode && <p><strong>Key Code:</strong> {booking.keyCode}</p>}
                {booking.driverId && (
                  <p><strong>Driver:</strong> {booking.driverId.name} - {booking.driverId.phone}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
