import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import BookingForm from './pages/BookingForm';
import AdminDashboard from './pages/admin/AdminDashboard';
import DriversManagement from './pages/admin/DriversManagement';
import DriverLogin from './pages/driver/DriverLogin';
import DriverDashboard from './pages/driver/DriverDashboard';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<BookingForm />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/drivers" element={<DriversManagement />} />
          <Route path="/driver/login" element={<DriverLogin />} />
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App; 