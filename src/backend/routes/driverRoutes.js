const express = require('express');
const router = express.Router();
const { Driver, Booking } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login driver
router.post('/login', async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    // Validate input
    if (!mobileNumber || !password) {
      return res.status(400).json({ message: 'Please provide mobile number and password' });
    }

    // Find driver by mobile number
    const driver = await Driver.findOne({ 
      where: { mobileNumber },
      attributes: ['id', 'name', 'mobileNumber', 'licenseNumber', 'vehicleNumber', 'status', 'password']
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Check if driver has a password set
    if (!driver.password) {
      return res.status(401).json({ message: 'Password not set. Please contact admin.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: driver.id },
      process.env.JWT_SECRET || 'rickshaw-booking-secret',
      { expiresIn: '1d' }
    );

    // Return driver info and token
    res.json({
      driver: {
        id: driver.id,
        name: driver.name,
        mobileNumber: driver.mobileNumber,
        licenseNumber: driver.licenseNumber,
        vehicleNumber: driver.vehicleNumber,
        status: driver.status
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set password for driver (used by admin)
router.put('/:id/set-password', async (req, res) => {
  try {
    const { password } = req.body;
    const driver = await Driver.findByPk(req.params.id);
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update driver with hashed password
    await driver.update({ password: hashedPassword });
    
    res.json({ message: 'Password set successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all drivers
router.get('/', async (req, res) => {
  try {
    const drivers = await Driver.findAll({
      include: [{
        model: Booking,
        as: 'bookings',
        attributes: ['id', 'status', 'pickupDate', 'pickupTime']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available drivers
router.get('/available', async (req, res) => {
  try {
    const drivers = await Driver.findAll({
      where: { status: 'available' },
      order: [['createdAt', 'DESC']]
    });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new driver
router.post('/', async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update driver status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const driver = await Driver.findByPk(req.params.id);
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    await driver.update({ status });
    res.json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get driver by ID
router.get('/:id', async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id, {
      include: [{
        model: Booking,
        as: 'bookings',
        attributes: ['id', 'status', 'pickupDate', 'pickupTime']
      }]
    });
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update driver details
router.put('/:id', async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    await driver.update(req.body);
    res.json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete driver
router.delete('/:id', async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    await driver.destroy();
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 