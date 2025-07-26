require('dotenv').config(); // Load environment variables
console.log('MongoDB URI:', process.env.MONGO_URI);

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const methodoverride = require('method-override');
const path = require('path');
const nodemailer = require('nodemailer'); // Import Nodemailer

// Get MongoDB URI and port from environment variables
const dbURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

// Initialize Express app
const app = express();

// Check if dbURI is undefined
if (!dbURI) {
    console.error('MongoDB URI is undefined. Check your .env file.');
    process.exit(1); // Exit the process with an error code
}

// Connect to MongoDB
mongoose.connect(dbURI)
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Exit the process with an error code
    });

// Set the path for static files
const static_path = path.join(__dirname, 'public');

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(static_path));
app.use(morgan('dev'));
app.use(methodoverride('_method'));
app.use(cookieParser());

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // or any other email service you want to use
    auth: {
        user: process.env.EMAIL,          // Your email
        pass: process.env.EMAIL_PASSWORD   // Your email password
    }
});

// Example route to send an email (you can modify it as needed)
app.post('/send-email', (req, res) => {
    const { to, subject, text } = req.body;

    const mailOptions = {
        from: process.env.EMAIL, // sender address
        to: to,                  // list of receivers
        subject: subject,        // Subject line
        text: text               // plain text body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send('Error sending email');
        }
        console.log('Email sent:', info.response);
        res.send('Email sent successfully');
    });
});

// Import and use routes
const authRoutes = require('./routes/authRoutes');
app.use(authRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
