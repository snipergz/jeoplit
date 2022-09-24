// const res = require("express/lib/response");
const body = document.getElementsByTagName('body');
const notice = document.getElementById('notice');
const playForm = document.getElementById('playForm');
const button = document.getElementById('play-button');
const loadingText = document.getElementById('loading-text');


var quotes = [
    "You're seeing this message because you are creating history 🎉",
    "You're the first person to use this quizlet set",
    "Anyone who uses this quizlet link after it has been loaded today",
    "will not have to wait for it to be loaded next time",
    "Thank you for using JeoPlit"
    ];

var i = 0;

function checkFields() {
    quizletLink = document.getElementById("link-box").value;
    
    // Check the link to make sure the link is valid
	if (!/quizlet.com/.test(quizletLink)) {
        document.getElementById("linkErrorMessage").classList.remove('d-none');
        return false;
    }
    else {

        if (!document.getElementById("linkErrorMessage").classList.contains('d-none'))
            document.getElementById("linkErrorMessage").classList.add('d-none');

        notice.classList.remove('d-none');
        playForm.classList.add('d-none');

        setInterval(function() {
            loadingText.innerHTML = quotes[i];
            loadingText.style.animation = "fadeIn 5s ease-in-out";
            i++;
            if(i == quotes.length){
                i = 0;
            }
        }, 5000);
    }
}

// setInterval(function() {
//     loadingText.innerHTML = quotes[i];
//     loadingText.style.animation = "fadeIn 5s ease-in-out";
//     i++;
//     if(i == quotes.length){
//         i = 0;
//     }
// }, 5000);

// button.addEventListener('click', async () => 
// {
//     console.log("Btn Clicked");
//     notice.classList.remove('d-none');
//     playForm.classList.add('d-none');
    
// });

