const Driver = require('../models/Driver');

// Create a new driver
exports.createDriver = async (req, res) => {
  try {
    const { name, mobileNumber, licenseNumber, vehicleNumber } = req.body;
    
    // Check if driver with same license already exists
    const existingDriver = await Driver.findOne({ licenseNumber });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'Driver with this license number already exists'
      });
    }
    
    // Create new driver
    const driver = new Driver({
      name,
      mobileNumber,
      licenseNumber,
      vehicleNumber
    });
    
    await driver.save();
    
    res.status(201).json({
      success: true,
      data: driver,
      message: 'Driver created successfully'
    });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get available drivers
exports.getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ isAvailable: true }).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    console.error('Error fetching available drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single driver
exports.getDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update driver
exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: driver,
      message: 'Driver updated successfully'
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete driver
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    await driver.remove();
    
    res.status(200).json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 