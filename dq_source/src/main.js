'use strict';
// ===== main: map engine, movement, interaction, menus, draw, loop =====
G.open={};G.fx=[];G.map=null;G.px=0;G.py=0;G.dir=0;G.mv=null;G.steps=0;G.card=null;G.banner=null;G.home='v1';

const worldName=(x,y)=>y>=20?(x<17?'はじまりの 草原':'ヨイヤミの 荒野'):(x<31?'みなと街道':'たかね高原');
function refreshMap(){
  const m=G.map;if(!m)return;
  if(!m.doors){m.doors=[];for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)if(m.g[y][x]==='D')m.doors.push([x,y]);}
  for(const[x,y]of m.doors)m.g[y][x]=G.open[m.id+':'+x+','+y]?'d':'D';
  for(const c of m.chests)m.g[c.y][c.x]=G.f[c.id]?'O':'X';
  for(const d of m.dyn)m.g[d.y][d.x]=G.f[d.fl]?d.on:d.off;
}
async function warpTo(id,x,y,doFade=true,auto=true){
  if(doFade)await fade(1,220);
  G.map=MAPS[id];G.px=x;G.py=y;G.mv=null;G.steps=0;
  if(G.map.kind==='village')G.home=id;
  refreshMap();
  G.banner={text:(G.map.id==='world'?worldName(x,y):G.map.name)+(G.map.kind==='village'&&typeof villageTag==='function'?villageTag(G.map.id):''),t:110};G.wname=G.map.id==='world'?worldName(x,y):null;
  if(doFade)await fade(0,220);
  if(auto&&G.mode==='map'&&G.pc)autoSave();
}
const WOK='.,=xfzc';
function npcWander(canStart){
  const m=G.map;
  for(const n of npcsOn(m.id)){
    if(!n.wander||n.mon)continue;
    if(n.hx===undefined){n.hx=n.x;n.hy=n.y;n.wait=30+rnd(120);}
    if(n.mv){if(++n.mv.t>=n.mv.d)n.mv=null;continue;}
    if(!canStart||window.NOWANDER)continue;
    if(n.wait>0){n.wait--;continue;}
    const d=rnd(4),nx=n.x+FACE[d][0],ny=n.y+FACE[d][1];n.dir=d;n.wait=40+rnd(160);
    if(Math.max(Math.abs(nx-n.hx),Math.abs(ny-n.hy))>n.wander)continue;
    if(nx<0||ny<0||nx>=m.w||ny>=m.h||!WOK.includes(m.g[ny][nx])||npcAt(nx,ny))continue;
    if((nx===G.px&&ny===G.py)||(G.mv&&nx===G.px+G.mv.dx&&ny===G.py+G.mv.dy))continue;
    n.mv={fx:n.x,fy:n.y,t:0,d:14};n.x=nx;n.y=ny;
  }
}
const npcAt=(x,y)=>npcsOn(G.map.id).find(n=>n.x===x&&n.y===y);
function canWalk(x,y){
  const m=G.map;
  if(x<0||y<0||x>=m.w||y>=m.h)return false;
  if(!WALK.includes(m.g[y][x]))return false;
  return !npcAt(x,y);
}
function mapUpdate(){
  if(G.mv){
    if(++G.mv.t>=(G.mv.d||8)){G.px+=G.mv.dx;G.py+=G.mv.dy;G.mv=null;onStep();if(G.busy||UI.length)return;}
    else return;
  }
  if(took('a')){interact();return;}
  if(took('b')){menu();return;}
  const kk=k=>keys[k]||pressed[k];
  const d=kk('u')?[0,-1,1]:kk('d')?[0,1,0]:kk('l')?[-1,0,2]:kk('r')?[1,0,3]:null;
  if(d){G.dir=d[2];const tx=G.px+d[0],ty=G.py+d[1];
    if(G.map.g[ty]&&G.map.g[ty][tx]==='D'&&!npcAt(tx,ty)){G.busy=true;openDoor(tx,ty).finally(()=>{G.busy=false;});return;}
    if(canWalk(tx,ty))G.mv={dx:d[0],dy:d[1],t:0,d:(RUN.t||RUN.h||RUN.p)?5:8};}
}
async function onStep(){
  const m=G.map,t=m.g[G.py][G.px];
  if(m.kind==='world'){
    const w=m.warps[G.px+','+G.py];
    if(w){G.busy=true;sfx('open');await warpTo(w.to,w.x,w.y);G.busy=false;return;}
  }else if(t==='E'){
    G.busy=true;sfx('open');const r=m.ret;await warpTo(r.map,r.x,r.y);G.busy=false;return;
  }
  let zone=0,rate=0;
  if(m.kind==='world'){const wn=worldName(G.px,G.py);if(wn!==G.wname){G.wname=wn;G.banner={text:wn,t:110};}
    zone=worldZone(G.px,G.py);rate=t==='F'?9:t==='='?32:15;}
  else if(m.kind==='cave'){zone=m.enc;rate=9;}
  if(rate&&++G.steps>5&&rnd(rate)===0){
    G.steps=0;G.busy=true;
    const key=pickFoe(zone);
    const r=await battle(key);
    if(r==='lose')await onLose();
    G.busy=false;
  }
}
const FACE=[[0,1],[0,-1],[-1,0],[1,0]],OPP=[1,0,3,2];
const TILE_MSG={b:'ベッドだ。ふかふかしている。',t:'テーブルだ。',K:'たなだ。なにも めぼしい ものは ない。',S:'せきぞうだ。じっと こちらを みている。',W:'ふるい いどだ。つめたい みずが わきでている。',q:'ろうそくが ゆらめいている。',P:'ふるい はしらだ。',k:'カウンターだ。',O:'からっぽの たからばこだ。',a:'ふねが ゆらゆら ゆれている。',I:'とうだいだ。よるも ひかりを おくる。',n:'さかなを ほす あみだ。',r:'たるや はこが つみあげて ある。',i:'いちばの みせの のれんだ。',u:'かじやの かなとこだ。まだ あつい。',v:'こうざんの いりぐちだ。ふかく くらい……。',p:'まちかどの あかりだ。',L:'いしの とうろうだ。',l:'いしの とうろうだ。やさしく ともっている。'};
async function interact(){
  const [dx,dy]=FACE[G.dir];
  let tx=G.px+dx,ty=G.py+dy;
  const m=G.map;
  let n=npcAt(tx,ty),t=m.g[ty]&&m.g[ty][tx];
  if(!n&&(t==='k'||t==='J')){tx+=dx;ty+=dy;n=npcAt(tx,ty);}
  G.busy=true;
  try{
    if(n){const od=n.dir;n.dir=OPP[G.dir];await talkTo(n);n.dir=od;}
    else if(t==='D'){await openDoor(tx,ty);}
    else if(t==='X'){const c=m.chests.find(c=>c.x===tx&&c.y===ty);if(c)await openChest(c);}
    else if(TILEEV[m.id+':'+tx+','+ty]){await TILEEV[m.id+':'+tx+','+ty]();}
    else if(t==='N')await say(m.id==='v1'?'「ここは はじまりの村」':m.id==='v2'?'「みなと村　さかなが おいしい」':m.id==='v3'?'「たかね村　かぜが つよい」':'「ヨイヤミ村　この さきに まおう城」');
    else if(TILE_MSG[t])await say(TILE_MSG[t]);
  }finally{G.busy=false;}
}
async function openDoor(x,y){
  const m=G.map;sfx('door');m.g[y][x]='e';G.fx.push({k:'dust',x,y,t:0});await sleep(150);
  m.g[y][x]='d';G.open[m.id+':'+x+','+y]=1;refreshMap();await sleep(120);
}
function hintLabel(){
  const m=G.map,[dx,dy]=FACE[G.dir];let tx=G.px+dx,ty=G.py+dy;
  let t=m.g[ty]&&m.g[ty][tx],n=npcAt(tx,ty);
  if(!n&&(t==='k'||t==='J')){tx+=dx;ty+=dy;n=npcAt(tx,ty);t=m.g[ty]&&m.g[ty][tx];}
  if(n)return n.mon?'たたかう':'はなす';
  if(TILEEV[m.id+':'+tx+','+ty])return 'しらべる';
  if(t==='X')return 'たからばこを あける';
  if(t==='N')return 'よむ';
  return null;
}
async function menu(){
  G.busy=true;const pc=G.pc;
  while(true){
    const i=await choose(['じゅもん','どうぐ','つよさ','もくてき','セーブ','ロード','とじる'],{x:12,y:84,w:160,cancel:1});
    if(i<0||i===6)break;
    if(i===0){
      const sps=pc.spells.filter(s=>s.lv<=pc.lv&&s.t==='heal');
      if(!sps.length){await say('いま つかえる じゅもんが ない。');continue;}
      const j=await choose(sps.map(s=>`${s.n} MP${s.mp}`),{x:176,y:84,cancel:1});
      if(j>=0)await useSpell(pc,sps[j],false);
    }else if(i===1){
      const names=Object.keys(pc.items).filter(k=>pc.items[k]>0);
      if(!names.length){await say('どうぐを もっていない。');continue;}
      const j=await choose(names.map(n=>`${n} x${pc.items[n]}`),{x:176,y:84,cancel:1});
      if(j>=0)await useItem(pc,names[j]);
    }else if(i===2){
      await say(`${pc.name}　LV ${pc.lv}\nHP ${pc.hp}/${pc.mhp}　MP ${pc.mp}/${pc.mmp}\nこうげき ${pc.atk+pc.wp}　しゅび ${pc.def+pc.ar}`);
      await say(`ぶき：${pc.wpn}\nぼうぐ：${pc.arn}\nつぎの レベルまで ${need(pc.lv)-pc.exp}　${G.gold}G`);
    }else if(i===3)await say('いまの もくてき：\n'+goalText());
    else if(i===4)await saveMenu();
    else if(i===5){if(await loadMenu())break;}
  }
  G.busy=false;
}

// ---- drawing ----
function camera(){
  const m=G.map;let ox=G.px*T,oy=G.py*T;
  if(G.mv){ox+=G.mv.dx*G.mv.t*T/8;oy+=G.mv.dy*G.mv.t*T/8;}
  let cx=ox+T/2-W/2,cy=oy+T/2-H/2;
  cx=m.w*T<=W?-(W-m.w*T)/2:Math.max(0,Math.min(m.w*T-W,cx));
  cy=m.h*T<=H?-(H-m.h*T)/2:Math.max(0,Math.min(m.h*T-H,cy));
  return [Math.round(cx),Math.round(cy),ox,oy];
}
function drawMap(){
  const m=G.map,[cx,cy,ox,oy]=camera();
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  const fr=(G.tick>>5)&1,fr4=(G.tick>>4)&3,out=(m.kind==='village'||m.kind==='world')?'out':'in';
  const x0=Math.max(0,Math.floor(cx/T)),x1=Math.min(m.w-1,Math.floor((cx+W)/T)),y0=Math.max(0,Math.floor(cy/T)),y1=Math.min(m.h-1,Math.floor((cy+H)/T));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const ch=m.g[y][x];drawTile(ch,x*T-cx,y*T-cy,m.floor,ANIM4.includes(ch)?fr4:fr,(x*7+y*13)%5,out);}
  if(m.id==='world')ctx.drawImage(castleImg(),21*T-cx,24*T-cy,5*T,5*T);
  if(typeof drawGround==='function')drawGround(m,cx,cy,x0,x1,y0,y1);
  const list=[];
  for(const n of npcsOn(m.id))list.push({y:n.y*T,f:()=>{
    if(n.mon){const b=Math.sin(G.tick/14+n.x)*2;DR[n.mon](n.x*T-cx+T/2,n.y*T-cy+T-2+b,n.mk);}
    else{let px=n.x*T,py=n.y*T,st=0;if(n.mv){const p=n.mv.t/n.mv.d;px=(n.mv.fx+(n.x-n.mv.fx)*p)*T;py=(n.mv.fy+(n.y-n.mv.fy)*p)*T;st=1+((G.tick>>2)&1);}
      drawChar(ctx,px-cx,py-cy,n.spr,n.dir,st);}}});
  if(typeof critterList==='function')critterList(m,cx,cy,list);
  list.push({y:oy,f:()=>drawChar(ctx,ox-cx,oy-cy,CHARS[G.story].spr,G.dir,G.mv?1+((G.mv.t>>2)&1):0)});
  list.sort((a,b)=>a.y-b.y).forEach(o=>o.f());
  if(typeof drawAtmos==='function')drawAtmos(m,cx,cy);
  for(let i=G.fx.length-1;i>=0;i--){const f=G.fx[i],life=f.k==='spark'?60:28;f.t++;
    const sx=f.x*T-cx+T/2,sy=f.y*T-cy+T/2,p=f.t/life;
    if(f.k==='spark'){for(let j=0;j<12;j++){const a=j*.5236+f.t*.03,rr=6+p*30+(j%3)*4;ctx.globalAlpha=Math.max(0,1-p);ctx.fillStyle=j%2?'#fff3a0':'#ffd23f';ctx.fillRect(sx+Math.cos(a)*rr-1.5,sy-6+Math.sin(a)*rr*.7-p*14-1.5,3,3);}}
    else{for(let j=0;j<6;j++){ctx.globalAlpha=Math.max(0,.6-p*.6);ctx.fillStyle='#c8b8a0';ctx.beginPath();ctx.arc(sx+(j-2.5)*5,sy+12-p*14-(j%2)*3,3+p*3,0,7);ctx.fill();}}
    ctx.globalAlpha=1;if(f.t>=life)G.fx.splice(i,1);}
  if(G.mode==='map'&&!UI.length&&!G.busy&&!G.mv){const lb=hintLabel();if(lb){const s='A  '+lb,w=tw(s,13)+20,bx=Math.max(4,Math.min(W-w-4,ox-cx+T/2-w/2));let by=oy-cy-28+Math.sin(G.tick/8)*1.5;if(by<78)by=oy-cy+T+4;
    ctx.fillStyle='rgba(0,0,0,.88)';ctx.beginPath();ctx.roundRect(bx,by,w,20,6);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
    text('A',bx+10,by+3,'#ffd23f',13);text(lb,bx+10+tw('A  ',13),by+3,'#fff',13);}}
  if(G.mode==='map'&&G.pc){
    ctx.globalAlpha=.92;box(8,8,236,64);ctx.globalAlpha=1;
    text(`HP ${G.pc.hp}/${G.pc.mhp}  MP ${G.pc.mp}/${G.pc.mmp}`,22,18,G.pc.hp<=G.pc.mhp/4?'#ff6':'#fff',15);
    text(`LV ${G.pc.lv}   ${G.gold} G`,22,42,'#fff',15);
  }
  if(G.banner&&G.banner.t>0){G.banner.t--;const w=tw(G.banner.text,18)+56;box(W/2-w/2,86,w,48);text(G.banner.text,W/2-w/2+28,100,'#ffd23f',18);}
}
function drawTitle(){
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  for(let i=0;i<60;i++){const x=(i*97+Math.floor(G.tick/(2+i%3)))%W,y=(i*53)%H;ctx.fillStyle=i%4?'#334':'#fff';ctx.fillRect(x,y,2,2);}
  text('だれの ものがたり？',W/2-tw('だれの ものがたり？',40)/2+W/2-W/2,110,'#ffd23f',40);
  text('～ ひとびと伝説 ～',W/2-tw('～ ひとびと伝説 ～',22)/2,170,'#fff',22);
  const cs=['hero','vb','mayor','minister','hermit','gal','rogue'];
  try{if(clearedList().includes('cat'))cs.push('cat_mike');}catch(e){}
  cs.forEach((s,i)=>drawChar(ctx,W/2-cs.length*20+i*40,230+Math.sin(G.tick/10+i)*4,s,0,0));
  if((G.tick>>5)&1)text('PRESS  A  (タップ)',W/2-tw('PRESS  A  (タップ)',20)/2,360,'#fff',20);
  text('ぼうけんは ゆうしゃ から はじまる……？',W/2-tw('ぼうけんは ゆうしゃ から はじまる……？',14)/2,400,'#8af',14);
}
function drawCard(){
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  if(G.card){const s=G.card;text(s,W/2-tw(s,26)/2,H/2-20,'#fff',26);}
  else{text('？',W/2-12,H/2-40,'#fff',48);}
}
function draw(){
  ctx.save();ctx.setTransform(S,0,0,S,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  if(G.shake>0){ctx.translate(rnd(9)-4,rnd(9)-4);G.shake--;}
  if(G.mode==='map'){drawMap();if(G.fish)drawFish();}
  else if(G.mode==='battle')drawBattle();
  else if(G.mode==='title')drawTitle();
  else drawCard();
  uiDraw();
  if(G.fade>0){ctx.fillStyle=`rgba(0,0,0,${G.fade})`;ctx.fillRect(0,0,W,H);}
  ctx.restore();
}
function frame(){
  if(G.paused){pollPad();requestAnimationFrame(frame);return;}
  G.tick++;pollPad();
  uiUpdate();if(pressed.a)G.apress=(G.apress||0)+1;
  if(G.mode==='map'&&G.map)npcWander(!UI.length&&!G.busy&&!G.fish);
  if(!UI.length&&!G.busy){
    if(G.mode==='map'&&G.map)mapUpdate();
    else if(G.mode==='title'&&took('a')){G.busy=true;titleFlow().finally(()=>{G.busy=false;});}
  }
  if(!UI.length)clearKeys();
  draw();
  requestAnimationFrame(frame);
}
cv.addEventListener('pointerdown',()=>{pressed.a=true;});
G.mode='title';
(document.fonts&&document.fonts.load?document.fonts.load('16px DotGothic16').catch(()=>{}):Promise.resolve()).then(()=>frame());

window.onPad=()=>{G.banner={text:'🎮 コントローラー つながった！',t:150};};
