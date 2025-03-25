import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bookingService, driverService, authService } from '../../services/api';
import { socketService, socketEvents } from '../../services/socket';

const DriverDashboard = () => {
  const [driver, setDriver] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Check if driver is logged in
  useEffect(() => {
    const currentDriver = authService.getCurrentDriver();
    if (!currentDriver) {
      navigate('/driver/login');
      return;
    }
    
    setDriver(currentDriver);
    fetchDriverBookings(currentDriver.id);
    
    // Connect to socket for real-time updates
    socketService.connect();
    
    // Listen for driver assignment
    socketService.on(socketEvents.DRIVER_ASSIGNED, (data) => {
      if (data.booking.driverId === currentDriver.id) {
        toast.info('New booking assigned to you!');
        fetchDriverBookings(currentDriver.id);
      }
    });
    
    // Cleanup socket connection on unmount
    return () => {
      socketService.off(socketEvents.DRIVER_ASSIGNED);
      socketService.disconnect();
    };
  }, [navigate]);
  
  // Fetch driver's bookings
  const fetchDriverBookings = async (driverId) => {
    setLoading(true);
    try {
      // Get all bookings and filter for this driver
      const response = await bookingService.getAllBookings();
      const allBookings = response.data;
      
      // Filter bookings for this driver
      const driverBookings = allBookings.filter(booking => booking.driverId === driverId);
      setBookings(driverBookings);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching driver bookings:', err);
      setError('Failed to load bookings. Please try again.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  // Update booking status
  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await bookingService.updateStatus(bookingId, status);
      toast.success(`Booking marked as ${status}`);
      
      // Refresh bookings
      if (driver) {
        fetchDriverBookings(driver.id);
      }
      
      // Update driver status if needed
      if (status === 'completed') {
        await driverService.updateStatus(driver.id, 'available');
        // Update local driver state
        setDriver({ ...driver, status: 'available' });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update booking status');
    }
  };
  
  // Update driver status
  const handleUpdateDriverStatus = async (e) => {
    const newStatus = e.target.value;
    try {
      await driverService.updateStatus(driver.id, newStatus);
      setDriver({ ...driver, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating driver status:', err);
      toast.error('Failed to update status');
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    authService.driverLogout();
    toast.info('Logged out successfully');
    navigate('/driver/login');
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Filter bookings by status
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const completedBookings = bookings.filter(booking => booking.status === 'completed');
  
  if (loading) {
    return (
      <Container className="my-5 text-center">
        <h3>Loading dashboard...</h3>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="my-5 text-center">
        <h3 className="text-danger">{error}</h3>
        <Button 
          variant="primary" 
          onClick={() => driver && fetchDriverBookings(driver.id)}
          className="mt-3"
        >
          Retry
        </Button>
      </Container>
    );
  }
  
  return (
    <Container fluid className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="mb-0">Driver Dashboard</h2>
        </Col>
        <Col xs="auto">
          <Button variant="outline-danger" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt me-2"></i>
            Logout
          </Button>
        </Col>
      </Row>
      
      {/* Driver Info Card */}
      {driver && (
        <Card className="mb-4 bg-light">
          <Card.Body>
            <Row>
              <Col md={8}>
                <h4>{driver.name}</h4>
                <p className="mb-1">
                  <i className="fas fa-phone me-2"></i>
                  {driver.mobileNumber}
                </p>
                <p className="mb-1">
                  <i className="fas fa-id-card me-2"></i>
                  License: {driver.licenseNumber}
                </p>
                <p className="mb-1">
                  <i className="fas fa-car me-2"></i>
                  Vehicle: {driver.vehicleNumber}
                </p>
              </Col>
              <Col md={4} className="text-md-end">
                <div className="mb-3">
                  <span className="me-2">Status:</span>
                  <Badge bg={driver.status === 'available' ? 'success' : 
                           driver.status === 'busy' ? 'warning' : 'secondary'}>
                    {driver.status === 'available' ? 'Available' : 
                     driver.status === 'busy' ? 'Busy' : 'Offline'}
                  </Badge>
                </div>
                <Form.Select 
                  size="sm" 
                  value={driver.status} 
                  onChange={handleUpdateDriverStatus}
                  className="d-inline-block"
                  style={{ width: 'auto' }}
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
      
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="text-center h-100">
            <Card.Body>
              <i className="fas fa-hourglass-half fa-3x text-warning mb-3"></i>
              <Card.Title>Pending Bookings</Card.Title>
              <h2>{pendingBookings.length}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="text-center h-100">
            <Card.Body>
              <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
              <Card.Title>Completed Rides</Card.Title>
              <h2>{completedBookings.length}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Active Bookings */}
      <h4 className="mt-5 mb-3">
        <i className="fas fa-tasks me-2"></i>
        Active Bookings
      </h4>
      
      {pendingBookings.length === 0 ? (
        <Alert variant="info">
          No active bookings assigned to you
        </Alert>
      ) : (
        pendingBookings.map(booking => (
          <Card key={booking.id} className="mb-3">
            <Card.Body>
              <Card.Title>Booking #{booking.id}</Card.Title>
              <div className="mb-3">
                <strong>Passenger:</strong> {booking.name}
                <br />
                <strong>Mobile:</strong> {booking.mobileNumber}
              </div>
              <div className="mb-3">
                <strong>Pickup:</strong> {booking.pickupLocation}
                <br />
                <strong>Drop-off:</strong> {booking.dropoffLocation}
              </div>
              <div className="mb-3">
                <strong>Date:</strong> {formatDate(booking.pickupDate)}
                <br />
                <strong>Time:</strong> {booking.pickupTime}
              </div>
              <Button
                variant="success"
                onClick={() => handleUpdateStatus(booking.id, 'completed')}
              >
                Mark as Completed
              </Button>
            </Card.Body>
          </Card>
        ))
      )}
      
      {/* Completed Bookings */}
      <h4 className="mt-5 mb-3">
        <i className="fas fa-history me-2"></i>
        Recent Completed Bookings
      </h4>
      
      {completedBookings.length === 0 ? (
        <Alert variant="info">
          No completed bookings yet
        </Alert>
      ) : (
        completedBookings.slice(0, 5).map(booking => (
          <Card key={booking.id} className="mb-3">
            <Card.Body>
              <Card.Title>Booking #{booking.id}</Card.Title>
              <div className="mb-3">
                <strong>Passenger:</strong> {booking.name}
                <br />
                <strong>Mobile:</strong> {booking.mobileNumber}
              </div>
              <div className="mb-3">
                <strong>Pickup:</strong> {booking.pickupLocation}
                <br />
                <strong>Drop-off:</strong> {booking.dropoffLocation}
              </div>
              <div className="mb-3">
                <strong>Date:</strong> {formatDate(booking.pickupDate)}
                <br />
                <strong>Time:</strong> {booking.pickupTime}
              </div>
              <div className="text-muted">
                <strong>Completed on:</strong> {formatDate(booking.completedAt)}
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default DriverDashboard; 