// const res = require("express/lib/response");
const body = document.getElementsByTagName('body');
const notice = document.getElementById('notice');
const playForm = document.getElementById('playForm');
const button = document.getElementById('play-button');

button.addEventListener('click', async () => 
{
    console.log("Btn Clicked");
    notice.classList.remove('d-none');
    playForm.classList.add('d-none');
});