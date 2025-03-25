import axios from 'axios';

// Create an axios instance
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5002/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authorization header if token exists
API.interceptors.request.use(config => {
  const token = localStorage.getItem('driver_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Booking Services
export const bookingService = {
  // Create a new booking
  createBooking: (bookingData) => {
    return API.post('/bookings', bookingData);
  },
  
  // Get all bookings
  getAllBookings: () => {
    return API.get('/bookings');
  },
  
  // Get pending bookings
  getPendingBookings: () => {
    return API.get('/bookings/pending');
  },
  
  // Get booking by ID
  getBooking: (id) => {
    return API.get(`/bookings/${id}`);
  },
  
  // Assign driver to booking
  assignDriver: (bookingId, driverId) => {
    return API.put(`/bookings/${bookingId}/assign-driver`, { driverId });
  },
  
  // Update booking status
  updateStatus: (bookingId, status) => {
    return API.put(`/bookings/${bookingId}/status`, { status });
  }
};

// Driver Services
export const driverService = {
  // Login driver
  login: (credentials) => {
    return API.post('/drivers/login', credentials);
  },
  
  // Create a new driver
  createDriver: (driverData) => {
    return API.post('/drivers', driverData);
  },
  
  // Get all drivers
  getAllDrivers: () => {
    return API.get('/drivers');
  },
  
  // Get available drivers
  getAvailableDrivers: () => {
    return API.get('/drivers/available');
  },
  
  // Get a single driver
  getDriver: (id) => {
    return API.get(`/drivers/${id}`);
  },
  
  // Get driver profile (for logged in driver)
  getProfile: () => {
    return API.get('/drivers/profile');
  },
  
  // Update driver
  updateDriver: (id, driverData) => {
    return API.put(`/drivers/${id}`, driverData);
  },
  
  // Update driver status
  updateStatus: (id, status) => {
    return API.put(`/drivers/${id}/status`, { status });
  },
  
  // Set driver password (admin only)
  setPassword: (id, password) => {
    return API.put(`/drivers/${id}/set-password`, { password });
  },
  
  // Delete driver
  deleteDriver: (id) => {
    return API.delete(`/drivers/${id}`);
  }
};

// Auth Services
export const authService = {
  // Login driver
  driverLogin: async (credentials) => {
    try {
      const response = await driverService.login(credentials);
      if (response.data.token) {
        localStorage.setItem('driver_token', response.data.token);
        localStorage.setItem('driver_info', JSON.stringify(response.data.driver));
      }
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Logout driver
  driverLogout: () => {
    localStorage.removeItem('driver_token');
    localStorage.removeItem('driver_info');
  },
  
  // Get current driver
  getCurrentDriver: () => {
    const driverInfo = localStorage.getItem('driver_info');
    return driverInfo ? JSON.parse(driverInfo) : null;
  },
  
  // Check if driver is logged in
  isDriverLoggedIn: () => {
    return !!localStorage.getItem('driver_token');
  }
};

export default {
  bookingService,
  driverService,
  authService
}; 