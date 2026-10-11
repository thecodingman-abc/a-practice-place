const INFINITY = 1.7976931348623157e308;
const BASE_COSTS = { 1: 10, 2: 100, 3: 10000, 4: 1000000, 5: 1e9, 6: 1e13, 7: 1e18, 8: 1e24 };
const COST_MULT_PER_10 = { 1: 1000, 2: 10000, 3: 100000, 4: 1000000, 5: 1e8, 6: 1e10, 7: 1e12, 8: 1e15 };

let gameState = {};

const AUTOBUYER_DEFS = {
    1: { name: "1차원 자동화", cost: 1e40, type: "dim" },
    2: { name: "2차원 자동화", cost: 1e50, type: "dim" },
    3: { name: "3차원 자동화", cost: 1e60, type: "dim" },
    4: { name: "4차원 자동화", cost: 1e70, type: "dim" },
    5: { name: "5차원 자동화", cost: 1e80, type: "dim" },
    6: { name: "6차원 자동화", cost: 1e90, type: "dim" },
    7: { name: "7차원 자동화", cost: 1e100, type: "dim" },
    8: { name: "8차원 자동화", cost: 1e110, type: "dim" },
    "tick": { name: "틱스피드 자동화", cost: 1e140, type: "tick" }
};

function initGame() {
    gameState = {
        antimatter: 10,
        tickspeed: 1000,
        tickspeedCost: 10,
        tickspeedBought: 0,
        dimBoosts: 0,
        galaxies: 0,
        dimensions: {},
        autobuyers: {
            1: { unlocked: false, active: false },
            2: { unlocked: false, active: false },
            3: { unlocked: false, active: false },
            4: { unlocked: false, active: false },
            5: { unlocked: false, active: false },
            6: { unlocked: false, active: false },
            7: { unlocked: false, active: false },
            8: { unlocked: false, active: false },
            "tick": { unlocked: false, active: false }
        }
    };

    for (let i = 1; i <= 8; i++) {
        gameState.dimensions[i] = { amount: 0, bought: 0, cost: BASE_COSTS[i], multiplier: 1 };
    }
}

function format(value) {
    if (value >= INFINITY) return "Infinity";
    if (value < 100000) return value.toFixed(1);
    let exponent = Math.floor(Math.log10(value));
    let mantissa = value / Math.pow(10, exponent);
    return `${mantissa.toFixed(2)}e${exponent}`;
}

function getMaxUnlockedDim() {
    return Math.min(4 + gameState.dimBoosts, 8);
}

function getBoostRequirement() {
    let maxDim = getMaxUnlockedDim();
    if (maxDim < 8) {
        return { dim: maxDim, amount: 20 };
    } else {
        let base8Boosts = Math.max(0, gameState.dimBoosts - 4);
        return { dim: 8, amount: 20 + base8Boosts * 15 };
    }
}

function getGalaxyRequirement() {
    return 80 + gameState.galaxies * 60;
}

function getTickspeedMultiplier() {
    let baseBonusRate = 0.125 + (gameState.galaxies * 0.02);
    return 1 / (1 + baseBonusRate);
}

function buyDimension(dimNum) {
    let dim = gameState.dimensions[dimNum];
    if (gameState.antimatter >= dim.cost && dimNum <= getMaxUnlockedDim()) {
        gameState.antimatter -= dim.cost;
        dim.amount += 1;
        dim.bought += 1;
        if (dim.bought % 10 === 0) {
            dim.cost *= COST_MULT_PER_10[dimNum];
            dim.multiplier *= 2;
        }
        return true;
    }
    return false;
}

function buyTickspeed() {
    if (gameState.antimatter >= gameState.tickspeedCost) {
        gameState.antimatter -= gameState.tickspeedCost;
        gameState.tickspeedBought += 1;
        gameState.tickspeedCost *= 10;
        gameState.tickspeed *= getTickspeedMultiplier();
        return true;
    }
    return false;
}

// [신규] M키 입력 또는 자동구매기용 일괄 최대 구매(Max All) 핵심 함수
function buyMaxAll() {
    if (gameState.antimatter >= INFINITY) return;

    let boughtAnything = true;
    // 살 수 있는 자원이 있고, 구매가 하나라도 일어나는 동안 무한 루프 수행 (개수 제한 없음)
    while (boughtAnything) {
        boughtAnything = false;

        // 틱스피드 먼저 가능한 만큼 구매
        if (buyTickspeed()) {
            boughtAnything = true;
        }

        // 해금된 차원들을 1차원부터 순서대로 구매 가능한 만큼 구매
        let maxDim = getMaxUnlockedDim();
        for (let i = 1; i <= maxDim; i++) {
            if (buyDimension(i)) {
                boughtAnything = true;
            }
        }
    }
    updateUI();
}

// [신규] 키보드 M 키 입력 감지 리스너 추가
window.addEventListener('keydown', function(event) {
    // 사용자가 'm' 또는 'M' 키를 눌렀을 때 실행
    if (event.key === 'm' || event.key === 'M') {
        buyMaxAll();
    }
});

function doDimensionBoost() {
    let req = getBoostRequirement();
    if (gameState.dimensions[req.dim].amount >= req.amount) {
        gameState.dimBoosts += 1;
        let savedAutobuyers = gameState.autobuyers;
        
        gameState.antimatter = 10;
        gameState.tickspeed = 1000;
        gameState.tickspeedCost = 10;
        gameState.tickspeedBought = 0;
        gameState.autobuyers = savedAutobuyers;
        
        for (let i = 1; i <= 8; i++) {
            gameState.dimensions[i].amount = 0;
            gameState.dimensions[i].bought = 0;
            gameState.dimensions[i].cost = BASE_COSTS[i];
            if (gameState.dimBoosts >= i || gameState.dimBoosts >= 8) {
                gameState.dimensions[i].multiplier = Math.pow(2, gameState.dimBoosts - i + 1);
            } else {
                gameState.dimensions[i].multiplier = 1;
            }
        }
        updateUI();
    }
}

function doGalaxy() {
    let reqAmount = getGalaxyRequirement();
    if (getMaxUnlockedDim() === 8 && gameState.dimensions.amount >= reqAmount) {
        gameState.galaxies += 1;
        let savedAutobuyers = gameState.autobuyers;
        let savedGalaxies = gameState.galaxies;
        
        initGame(); 
        gameState.autobuyers = savedAutobuyers;
        gameState.galaxies = savedGalaxies;
        updateUI();
    }
}

function unlockAutobuyer(id) {
    let def = AUTOBUYER_DEFS[id];
    if (gameState.antimatter >= def.cost && !gameState.autobuyers[id].unlocked) {
        gameState.antimatter -= def.cost;
        gameState.autobuyers[id].unlocked = true;
        renderAutobuyerDOM();
        updateUI();
    }
}

function toggleAutobuyer(id) {
    if (gameState.autobuyers[id].unlocked) {
        gameState.autobuyers[id].active = !gameState.autobuyers[id].active;
        let btn = document.getElementById(`auto-btn-${id}`);
        if (gameState.autobuyers[id].active) {
            btn.textContent = "ON";
            btn.classList.add('active');
        } else {
            btn.textContent = "OFF";
            btn.classList.remove('active');
        }
    }
}

function renderAutobuyerDOM() {
    let container = document.getElementById('autobuyer-zone');
    container.innerHTML = "";
    
    Object.keys(AUTOBUYER_DEFS).forEach(key => {
        let def = AUTOBUYER_DEFS[key];
        let state = gameState.autobuyers[key];
        
        let card = document.createElement('div');
        card.className = `autobuyer-card ${state.unlocked ? '' : 'locked'}`;
        
        if (state.unlocked) {
            card.innerHTML = `
                <div><strong>${def.name}</strong></div>
                <div style="font-size:11px; color:#00ffcc; margin:5px 0;">작동 상태</div>
                <button id="auto-btn-${key}" class="toggle-btn ${state.active ? 'active' : ''}" onclick="toggleAutobuyer('${key}')">${state.active ? 'ON' : 'OFF'}</button>
            `;
        } else {
            card.innerHTML = `
                <div><strong>${def.name}</strong></div>
                <div style="font-size:11px; color:#aaa; margin:5px 0;">해금비용: ${format(def.cost)}</div>
                <button id="unlock-btn-${key}" class="unlock-btn" onclick="unlockAutobuyer('${key}')">해금하기</button>
            `;
        }
        container.appendChild(card);
    });
}

// 33ms 주기 하이퍼 엔진 루프
setInterval(function() {
    let baseTimeScale = (1000 / gameState.tickspeed) * 0.033;
    let hyperTimeScale = baseTimeScale * 100; 

    // 자동구매기 작동 (활성화 시 매 틱마다 내부적으로 최대 구매 수행)
    if (gameState.antimatter < INFINITY) {
        if (gameState.autobuyers["tick"].unlocked && gameState.autobuyers["tick"].active) {
            while (buyTickspeed()) {}
        }
        for (let i = 1; i <= 8; i++) {
            if (gameState.autobuyers[i].unlocked && gameState.autobuyers[i].active) {
                while (buyDimension(i)) {}
            }
        }
    }

    // 차원 간 연쇄 생산 연산
    for (let i = 8; i > 1; i--) {
        let parentDim = gameState.dimensions[i];
        if (parentDim.amount > 0) {
            gameState.dimensions[i-1].amount += (parentDim.amount * parentDim.multiplier) * hyperTimeScale;
        }
    }

    if (gameState.dimensions.amount > 0) {
        let production = gameState.dimensions.amount * gameState.dimensions.multiplier;
        gameState.antimatter += production * hyperTimeScale;
    }

    if (gameState.antimatter >= INFINITY) {
        gameState.antimatter = INFINITY;
        document.getElementById('infinity-screen').style.display = 'flex';
    }

    updateUI();
}, 33);

function updateUI() {
    document.getElementById('antimatter').textContent = format(gameState.antimatter);
    document.getElementById('tick-display').textContent = (gameState.tickspeed / 1000).toFixed(6);
    let displayEff = 1 / getTickspeedMultiplier();
    document.getElementById('tick-mult-text').textContent = `×${displayEff.toFixed(3)}`;

    let boostReq = getBoostRequirement();
    document.getElementById('boost-req-text').textContent = `차원 가속 (${gameState.dimBoosts}회) -> 요구: ${boostReq.dim}D ${boostReq.amount}개`;
    document.getElementById('btn-boost').disabled = gameState.dimensions[boostReq.dim].amount < boostReq.amount;

    let galaxyReq = getGalaxyRequirement();
    document.getElementById('galaxy-req-text').textContent = `반물질 은하 (${gameState.galaxies}개) -> 요구: 8D ${galaxyReq}개`;
    document.getElementById('btn-galaxy').disabled = (getMaxUnlockedDim() < 8 || gameState.dimensions.amount < galaxyReq);

    let tickBtn = document.getElementById('tick-btn');
    tickBtn.textContent = `비용: ${format(gameState.tickspeedCost)}`;
    tickBtn.disabled = gameState.antimatter < gameState.tickspeedCost;

    let maxUnlocked = getMaxUnlockedDim();
    for (let i = 1; i <= 8; i++) {
        let row = document.getElementById(`row-dim${i}`);
        if (i <= maxUnlocked) {
            row.classList.remove('locked');
