// Script to create admin user
// Run this once: node -e "require('./middleware/createAdmin.js')"

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carrental');
    
    const adminExists = await User.findOne({ email: 'admin@carrental.com' });
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@carrental.com',
      password: 'admin123',
      phone: '1234567890',
      role: 'Admin',
      isVerified: true,
      profileStatus: 'Approved'
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@carrental.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  createAdmin();
}

module.exports = createAdmin;
