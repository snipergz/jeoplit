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
		console.log("Scraping in progress...");
		questions = await page.$$eval('a.SetPageTerm-wordText > span.TermText', el => el.map(el => el.textContent));
		console.log("Questions Scraped...");
		answers = await page.$$eval('a.SetPageTerm-definitionText > span.TermText', el => el.map(el => el.textContent));
		console.log("Answers Scraped");
		// console.log(wordText);
		// console.log(defText);
		console.log("Finished Scraping...");
		browser.close();
		return [questions, answers];
	}catch(e){
		console.log(e);
	}
}

//PRACTICE ROUTE FOR PLAY TEST
app.get('/playTest', async(req, res) => {
	let questions = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10", "q11", "q12", "q13", "q14", "q15", "q16", "q17", "q18", "q19", "q20", "q21", "q22", "q23", "q24", "q25"];
	console.log(questions);
	questionsArray = {
		q1: questions.splice(0,5),
		q2: questions.splice(0,5),
		q3: questions.splice(0,5),
		q4: questions.splice(0,5),
		q5: questions.splice(0,5)
	}
	console.log(questionsArray);
	res.render('playTest', {questions: questionsArray});
})

app.get('/home', async (req, res) =>{
	if(req.session.user)
		res.render('home', {user: req.session.user});
	else 
		res.render('home');
});

app.post('/play', async (req, res) => {
	console.log("Person is now playing");
	console.log("Quizlet Link is: " , req.body.quizletLink);
	const [questions, answers] = await scrapeProduct(req.body.quizletLink);
	const set = {
		q: questions,
		a: answers
	};
	const questionsString = questions.join();
	const answersString = answers.join();
	const newSet = await setsDB.run(
		`INSERT INTO sets (link, questions, answers)
		VALUES(?, ?, ?);`, [req.body.quizletLink, questionsString, answersString]
		);
	if(questions == undefined || questions == null)
		return res.send("Scraping did not work :(");
	console.log(set);
	res.render('play', {set: set});
});

app.get('/contactPage', async(req, res) => {
	if (req.session.user)
		res.render('contactpage', {user: req.session.user});
	else 
		res.render('contactpage');
});

app.post('/contactPage', async(req, res) => {
	
	console.log(req.body.name, req.body.emailAddress, req.body.message);
	res.send("<h1>Works</h1>");
})

app.get('/aboutPage', async(req, res) => {
	if (req.session.user)
		res.render('aboutPage', {user: req.session.user});
	else
		res.render('aboutPage');
});

app.get('/loginPage', async(req, res) => {
	if (req.session.user)
		res.redirect('/home');
	else
		res.render('loginPage');
});

app.post('/loginPage', async(req, res) => {

	let user = await User.login(req.body.username, req.body.password, userDB);
	if (user) {
		req.session.user = user;
		res.redirect('/home'); // and then add user object
	}
	else 
		res.render('loginPage'); // and then include errors
})

app.get('/signup', async(req, res) => {
	if(req.session.user) 
		res.redirect('/home');
	else
		res.render('signup');
});

app.post('/signup', async(req, res) => {

	let [success, user, errors] = await User.signup(req.body.username, req.body.password, userDB);
	
	if(success) {
		req.session.user = user
		res.redirect('/home');
	}
		
	else 
		res.render('signup'); // and then include errors
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
