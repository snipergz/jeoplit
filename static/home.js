// const res = require("express/lib/response");
const body = document.getElementsByTagName('body');
const err = document.getElementById('error_msg');

const showError = () => {
    err.classList.remove('d-none'); 
    err.innerText = "It still hasn't loaded";
};

// const { get } = require("http");
const button = document.getElementById('play-button');
const link_box = document.getElementById('link-box');
button.addEventListener('click', async () => 
{
    console.log("Btn Clicked");
    let url = link_box.value;
    let response = "";
    let encURIComp = encodeURIComponent(`${url}`);
	console.log(encURIComp);
    console.log(url);
    while(!response.ok){
        showError();
    }
    const data = await response.json();
    console.log(data);
});