index = document.querySelector('#index');
boxes = document.querySelectorAll('.question-box');
boxes.forEach(box => box.addEventListener('click', () => {
    
    let question = box.querySelector('.question').innerText;
    let answer = box.querySelector('.answer').innerText;
    let value = box.querySelector('.question-text').innerText;

    document.querySelector('#modalTitle').innerText = `For ${value} points...`;
    document.querySelector('#modalQuestion').innerText = question;
    document.querySelector('#modalAnswer').innerText = answer;
    document.querySelector('#modalValue').innerText = value;

    $("#exampleModal").modal('show')
    console.log(index.innerText);
    index.innerText = parseInt(index.innerText) + 1;
}));

document.querySelector('#modalButton').addEventListener('click', (e) => {
    e.preventDefault();
    
    let inputAnswer = document.querySelector('#aInput').value.trim();
    let answer = document.querySelector('#modalAnswer').innerText.trim();
    let value = document.querySelector('#modalValue').innerText.trim();

    console.log(answer);
    console.log(inputAnswer);

    if (inputAnswer == answer)
        console.log('right answer: ' + value + " points");
    else 
        console.log('wrong answer');
})