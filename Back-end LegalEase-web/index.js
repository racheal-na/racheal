const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config()

// Initialize app first
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routers
const auth = require('./routes/auth');
const cases = require('./routes/cases');
const documents = require('./routes/document');
const appointments = require('./routes/appointments');
const notifications = require('./routes/notifications');
const constitution = require('./routes/constitution');

// Import database connection
const connectDB = require('./config/database');

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', auth);
app.use('/api/cases', cases);
app.use('/api/cases/:caseId/documents', documents);
app.use('/api/appointments', appointments);
app.use('/api/notifications', notifications);
app.use('/api/constitutions',constitution);



// Production build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => 
  console.log(`Server running on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
