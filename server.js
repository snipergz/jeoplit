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

//Scraper Function
async function scrapeProduct(url){
	console.log("Scraping Browser Started...");
	try{
		const browser = await puppeteer.launch();
		const page = (await browser.pages())[0];
		console.log("Browser Opened...")
		await page.goto(url);
		console.log("Scraping in progress...");
		wordText = await page.$$eval('a.SetPageTerm-wordText > span.TermText', el => el.map(el => el.textContent));
		console.log("Questions Scraped...");
		defText = await page.$$eval('a.SetPageTerm-definitionText > span.TermText', el => el.map(el => el.textContent));
		console.log("Answers Scraped");
		// console.log(wordText);
		// console.log(defText);
		console.log("Finished Scraping...");
		browser.close();
		return wordText;
	}catch(e){
		console.log(e);
	}
}

app.get('/home', async (req, res) =>{
	console.log("At home page");
	res.render('home');
});

app.post('/play', async (req, res) => {
	console.log("Person is now playing");
	console.log("Quizlet Link is: " , req.body.quizletLink);
	const questions = await scrapeProduct(req.body.quizletLink);
	if(questions == undefined || questions == null)
		return res.send("Scraping did not work :(");
	res.render('play', {questions: questions})
});

app.get('/contactPage', async(req, res) => {
	res.render('contactpage');
});

app.get('/aboutPage', async(req, res) => {
	res.render('aboutPage');
});

app.get('/loginPage', async(req, res) => {
	res.render('loginPage');
});

app.post('/loginPage', async(req, res) => {

	console.log(req.body.uname);
	console.log(req.body.pw);
})





/////////////////////////////////////////////
// start up server

console.log("Javascript running on the server");

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
