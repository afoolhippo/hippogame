// ===== 状態 =====
let mashCount = 0;
let timeLeft = 5;
let countdown = 3;

let phase = "intro"; // intro → select → explain → countdown → play → result

const TARGET_COUNT = 20;

// ===== 鍵 =====
let hasKey = false;

// ===== 画像 =====
const enemyImg = new Image();
enemyImg.src = "assets/nurarihyon.png";

// ===== SE =====
const sePush = new Audio("assets/push.mp3");
const seWin  = new Audio("assets/win.mp3");
const seLose = new Audio("assets/lose.mp3");
const seCount = new Audio("assets/count.mp3");

[sePush, seWin, seLose, seCount].forEach(a=>a.volume=0.6);

// ===== 開始 =====
function startMiniGame(){
  gameState = "minigame";
  phase = "intro";

  talkBtn.textContent = "決定";
  stopBtn.textContent = "逃げる";
}

// ===== 決定ボタン =====
talkBtn.onclick = () => {

  if(gameState !== "minigame") return;

  if(phase === "intro"){
    phase = "select";
    return;
  }

  if(phase === "select"){
    phase = "explain";
    return;
  }

  if(phase === "explain"){
    phase = "countdown";
    countdown = 3;
    return;
  }

  if(phase === "result_win" || phase === "result_lose"){
    endMiniGame();
  }
};

// ===== 逃げるボタン =====
stopBtn.onclick = () => {

  if(gameState === "minigame"){
    endMiniGame();
    return;
  }

  // 通常のBGM停止
  stopAllMusic();
};

// ===== 連打（画面タップ） =====
canvas.addEventListener("pointerdown", () => {
  if(gameState !== "minigame") return;
  if(phase !== "play") return;

  mashCount++;

  sePush.currentTime = 0;
  sePush.play().catch(()=>{});
});

// ===== 更新 =====
function updateMiniGame(){

  if(gameState !== "minigame") return;

  if(phase === "countdown"){
    countdown -= 1/60;

    if(Math.floor(countdown) !== Math.floor(countdown + 1/60)){
      seCount.currentTime = 0;
      seCount.play().catch(()=>{});
    }

    if(countdown <= 0){
      phase = "play";
      mashCount = 0;
      timeLeft = 5;
    }
  }

  if(phase === "play"){
    timeLeft -= 1/60;

    if(timeLeft <= 0){

      if(mashCount >= TARGET_COUNT){
        phase = "result_win";
        hasKey = true;
        seWin.play().catch(()=>{});
      }else{
        phase = "result_lose";
        seLose.play().catch(()=>{});
      }
    }
  }
}

// ===== 終了 =====
function endMiniGame(){
  gameState = "field";

  talkBtn.textContent = "話す";
  stopBtn.textContent = "BGM停止";
}

// ===== 描画 =====
function drawMiniGame(){

  if(gameState !== "minigame") return;

  ctx.fillStyle = "white";
  ctx.fillRect(0,0,BASE_W,BASE_H);

  ctx.fillStyle = "black";
  ctx.font = "16px sans-serif";

  // 敵（上部）
  ctx.drawImage(enemyImg, BASE_W/2 - 60, 20, 120, 120);

  if(phase === "intro"){
    ctx.fillText("ぬらりひょんがあらわれた！", 40, 180);
  }

  if(phase === "select"){
    ctx.fillText("戦う？（決定） 逃げる（BGM停止）", 20, 180);
  }

  if(phase === "explain"){
    ctx.fillText("5秒で20回タップ！", 60, 180);
  }

  if(phase === "countdown"){
    ctx.font = "30px sans-serif";
    ctx.fillText(Math.ceil(countdown), BASE_W/2 - 10, 200);
  }

  if(phase === "play"){
    ctx.fillText("連打しろ！", 110, 160);

    let ratio = timeLeft / 5;

    ctx.fillRect(60, 220, 200, 10);
    ctx.fillStyle = "gray";
    ctx.fillRect(60, 220, 200 * ratio, 10);

    ctx.fillStyle = "black";
    ctx.fillText(`${mashCount}/20`, 130, 250);
  }

  if(phase === "result_win"){
    ctx.fillText("鍵ゲット！", 120, 200);
  }

  if(phase === "result_lose"){
    ctx.fillText("ゲームオーバー", 100, 200);
  }
}