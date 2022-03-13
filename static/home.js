// const { get } = require("http");
const button = document.getElementById('play-button');
const link_box = document.getElementById('link-box');
button.addEventListener('click', async () => 
{
    const url = link_box.value;
    console.log(url);
    // const response = await fetch(url, {
    //     credentials: 'include',
    //     method: 'GET',
    //     headers: {'content-type': 'application/json'},
    //     mode: "no-cors",
    //     body: JSON.stringify()
    //     // referrerPolicy: 'strict-origin-when-cross-origin'
    // });
    // const data = await response.json();
    // console.info('fetch()', response);
    // console.log(data);
    // console.log(response);
});