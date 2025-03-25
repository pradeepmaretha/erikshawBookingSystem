import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { bookingService } from '../services/api';

// Validation schema
const BookingSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Name is required'),
  mobileNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
    .required('Mobile number is required'),
  pickupLocation: Yup.string()
    .required('Pickup location is required'),
  pickupDate: Yup.date()
    .required('Pickup date is required')
    .min(new Date(), 'Pickup date cannot be in the past'),
  pickupTime: Yup.string()
    .required('Pickup time is required')
});

const BookingForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  const handleSubmit = async (values, { resetForm }) => {
    setSubmitting(true);
    try {
      // Format date for backend (YYYY-MM-DD)
      const formattedDate = values.pickupDate.toISOString().split('T')[0];
      
      // Create booking request object
      const bookingData = {
        ...values,
        pickupDate: formattedDate
      };
      
      await bookingService.createBooking(bookingData);
      
      setBookingSuccess(true);
      resetForm();
      toast.success("Booking request submitted successfully!");
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setBookingSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast.error("Failed to submit booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Header as="h4" className="text-center bg-primary text-white">
              <i className="fas fa-rickshaw me-2"></i>
              Book an E-Rickshaw
            </Card.Header>
            <Card.Body>
              {bookingSuccess && (
                <Alert variant="success">
                  <i className="fas fa-check-circle me-2"></i>
                  Your booking request has been submitted successfully! We'll confirm your booking shortly.
                </Alert>
              )}
              
              <Formik
                initialValues={{
                  name: '',
                  mobileNumber: '',
                  pickupLocation: '',
                  pickupDate: new Date(new Date().setDate(new Date().getDate() + 1)),
                  pickupTime: '12:00'
                }}
                validationSchema={BookingSchema}
                onSubmit={handleSubmit}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  setFieldValue
                }) => (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.name && errors.name}
                        placeholder="Enter your full name"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Mobile Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="mobileNumber"
                        value={values.mobileNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.mobileNumber && errors.mobileNumber}
                        placeholder="Enter your 10-digit mobile number"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.mobileNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Pickup Location</Form.Label>
                      <Form.Control
                        type="text"
                        name="pickupLocation"
                        value={values.pickupLocation}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.pickupLocation && errors.pickupLocation}
                        placeholder="Enter your pickup location"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.pickupLocation}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Pickup Date</Form.Label>
                          <DatePicker
                            selected={values.pickupDate}
                            onChange={(date) => setFieldValue('pickupDate', date)}
                            minDate={new Date()}
                            dateFormat="yyyy-MM-dd"
                            className={`form-control ${touched.pickupDate && errors.pickupDate ? 'is-invalid' : ''}`}
                          />
                          {touched.pickupDate && errors.pickupDate && (
                            <div className="invalid-feedback d-block">
                              {errors.pickupDate}
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Pickup Time</Form.Label>
                          <Form.Control
                            type="time"
                            name="pickupTime"
                            value={values.pickupTime}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.pickupTime && errors.pickupTime}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.pickupTime}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 mt-3" 
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Submitting...
                        </>
                      ) : (
                        'Book Now'
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BookingForm; 