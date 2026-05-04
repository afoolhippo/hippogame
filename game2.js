// ===== 状態 =====
let mashCount = 0;
let timeLeft = 5;
let displayTime = 5;
let countdown = 3;
let isCounting = false;

const TARGET_COUNT = 40;

// ===== 鍵 =====
let hasKey = false;

// ===== 画像 =====
const nurarihyonImg = new Image();
nurarihyonImg.src = "assets/nurarihyon.png";

// ===== SE =====
const sePush = new Audio("assets/push.mp3");
const seWin  = new Audio("assets/win.mp3");
const seLose = new Audio("assets/lose.mp3");
const seCount = new Audio("assets/count.mp3");

[sePush, seWin, seLose, seCount].forEach(a=>a.volume = 0.6);

// ===== UI =====
const miniUI = document.createElement("div");
miniUI.style.position = "absolute";
miniUI.style.bottom = "20px";
miniUI.style.left = "50%";
miniUI.style.transform = "translateX(-50%)";
miniUI.style.display = "none";

miniUI.innerHTML = `<button id="mashBtn">連打！！</button>`;
document.body.appendChild(miniUI);

const mashBtn = document.getElementById("mashBtn");

// ===== 開始 =====
function startMiniGame(){
  gameState = "minigame";

  mashCount = 0;
  timeLeft = 5;
  displayTime = 5;

  countdown = 3;
  isCounting = true;

  miniUI.style.display = "none";
}

// ===== カウントダウン =====
function updateCountdown(){
  if(!isCounting) return;

  countdown -= 1/60;

  if(Math.floor(countdown) !== Math.floor(countdown + 1/60)){
    seCount.currentTime = 0;
    seCount.play().catch(()=>{});
  }

  if(countdown <= 0){
    isCounting = false;
    miniUI.style.display = "block";
  }
}

// ===== 連打 =====
mashBtn.onclick = () => {
  if(gameState !== "minigame" || isCounting) return;

  mashCount++;

  sePush.currentTime = 0;
  sePush.play().catch(()=>{});
};

// ===== 終了 =====
function endMiniGame(){

  miniUI.style.display = "none";

  if(mashCount >= TARGET_COUNT){
    seWin.play().catch(()=>{});
    alert("ぬらりひょんを倒した！鍵を手に入れた！");
    hasKey = true;
  }else{
    seLose.play().catch(()=>{});
    alert("逃げられた…");
  }

  gameState = "field";
}

// ===== 更新 =====
function updateMiniGame(){

  if(gameState !== "minigame") return;

  if(isCounting){
    updateCountdown();
    return;
  }

  timeLeft -= 1/60;

  if(timeLeft <= 0){
    endMiniGame();
  }
}

// ===== 描画 =====
function drawMiniGame(){

  if(gameState !== "minigame") return;

  ctx.fillStyle = "black";
  ctx.fillRect(0,0,BASE_W,BASE_H);

  // ===== 敵画像（中央）=====
  const imgSize = 120;
  const imgX = (BASE_W - imgSize) / 2;
  const imgY = (BASE_H - imgSize) / 2 - 20;

  ctx.drawImage(nurarihyonImg, imgX, imgY, imgSize, imgSize);

  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";

  // カウントダウン
  if(isCounting){
    ctx.fillText(Math.ceil(countdown), BASE_W/2 - 5, BASE_H/2 + 40);
    return;
  }

  ctx.font = "16px sans-serif";
  ctx.fillText("ぬらりひょんを倒せ！", 60, 30);

  // ===== 時間ゲージ =====
  displayTime += (timeLeft - displayTime) * 0.2;

  let ratio = displayTime / 5;

  ctx.fillStyle = "gray";
  ctx.fillRect(60, 50, 200, 10);

  ctx.fillStyle = "cyan";
  ctx.fillRect(60, 50, 200 * ratio, 10);

  // ===== 連打ゲージ =====
  let mashRatio = mashCount / TARGET_COUNT;

  ctx.fillStyle = "gray";
  ctx.fillRect(60, 80, 200, 10);

  ctx.fillStyle = "lime";
  ctx.fillRect(60, 80, 200 * mashRatio, 10);

  ctx.fillStyle = "white";
  ctx.fillText(`連打: ${mashCount}/${TARGET_COUNT}`, 60, 110);
  ctx.fillText(`残り: ${timeLeft.toFixed(1)}秒`, 60, 130);
}