import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { driverService } from '../../services/api';

// Validation schema for driver form
const DriverSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Name is required'),
  mobileNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
    .required('Mobile number is required'),
  licenseNumber: Yup.string()
    .required('License number is required'),
  vehicleNumber: Yup.string()
    .required('Vehicle number is required')
});

// Validation schema for password form
const PasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(4, 'Password must be at least 4 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required')
});

const DriversManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [driverForPassword, setDriverForPassword] = useState(null);
  
  // Fetch all drivers on component mount
  useEffect(() => {
    fetchDrivers();
  }, []);
  
  // Function to fetch all drivers
  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await driverService.getAllDrivers();
      setDrivers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError('Failed to load drivers. Please try again.');
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };
  
  // Open modal for adding new driver
  const handleAddNew = () => {
    setEditingDriver(null);
    setShowModal(true);
  };
  
  // Open modal for editing driver
  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setShowModal(true);
  };
  
  // Open delete confirmation modal
  const handleDeleteClick = (driver) => {
    setDriverToDelete(driver);
    setShowDeleteModal(true);
  };
  
  // Open password modal
  const handleSetPassword = (driver) => {
    setDriverForPassword(driver);
    setShowPasswordModal(true);
  };
  
  // Handle driver form submission (add/edit)
  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      if (editingDriver) {
        // Update existing driver
        await driverService.updateDriver(editingDriver.id, values);
        toast.success('Driver updated successfully');
      } else {
        // Add new driver
        await driverService.createDriver(values);
        toast.success('Driver added successfully');
      }
      
      // Refresh drivers list
      fetchDrivers();
      
      // Close modal and reset form
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving driver:', err);
      toast.error(err.response?.data?.message || 'Failed to save driver');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle password submission
  const handlePasswordSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      await driverService.setPassword(driverForPassword.id, values.password);
      toast.success('Password set successfully');
      
      // Close modal and reset form
      setShowPasswordModal(false);
      resetForm();
    } catch (err) {
      console.error('Error setting password:', err);
      toast.error('Failed to set password');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle driver deletion
  const handleDeleteConfirm = async () => {
    try {
      await driverService.deleteDriver(driverToDelete.id);
      toast.success('Driver deleted successfully');
      
      // Refresh drivers list
      fetchDrivers();
      
      // Close modal
      setShowDeleteModal(false);
      setDriverToDelete(null);
    } catch (err) {
      console.error('Error deleting driver:', err);
      toast.error('Failed to delete driver');
    }
  };
  
  // Format driver status for display
  const formatStatus = (status) => {
    if (status === 'available') return 'Available';
    if (status === 'busy') return 'Busy';
    return status;
  };
  
  return (
    <Container fluid>
      <Row className="my-4">
        <Col>
          <h2 className="section-heading">Drivers Management</h2>
        </Col>
        <Col xs="auto">
          <Button variant="success" onClick={handleAddNew}>
            <i className="fas fa-plus me-2"></i>Add New Driver
          </Button>
        </Col>
      </Row>
      
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading drivers...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <i className="fas fa-exclamation-triangle text-danger fa-3x mb-3"></i>
              <p className="text-danger">{error}</p>
              <Button variant="primary" onClick={fetchDrivers}>
                Retry
              </Button>
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-user-tie fa-3x text-muted mb-3"></i>
              <p className="text-muted">No drivers found</p>
              <Button variant="primary" onClick={handleAddNew}>
                Add New Driver
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Mobile Number</th>
                    <th>License Number</th>
                    <th>Vehicle Number</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver, index) => (
                    <tr key={driver.id}>
                      <td>{index + 1}</td>
                      <td>{driver.name}</td>
                      <td>{driver.mobileNumber}</td>
                      <td>{driver.licenseNumber}</td>
                      <td>{driver.vehicleNumber}</td>
                      <td>
                        <span 
                          className={`badge bg-${driver.status === 'available' ? 'success' : 'warning'}`}
                        >
                          {formatStatus(driver.status)}
                        </span>
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleEdit(driver)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleSetPassword(driver)}
                        >
                          <i className="fas fa-key"></i>
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteClick(driver)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Driver Form Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingDriver ? 'Edit Driver' : 'Add New Driver'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={editingDriver ? {
              name: editingDriver.name,
              mobileNumber: editingDriver.mobileNumber,
              licenseNumber: editingDriver.licenseNumber,
              vehicleNumber: editingDriver.vehicleNumber
            } : {
              name: '',
              mobileNumber: '',
              licenseNumber: '',
              vehicleNumber: ''
            }}
            validationSchema={DriverSchema}
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
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.name && errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="mobileNumber"
                    value={values.mobileNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.mobileNumber && errors.mobileNumber}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.mobileNumber}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>License Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="licenseNumber"
                    value={values.licenseNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.licenseNumber && errors.licenseNumber}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.licenseNumber}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Vehicle Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="vehicleNumber"
                    value={values.vehicleNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.vehicleNumber && errors.vehicleNumber}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.vehicleNumber}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Driver'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
      
      {/* Set Password Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Set Password for {driverForPassword?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{
              password: '',
              confirmPassword: ''
            }}
            validationSchema={PasswordSchema}
            onSubmit={handlePasswordSubmit}
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
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter new password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.password && errors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.confirmPassword && errors.confirmPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <p className="text-muted small">
                  This password will be used by the driver to log in to their account.
                </p>
                
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Set Password'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {driverToDelete && (
            <p>
              Are you sure you want to delete driver <strong>{driverToDelete.name}</strong>?
              This action cannot be undone.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DriversManagement; 