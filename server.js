const express = require('express');
const puppeteer = require('puppeteer');

const path = require('path');
const PORT=8080;
const static_dir = path.join(__dirname, 'static');

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
// const req = require('express/lib/request');
const session = require('express-session');
const User = require('./models/user');

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
	res.render('playTest');
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



/////////////////////////////////////////////
// start up server

console.log("Javascript running on the server");

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
