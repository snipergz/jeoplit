const express = require('express');
const puppeteer = require('puppeteer');

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

//PRACTICE ROUTE FOR PLAY TEST
app.get('/playTest', async(req, res) => {
	// const questions = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10", "q11", "q12", "q13", "q14", "q15", "q16", "q17", "q18", "q19", "q20", "q21", "q22", "q23", "q24", "q25"];
	// const answers = ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a10", "a11", "a12", "a13", "a14", "a15", "a16", "a17", "a18", "a19", "a20", "a21", "a22", "a23", "a24", "a25"];
	
	const questions = ["q1", "q2", "q3", "q4", "q5"];
	const answers = ["a1", "a2", "a3", "a4", "a5"];
	
	let size = questions.length / 5;
	let rows = [];

	let [success, set] = await Set.createRandomSet(questions, answers);

	if(success) {
		for (let i = 0; i < size; i++) {
			rows.push({
				s: set.splice(0, 5),
				v: ((i + 1)*100)
			})
		}
	} 

	else {
		// Do something with error handling idk
	}
	numOfCards = parseInt(size) * 5;
	res.render('playTest', {rows: rows, numCards: numOfCards});
})

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

		res.render('play', {title: dbSet.title, rows: rows, size: size});
	}

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
	
	//Insert into database
	console.log("Inserting into the sets database...");
	const questionsString = set.q.join();
	const answersString = set.a.join();
	const deckTitle = set.t;
	const newSet = await setsDB.run(
		`INSERT INTO sets (link, questions, answers, title)
		VALUES(?, ?, ?, ?);`, [req.body.quizletLink, questionsString, answersString, deckTitle]
		);
	console.log("Set inserted into database...\n");

	
	console.log("Game Started...\n")
	//Render the playing page
	res.render('play', {title: set.t, rows: rows, size: size});
})

app.get('/home', async (req, res) =>{
	if(req.session.user)
		res.render('home', {user: req.session.user});
	else 
		res.render('home');
});

app.get('/play', async (req, res) =>{
	if(req.session.user)
		res.render('home', {user: req.session.user});
	else 
		res.render('home');
});

app.post('/playTest', async(req, res) => {
	res.redirect('/home');
})

app.get('/contact', async(req, res) => {
	if (req.session.user)
		res.render('contact', {user: req.session.user});
	else 
		res.render('contact');
});

app.post('/contact', async(req, res) => {
	
	console.log(req.body.name, req.body.emailAddress, req.body.message);
	res.send("<h1>Works</h1>");
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
		res.render('home', {user: newuser});
	}
	else 
		res.render('signup', {errors: errors}); // and then include errors
})

app.get('/logout', async(req, res) => {
	delete req.session.user;
	res.redirect('/home');
})

// Testing the sets stuff
app.get('/set', async(req, res) => {

	let fquestions = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"];
	let fanswers = ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a10"];

	let [success, set] = await Set.createRandomSet(fquestions, fanswers);

	if (success) {
		console.log(set);

		res.send("<h1>Works</h1>");
	}
	else
		res.send("<h1>There was an error</h1>");
})



/////////////////////////////////////////////
// start up server

console.log("Javascript running on the server");

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
