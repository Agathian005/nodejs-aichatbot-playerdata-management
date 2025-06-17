const mongoose = require('mongoose');
const connectDB = require('./config/dbconn');
const express = require('express');
const verifytoken = require('./middlwareformyapi/verifyplayerjwt');
const app = express();
const PORT = process.env.PORT || 1000;

require('dotenv').config();
console.log('DB URI:', process.env.DATABASE_URI);

connectDB();

app.use(express.json());

// Public routes (no authentication needed)
app.use('/playerreg', require('./routesformyapi/playerreg'));
app.use('/playerauth', require('./routesformyapi/playerauth'));

// Protected routes (require authentication)
app.use('/clubplayers', verifytoken, require('./clubplayersapi/clubplayers'));

mongoose.connection.once('open', () => {
    console.log('connected to mongoDB');
    app.listen(PORT, () => console.log('Server is running on ' + PORT));
});