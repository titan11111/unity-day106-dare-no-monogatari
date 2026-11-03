'use strict';
// ===== battle: DQ-style front-view, one foe, async flow =====
let AC=null;
function sfx(kind){
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    const seq={hit:[[220,.08,'square'],[140,.1,'square']],heal:[[523,.08,'sine'],[659,.08,'sine'],[784,.12,'sine']],
      lvl:[[523,.1,'square'],[659,.1,'square'],[784,.1,'square'],[1046,.25,'square']],win:[[392,.12,'square'],[523,.12,'square'],[659,.2,'square']],
      enc:[[196,.07,'sawtooth'],[147,.07,'sawtooth'],[196,.07,'sawtooth'],[147,.12,'sawtooth']],buy:[[880,.05,'square'],[1175,.08,'square']],
      step:[[90,.03,'triangle']],crit:[[880,.05,'sawtooth'],[440,.15,'sawtooth']],open:[[600,.07,'triangle'],[900,.1,'triangle']],door:[[120,.07,'sawtooth'],[170,.09,'sawtooth'],[240,.09,'sawtooth'],[200,.05,'triangle']],chest:[[330,.05,'triangle'],[523,.07,'square'],[659,.07,'square'],[784,.07,'square'],[1046,.22,'square']]}[kind]||[];
    let t=AC.currentTime;
    for(const [f,d,ty] of seq){const o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.value=f;g.gain.value=.06;
      o.connect(g);g.connect(AC.destination);o.start(t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.stop(t+d+.02);t+=d;}
  }catch(e){}
}
// ---- monster art ----
const E=(x,y,rx,ry,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,Math.abs(rx),Math.abs(ry),0,0,7);ctx.fill();};
const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
const Pl=(pts,c)=>{ctx.fillStyle=c;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
const eyes=(x,y,d,s,pu='#111')=>{E(x-d,y,s,s*1.2,'#fff');E(x+d,y,s,s*1.2,'#fff');E(x-d,y+2,s/2,s*.7,pu);E(x+d,y+2,s/2,s*.7,pu);};
const DR={};   // 敵のアートは monsters.js（Object.assign で登録）
const MON={
  slime:{n:'プルン',hp:9,atk:7,def:2,exp:4,g:6},bat:{n:'ヨルコウモリ',hp:12,atk:9,def:3,exp:6,g:8},
  ghost:{n:'おばけ',hp:24,atk:18,def:8,exp:22,g:20},wolf:{n:'ガルム',hp:36,atk:24,def:10,exp:30,g:30},
  skel:{n:'がいこつ',hp:50,atk:32,def:16,exp:60,g:45},imp:{n:'ブチコ',hp:60,atk:40,def:20,exp:85,g:70},
  golem:{n:'いわおとこ',hp:110,atk:50,def:34,exp:140,g:110},knight:{n:'あくまのきし',hp:130,atk:62,def:40,exp:200,g:160},
  drake:{n:'ドレイク',hp:170,atk:72,def:44,exp:260,g:210},
  slimeKing:{n:'プルンキング',hp:70,atk:17,def:7,exp:60,g:150,boss:1,sp:'ぷるぷるタックル'},
  boneBoss:{n:'ほねおやぶん',hp:220,atk:38,def:20,exp:200,g:400,boss:1,sp:'ほねほねスラッシュ'},
  dragon:{n:'ファイアドラゴン',hp:480,atk:60,def:32,exp:600,g:900,boss:1,sp:'ごうかのほのお'},
  tsukiusagi:{n:'ツキウサギ',hp:40,atk:26,def:20,exp:420,g:260,rare:1},
  demonKing:{n:'まおう',hp:700,atk:70,def:37,exp:0,g:0,boss:1,sp:'やみのほのお'}
};
const ZT={1:['slime','bat'],1.5:['slime','bat','ghost'],2:['bat','ghost','wolf'],2.5:['wolf','ghost','skel'],3:['wolf','skel','imp'],3.5:['skel','imp','golem'],4:['imp','golem','knight'],4.5:['golem','knight','drake']};
const pickFoe=z=>{const l=ZT[z]||ZT[1];return l[rnd(l.length)];};
const BG={0:['#101830','#000'],1:['#1a3a1a','#000'],2:['#2a1a3a','#000'],3:['#3a1a10','#000'],4:['#2a0a2a','#000']};

const MC=document.createElement('canvas');MC.width=330*S;MC.height=300*S;const mctx=MC.getContext('2d');
const SC=document.createElement('canvas');SC.width=MC.width;SC.height=MC.height;const sctx=SC.getContext('2d');
const EDC=document.createElement('canvas');EDC.width=MC.width;EDC.height=MC.height;const edctx=EDC.getContext('2d');
const BIGK={slime:1.28,bat:1.18,ghost:1.2,wolf:1.0,skel:1.16,imp:1.12,tsukiusagi:1.22};
// 縁取り光/影の三日月を作って重ねる（立体感）
function edgeBand(dx,dy,col,alpha){
  edctx.setTransform(1,0,0,1,0,0);edctx.globalCompositeOperation='source-over';edctx.clearRect(0,0,EDC.width,EDC.height);edctx.drawImage(MC,0,0);
  edctx.globalCompositeOperation='destination-out';edctx.drawImage(MC,dx,dy);
  edctx.globalCompositeOperation='source-in';edctx.fillStyle=col;edctx.fillRect(0,0,EDC.width,EDC.height);
  mctx.save();mctx.setTransform(1,0,0,1,0,0);mctx.globalCompositeOperation='source-atop';mctx.globalAlpha=alpha;mctx.drawImage(EDC,0,0);mctx.restore();
}
function drawMonster(key,k,bob){
  if(typeof MonsterArt!=='undefined'&&MonsterArt.draw(ctx,key,G.tick,foe))return;
  k*=BIGK[key]||1;
  const real=ctx;ctx=mctx;mctx.setTransform(S,0,0,S,0,0);mctx.clearRect(0,0,330,300);
  try{DR[key](165,262+bob,k);}finally{ctx=real;}
  // --- 3D lighting pass ---
  mctx.save();mctx.setTransform(1,0,0,1,0,0);mctx.globalCompositeOperation='source-atop';
  const W2=MC.width,H2=MC.height;
  // 形に沿った陰影：左上がハイライト、右下へ向かって暗く
  const rg=mctx.createRadialGradient(W2*.38,H2*.34,W2*.04,W2*.5,H2*.55,W2*.62);
  rg.addColorStop(0,'rgba(255,255,255,.22)');rg.addColorStop(.45,'rgba(255,255,255,0)');rg.addColorStop(1,'rgba(6,0,30,.55)');
  mctx.fillStyle=rg;mctx.fillRect(0,0,W2,H2);
  // 足もとの落ち影（接地感）
  const ag=mctx.createLinearGradient(0,H2*.78,0,H2);ag.addColorStop(0,'rgba(0,0,0,0)');ag.addColorStop(1,'rgba(0,0,20,.35)');
  mctx.fillStyle=ag;mctx.fillRect(0,0,W2,H2);
  mctx.restore();
  edgeBand(3.2*S,3.2*S,'#ffffff',.55);      // 左上のリムライト
  edgeBand(-3.2*S,-3.2*S,'#06001e',.5);      // 右下のかげ
  edgeBand(1.4*S,1.4*S,'#fff6d0',.45);       // 細いハイライトライン
  sctx.setTransform(1,0,0,1,0,0);sctx.globalCompositeOperation='source-over';sctx.clearRect(0,0,SC.width,SC.height);sctx.drawImage(MC,0,0);
  sctx.globalCompositeOperation='source-in';sctx.fillStyle='#0a0612';sctx.fillRect(0,0,SC.width,SC.height);
  const ox=174,oy=20;
  // 地面にのびる接地影＋ぼんやり光
  {const w=Math.min(150,70+k*54),sh=ctx.createRadialGradient(339,284,4,339,284,w);sh.addColorStop(0,'rgba(0,0,0,.65)');sh.addColorStop(1,'rgba(0,0,0,0)');
   ctx.save();ctx.translate(0,284);ctx.scale(1,.18);ctx.translate(0,-284);ctx.fillStyle=sh;ctx.fillRect(339-w,284-w,w*2,w*2);ctx.restore();}
  if(AURA[key]){const gl=ctx.createRadialGradient(339,190,10,339,190,150);gl.addColorStop(0,`rgba(${AURA[key]},.38)`);gl.addColorStop(1,`rgba(${AURA[key]},0)`);ctx.fillStyle=gl;ctx.fillRect(186,20,306,280);}
  // 黒いふちどり＋奥行きのドロップシャドウ
  ctx.save();ctx.globalAlpha*=.4;ctx.drawImage(SC,ox+7,oy+6,330,300);ctx.restore();
  for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.drawImage(SC,ox+Math.cos(a)*1.8,oy+Math.sin(a)*1.8,330,300);}
  ctx.drawImage(MC,ox,oy,330,300);
}
const SZ={slimeKing:1.15,boneBoss:.9,dragon:.9,demonKing:.82,golem:.9,knight:.9,drake:.9};
const AURA={tsukiusagi:'255,230,140',slimeKing:'80,140,255',boneBoss:'180,80,255',dragon:'255,140,40',demonKing:'255,50,40'};
let foe=null;
function drawBattle(){
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  box(176,10,326,300);
  const bgk=G.map&&G.map.kind==='world'?worldZone(G.px,G.py):Math.floor(G.map?.enc||1);
  const c=BG[Math.min(4,Math.max(1,bgk))]||BG[0];
  const gr=ctx.createLinearGradient(0,20,0,300);gr.addColorStop(0,c[0]);gr.addColorStop(1,'#000');
  ctx.fillStyle=gr;ctx.fillRect(186,20,306,280);
  for(let i=0;i<26;i++){ctx.fillStyle=`rgba(255,255,255,${.08+(i%4)*.05})`;ctx.fillRect(190+(i*83)%296,26+(i*47)%150,2,2);}
  const fg=ctx.createRadialGradient(339,288,5,339,288,150);fg.addColorStop(0,'rgba(0,0,0,.6)');fg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=fg;ctx.fillRect(186,190,306,110);
  if(foe&&foe.vis&&foe.a>0){ctx.globalAlpha=foe.a;drawMonster(foe.key,foe.big,Math.sin(G.tick/12)*3);ctx.globalAlpha=1;}
  VFX.draw('foe');
  statBox(12,10,G.pc,150);
  VFX.draw('pc');
}
async function pcDamage(n){if(foe)foe.attackAt=performance.now();sfx('hit');G.shake=12;G.pc.hp=Math.max(0,G.pc.hp-n);await sleep(420);}
async function foeBlink(){if(foe)foe.hitAt=performance.now();await sleep(340);}
function dmgOf(atk,def,var_=4){return Math.max(1,Math.floor(atk-def/2+rnd(Math.max(2,atk/var_))));}

async function useSpell(pc,sp,inBattle){
  if(pc.mp<sp.mp){await say('MPが たりない！');return false;}
  pc.mp-=sp.mp;
  if(sp.t==='heal'){const v=sp.p+rnd(Math.ceil(sp.p/4));pc.hp=Math.min(pc.mhp,pc.hp+v);sfx('heal');await VFX.spell(sp);await say(`${pc.name}は ${sp.n}を となえた！\nHPが ${v} かいふくした！`);return true;}
  if(!inBattle){pc.mp+=sp.mp;await say('いまは つかえない！');return false;}
  await say(`${pc.name}は ${sp.n}！`);
  if(sp.t==='atk'){const d=Math.max(3,sp.p+rnd(Math.ceil(sp.p/3))-Math.floor(foe.m.def/4));sfx('crit');await VFX.spell(sp);await foeBlink();foe.m.hp-=d;await say(`${foe.m.n}に ${d}の ダメージ！`);}
  else if(sp.t==='stun'){await VFX.spell(sp);if(foe.m.boss&&rnd(3)>0){await say('しかし こうかが なかった！');}else if(rnd(10)<(sp.pr||7)){foe.stun=3;await say(`${foe.m.n}は うっとりして うごけない！`);}else await say('しかし こうかが なかった！');}
  else if(sp.t==='steal'){await VFX.spell(sp);if(foe.stolen||foe.m.boss)await say('しかし なにも ぬすめなかった！');else{foe.stolen=1;const g=Math.max(5,Math.floor(foe.m.g*1.5));G.gold+=g;sfx('buy');await say(`${g}Gを ぬすんだ！`);}}
  return true;
}
function lvUp(pc){pc.lv++;const g=pc.gr;pc.mhp+=g.hp;pc.mmp+=g.mp;pc.atk+=g.atk;pc.def+=g.def;return pc.lv;}
const need=lv=>lv*lv*2+lv*6;
async function gainExp(pc,exp){
  pc.exp+=exp;
  while(pc.exp>=need(pc.lv)&&pc.lv<30){
    pc.exp-=need(pc.lv);const n=lvUp(pc);sfx('lvl');
    await say(`${pc.name}は レベルが ${n}に あがった！`);
    for(const sp of pc.spells)if(sp.lv===n)await say(`${sp.n}を おぼえた！`);
  }
}
async function battle(key,big){
  const base=MON[key],m=Object.assign({},base);m.mhp=m.hp;
  foe={m,key,vis:true,a:1,big:big||SZ[key]||1,stun:0};G.mode='battle';
  const pc=G.pc;sfx('enc');
  await sleep(200);
  await say(m.boss?`${m.n}が たちふさがった！`:m.rare?`よぞらに きらり……！\n${m.n}が とびだした！`:`${m.n}が あらわれた！`);
  let turn=0;
  while(true){
    turn++;
    const cmd=await choose(['たたかう','じゅもん','どうぐ','にげる'],{x:12,y:128,w:150});
    let acted=true;
    if(cmd===0){
      await say(`${pc.name}の こうげき！`);
      const crit=rnd(14)===0;let d=dmgOf(pc.atk+pc.wp,m.def,3);if(crit)d=Math.floor(pc.atk+pc.wp+rnd(8)+4);
      if(rnd(20)===0){await say('ミス！ ダメージを あたえられない！');}
      else{sfx(crit?'crit':'hit');await VFX.play('slash',{n:crit?2:1,col:crit?'#ffd23f':'#ffffff',pal:crit?'GOLD':'WHITE'});await foeBlink();m.hp-=d;await say((crit?'かいしんの いちげき！\n':'')+`${m.n}に ${d}の ダメージ！`);}
    }else if(cmd===1){
      const sps=pc.spells.filter(s=>s.lv<=pc.lv);
      if(!sps.length){await say('おぼえている じゅもんが ない！');acted=false;}
      else{const i=await choose(sps.map(s=>`${s.n} MP${s.mp}`),{x:176,y:130,cancel:1});
        if(i<0)acted=false;else acted=await useSpell(pc,sps[i],true);}
    }else if(cmd===2){
      const names=Object.keys(pc.items).filter(k=>pc.items[k]>0);
      if(!names.length){await say('どうぐを もっていない！');acted=false;}
      else{const i=await choose(names.map(n=>`${n} x${pc.items[n]}`),{x:176,y:130,cancel:1});
        if(i<0)acted=false;else acted=await useItem(pc,names[i]);}
    }else{
      if(m.boss){await say('にげられない！');}
      else if(rnd(4)>0){sfx('step');await say(`${pc.name}は にげだした！`);foe=null;G.mode='map';return 'run';}
      else await say('しかし まわりこまれてしまった！');
    }
    if(!acted){turn--;continue;}
    if(m.hp<=0){
      for(let a=1;a>0;a-=.1){foe.a=Math.max(0,a);await sleep(40);}
      sfx('win');await say(`${m.n}を たおした！`);
      if(m.exp||m.g){G.gold+=m.g;await say(`${m.exp}ポイントの けいけんちを かくとく！\n${m.g}ゴールドを てにいれた！`);await gainExp(pc,m.exp);}
      foe=null;G.mode='map';return 'win';
    }
    // foe turn
    if(foe.stun>0){foe.stun--;await say(`${m.n}は うごけない！`);continue;}
    if(m.rare&&rnd(3)===0){await say(`${m.n}は ぴょん と にげだした！`);foe=null;G.mode='map';return 'run';}
    if(m.boss&&turn%3===0){
      await say(`${m.n}の ${m.sp}！`);await VFX.special(m.sp);
      const d=Math.floor(m.atk*(.8+rnd(30)/100)-(pc.def+pc.ar)/3);await pcDamage(Math.max(5,d));await say(`${pc.name}は ${Math.max(5,d)}の ダメージを うけた！`);
    }else if(rnd(18)===0){await say(`${m.n}の こうげき！\nひらりと みをかわした！`);}
    else{
      await say(`${m.n}の こうげき！`);await VFX.play('claw');
      let d=dmgOf(m.atk,pc.def+pc.ar,5);if(pc.guard)d=Math.floor(d/2);
      await pcDamage(d);await say(`${pc.name}は ${d}の ダメージを うけた！`);
    }
    if(pc.hp<=0){await say(`${pc.name}は ちからつきた……`);foe=null;G.mode='map';return 'lose';}
  }
}
const ITEMFX={'やくそう':{hp:30,v:8},'やきざかな':{hp:22,v:6},'さかなの スープ':{hp:60,v:10,mp:5},'ヨイヤミだんご':{hp:40,v:6,mp:12},'げんきの玉':{full:1}};
async function useItem(pc,name){
  const fx=ITEMFX[name];if(!fx||!(pc.items[name]>0)){await say('いまは つかえない！');return false;}
  pc.items[name]--;sfx('heal');await VFX.play('heal',{big:fx.full?1:0,pal:fx.full?'GOLD':'GREEN'});
  if(fx.full){pc.hp=pc.mhp;pc.mp=pc.mmp;await say(`${name}が かがやいた！\nHPとMPが ぜんかいふくした！`);return true;}
  const v=fx.hp+rnd(fx.v||1);pc.hp=Math.min(pc.mhp,pc.hp+v);let t=`${pc.name}は ${name}を つかった！\nHPが ${v} かいふくした！`;
  if(fx.mp){pc.mp=Math.min(pc.mmp,pc.mp+fx.mp);t+=`\nMPも ${fx.mp} かいふくした！`;}
  await say(t);return true;
}
