index = document.querySelector('#index');
boxes = document.querySelectorAll('.question-box');
let modalClickCounter = 0;

boxes.forEach(box => box.addEventListener('click', () => {
    
    // Grab information from the clicked box
    let question = box.querySelector('.question').innerText;
    let answer = box.querySelector('.answer').innerText;
    let value = box.querySelector('.question-text').innerText;
    let id = box.querySelector('.id').innerText;

    // Set information that will get passed around for the modal
    document.querySelector('#modalTitle').innerText = `For ${value} points...`;
    document.querySelector('#modalQuestion').innerText = question;
    document.querySelector('#modalAnswer').innerText = answer;
    document.querySelector('#modalValue').innerText = value;
    document.querySelector('#modalId').innerText = id;

    $("#exampleModal").modal('show');
}));

document.querySelector('#modalButton').addEventListener('click', (e) => {
    e.preventDefault();
    
    // Grab necessary information to check if answer is correct 
    let question = document.querySelector('#modalQuestion').innerText.trim();
    let inputAnswer = document.querySelector('#aInput').value.trim();
    let answer = document.querySelector('#modalAnswer').innerText.trim();
    let value = document.querySelector('#modalValue').innerText.trim();
    let id = document.querySelector('#modalId').innerText.trim();

    //Modal
    let checkModalTitle = document.querySelector('#checkModalTitle');
    let checkModalQuestion = document.querySelector('#checkModalQuestion');
    let checkModalInputAnswer = document.querySelector('#checkModalInputAnswer');
    let checkModalAnswer = document.querySelector('#checkModalAnswer');
    let checkModalValue = document.querySelector('#checkModalValue');
    let checkIssue = document.querySelector('#checkIssue');
    let checkIssueButton = document.querySelector('#checkIssueButton');

    // Hide the modal
    $('#exampleModal').modal('hide');

    if (inputAnswer == answer) {

        // Updating score if correct answer
        document.querySelector('#score').innerText = parseInt(document.querySelector('#score').innerText) + parseInt(value);
        updateScore(parseInt(document.querySelector('#score').innerText));

        // Show the check answer modal
        $('#checkModal').modal('show');

        checkModalTitle.innerText = "Correct!";
        checkModalQuestion.innerText = question;
        checkModalInputAnswer.innerHTML = `<span style="color:#00c9ff">Your answer: </span>` + inputAnswer;
        checkModalAnswer.innerHTML += `<span style="color:#2FEB00">Correct answer: </span>` + answer;
    }
    else {

        // Show the check answer modal
        $('#checkModal').modal('show');
        checkModalTitle.innerText = "Incorrect!";
        checkModalQuestion.innerText = question;
        checkModalInputAnswer.innerHTML = `<span style="color:#00c9ff">Your answer: </span>` + inputAnswer;
        checkModalAnswer.innerHTML += `<span style="color:#2FEB00">Correct answer: </span>` + answer;
        checkModalValue.innerText = value;
        checkIssue.innerText = "Think there is an issue? To override this, click the button 👉";
        checkIssueButton.classList.remove('hidden');
    }

    // Reset all of the passed data
    inputAnswer.value = "";
    answer.innerText = "";
    id.innerText = "";
    value.innerText = "";

    //Remove the added nodes first
    // if(checkModalInputAnswer.hasChildNodes && modalClickCounter != 0){
        // checkModalAnswer.removeChild(checkModalAnswer.firstChild);
        // checkModalAnswer.removeChild(checkModalAnswer.firstChild);
    // }
    // if(checkModalAnswer.hasChildNodes && modalClickCounter != 0){
    //     checkModalAnswer.removeChild(checkModalAnswer.firstChild);
    //     checkModalAnswer.removeChild(checkModalAnswer.firstChild);
    // }

    // Hide the card that was picked
    document.querySelector(`#card${id}`).classList.add('cardHidden');
    updateSession(id);

    // Add one to index
    index.innerText = parseInt(index.innerText) + 1;


    modalClickCounter += 1;
    console.log(modalClickCounter);
})

document.querySelector('#modalClose').addEventListener('click', (e) => {

    e.preventDefault();
    $('#exampleModal').modal('hide');

})

document.querySelector('#checkModalClose').addEventListener('click', (e) => {

    e.preventDefault();

    document.querySelector('#checkModalTitle').innerText = "";
    document.querySelector('#checkModalQuestion').innerText = "";
    document.querySelector('#checkModalAnswer').innerText = "";
    document.querySelector('#checkModalInputAnswer').innerText = "";
    document.querySelector('#checkModalValue').innerText = "";

    // Remove the issue text and hide the button if needed
    document.querySelector('#checkIssue').innerText = "";
    if(!document.querySelector('#checkIssueButton').classList.contains('hidden'))
        document.querySelector('#checkIssueButton').classList.add('hidden');

    document.querySelector('#aInput').value = "";

    $('#checkModal').modal('hide');

    // If at the end of the game, call the endgame function
    let cardCount = parseInt(document.querySelector('#cardCount').innerText);
    if(parseInt(index.innerText) === cardCount) {

        // End the game, pass the score in
        endGame(parseInt(document.querySelector('#score').innerText));
    }

})

document.querySelector('#checkIssueButton').addEventListener('click', (e) => {
    e.preventDefault();

    document.querySelector('#checkModalTitle').innerText = "";
    document.querySelector('#checkModalQuestion').innerText = "";
    document.querySelector('#checkModalAnswer').innerText = "";
    document.querySelector('#checkModalInputAnswer').innerText = "";

    // Remove the issue text and hide the button if needed
    document.querySelector('#checkIssue').innerText = "";
    if(!document.querySelector('#checkIssueButton').classList.contains('hidden'))
        document.querySelector('#checkIssueButton').classList.add('hidden');

    let value = document.querySelector('#checkModalValue').innerText.trim();
    document.querySelector('#checkModalValue').innerText = "";
    document.querySelector('#aInput').value = "";

    // Overwriting score if correct answer
    document.querySelector('#score').innerText = parseInt(document.querySelector('#score').innerText) + parseInt(value);
    updateScore(parseInt(document.querySelector('#score').innerText));

    $('#checkModal').modal('hide');

    // If at the end of the game, call endgame function
    let cardCount = parseInt(document.querySelector('#cardCount').innerText);
    if(parseInt(index.innerText) === cardCount) {

        // End the game, pass the score in
        endGame(parseInt(document.querySelector('#score').innerText));
    }
})

function endGame(score) {
    // Show the end game modal
    $('#endModal').modal('show');

    // Update the values for the modal
    document.querySelector('#endModalScore').innerText = "Score: " + score;
}

// Function to update set in session (to prevent refresh from taking away data)
async function updateSession(cardID) {

    // Send an update to server file 
    await fetch('/updateSet', {
        headers: {'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify({cardID: cardID})
    })
}

async function updateScore(score) {

    // Send an update to server file 
    await fetch('/updateScore', {
        headers: {'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify({score: score})
    })
}

