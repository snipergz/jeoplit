const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid');
const validate = require('uuid-validate');

const User = require('../models/userModel');
const Reset = require('../models/resetModel');

async function findByUsername(username) {
    const user = await User.findOne({"username" : username});
    const emailNameUser = await User.findOne({"email" : username});
    try {
        if(user != null){
            return user;
        }else if(emailNameUser != null){
            return emailNameUser;
        }else{
            return null;
        }
    } catch (error) {
        console.log(error);
    }
}

async function findEmail(email){
    const user = await User.findOne({"email" : email});
    try {
        if(user != null){
            return user;
        }else{
            return null;
        }
    } catch (error) {
        console.log(error);
    }  
}

async function login(username, password) {
    const errors = [];
    if (username.length == "")
        errors.push("Username cannot be blank");

    const user = await findByUsername(username);
    if (!user)
        errors.push("Account does not exist with that username/email")
    if(user){
        const checkpw = await bcrypt.compare(password, user.password);
        if(!checkpw)
            errors.push("Password is Incorrect, please try again");
        console.log(`Errors logging in: ${errors}`);
        return [user, errors];
    }
    else
        return [null, errors];
}

async function signup(username, email, password) {
    console.log("Signing Up");
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

    console.log(`Errors Signing Up: ${errors}`);
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

async function createResetRequest(request){
    console.log("Creating reset request...");
    try {
        await Reset.create({
            id: request.id,
            email: request.email
        });
        console.log("Reset request created");
    } catch (error) {
        console.log(error);
    }
}

async function getResetRequest(id) {
    const thisRequest = await Reset.findOne({"id":id});
    try {
        if(thisRequest)
            return thisRequest;
    } catch (error) {
        console.log(error);
    }
}

function sendResetLink(email, id){
    console.log("Sending Reset Link...")
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			type: 'OAUTH2',
			user: process.env.CONTACT_EMAIL,
			pass: process.env.EMAIL_PASSWORD,
			clientId: process.env.OAUTH_CLIENTID,
			clientSecret: process.env.OAUTH_CLIENT_SECRET,
			refreshToken: process.env.OAUTH_REFRESH_TOKEN
		}
	});

	var message = {
		from: process.env.CONTACT_EMAIL,
		to: email,
		subject: 'Reset password instructions',
		text: `To reset your password, please click on this link: http://localhost:8080/reset/${id}`
	  };

	transporter.sendMail(message, (error, info) => {
	if (error) {
		return console.log(error);
	}
	console.log("Reset Link sent");
	});
};

// Login Routes
const getLogin = (req, res) => {
    if (req.session.user)
        res.redirect('/home');
    else
        res.render('login');
}

const postLogin = asyncHandler(async(req, res) =>{
    const username = req.body.username.toString().toLowerCase();
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
    const usernameValueLowerCased = username.toString().toLowerCase();
	let [success, user, errors] = await signup(usernameValueLowerCased, email, password);
	req.session.user = user
	res.render('home', {user: user});
});

// Logout Route
const getLogout = (req, res) => {
	delete req.session.user;
	res.redirect('/home');
}

// Password Reset Routes
const getForgot = (req, res) => {
    res.render('forgot');
}

const postForgot = asyncHandler(async(req, res) => {
    console.log("Reset Password Flow started");
	const user = await findEmail(req.body.email);
    try {
        const id = uuidv4();
        const request = {
            id,
            email: user.email
        };
        createResetRequest(request);
        sendResetLink(user.email, id);
    } catch (error) {
        console.log(error)
    }
	res.render('forgot', {msg: true});
})

const getReset = (req, res) => {
    if(validate(req.params['id'], 4) && getResetRequest(req.params['id'])){
        res.render(`reset`, {id: req.params['id']});
    } else {
        res.render(`home`);
    }
}

const patchPassword = asyncHandler(async(req, res) => {
    console.log("Patching Password for request: ", req.params['id']);
    const thisRequest = await getResetRequest(req.params['id']);
    if (thisRequest) {
        const user = await findEmail(thisRequest.email);
        hashed = await bcrypt.hash(req.body.password, 10);
        try {
            await User.updateOne(
                {"username": user.username},
                {"password": hashed});
            console.log("Patch Success");
        } catch (error) {
            console.log(error)
        }
        res.status(204).json();

    } else {
        res.status(404).json();
    }
});

// API Routes
const checkUsernameDuplicates = asyncHandler(async(req, res) => {
	const username = req.params['username']
	console.log(`Searching user database for: ${username}`)
	const user = await findByUsername(username);
	if(user){
		console.log(`${username} is in the db`);
		res.json({status: "Found"});
	}else{
		console.log(`${username} is not in the db`);
		res.json({status: "Not Found"});
	}
});

module.exports = {getLogin, postLogin, getSignup, postSignup, getLogout, getForgot, postForgot, getReset, patchPassword, checkUsernameDuplicates};