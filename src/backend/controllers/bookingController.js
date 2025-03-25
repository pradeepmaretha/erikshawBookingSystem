const Booking = require('../models/Booking');
const Driver = require('../models/Driver');
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { name, mobileNumber, pickupLocation, date, time } = req.body;
    
    // Create new booking
    const booking = new Booking({
      name,
      mobileNumber,
      pickupLocation,
      date,
      time
    });
    
    await booking.save();
    
    // Emit socket event for real-time notification
    if (req.io) {
      req.io.emit('newBooking', { booking });
    }
    
    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('assignedDriver').sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single booking
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('assignedDriver');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Assign driver to booking
exports.assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;
    
    // Find driver
    const driver = await Driver.findById(driverId);
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    // Update driver availability
    driver.isAvailable = false;
    await driver.save();
    
    // Update booking
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { assignedDriver: driverId },
      { new: true, runValidators: true }
    ).populate('assignedDriver');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Send SMS notification to user
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await twilioClient.messages.create({
          body: `Your E-Rickshaw has been assigned. Driver: ${driver.name}, Contact: ${driver.mobileNumber}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: booking.mobileNumber
        });
      } catch (twilioError) {
        console.error('Error sending SMS:', twilioError);
      }
    }
    
    // Emit socket event
    if (req.io) {
      req.io.emit('driverAssigned', { booking });
    }
    
    res.status(200).json({
      success: true,
      data: booking,
      message: 'Driver assigned successfully'
    });
  } catch (error) {
    console.error('Error assigning driver:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update booking status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['Pending', 'Completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status (Pending/Completed)'
      });
    }
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // If status is changing to completed, free up the driver
    if (status === 'Completed' && booking.status !== 'Completed' && booking.assignedDriver) {
      await Driver.findByIdAndUpdate(booking.assignedDriver, { isAvailable: true });
    }
    
    // Update booking status
    booking.status = status;
    await booking.save();
    
    // Get updated booking with driver info
    const updatedBooking = await Booking.findById(req.params.id).populate('assignedDriver');
    
    // Emit socket event
    if (req.io) {
      req.io.emit('statusUpdated', { booking: updatedBooking });
    }
    
    res.status(200).json({
      success: true,
      data: updatedBooking,
      message: 'Booking status updated successfully'
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 