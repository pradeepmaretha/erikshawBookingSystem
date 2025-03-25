import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';

const Header = () => {
  return (
    <header className="app-header">
      <Navbar expand="lg" variant="dark">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <i className="fas fa-shuttle-van me-2"></i>
            E-Rickshaw Booking
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={NavLink} to="/" className="mx-2">
                Home
              </Nav.Link>
              <Nav.Link as={NavLink} to="/book" className="mx-2">
                Book Now
              </Nav.Link>
              <Nav.Link as={NavLink} to="/admin" className="mx-2">
                Admin Dashboard
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header; 