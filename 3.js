let p3 = parseFloat(localStorage.getItem('p3'));
let pg3 = parseFloat(localStorage.getItem('pg3'));
if (isNaN(p3)) p3 = 1.0;
if (isNaN(pg3)) pg3 = 0.0;
const pDisplay = document.getElementById('p-display');
const pgDisplay = document.getElementById('pg-display');
setInterval(function() {
    p3 += (pg3 / 20); 
    saveData(); 
}, 50);
setInterval(function() {
    pDisplay.textContent = p3.toFixed(1);
    pgDisplay.textContent = pg3;
}, 33);
function upgradePg() {
    if (p3 < 1) {
        alert("Needs More Points.");
        return;
    }

    p3 -= 1;
    pg3 += 1;
    saveData();
}
function saveData() {
    localStorage.setItem('p3', p3);
    localStorage.setItem('pg3', pg3);
}
