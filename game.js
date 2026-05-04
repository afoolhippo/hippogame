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

// ===== 画像 =====
const load = src => { const i=new Image(); i.src=src; return i; };

const mapField = load("assets/map.png");
const mapCave = load("assets/map2.png");
const caveIcon = load("assets/doukutsu.png");
const hippo = load("assets/hippo.png");
const npcImg = load("assets/npc1.png");

// ===== プレイヤー =====
const player = { x:140, y:200 };

// ===== NPC =====
const npcsField = [
  { x:150,y:80,text:"ここはフィールドだよ",img:npcImg },
];

const npcsCave = [
  { x:140,y:100,text:"洞窟へようこそ",img:npcImg },
];

function getNPCs(){
  return currentMap==="field"?npcsField:npcsCave;
}

// ===== 洞窟入口（上部中央）=====
const caveEntrance = {
  x: BASE_W/2 - 24,
  y: 20,
  w: 48,
  h: 48
};

// ===== 洞窟出口（中央）=====
const caveExit = {
  x: BASE_W/2 - 24,
  y: BASE_H/2 - 24,
  w: 48,
  h: 48
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

// ===== 会話 =====
talkBtn.onpointerdown=()=>{
  if(talking){ closeDialog(); return; }

  for(let n of getNPCs()){
    const dx=(player.x+SIZE/2)-(n.x+SIZE/2);
    const dy=(player.y+SIZE/2)-(n.y+SIZE/2);
    if(Math.sqrt(dx*dx+dy*dy)<40){
      talking=true;
      dialogBox.textContent=n.text;
      dialogBox.classList.remove("hidden");
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

// ===== マップ切り替え =====
function checkMapChange(){

  // フィールド → 洞窟
  if(currentMap==="field"){
    if(
      player.x < caveEntrance.x + caveEntrance.w &&
      player.x + SIZE > caveEntrance.x &&
      player.y < caveEntrance.y + caveEntrance.h &&
      player.y + SIZE > caveEntrance.y
    ){
      currentMap = "cave";
      player.x = BASE_W/2 - SIZE/2;
      player.y = BASE_H/2 - SIZE/2;
    }
  }

  // 洞窟 → フィールド
  if(currentMap==="cave"){
    if(
      player.x < caveExit.x + caveExit.w &&
      player.x + SIZE > caveExit.x &&
      player.y < caveExit.y + caveExit.h &&
      player.y + SIZE > caveExit.y
    ){
      currentMap = "field";
      player.x = BASE_W/2 - SIZE/2;
      player.y = 80;
    }
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

  // マップ
  ctx.drawImage(
    currentMap==="field"?mapField:mapCave,
    0,0,BASE_W,BASE_H
  );

  // 洞窟アイコン（フィールドのみ）
  if(currentMap==="field"){
    ctx.drawImage(caveIcon, caveEntrance.x, caveEntrance.y, 48, 48);
  }

  // NPC
  getNPCs().forEach(n=>{
    ctx.drawImage(n.img,n.x,n.y,SIZE,SIZE);
  });

  // プレイヤー
  ctx.drawImage(hippo,player.x,player.y,SIZE,SIZE);

  // デバッグ表示（必要ならON）
  /*
  ctx.strokeStyle="red";
  ctx.strokeRect(caveEntrance.x,caveEntrance.y,caveEntrance.w,caveEntrance.h);
  ctx.strokeStyle="blue";
  ctx.strokeRect(caveExit.x,caveExit.y,caveExit.w,caveExit.h);
  */
}

// ===== ループ =====
function loop(){

  if(!talking && key){
    if(key==="ArrowUp") player.y-=2;
    if(key==="ArrowDown") player.y+=2;
    if(key==="ArrowLeft") player.x-=2;
    if(key==="ArrowRight") player.x+=2;
  }

  clampPlayer();      // ★ 画面外防止
  checkMapChange();   // ★ マップ切り替え
  draw();

  requestAnimationFrame(loop);
}

// ===== スタート =====
document.getElementById("titleImage").onclick=()=>{
  document.getElementById("titleScreen").classList.add("hidden");
  document.getElementById("gameScreen").classList.remove("hidden");
  loop();
};