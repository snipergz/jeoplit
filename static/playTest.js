index = document.querySelector('#index');
boxes = document.querySelectorAll('.question-box');
boxes.forEach(box => box.addEventListener('click', () => {
    $("#exampleModal").modal('show')
    console.log(index.innerText);
    index.innerText = parseInt(index.innerText) + 1;
}));