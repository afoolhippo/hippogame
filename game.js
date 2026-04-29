// ===== 要素 =====
const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const dialogBox = document.getElementById("dialogBox");

// ===== 状態 =====
let gameStarted = false;
let talking = false;

// ===== 画像 =====
function load(src) {
  const img = new Image();
  img.src = src;
  return img;
}

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
  speed: 3
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

// ===== タイトルクリック =====
function startGame() {
  titleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  gameStarted = true;
  gameLoop();
}

titleScreen.addEventListener("click", startGame);
document.getElementById("titleImage").addEventListener("click", startGame);

// ===== キーボード =====
document.addEventListener("keydown", (e) => handleInput(e.key));

// ===== タッチ操作 =====
document.querySelectorAll("#controls button").forEach(btn => {
  const key = btn.dataset.key;

  btn.addEventListener("click", () => handleInput(key));
  btn.addEventListener("touchstart", () => handleInput(key));
});

// ===== 入力処理 =====
function handleInput(key) {
  if (!gameStarted) return;

  if (talking && key === "Enter") {
    closeDialog();
    return;
  }

  switch (key) {
    case "ArrowUp": player.y -= player.speed; break;
    case "ArrowDown": player.y += player.speed; break;
    case "ArrowLeft": player.x -= player.speed; break;
    case "ArrowRight": player.x += player.speed; break;
    case "Enter": checkInteraction(); break;
  }
}

// ===== NPC判定 =====
function checkInteraction() {
  npcs.forEach(npc => {
    const dx = player.x - npc.x;
    const dy = player.y - npc.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 24) {
      showDialog(npc);
    }
  });
}

// ===== 会話 =====
function showDialog(npc) {
  talking = true;
  dialogBox.classList.remove("hidden");
  dialogBox.textContent = npc.text;

  npcs.forEach(n => {
    n.music.pause();
    n.music.currentTime = 0;
  });

  npc.music.play();
}

function closeDialog() {
  talking = false;
  dialogBox.classList.add("hidden");
}

// ===== 描画 =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);

  npcs.forEach(npc => {
    ctx.drawImage(npc.img, npc.x, npc.y, 32, 32);
  });

  ctx.drawImage(hippoImg, player.x, player.y, player.size, player.size);
}

// ===== ループ =====
function gameLoop() {
  draw();
  requestAnimationFrame(gameLoop);
}