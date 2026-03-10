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
    { q: "透明晶質獎的執行機關是？", options: ["廉政署", "數發部", "文山區公所", "體育部"], a: "廉政署" },
    { q: "透明晶質獎舉辦目的是？", options: ["推動廉能治理", "激勵行政團隊", "樹立標竿學習", "以上皆是"], a: "以上皆是" },
    { q: "依規定，公務員收受與職務有利害關係者之餽贈，市價在多少以下為例外？", options: ["新臺幣200元", "新臺幣1000元", "辛巴威幣500000元", "新臺幣2000元"], a: "新臺幣200元" },
    { q: "電腦開機密碼時常忘記，所以最好都不要換比較好？", options: ["對，我就懶(^y^)", "定期更換，公務機密人人有責", "看我心情(´ー`)"], a: "定期更換，公務機密人人有責" },
    { q: "公益揭弊者保護法中所稱的「揭弊的人」是指？", options: ["政府機關（構）之人", "國營事業之人", "受政府控制之事業團體之人", "以上皆是"], a: "以上皆是" }
];

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
    itemsArea.innerHTML = ''; // 清空上一題的選項球

    // --- 【不重複抽題核心邏輯】 ---
    // 1. 如果可用題庫空了（或是第一次執行），重新從原始題庫抽水
    if (availableQuestions.length === 0) {
        availableQuestions = [...antiFraudPool]; // 使用解構賦值複製一份全新的題庫
    }

    // 2. 隨機決定索引值
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    
    // 3. 取得該題目資料
    const currentLevel = availableQuestions[randomIndex];
    
    // 4. 【關鍵點】使用 splice 將這題從可用陣列中刪除，確保下一輪不會抽到
    availableQuestions.splice(randomIndex, 1); 
    // ----------------------------

    targetText.innerText = currentLevel.q;
    currentCorrectAnswer = currentLevel.a;

    // 定義四個不重疊的象限 (sectors)
    const sectors = [
        { minX: 20,  maxX: 150, minY: 110, maxY: 160 }, // 左上
        { minX: 260, maxX: 400, minY: 110, maxY: 160 }, // 右上
        { minX: 20,  maxX: 150, minY: 30,  maxY: 70  }, // 左下
        { minX: 260, maxX: 400, minY: 30,  maxY: 70  }  // 右下
    ];

    // 打亂象限順序，確保正確答案的位置每次都不同
    const shuffledSectors = sectors.sort(() => Math.random() - 0.5);

    currentLevel.options.forEach((text, index) => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerText = text;
        itemsArea.appendChild(item);

        // 分配象限
        const sector = shuffledSectors[index] || { minX: 50, maxX: 400, minY: 30, maxY: 150 };

        // 在象限內隨機微調一點位置，增加自然感
        const randomLeft = Math.floor(Math.random() * (sector.maxX - sector.minX)) + sector.minX;
        const randomBottom = Math.floor(Math.random() * (sector.maxY - sector.minY)) + sector.minY;

        item.style.left = randomLeft + 'px';
        item.style.bottom = randomBottom + 'px';
    });
}

function endGame() { isGameOver = true; clearInterval(gameTimer); gameOverOverlay.style.display = 'flex'; finalScoreText.innerText = score; }
function winGame() { isGameOver = true; clearInterval(gameTimer); winOverlay.style.display = 'flex'; }
function confirmReset() { if (confirm("確定重新開始？")) restartGame(); }
