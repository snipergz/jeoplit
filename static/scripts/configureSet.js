function displayX(pair) {
    // if (pair.querySelector(".xButton").classList.contains('hidden'))
    //     pair.querySelector(".xButton").classList.remove('hidden');

    // // More code!
    // if (pair.querySelector(".flipButton").classList.contains('hidden'))
    //     pair.querySelector(".flipButton").classList.remove('hidden');

    // Testing code for sliding transition
    pair.querySelector('.xButton').style.width = "100%";
    pair.querySelector('.flipButton').style.width = "100%";
}

function hideX(pair) {

    // if (!pair.querySelector(".xButton").classList.contains('hidden'))
    //     pair.querySelector(".xButton").classList.add('hidden');

    // // More code!
    // if (!pair.querySelector(".flipButton").classList.contains('hidden'))
    //     pair.querySelector(".flipButton").classList.add('hidden');

    // Testing code for sliding transition
    pair.querySelector('.xButton').style.width = "0%";
    pair.querySelector('.flipButton').style.width = "0%";
}

function displayXTab(pair) {
    if (pair.parentNode.querySelector(".xButton").classList.contains('hidden'))
        pair.parentNode.querySelector(".xButton").classList.remove('hidden');
}

// TEST FUNCTION: 
function displayXTabTest(pair) {
    if (pair.parentNode.parentNode.parentNode.querySelector(".xButton").classList.contains('hidden'))
        pair.parentNode.parentNode.parentNode.querySelector(".xButton").classList.remove('hidden');
}

// TEST FUNCTION: 
function displayXButton(button) {
    console.log(button);
    if (button.classList.contains('hidden'))
        button.classList.remove('hidden');
}

function hideXTab(pair) {
    if (!pair.parentNode.querySelector(".xButton").classList.contains('hidden'))
        pair.parentNode.querySelector(".xButton").classList.add('hidden');
}

// TEST FUNCTION: 
function hideXTabTest(pair) {
    if (!pair.parentNode.parentNode.parentNode.querySelector(".xButton").classList.contains('hidden'))
        pair.parentNode.parentNode.parentNode.querySelector(".xButton").classList.add('hidden');
}

// TEST FUNCTION: 
function hideXButton(button) {
    if (!button.parentNode.querySelector('.xButton').classList.contains('hidden')) 
        button.parentNode.querySelector('.xButton').classList.add('hidden');

    // MORE CODE!
    if (!button.parentNode.querySelector('.flipButton').classList.contains('hidden')) 
        button.parentNode.querySelector('.flipButton').classList.add('hidden');
}

function deletePair(pair) {
    // pair.parentNode.remove();

    pair.parentNode.parentNode.remove();
}

function deletePairTab(e, pair) { 
    console.log(e);
}

// TEST CODE:
function flipQA(card) {
    questionText = card.parentNode.parentNode.querySelector('.question').innerText;
    answerText = card.parentNode.parentNode.querySelector('.answer').innerText;

    card.parentNode.parentNode.querySelector('.question').innerText = answerText;
    card.parentNode.parentNode.querySelector('.answer').innerText = questionText;
}

document.querySelector('#flipQA').addEventListener('click', function() {
    let questions = document.querySelectorAll('.question');
    let answers = document.querySelectorAll('.answer');

    let questionArr = [];
    let answerArr = [];

    questions.forEach(question => questionArr.push(question.innerText));
    answers.forEach(answer => answerArr.push(answer.innerText));

    //console.log(questionArr);
    //console.log(answerArr);

    let i = 0;
    questions.forEach(question => (function() {
        question.innerText = answerArr[i];
        i++;
    })());

    i = 0;
    answers.forEach(answer => (function() {
        answer.innerText = questionArr[i];
        i++;
    })());
})

document.querySelector('#flipQAPhone').addEventListener('click', function() {
    let questions = document.querySelectorAll('.questionPhone');
    let answers = document.querySelectorAll('.answerPhone');

    let questionArr = [];
    let answerArr = [];

    questions.forEach(question => questionArr.push(question.innerText));
    answers.forEach(answer => answerArr.push(answer.innerText));

    //console.log(questionArr);
    //console.log(answerArr);

    let i = 0;
    questions.forEach(question => (function() {
        question.innerText = answerArr[i];
        i++;
    })());

    i = 0;
    answers.forEach(answer => (function() {
        answer.innerText = questionArr[i];
        i++;
    })());
})

document.querySelector('#confirmationButton').addEventListener('click', async function() {
    let questions = document.querySelectorAll('.question');
    let answers = document.querySelectorAll('.answer');
    let setTitle = document.getElementById('setTitle').innerText;

    let questionArr = [];
    let answerArr = [];

    questions.forEach(question => questionArr.push(question.innerText));
    answers.forEach(answer => answerArr.push(answer.innerText));

    await fetch('/playWithNewSet', {
        headers: {'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify({title: setTitle, questions: questionArr, answers: answerArr})
    }).then(async (res) => {
        window.location.assign('/playSet');
    }).catch(async (res) => {
        window.location.assign('/returnHome');
    })

}); 

document.querySelector('#confirmationButtonPhone').addEventListener('click', async function() {
    let questions = document.querySelectorAll('.questionPhone');
    let answers = document.querySelectorAll('.answerPhone');
    let setTitle = document.getElementById('setTitle').innerText;

    let questionArr = [];
    let answerArr = [];

    questions.forEach(question => questionArr.push(question.innerText));
    answers.forEach(answer => answerArr.push(answer.innerText));

    await fetch('/playWithNewSet', {
        headers: {'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify({title: setTitle, questions: questionArr, answers: answerArr})
    }).then(async (res) => {
        window.location.assign('/playSet');
    }).catch(async (res) => {
        window.location.assign('/returnHome');
    })

}); 