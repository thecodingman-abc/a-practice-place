let p3 = parseFloat(localStorage.getItem('p3')) || 1.0;
let pg3 = parseFloat(localStorage.getItem('pg3')) || 0.0;
const pDisplay = document.getElementById('p-display');
const pgDisplay = document.getElementById('pg-display');
setInterval(function() {
    p3 += (pg3 / 20);
    if (pDisplay) pDisplay.textContent = p3.toFixed(1);
    if (pgDisplay) pgDisplay.textContent = pg3.toFixed(0); // 정수 출력을 위해 toFixed(0) 권장
}, 50);
window.addEventListener('beforeunload', saveData);
setInterval(saveData, 10000);
function upgradePg() {
    const m_b = Math.floor(p3);
    if (m_b > 0) {
        p3 -= m_b;
        pg3 += m_b;
        saveData();
    }
}
function saveData() {
    localStorage.setItem('p3', p3);
    localStorage.setItem('pg3', pg3);
}
