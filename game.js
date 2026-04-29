// ===== 要素取得 =====
const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const dialogBox = document.getElementById("dialogBox");

// ===== 状態 =====
let gameStarted = false;
let talking = false;
let assetsLoaded = 0;
const totalAssets = 5; // 画像数

// ===== 画像読み込み =====
function loadImage(src) {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    assetsLoaded++;
    if (assetsLoaded === totalAssets) {
      console.log("全画像ロード完了");
    }
  };
  return img;
}

const hippoImg = loadImage("assets/hippo.png");

const npcImgs = [
  loadImage("assets/npc1.png"),
  loadImage("assets/npc2.png"),
  loadImage("assets/npc3.png")
];

const mapImg = loadImage("assets/map.png");

// ===== プレイヤー =====
const player = {
  x: 50,
  y: 50,
  size: 32, // 画像サイズに合わせる
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
titleScreen.addEventListener("click", () => {
  if (assetsLoaded < totalAssets) {
    alert("読み込み中です...");
    return;
  }

  titleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  gameStarted = true;
  gameLoop();
});

// ===== 入力 =====
document.addEventListener("keydown", (e) => {
  if (!gameStarted) return;

  if (talking) {
    if (e.key === "Enter") closeDialog();
    return;
  }

  switch (e.key) {
    case "ArrowUp": player.y -= player.speed; break;
    case "ArrowDown": player.y += player.speed; break;
    case "ArrowLeft": player.x -= player.speed; break;
    case "ArrowRight": player.x += player.speed; break;
    case "Enter": checkInteraction(); break;
  }
});

// ===== NPC会話判定 =====
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

// ===== 会話表示 =====
function showDialog(npc) {
  talking = true;
  dialogBox.classList.remove("hidden");
  dialogBox.textContent = npc.text;

  // 他の音停止
  npcs.forEach(n => {
    n.music.pause();
    n.music.currentTime = 0;
  });

  npc.music.play();
}

// ===== 会話終了 =====
function closeDialog() {
  talking = false;
  dialogBox.classList.add("hidden");
}

// ===== 描画 =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // マップ
  ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);

  // NPC
  npcs.forEach(npc => {
    ctx.drawImage(
      npc.img,
      npc.x,
      npc.y,
      32,
      32
    );
  });

  // プレイヤー（カバ）
  ctx.drawImage(
    hippoImg,
    player.x,
    player.y,
    player.size,
    player.size
  );
}

// ===== ゲームループ =====
function gameLoop() {
  draw();
  requestAnimationFrame(gameLoop);
}