require('dotenv').config(); // Load .env file
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const User = require('./models/user');
const path = require('path');

// Load environment variables
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('MongoDB connection error:', err));

const app = express();
const static_path = path.join(__dirname, 'public');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(static_path));
app.use(morgan('dev'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route to add a new user
app.get('/add-user', (req, res) => {
    const user = new User({
        fullname: 'Gaurang',
        username: 'gaurang',
        email: 'gaurangsheth@bjfjfjfb',
        password: 'fjbwejfefefj',
        phone: '9327913232',
        role: 'cadet',
        gender: 'female',
        date: '2020-12-12',
    });
    user.save()
        .then((result) => res.send(result))
        .catch((err) => console.log(err));
});

// Home route
app.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});

app.get('/home', (req, res) => {
    res.render('home', { title: 'Home' });
});

// Define the login route
app.get('/login', (req, res) => {
    const err = undefined; // No error initially
    res.render('login', { title: 'Login', err });
});

// Login route
// Handle login form submission
app.post('/login', async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const role = req.body.role;

        const user = await User.findOne({ username, role }); // Assuming User model is defined and imported

        if (user) {
            const auth = await bcrypt.compare(password, user.password); // Assuming bcrypt is imported

            if (auth) {
                res.cookie('jwt', '', { maxAge: 1 }); // Clear old cookie
                const token = createToken(user._id); // Assuming createToken function is defined
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 }); // Set new cookie
                res.status(201).render(`${role}/index`, { user, err: 'You have logged in successfully.' });
            } else {
                const err = 'Invalid login details.';
                res.status(500).render('login', { err });
            }
        } else {
            const err = 'Invalid login details.';
            res.status(500).render('login', { err });
        }
    } catch (error) {
        const err = `An error occurred: ${error.message}`;
        res.status(500).render('login', { err });
    }
});

app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Signup' });
});

// Signup route
app.post('/signup', async (req, res) => {
    try {
        const { fullname, username, email, password, cpassword, phone, role, gender, birthdate } = req.body;

        if (password === cpassword) {
            const user = new User({ fullname, username, email, password, phone, role, gender, date: birthdate });
            await user.save();
            res.status(201).render('login');
        } else {
            res.send("Passwords do not match");
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

// 404 route
app.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
