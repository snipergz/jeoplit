const express = require('express');
const puppeteer = require('puppeteer');

const path = require('path');
const PORT=8080;
const static_dir = path.join(__dirname, 'static');

// const sqlite3 = require('sqlite3');
// const { open } = require('sqlite');
// const req = require('express/lib/request');

console.log(`Directory is ${static_dir}`);


/////////////////////////////////////////////
// express and middleware setup

const app = express();
app.use(express.static(static_dir));
app.use(express.urlencoded({extended: false})); 
app.set('view engine', 'ejs');

// serve static files
app.use(express.static(path.join(__dirname, 'static')));

/////////////////////////////////////////////
// routes

app.get('/home', async (req, res) =>{
	console.log("At home page");
	res.render('home');
});

app.get('/play', async (req, res) =>{
	console.log("Person is now playing");
	// questions = ["What is a dog", "Where is the fish", "Are we there ye"];
	async function scrapeProduct(url){
		console.log("Scraping Browser Started...");
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.goto(url);
		console.log("Scraping in progress...");
	 	wordText = await page.$$eval('a.SetPageTerm-wordText > span.TermText', el => el.map(el => el.textContent));
		console.log("Got the questions...");
		// defText = await page.$$eval('a.SetPageTerm-definitionText > span.TermText', el => el.map(el => el.textContent));
		console.log(wordText);
		// console.log(defText);
		console.log("Finished Scraping...");
		browser.close();
		return wordText;
	}
	
	const questions = await scrapeProduct('https://quizlet.com/675591396/se1-midterm-flash-cards/')
	res.render('play', {questions: questions});
})

app.post('/contactus', async (req, res) => {
	// Testing out the push feature
})



/////////////////////////////////////////////
// start up server

console.log("Javascript running on the server");

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
