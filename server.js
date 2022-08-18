require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const path = require('path');
const PORT=8080;
const static_dir = path.join(__dirname, 'static');

const mongoose = require('mongoose');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
// const req = require('express/lib/request');
const session = require('express-session');

// Models that are used to create sets and keep track of user
const User = require('./models/user');
const Set = require('./models/sets');
const { title } = require('process');
const { randomUUID } = require('crypto');

// Used to seed the questions and answers scraped from quizlet
const setDBSeed = "$%&*!@#";

console.log(`Directory is ${static_dir}`);

// Connecting to the databases
let mongoDB;
(async () => {
	try{
		mongoDB = await mongoose.connect(process.env.MONGO_URI);
		console.log(`MongoDB Connected: ${mongoDB.connection.host}`);
	} catch (error){
		console.log(error);
	}
})();

let userDB;
(async () => {
	console.log("Connecting to User database...")
	userDB = await open({
		filename: 'users.sqlite',
		driver: sqlite3.Database
	});
	console.log("User database connected: true");
})();

let setsDB;
(async () => {
	console.log("Connecting to Sets database...")
	setsDB = await open({
		filename: 'sets.sqlite',
		driver: sqlite3.Database
	});
	console.log("Sets database connected: true");
})();
/////////////////////////////////////////////
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
app.use('', require('./routes/userRoutes'));
app.use('', require('./routes/generalRoutes'));

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
			setTitle = await page.$$eval('div.SetPage-titleWrapper > h1', el => el.map(el => el.textContent));
			console.log(`Title of the set is: ${setTitle}`);
		}catch(e){
			console.log(e);
			setTitle = "FAILED-SCRAPING";
		}
		try {
			questions = await page.$$eval('a.SetPageTerm-wordText > span.TermText', el => el.map(el => el.textContent));
			console.log("Questions Scraped...");
		} catch (e) {
			console.log(e);
			questions = "FAILED-SCRAPING";
		}
		try {
			answers = await page.$$eval('a.SetPageTerm-definitionText > span.TermText', el => el.map(el => el.textContent));
			console.log("Answers Scraped");	
		} catch (e) {
			console.log(e);
			answers = "FAILED-SCRAPING";
		}
		console.log("Finished Scraping...\n");
		browser.close();
		return [questions, answers, setTitle];
	}catch(e){
		console.log(e);
	}
}

app.get('/playSet', async (req, res) => {
	if (req.session.set)
		res.render('play', {rows: req.session.set, size: req.session.size, score: req.session.score})
	else
		res.redirect('home');
})

app.post('/playWithNewSet', async (req, res) => {
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
	req.session.score = 0;

	res.json({status: "OK"})
})

// ----------------------------------------------------------------------------------------------------------------------------------

// Update the set of cards in session when one is answered: 
app.post('/updateSet' , async(req, res) => {

	req.session.set.forEach(e => {
		for (card of e.s) {
			if (card.id == req.body.cardID) {
				card.answered = true;
			}
		}
	});
	
	res.json({status: "OK"})
})

app.post('/updateScore', async(req, res) => {

	req.session.score = req.body.score;

	res.json({status: "OK"})
})

app.post('/submitSet', async(req, res) => {
	
	//Game begins
	console.log("\nPerson is now playing");
	console.log("Quizlet Link is: " , req.body.quizletLink);

	//Check first if the set is in the database
	console.log("Checking Database");
	const dbSet = await Set.findLink(req.body.quizletLink , setsDB);
	if(dbSet){
		console.log("Set is in the Database\n");

		// console.log(dbSet);
		const dbQuestions = dbSet.questions.split(setDBSeed);
		const dbAnswers = dbSet.answers.split(setDBSeed);
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
		
		console.log("Game Started - User Set Configuration...\n");
		// Send it to user checking
		res.render('configureSet', {success: success, rows:rows});

		// res.render('play', {title: dbSet.title, rows: rows, size: numOfCards});
	}else{
		console.log("Set is not in Database\n");

		//Scrape the Set
		console.log("\nBeginning the Scrape...");
		[questions, answers, setTitle] = await scrapeProduct(req.body.quizletLink);
		if(questions == undefined || questions == null)
			return res.send("Bad Link");
		const set = {
			questions: questions,
			answers: answers,
			title: setTitle
		};
		console.log("Scraping ", set.title);
		console.log("Questions Scraped ", set.questions);
		console.log("Answers Scraped ", set.answers);
		console.log("Scrape Succeeded...\n");

		//Get the Length of the Set
		const size = set.questions.length / 5;
		let rows = [];

		//Adjust the data
		for(let question of set.questions){
			question += setDBSeed;
		}
		for(let answer of set.answers){
			answer += setDBSeed;
		}
		// console.log("Questions Adjusted ", set.q);
		// console.log("Answers Adjusted ", set.a);

		//Insert into database
		console.log("Inserting into the sets database...");
		const questionsString = set.questions.join(setDBSeed);
		const answersString = set.answers.join(setDBSeed);
		const deckTitle = set.title;
		if(questionsString != "" && answersString != "" && deckTitle != ""){
			const newSet = await setsDB.run(
				`INSERT INTO sets (link, questions, answers, title)
				VALUES(?, ?, ?, ?);`, [req.body.quizletLink, questionsString, answersString, deckTitle]
				);
			console.log("Set inserted into database...\n");
		}

		// Randomize the Set
		console.log("Randomizing the Set...\n");
		let [success, deck] = await Set.createRandomSet(set.questions, set.answers);
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

		console.log("Game Started - User Set Configuration...\n");
		//Render the playing page
		const numOfCards = parseInt(size) * 5;
		// Send it to user checking
		res.render('configureSet', {success: success, rows:rows});
		// res.render('play', {title: set.t, rows: rows, size: numOfCards});
	}
})

app.get('/playSet', async (req, res) =>{
	if(req.session.user)
		res.render('home', {user: req.session.user});
	else 
		res.render('home');
});


/////////////////////////////////////////////
// start up server

console.log("Javascript running on the server");

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
