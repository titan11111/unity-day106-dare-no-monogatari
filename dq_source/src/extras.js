'use strict';
// ===== extras: 世界の作り込み(接地影・ビネット・小動物・蝶・ホタル・鳥) + コントローラー診断表示(Pキー) =====
const GROUNDCH=',.=x';
// ---- 接地影: 建物の足元(下)と右側に落ちる影を事前描画して貼る ----
const SHADOW=(()=>{
  const mk=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w*S;c.height=h*S;const g=c.getContext('2d');g.scale(S,S);fn(g);return c;};
  return {
    b:mk(32,10,g=>{const q=g.createLinearGradient(0,0,0,10);q.addColorStop(0,'rgba(10,6,24,.34)');q.addColorStop(1,'rgba(10,6,24,0)');g.fillStyle=q;g.fillRect(0,0,32,10);}),
    r:mk(8,32,g=>{const q=g.createLinearGradient(0,0,8,0);q.addColorStop(0,'rgba(10,6,24,.24)');q.addColorStop(1,'rgba(10,6,24,0)');g.fillStyle=q;g.fillRect(0,0,8,32);}),
    v:null
  };
})();
function drawGround(m,cx,cy,x0,x1,y0,y1){
  if(m.kind!=='village'&&m.kind!=='world')return;
  const g=m.g;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const ch=g[y][x];if(ch!=='H'&&ch!=='D'&&ch!=='d'&&ch!=='e')continue;
    const below=g[y+1]&&g[y+1][x],right=g[y][x+1];
    if(below&&GROUNDCH.includes(below))ctx.drawImage(SHADOW.b,x*T-cx,(y+1)*T-cy,T,10);
    if(right&&GROUNDCH.includes(right))ctx.drawImage(SHADOW.r,(x+1)*T-cx,y*T-cy,8,T);
  }
}
// ---- 小動物(ニワトリ・ネコ): 近づくと逃げる。当たり判定なし(見た目だけ) ----
const CR={map:null,list:[]};
function critInit(m){
  CR.map=m.id;CR.list=[];
  const cfg={v1:['hen','hen','hen','cat'],v2:['hen','hen','cat'],v3:['cat','cat'],v4:['cat','cat']}[m.id];if(!cfg)return;
  const r=prng(m.w*977+m.h*131+m.id.charCodeAt(1));
  for(const k of cfg){
    for(let tr=0;tr<80;tr++){const x=1+Math.floor(r()*(m.w-2)),y=1+Math.floor(r()*(m.h-2));
      if(GROUNDCH.includes(m.g[y][x])&&!npcAt(x,y)&&!(x===G.px&&y===G.py)&&!CR.list.some(c=>c.tx===x&&c.ty===y)){
        CR.list.push({k,x,y,tx:x,ty:y,wait:30+Math.floor(r()*120),dir:r()<.5?1:-1,ph:r()*6,run:0});break;}}
  }
}
function critFree(m,x,y,self){
  return x>0&&y>0&&x<m.w-1&&y<m.h-1&&GROUNDCH.includes(m.g[y][x])&&!npcAt(x,y)&&!(x===G.px&&y===G.py)&&!(G.mv&&x===G.px+G.mv.dx&&y===G.py+G.mv.dy)&&!CR.list.some(c=>c!==self&&Math.round(c.tx)===x&&Math.round(c.ty)===y);
}
function critStep(m,c){
  const dxp=c.x-G.px,dyp=c.y-G.py,dist=Math.hypot(dxp,dyp);
  if(c.tx!==c.x||c.ty!==c.y){
    const sp=(c.run?.095:.032),dx=c.tx-c.x,dy=c.ty-c.y,d=Math.hypot(dx,dy);
    if(d<=sp){c.x=c.tx;c.y=c.ty;c.wait=c.run?4:40+Math.floor(Math.random()*160);c.run=0;}
    else{c.x+=dx/d*sp;c.y+=dy/d*sp;if(Math.abs(dx)>.01)c.dir=dx>0?1:-1;}
    return;
  }
  if(c.wait>0&&dist>1.7){c.wait--;return;}
  const opts=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>({x:c.x+a,y:c.y+b})).filter(p=>critFree(m,p.x,p.y,c));
  if(!opts.length){c.wait=30;return;}
  if(dist<1.7){opts.sort((a,b)=>Math.hypot(b.x-G.px,b.y-G.py)-Math.hypot(a.x-G.px,a.y-G.py));c.tx=opts[0].x;c.ty=opts[0].y;c.run=1;}
  else{const p=opts[Math.floor(Math.random()*opts.length)];c.tx=p.x;c.ty=p.y;c.run=0;}
}
function drawCritter(c,sx,sy){ // sx,sy = 足元中心(画面座標)
  const g=ctx,t=G.tick,moving=c.tx!==c.x||c.ty!==c.y,hop=moving?Math.abs(Math.sin(t*(c.run?.55:.28)+c.ph))*(c.run?3.2:1.6):0;
  g.save();g.translate(sx,sy);g.scale(c.dir,1);g.lineJoin='round';g.lineCap='round';
  ell(g,0,1,8,2.4,'rgba(0,0,0,.28)');
  if(c.k==='hen'){
    const peck=!moving&&((t+c.ph*30|0)%110<14)?3:0;
    g.strokeStyle='#e08a2a';g.lineWidth=1.1;for(const lx of[-1.5,2]){g.beginPath();g.moveTo(lx,-4-hop*.3);g.lineTo(lx,-.5);g.stroke();}
    ell(g,0,-8-hop,6.2,4.8,LG(g,0,-13,0,-3,'#ffffff','#e2ddd0'),'#4a4034');
    poly(g,[[-5,-9-hop],[-9,-12-hop],[-6.5,-6.5-hop]],'#f4f0e6','#4a4034'); // 尾
    ell(g,3,-12.5-hop+peck*.6,3.3,3.2,'#ffffff','#4a4034');
    g.fillStyle='#e03a3a';g.fillRect(2.2,-16.2-hop+peck*.6,2.2,1.8);
    poly(g,[[5.8,-12.5-hop+peck*.6],[8.2,-11.7-hop+peck*.9],[5.8,-11-hop+peck*.6]],'#f2a23a','#6a4a1a');
    g.fillStyle='#1d1530';g.fillRect(3.8,-13.4-hop+peck*.6,1,1);
  }else{ // cat
    const sit=!moving&&c.wait>20,tail=Math.sin(t*.12+c.ph)*2.4;
    g.strokeStyle='#8a5a2a';g.lineWidth=2;g.beginPath();g.moveTo(-6,-4-hop);g.quadraticCurveTo(-11,-8+tail,-9,-13+tail);g.stroke();g.lineWidth=1.1;g.strokeStyle='#3a2a1a';
    if(sit){ell(g,-1,-6,5.2,6.2,LG(g,0,-12,0,0,'#e8a84a','#c0803a'),'#3a2a1a');ell(g,3.5,-13,4.2,3.8,'#eeb458','#3a2a1a');
      poly(g,[[1,-15],[1.6,-19],[4,-16]],'#e8a84a','#3a2a1a');poly(g,[[5,-16],[7.4,-18.6],[7,-14.6]],'#e8a84a','#3a2a1a');}
    else{ell(g,-.5,-6-hop,7,3.8,LG(g,0,-10,0,-2,'#eeb458','#c0803a'),'#3a2a1a');ell(g,6,-8.4-hop,3.6,3.3,'#eeb458','#3a2a1a');
      poly(g,[[4.2,-10.2-hop],[4.8,-13.4-hop],[6.8,-10.8-hop]],'#e8a84a','#3a2a1a');poly(g,[[7.4,-10.6-hop],[9.6,-12.6-hop],[9,-9.2-hop]],'#e8a84a','#3a2a1a');
      g.strokeStyle='#3a2a1a';for(const lx of[-4,-1,2.5,5]){g.beginPath();g.moveTo(lx,-3-hop*.5);g.lineTo(lx+(moving?Math.sin(t*.5+lx)*1.2:0),-.4);g.stroke();}}
    g.fillStyle='#1d1530';const ex=sit?4.8:7.4,ey=sit?-13.6:-8.8-hop;g.fillRect(ex,ey,1,1.2);
    g.strokeStyle='rgba(120,70,30,.7)';g.lineWidth=.9;for(let i=0;i<2;i++){g.beginPath();g.moveTo(-3+i*3,sit?-9:-8.6-hop);g.lineTo(-2.6+i*3,sit?-5:-5.6-hop);g.stroke();}
  }
  g.restore();
}
function critterList(m,cx,cy,list){
  if(m.kind!=='village')return;
  if(CR.map!==m.id)critInit(m);
  if(!UI.length&&G.mode==='map')for(const c of CR.list)critStep(m,c);
  for(const c of CR.list)list.push({y:c.y*T+T-3,f:()=>drawCritter(c,c.x*T-cx+T/2,c.y*T-cy+T-3)});
}
// ---- 空気: ビネット / 蝶 / ホタル / 鳥の群れ ----
const ATM={vig:null,fly:[],birds:[],nextBird:600,map:null};
// ビネット(画面の四隅を少し暗く): canvasに全画面ブレンドすると重いので、GPU合成されるDOM(CSS)で重ねる
const VGD=(()=>{const d=document.createElement('div');d.id='vg';d.style.cssText='position:fixed;pointer-events:none;display:none;z-index:2;';document.body.appendChild(d);return d;})();
function vgPlace(){try{const r=cv.getBoundingClientRect();Object.assign(VGD.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});}catch(e){}}
addEventListener('resize',vgPlace);addEventListener('orientationchange',vgPlace);setInterval(vgPlace,700);
function vgSet(kind){
  if(VGD._k===kind)return;VGD._k=kind;VGD.style.display=kind?'block':'none';if(!kind)return;vgPlace();
  VGD.style.background=kind==='cave'?'radial-gradient(ellipse at center,rgba(8,4,20,0) 38%,rgba(8,4,20,.62) 100%)':'radial-gradient(ellipse at center,rgba(8,4,20,0) 52%,rgba(8,4,20,.34) 100%)';
}
function atmInit(m,cx,cy){
  ATM.map=m.id;ATM.fly=[];
  const night=(m.id==='v4'||m.id==='castle'||(m.id==='world'&&typeof worldZone==='function'&&worldZone(G.px,G.py)===4));
  const day=!night&&(m.kind==='village'||m.id==='world')&&m.id!=='v3';
  const n=night?6:day?2:0;   // 蝶は控えめに(昼2匹)、ホタルは6匹
  for(let i=0;i<n;i++)ATM.fly.push({k:night?'fire':'bf',x:Math.random()*W,y:60+Math.random()*(H-90),a:Math.random()*6.28,s:.25+Math.random()*.35,ph:Math.random()*9,c:['#ffe27a','#ff9ac8','#ffffff','#9ad0ff'][i%4]});
}
function drawAtmos(m,cx,cy){
  if(m.kind==='cave'||m.kind==='shrine'){vgSet('cave');return;}
  if(m.kind!=='village'&&m.kind!=='world'){vgSet(null);return;}
  vgSet('out');
  if(ATM.map!==m.id)atmInit(m,cx,cy);
  const t=G.tick;
  for(const f of ATM.fly){
    f.a+=(Math.sin(t*.03+f.ph)*.06);f.x+=Math.cos(f.a)*f.s;f.y+=Math.sin(f.a)*f.s*.7;
    if(f.x<-10)f.x=W+8;if(f.x>W+10)f.x=-8;if(f.y<50)f.y=H-30;if(f.y>H-10)f.y=60;
    if(f.k==='bf'){const fl=Math.abs(Math.sin(t*.45+f.ph)),w=1+fl*3.4;
      ctx.save();ctx.translate(f.x,f.y+Math.sin(t*.09+f.ph)*2);ctx.fillStyle=f.c;ctx.strokeStyle='rgba(30,10,40,.8)';ctx.lineWidth=.8;
      ctx.beginPath();ctx.ellipse(-w*.8,-1,w,2.6,-.4,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(w*.8,-1,w,2.6,.4,0,7);ctx.fill();ctx.stroke();
      ctx.fillStyle='#2a1a30';ctx.fillRect(-.5,-2,1,4);ctx.restore();}
    else{const p=.45+.55*Math.sin(t*.05+f.ph),r=3+p*5;
      const q=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,r);q.addColorStop(0,`rgba(255,240,140,${.9*p})`);q.addColorStop(1,'rgba(255,240,140,0)');ctx.fillStyle=q;ctx.fillRect(f.x-r,f.y-r,r*2,r*2);}
  }
  // 鳥の群れ(昼の外のみ、たまに画面を横切る)
  if(m.id!=='v4'&&!(m.id==='world'&&typeof worldZone==='function'&&worldZone(G.px,G.py)===4)){
    if(--ATM.nextBird<=0&&!ATM.birds.length){const dir=Math.random()<.5?1:-1,y0=70+Math.random()*(H*.5),n=3+Math.floor(Math.random()*3);
      for(let i=0;i<n;i++)ATM.birds.push({x:dir>0?-20-i*22:W+20+i*22,y:y0+i*9*(i%2?1:-1),v:dir*(1.3+Math.random()*.3),ph:Math.random()*6});
      ATM.nextBird=1500+Math.random()*2400;}
    for(let i=ATM.birds.length-1;i>=0;i--){const b=ATM.birds[i];b.x+=b.v;const fl=Math.sin(t*.4+b.ph)*4;
      ctx.save();ctx.globalAlpha=.16;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(b.x+14,b.y+90,5,1.8,0,0,7);ctx.fill();ctx.restore(); // 地面に落ちる影
      ctx.strokeStyle='#2a2438';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(b.x-6,b.y-fl);ctx.quadraticCurveTo(b.x-3,b.y-fl-2,b.x,b.y);ctx.quadraticCurveTo(b.x+3,b.y-fl-2,b.x+6,b.y-fl);ctx.stroke();
      if(b.x<-60||b.x>W+60)ATM.birds.splice(i,1);}
  }
}
// ---- コントローラー診断(Pキーで表示切替): 実機で反応しないときの原因切り分け用 ----
(function(){
  const _d=draw;
  draw=function(){_d();if(G.mode!=='map')vgSet(null);
    if(!PADINFO.show)return;
    ctx.save();ctx.setTransform(S,0,0,S,0,0);ctx.globalAlpha=.9;box(8,8,W-16,112);ctx.globalAlpha=1;
    text('コントローラー診断（Pキーで閉じる）',22,16,'#ffd23f',13);
    text(PADINFO.ok?(PADINFO.id?('接続: '+PADINFO.id):'未接続（ボタンを1つ押してね）'):('Gamepad API 使用不可: '+PADINFO.err),22,38,PADINFO.ok?'#fff':'#ff8a8a',13);
    text('mapping: '+PADINFO.mapping+'  ボタン: '+PADINFO.btn.join(',')+'  focus: '+(document.hasFocus()?'有':'無'),22,60,'#fff',13);
    text('axes: '+PADINFO.axes.join(' '),22,82,'#fff',13);
    ctx.restore();};
})();
