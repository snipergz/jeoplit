const nodemailer = require('nodemailer');

// Home Page Routes
const getHome = (req, res) => {
	if(req.session.user)
		res.render('home', {user: req.session.user});
	else 
		res.render('home');
};

const postHome = (req, res) => {
	delete req.session.set;
	delete req.session.size;
	res.redirect('/home');
};

// Contact Page Routes
const getContact = (req, res) => {
	if (req.session.user)
		res.render('contact', {user: req.session.user});
	else 
		res.render('contact');
};

const postContact = (req, res) => {
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
		from: req.body.emailAddress,
		to: process.env.CONTACT_EMAIL,
		subject: 'Quack Quack',
		text: `${req.body.name} said, ${req.body.message}`,
	  };

	transporter.sendMail(message, (error, info) => {
	if (error) {
		return console.log(error);
	}
	console.log("Message Successfully sent");
	res.render('contact', {msg: true});
	});
};

// About Page Route
const getAbout = (req, res) => {
	if (req.session.user)
		res.render('about', {user: req.session.user});
	else
		res.render('about');
};

module.exports = {getHome, postHome, getContact, postContact, getAbout};