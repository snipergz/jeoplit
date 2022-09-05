const asyncHandler = require('express-async-handler');
const puppeteer = require('puppeteer');
const Set = require('../models/setModel');
const User = require('../models/userModel');

// Used to seed the questions and answers scraped from quizlet
const setDBSeed = "$%&*!@#";

function getRandomInt(num) {
    return Math.floor(Math.random() * num);
}

async function findLink(link) {
    // look up the link in the database
    const set = await Set.findOne({"link":link});
    // if it exists, return it otherwise return null
    try {
        if(set.link != null)
            return set;
    } catch (error) {
            return null;
    }
}

async function createRandomSet(questions, answers) {

    let questionsArray = [];
    let answersArray = [];

    let numOfSets = 0;
    while (questions.length > 0 && numOfSets < 25) {
        let randNum = getRandomInt(questions.length);

        // Add set to the new array
        questionsArray.push(questions[randNum]);
        answersArray.push(answers[randNum]);

        // Remove the set from the possible choices
        questions.splice(randNum, 1);
        answers.splice(randNum, 1);

        // Total number of sets between the two arrays
        numOfSets++;
    }

    let set = [];

    // If there are less than 5 sets, no point in playing the game...
    if (numOfSets < 5)
        return [false, set];

    // Otherwise, if there are an uneven number of sets, make it possible to have 5 categories
    else if (numOfSets % 5 != 0) {
        for (let i = 0; i < numOfSets % 5; i++) {
            questionsArray.pop();
            answersArray.pop();
        }
    }

    numOfSets = questionsArray.length;

    // Map each question/answer to a new set array
    for (let i = 0; i < numOfSets; i++) {
        set.push({
            id: i,
            q: questionsArray[i],
            a: answersArray[i],
            answered: false
        });
    }

    // Return success, set array
    return [true, set];
}

//Scraper Function
async function scrapeProduct(url){
	console.log("Scraping Browser Started...");
	try{
		const browser = await puppeteer.launch({
			headless:false,
			args: ["--no-sandbox"]
		});
		const page = (await browser.pages())[0];
		await page.setRequestInterception(true);
		page.on('request', (req) => {
			if(req.resourceType() == 'font' || req.resourceType() == 'image'){
				req.abort();
			} else {
				req.continue();
			}
		})
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

// Routes
const postSubmitSet = asyncHandler(async(req, res) =>{

	// Check the link to make sure the link is valid
	if (!req.body.quizletLink || !/quizlet.com/.test(req.body.quizletLink))
		res.render('home', {errors: ["Please input a Quizlet link!"]})
	
	else {

		//Game begins
		console.log("\nPerson is now playing");
		console.log("Quizlet Link is: " , req.body.quizletLink);
		
		//Check first if the set is in the database
		console.log("Checking Database");
		const dbSet = await findLink(req.body.quizletLink);
		if(dbSet){
			console.log("Set is in the Database\n");

			// Insert set into user's setsPlayed array if logged in
			if(req.session.user){
				try {
					await User.updateOne(
						{"username" : req.session.user.username},
						{"setsPlayed" : [...req.session.user.setsPlayed, req.body.quizletLink]}
						);
				} catch (error) {
					console.log(error);
				}
			}

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
			let [success, deck] = await createRandomSet(dbQuestions, dbAnswers);
			if(success) {
				for (let i = 0; i < size; i++) {
					rows.push({
						s: deck.splice(0, 5),
						v: ((i + 1)*100)
					})
				}
			}else{
				res.render('404');
			}

			const numOfCards = parseInt(size) * 5;
				
			console.log("Game Started - User Set Configuration...\n");
			// Send it to user checking
			if(req.session.user)
				res.render('configureSet', {title: dbSet.title, user: req.session.user, success: success, rows:rows});
			else
				res.render('configureSet', {title: dbSet.title, success: success, rows:rows});
		}else{
			console.log("Set is not in Database\n");
			//Scrape the Set
			console.log(`\nBeginning the Scrape for ${req.body.quizletLink}...`);
			[questions, answers, setTitle] = await scrapeProduct(req.body.quizletLink);
			if(questions == undefined || questions == null)
				return res.render('404');

			console.log("Scraping ", setTitle);
			console.log("Questions Scraped ", questions);
			console.log("Answers Scraped ", answers);
			console.log("Scrape Succeeded...\n");

			//Get the Length of the Set
			const size = questions.length / 5;
			let rows = [];

			//Adjust the data
			for(let question of questions){
				question += setDBSeed;
			}
			for(let answer of answers){
				answer += setDBSeed;
			}
			// console.log("Questions Adjusted ", set.q);
			// console.log("Answers Adjusted ", set.a);
			// Insert into database
			console.log("Inserting into the sets database...");
			const questionsString = questions.join(setDBSeed);
			const answersString = answers.join(setDBSeed);
			if(questionsString != "" && answersString != "" && setTitle != ""){
				try {
					const newSet = await Set.create({
						title: (String(setTitle)),
						link: req.body.quizletLink,
						questions: questionsString,
						answers: answersString
					});
				} catch (error) {
					console.log(error);
				}
				console.log("Set inserted into database...\n");
			}

			// Insert set into user's setsPlayed array if logged in
			if(req.session.user){
				try {
					await User.updateOne(
						{"username" : req.session.user.username},
						{"setsPlayed" : [...req.session.user.setsPlayed, req.body.quizletLink]}
						);
				} catch (error) {
					console.log(error);
				}
			}

			// Randomize the Set
			console.log("Randomizing the Set...\n");
			let [success, deck] = await createRandomSet(questions, answers);
			if(success) {
				for (let i = 0; i < size; i++) {
					rows.push({
						s: deck.splice(0, 5),
						v: ((i + 1)*100)
					})
				}
			}else{
				res.render('404');
			}

			console.log("Game Started - User Set Configuration...\n");
			//Render the playing page
			const numOfCards = parseInt(size) * 5;
			// Send it to user checking
			if(req.session.user)
				res.render('configureSet', {title: setTitle, user: req.session.user, success: success, rows:rows});
			else
				res.render('configureSet', {title: setTitle, success: success, rows:rows});
			// res.render('play', {title: set.t, rows: rows, size: numOfCards});
		}
	}

	
});

const getPlaySet = (req, res) => {
	if(req.session.set && req.session.user){
		if(req.session.title)
			res.render('play', {user:req.session.user, title: req.session.title, rows: req.session.set, size: req.session.size, score: req.session.score})
		else
			res.render('play', {user:req.session.user, rows: req.session.set, size: req.session.size, score: req.session.score})
	} else if (req.session.set){
		if(req.session.title)
			res.render('play', {title: req.session.title, rows: req.session.set, size: req.session.size, score: req.session.score})
		else
			res.render('play', {rows: req.session.set, size: req.session.size, score: req.session.score})
	}else{
		res.redirect('home');
	}
}

const postNewSet = asyncHandler(async (req, res) => {
	//Get the Length of the Set
	const size = req.body.questions.length / 5;
	let rows = [];

	// Randomize the Set
	let [success, deck] = await createRandomSet(req.body.questions, req.body.answers);
	if(success) {
		for (let i = 0; i < size; i++) {
			rows.push({
				s: deck.splice(0, 5),
				v: ((i + 1)*100)
			})
		}
	}else{
		res.render('404');
	}

	const numOfCards = parseInt(size) * 5;

	req.session.set = rows;
	req.session.size = numOfCards;
	req.session.score = 0;
	req.session.title = req.body.title;

	res.json({status: "OK"})
});

const postUpdateSet = (req, res) => {
	req.session.set.forEach(e => {
		for (card of e.s) {
			if (card.id == req.body.cardID) {
				card.answered = true;
			}
		}
	});
	
	res.json({status: "OK"})
};

const postUpdateScore = (req, res) => {
	req.session.score = req.body.score;
	res.json({status: "OK"})
}

module.exports = {postSubmitSet, getPlaySet, postNewSet, postUpdateSet, postUpdateScore};