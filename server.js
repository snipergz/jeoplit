require('dotenv').config();
const express = require('express');
const path = require('path');
const PORT=8080;
const static_dir = path.join(__dirname, 'static');
const mongoose = require('mongoose');
const session = require('express-session');

console.log(`Directory is ${static_dir}`);

// Connecting to the databases
let mongoDB;
(async () => {
	try{
		console.log("Connecting to MongoDB");
		mongoDB = await mongoose.connect(process.env.MONGO_URI);
		console.log(`MongoDB Connected: ${mongoDB.connection.host}`);
	} catch (error){
		console.log(error);
	}
})();

// express and middleware setup
const app = express();
app.use(express.static(static_dir));
app.use(express.urlencoded({extended: false})); 
app.set('view engine', 'ejs');
app.use(session({secret: process.env.SESSION_KEY, resave: false, saveUninitialized: false}));
app.use('/favicon.ico', express.static('images/favicon.ico'));
app.use(express.json())

// serve static files
app.use(express.static(path.join(__dirname, 'static')));

// Routes
app.use('', require('./routes/generalRoutes'));
app.use('', require('./routes/userRoutes'));
app.use('', require('./routes/setRoutes'));
app.use((req, res, next) => {
    res.render('404');})

// start up server
console.log("Javascript running on the server");
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
