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
    let inputAnswer = document.querySelector('#aInput').value.trim();
    let answer = document.querySelector('#modalAnswer').innerText.trim();
    let value = document.querySelector('#modalValue').innerText.trim();
    let id = document.querySelector('#modalId').innerText.trim();

    if (inputAnswer == answer) {

        // Updating score if correct answer
        document.querySelector('#score').innerText = parseInt(document.querySelector('#score').innerText) + parseInt(value);
    }
    else {
        console.log('wrong answer');
    }
    
    // Hide the modal
    $('#exampleModal').modal('hide');

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

function endGame(score) {
    // Maybe show a new modal or popup with the score and play again?
}