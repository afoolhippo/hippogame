// ===== 基本 =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const dialogBox = document.getElementById("dialogBox");
const talkBtn = document.getElementById("talkBtn");
const stopBtn = document.getElementById("stopBtn");

const BASE_W = 320;
const BASE_H = 288;
const SIZE = 48;

// ===== 状態 =====
let currentMap = "field";
let talking = false;
let key = null;

// ===== 画像 =====
const load = src => { const i=new Image(); i.src=src; return i; };

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

const takarabakoImg = load("assets/takarabako.png");

// ===== 音 =====
const music1 = new Audio("assets/music1.mp3");
const music2 = new Audio("assets/music2.mp3");
const music3 = new Audio("assets/music3.mp3");

[music1, music2, music3].forEach(a=>a.volume=0.6);

// ===== プレイヤー =====
const player = { x:140, y:200 };

// ===== NPC =====
const npcsField = [
  { x:100,y:80,text:"茄子を食べたら、健康になれるかな？",img:npcImgs[0], music:music1 },
  { x:200,y:150,text:"生姜焼きを食べた僕は、しょうがないと呟いた・・・",img:npcImgs[1], music:music2 },
  { x:50,y:200,text:"歯磨きしようぜ！",img:npcImgs[2], music:music3 },
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
  return currentMap==="field" ? npcsField : [caveNPC];
}

// ===== ぬらりひょん =====
const nurarihyon = {
  x: 220,
  y: 80,
  w: SIZE,
  h: SIZE
};

// ===== 洞窟 =====
const caveEntrance = {
  x: BASE_W/2 - SIZE/2,
  y: 10,
  w: SIZE,
  h: SIZE
};

const caveSpawn = {
  x: BASE_W/2 - SIZE/2,
  y: BASE_H - SIZE - 10
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
  [music1, music2, music3].forEach(a=>{
    a.pause();
    a.currentTime=0;
  });
}
stopBtn.onclick = stopAllMusic;

// ===== 当たり判定 =====
function isHit(a, b){
  return (
    a.x < b.x + b.w &&
    a.x + SIZE > b.x &&
    a.y < b.y + b.h &&
    a.y + SIZE > b.y
  );
}

// ===== 会話 =====
talkBtn.onclick=()=>{

  if(talking){
    dialogBox.classList.add("hidden");
    talking=false;
    talkBtn.textContent="話す";
    return;
  }

  // 宝箱
  if(currentMap==="cave" && isHit(player, treasure)){

    if(!hasKey){
      dialogBox.textContent="鍵がかかっている・・・";
      dialogBox.classList.remove("hidden");
      talking=true;
      return;
    }

    dialogBox.innerHTML=`
    あなたはa fool hippo全曲視聴サイトへの入口を見つけました！<br>
    <a href="https://bakanakaba.wixsite.com/afoolhippo/portfolio" target="_blank" style="color:white;">▶サイトへ</a>
    `;
    dialogBox.classList.remove("hidden");
    talking=true;
    return;
  }

  // NPC
  for(let n of getNPCs()){
    const dx=(player.x+SIZE/2)-(n.x+SIZE/2);
    const dy=(player.y+SIZE/2)-(n.y+SIZE/2);
    if(Math.sqrt(dx*dx+dy*dy)<40){

      dialogBox.textContent=n.text;
      dialogBox.classList.remove("hidden");
      talking=true;

      stopAllMusic();
      n.music.currentTime=0;
      n.music.play();

      return;
    }
  }
};

// ===== 移動制限 =====
function clampPlayer(){
  player.x=Math.max(0,Math.min(BASE_W-SIZE,player.x));
  player.y=Math.max(0,Math.min(BASE_H-SIZE,player.y));
}

// ===== 描画 =====
function draw(){

  ctx.clearRect(0,0,BASE_W,BASE_H);

  ctx.drawImage(currentMap==="field"?mapField:mapCave,0,0,BASE_W,BASE_H);

  if(currentMap==="field"){
    ctx.drawImage(caveIcon,caveEntrance.x,caveEntrance.y,SIZE,SIZE);
  }

  getNPCs().forEach(n=>{
    ctx.drawImage(n.img,n.x,n.y,SIZE,SIZE);
  });

  // ぬらりひょん
  if(currentMap==="field"){
    ctx.fillStyle="purple";
    ctx.fillRect(nurarihyon.x,nurarihyon.y,SIZE,SIZE);
  }

  if(currentMap==="cave"){
    ctx.drawImage(takarabakoImg,treasure.x,treasure.y,SIZE,SIZE);
  }

  ctx.drawImage(hippo,player.x,player.y,SIZE,SIZE);
}

// ===== ループ =====
function loop(){

  if(gameState==="field"){

    if(!talking && key){
      if(key==="ArrowUp") player.y-=2;
      if(key==="ArrowDown") player.y+=2;
      if(key==="ArrowLeft") player.x-=2;
      if(key==="ArrowRight") player.x+=2;
    }

    // ミニゲーム突入
    if(currentMap==="field" && isHit(player,nurarihyon)){
      startMiniGame();
    }

    clampPlayer();
  }

  if(gameState==="minigame"){
    updateMiniGame();
  }

  draw();
  drawMiniGame();

  requestAnimationFrame(loop);
}

// ===== スタート =====
document.getElementById("titleImage").onclick=()=>{
  document.getElementById("titleScreen").classList.add("hidden");
  document.getElementById("gameScreen").classList.remove("hidden");
  loop();
};