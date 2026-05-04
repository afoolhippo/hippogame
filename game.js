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
let gameMode = "map"; 
// map / startFade / encounterIntro / battle / battleMessage / treasureOpen / clear

let talking = false;
let key = null;
let mapChangeCooldown = 0;
let justEnteredCave = 0;
let canExitCave = false;

// ===== 鍵・ぬらりひょん =====
let hasKey = false;
let nurarihyonDefeated = false;

let enemyHP = 20;
let battleTimeLeft = 10;
let battleMessage = "";
let victoryWaitTimer = 0;

let countdown = 3;
let isCountingDown = false;

let flashTimer = 0;
let shakeTimer = 0;
let shakePower = 0;

let fadeAlpha = 0;
let isFading = false;

let encounterIntroTimer = 0;
let treasureOpenTimer = 0;
let footCooldown = 0;

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
const gameClearImg = load("assets/gameclear.png");

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
const seTap   = new Audio("assets/tap.mp3");
const seNurarihyon = new Audio("assets/nurarihyon.mp3");
const seFoot  = new Audio("assets/foot.mp3");

[music1, music2, music3, seStart, seMove, seGet, seTap, seNurarihyon, seFoot].forEach(a => {
  a.volume = 0.6;
});

seNurarihyon.volume = 0.7;
seFoot.volume = 0.35;

// ===== プレイヤー =====
const player = { x: 140, y: 200 };

// ===== NPC =====
const npcsField = [
  {
    x:100,
    y:80,
    text:"茄子を食べたら、健康になれるかな？",
    afterText:"ぬらりひょんを倒したんだね！ 洞窟の宝箱を調べてみよう。",
    img:npcImgs[0],
    music:music1
  },
  {
    x:200,
    y:150,
    text:"生姜焼きを食べた僕は、しょうがないと呟いた・・・",
    afterText:"すごい！ そのカギ、きっと洞窟で使えるよ。",
    img:npcImgs[1],
    music:music2
  },
  {
    x:50,
    y:200,
    text:"歯磨きしようぜ！",
    afterText:"ぬらりひょん退治おめでとう！ 宝箱へ急げ！",
    img:npcImgs[2],
    music:music3
  },
];

const caveNPC = {
  x:140,
  y:120,
  text:"合言葉はbakanakabaじゃ・・・",
  afterText:"そのカギなら、宝箱が開くかもしれんぞ・・・",
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

// ===== 音停止 =====
function stopAllMusic(){
  [music1, music2, music3].forEach(a => {
    a.pause();
    a.currentTime = 0;
  });
}

if (stopBtn) {
  stopBtn.onclick = () => {
    if (gameMode === "clear") {
      location.reload();
      return;
    }
    stopAllMusic();
  };
}

function playFootstep(){
  if (footCooldown > 0) return;

  seFoot.currentTime = 0;
  seFoot.play().catch(() => {});

  footCooldown = 18;
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

// ===== エンカウント予兆 =====
function startEncounterIntro(){
  gameMode = "encounterIntro";
  key = null;
  talking = false;
  closeDialog();
  stopAllMusic();
  encounterIntroTimer = 60;
}

function updateEncounterIntro(){
  encounterIntroTimer--;

  if (encounterIntroTimer <= 0) {
    startBattle();
  }
}

function drawEncounterIntro(){
  draw();

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(20, 105, BASE_W - 40, 70);

  ctx.strokeStyle = "black";
  ctx.strokeRect(20, 105, BASE_W - 40, 70);

  ctx.fillStyle = "black";
  ctx.font = "14px monospace";
  ctx.fillText("ぬらりひょんが", 85, 135);
  ctx.fillText("うごめいている……", 75, 158);
}

// ===== ミニゲーム開始 =====
function startBattle(){
  gameMode = "battle";
  talking = false;
  key = null;

  stopAllMusic();

  seNurarihyon.currentTime = 0;
  seNurarihyon.play().catch(() => {});

  shakeTimer = 25;
  shakePower = 4;

  enemyHP = 20;
  battleTimeLeft = 10;
  battleMessage = "";
  victoryWaitTimer = 0;

  countdown = 3;
  isCountingDown = true;

  flashTimer = 0;
  fadeAlpha = 0;
  isFading = false;

  closeDialog();
}

// ===== canvasタップ =====
canvas.addEventListener("pointerdown", () => {
  if (gameMode === "clear") {
    window.location.href = "https://bakanakaba.wixsite.com/afoolhippo/portfolio";
    return;
  }

  if (gameMode !== "battle") return;
  if (isCountingDown) return;

  enemyHP = Math.max(0, enemyHP - 1);

  seTap.currentTime = 0;
  seTap.play().catch(() => {});

  flashTimer = 5;

  if (enemyHP <= 0) {
    winBattle();
  }
});

function updateBattle(){
  if (gameMode !== "battle") return;

  if (isCountingDown) {
    countdown -= 1 / 60;

    if (countdown <= 0) {
      isCountingDown = false;
    }
    return;
  }

  battleTimeLeft -= 1 / 60;

  if (flashTimer > 0) flashTimer--;

  if (battleTimeLeft <= 0) {
    if (enemyHP <= 0) {
      winBattle();
    } else {
      loseBattle();
    }
  }
}

function winBattle(){
  hasKey = true;
  nurarihyonDefeated = true;

  battleMessage = "ぬらりひょんを倒した！\n何かのカギを手に入れた！";
  victoryWaitTimer = 240;

  isFading = false;
  fadeAlpha = 0;

  gameMode = "battleMessage";

  seGet.cloneNode().play().catch(() => {});
}

function loseBattle(){
  gameMode = "map";
  battleMessage = "";
  victoryWaitTimer = 0;

  player.x = nurarihyonEnemy.x - SIZE - 20;
  player.y = nurarihyonEnemy.y + SIZE + 30;
  clampPlayer();

  talking = true;
  dialogBox.textContent = "逃げられた……もう一度挑戦しよう！";
  dialogBox.classList.remove("hidden");
  talkBtn.textContent = "とじる";
}

function updateBattleMessage(){
  if (gameMode !== "battleMessage") return;

  if (victoryWaitTimer > 0) {
    victoryWaitTimer--;

    if (victoryWaitTimer <= 0) {
      isFading = true;
    }

    return;
  }

  if (isFading) {
    fadeAlpha += 0.03;

    if (fadeAlpha >= 1) {
      fadeAlpha = 1;
      isFading = false;

      gameMode = "map";

      player.x = nurarihyonEnemy.x - SIZE - 20;
      player.y = nurarihyonEnemy.y + SIZE + 30;

      clampPlayer();
    }
  }
}

// ===== 会話＆宝箱 =====
talkBtn.onpointerdown = () => {
  if (gameMode === "clear") {
    window.location.href = "https://bakanakaba.wixsite.com/afoolhippo/portfolio";
    return;
  }

  if (gameMode !== "map") return;

  if (talking) {
    closeDialog();
    return;
  }

  if (currentMap === "cave" && isHit(player, treasure)) {
    talking = true;

    if (!hasKey) {
      dialogBox.textContent = "鍵がかかっている……どこかにカギを持つ者がいるようだ。";
      dialogBox.classList.remove("hidden");
      talkBtn.textContent = "とじる";
      return;
    }

    stopAllMusic();

    seGet.cloneNode().play().catch(() => {});

    gameMode = "treasureOpen";
    treasureOpenTimer = 150;

    dialogBox.textContent = "カチャ……宝箱が開いた！";
    dialogBox.classList.remove("hidden");
    talkBtn.textContent = "・・・";
    return;
  }

  for (let n of getNPCs()) {
    const dx = (player.x + SIZE / 2) - (n.x + SIZE / 2);
    const dy = (player.y + SIZE / 2) - (n.y + SIZE / 2);

    if (Math.sqrt(dx * dx + dy * dy) < 40) {
      talking = true;

      if (nurarihyonDefeated && n.afterText) {
        dialogBox.textContent = n.afterText;
      } else {
        dialogBox.textContent = n.text;
      }

      dialogBox.classList.remove("hidden");

      stopAllMusic();

      // ぬらりひょん撃破後はNPC曲を流さない
      if (!nurarihyonDefeated && n.music) {
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

// ===== 宝箱開封 =====
function updateTreasureOpen(){
  treasureOpenTimer--;

  if (treasureOpenTimer <= 0) {
    gameMode = "clear";

    dialogBox.textContent = "ゲームクリア！ 画面をタップしてサイトへ";
    dialogBox.classList.remove("hidden");

    talkBtn.textContent = "サイトへ";
    stopBtn.textContent = "もう一度";
  }
}

function drawTreasureOpen(){
  draw();
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
    startEncounterIntro();
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

// ===== 開始フェード =====
function updateStartFade(){
  fadeAlpha -= 0.03;

  if (fadeAlpha <= 0) {
    fadeAlpha = 0;
    gameMode = "map";
  }
}

function drawStartFade(){
  draw();

  ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
  ctx.fillRect(0, 0, BASE_W, BASE_H);
}

// ===== ミニゲーム描画 =====
function drawBattle(){
  let offsetX = 0;
  let offsetY = 0;

  if (shakeTimer > 0) {
    offsetX = (Math.random() - 0.5) * shakePower * 2;
    offsetY = (Math.random() - 0.5) * shakePower * 2;
    shakeTimer--;
  }

  ctx.save();
  ctx.translate(offsetX, offsetY);

  ctx.fillStyle = "white";
  ctx.fillRect(-10, -10, BASE_W + 20, BASE_H + 20);

  if (flashTimer % 2 === 0) {
    ctx.drawImage(nurarihyonImg, 120, 35, 80, 80);
  }

  ctx.fillStyle = "black";
  ctx.font = "14px monospace";

  if (isCountingDown) {
    ctx.font = "30px monospace";
    ctx.fillText(Math.ceil(countdown), 145, 160);
    ctx.restore();
    return;
  }

  ctx.font = "14px monospace";
  ctx.fillText("ぬらりひょんがあらわれた！", 55, 140);
  ctx.fillText("画面をタップして攻撃だ！", 58, 162);

  const maxHpWidth = 220;
  const hpX = 50;
  const hpY = 185;
  const hpH = 18;

  const hpWidth = maxHpWidth * (enemyHP / 20);

  ctx.strokeStyle = "black";
  ctx.strokeRect(hpX, hpY, maxHpWidth, hpH);

  ctx.fillStyle = "black";
  ctx.fillRect(hpX, hpY, hpWidth, hpH);

  ctx.fillStyle = "black";
  ctx.fillText(`HP: ${enemyHP} / 20`, 112, 225);
  ctx.fillText(`残り: ${Math.max(0, Math.ceil(battleTimeLeft))}秒`, 112, 245);

  ctx.restore();
}

function drawBattleMessage(){
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, BASE_W, BASE_H);

  ctx.drawImage(nurarihyonImg, 120, 45, 80, 80);

  ctx.fillStyle = "black";
  ctx.font = "14px monospace";

  const paragraphs = battleMessage.split("\n");
  let y = 165;

  paragraphs.forEach(p => {
    const lines = splitText(p, 18);
    lines.forEach(line => {
      ctx.fillText(line, 35, y);
      y += 22;
    });
    y += 8;
  });

  if (isFading) {
    ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
    ctx.fillRect(0, 0, BASE_W, BASE_H);
  }
}

function drawClear(){
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, BASE_W, BASE_H);

  ctx.drawImage(gameClearImg, 0, 0, BASE_W, BASE_H);
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
  if (footCooldown > 0) footCooldown--;

  if (gameMode === "startFade") {
    updateStartFade();
    drawStartFade();
  }

  else if (gameMode === "map") {
    let moved = false;

    if (!talking && key) {
      if (key === "ArrowUp") {
        player.y -= 2;
        moved = true;
      }
      if (key === "ArrowDown") {
        player.y += 2;
        moved = true;
      }
      if (key === "ArrowLeft") {
        player.x -= 2;
        moved = true;
      }
      if (key === "ArrowRight") {
        player.x += 2;
        moved = true;
      }
    }

    if (moved) playFootstep();

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

  else if (gameMode === "encounterIntro") {
    updateEncounterIntro();
    drawEncounterIntro();
  }

  else if (gameMode === "battle") {
    updateBattle();
    drawBattle();
  }

  else if (gameMode === "battleMessage") {
    updateBattleMessage();
    drawBattleMessage();
  }

  else if (gameMode === "treasureOpen") {
    updateTreasureOpen();
    drawTreasureOpen();
  }

  else if (gameMode === "clear") {
    drawClear();
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

  fadeAlpha = 1;
  gameMode = "startFade";

  loop();
};