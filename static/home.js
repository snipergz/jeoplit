// const res = require("express/lib/response");
const body = document.getElementsByTagName('body');
const err = document.getElementById('error_msg');
const notice = document.getElementById('notice');
const playForm = document.getElementById('playForm');
const practice = document.getElementById('practice');

const showError = () => {
    err.classList.remove('d-none'); 
    err.innerText = "It still hasn't loaded";
};

practice.addEventListener('click', () => {
    console.log("Btn Clicked")
    notice.classList.remove('d-none');
    playForm.classList.add('d-none');
})

// const { get } = require("http");
const button = document.getElementById('play-button');
const link_box = document.getElementById('link-box');
button.addEventListener('click', async () => 
{
    console.log("Btn Clicked");
    notice.classList.remove('d-none');
    playForm.classList.add('d-none');
});