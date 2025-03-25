const express = require('express');
const router = express.Router();
const { Booking, Driver } = require('../models');
const { Op } = require('sequelize');

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [{
        model: Driver,
        as: 'driver',
        attributes: ['name', 'mobileNumber', 'vehicleNumber']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending bookings
router.get('/pending', async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { status: 'pending' },
      include: [{
        model: Driver,
        as: 'driver',
        attributes: ['name', 'mobileNumber', 'vehicleNumber']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Assign a driver to a booking
router.put('/:id/assign-driver', async (req, res) => {
  try {
    const { driverId } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const driver = await Driver.findByPk(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    if (driver.status !== 'available') {
      return res.status(400).json({ message: 'Driver is not available' });
    }

    await booking.update({
      driverId,
      status: 'assigned'
    });

    await driver.update({ status: 'busy' });

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update booking status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await booking.update({ status });

    if (status === 'completed' && booking.driverId) {
      await Driver.update(
        { status: 'available' },
        { where: { id: booking.driverId } }
      );
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{
        model: Driver,
        as: 'driver',
        attributes: ['name', 'mobileNumber', 'vehicleNumber']
      }]
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 