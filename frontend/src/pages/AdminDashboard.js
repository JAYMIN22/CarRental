import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import './Dashboard.css';

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [decision, setDecision] = useState('Approve');
  const [reason, setReason] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchPendingUsers();
    fetchDashboardData();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users/pending');
      setPendingUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch pending users');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const params = {};
      if (dateRange.startDate && dateRange.endDate) {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      }
      const response = await axios.get('/api/admin/dashboard', { params });
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/approve`, {
        decision,
        reason: reason || null
      });
      toast.success('User profile updated');
      setSelectedUser(null);
      setDecision('Approve');
      setReason('');
      fetchPendingUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      <div className="card">
        <h2>Dashboard Analytics</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <button onClick={fetchDashboardData} className="btn btn-primary" style={{ marginTop: '25px' }}>
              Apply Filter
            </button>
          </div>
        </div>

        {dashboardData && (
          <div>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Revenue</h3>
                <p className="stat-value">₹{dashboardData.summary.totalRevenue}</p>
              </div>
              <div className="stat-card">
                <h3>Commission</h3>
                <p className="stat-value">₹{dashboardData.summary.commission}</p>
              </div>
              <div className="stat-card">
                <h3>Active Bookings</h3>
                <p className="stat-value">{dashboardData.summary.activeBookings}</p>
              </div>
              <div className="stat-card">
                <h3>Active Fleet %</h3>
                <p className="stat-value">{dashboardData.summary.activeFleetPercentage}%</p>
              </div>
            </div>

            <div style={{ marginTop: '30px' }}>
              <h3>User Statistics</h3>
              <BarChart width={600} height={300} data={[
                { name: 'Customers', value: dashboardData.summary.totalCustomers },
                { name: 'Hosts', value: dashboardData.summary.totalHosts },
                { name: 'Drivers', value: dashboardData.summary.totalDrivers }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Pending User Approvals</h2>
        {pendingUsers.length === 0 ? (
          <p>No pending approvals</p>
        ) : (
          <div className="users-list">
            {pendingUsers.map((user) => (
              <div key={user._id} className="user-item">
                <div>
                  <h3>{user.name}</h3>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Phone:</strong> {user.phone}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  {user.documents && user.documents.length > 0 && (
                    <div>
                      <strong>Documents:</strong>
                      {user.documents.map((doc, index) => (
                        <div key={index}>
                          <a href={doc.imageUrl} target="_blank" rel="noopener noreferrer">
                            {doc.type}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <button
                    onClick={() => setSelectedUser(user._id)}
                    className="btn btn-primary"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedUser && (
          <div className="card" style={{ marginTop: '20px' }}>
            <h3>Review User</h3>
            <div className="form-group">
              <label>Decision</label>
              <select value={decision} onChange={(e) => setDecision(e.target.value)}>
                <option value="Approve">Approve</option>
                <option value="Reject">Reject</option>
              </select>
            </div>
            {decision === 'Reject' && (
              <div className="form-group">
                <label>Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter rejection reason"
                />
              </div>
            )}
            <button
              onClick={() => handleApproveUser(selectedUser)}
              className={`btn ${decision === 'Approve' ? 'btn-success' : 'btn-danger'}`}
            >
              {decision === 'Approve' ? 'Approve' : 'Reject'} User
            </button>
            <button
              onClick={() => {
                setSelectedUser(null);
                setDecision('Approve');
                setReason('');
              }}
              className="btn btn-primary"
              style={{ marginLeft: '10px' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
