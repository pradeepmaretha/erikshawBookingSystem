import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Tabs, Tab } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { bookingService, driverService } from '../../services/api';
import { socketService, socketEvents } from '../../services/socket';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newBookingsCount, setNewBookingsCount] = useState(0);
  
  // Fetch bookings and drivers on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch bookings
        const bookingsResponse = await bookingService.getAllBookings();
        setBookings(bookingsResponse.data);
        
        // Count new bookings (Pending with no driver)
        const newBookings = bookingsResponse.data.filter(
          booking => booking.status === 'pending' && !booking.driverId
        );
        setNewBookingsCount(newBookings.length);
        
        // Fetch drivers
        const driversResponse = await driverService.getAllDrivers();
        setDrivers(driversResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Connect to socket for real-time updates
    socketService.connect();
    
    // Listen for new bookings
    socketService.on(socketEvents.NEW_BOOKING, (data) => {
      setBookings(prevBookings => [data.booking, ...prevBookings]);
      setNewBookingsCount(prevCount => prevCount + 1);
      toast.info('New booking request received!');
    });
    
    // Listen for driver assignment
    socketService.on(socketEvents.DRIVER_ASSIGNED, (data) => {
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === data.booking.id ? data.booking : booking
        )
      );
    });
    
    // Listen for status updates
    socketService.on(socketEvents.STATUS_UPDATED, (data) => {
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === data.booking.id ? data.booking : booking
        )
      );
    });
    
    // Cleanup socket connection on unmount
    return () => {
      socketService.off(socketEvents.NEW_BOOKING);
      socketService.off(socketEvents.DRIVER_ASSIGNED);
      socketService.off(socketEvents.STATUS_UPDATED);
      socketService.disconnect();
    };
  }, []);
  
  // Assign driver to booking
  const handleAssignDriver = async (bookingId, driverId) => {
    try {
      await bookingService.assignDriver(bookingId, driverId);
      toast.success('Driver assigned successfully');
      
      // Update drivers list
      const driversResponse = await driverService.getAllDrivers();
      setDrivers(driversResponse.data);
    } catch (err) {
      console.error('Error assigning driver:', err);
      toast.error('Failed to assign driver');
    }
  };
  
  // Update booking status
  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await bookingService.updateStatus(bookingId, status);
      toast.success(`Booking marked as ${status}`);
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update booking status');
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get available drivers
  const availableDrivers = drivers.filter(driver => driver.status === 'available');
  
  // Sort bookings by created date (newest first)
  const sortedBookings = [...bookings].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  // Filter bookings by status
  const pendingBookings = sortedBookings.filter(booking => booking.status === 'pending');
  const completedBookings = sortedBookings.filter(booking => booking.status === 'completed');
  
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
          onClick={() => window.location.reload()}
          className="mt-3"
        >
          Retry
        </Button>
      </Container>
    );
  }
  
  return (
    <Container fluid>
      <Row className="my-4">
        <Col>
          <h2 className="section-heading">Admin Dashboard</h2>
        </Col>
      </Row>
      
      {/* Dashboard Stats */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <i className="fas fa-list-alt fa-3x text-primary mb-3"></i>
              <Card.Title>Total Bookings</Card.Title>
              <h2>{bookings.length}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <i className="fas fa-hourglass-half fa-3x text-warning mb-3"></i>
              <Card.Title>Pending Bookings</Card.Title>
              <h2>{pendingBookings.length}</h2>
              {newBookingsCount > 0 && (
                <Badge bg="danger" className="ms-2">
                  {newBookingsCount} new
                </Badge>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <i className="fas fa-user-tie fa-3x text-success mb-3"></i>
              <Card.Title>Available Drivers</Card.Title>
              <h2>{availableDrivers.length}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Booking Tabs */}
      <Row>
        <Col>
          <Tabs defaultActiveKey="pending" className="mb-4">
            {/* Pending Bookings Tab */}
            <Tab eventKey="pending" title={`Pending (${pendingBookings.length})`}>
              <div className="booking-list p-3">
                {pendingBookings.length === 0 ? (
                  <p className="text-center">No pending bookings</p>
                ) : (
                  pendingBookings.map(booking => (
                    <Card key={booking.id} className="booking-card booking-pending mb-3">
                      <Card.Body>
                        <Row>
                          <Col md={7}>
                            <h5>{booking.name}</h5>
                            <p className="mb-1">
                              <i className="fas fa-phone me-2"></i>
                              {booking.mobileNumber}
                            </p>
                            <p className="mb-1">
                              <i className="fas fa-map-marker-alt me-2"></i>
                              {booking.pickupLocation}
                            </p>
                            <p className="mb-1">
                              <i className="fas fa-calendar me-2"></i>
                              {formatDate(booking.pickupDate)} at {booking.pickupTime}
                            </p>
                            <Badge bg={booking.driverId ? "info" : "warning"}>
                              {booking.driverId ? "Driver Assigned" : "Awaiting Driver"}
                            </Badge>
                          </Col>
                          <Col md={5} className="border-start">
                            <h6>Actions</h6>
                            {!booking.driverId ? (
                              <Form.Group className="mb-3">
                                <Form.Label>Assign Driver</Form.Label>
                                <Form.Select 
                                  onChange={(e) => handleAssignDriver(booking.id, e.target.value)}
                                  disabled={availableDrivers.length === 0}
                                >
                                  <option value="">Select a driver</option>
                                  {availableDrivers.map(driver => (
                                    <option key={driver.id} value={driver.id}>
                                      {driver.name} - {driver.vehicleNumber}
                                    </option>
                                  ))}
                                </Form.Select>
                                {availableDrivers.length === 0 && (
                                  <small className="text-danger">No available drivers</small>
                                )}
                              </Form.Group>
                            ) : (
                              <>
                                <p className="mb-1">
                                  <strong>Driver:</strong> {booking.driver.name}
                                </p>
                                <p className="mb-1">
                                  <strong>Contact:</strong> {booking.driver.mobileNumber}
                                </p>
                                <p className="mb-1">
                                  <strong>Vehicle:</strong> {booking.driver.vehicleNumber}
                                </p>
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                >
                                  Mark as Completed
                                </Button>
                              </>
                            )}
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))
                )}
              </div>
            </Tab>
            
            {/* Completed Bookings Tab */}
            <Tab eventKey="completed" title={`Completed (${completedBookings.length})`}>
              <div className="booking-list p-3">
                {completedBookings.length === 0 ? (
                  <p className="text-center">No completed bookings</p>
                ) : (
                  completedBookings.map(booking => (
                    <Card key={booking.id} className="booking-card booking-completed mb-3">
                      <Card.Body>
                        <Row>
                          <Col md={8}>
                            <h5>{booking.name}</h5>
                            <p className="mb-1">
                              <i className="fas fa-phone me-2"></i>
                              {booking.mobileNumber}
                            </p>
                            <p className="mb-1">
                              <i className="fas fa-map-marker-alt me-2"></i>
                              {booking.pickupLocation}
                            </p>
                            <p className="mb-1">
                              <i className="fas fa-calendar me-2"></i>
                              {formatDate(booking.pickupDate)} at {booking.pickupTime}
                            </p>
                            <Badge bg="success">Completed</Badge>
                          </Col>
                          <Col md={4} className="border-start">
                            <h6>Driver Details</h6>
                            {booking.driver ? (
                              <>
                                <p className="mb-1">
                                  <strong>Driver:</strong> {booking.driver.name}
                                </p>
                                <p className="mb-1">
                                  <strong>Contact:</strong> {booking.driver.mobileNumber}
                                </p>
                                <p className="mb-1">
                                  <strong>Vehicle:</strong> {booking.driver.vehicleNumber}
                                </p>
                              </>
                            ) : (
                              <p className="text-muted">No driver assigned</p>
                            )}
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))
                )}
              </div>
            </Tab>
            
            {/* All Bookings Tab */}
            <Tab eventKey="all" title={`All (${bookings.length})`}>
              <div className="booking-list p-3">
                {bookings.length === 0 ? (
                  <p className="text-center">No bookings available</p>
                ) : (
                  sortedBookings.map(booking => (
                    <Card 
                      key={booking.id} 
                      className={`booking-card mb-3 ${
                        booking.status === 'pending' ? 'booking-pending' : 'booking-completed'
                      }`}
                    >
                      <Card.Body>
                        <Row>
                          <Col md={8}>
                            <h5>{booking.name}</h5>
                            <p className="mb-1">
                              <i className="fas fa-phone me-2"></i>
                              {booking.mobileNumber}
                            </p>
                            <p className="mb-1">
                              <i className="fas fa-map-marker-alt me-2"></i>
                              {booking.pickupLocation}
                            </p>
                            <p className="mb-1">
                              <i className="fas fa-calendar me-2"></i>
                              {formatDate(booking.pickupDate)} at {booking.pickupTime}
                            </p>
                            <Badge bg={booking.status === 'pending' ? "warning" : "success"}>
                              {booking.status}
                            </Badge>
                            {booking.status === 'pending' && booking.driverId && (
                              <Badge bg="info" className="ms-2">
                                Driver Assigned
                              </Badge>
                            )}
                          </Col>
                          <Col md={4} className="border-start">
                            <h6>Driver Details</h6>
                            {booking.driver ? (
                              <>
                                <p className="mb-1">
                                  <strong>Driver:</strong> {booking.driver.name}
                                </p>
                                <p className="mb-1">
                                  <strong>Contact:</strong> {booking.driver.mobileNumber}
                                </p>
                                <p className="mb-1">
                                  <strong>Vehicle:</strong> {booking.driver.vehicleNumber}
                                </p>
                                {booking.status === 'pending' && (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                  >
                                    Mark as Completed
                                  </Button>
                                )}
                              </>
                            ) : (
                              booking.status === 'pending' ? (
                                <Form.Group>
                                  <Form.Label>Assign Driver</Form.Label>
                                  <Form.Select 
                                    onChange={(e) => handleAssignDriver(booking.id, e.target.value)}
                                    disabled={availableDrivers.length === 0}
                                  >
                                    <option value="">Select a driver</option>
                                    {availableDrivers.map(driver => (
                                      <option key={driver.id} value={driver.id}>
                                        {driver.name} - {driver.vehicleNumber}
                                      </option>
                                    ))}
                                  </Form.Select>
                                  {availableDrivers.length === 0 && (
                                    <small className="text-danger">No available drivers</small>
                                  )}
                                </Form.Group>
                              ) : (
                                <p className="text-muted">No driver was assigned</p>
                              )
                            )}
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))
                )}
              </div>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard; 