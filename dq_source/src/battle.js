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
const DR={
  slime(x,y,k=1,c='#3ecf9a'){E(x,y-42*k,74*k,44*k,c);E(x-30*k,y-72*k,22*k,18*k,c);E(x,y-80*k,24*k,20*k,c);E(x+30*k,y-72*k,22*k,18*k,c);E(x-30*k,y-62*k,15*k,7*k,'rgba(255,255,255,.55)');eyes(x,y-46*k,24*k,8*k);R(x-14*k,y-24*k,28*k,5*k,'#123');},
  bat(x,y,k=1){const w='#7a3aa8';Pl([[x-20*k,y-80*k],[x-120*k,y-125*k],[x-100*k,y-80*k],[x-80*k,y-72*k],[x-50*k,y-50*k]],w);Pl([[x+20*k,y-80*k],[x+120*k,y-125*k],[x+100*k,y-80*k],[x+80*k,y-72*k],[x+50*k,y-50*k]],w);E(x,y-65*k,38*k,42*k,'#5a2a88');Pl([[x-30*k,y-95*k],[x-24*k,y-125*k],[x-10*k,y-100*k]],'#5a2a88');Pl([[x+30*k,y-95*k],[x+24*k,y-125*k],[x+10*k,y-100*k]],'#5a2a88');eyes(x,y-70*k,15*k,7*k,'#d22');Pl([[x-12*k,y-48*k],[x-8*k,y-34*k],[x-4*k,y-48*k]],'#fff');Pl([[x+12*k,y-48*k],[x+8*k,y-34*k],[x+4*k,y-48*k]],'#fff');},
  ghost(x,y,k=1){Pl([[x-54*k,y],[x-58*k,y-80*k],[x-36*k,y-130*k],[x+36*k,y-130*k],[x+58*k,y-80*k],[x+54*k,y],[x+32*k,y-22*k],[x+10*k,y],[x-10*k,y-22*k],[x-32*k,y]],'rgba(225,235,255,.92)');E(x-20*k,y-90*k,9*k,14*k,'#112');E(x+20*k,y-90*k,9*k,14*k,'#112');E(x,y-58*k,12*k,10*k,'#112');},
  wolf(x,y,k=1){Pl([[x-76*k,y-18*k],[x-66*k,y-105*k],[x-38*k,y-132*k],[x-16*k,y-98*k],[x+16*k,y-98*k],[x+38*k,y-132*k],[x+66*k,y-105*k],[x+76*k,y-18*k],[x+28*k,y]],'#7a7a88');E(x,y-48*k,34*k,28*k,'#a8a8b8');R(x-12*k,y-62*k,24*k,14*k,'#222');E(x-34*k,y-82*k,9*k,7*k,'#f33');E(x+34*k,y-82*k,9*k,7*k,'#f33');Pl([[x-20*k,y-30*k],[x-14*k,y-12*k],[x-8*k,y-30*k]],'#fff');Pl([[x+20*k,y-30*k],[x+14*k,y-12*k],[x+8*k,y-30*k]],'#fff');},
  skel(x,y,k=1,c='#eee'){E(x,y-112*k,40*k,36*k,c);R(x-26*k,y-86*k,52*k,16*k,c);E(x-16*k,y-112*k,11*k,13*k,'#111');E(x+16*k,y-112*k,11*k,13*k,'#111');E(x-16*k,y-112*k,4*k,5*k,'#f33');E(x+16*k,y-112*k,4*k,5*k,'#f33');for(let i=0;i<5;i++)R(x-20*k+i*10*k,y-84*k,4*k,14*k,'#111');for(let i=0;i<4;i++)R(x-34*k,y-62*k+i*14*k,68*k,7*k,c);R(x-4*k,y-62*k,8*k,56*k,c);R(x-78*k,y-64*k,12*k,60*k,c);R(x+66*k,y-64*k,12*k,60*k,c);},
  imp(x,y,k=1){const r='#c8302a';Pl([[x-40*k,y-60*k],[x-120*k,y-110*k],[x-96*k,y-56*k]],'#8a1a1a');Pl([[x+40*k,y-60*k],[x+120*k,y-110*k],[x+96*k,y-56*k]],'#8a1a1a');E(x,y-48*k,42*k,46*k,r);E(x,y-112*k,32*k,30*k,r);Pl([[x-28*k,y-130*k],[x-34*k,y-165*k],[x-12*k,y-138*k]],'#fe8');Pl([[x+28*k,y-130*k],[x+34*k,y-165*k],[x+12*k,y-138*k]],'#fe8');eyes(x,y-112*k,14*k,7*k,'#a00');R(x-12*k,y-92*k,24*k,4*k,'#400');R(x+60*k,y-130*k,6*k,126*k,'#aaa');Pl([[x+50*k,y-130*k],[x+63*k,y-160*k],[x+76*k,y-130*k]],'#ccc');},
  golem(x,y,k=1){R(x-34*k,y-160*k,68*k,50*k,'#9a9aa8');R(x-64*k,y-112*k,128*k,90*k,'#8a8a98');R(x-100*k,y-108*k,38*k,84*k,'#7a7a88');R(x+62*k,y-108*k,38*k,84*k,'#7a7a88');R(x-48*k,y-22*k,38*k,22*k,'#6a6a78');R(x+10*k,y-22*k,38*k,22*k,'#6a6a78');R(x-22*k,y-142*k,16*k,10*k,'#fd3');R(x+6*k,y-142*k,16*k,10*k,'#fd3');R(x-48*k,y-96*k,96*k,6*k,'#5a5a68');R(x-48*k,y-66*k,96*k,6*k,'#5a5a68');},
  knight(x,y,k=1){const a='#5a5a78';E(x,y-134*k,32*k,30*k,a);R(x-18*k,y-142*k,36*k,8*k,'#111');E(x-8*k,y-138*k,3*k,3*k,'#f33');E(x+8*k,y-138*k,3*k,3*k,'#f33');Pl([[x-50*k,y-112*k],[x+50*k,y-112*k],[x+62*k,y-30*k],[x-62*k,y-30*k]],a);R(x-40*k,y-30*k,30*k,30*k,'#44445e');R(x+10*k,y-30*k,30*k,30*k,'#44445e');R(x-90*k,y-100*k,30*k,60*k,'#8a2a8a');R(x+70*k,y-170*k,8*k,130*k,'#ddd');Pl([[x+66*k,y-170*k],[x+74*k,y-198*k],[x+82*k,y-170*k]],'#fff');R(x+56*k,y-60*k,36*k,8*k,'#c9a227');},
  drake(x,y,k=1,c='#2a9a4a'){Pl([[x-90*k,y],[x-70*k,y-100*k],[x-30*k,y-150*k],[x+40*k,y-150*k],[x+80*k,y-110*k],[x+100*k,y-70*k],[x+60*k,y-60*k],[x+40*k,y-30*k],[x+20*k,y]],c);Pl([[x-30*k,y-150*k],[x-40*k,y-190*k],[x-8*k,y-152*k]],'#eee');Pl([[x+30*k,y-150*k],[x+44*k,y-188*k],[x+52*k,y-150*k]],'#eee');E(x+10*k,y-110*k,12*k,10*k,'#fd3');E(x+10*k,y-110*k,3*k,9*k,'#111');R(x+40*k,y-90*k,56*k,10*k,shade(c,-.4));Pl([[x+50*k,y-80*k],[x+56*k,y-64*k],[x+62*k,y-80*k]],'#fff');Pl([[x-70*k,y-70*k],[x-130*k,y-120*k],[x-110*k,y-50*k]],shade(c,-.25));},
  slimeKing(x,y,k=1.4){DR.slime(x,y,k,'#1a9f6f');Pl([[x-30*k,y-96*k],[x-34*k,y-126*k],[x-16*k,y-108*k],[x,y-134*k],[x+16*k,y-108*k],[x+34*k,y-126*k],[x+30*k,y-96*k]],'#ffd23f');},
  boneBoss(x,y,k=1.35){Pl([[x-120*k,y],[x-90*k,y-150*k],[x+90*k,y-150*k],[x+120*k,y]],'#4a1a6a');DR.skel(x,y,k,'#f0e8d8');Pl([[x-34*k,y-140*k],[x-38*k,y-176*k],[x-18*k,y-152*k],[x,y-182*k],[x+18*k,y-152*k],[x+38*k,y-176*k],[x+34*k,y-140*k]],'#ffd23f');},
  dragon(x,y,k=1.3){DR.drake(x,y,k,'#c8302a');},
  demonKing(x,y,k=1){
    Pl([[x-150*k,y],[x-112*k,y-176*k],[x+112*k,y-176*k],[x+150*k,y]],'#24082e');
    Pl([[x-112*k,y],[x-84*k,y-156*k],[x+84*k,y-156*k],[x+112*k,y]],'#8a1230');
    for(let i=-3;i<=3;i++)R(x+i*24*k-1.5*k,y-150*k,3*k,148*k,'rgba(0,0,0,.25)');
    E(x,y-86*k,58*k,72*k,'#3a1a5a');Pl([[x-54*k,y-122*k],[x+54*k,y-122*k],[x+38*k,y-36*k],[x-38*k,y-36*k]],'#2a1040');
    R(x-6*k,y-122*k,12*k,86*k,'#c9a227');R(x-40*k,y-70*k,80*k,8*k,'#c9a227');E(x,y-66*k,10*k,10*k,'#e8402a');
    R(x-98*k,y-122*k,24*k,86*k,'#4a1a6a');R(x+74*k,y-122*k,24*k,86*k,'#4a1a6a');
    for(const sx of[-1,1]){E(x+sx*72*k,y-132*k,30*k,22*k,'#c9a227');Pl([[x+sx*58*k,y-146*k],[x+sx*72*k,y-186*k],[x+sx*84*k,y-146*k]],'#e8d8a0');
      E(x+sx*86*k,y-34*k,13*k,13*k,'#5a2a7a');for(let c=-1;c<=1;c++)Pl([[x+sx*(86+c*8)*k,y-26*k],[x+sx*(86+c*8)*k+3*k,y-4*k],[x+sx*(86+c*8)*k+6*k,y-26*k]],'#eee');}
    E(x,y-172*k,42*k,42*k,'#6a2a8a');
    Pl([[x-42*k,y-188*k],[x-72*k,y-252*k],[x-14*k,y-206*k]],'#f0ead8');Pl([[x+42*k,y-188*k],[x+72*k,y-252*k],[x+14*k,y-206*k]],'#f0ead8');
    Pl([[x-30*k,y-206*k],[x-30*k,y-232*k],[x-15*k,y-216*k],[x,y-240*k],[x+15*k,y-216*k],[x+30*k,y-232*k],[x+30*k,y-206*k]],'#ffd23f');
    for(const sx of[-1,1]){E(x+sx*20*k,y-174*k,13*k,10*k,'rgba(255,40,20,.35)');Pl([[x+sx*34*k,y-186*k],[x+sx*8*k,y-172*k],[x+sx*8*k,y-164*k],[x+sx*34*k,y-172*k]],'#ff2a14');}
    R(x-22*k,y-148*k,44*k,7*k,'#1a0010');for(let t=-2;t<=2;t++)Pl([[x+t*8*k-3*k,y-148*k],[x+t*8*k,y-139*k],[x+t*8*k+3*k,y-148*k]],'#fff');
    R(x+110*k,y-200*k,8*k,194*k,'#a8a8b8');E(x+114*k,y-208*k,20*k,20*k,'#ff3a2a');E(x+114*k,y-208*k,10*k,10*k,'#ffd0a0');
  }
};
const MON={
  slime:{n:'プルン',hp:9,atk:7,def:2,exp:4,g:6},bat:{n:'ヨルコウモリ',hp:12,atk:9,def:3,exp:6,g:8},
  ghost:{n:'おばけ',hp:24,atk:18,def:8,exp:22,g:20},wolf:{n:'ガルム',hp:36,atk:24,def:10,exp:30,g:30},
  skel:{n:'がいこつ',hp:50,atk:32,def:16,exp:60,g:45},imp:{n:'ブチコ',hp:60,atk:40,def:20,exp:85,g:70},
  golem:{n:'いわおとこ',hp:110,atk:50,def:34,exp:140,g:110},knight:{n:'あくまのきし',hp:130,atk:62,def:40,exp:200,g:160},
  drake:{n:'ドレイク',hp:170,atk:72,def:44,exp:260,g:210},
  slimeKing:{n:'プルンキング',hp:70,atk:17,def:7,exp:60,g:150,boss:1,sp:'ぷるぷるタックル'},
  boneBoss:{n:'ほねおやぶん',hp:220,atk:38,def:20,exp:200,g:400,boss:1,sp:'ほねほねスラッシュ'},
  dragon:{n:'ファイアドラゴン',hp:480,atk:60,def:32,exp:600,g:900,boss:1,sp:'ごうかのほのお'},
  demonKing:{n:'まおう',hp:700,atk:70,def:37,exp:0,g:0,boss:1,sp:'やみのほのお'}
};
const ZT={1:['slime','bat'],1.5:['slime','bat','ghost'],2:['bat','ghost','wolf'],2.5:['wolf','ghost','skel'],3:['wolf','skel','imp'],3.5:['skel','imp','golem'],4:['imp','golem','knight'],4.5:['golem','knight','drake']};
const pickFoe=z=>{const l=ZT[z]||ZT[1];return l[rnd(l.length)];};
const BG={0:['#101830','#000'],1:['#1a3a1a','#000'],2:['#2a1a3a','#000'],3:['#3a1a10','#000'],4:['#2a0a2a','#000']};

const MC=document.createElement('canvas');MC.width=330*S;MC.height=300*S;const mctx=MC.getContext('2d');
const SC=document.createElement('canvas');SC.width=MC.width;SC.height=MC.height;const sctx=SC.getContext('2d');
function drawMonster(key,k,bob){
  const real=ctx;ctx=mctx;mctx.setTransform(S,0,0,S,0,0);mctx.clearRect(0,0,330,300);
  try{DR[key](165,262+bob,k);}finally{ctx=real;}
  mctx.save();mctx.setTransform(1,0,0,1,0,0);mctx.globalCompositeOperation='source-atop';
  const g=mctx.createLinearGradient(0,0,MC.width*.7,MC.height);g.addColorStop(0,'rgba(255,255,255,.30)');g.addColorStop(.45,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(10,0,40,.42)');
  mctx.fillStyle=g;mctx.fillRect(0,0,MC.width,MC.height);mctx.restore();
  sctx.setTransform(1,0,0,1,0,0);sctx.globalCompositeOperation='source-over';sctx.clearRect(0,0,SC.width,SC.height);sctx.drawImage(MC,0,0);
  sctx.globalCompositeOperation='source-in';sctx.fillStyle='#0a0612';sctx.fillRect(0,0,SC.width,SC.height);
  if(AURA[key]){const gl=ctx.createRadialGradient(339,190,10,339,190,150);gl.addColorStop(0,`rgba(${AURA[key]},.38)`);gl.addColorStop(1,`rgba(${AURA[key]},0)`);ctx.fillStyle=gl;ctx.fillRect(186,20,306,280);}
  const ox=174,oy=20;
  for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.drawImage(SC,ox+Math.cos(a)*1.6,oy+Math.sin(a)*1.6,330,300);}
  ctx.drawImage(MC,ox,oy,330,300);
}
const SZ={slimeKing:1.15,boneBoss:.9,dragon:.9,demonKing:.82,golem:.9,knight:.9,drake:.9};
const AURA={slimeKing:'80,140,255',boneBoss:'180,80,255',dragon:'255,140,40',demonKing:'255,50,40'};
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
  statBox(12,10,G.pc,150);
}
async function pcDamage(n){sfx('hit');G.shake=12;G.pc.hp=Math.max(0,G.pc.hp-n);await sleep(260);}
async function foeBlink(){for(let i=0;i<6;i++){foe.vis=!foe.vis;await sleep(55);}foe.vis=true;}
function dmgOf(atk,def,var_=4){return Math.max(1,Math.floor(atk-def/2+rnd(Math.max(2,atk/var_))));}

async function useSpell(pc,sp,inBattle){
  if(pc.mp<sp.mp){await say('MPが たりない！');return false;}
  pc.mp-=sp.mp;
  if(sp.t==='heal'){const v=sp.p+rnd(Math.ceil(sp.p/4));pc.hp=Math.min(pc.mhp,pc.hp+v);sfx('heal');await say(`${pc.name}は ${sp.n}を となえた！\nHPが ${v} かいふくした！`);return true;}
  if(!inBattle){pc.mp+=sp.mp;await say('いまは つかえない！');return false;}
  await say(`${pc.name}は ${sp.n}！`);
  if(sp.t==='atk'){const d=Math.max(3,sp.p+rnd(Math.ceil(sp.p/3))-Math.floor(foe.m.def/4));sfx('crit');await foeBlink();foe.m.hp-=d;await say(`${foe.m.n}に ${d}の ダメージ！`);}
  else if(sp.t==='stun'){if(foe.m.boss&&rnd(3)>0){await say('しかし こうかが なかった！');}else if(rnd(10)<(sp.pr||7)){foe.stun=3;await say(`${foe.m.n}は うっとりして うごけない！`);}else await say('しかし こうかが なかった！');}
  else if(sp.t==='steal'){if(foe.stolen||foe.m.boss)await say('しかし なにも ぬすめなかった！');else{foe.stolen=1;const g=Math.max(5,Math.floor(foe.m.g*1.5));G.gold+=g;sfx('buy');await say(`${g}Gを ぬすんだ！`);}}
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
  await say(m.boss?`${m.n}が たちふさがった！`:`${m.n}が あらわれた！`);
  let turn=0;
  while(true){
    turn++;
    const cmd=await choose(['たたかう','じゅもん','どうぐ','にげる'],{x:12,y:128,w:150});
    let acted=true;
    if(cmd===0){
      await say(`${pc.name}の こうげき！`);
      const crit=rnd(14)===0;let d=dmgOf(pc.atk+pc.wp,m.def,3);if(crit)d=Math.floor(pc.atk+pc.wp+rnd(8)+4);
      if(rnd(20)===0){await say('ミス！ ダメージを あたえられない！');}
      else{sfx(crit?'crit':'hit');await foeBlink();m.hp-=d;await say((crit?'かいしんの いちげき！\n':'')+`${m.n}に ${d}の ダメージ！`);}
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
    if(m.boss&&turn%3===0){
      await say(`${m.n}の ${m.sp}！`);
      const d=Math.floor(m.atk*(.8+rnd(30)/100)-(pc.def+pc.ar)/3);await pcDamage(Math.max(5,d));await say(`${pc.name}は ${Math.max(5,d)}の ダメージを うけた！`);
    }else if(rnd(18)===0){await say(`${m.n}の こうげき！\nひらりと みをかわした！`);}
    else{
      await say(`${m.n}の こうげき！`);
      let d=dmgOf(m.atk,pc.def+pc.ar,5);if(pc.guard)d=Math.floor(d/2);
      await pcDamage(d);await say(`${pc.name}は ${d}の ダメージを うけた！`);
    }
    if(pc.hp<=0){await say(`${pc.name}は ちからつきた……`);foe=null;G.mode='map';return 'lose';}
  }
}
const ITEMFX={'やくそう':{hp:30,v:8},'やきざかな':{hp:22,v:6},'さかなの スープ':{hp:60,v:10,mp:5},'ヨイヤミだんご':{hp:40,v:6,mp:12},'げんきの玉':{full:1}};
async function useItem(pc,name){
  const fx=ITEMFX[name];if(!fx||!(pc.items[name]>0)){await say('いまは つかえない！');return false;}
  pc.items[name]--;sfx('heal');
  if(fx.full){pc.hp=pc.mhp;pc.mp=pc.mmp;await say(`${name}が かがやいた！\nHPとMPが ぜんかいふくした！`);return true;}
  const v=fx.hp+rnd(fx.v||1);pc.hp=Math.min(pc.mhp,pc.hp+v);let t=`${pc.name}は ${name}を つかった！\nHPが ${v} かいふくした！`;
  if(fx.mp){pc.mp=Math.min(pc.mmp,pc.mp+fx.mp);t+=`\nMPも ${fx.mp} かいふくした！`;}
  await say(t);return true;
}
