// ===== 要素 =====
const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const dialogBox = document.getElementById("dialogBox");
const talkBtn = document.getElementById("talkBtn");
const stopBtn = document.getElementById("stopBtn");

// ===== サイズ =====
const BASE_W = 320;
const BASE_H = 288;
const SIZE = 48;

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

const hippo = load("assets/hippo.png");
const mapImg = load("assets/map.png");
const npcImgs = [
  load("assets/npc1.png"),
  load("assets/npc2.png"),
  load("assets/npc3.png")
];

// ===== プレイヤー =====
const player = { x: 50, y: 50, speed: 2 };

// ===== NPC =====
const npcs = [
  { x:150,y:80,text:"茄子を食べたら、健康になれるかな？",music:new Audio("assets/music1.mp3"),img:npcImgs[0]},
  { x:200,y:150,text:"生姜焼きを食べた僕は、しょうがないと呟いた･･･",music:new Audio("assets/music2.mp3"),img:npcImgs[1]},
  { x:80,y:200,text:"歯磨きしようぜ！",music:new Audio("assets/music3.mp3"),img:npcImgs[2]}
];

// ===== canvas =====
function resize(){
  const scale = Math.min(window.innerWidth/BASE_W, window.innerHeight/BASE_H);
  canvas.width = BASE_W;
  canvas.height = BASE_H;
  canvas.style.width = BASE_W*scale+"px";
  canvas.style.height = BASE_H*scale+"px";
}
window.addEventListener("resize",resize);
resize();

// ===== スタート =====
function start(){
  titleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  gameStarted = true;

  // ★音声ロック解除
  npcs.forEach(n=>{
    n.music.play().then(()=>n.music.pause()).catch(()=>{});
  });

  loop();
}
titleScreen.addEventListener("pointerdown",start);

// ===== 移動 =====
document.addEventListener("keydown",e=>currentKey=e.key);
document.addEventListener("keyup",()=>currentKey=null);

document.querySelectorAll("[data-key]").forEach(btn=>{
  btn.addEventListener("pointerdown",()=>{
    currentKey = btn.dataset.key;
  });
  btn.addEventListener("pointerup",()=>{
    currentKey = null;
  });
});

// ===== 会話ボタン =====
talkBtn.addEventListener("pointerdown",()=>{
  if(!gameStarted) return;

  if(talking){
    closeDialog();
  }else{
    checkNPC();
  }
});

// ===== BGM停止 =====
stopBtn.addEventListener("pointerdown",stopMusic);

function stopMusic(){
  npcs.forEach(n=>{
    n.music.pause();
    n.music.currentTime = 0;
  });
}

// ===== NPC判定 =====
function checkNPC(){
  for(let n of npcs){
    const dx=(player.x+SIZE/2)-(n.x+SIZE/2);
    const dy=(player.y+SIZE/2)-(n.y+SIZE/2);
    const d=Math.sqrt(dx*dx+dy*dy);

    if(d<40){
      talk(n);
      return;
    }
  }
}

// ===== 会話 =====
function talk(n){
  talking=true;
  dialogBox.classList.remove("hidden");
  dialogBox.textContent=n.text;

  stopMusic();

  // ★確実再生
  n.music.currentTime=0;
  n.music.play().catch(()=>{});

  talkBtn.textContent="とじる";
}

function closeDialog(){
  talking=false;
  dialogBox.classList.add("hidden");
  talkBtn.textContent="話す";
}

// ===== 描画 =====
function draw(){
  ctx.clearRect(0,0,BASE_W,BASE_H);

  ctx.drawImage(mapImg,0,0,BASE_W,BASE_H);

  npcs.forEach(n=>{
    ctx.drawImage(n.img,n.x,n.y,SIZE,SIZE);
  });

  ctx.drawImage(hippo,player.x,player.y,SIZE,SIZE);
}

// ===== ループ =====
function loop(){
  if(!talking && currentKey){
    if(currentKey==="ArrowUp") player.y-=2;
    if(currentKey==="ArrowDown") player.y+=2;
    if(currentKey==="ArrowLeft") player.x-=2;
    if(currentKey==="ArrowRight") player.x+=2;
  }

  draw();
  requestAnimationFrame(loop);
}