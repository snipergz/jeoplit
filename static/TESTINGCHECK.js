function displayX(pair) {
    if (pair.querySelector(".xButton").classList.contains('hidden'))
        pair.querySelector(".xButton").classList.remove('hidden');
}

function hideX(pair) {
    if (!pair.querySelector(".xButton").classList.contains('hidden'))
        pair.querySelector(".xButton").classList.add('hidden');
}

function deletePair(pair) {
    pair.parentNode.remove();
}

document.querySelector('#confirmationButton').addEventListener('click', async function() {
    let questions = document.querySelectorAll('.question');
    let answers = document.querySelectorAll('.answer');

    let questionArr = [];
    let answerArr = [];

    questions.forEach(question => questionArr.push(question.innerText));
    answers.forEach(answer => answerArr.push(answer.innerText));

    await fetch('/testingWithNewSet', {
        headers: {'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify({questions: questionArr, answers: answerArr})
    }).then(async (res) => {
        window.location.assign('/testingPlay');
    }).catch(async (res) => {
        window.location.assign('/returnHome');
    })

}); 