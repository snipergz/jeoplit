const password = document.getElementById("resetPassword");
const confirmPassword = document.getElementById("resetConfirmPassword");
const form = document.getElementById("resetForm");
const requestID = document.getElementById("requestID").innerText;
console.log(requestID)

const passwordAlert = document.getElementById("resetPasswordAlert");
const confirmPasswordAlert = document.getElementById("resetConfirmPasswordAlert");

let testCap = /[A-Z]/;
let testLower = /[a-z]/;
let testDigit = /[0-9]/;

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await checkInputs();
});

async function checkInputs(){
    errorsCount = 0;
    const passwordValue = password.value;
    const confirmPasswordValue = confirmPassword.value;
    // Check if the password value is not empty and follows the requirements else return an error
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
    // Confirm that the reinput password matches the original
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
        await fetch(`/reset/${requestID}`, {
            headers: {'Content-Type': 'application/json'},
            method: 'PATCH',
            body: JSON.stringify({password: passwordValue})
        }).then(async (res) => {
            console.log("Success Patch");
            window.location.assign('/home');
        }).catch(async (res) => {
            console.log("Failed Patch");
            window.location.assign('/home');
        })
    }
}

function isEmail(email){
    return /^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/.test(email);
}