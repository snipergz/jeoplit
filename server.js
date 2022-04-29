const express = require('express');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');


const path = require('path');
const PORT=8080;
const static_dir = path.join(__dirname, 'static');

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
// const req = require('express/lib/request');
const session = require('express-session');

// Models that are used to create sets and keep track of user
const User = require('./models/user');
const Set = require('./models/sets');
const { title } = require('process');

console.log(`Directory is ${static_dir}`);

// Connecting to the databases
let userDB;
(async () => {
	userDB = await open({
		filename: 'users.sqlite',
		driver: sqlite3.Database
	});
})();
console.log("User database connected: true");

let setsDB;
(async () => {
	setsDB = await open({
		filename: 'sets.sqlite',
		driver: sqlite3.Database
	});
})();
console.log("Sets database connected: true");
/////////////////////////////////////////////
// express and middleware setup

const app = express();
app.use(express.static(static_dir));
app.use(express.urlencoded({extended: false})); 
app.set('view engine', 'ejs');
app.use(session({secret: 'superSecret', resave: false, saveUninitialized: false}));
app.use('/favicon.ico', express.static('images/favicon.ico'));
app.use(express.json())

// serve static files
app.use(express.static(path.join(__dirname, 'static')));

/////////////////////////////////////////////
// routes

//Scraper Function
async function scrapeProduct(url){
	console.log("Scraping Browser Started...");
	try{
		const browser = await puppeteer.launch();
		const page = (await browser.pages())[0];
		console.log("Browser Opened...")
		await page.setDefaultNavigationTimeout(0);
		await page.goto(url);
		console.log("\nScraping in progress...");
		console.log("Scraping Title...");
		try{
			setTitle = await page.$$eval('h1.UIHeading', el => el.map(el => el.textContent));
		}catch(e){
			console.log(e);
			setTitle = "FAILED";
		}
		console.log(`Title of the set is: ${setTitle}`);
		questions = await page.$$eval('a.SetPageTerm-wordText > span.TermText', el => el.map(el => el.textContent));
		console.log("Questions Scraped...");
		answers = await page.$$eval('a.SetPageTerm-definitionText > span.TermText', el => el.map(el => el.textContent));
		console.log("Answers Scraped");
		// console.log(wordText);
		// console.log(defText);
		console.log("Finished Scraping...\n");
		browser.close();
		return [questions, answers, setTitle];
	}catch(e){
		console.log(e);
	}
}

// Messing around with displaying questions and answers -------------------------------------------------------------------------------
app.get('/testing', async(req, res) => {
	res.render('TESTING');
})

app.post('/testing', async(req, res) => {
	
	let size = 5;
	let rows = [];
	
	dbQuestions = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10", "q11", "q12", "q13", "q14", "q15"];
	dbAnswers = ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a10", "a11", "a12", "a13", "a14", "a15"];

	let [success, deck] = await Set.createRandomSet(dbQuestions, dbAnswers);
	if(success) {
		for (let i = 0; i < size; i++) {
			rows.push({
				s: deck.splice(0, 5),
				v: ((i + 1)*100)
			})
		}
	}

	numOfCards = 15;

	res.render('TESTINGCHECK', {success: success, rows: rows});
})

app.get('/testingPlay', async (req, res) => {
	if (req.session.set)
		res.render('play', {rows: req.session.set, size: req.session.size})
	else
		res.redirect('home');
})

app.post('/testingWithNewSet', async (req, res) => {
	//Get the Length of the Set
	const size = req.body.questions.length / 5;
	let rows = [];

	// Randomize the Set
	let [success, deck] = await Set.createRandomSet(req.body.questions, req.body.answers);
	if(success) {
		for (let i = 0; i < size; i++) {
			rows.push({
				s: deck.splice(0, 5),
				v: ((i + 1)*100)
			})
		}
	}else{
		res.send("Bad Set\n");
	}

	const numOfCards = parseInt(size) * 5;

	req.session.set = rows;
	req.session.size = numOfCards;

	res.json({status: "OK"})
})

// ----------------------------------------------------------------------------------------------------------------------------------

app.post('/play', async(req, res) => {
	
	//Game begins
	console.log("\nPerson is now playing");
	console.log("Quizlet Link is: " , req.body.quizletLink);

	//Check first if the set is in the database
	console.log("Checking Database");
	const dbSet = await Set.findLink(req.body.quizletLink , setsDB);
	if(dbSet){
		// console.log(dbSet);
		const dbQuestions = dbSet.questions.split(',');
		const dbAnswers = dbSet.answers.split(',');
		// console.log(dbQuestions);
		// console.log(dbAnswers);

		//Get the Length of the Set
		const size = dbQuestions.length / 5;
		let rows = [];

		// Randomize the Set
		console.log("Randomizing the Set...\n");
		let [success, deck] = await Set.createRandomSet(dbQuestions, dbAnswers);
		if(success) {
			for (let i = 0; i < size; i++) {
				rows.push({
					s: deck.splice(0, 5),
					v: ((i + 1)*100)
				})
			}
		}else{
			res.send("Bad Set\n");
		}

		const numOfCards = parseInt(size) * 5;

		// Send it to user checking
		res.render('TESTINGCHECK', {success: success, rows:rows});

		// res.render('play', {title: dbSet.title, rows: rows, size: numOfCards});
	}else{
		console.log("Set is not in Database\n");

		//Scrape the Set
		console.log("\nBeginning the Scrape...");
		[questions, answers, setTitle] = await scrapeProduct(req.body.quizletLink);
		if(questions == undefined || questions == null)
			return res.send("Bad Link");
		const set = {
			q: questions,
			a: answers,
			t: setTitle
		};
		console.log("Scrape Succeeded...\n");

		//Get the Length of the Set
		const size = set.q.length / 5;
		let rows = [];

		//Insert into database
		console.log("Inserting into the sets database...");
		const questionsString = set.q.join();
		const answersString = set.a.join();
		const deckTitle = set.t;
		if(questionsString != "" && answersString != "" && deckTitle != ""){
			const newSet = await setsDB.run(
				`INSERT INTO sets (link, questions, answers, title)
				VALUES(?, ?, ?, ?);`, [req.body.quizletLink, questionsString, answersString, deckTitle]
				);
		}

		// Randomize the Set
		console.log("Randomizing the Set...\n");
		let [success, deck] = await Set.createRandomSet(set.q, set.a);
		if(success) {
			for (let i = 0; i < size; i++) {
				rows.push({
					s: deck.splice(0, 5),
					v: ((i + 1)*100)
				})
			}
		}else{
			res.send("Bad Set\n");
		}

		console.log("Set inserted into database...\n");
		
		console.log("Game Started...\n")
		//Render the playing page
		const numOfCards = parseInt(size) * 5;
		res.render('play', {title: set.t, rows: rows, size: numOfCards});
	}
})

app.get('/home', async (req, res) =>{
	if(req.session.user)
		res.render('home', {user: req.session.user});
	else 
		res.render('home');
});

//Database API
app.get('/data/:link', async (req, res) =>{
	const url = req.params['link'];
	let link = url.split('%');
	let finalLink = link.join();
	console.log("final link is:", finalLink);
	let found = await Set.findLink(finalLink, setsDB);
	if(found){
		data = await setsDB.get(`SELECT * FROM sets WHERE link = '${finalLink}' `);
	}else{
		console.log("Link was not Found\n");
		//Scrape the Set
		console.log("\nBeginning the Scrape...");
		[questions, answers, setTitle] = await scrapeProduct(finalLink);
		if(questions == undefined || questions == null)
			return res.send("Bad Link");
		const set = {
			q: questions,
			a: answers,
			t: setTitle
		};
		console.log("Scrape Succeeded...\n");

		//Insert into database
		console.log("Inserting into the sets database...");
		const questionsString = set.q.join();
		const answersString = set.a.join();
		const deckTitle = set.t;
		if(questionsString != "" && answersString != "" && deckTitle != ""){
			const newSet = await setsDB.run(
				`INSERT INTO sets (link, questions, answers, title)
				VALUES(?, ?, ?, ?);`, [finalLink, questionsString, answersString, deckTitle]
				);
		}

		//Fetch it back
		data = await setsDB.get(`SELECT * FROM sets WHERE link = '${finalLink}' `);
	}
	console.log(data);
	res.json(data);
});

app.get('/play', async (req, res) =>{
	if(req.session.user)
		res.render('home', {user: req.session.user});
	else 
		res.render('home');
});

app.post('/returnHome', async(req, res) => {
	delete req.session.set;
	delete req.session.size;
	res.redirect('/home');
})

//ROUTES AT THE MOMENT DO NOT NEED CHANGE
app.get('/contact', async(req, res) => {
	if (req.session.user)
		res.render('contact', {user: req.session.user});
	else 
		res.render('contact');
});

app.post('/contact', async(req, res) => {
	
	console.log(req.body.name, req.body.emailAddress, req.body.message);
	const output = `
		<p>You have a new contact request</p>
		<h3>Contact Details</h3>
		<ul>
			<li>Name: ${req.body.name}</li>
			<li>Email: ${req.body.emailAddress}</li>
		</ul>
		<h3>Message</h3>
		<p>${req.body.message}</p>
	`;
	//FIX ME FOR SECURITY 
	//https://www.youtube.com/watch?v=nF9g1825mwk
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		host: 'smtp.gmail.com',
		port: 587,
		secure: false,
		auth:{
			user: 'jeoplitContact@gmail.com',
			pass: 'QuizletJeopardy3!!!'
		},
		tls: {
			rejectUnauthorized: false
		  },
	});

	var message = {
		from: 'jeoplitContact@gmail.com',
		to: 'rknobel27@gmail.com, mikepanuelos928@gmail.com',
		subject: 'Quack Quack',
		text: 'You have been chosen to be a Beta Tester for JeoPlit',
		html: output
	  };

	transporter.sendMail(message, (error, info) => {
	if (error) {
		return console.log(error);
	}
	console.log('Message sent: %s', info.messageId);
	res.render('contact', {msg: true});
	});
})

app.get('/about', async(req, res) => {
	if (req.session.user)
		res.render('about', {user: req.session.user});
	else
		res.render('about');
});

app.get('/login', async(req, res) => {
	if (req.session.user)
		res.redirect('/home');
	else
		res.render('login');
});

app.post('/login', async(req, res) => {
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

app.get('/signup', async(req, res) => {
	if(req.session.user) 
		res.redirect('/home');
	else
		res.render('signup');
});

app.post('/signup', async(req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	let [success, user, errors] = await User.signup(username, password, userDB);
	
	if(success) {
		req.session.user = user
		res.render('home', {user: user});
	}
	else 
		res.render('signup', {errors: errors, uname: req.body.username}); // and then include errors
})

app.get('/logout', async(req, res) => {
	delete req.session.user;
	res.redirect('/home');
})

/////////////////////////////////////////////
// start up server

console.log("Javascript running on the server");

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
