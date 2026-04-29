// ===== 要素 =====
const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const dialogBox = document.getElementById("dialogBox");

// ===== 基本サイズ（これ重要）=====
const BASE_WIDTH = 320;
const BASE_HEIGHT = 288;

// ===== 状態 =====
let gameStarted = false;
let talking = false;
let target = null;

// ===== 画像 =====
const load = (src) => {
  const img = new Image();
  img.src = src;
  return img;
};

const hippoImg = load("assets/hippo.png");
const npcImgs = [
  load("assets/npc1.png"),
  load("assets/npc2.png"),
  load("assets/npc3.png")
];
const mapImg = load("assets/map.png");

// ===== プレイヤー =====
const player = {
  x: 50,
  y: 50,
  size: 32,
  speed: 1.8
};

// ===== NPC =====
const npcs = [
  {
    x: 150,
    y: 80,
    text: "こんにちは！これは1曲目です。",
    music: new Audio("assets/music1.mp3"),
    img: npcImgs[0]
  },
  {
    x: 200,
    y: 150,
    text: "いい感じの曲でしょ？",
    music: new Audio("assets/music2.mp3"),
    img: npcImgs[1]
  },
  {
    x: 80,
    y: 200,
    text: "最後の曲だよ！",
    music: new Audio("assets/music3.mp3"),
    img: npcImgs[2]
  }
];

// ===== キャンバスリサイズ（比率維持）=====
function resizeCanvas() {
  const scale = Math.min(
    window.innerWidth / BASE_WIDTH,
    window.innerHeight / BASE_HEIGHT
  );

  canvas.width = BASE_WIDTH;
  canvas.height = BASE_HEIGHT;

  canvas.style.width = BASE_WIDTH * scale + "px";
  canvas.style.height = BASE_HEIGHT * scale + "px";
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ===== スタート =====
function startGame() {
  titleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  gameStarted = true;
  loop();
}

titleScreen.addEventListener("click", startGame);
document.getElementById("titleImage").addEventListener("click", startGame);

// ===== タップ移動 =====
canvas.addEventListener("touchstart", (e) => {
  if (!gameStarted) return;

  const rect = canvas.getBoundingClientRect();

  const x = (e.touches[0].clientX - rect.left) * (BASE_WIDTH / rect.width);
  const y = (e.touches[0].clientY - rect.top) * (BASE_HEIGHT / rect.height);

  target = { x, y };
});

// PCクリック対応
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();

  const x = (e.clientX - rect.left) * (BASE_WIDTH / rect.width);
  const y = (e.clientY - rect.top) * (BASE_HEIGHT / rect.height);

  target = { x, y };
});

// ===== NPC判定（自動会話）=====
function checkNPC() {
  for (let npc of npcs) {
    const dx = player.x - npc.x;
    const dy = player.y - npc.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 24) {
      talk(npc);
      target = null;
      return;
    }
  }
}

// ===== 会話 =====
function talk(npc) {
  talking = true;
  dialogBox.classList.remove("hidden");
  dialogBox.textContent = npc.text;

  npcs.forEach(n => {
    n.music.pause();
    n.music.currentTime = 0;
  });

  npc.music.play();
}

// タップで閉じる
canvas.addEventListener("touchstart", () => {
  if (talking) closeDialog();
});

canvas.addEventListener("mousedown", () => {
  if (talking) closeDialog();
});

function closeDialog() {
  talking = false;
  dialogBox.classList.add("hidden");
}

// ===== 描画 =====
function draw() {
  ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

  ctx.drawImage(mapImg, 0, 0, BASE_WIDTH, BASE_HEIGHT);

  npcs.forEach(npc => {
    ctx.drawImage(npc.img, npc.x, npc.y, 32, 32);
  });

  ctx.drawImage(hippoImg, player.x, player.y, player.size, player.size);
}

// ===== ループ =====
function loop() {
  if (!talking && target) {
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 1) {
      player.x += (dx / dist) * player.speed;
      player.y += (dy / dist) * player.speed;
    } else {
      target = null;
    }

    checkNPC();
  }

  draw();
  requestAnimationFrame(loop);
}