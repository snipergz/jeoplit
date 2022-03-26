index = document.querySelector('#index');
boxes = document.querySelectorAll('.question-box');
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

    // Hide the modal
    $('#exampleModal').modal('hide');

    if (inputAnswer == answer) {

        // Updating score if correct answer
        document.querySelector('#score').innerText = parseInt(document.querySelector('#score').innerText) + parseInt(value);

        // Show the check answer modal
        $('#checkModal').modal('show');

        document.querySelector('#checkModalTitle').innerText = "Correct!";
        document.querySelector('#checkModalQuestion').innerText = "Question: " + question;
        document.querySelector('#checkModalInputAnswer').innerText = "Your answer: " + inputAnswer;
        document.querySelector('#checkModalAnswer').innerText = "Correct answer: " + answer;
    }
    else {

        // Show the check answer modal
        $('#checkModal').modal('show');

        document.querySelector('#checkModalTitle').innerText = "Incorrect!";
        document.querySelector('#checkModalQuestion').innerText = "Question: " + question;
        document.querySelector('#checkModalInputAnswer').innerText = "Your answer: " + inputAnswer;
        document.querySelector('#checkModalAnswer').innerText = "Correct answer: " + answer;
        document.querySelector('#checkModalValue').innerText = value;
        document.querySelector('#checkIssue').innerText = "Think there is an issue? To override this, click the button below";
        document.querySelector('#checkIssueButton').classList.remove('hidden');
    }

    // Reset all of the passed data
    document.querySelector('#aInput').value = "";
    document.querySelector('#modalAnswer').innerText = "";
    document.querySelector('#modalId').innerText = "";
    document.querySelector('#modalValue').innerText = "";

    // Hide the card that was picked
    document.querySelector(`#card${id}`).classList.add('cardHidden');

    // Add one to index
    index.innerText = parseInt(index.innerText) + 1;

    let cardCount = parseInt(document.querySelector('#cardCount').innerText);
    if(parseInt(index.innerText) === cardCount) {

        // End the game, pass the score in
        endGame(parseInt(document.querySelector('#score').innerText));
    }
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

    $('#checkModal').modal('hide');

})

document.querySelector('#checkIssueButton').addEventListener('click', (e) => {
    e.preventDefault();

    let value = document.querySelector('#checkModalValue').innerText.trim();

    // Overwriting score if correct answer
    document.querySelector('#score').innerText = parseInt(document.querySelector('#score').innerText) + parseInt(value);
    $('#checkModal').modal('hide');
})

function endGame(score) {
    // Show the end game modal
    $('#endModal').modal('show');

    // Update the values for the modal
    document.querySelector('#endModalScore').innerText = "Score: " + score;
}

document.querySelector('#yesButton').addEventListener('click', (e) => {
    e.preventDefault();

    // Rerender with same questions

})

document.querySelector('#noButton').addEventListener('click', (e) => {
    e.preventDefault();

    // Render home page
})