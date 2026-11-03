'use strict';
// ===== 世界の ひろがり: 時間帯・水と光・人生のつながり(後日談)・町の時間イベント =====
const PH_LEN=5400,PHN=['あさ','ゆうがた','よる'];
G.clock=0;G.lastPh=0;
const phaseNow=()=>Math.floor(G.clock/PH_LEN)%3;
const dayCycle=()=>Math.floor(G.clock/(PH_LEN*3));
const TINT=[[255,236,190,.05],[255,125,55,.18],[8,14,66,.46]];
function isDusk(m){return m.id==='v4'||(m.id==='world'&&typeof worldZone==='function'&&worldZone(G.px,G.py)===4);}
function dayTint(m){
  if(isDusk(m))return[150,70,150,.16];
  const p=phaseNow(),f=(G.clock%PH_LEN)/PH_LEN,a=TINT[p],b=TINT[(p+1)%3],k=f>.85?(f-.85)/.15:0;
  return a.map((v,i)=>v+(b[i]-v)*k);
}
function drawWorldFx(m,cx,cy){
  if(G.mode!=='map')return;
  if(!UI.length&&!G.busy)G.clock++;
  const ph=phaseNow();
  if(ph!==G.lastPh){G.lastPh=ph;if((m.kind==='village'||m.kind==='world')&&!G.busy)G.banner={text:['あさに なった！','ひが かたむいてきた……','よるに なった……'][ph],t:110};}
  if(m.kind!=='village'&&m.kind!=='world')return;
  const x0=Math.max(0,Math.floor(cx/T)),x1=Math.min(m.w-1,Math.floor((cx+W)/T)),y0=Math.max(0,Math.floor(cy/T)),y1=Math.min(m.h-1,Math.floor((cy+H)/T));
  const t=G.tick,tn=dayTint(m),night=Math.max(0,Math.min(1,(tn[3]-.1)/.24));
  ctx.save();
  // 水面: ゆれる光の筋ときらめき
  ctx.lineWidth=1.2;ctx.lineCap='round';
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    if(m.g[y][x]!=='~')continue;
    const px=x*T-cx,py=y*T-cy,p=t*.05+x*1.7+y*2.3,a=.1+.13*Math.sin(p);
    if(a>0){ctx.strokeStyle=`rgba(255,255,255,${a})`;const yy=py+10+Math.sin(p*.7)*3;ctx.beginPath();ctx.moveTo(px+5,yy);ctx.quadraticCurveTo(px+16,yy-3,px+27,yy);ctx.stroke();}
    if(((t>>3)+x*5+y*11)%27===0){ctx.fillStyle='rgba(255,255,255,.85)';const gx=px+6+((x*13+y*7)%18),gy=py+8+((x*5+y*3)%16);ctx.fillRect(gx,gy,2,1.2);ctx.fillRect(gx+.5,gy-1,1,3.2);}
  }
  // 時間帯の色
  if(tn[3]>.02){ctx.fillStyle=`rgba(${tn[0]|0},${tn[1]|0},${tn[2]|0},${tn[3]})`;ctx.fillRect(0,0,W,H);}
  // 灯り: 夜は足もとに光だまり、灯台は光の帯
  ctx.globalCompositeOperation='lighter';
  for(let y=y0-1;y<=y1+1;y++)for(let x=x0-1;x<=x1+1;x++){
    const c=m.g[y]&&m.g[y][x];if(!c)continue;
    const sx=x*T-cx+16,sy=y*T-cy;
    if((c==='l'||c==='p')&&night>.05){const fl=.9+.1*Math.sin(t*.13+x*3),r=54*fl,q=ctx.createRadialGradient(sx,sy+22,2,sx,sy+22,r);q.addColorStop(0,`rgba(255,200,110,${.42*night})`);q.addColorStop(1,'rgba(255,200,110,0)');ctx.fillStyle=q;ctx.fillRect(sx-r,sy+22-r,r*2,r*2);}
    if(c==='I'){const a=t*.022,k=.1+.3*night;
      for(const d of[0,Math.PI]){ctx.save();ctx.translate(sx,sy+5);ctx.rotate(a+d);const gr=ctx.createLinearGradient(0,0,190,0);gr.addColorStop(0,`rgba(255,240,170,${k})`);gr.addColorStop(1,'rgba(255,240,170,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(190,-26);ctx.lineTo(190,26);ctx.closePath();ctx.fill();ctx.restore();}
      const hg=ctx.createRadialGradient(sx,sy+5,1,sx,sy+5,22);hg.addColorStop(0,`rgba(255,240,170,${.5*(.4+night)})`);hg.addColorStop(1,'rgba(255,240,170,0)');ctx.fillStyle=hg;ctx.fillRect(sx-22,sy-17,44,44);}
  }
  ctx.restore();
}
{const _atm=drawAtmos;drawAtmos=function(m,cx,cy){_atm(m,cx,cy);drawWorldFx(m,cx,cy);};}

// ---- 町の じかんイベント ----
function villageTag(id){
  const p=phaseNow();
  if(id==='v2'&&p===0)return '　～朝市～';
  if(id==='v3'&&p===2)return '　～星見の よる～';
  if(id==='v4')return '　～よいやみの うたげ～';
  return '';
}
async function worldPost(n){   // 話しかけたあとの おまけ(町イベント)
  const p=phaseNow(),cy=dayCycle();
  if(n.id==='stargazer'&&p===2&&G.pc&&!G.f['star'+cy]){G.f['star'+cy]=1;G.pc.mp=G.pc.mmp;sfx('win');
    await sayAll(['ほしぞらを ふたりで みあげた。','……こころが すうっと かるくなる。\n（MPが ぜんかいふくした！）']);}
  if(n.id==='dancer'&&p>=1&&G.pc&&!G.f['dance'+Math.floor(G.clock/PH_LEN)]){G.f['dance'+Math.floor(G.clock/PH_LEN)]=1;G.pc.hp=G.pc.mhp;G.pc.mp=G.pc.mmp;sfx('win');
    await sayAll(['かげおどりの わに さそわれた！\nひとびとと いっしょに おどる……。','からだじゅうに ちからが わいてきた！\n（HPとMPが ぜんかいふくした！）']);}
}
// ---- 人生のつながり(ほかの人生をクリアすると、町の人の話が変わる) ----
const ECHO={
  daughter:[['vb','むすめ','パパが ようすを みに きてくれたの！\nもう ねつ、すっかり さがったよ。']],
  wifeB:[['vb','おかみさん','うちの ひと、むすめの ところへ とんでいったわ。\nくわを もったまま よ。']],
  inn1:[['hermit','やどの あるじ','さいきん、ほこらの ごろうにんが スープを のみに きたよ。\nなみだぐんで しまってね。']],
  boutique:[['gal','ブティックの てんいん','みなと村の ギャルちゃん、ショーで ゆうしょう したのよ！\nあの リボン、うちの おみせのなの。']],
  galmom:[['gal','ギャルの ママ','うちの こ、ショーで ゆうしょう したの！ ママ なきそう！']],
  guardJail:[['rogue','ろうやの かんしゅ','あの ごろつき……たからを ほこらへ とどけた と きく。\nみょうな やつ だ。']],
  harbor:[['cat','みなとの かんりにん','きいてくれ。つりたいかいの さかなの たいが きえたんだ。\nそれに さいきん、のらねこが まるまる ふとって いる……。']],
  fishvend:[['cat','さかなやの おかみ','うちの さかなも ねこに ぬすまれたわ。\nまったく、あの みけねこ！']],
  netman:[['cat','あみつくろいの ろうじん','あみに ねこの あしあとが……。\nうみ神さまも あきれて おられよう。']]
};
async function echoTalk(n){
  const e=ECHO[n.id];if(!e)return;
  const cl=clearedList();
  for(const [sid,name,line] of e){
    if(G.story===sid||!cl.includes(sid))continue;
    const key='ech_'+n.id+sid;if(G.f[key])continue;G.f[key]=1;
    await say(line,name);
  }
}
