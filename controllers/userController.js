const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs')

const User = require('../models/userModel');

async function findByUsername(username) {
    const user = await User.find({"username" : username});
    try {
        if(user[0].username != null)
            return user;
    } catch (error) {
        const emailNameUser = await User.find({"email" : username});
        if(emailNameUser[0].username != null){
            return emailNameUser;
        }
        else
            return null;
    }
}

async function login(username, password) {
    const errors = [];
    if (username.length == "")
        errors.push("Username cannot be blank");

    const user = await findByUsername(username);
    console.log(user);
    if (!user)
        errors.push("Account does not exist with that username/email")
    if(user){
        const checkpw = await bcrypt.compare(password, user[0].password);
        if(!checkpw)
            errors.push("Password is Incorrect, please try again");
        return [user, errors];
    }
    else
        return [null, errors];
}

async function signup(username, email, password) {
    let testCap = /[A-Z]/;
    let testLower = /[a-z]/;
    let testDigit = /[0-9]/;
    
    const errors = [];
    if (username.length == "")
        errors.push("Username cannot be blank");
    if (await findByUsername(username)){
        errors.push("Username already exists");
    }
    if (password.length < 8)
        errors.push("Password must have at least 8 characters");
    if (!testCap.test(password))
        errors.push("Password must have a capital letter");
    if (!testLower.test(password))
        errors.push("Password must have a lowercase letter");
    if (!testDigit.test(password))
        errors.push("Password must have a digit");

    console.log(errors);
    // If any errors, return false/errors etc
    if (errors.length != 0)
        return [false, null, errors];

    const pwhash = await bcrypt.hash(password, 10);

    const user = await User.create({
        username: username,
        email: email,
        password: pwhash
    });

    return [true, user, errors];
}

// Login Routes
const getLogin = (req, res) => {
    if (req.session.user)
        res.redirect('/home');
    else
        res.render('login');
}

const postLogin = asyncHandler(async(req, res) =>{
    const username = req.body.username;
	const password = req.body.password;
	let [user, errors] = await login(username, password);
	if (user) {
		req.session.user = user;
		res.redirect('/home'); // and then add user object
	}
	else{
		res.render('login', {errors: errors});
	}
});

// Sign Up Routes
const getSignup = (req, res) => {
    if (req.session.user)
        res.redirect('/home');
    else
        res.render('signup');
}

const postSignup = asyncHandler(async(req, res) => {
	const username = req.body.username;
	const email = req.body.email;
	const password = req.body.password;
	let [success, user, errors] = await signup(username, email, password);
	req.session.user = user
	res.render('home', {user: user});
});

// Logout Route
const getLogout = (req, res) => {
	delete req.session.user;
	res.redirect('/home');
}

// Password Reset Routes
const postForgot = asyncHandler(async(req, res) => {
	const user = findByUsername(req.body.emailAddress);
	if(user){
		const id = randomUUID();
		const request = {
			id,
			email: user.email
		};
	}
})

// API Routes
const checkUsernameDuplicates = asyncHandler(async(req, res) => {
	const username = req.params['username']
	console.log(`Searching user database for: ${username}`)
	let [user, errors] = await findByUsername(username);
	if(user != null){
		console.log(`${username} is in the db`);
		res.json({status: "Found"});
	}else{
		console.log(`${username} is not in the db`);
		res.json({status: "Not Found"});
	}
});

module.exports = {getLogin, postLogin, getSignup, postSignup, getLogout, postForgot, checkUsernameDuplicates};