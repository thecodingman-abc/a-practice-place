let p = parseInt(localStorage.getItem('p')) || 0;
const resultDisplay = document.getElementById('result');
resultDisplay.textContent = p;
function increaseAndSave() {
    p += 1;
    resultDisplay.textContent = p;
    localStorage.setItem('p', p);
}
