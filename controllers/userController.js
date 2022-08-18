const asyncHandler = require('express-async-handler');

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
	let user = await User.login(username, password, userDB);
	if (user) {
		console.log(`${username} just logged in`);
		req.session.user = user;
		res.redirect('/home'); // and then add user object
	}
	else{ 
		const errors = [];
		// rule 1: Username cannot be blank
		// rule 2: Username cannot already be used (hint: use findByUsername to check this)
		// rule 3: Password must be at least eight characters
		if(!await User.findByUsername(username, userDB))
		  errors.push("Username does not exist");
		if(await User.findByUsername(username, userDB))
		  errors.push("Incorrect Password please try again");
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
	console.log(username, email, password);
	let [success, user, errors] = await User.signup(username, email, password, userDB);
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
	const user = User.findByUsername(req.body.emailAddress, userDB);
	if(user){
		const id = randomUUID();
		const request = {
			id,
			email: user.email
		};
	}
})

module.exports = {getLogin, postLogin, getSignup, postSignup, getLogout, postForgot};