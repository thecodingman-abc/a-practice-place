let p = parseFloat(localStorage.getItem('p3'));
let pg = parseFloat(localStorage.getItem('pg3'));
if (isNaN(p)) p = 1.0;
if (isNaN(pg)) pg = 0.0;
const pDisplay = document.getElementById('p-display');
const pgDisplay = document.getElementById('pg-display');
setInterval(function() {
    p += (pg / 20); 
    saveData(); 
}, 50);
setInterval(function() {
    pDisplay.textContent = p.toFixed(1);
    pgDisplay.textContent = pg;
}, 33);
function upgradePg() {
    if (p <= 1) {
        alert("Needs More Points.");
        return;
    }

    p -= 1;
    pg += 1;
    saveData();
}
function saveData() {
    localStorage.setItem('p3', p);
    localStorage.setItem('pg3', pg);
}
