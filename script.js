let playerName = "";
let clawX = 225;
let score = 0;
let timeLeft = 90;
let isDropping = false;
let isGameOver = false;
let currentCorrectAnswer = "";
const itemsArea = document.getElementById('items-area');
const claw = document.getElementById('claw-body');

const questions = [
   { q: "消費者服務專線的電話是？", options: ["📞 1950", "📞 110", "📞 119", "📞 123"], a: "📞 1950" },
    { q: "以下哪些是常見的詐騙手法？", options: ["💌 網路交友", "📈 假投資", "✅ 以上皆是", "🎁 領點數"], a: "✅ 以上皆是" },
    { q: "收到自稱檢察官電話說要監管帳戶？", options: ["☎️ 撥打 165", "💰 匯款給他", "🏦 操作 ATM"], a: "☎️ 撥打 165" },
    { q: "賄選檢舉專線為", options: ["📞 0800-024-099#4", "📞 113", "📞 2882-5252", "📞 119"], a: "📞 0800-024-099#4" },
    { q: "公務員赴大陸事後返臺上班多久內應填寫「返臺通報表」？", options: ["一星期內", "不用填(ﾟ∀。)", "一年後", "一年內"], a: "一星期內" },
    { q: "透明晶質獎的執行機關是？", options: ["廉政署", "數發部", "文山區公所", "體育部"], a: "廉政署" },
    { q: "透明晶質獎舉辦目的是？", options: ["推動廉能治理", "激勵行政團隊", "樹立標竿學習", "以上皆是"], a: "以上皆是" },
    { q: "依規定，公務員收受與職務有利害關係者之餽贈，市價在多少以下為例外？", options: ["新臺幣200元", "新臺幣1000元", "辛巴威幣500000元", "新臺幣2000元"], a: "新臺幣200元" },
    { q: "電腦開機密碼時常忘記，所以最好都不要換比較好？", options: ["對，我就懶(^y^)", "定期更換，公務機密人人有責", "看我心情(´ー`)"], a: "定期更換，公務機密人人有責" },
    { q: "公益揭弊者保護法的「揭弊的人」保護對象為？", options: ["政府機關（構）", "國營事業", "受政府控制之事業團體", "以上皆是"], a: "以上皆是" }
];
];

window.onload = function() {
    // 登入按鈕綁定
    document.getElementById('start-btn').onclick = function() {
        const input = document.getElementById('player-name').value;
        if(!input.trim()) return alert("請輸入姓名！");
        playerName = input;
        document.getElementById('user-display').innerText = "挑戰者：" + playerName;
        document.getElementById('login-overlay').style.display = 'none';
        initGame();
        startTimer();
    };

    // 手機按鈕綁定
    document.getElementById('btn-left').onclick = moveLeft;
    document.getElementById('btn-right').onclick = moveRight;
    document.getElementById('btn-drop').onclick = dropClaw;

    // 鍵盤監聽
    document.addEventListener('keydown', (e) => {
        if(isGameOver || !playerName || document.activeElement.tagName === 'INPUT') return;
        if(e.code === 'ArrowLeft') moveLeft();
        if(e.code === 'ArrowRight') moveRight();
        if(e.code === 'Space') { e.preventDefault(); dropClaw(); }
    });
};

function moveLeft() { if(!isDropping && clawX > 20) { clawX -= 30; claw.style.left = clawX + 'px'; } }
function moveRight() { if(!isDropping && clawX < 430) { clawX += 30; claw.style.left = clawX + 'px'; } }

function initGame() {
    itemsArea.innerHTML = '';
    const qData = questions[Math.floor(Math.random() * questions.length)];
    document.getElementById('target-answer').innerText = qData.q;
    currentCorrectAnswer = qData.a;
    const placed = [];

    qData.options.forEach(text => {
        const item = document.createElement('div');
        item.className = 'item'; item.innerText = text;
        itemsArea.appendChild(item);

        let x, y, overlap, attempts = 0;
        do {
            overlap = false;
            x = Math.floor(Math.random() * (itemsArea.offsetWidth - 110)) + 10;
            y = Math.floor(Math.random() * 120) + 30;
            // 防重疊判定
            for(let p of placed) {
                if(Math.abs(x - p.x) < 120 && Math.abs(y - p.y) < 60) overlap = true;
            }
            attempts++;
        } while(overlap && attempts < 100);

        placed.push({x, y});
        item.style.left = x + 'px'; item.style.bottom = y + 'px';
    });
}

function dropClaw() {
    if(isDropping || isGameOver) return;
    isDropping = true;
    const items = document.querySelectorAll('.item');
    let target = null;
    items.forEach(it => {
        const centerX = it.offsetLeft + (it.offsetWidth/2);
        if(Math.abs(clawX + 25 - centerX) < 45) target = it;
    });

    const depth = target ? (target.offsetTop - 5) : 280;
    claw.style.top = depth + "px";

    setTimeout(() => {
        if(target) {
            target.style.transition = "top 0.7s"; target.style.bottom = "auto";
            target.style.top = (depth + 30) + "px";
            setTimeout(() => {
                target.style.top = "-100px";
                if(target.innerText === currentCorrectAnswer) {
                    score += 10; document.getElementById('score').innerText = score;
                    if(score >= 100) { isGameOver = true; alert("🏆 恭喜破關！"); }
                    else { setTimeout(initGame, 500); }
                } else { alert("❌ 答錯了！"); target.remove(); }
            }, 100);
        }
        claw.style.top = "0px";
        setTimeout(() => isDropping = false, 700);
    }, 750);
}

function startTimer() {
    const timer = setInterval(() => {
        if(!isGameOver) {
            timeLeft--; document.getElementById('timer').innerText = timeLeft;
            if(timeLeft <= 0) {
                clearInterval(timer); isGameOver = true;
                document.getElementById('final-score').innerText = score;
                document.getElementById('game-over-overlay').style.display = 'flex';
            }
        }
    }, 1000);
}
