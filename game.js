// ===== 要素 =====
const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const dialogBox = document.getElementById("dialogBox");
const talkBtn = document.getElementById("talkBtn");
const stopBtn = document.getElementById("stopBtn");

// ===== 基本サイズ =====
const BASE_WIDTH = 320;
const BASE_HEIGHT = 288;

// ★ キャラサイズ（1.5倍）
const SPRITE_SIZE = 48;

// ===== 状態 =====
let gameStarted = false;
let talking = false;
let currentKey = null;

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
  size: SPRITE_SIZE,
  speed: 2
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

// ===== リサイズ =====
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

// ===== キー操作（長押し対応）=====
document.addEventListener("keydown", (e) => currentKey = e.key);
document.addEventListener("keyup", () => currentKey = null);

document.querySelectorAll("#controls button").forEach(btn => {
  const key = btn.dataset.key;

  if (!key) return;

  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    currentKey = key;
  });

  btn.addEventListener("touchend", () => currentKey = null);

  btn.addEventListener("mousedown", () => currentKey = key);
  btn.addEventListener("mouseup", () => currentKey = null);
});

// ===== 入力 =====
function handleInput(key) {
  if (talking) return;

  switch (key) {
    case "ArrowUp": player.y -= player.speed; break;
    case "ArrowDown": player.y += player.speed; break;
    case "ArrowLeft": player.x -= player.speed; break;
    case "ArrowRight": player.x += player.speed; break;
  }
}

// ===== 話しかけ =====
talkBtn.addEventListener("click", handleTalk);
talkBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  handleTalk();
});

function handleTalk() {
  if (!gameStarted) return;

  if (talking) {
    closeDialog();
  } else {
    checkNPC();
  }
}

// ===== BGM停止 =====
stopBtn.addEventListener("click", stopAllMusic);
stopBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  stopAllMusic();
});

function stopAllMusic() {
  npcs.forEach(n => {
    n.music.pause();
    n.music.currentTime = 0;
  });
}

// ===== NPC判定（中心ベース）=====
function checkNPC() {
  for (let npc of npcs) {
    const dx = (player.x + SPRITE_SIZE/2) - (npc.x + SPRITE_SIZE/2);
    const dy = (player.y + SPRITE_SIZE/2) - (npc.y + SPRITE_SIZE/2);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 40) {
      talk(npc);
      return;
    }
  }
}

// ===== 会話 =====
function talk(npc) {
  talking = true;
  dialogBox.classList.remove("hidden");
  dialogBox.textContent = npc.text;

  updateTalkButton();

  stopAllMusic();
  npc.music.play();
}

function closeDialog() {
  talking = false;
  dialogBox.classList.add("hidden");
  updateTalkButton();
}

function updateTalkButton() {
  talkBtn.textContent = talking ? "とじる" : "話しかける";
}

// ===== 描画 =====
function draw() {
  ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

  ctx.drawImage(mapImg, 0, 0, BASE_WIDTH, BASE_HEIGHT);

  npcs.forEach(npc => {
    ctx.drawImage(npc.img, npc.x, npc.y, SPRITE_SIZE, SPRITE_SIZE);
  });

  ctx.drawImage(hippoImg, player.x, player.y, player.size, player.size);
}

// ===== ループ =====
function loop() {
  if (currentKey) handleInput(currentKey);

  draw();
  requestAnimationFrame(loop);
}