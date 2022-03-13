const lb = document.getElementById('loginButton');

lb.addEventListener('click', async() => {
    let username = document.getElementById('username-box').value;
    let password = document.getElementById('password-box').value;

    console.log([username, password]);
    
    await fetch('/loginPage', {
        method: 'POST',
        body: {
            uname: username,
            pw: password
        }
        
    });
    console.log('click');
})