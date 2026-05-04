// =====================
// 基本
// =====================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const dialogBox = document.getElementById("dialogBox");
const talkBtn = document.getElementById("talkBtn");
const stopBtn = document.getElementById("stopBtn");

const BASE_W = 320;
const BASE_H = 288;
const SIZE = 48;

canvas.width = BASE_W;
canvas.height = BASE_H;

// =====================
// 状態（超重要：これだけ）
// =====================
let gameState = "field"; // field / minigame
let key = null;

let hasKey = false;

// =====================
// プレイヤー
// =====================
const player = { x: 140, y: 200 };

// =====================
// 敵（ぬらりひょん）
// =====================
const enemy = { x: 200, y: 120, w: 48, h: 48 };

// =====================
// 宝箱
// =====================
const treasure = { x: 220, y: 80, w: 48, h: 48 };

// =====================
// ミニゲーム変数
// =====================
let mashCount = 0;
let timeLeft = 5;

// =====================
// 画像
// =====================
const load = src => {
  const i = new Image();
  i.src = src;
  return i;
};

const mapImg = load("assets/map.png");
const hippo = load("assets/hippo.png");
const nurarihyon = load("assets/nurarihyon.png");
const chest = load("assets/takarabako.png");

// =====================
// 入力
// =====================
document.addEventListener("keydown", e => key = e.key);
document.addEventListener("keyup", () => key = null);

document.querySelectorAll("[data-key]").forEach(b => {
  b.onpointerdown = () => key = b.dataset.key;
  b.onpointerup = () => key = null;
});

// =====================
// 当たり判定
// =====================
function hit(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + SIZE > b.x &&
    a.y < b.y + b.h &&
    a.y + SIZE > b.y
  );
}

// =====================
// ミニゲーム開始
// =====================
function startMiniGame() {
  gameState = "minigame";
  mashCount = 0;
  timeLeft = 5;
}

// =====================
// ミニゲーム更新
// =====================
function updateMiniGame() {
  if (gameState !== "minigame") return;

  timeLeft -= 1 / 60;

  if (timeLeft <= 0) {
    if (mashCount >= 20) {
      hasKey = true;
      alert("鍵ゲット！");
    } else {
      alert("失敗！");
    }

    gameState = "field";
  }
}

// =====================
// フィールド更新
// =====================
function updateField() {
  if (key === "ArrowUp") player.y -= 2;
  if (key === "ArrowDown") player.y += 2;
  if (key === "ArrowLeft") player.x -= 2;
  if (key === "ArrowRight") player.x += 2;

  // 敵接触 → ミニゲーム
  if (hit(player, enemy)) {
    startMiniGame();
  }

  player.x = Math.max(0, Math.min(BASE_W - SIZE, player.x));
  player.y = Math.max(0, Math.min(BASE_H - SIZE, player.y));
}

// =====================
// クリック（連打）
// =====================
canvas.addEventListener("pointerdown", () => {
  if (gameState !== "minigame") return;
  mashCount++;
});

// =====================
// 描画
// =====================
function draw() {
  ctx.clearRect(0, 0, BASE_W, BASE_H);

  ctx.drawImage(mapImg, 0, 0, BASE_W, BASE_H);

  // 敵
  ctx.drawImage(nurarihyon, enemy.x, enemy.y, SIZE, SIZE);

  // 宝箱
  if (hasKey) {
    ctx.drawImage(chest, treasure.x, treasure.y, SIZE, SIZE);
  }

  // プレイヤー
  ctx.drawImage(hippo, player.x, player.y, SIZE, SIZE);
}

// =====================
// ミニゲーム描画
// =====================
function drawMiniGame() {
  if (gameState !== "minigame") return;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, BASE_W, BASE_H);

  ctx.drawImage(nurarihyon, 120, 40, 80, 80);

  ctx.fillStyle = "black";
  ctx.fillText("ぬらりひょんがあらわれた！", 60, 150);
  ctx.fillText("5秒で20回タップ！", 80, 170);

  ctx.fillText(`連打: ${mashCount}`, 120, 210);
  ctx.fillText(`残り: ${Math.ceil(timeLeft)}`, 120, 230);
}

// =====================
// ループ
// =====================
function loop() {
  if (gameState === "field") updateField();
  if (gameState === "minigame") updateMiniGame();

  draw();
  drawMiniGame();

  requestAnimationFrame(loop);
}

// =====================
// スタート
// =====================
document.getElementById("titleImage").onclick = () => {
  document.getElementById("titleScreen").classList.add("hidden");
  document.getElementById("gameScreen").classList.remove("hidden");
  loop();
};