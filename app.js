const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const resetpasswordRoutes = require('./routes/resetpassword');
const premiumFeatureRoutes = require('./routes/premiumFeature');
const cors = require('cors');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumFeatureRoutes);
app.use('/password', resetpasswordRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes for static HTML files
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup', 'signup.html'));
});

app.get('/ExpenseTracker/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'ExpenseTracker', 'index.html'));
});

app.get('/ForgotPassword/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'ForgotPassword', 'index.html'));
});

// Mongoose connection
mongoose.connect('mongodb+srv://new-user_31:nJ2eDpCCyyEhlkOz@cluster0.dvyo9.mongodb.net/expense?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected');
    app.listen(5000, () => {
        console.log('Server is running on port 5000');
    });
})
.catch((err) => {
    console.log('Error connecting to MongoDB:', err);
});