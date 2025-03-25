import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container>
      <Row className="my-5">
        <Col>
          <div className="text-center mb-5">
            <h1 className="display-4">Welcome to E-Rickshaw Booking</h1>
            <p className="lead">Eco-friendly transportation service at your fingertips</p>
            <Button 
              as={Link} 
              to="/book" 
              variant="success" 
              size="lg" 
              className="mt-3"
            >
              Book Now
            </Button>
          </div>
        </Col>
      </Row>
      
      <Row className="mb-5">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <i className="fas fa-leaf fa-3x text-success mb-3"></i>
              <Card.Title>Eco-Friendly</Card.Title>
              <Card.Text>
                Our electric rickshaws produce zero emissions, helping to reduce air pollution and create a cleaner environment.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <i className="fas fa-bolt fa-3x text-warning mb-3"></i>
              <Card.Title>Fast & Reliable</Card.Title>
              <Card.Text>
                Get to your destination quickly and reliably with our fleet of well-maintained electric rickshaws.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <i className="fas fa-wallet fa-3x text-primary mb-3"></i>
              <Card.Title>Cost-Effective</Card.Title>
              <Card.Text>
                Enjoy affordable fares that won't break the bank while still getting high-quality transportation service.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="my-5">
        <Col>
          <h2 className="text-center mb-4">How It Works</h2>
          <Row>
            <Col md={3}>
              <div className="text-center">
                <div className="bg-success rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{ width: '80px', height: '80px' }}>
                  <i className="fas fa-mobile-alt fa-2x text-white"></i>
                </div>
                <h5>Book Online</h5>
                <p>Fill in your details and preferred pickup location</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <div className="bg-success rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{ width: '80px', height: '80px' }}>
                  <i className="fas fa-user-check fa-2x text-white"></i>
                </div>
                <h5>Driver Assignment</h5>
                <p>We'll assign the nearest available driver</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <div className="bg-success rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{ width: '80px', height: '80px' }}>
                  <i className="fas fa-sms fa-2x text-white"></i>
                </div>
                <h5>Get Notification</h5>
                <p>Receive driver details via SMS</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <div className="bg-success rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{ width: '80px', height: '80px' }}>
                  <i className="fas fa-shuttle-van fa-2x text-white"></i>
                </div>
                <h5>Enjoy Your Ride</h5>
                <p>Relax and enjoy your eco-friendly journey</p>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      
      <Row className="my-5">
        <Col className="text-center">
          <h2>Ready to Book?</h2>
          <p>Get started with your E-Rickshaw booking now</p>
          <Button 
            as={Link} 
            to="/book" 
            variant="success" 
            size="lg" 
            className="mt-3"
          >
            Book Now
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Home; 