// ===== 基本 =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const dialogBox = document.getElementById("dialogBox");
const talkBtn = document.getElementById("talkBtn");
const stopBtn = document.getElementById("stopBtn");

const BASE_W = 320;
const BASE_H = 288;
const SIZE = 48;

let gameState = "field";
let currentMap = "field";
let key = null;

// ===== SE =====
const seEnter1 = new Audio("assets/enter1.mp3");
const seEnter2 = new Audio("assets/enter2.mp3");
[seEnter1,seEnter2].forEach(a=>a.volume=0.6);

function playSE(a){
  a.currentTime=0;
  a.play().catch(()=>{});
}

// ===== 画像 =====
const load = src => { let i=new Image(); i.src=src; return i; };

const mapField = load("assets/map.png");
const mapCave  = load("assets/map2.png");
const caveIcon = load("assets/doukutsu.png");
const hippo    = load("assets/hippo.png");

const npcImgs = [
  load("assets/npc1.png"),
  load("assets/npc2.png"),
  load("assets/npc3.png"),
  load("assets/npc4.png")
];

const takara = load("assets/takarabako.png");

// ===== プレイヤー =====
const player = {x:140,y:200};

// ===== NPC =====
const npcs = [
  {x:100,y:80,text:"茄子を食べたら、健康になれるかな？",img:npcImgs[0]},
  {x:200,y:150,text:"生姜焼きを食べた僕は、しょうがないと呟いた・・・",img:npcImgs[1]},
  {x:50,y:200,text:"歯磨きしようぜ！",img:npcImgs[2]}
];

const caveNPC = {x:140,y:120,text:"合言葉はbakanakabaじゃ・・・",img:npcImgs[3]};

const treasure = {x:220,y:80,w:SIZE,h:SIZE};

// ===== ぬらりひょん =====
const enemy = {x:220,y:80,w:SIZE,h:SIZE};

// ===== 洞窟入口（小さく調整）=====
const cave = {x:150,y:10,w:24,h:24};

// ===== 入力 =====
document.addEventListener("keydown",e=>key=e.key);
document.addEventListener("keyup",()=>key=null);

document.querySelectorAll("[data-key]").forEach(b=>{
  b.onpointerdown=()=>key=b.dataset.key;
  b.onpointerup=()=>key=null;
});

// ===== タイトル =====
document.getElementById("titleImage").onclick=()=>{
  playSE(seEnter1);

  document.getElementById("titleScreen").classList.add("hidden");
  document.getElementById("gameScreen").classList.remove("hidden");

  loop();
};

// ===== 会話 =====
talkBtn.onclick=()=>{

  if(gameState==="minigame") return;

  // 宝箱
  if(currentMap==="cave" && hit(player,treasure)){
    if(!hasKey){
      show("鍵がかかっている・・・");
      return;
    }
    show("サイト発見！↓\nhttps://bakanakaba.wixsite.com/afoolhippo/portfolio");
    return;
  }

  let list = currentMap==="field"?npcs:[caveNPC];

  for(let n of list){
    if(dist(player,n)<40){
      show(n.text);
    }
  }
};

function show(text){
  dialogBox.textContent=text;
  dialogBox.classList.remove("hidden");
  setTimeout(()=>dialogBox.classList.add("hidden"),2000);
}

// ===== 判定 =====
function hit(a,b){
  return a.x<b.x+b.w && a.x+SIZE>b.x && a.y<b.y+b.h && a.y+SIZE>b.y;
}

function dist(a,b){
  let dx=a.x-b.x, dy=a.y-b.y;
  return Math.sqrt(dx*dx+dy*dy);
}

// ===== ループ =====
function loop(){

  if(gameState==="field"){

    if(key){
      if(key==="ArrowUp")player.y-=2;
      if(key==="ArrowDown")player.y+=2;
      if(key==="ArrowLeft")player.x-=2;
      if(key==="ArrowRight")player.x+=2;
    }

    // 洞窟
    if(currentMap==="field" && hit(player,cave)){
      playSE(seEnter2);
      currentMap="cave";
      player.x=140; player.y=220;
    }

    if(currentMap==="cave" && player.y>260){
      playSE(seEnter2);
      currentMap="field";
      player.x=150; player.y=60;
    }

    // ミニゲーム
    if(currentMap==="field" && hit(player,enemy)){
      startMiniGame();
    }

    player.x=Math.max(0,Math.min(BASE_W-SIZE,player.x));
    player.y=Math.max(0,Math.min(BASE_H-SIZE,player.y));
  }

  if(gameState==="minigame"){
    updateMiniGame();
  }

  draw();
  drawMiniGame();

  requestAnimationFrame(loop);
}

// ===== 描画 =====
function draw(){

  ctx.clearRect(0,0,BASE_W,BASE_H);

  ctx.drawImage(currentMap==="field"?mapField:mapCave,0,0,BASE_W,BASE_H);

  if(currentMap==="field"){
    ctx.drawImage(caveIcon,cave.x,cave.y,24,24);
    ctx.fillStyle="purple";
    ctx.fillRect(enemy.x,enemy.y,SIZE,SIZE);
  }

  let list = currentMap==="field"?npcs:[caveNPC];
  list.forEach(n=>ctx.drawImage(n.img,n.x,n.y,SIZE,SIZE));

  if(currentMap==="cave"){
    ctx.drawImage(takara,treasure.x,treasure.y,SIZE,SIZE);
  }

  ctx.drawImage(hippo,player.x,player.y,SIZE,SIZE);
}