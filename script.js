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
let timeLeft = 90; // 已調整為 90 秒
let isDropping = false;
let isGameOver = false;
let gameTimer = null;
let currentCorrectAnswer = "";
let availableQuestions = [];

// 題庫資料
const antiFraudPool = [
    { q: "消費者服務專線的電話是？", options: ["📞 1950", "📞 110", "📞 119", "📞 123"], a: "📞 1950" },
    { q: "以下哪些是常見的詐騙手法？", options: ["💌 網路交友", "📈 假投資", "✅ 以上皆是", "🎁 領點數"], a: "✅ 以上皆是" },
    { q: "收到自稱檢察官電話說要監管帳戶？", options: ["☎️ 撥打 165", "💰 匯款給他", "🏦 操作 ATM", "📱 不予理會"], a: "☎️ 撥打 165" },
    { q: "賄選檢舉專線為", options: ["📞 0800-024-099#4", "📞 113", "📞 2882-5252", "📞 119"], a: "📞 0800-024-099#4" },
    { q: "公務員赴大陸事後返臺上班多久內應填寫「返臺通報表」？", options: ["一星期內", "不用填(ﾟ∀。)", "一年後", "一年內"], a: "一星期內" },
    { q: "透明晶質獎的執行機關是？", options: ["廉政署", "數發部", "文山區公所", "體育部"], a: "廉政署" },
    { q: "透明晶質獎舉辦目的是？", options: ["推動廉能治理", "激勵行政團隊", "樹立標竿學習", "以上皆是"], a: "以上皆是" },
    { q: "依規定，公務員收受與職務有利害關係者之餽贈，市價在多少以下為例外？", options: ["新臺幣200元", "新臺幣1000元", "辛巴威幣500000元", "新臺幣2000元"], a: "新臺幣200元" },
    { q: "電腦開機密碼時常忘記，所以最好都不要換比較好？", options: ["對，我就懶(^y^)", "定期更換，公務機密人人有責", "看我心情(´ー`)"], a: "定期更換，公務機密人人有責" },
    { q: "公益揭弊者保護法的「揭弊的人」保護對象為？", options: ["政府機關（構）", "國營事業", "受政府控制之事業團體", "以上皆是"], a: "以上皆是" }
];

// 登入邏輯
function startGameWithLogin() {
    const input = document.getElementById('player-name');
    if (!input.value.trim()) return alert("請輸入姓名！");
    playerName = input.value;
    document.getElementById('user-display').innerText = "挑戰者：" + playerName;
    document.getElementById('login-overlay').style.display = 'none';
    restartGame();
}

// 重新開始遊戲
function restartGame() {
    score = 0;
    timeLeft = 90; 
    isGameOver = false;
    isDropping = false;
    clawX = 225;
    
    availableQuestions = [...antiFraudPool];
    
    scoreText.innerText = "0";
    timerText.innerText = "90";
    claw.style.left = "225px";
    claw.style.top = "0px";
    
    gameOverOverlay.style.display = 'none';
    winOverlay.style.display = 'none';
    
    initGame();
    startTimer();
}

// 計時器邏輯
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

// 初始化題目與選項位置 (防重疊演算法)
function initGame() {
    itemsArea.innerHTML = '';
    if (availableQuestions.length === 0) availableQuestions = [...antiFraudPool];
    
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const currentLevel = availableQuestions[randomIndex];
    availableQuestions.splice(randomIndex, 1);
    
    targetText.innerText = currentLevel.q;
    currentCorrectAnswer = currentLevel.a;

    const placedItems = [];
    currentLevel.options.forEach((text) => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerText = text;
        itemsArea.appendChild(item);

        let randomLeft, randomBottom, attempts = 0;
        let isOverlapping;
        
        do {
            isOverlapping = false;
            // 隨機生成位置 (適應縮小後的機台)
            randomLeft = Math.floor(Math.random() * (itemsArea.offsetWidth - 120)) + 15;
            randomBottom = Math.floor(Math.random() * 120) + 40; 

            // 檢查是否與已放置的選項重疊
            for (let other of placedItems) {
                const horizontalSpacing = 110; 
                const verticalSpacing = 55;
                if (Math.abs(randomLeft - other.left) < horizontalSpacing && 
                    Math.abs(randomBottom - other.bottom) < verticalSpacing) {
                    isOverlapping = true;
                    break;
                }
            }
            attempts++;
        } while (isOverlapping && attempts < 100);

        placedItems.push({ left: randomLeft, bottom: randomBottom });
        item.style.left = randomLeft + 'px';
        item.style.bottom = randomBottom + 'px';
    });
}

// 抓取動作
function dropClaw() {
    if (isDropping || isGameOver || !playerName) return;
    isDropping = true;
    
    const items = document.querySelectorAll('.item');
    const maxDropDepth = 280; // 適應手機版機台高度
    let caughtItem = null;
    let highestY = 999;

    // 判斷夾子下方的物體
    items.forEach(item => {
        const itemCenterX = item.offsetLeft + (item.offsetWidth / 2);
        if (Math.abs(clawX + 25 - itemCenterX) < 45) {
            if (item.offsetTop < highestY) {
                highestY = item.offsetTop;
                caughtItem = item;
            }
        }
    });

    const stopDepth = caughtItem ? (highestY - 5) : maxDropDepth;
    claw.style.top = stopDepth + "px";

    // 抓取上升邏輯
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
                    if (score >= 100) {
                        winGame();
                    } else {
                        timeLeft += 5; // 答對獎勵時間
                        timerText.innerText = timeLeft;
                        setTimeout(initGame, 500);
                    }
                } else {
                    alert("❌ 答錯了！該選項消失。");
                    caughtItem.remove();
                }
            }, 100);
        }
        
        claw.style.top = "0px";
        setTimeout(() => {
            isDropping = false;
        }, 700);
    }, 750);
}

// --- 控制邏輯：整合按鈕與鍵盤 ---

function moveLeft() {
    if (!isDropping && !isGameOver && playerName) {
        if (clawX > 20) {
            clawX -= 30;
            claw.style.left = clawX + 'px';
        }
    }
}

function moveRight() {
    if (!isDropping && !isGameOver && playerName) {
        if (clawX < 430) {
            clawX += 30;
            claw.style.left = clawX + 'px';
        }
    }
}

// 1. 綁定手機實體按鈕
document.getElementById('btn-left').onclick = moveLeft;
document.getElementById('btn-right').onclick = moveRight;
document.getElementById('btn-drop').onclick = dropClaw;

// 2. 綁定電腦鍵盤
document.addEventListener('keydown', (e) => {
    if (isGameOver || !playerName) return;
    
    switch(e.code) {
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
        case 'Space':
            e.preventDefault(); // 防止空白鍵捲動網頁
            dropClaw();
            break;
    }
});

// 遊戲結束處理
function endGame() {
    isGameOver = true;
    clearInterval(gameTimer);
    gameOverOverlay.style.display = 'flex';
    finalScoreText.innerText = score;
}

function winGame() {
    isGameOver = true;
    clearInterval(gameTimer);
    winOverlay.style.display = 'flex';
}

function confirmReset() {
    if (confirm("確定要重新開始遊戲嗎？目前的進度將會遺失。")) {
        restartGame();
    }
}
