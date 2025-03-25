# E-Rickshaw Booking Web Application

A full-stack web application for booking E-Rickshaw rides, built with React, Node.js, Express, and MySQL.

## Features

- User booking system with real-time updates
- Driver management system
- Admin dashboard for managing bookings and drivers
- Real-time notifications using Socket.io
- SMS notifications using Twilio
- Secure authentication for drivers
- Responsive design for all devices

## Tech Stack

### Frontend
- React.js
- React Bootstrap
- Socket.io Client
- Formik & Yup for form handling
- Axios for API calls

### Backend
- Node.js
- Express.js
- MySQL with Sequelize ORM
- Socket.io for real-time updates
- Twilio for SMS notifications
- JWT for authentication

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/e-rickshaw-booking.git
cd e-rickshaw-booking
```

2. Install backend dependencies:
```bash
cd src/backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory:
```env
PORT=5002
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=e_rickshaw_booking
JWT_SECRET=your_jwt_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

5. Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5002/api
```

## Running the Application

1. Start the backend server:
```bash
cd src/backend
npm start
```

2. Start the frontend development server:
```bash
cd src/frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5002/api

## Project Structure

```
e-rickshaw-booking/
├── src/
│   ├── backend/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   └── frontend/
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── services/
│       │   └── App.js
│       └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 