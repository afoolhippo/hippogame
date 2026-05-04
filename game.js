// ===== 基本 =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const dialogBox = document.getElementById("dialogBox");
const talkBtn = document.getElementById("talkBtn");
const stopBtn = document.getElementById("stopBtn");

const BASE_W = 320;
const BASE_H = 288;
const SIZE = 48;

let currentMap = "field";
let gameMode = "map"; // map / battle / battleMessage

let talking = false;
let key = null;
let mapChangeCooldown = 0;
let justEnteredCave = 0;
let canExitCave = false;

// ===== 鍵・ぬらりひょん =====
let hasKey = false;
let nurarihyonDefeated = false;

let battleTapCount = 0;
let battleTimeLeft = 5;
let battleMessage = "";
let battleMessageTimer = 0;

// ===== 画像 =====
const load = src => {
  const i = new Image();
  i.src = src;
  return i;
};

const mapField = load("assets/map.png");
const mapCave  = load("assets/map2.png");
const caveIcon = load("assets/doukutsu.png");
const hippo    = load("assets/hippo.png");
const nurarihyonImg = load("assets/nurarihyon.png");

const npcImgs = [
  load("assets/npc1.png"),
  load("assets/npc2.png"),
  load("assets/npc3.png"),
  load("assets/npc4.png")
];

const takarabakoImg = load("assets/takarabako.png");

// ===== 音 =====
const music1 = new Audio("assets/music1.mp3");
const music2 = new Audio("assets/music2.mp3");
const music3 = new Audio("assets/music3.mp3");

const seStart = new Audio("assets/enter.mp3");
const seMove  = new Audio("assets/enter2.mp3");
const seGet   = new Audio("assets/get.mp3");

[music1, music2, music3, seStart, seMove, seGet].forEach(a => a.volume = 0.6);

// ===== プレイヤー =====
const player = { x: 140, y: 200 };

// ===== NPC =====
const npcsField = [
  { x:100, y:80,  text:"茄子を食べたら、健康になれるかな？", img:npcImgs[0], music:music1 },
  { x:200, y:150, text:"生姜焼きを食べた僕は、しょうがないと呟いた・・・", img:npcImgs[1], music:music2 },
  { x:50,  y:200, text:"歯磨きしようぜ！", img:npcImgs[2], music:music3 },
];

const caveNPC = {
  x:140,
  y:120,
  text:"合言葉はbakanakabaじゃ・・・",
  img:npcImgs[3]
};

const treasure = {
  x: caveNPC.x + 60,
  y: caveNPC.y - 40,
  w: SIZE,
  h: SIZE
};

function getNPCs(){
  return currentMap === "field" ? npcsField : [caveNPC];
}

// ===== ぬらりひょん =====
const nurarihyonEnemy = {
  x: 230,
  y: 90,
  w: SIZE,
  h: SIZE
};

// ===== 洞窟 =====
const caveEntrance = {
  x: BASE_W / 2 - SIZE / 2,
  y: 10,
  w: SIZE,
  h: SIZE
};

const caveSpawn = {
  x: BASE_W / 2 - SIZE / 2,
  y: BASE_H - SIZE - 10
};

const caveExit = {
  x: caveSpawn.x + 10,
  y: caveSpawn.y + 10,
  w: SIZE - 20,
  h: SIZE - 20
};

// ===== リサイズ =====
function resize(){
  const scale = Math.min(innerWidth / BASE_W, innerHeight / BASE_H);
  canvas.width = BASE_W;
  canvas.height = BASE_H;
  canvas.style.width = BASE_W * scale + "px";
  canvas.style.height = BASE_H * scale + "px";
}
addEventListener("resize", resize);
resize();

// ===== 入力 =====
document.addEventListener("keydown", e => {
  if (gameMode !== "map") return;
  key = e.key;
});

document.addEventListener("keyup", () => key = null);

document.querySelectorAll("[data-key]").forEach(b => {
  b.onpointerdown = () => {
    if (gameMode !== "map") return;
    key = b.dataset.key;
  };
  b.onpointerup = () => key = null;
});

// ===== BGM停止 =====
function stopAllMusic(){
  [music1, music2, music3, seStart, seMove, seGet].forEach(a => {
    a.pause();
    a.currentTime = 0;
  });
}

if (stopBtn) {
  stopBtn.onclick = () => {
    stopAllMusic();
  };
}

// ===== 当たり判定 =====
function isHit(a, b){
  return (
    a.x < b.x + b.w &&
    a.x + SIZE > b.x &&
    a.y < b.y + b.h &&
    a.y + SIZE > b.y
  );
}

// ===== ミニゲーム開始 =====
function startBattle(){
  gameMode = "battle";
  talking = false;
  key = null;

  battleTapCount = 0;
  battleTimeLeft = 5;
  battleMessage = "";
  battleMessageTimer = 0;

  closeDialog();
  stopAllMusic();
}

// ===== ミニゲーム中タップ =====
canvas.addEventListener("pointerdown", () => {
  if (gameMode !== "battle") return;
  battleTapCount++;

  if (battleTapCount >= 20) {
    winBattle();
  }
});

function updateBattle(){
  if (gameMode !== "battle") return;

  battleTimeLeft -= 1 / 60;

  if (battleTimeLeft <= 0) {
    if (battleTapCount >= 20) {
      winBattle();
    } else {
      loseBattle();
    }
  }
}

function winBattle(){
  hasKey = true;
  nurarihyonDefeated = true;
  battleMessage = "ぬらりひょんを倒した！ 鍵を手に入れた！";
  battleMessageTimer = 90;
  gameMode = "battleMessage";
  seGet.cloneNode().play().catch(() => {});
}

function loseBattle(){
  battleMessage = "逃げられた……もう一度挑戦しよう！";
  battleMessageTimer = 90;
  gameMode = "battleMessage";
}

function updateBattleMessage(){
  if (gameMode !== "battleMessage") return;

  battleMessageTimer--;

  if (battleMessageTimer <= 0) {
    gameMode = "map";

    // 戦闘終了後、即再接触しないよう少し位置を戻す
    player.y += 40;
    clampPlayer();
  }
}

// ===== 会話＆宝箱 =====
talkBtn.onpointerdown = () => {
  if (gameMode !== "map") return;

  if (talking) {
    closeDialog();
    return;
  }

  if (currentMap === "cave" && isHit(player, treasure)) {
    talking = true;

    if (!hasKey) {
      dialogBox.textContent = "鍵がかかっている……";
      dialogBox.classList.remove("hidden");
      talkBtn.textContent = "とじる";
      return;
    }

    dialogBox.innerHTML = `
      あなたはa fool hippo全曲視聴サイトへの入口を見つけました！<br>
      <a href="https://bakanakaba.wixsite.com/afoolhippo/portfolio" target="_blank" style="color:white;">
      ▶ サイトへ
      </a>
    `;
    dialogBox.classList.remove("hidden");

    seGet.cloneNode().play().catch(() => {});

    setTimeout(() => {
      window.location.href = "https://bakanakaba.wixsite.com/afoolhippo/portfolio";
    }, 2000);

    talkBtn.textContent = "とじる";
    return;
  }

  for (let n of getNPCs()) {
    const dx = (player.x + SIZE / 2) - (n.x + SIZE / 2);
    const dy = (player.y + SIZE / 2) - (n.y + SIZE / 2);

    if (Math.sqrt(dx * dx + dy * dy) < 40) {
      talking = true;
      dialogBox.textContent = n.text;
      dialogBox.classList.remove("hidden");

      stopAllMusic();

      if (n.music) {
        n.music.currentTime = 0;
        n.music.play().catch(() => {});
      }

      talkBtn.textContent = "とじる";
      return;
    }
  }
};

function closeDialog(){
  talking = false;
  dialogBox.classList.add("hidden");
  talkBtn.textContent = "話す";
}

// ===== マップ切り替え =====
function checkMapChange(){
  if (mapChangeCooldown > 0) return;
  if (gameMode !== "map") return;

  if (currentMap === "field" && isHit(player, caveEntrance)) {
    currentMap = "cave";

    player.x = caveSpawn.x;
    player.y = caveSpawn.y;

    seMove.cloneNode().play().catch(() => {});

    mapChangeCooldown = 20;
    justEnteredCave = 30;
    canExitCave = false;
  }

  else if (
    currentMap === "cave" &&
    canExitCave &&
    isHit(player, caveExit) &&
    player.y > caveSpawn.y + 5
  ) {
    currentMap = "field";

    player.x = caveEntrance.x;
    player.y = caveEntrance.y + 60;

    seMove.cloneNode().play().catch(() => {});

    mapChangeCooldown = 20;
  }
}

// ===== 画面制限 =====
function clampPlayer(){
  player.x = Math.max(0, Math.min(BASE_W - SIZE, player.x));
  player.y = Math.max(0, Math.min(BASE_H - SIZE, player.y));
}

// ===== ぬらりひょん接触 =====
function checkNurarihyonEncounter(){
  if (gameMode !== "map") return;
  if (talking) return;
  if (currentMap !== "field") return;
  if (nurarihyonDefeated) return;

  if (isHit(player, nurarihyonEnemy)) {
    startBattle();
  }
}

// ===== 通常描画 =====
function draw(){
  ctx.clearRect(0, 0, BASE_W, BASE_H);

  ctx.drawImage(
    currentMap === "field" ? mapField : mapCave,
    0, 0, BASE_W, BASE_H
  );

  if (currentMap === "field") {
    ctx.drawImage(caveIcon, caveEntrance.x, caveEntrance.y, SIZE, SIZE);

    if (!nurarihyonDefeated) {
      ctx.drawImage(nurarihyonImg, nurarihyonEnemy.x, nurarihyonEnemy.y, SIZE, SIZE);
    }
  }

  getNPCs().forEach(n => {
    ctx.drawImage(n.img, n.x, n.y, SIZE, SIZE);
  });

  if (currentMap === "cave") {
    ctx.drawImage(takarabakoImg, treasure.x, treasure.y, SIZE, SIZE);
  }

  ctx.drawImage(hippo, player.x, player.y, SIZE, SIZE);
}

// ===== ミニゲーム描画 =====
function drawBattle(){
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, BASE_W, BASE_H);

  ctx.drawImage(nurarihyonImg, 120, 35, 80, 80);

  ctx.fillStyle = "black";
  ctx.font = "14px monospace";
  ctx.fillText("ぬらりひょんがあらわれた！", 55, 140);
  ctx.fillText("画面をタップして攻撃だ！", 58, 162);

  const maxHpWidth = 220;
  const hpX = 50;
  const hpY = 185;
  const hpH = 18;

  const progress = Math.min(battleTapCount / 20, 1);
  const hpWidth = maxHpWidth * (1 - progress);

  ctx.strokeStyle = "black";
  ctx.strokeRect(hpX, hpY, maxHpWidth, hpH);

  ctx.fillStyle = "black";
  ctx.fillRect(hpX, hpY, hpWidth, hpH);

  ctx.fillStyle = "black";
  ctx.fillText(`攻撃: ${battleTapCount} / 20`, 105, 225);
  ctx.fillText(`残り: ${Math.max(0, Math.ceil(battleTimeLeft))}秒`, 112, 245);
}

function drawBattleMessage(){
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, BASE_W, BASE_H);

  ctx.drawImage(nurarihyonImg, 120, 45, 80, 80);

  ctx.fillStyle = "black";
  ctx.font = "14px monospace";

  const lines = splitText(battleMessage, 18);
  lines.forEach((line, i) => {
    ctx.fillText(line, 35, 165 + i * 22);
  });
}

function splitText(text, count){
  const result = [];
  for (let i = 0; i < text.length; i += count) {
    result.push(text.slice(i, i + count));
  }
  return result;
}

// ===== ループ =====
function loop(){
  if (gameMode === "map") {
    if (!talking && key) {
      if (key === "ArrowUp") player.y -= 2;
      if (key === "ArrowDown") player.y += 2;
      if (key === "ArrowLeft") player.x -= 2;
      if (key === "ArrowRight") player.x += 2;
    }

    if (mapChangeCooldown > 0) mapChangeCooldown--;
    if (justEnteredCave > 0) justEnteredCave--;

    if (currentMap === "cave") {
      if (Math.abs(player.y - caveSpawn.y) > 5) {
        canExitCave = true;
      }
    }

    clampPlayer();
    checkMapChange();
    checkNurarihyonEncounter();
    draw();
  }

  else if (gameMode === "battle") {
    updateBattle();
    drawBattle();
  }

  else if (gameMode === "battleMessage") {
    updateBattleMessage();
    drawBattleMessage();
  }

  requestAnimationFrame(loop);
}

// ===== スタート =====
document.getElementById("titleImage").onclick = () => {
  [music1, music2, music3].forEach(a => {
    a.play().then(() => a.pause()).catch(() => {});
  });

  seStart.cloneNode().play().catch(() => {});

  document.getElementById("titleScreen").classList.add("hidden");
  document.getElementById("gameScreen").classList.remove("hidden");

  loop();
};