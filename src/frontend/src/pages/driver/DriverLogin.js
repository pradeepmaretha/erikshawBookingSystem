import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { authService } from '../../services/api';
import { toast } from 'react-toastify';

// Validation schema
const LoginSchema = Yup.object().shape({
  mobileNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
    .required('Mobile number is required'),
  password: Yup.string()
    .min(4, 'Password must be at least 4 characters')
    .required('Password is required')
});

const DriverLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Check if already logged in
  useEffect(() => {
    if (authService.isDriverLoggedIn()) {
      navigate('/driver/dashboard');
    }
  }, [navigate]);
  
  const handleSubmit = async (values, { setSubmitting }) => {
    setError(null);
    setIsLoading(true);
    
    try {
      await authService.driverLogin(values);
      toast.success('Login successful!');
      navigate('/driver/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Header as="h4" className="text-center bg-primary text-white">
              <i className="fas fa-user-tie me-2"></i>
              Driver Login
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="mb-4">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </Alert>
              )}
              
              <Formik
                initialValues={{
                  mobileNumber: '',
                  password: ''
                }}
                validationSchema={LoginSchema}
                onSubmit={handleSubmit}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  isSubmitting
                }) => (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label>Mobile Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="mobileNumber"
                        placeholder="Enter your 10-digit mobile number"
                        value={values.mobileNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.mobileNumber && errors.mobileNumber}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.mobileNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password && errors.password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 py-2 mt-3" 
                      disabled={isSubmitting || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Logging in...
                        </>
                      ) : (
                        'Login'
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
              
              <div className="text-center mt-4">
                <p className="text-muted">
                  Having trouble logging in? Please contact the administrator.
                </p>
              </div>
            </Card.Body>
          </Card>
          
          <div className="text-center mt-4">
            <Button variant="outline-secondary" onClick={() => navigate('/')}>
              <i className="fas fa-arrow-left me-2"></i>
              Back to Home
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default DriverLogin; 