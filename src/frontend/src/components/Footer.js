import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={6}>
            <h5>E-Rickshaw Booking</h5>
            <p>Eco-friendly transportation at your fingertips</p>
          </Col>
          <Col md={3}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-light">Home</a></li>
              <li><a href="/book" className="text-light">Book Now</a></li>
              <li><a href="/admin" className="text-light">Admin</a></li>
            </ul>
          </Col>
          <Col md={3}>
            <h5>Contact</h5>
            <ul className="list-unstyled">
              <li><i className="fas fa-phone me-2"></i> +1 123-456-7890</li>
              <li><i className="fas fa-envelope me-2"></i> info@e-rickshaw.com</li>
            </ul>
          </Col>
        </Row>
        <hr />
        <div className="text-center">
          <p className="mb-0">&copy; {new Date().getFullYear()} E-Rickshaw Booking. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer; 