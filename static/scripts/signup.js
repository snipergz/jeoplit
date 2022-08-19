const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const form = document.getElementById("signupForm");

const usernameAlert = document.getElementById("usernameAlert");
const emailAlert = document.getElementById("emailAlert");
const passwordAlert = document.getElementById("passwordAlert");
const confirmPasswordAlert = document.getElementById("confirmPasswordAlert");

let testCap = /[A-Z]/;
let testLower = /[a-z]/;
let testDigit = /[0-9]/;

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await checkInputs();
});

async function checkInputs(){
    errorsCount = 0;
    const usernameValue = username.value.trim();
    const emailValue = email.value;
    const passwordValue = password.value;
    const confirmPasswordValue = confirmPassword.value;
    usernameDuplicateResponseJson = false;
    if(usernameValue != ""){
        const usernameDuplicateResponse = await fetch(`/userSet/${usernameValue}`);
        usernameDuplicateResponseJson = true;
        const usernameDuplicateResponseJson = await usernameDuplicateResponse.json();
        console.log("Status: ", usernameDuplicateResponseJson);
    }
    if(usernameValue === "" || usernameValue === " "){
        console.log("Username cannot be empty");
        usernameAlert.classList.remove("d-none");
        usernameAlert.innerText = "Username cannot be empty";
        errorsCount += 1;
    }else{
        if(!usernameAlert.classList.contains("d-none")){
            usernameAlert.classList.add("d-none");
            usernameAlert.innerText = "";
        }
    }
    if(usernameDuplicateResponseJson && usernameDuplicateResponseJson.status === "Found"){
        console.log("Username is already taken");
        usernameAlert.classList.remove("d-none");
        usernameAlert.innerText = "Username is already taken";
        errorsCount += 1;
    }else{
        if(!usernameAlert.classList.contains("d-none")){
            usernameAlert.classList.add("d-none");
            usernameAlert.innerText = "";
        }
    }
    if(emailValue === "" || !isEmail(emailValue)){
        console.log("Invalid Email Input");
        emailAlert.classList.remove("d-none");
        emailAlert.innerText = "Please Enter a Valid Email";
        errorsCount += 1;
    }else{
        if(!emailAlert.classList.contains("d-none")){
            emailAlert.classList.add("d-none");
            emailAlert.innerText = "";
        }
    }
    if(!testCap.test(passwordValue) || !testLower.test(passwordValue) || !testDigit.test(passwordValue)){
        console.log("Incorrect Password Input");
        passwordAlert.classList.remove("d-none");
        passwordAlert.innerText = "Password must have a Capital letter, lowercase letter, and 1 Digit";
        errorsCount += 1;
    }else{
        if(!passwordAlert.classList.contains("d-none")){
            passwordAlert.classList.add("d-none");
            passwordAlert.innerText = "";
        }
    }
    if(confirmPasswordValue != passwordValue){
        console.log("Incorrect Password Confirmation")
        confirmPasswordAlert.classList.remove("d-none");
        confirmPasswordAlert.innerText = "Password values are not the same";
        errorsCount += 1;
    }else{
        if(!confirmPasswordAlert.classList.contains("d-none")){
            confirmPasswordAlert.classList.add("d-none");
            confirmPasswordAlert.innerText = "";
        }
    }

    if(errorsCount === 0){
        await fetch('/signup', {
            headers: {'Content-Type': 'application/json'},
            method: 'POST',
            body: JSON.stringify({username: usernameValue, email: emailValue, password: passwordValue})
        }).then(async (res) => {
            window.location.assign('/home');
        }).catch(async (res) => {
            window.location.assign('/signup');
        })
    }
}

function isEmail(email){
    return /^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/.test(email);
}