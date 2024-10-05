require("dotenv").config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize Express
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected to MongoDB!');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Define User schema and model
const User = require('./models/User');

// Routes
app.get('/', (req, res) => {
  const success = req.query.success === 'true'; // Check if success parameter is present
  const error = req.query.error; // Get error parameter if present

  res.render('index', { success, error }); // Pass them to the EJS template
});

app.post('/submit-email', (req, res) => {
  const email = req.body.email;

  // Check if email is provided
  if (!email) {
    return res.status(400).send('Email is required.');
  }

  // Create new user and save email to MongoDB
  const newUser = new User({ email });
  newUser.save()
    .then(() => {
      console.log('Email saved:', email);
      // Redirect to the homepage with a success query parameter
      res.redirect('/?success=true');
    })
    .catch((err) => {
      if (err.code === 11000) {
        // Duplicate email error
        console.error('Duplicate email:', email);
        res.redirect('/?error=duplicate');
      } else {
        console.error('Error saving email:', err);
        res.status(500).send('Internal Server Error');
      }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
