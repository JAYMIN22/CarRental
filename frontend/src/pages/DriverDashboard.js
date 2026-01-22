import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import './Dashboard.css';

const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [city, setCity] = useState('');
  const [tripRequests, setTripRequests] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [odometerReading, setOdometerReading] = useState('');

  useEffect(() => {
    fetchMyTrips();
    
    // Socket.IO connection for real-time updates
    const socket = io('http://localhost:5000');
    
    socket.on('new-trip-request', (data) => {
      toast.info('New trip request available!');
      fetchTripRequests();
    });

    socket.on('driver-found', (data) => {
      toast.success('Trip accepted!');
      fetchMyTrips();
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (isOnline) {
      fetchTripRequests();
      const interval = setInterval(fetchTripRequests, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  const fetchTripRequests = async () => {
    try {
      const response = await axios.get('/api/driver/trip-requests');
      setTripRequests(response.data);
    } catch (error) {
      // Silent fail - no requests available
    }
  };

  const fetchMyTrips = async () => {
    try {
      const response = await axios.get('/api/driver/my-trips');
      setMyTrips(response.data);
    } catch (error) {
      toast.error('Failed to fetch trips');
    }
  };

  const handleGoOnline = async () => {
    if (!city) {
      toast.error('Please enter your city');
      return;
    }
    try {
      await axios.post('/api/driver/go-online', { city });
      setIsOnline(true);
      toast.success('You are now online');
    } catch (error) {
      toast.error('Failed to go online');
    }
  };

  const handleGoOffline = async () => {
    try {
      await axios.post('/api/driver/go-offline');
      setIsOnline(false);
      setTripRequests([]);
      toast.success('You are now offline');
    } catch (error) {
      toast.error('Failed to go offline');
    }
  };

  const handleAcceptTrip = async (bookingId) => {
    try {
      await axios.post(`/api/driver/accept-trip/${bookingId}`);
      toast.success('Trip accepted successfully!');
      fetchMyTrips();
      fetchTripRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept trip');
    }
  };

  const handleStartTrip = async (bookingId) => {
    if (!odometerReading) {
      toast.error('Please enter odometer reading');
      return;
    }
    try {
      await axios.post(`/api/driver/start-trip/${bookingId}`, {
        odometerReading: parseFloat(odometerReading)
      });
      toast.success('Trip started');
      setSelectedTrip(null);
      setOdometerReading('');
      fetchMyTrips();
    } catch (error) {
      toast.error('Failed to start trip');
    }
  };

  const handleEndTrip = async (bookingId) => {
    if (!odometerReading) {
      toast.error('Please enter odometer reading');
      return;
    }
    try {
      const response = await axios.post(`/api/driver/end-trip/${bookingId}`, {
        odometerReading: parseFloat(odometerReading)
      });
      toast.success('Trip ended. Payment summary generated.');
      setSelectedTrip(null);
      setOdometerReading('');
      fetchMyTrips();
    } catch (error) {
      toast.error('Failed to end trip');
    }
  };

  return (
    <div className="container">
      <h1>Driver Dashboard</h1>

      <div className="card">
        <h2>Driver Status</h2>
        {!isOnline ? (
          <div>
            <div className="form-group">
              <label>Enter your city</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name"
              />
            </div>
            <button onClick={handleGoOnline} className="btn btn-success">
              Go Online
            </button>
          </div>
        ) : (
          <div>
            <p className="success">Status: Online</p>
            <p>City: {city}</p>
            <button onClick={handleGoOffline} className="btn btn-danger">
              Go Offline
            </button>
          </div>
        )}
      </div>

      {isOnline && (
        <div className="card">
          <h2>Available Trip Requests</h2>
          {tripRequests.length === 0 ? (
            <p>No trip requests available at the moment</p>
          ) : (
            <div className="trip-requests">
              {tripRequests.map((request) => (
                <div key={request.bookingId} className="trip-card">
                  <h3>{request.car.make} {request.car.model}</h3>
                  <p><strong>Registration:</strong> {request.car.registrationNumber}</p>
                  <p><strong>Customer:</strong> {request.customer.name} - {request.customer.phone}</p>
                  <p><strong>Duration:</strong> {request.days} days</p>
                  <p><strong>Dates:</strong> {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</p>
                  <p><strong>Earnings:</strong> ₹{request.earnings}</p>
                  <button
                    onClick={() => handleAcceptTrip(request.bookingId)}
                    className="btn btn-success"
                  >
                    Accept Trip
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h2>My Trips</h2>
        {myTrips.length === 0 ? (
          <p>No trips yet</p>
        ) : (
          <div className="trips-list">
            {myTrips.map((trip) => (
              <div key={trip._id} className="trip-item">
                <h3>{trip.carId?.make} {trip.carId?.model}</h3>
                <p><strong>Status:</strong> {trip.status}</p>
                <p><strong>Customer:</strong> {trip.customerId?.name} - {trip.customerId?.phone}</p>
                <p><strong>Dates:</strong> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> ₹{trip.totalAmount}</p>
                {trip.status === 'Confirmed' && (
                  <button
                    onClick={() => setSelectedTrip({ id: trip._id, action: 'start' })}
                    className="btn btn-success"
                  >
                    Start Trip
                  </button>
                )}
                {trip.status === 'Started' && (
                  <button
                    onClick={() => setSelectedTrip({ id: trip._id, action: 'end' })}
                    className="btn btn-danger"
                  >
                    End Trip
                  </button>
                )}
                {trip.status === 'Completed' && (
                  <div>
                    <p><strong>Extra KMs:</strong> {trip.extraKms}</p>
                    <p><strong>Extra Charges:</strong> ₹{trip.extraKmCharges}</p>
                    <p><strong>Late Fees:</strong> ₹{trip.lateFees}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTrip && (
        <div className="card">
          <h3>{selectedTrip.action === 'start' ? 'Start Trip' : 'End Trip'}</h3>
          <div className="form-group">
            <label>Odometer Reading</label>
            <input
              type="number"
              value={odometerReading}
              onChange={(e) => setOdometerReading(e.target.value)}
              placeholder="Enter odometer reading"
            />
          </div>
          <button
            onClick={() => {
              if (selectedTrip.action === 'start') {
                handleStartTrip(selectedTrip.id);
              } else {
                handleEndTrip(selectedTrip.id);
              }
            }}
            className={`btn ${selectedTrip.action === 'start' ? 'btn-success' : 'btn-danger'}`}
          >
            {selectedTrip.action === 'start' ? 'Start' : 'End'} Trip
          </button>
          <button
            onClick={() => {
              setSelectedTrip(null);
              setOdometerReading('');
            }}
            className="btn btn-primary"
            style={{ marginLeft: '10px' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
