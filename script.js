const itemsArea = document.getElementById('items-area');
const claw = document.getElementById('claw-body');
const targetText = document.getElementById('target-answer');
const scoreText = document.getElementById('score');
const timerText = document.getElementById('timer');
const gameOverOverlay = document.getElementById('game-over-overlay');
const winOverlay = document.getElementById('win-overlay');
const finalScoreText = document.getElementById('final-score');

let playerName = "";
let clawX = 225;
let score = 0;
let timeLeft = 90; 
let isDropping = false;
let isGameOver = false;
let gameTimer = null;
let currentCorrectAnswer = "";
let availableQuestions = [];

const antiFraudPool = [
    { q: "消費者服務專線的電話是？", options: ["📞 1950", "📞 110", "📞 119", "📞 123"], a: "📞 1950" },
    { q: "以下哪些是常見的詐騙手法？", options: ["💌 網路交友", "📈 假投資", "✅ 以上皆是", "🎁 領點數"], a: "✅ 以上皆是" },
    { q: "收到自稱檢察官電話說要監管帳戶？", options: ["☎️ 撥打 165", "💰 匯款給他", "🏦 操作 ATM"], a: "☎️ 撥打 165" },
    { q: "賄選檢舉專線為", options: ["📞 0800-024-099#4", "📞 113", "📞 2882-5252", "📞 119"], a: "📞 0800-024-099#4" },
    { q: "公務員赴大陸事後返臺上班多久內應填寫「返臺通報表」？", options: ["一星期內", "不用填(ﾟ∀。)", "一年後", "一年內"], a: "一星期內" },
    { q: "透明晶質獎的哪個機關辦理的？", options: ["法務部廉政署", "數發部", "文山區公所", "體育部"], a: "法務部廉政署" },
    { q: "透明晶質獎舉辦目的是？", options: ["推動廉能治理", "激勵行政團隊", "樹立標竿學習", "以上皆是"], a: "以上皆是" },
    { q: "依規定，公務員收受與職務有利害關係者之餽贈，市價在多少以下為例外？", options: ["新臺幣200元", "新臺幣1000元", "辛巴威幣500000元", "新臺幣2000元"], a: "新臺幣200元" },
    { q: "電腦開機密碼時常忘記，所以最好都不要換比較好？", options: ["對，我就懶(^y^)", "定期更換，公務機密人人有責", "看我心情(´ー`)"], a: "定期更換，公務機密人人有責" },
    { q: "公益揭弊者保護法中所稱的「揭弊的人」是指？", options: ["政府機關（構）之人", "國營事業之人", "受政府控制之事業團體之人", "以上皆是"], a: "以上皆是" }
    { q: "這個遊戲是誰嘔心瀝血自製的？", options: ["文!山!區!公!所!政!風!室!"], a: "文!山!區!公!所!政!風!室!" }
];

/* --- 控制功能 --- */

function moveLeft() {
    if (!isDropping && !isGameOver && playerName) {
        if (clawX > 30) { clawX -= 30; claw.style.left = clawX + 'px'; }
    }
}

function moveRight() {
    if (!isDropping && !isGameOver && playerName) {
        if (clawX < 420) { clawX += 30; claw.style.left = clawX + 'px'; }
    }
}

function dropClaw() {
    if (isDropping || isGameOver || !playerName) return;
    isDropping = true;
    const items = document.querySelectorAll('.item');
    const maxDropDepth = 280; 
    let caughtItem = null;
    let highestY = 999;

    items.forEach(item => {
        const itemCenterX = item.offsetLeft + (item.offsetWidth / 2);
        if (Math.abs(clawX + 25 - itemCenterX) < 45) {
            if (item.offsetTop < highestY) { highestY = item.offsetTop; caughtItem = item; }
        }
    });

    const stopDepth = caughtItem ? (highestY - 5) : maxDropDepth;
    claw.style.top = stopDepth + "px";

    setTimeout(() => {
        if (caughtItem) {
            caughtItem.style.transition = "top 0.7s";
            caughtItem.style.bottom = "auto";
            caughtItem.style.top = (stopDepth + 30) + "px";
            setTimeout(() => {
                caughtItem.style.top = "-100px";
                if (caughtItem.innerText === currentCorrectAnswer) {
                    score += 10;
                    scoreText.innerText = score;
                    if (score >= 100) winGame();
                    else { timeLeft += 5; timerText.innerText = timeLeft; setTimeout(initGame, 500); }
                } else {
                    alert("❌ 答錯了！");
                    caughtItem.remove();
                }
            }, 100);
        }
        claw.style.top = "0px";
        setTimeout(() => isDropping = false, 700);
    }, 750);
}

// 💡 新增：更換選項位置 (不換題)
function shufflePositions() {
    if (isDropping || isGameOver || !playerName) return;
    const items = document.querySelectorAll('.item');
    if (items.length === 0) return;

    const sectors = [
        { minX: 20,  maxX: 140, minY: 110, maxY: 160 },
        { minX: 260, maxX: 380, minY: 110, maxY: 160 },
        { minX: 20,  maxX: 140, minY: 20,  maxY: 70  },
        { minX: 260, maxX: 380, minY: 20,  maxY: 70  }
    ];

    const shuffledSectors = sectors.sort(() => Math.random() - 0.5);
    const placedItems = [];

    items.forEach((item, index) => {
        const sector = shuffledSectors[index] || { minX: 50, maxX: 350, minY: 20, maxY: 150 };
        let randomLeft, randomBottom, attempts = 0;
        let isTooClose;

        do {
            isTooClose = false;
            randomLeft = Math.floor(Math.random() * (sector.maxX - sector.minX)) + sector.minX;
            randomBottom = Math.floor(Math.random() * (sector.maxY - sector.minY)) + sector.minY;

            for (let other of placedItems) {
                if (Math.abs(randomLeft - other.left) < 180 && Math.abs(randomBottom - other.bottom) < 80) {
                    isTooClose = true;
                    break;
                }
            }
            attempts++;
        } while (isTooClose && attempts < 400);

        placedItems.push({ left: randomLeft, bottom: randomBottom });
        
        // 加入過場動畫效果
        item.style.transition = "all 0.4s ease-out";
        item.style.left = randomLeft + 'px';
        item.style.bottom = randomBottom + 'px';
        
        // 動畫結束後恢復，避免干擾抓取邏輯
        setTimeout(() => { item.style.transition = ""; }, 400);
    });
}

// 💡 新增：跳下一題
function skipQuestion() {
    if (isDropping || isGameOver || !playerName) return;
    initGame();
}

/* --- 遊戲核心流程 --- */

window.onload = function() {
    document.getElementById('start-btn').onclick = startGameWithLogin;
    document.getElementById('btn-left').onclick = moveLeft;
    document.getElementById('btn-right').onclick = moveRight;
    document.getElementById('btn-drop').onclick = dropClaw;

    document.addEventListener('keydown', function(e) {
        if (document.activeElement.tagName === 'INPUT') return;
        if (isGameOver || !playerName) return;
        if (e.code === 'ArrowLeft') moveLeft();
        if (e.code === 'ArrowRight') moveRight();
        if (e.code === 'Space') { e.preventDefault(); dropClaw(); }
    });
};

function startGameWithLogin() {
    const input = document.getElementById('player-name');
    if (!input.value.trim()) return alert("請輸入姓名！");
    playerName = input.value;
    document.getElementById('user-display').innerText = "挑戰者：" + playerName;
    document.getElementById('login-overlay').style.display = 'none';
    restartGame();
}

function restartGame() {
    score = 0; timeLeft = 90; isGameOver = false; isDropping = false; clawX = 225;
    availableQuestions = [...antiFraudPool];
    scoreText.innerText = "0";
    timerText.innerText = "90";
    claw.style.left = "225px"; claw.style.top = "0px";
    gameOverOverlay.style.display = 'none';
    winOverlay.style.display = 'none';
    initGame();
    startTimer();
}

function startTimer() {
    clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        if (!isGameOver) {
            timeLeft--;
            timerText.innerText = timeLeft;
            if (timeLeft <= 0) endGame();
        }
    }, 1000);
}

function initGame() {
    itemsArea.innerHTML = '';
    if (availableQuestions.length === 0) availableQuestions = [...antiFraudPool];
    
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const currentLevel = availableQuestions[randomIndex];
    availableQuestions.splice(randomIndex, 1); 
    
    targetText.innerText = currentLevel.q;
    currentCorrectAnswer = currentLevel.a;

    const sectors = [
        { minX: 20,  maxX: 140, minY: 110, maxY: 160 },
        { minX: 260, maxX: 380, minY: 110, maxY: 160 },
        { minX: 20,  maxX: 140, minY: 20,  maxY: 70  },
        { minX: 260, maxX: 380, minY: 20,  maxY: 70  }
    ];

    const shuffledSectors = sectors.sort(() => Math.random() - 0.5);
    const placedItems = [];

    currentLevel.options.forEach((text, index) => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerText = text;
        itemsArea.appendChild(item);

        const sector = shuffledSectors[index] || { minX: 50, maxX: 350, minY: 20, maxY: 150 };
        let randomLeft, randomBottom, attempts = 0;
        let isTooClose;

        do {
            isTooClose = false;
            randomLeft = Math.floor(Math.random() * (sector.maxX - sector.minX)) + sector.minX;
            randomBottom = Math.floor(Math.random() * (sector.maxY - sector.minY)) + sector.minY;

            for (let other of placedItems) {
                if (Math.abs(randomLeft - other.left) < 180 && Math.abs(randomBottom - other.bottom) < 80) {
                    isTooClose = true;
                    break;
                }
            }
            attempts++;
        } while (isTooClose && attempts < 400);

        placedItems.push({ left: randomLeft, bottom: randomBottom });
        item.style.left = randomLeft + 'px';
        item.style.bottom = randomBottom + 'px';
    });
}

function endGame() { isGameOver = true; clearInterval(gameTimer); gameOverOverlay.style.display = 'flex'; finalScoreText.innerText = score; }
function winGame() { isGameOver = true; clearInterval(gameTimer); winOverlay.style.display = 'flex'; }
function confirmReset() { if (confirm("確定重新開始？")) restartGame(); }
