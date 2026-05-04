// ===== 基本 =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const dialogBox = document.getElementById("dialogBox");
const talkBtn = document.getElementById("talkBtn");

const BASE_W = 320;
const BASE_H = 288;
const SIZE = 48;

let currentMap = "field";
let talking = false;
let key = null;
let mapChangeCooldown = 0;
let justEnteredCave = 0;
let canExitCave = false;

// ===== 画像 =====
const load = src => { const i=new Image(); i.src=src; return i; };

const mapField = load("assets/map.png");
const mapCave  = load("assets/map2.png");
const caveIcon = load("assets/doukutsu.png");
const hippo    = load("assets/hippo.png");

const npcImgs = [
  load("assets/npc1.png"),
  load("assets/npc2.png"),
  load("assets/npc3.png")
];

// ===== 音 =====
const music1 = new Audio("assets/music1.mp3");
const music2 = new Audio("assets/music2.mp3");
const music3 = new Audio("assets/music3.mp3");
[music1, music2, music3].forEach(a=>a.volume = 0.6);

const seStart = new Audio("assets/enter.mp3");
const seMove  = new Audio("assets/enter2.mp3");
[seStart, seMove].forEach(a=>a.volume = 0.6);

// ===== プレイヤー =====
const player = { x:140, y:200 };

// ===== NPC =====
const npcsField = [
  { x:100,y:80,text:"外の住人A",img:npcImgs[0], music:music1 },
  { x:200,y:150,text:"外の住人B",img:npcImgs[1], music:music2 },
  { x:50,y:200,text:"外の住人C",img:npcImgs[2], music:music3 },
];

const npcsCave = [
  { x:140,y:120,text:"洞窟へようこそ",img:npcImgs[0] }
];

function getNPCs(){
  return currentMap==="field"?npcsField:npcsCave;
}

// ===== 洞窟入口 =====
const caveEntrance = {
  x: BASE_W/2 - SIZE/2,
  y: 10,
  w: SIZE,
  h: SIZE
};

// ===== 洞窟内の出入口 =====
const caveSpawn = {
  x: BASE_W/2 - SIZE/2,
  y: BASE_H - SIZE - 10
};

// ★ 出口判定を小さくする（ここが今回の修正）
const caveExit = {
  x: caveSpawn.x + 10,
  y: caveSpawn.y + 10,
  w: SIZE - 20,
  h: SIZE - 20
};

// ===== リサイズ =====
function resize(){
  const scale = Math.min(innerWidth/BASE_W, innerHeight/BASE_H);
  canvas.width=BASE_W;
  canvas.height=BASE_H;
  canvas.style.width=BASE_W*scale+"px";
  canvas.style.height=BASE_H*scale+"px";
}
addEventListener("resize",resize);
resize();

// ===== 入力 =====
document.addEventListener("keydown",e=>key=e.key);
document.addEventListener("keyup",()=>key=null);

document.querySelectorAll("[data-key]").forEach(b=>{
  b.onpointerdown=()=>key=b.dataset.key;
  b.onpointerup=()=>key=null;
});

// ===== BGM停止 =====
function stopAllMusic(){
  [music1, music2, music3].forEach(m=>{
    m.pause();
    m.currentTime = 0;
  });
}

// ===== 会話 =====
talkBtn.onpointerdown=()=>{
  if(talking){
    closeDialog();
    return;
  }

  for(let n of getNPCs()){
    const dx=(player.x+SIZE/2)-(n.x+SIZE/2);
    const dy=(player.y+SIZE/2)-(n.y+SIZE/2);
    if(Math.sqrt(dx*dx+dy*dy)<40){

      talking = true;
      dialogBox.textContent = n.text;
      dialogBox.classList.remove("hidden");

      stopAllMusic();

      if(n.music){
        n.music.currentTime = 0;
        n.music.play().catch(()=>{});
      }

      talkBtn.textContent="とじる";
      return;
    }
  }
};

function closeDialog(){
  talking=false;
  dialogBox.classList.add("hidden");
  talkBtn.textContent="話す";
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

// ===== マップ切り替え =====
function checkMapChange(){

  if(mapChangeCooldown > 0) return;

  // フィールド → 洞窟
  if(currentMap==="field" && isHit(player, caveEntrance)){
    currentMap = "cave";

    player.x = caveSpawn.x;
    player.y = caveSpawn.y;

    seMove.cloneNode().play().catch(()=>{});

    mapChangeCooldown = 20;
    justEnteredCave = 30;
    canExitCave = false;
  }

  // 洞窟 → フィールド
  else if(
    currentMap==="cave" &&
    canExitCave &&
    isHit(player, caveExit)
  ){
    currentMap = "field";

    player.x = caveEntrance.x;
    player.y = caveEntrance.y + 60;

    seMove.cloneNode().play().catch(()=>{});

    mapChangeCooldown = 20;
  }
}

// ===== 画面外制限 =====
function clampPlayer(){
  player.x = Math.max(0, Math.min(BASE_W - SIZE, player.x));
  player.y = Math.max(0, Math.min(BASE_H - SIZE, player.y));
}

// ===== 描画 =====
function draw(){
  ctx.clearRect(0,0,BASE_W,BASE_H);

  ctx.drawImage(
    currentMap==="field"?mapField:mapCave,
    0,0,BASE_W,BASE_H
  );

  if(currentMap==="field"){
    ctx.drawImage(caveIcon, caveEntrance.x, caveEntrance.y, SIZE, SIZE);
  }

  getNPCs().forEach(n=>{
    ctx.drawImage(n.img,n.x,n.y,SIZE,SIZE);
  });

  ctx.drawImage(hippo,player.x,player.y,SIZE,SIZE);
}

// ===== ループ =====
function loop(){

  if(!talking && key){
    if(key==="ArrowUp") player.y-=2;
    if(key==="ArrowDown") player.y+=2;
    if(key==="ArrowLeft") player.x-=2;
    if(key==="ArrowRight") player.x+=2;
  }

  if(mapChangeCooldown > 0) mapChangeCooldown--;
  if(justEnteredCave > 0) justEnteredCave--;

  // ★ 少し動いたら出口有効
  if(currentMap==="cave"){
    if(Math.abs(player.y - caveSpawn.y) > 5){
      canExitCave = true;
    }
  }

  clampPlayer();
  checkMapChange();
  draw();

  requestAnimationFrame(loop);
}

// ===== スタート =====
document.getElementById("titleImage").onclick=()=>{

  [music1, music2, music3].forEach(a=>{
    a.play().then(()=>a.pause()).catch(()=>{});
  });

  seStart.cloneNode().play().catch(()=>{});

  document.getElementById("titleScreen").classList.add("hidden");
  document.getElementById("gameScreen").classList.remove("hidden");

  loop();
};