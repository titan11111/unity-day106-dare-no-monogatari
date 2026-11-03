'use strict';
// ===== sprites v2: 3x-resolution vector-painted tiles & chibi characters =====
const OBJ='XObtkKSWNqPUnriumLlp';
const ANIM='BMEa';const ANIM4='~.,TFlpW';   // ANIM4: 4コマ(風にそよぐ草木・水面のきらめき・灯りのゆらぎ)
const swy=(fr,v)=>[0,.7,0,-.7][(fr+v)&3];
function hx(c){if(c[0]!=='#')return[0,0,0];if(c.length===4)return[1,2,3].map(i=>parseInt(c[i]+c[i],16));return[1,3,5].map(i=>parseInt(c.substr(i,2),16));}
function shade(c,a){const[r,g,b]=hx(c);const t=a<0?0:255,p=Math.abs(a);return `rgb(${Math.round(r+(t-r)*p)},${Math.round(g+(t-g)*p)},${Math.round(b+(t-b)*p)})`;}
const LG=(g,x0,y0,x1,y1,a,b)=>{const q=g.createLinearGradient(x0,y0,x1,y1);q.addColorStop(0,a);q.addColorStop(1,b);return q;};
const spk=(g,r,n,cols,s=1)=>{for(let i=0;i<n;i++){g.fillStyle=cols[Math.floor(r()*cols.length)];g.fillRect(r()*32,r()*32,s,s);}};
const ell=(g,x,y,a,b,f,st)=>{g.beginPath();g.ellipse(x,y,a,b,0,0,7);if(f){g.fillStyle=f;g.fill();}if(st){g.strokeStyle=st;g.stroke();}};
const rrect=(g,x,y,w,h,rad,f,st)=>{g.beginPath();g.roundRect(x,y,w,h,rad);if(f){g.fillStyle=f;g.fill();}if(st){g.strokeStyle=st;g.stroke();}};
const poly=(g,pts,f,st)=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();if(f){g.fillStyle=f;g.fill();}if(st){g.strokeStyle=st;g.stroke();}};

const PT={};
// ---------- terrain / floors ----------
PT['.']=(g,r,fr,k,v)=>{const sw=swy(fr|0,v|0);g.fillStyle=LG(g,0,0,32,32,'#43a845','#379a3a');g.fillRect(0,0,32,32);
  spk(g,r,60,['#2f8a33','#2c8030','#4fb852'],1.2);
  for(let i=0;i<14;i++){const x=r()*30+1,y=r()*30+2;g.strokeStyle=r()<.5?'#2b7d2f':'#58c25a';g.lineWidth=.9;g.beginPath();g.moveTo(x,y);g.lineTo(x-1+r()*2+sw*(y>16?.7:1.1),y-3);g.stroke();}};
PT[',']=(g,r,fr,k,v)=>{PT['.'](g,r,fr,k,v);const cs=['#ff7aa8','#ffe34a','#ffffff','#b79bff'];
  for(let i=0;i<5;i++){const x=4+r()*24,y=5+r()*22,c=cs[i%4];for(let k=0;k<5;k++)ell(g,x+Math.cos(k*1.256)*1.8,y+Math.sin(k*1.256)*1.8,1.2,1.2,c);ell(g,x,y,1,1,'#f5a623');}};
PT['=']=(g,r)=>{g.fillStyle=LG(g,0,0,32,32,'#d2ab6c','#bf955a');g.fillRect(0,0,32,32);spk(g,r,70,['#b08848','#e0bd80','#a47e42'],1.4);
  for(let i=0;i<5;i++){const x=r()*28+2,y=r()*28+2;ell(g,x,y+.6,2.2,1.4,'rgba(0,0,0,.18)');ell(g,x,y,2,1.3,'#9a9a98');ell(g,x-.5,y-.4,1,.6,'#c9c9c6');}};
PT['~']=(g,r,fr)=>{g.fillStyle=LG(g,0,0,0,32,'#3a78e6','#2354b8');g.fillRect(0,0,32,32);g.lineWidth=1.1;const o=(fr|0)*1.7;
  for(let i=0;i<4;i++){const x=(r()*26+o)%30,y=4+i*7+r()*3;g.strokeStyle=i%2?'rgba(255,255,255,.55)':'rgba(170,210,255,.6)';g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+2.5,y-2,x+5,y);g.quadraticCurveTo(x+7.5,y+2,x+10,y);g.stroke();}
  spk(g,r,8,['rgba(255,255,255,.5)'],1.2);
  for(let i=0;i<3;i++){const gx=2+r()*27,gy=2+r()*27;if(((fr|0)+i)%4===0){g.fillStyle='rgba(255,255,255,.95)';g.fillRect(gx,gy,1.8,1.2);g.fillRect(gx+.6,gy-1,.6,3.2);}}};
PT['x']=(g,r)=>{g.fillStyle=LG(g,0,0,32,32,'#54465f','#43364e');g.fillRect(0,0,32,32);spk(g,r,60,['#362a40','#6a5a78','#3d3048'],1.5);
  g.strokeStyle='rgba(20,10,30,.45)';g.lineWidth=.9;for(let i=0;i<3;i++){let x=r()*30,y=r()*30;g.beginPath();g.moveTo(x,y);for(let k=0;k<3;k++){x+=r()*6-3;y+=r()*6;g.lineTo(x,y);}g.stroke();}};
PT['f']=(g,r)=>{g.fillStyle='#b98649';g.fillRect(0,0,32,32);
  for(let i=0;i<4;i++){g.fillStyle=LG(g,0,i*8,0,i*8+8,i%2?'#c0904f':'#b58247','#a8763c');g.fillRect(0,i*8,32,8);
    g.fillStyle='rgba(60,30,8,.55)';g.fillRect(0,i*8+7,32,1);
    g.strokeStyle='rgba(90,50,16,.3)';g.lineWidth=.7;for(let k=0;k<3;k++){const y=i*8+1.5+r()*5,x=r()*20;g.beginPath();g.moveTo(x,y);g.lineTo(x+6+r()*8,y);g.stroke();}
    g.fillStyle='rgba(60,30,8,.55)';g.fillRect(i%2?9:21,i*8,1,7);}};
PT['z']=(g,r)=>{g.fillStyle='#8a8a9c';g.fillRect(0,0,32,32);
  for(let a=0;a<2;a++)for(let b=0;b<2;b++){const x=a*16,y=b*16;g.fillStyle=LG(g,x,y,x+16,y+16,'#b0b0c2','#9494a8');g.fillRect(x+.5,y+.5,15,15);
    g.fillStyle='rgba(255,255,255,.4)';g.fillRect(x+.5,y+.5,15,1);g.fillRect(x+.5,y+.5,1,15);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x+.5,y+15,15,1);g.fillRect(x+15,y+.5,1,15);}
  spk(g,r,14,['rgba(0,0,0,.1)','rgba(255,255,255,.12)'],1.4);};
PT['c']=(g,r)=>{g.fillStyle=LG(g,0,0,32,32,'#6f5d4d','#5f4f41');g.fillRect(0,0,32,32);spk(g,r,60,['#54463a','#8a7660','#4a3d33'],1.4);
  for(let i=0;i<4;i++){const x=r()*28+2,y=r()*28+2;ell(g,x,y+.5,2.4,1.5,'rgba(0,0,0,.2)');ell(g,x,y,2.2,1.4,'#8a7d70');ell(g,x-.5,y-.4,1,.6,'#b0a396');}};
PT['C']=(g,r)=>{g.fillStyle='#2b2030';g.fillRect(0,0,32,32);
  for(let i=0;i<5;i++){const x=r()*28+2,y=r()*28+2,rad=4+r()*5;const q=g.createRadialGradient(x-rad*.3,y-rad*.3,1,x,y,rad);q.addColorStop(0,'#5a4856');q.addColorStop(1,'#322636');g.fillStyle=q;g.beginPath();g.arc(x,y,rad,0,7);g.fill();}
  spk(g,r,24,['rgba(0,0,0,.35)','rgba(255,255,255,.07)'],1.5);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(0,29,32,3);};
PT['H']=(g,r)=>{g.fillStyle='#5a4028';g.fillRect(0,0,32,32);
  for(let row=0;row<4;row++){const off=row%2?0:-8;for(let x=off;x<32;x+=16)rrect(g,x+.8,row*8+.8,14.4,6.4,1.2,LG(g,0,row*8,0,row*8+8,shade('#a07d58',.12),shade('#8d6c48',-.05)));}
  spk(g,r,25,['rgba(0,0,0,.18)','rgba(255,255,255,.12)'],1.2);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,0,32,1.5);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(0,30.5,32,1.5);};
PT['D']=(g,r)=>{PT['H'](g,r);g.lineWidth=1.2;g.strokeStyle='#1d0f04';g.beginPath();g.moveTo(6,32);g.lineTo(6,14);g.arc(16,14,10,Math.PI,0);g.lineTo(26,32);g.closePath();g.fillStyle=LG(g,6,0,26,0,'#8a5a2a','#5e3a18');g.fill();g.stroke();
  g.strokeStyle='rgba(0,0,0,.35)';for(const x of[11,16,21]){g.beginPath();g.moveTo(x,6);g.lineTo(x,32);g.stroke();}ell(g,22,21,1.4,1.4,'#ffd23f','#6a4a00');};
function tree(g,cx,base,sc,sw=0){
  g.save();g.translate(cx,base);g.scale(sc,sc);g.lineWidth=1.2/sc;
  ell(g,0,-1,10,3.5,'rgba(0,0,0,.28)');
  rrect(g,-2.5,-12,5,12,1.5,LG(g,-3,0,3,0,'#8a5622','#5b3514'),'#3a220c');
  const blob=(x,y,rad,c1,c2)=>{const q=g.createRadialGradient(x-rad*.35,y-rad*.4,rad*.1,x,y,rad);q.addColorStop(0,c1);q.addColorStop(1,c2);g.beginPath();g.arc(x,y,rad,0,7);g.fillStyle=q;g.fill();g.strokeStyle='#14381a';g.stroke();};
  blob(-5.5+sw*.6,-15,7,'#5cc25a','#1f7a2a');blob(5.5+sw*.6,-15,7,'#5cc25a','#1f7a2a');blob(0+sw,-21,8,'#7ad96c','#2a8c32');
  g.restore();}
PT['T']=(g,r,fr,k,v)=>{PT['.'](g,r,fr);tree(g,16,30,1,swy(fr|0,v|0));};
PT['F']=(g,r,fr,k,v)=>{PT['.'](g,r,fr);const w=swy(fr|0,v|0);tree(g,16,19,.5,w*.6);tree(g,8,26,.62,-w*.7);tree(g,23,30,.78,w*.8);};
PT['^']=(g,r)=>{PT['.'](g,r);g.lineWidth=1.2;ell(g,16,28,14,3,'rgba(0,0,0,.25)');
  poly(g,[[1,29],[10,10],[16,15],[22,5],[31,29]],'#8d8294','#2d2536');
  poly(g,[[22,5],[31,29],[20,29],[19,14]],'#6f6577','#2d2536');
  poly(g,[[10,10],[16,15],[13,29],[1,29]],'#a89dae','#2d2536');
  poly(g,[[22,5],[19,14],[22,12],[25,15],[26,10]],'#ffffff','#2d2536');poly(g,[[10,10],[8,15],[10,14],[12,16],[13,13]],'#ffffff','#2d2536');};
PT['h']=(g,r)=>{PT['.'](g,r);g.lineWidth=1.1;g.beginPath();g.ellipse(16,30,15,17,0,Math.PI,0);g.fillStyle=LG(g,0,13,0,30,'#6fd070','#3f9f46');g.fill();g.strokeStyle='#2a7a30';g.stroke();
  g.strokeStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(16,30,11,13,0,Math.PI*1.15,Math.PI*1.5);g.stroke();};
PT['B']=(g,r,fr)=>{PT['~'](g,r,fr);g.lineWidth=1;g.strokeStyle='#2a1608';for(let x=0;x<32;x+=5.3)rrect(g,x,4,5,24,1,LG(g,0,4,0,28,'#c28a48','#8e5e2c'),'#2a1608');g.fillStyle='#5a3818';g.fillRect(0,3,32,2.5);g.fillRect(0,26.5,32,2.5);};
PT['|']=(g,r)=>{PT['.'](g,r);g.lineWidth=1;g.strokeStyle='#2a1608';ell(g,16,28,15,2,'rgba(0,0,0,.2)');rrect(g,0,14,32,3,1,'#b07a40','#2a1608');rrect(g,0,21,32,3,1,'#b07a40','#2a1608');
  for(const x of[3,16,29])rrect(g,x-1.7,10,3.4,18,1,LG(g,x-2,0,x+2,0,'#c8904c','#8a5a28'),'#2a1608');};
PT['G']=(g,r)=>{g.fillStyle=LG(g,0,0,32,0,'#a8142c','#c8243e');g.fillRect(0,0,32,32);g.fillStyle='#e8c040';g.fillRect(0,0,3,32);g.fillRect(29,0,3,32);g.fillStyle='#8a1022';g.fillRect(3,0,1.5,32);g.fillRect(27.5,0,1.5,32);
  g.lineWidth=1.2;poly(g,[[16,4],[22,16],[16,28],[10,16]],null,'#e8c040');ell(g,16,16,1.6,1.6,'#e8c040');spk(g,r,12,['rgba(0,0,0,.12)'],1.5);};
PT['M']=(g,r,fr)=>{g.fillStyle='#2a0c06';g.fillRect(0,0,32,32);
  for(let i=0;i<4;i++){const x=r()*28+2+(fr?1.5:0),y=r()*28+2,rad=6+r()*5;const q=g.createRadialGradient(x,y,1,x,y,rad);q.addColorStop(0,'#ffe27a');q.addColorStop(.45,'#ff8a1a');q.addColorStop(1,'rgba(220,60,10,0)');g.fillStyle=q;g.fillRect(0,0,32,32);}
  spk(g,r,16,['#ffdc60','#ff7a18'],1.3);spk(g,r,10,['#1a0804'],2);};
PT['d']=(g,r)=>{PT['H'](g,r);g.lineWidth=1.2;g.strokeStyle='#1d0f04';g.beginPath();g.moveTo(6,32);g.lineTo(6,14);g.arc(16,14,10,Math.PI,0);g.lineTo(26,32);g.closePath();g.fillStyle=LG(g,0,6,0,32,'#0c0604','#3a2412');g.fill();g.stroke();
  g.fillStyle='rgba(255,220,140,.35)';g.fillRect(8,28,16,3.5);poly(g,[[3,32],[3,11],[8,15],[8,32]],LG(g,3,0,8,0,'#9a6a34','#6a4220'),'#1d0f04');ell(g,5.8,23,.8,.8,'#ffd23f');};
PT['e']=(g,r)=>{PT['H'](g,r);g.lineWidth=1.2;g.strokeStyle='#1d0f04';g.beginPath();g.moveTo(6,32);g.lineTo(6,14);g.arc(16,14,10,Math.PI,0);g.lineTo(26,32);g.closePath();g.fillStyle=LG(g,0,6,0,32,'#0c0604','#3a2412');g.fill();g.stroke();
  poly(g,[[6,32],[6,14],[18,18],[18,31]],LG(g,6,0,18,0,'#a87a40','#6a4220'),'#1d0f04');ell(g,15.5,24,1,1,'#ffd23f');};
PT['U']=(g)=>{g.lineWidth=1.1;g.strokeStyle='#2a1608';ell(g,16,28,12,3,'rgba(0,0,0,.3)');
  const q=g.createRadialGradient(16,12,1,16,12,16);q.addColorStop(0,'rgba(255,240,150,.9)');q.addColorStop(1,'rgba(255,220,100,0)');g.fillStyle=q;g.fillRect(0,0,32,32);
  poly(g,[[5,13],[27,13],[25,4],[7,4]],LG(g,0,4,0,13,'#c07a30','#8a5220'),'#2a1608');
  rrect(g,4,14,24,14,2,LG(g,0,14,0,28,'#b8742f','#8a5220'),'#2a1608');rrect(g,6,14.5,20,4,1.5,'#ffe27a');
  for(const[x,y]of[[10,10],[16,7],[22,10]])ell(g,x,y,1.3,1.3,'#fff8d0');g.fillStyle='#aab0bd';g.fillRect(9,14,3,14);g.fillRect(20,14,3,14);};
PT['E']=(g,r,fr,kind)=>{if(kind==='out'){PT['='](g,r);return;}PT['z'](g,r);const q=g.createRadialGradient(16,16,2,16,16,16);q.addColorStop(0,'rgba(255,255,230,.95)');q.addColorStop(1,'rgba(255,255,200,.15)');g.fillStyle=q;g.fillRect(0,0,32,32);};
// ---------- objects ----------
PT['X']=(g)=>{g.lineWidth=1.1;g.strokeStyle='#2a1608';ell(g,16,28,12,3,'rgba(0,0,0,.3)');
  rrect(g,4,14,24,14,2,LG(g,0,14,0,28,'#b8742f','#8a5220'),'#2a1608');rrect(g,4,8,24,9,[5,5,1,1],LG(g,0,8,0,17,'#d48a3a','#a8662a'),'#2a1608');
  g.fillStyle='#aab0bd';g.fillRect(9,8,3,20);g.fillRect(20,8,3,20);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(9,8,1,20);g.fillRect(20,8,1,20);
  rrect(g,13.5,14,5,6,1,'#ffd23f','#7a5a00');ell(g,16,17,.8,.8,'#7a5a00');};
PT['O']=(g)=>{g.lineWidth=1.1;g.strokeStyle='#2a1608';ell(g,16,28,12,3,'rgba(0,0,0,.3)');
  rrect(g,5,3,22,9,[4,4,1,1],LG(g,0,3,0,12,'#9a5f26','#6e4119'),'#2a1608');rrect(g,4,13,24,15,2,LG(g,0,13,0,28,'#b8742f','#8a5220'),'#2a1608');
  rrect(g,6,13.5,20,5,1.5,'#1a0e06');g.fillStyle='#aab0bd';g.fillRect(9,13,3,15);g.fillRect(20,13,3,15);};
PT['b']=(g)=>{g.lineWidth=1.1;g.strokeStyle='#2a1608';rrect(g,3,4,26,26,3,LG(g,0,4,0,30,'#a86f34','#7a4b22'),'#2a1608');rrect(g,6,7,20,7,3,'#fdfbff','#8a8a9a');
  rrect(g,5,13,22,16,2,LG(g,0,13,0,29,'#e24a4a','#a82a34'),'#5a1218');g.strokeStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(7,17);g.lineTo(25,17);g.stroke();};
PT['t']=(g)=>{g.lineWidth=1.1;g.strokeStyle='#2a1608';ell(g,16,27,12,3.5,'rgba(0,0,0,.3)');g.fillStyle='#6b4423';g.fillRect(8,17,3,10);g.fillRect(21,17,3,10);
  ell(g,16,16,13,8,LG(g,0,8,0,24,'#c8914f','#9a6a32'),'#2a1608');ell(g,12,15,4,2.5,'#f4f1ea','#8a8a8a');ell(g,22,16,2.2,2.2,'#d8d8e4','#6a6a7a');ell(g,22,16,1.2,1.2,'#7a4a2a');};
PT['k']=(g)=>{g.fillStyle=LG(g,0,6,0,12,'#e0ac6a','#c08a4a');g.fillRect(0,6,32,7);g.fillStyle=LG(g,0,13,0,30,'#8a5a2a','#684018');g.fillRect(0,13,32,17);
  g.fillStyle='rgba(255,255,255,.35)';g.fillRect(0,6,32,1);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,13,32,1.2);g.fillRect(0,29,32,1.5);g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1;for(let x=8;x<32;x+=16){g.beginPath();g.moveTo(x,14);g.lineTo(x,29);g.stroke();}};
PT['K']=(g,r)=>{g.fillStyle='#4a2c14';g.fillRect(0,0,32,32);g.fillStyle=LG(g,0,0,0,32,'#6e4521','#52301a');g.fillRect(1.5,1.5,29,29);
  for(let i=0;i<3;i++){const y=1.5+i*9.8;g.fillStyle='#3a210e';g.fillRect(1.5,y+8,29,1.8);let x=3;
    while(x<28){const w=2+r()*3,h=4+r()*3.5;g.fillStyle=['#c84a4a','#4a7ac8','#4aa868','#e0b83a','#9a5ac8','#d8d8e4'][Math.floor(r()*6)];g.fillRect(x,y+8-h,w,h);g.fillStyle='rgba(255,255,255,.3)';g.fillRect(x,y+8-h,.7,h);x+=w+.6;}}};
PT['S']=(g)=>{g.lineWidth=1.1;g.strokeStyle='#2a2a36';ell(g,16,29,11,3,'rgba(0,0,0,.3)');rrect(g,6,22,20,7,1.5,LG(g,0,22,0,29,'#a8a8b8','#7a7a8a'),'#2a2a36');
  poly(g,[[10,22],[11,12],[21,12],[22,22]],LG(g,10,0,22,0,'#c0c0cc','#8a8a9a'),'#2a2a36');ell(g,16,8,4.5,5,LG(g,12,3,20,13,'#d0d0dc','#8a8a9a'),'#2a2a36');
  g.fillStyle='#2a2a36';g.fillRect(13,7,6,1.5);g.fillStyle='#e8e8f4';g.fillRect(23,4,2,14);poly(g,[[22,18],[26,18],[24,21]],'#c9a227');};
PT['W']=(g)=>{g.lineWidth=1.1;g.strokeStyle='#2a2a36';ell(g,16,24,14,7,'rgba(0,0,0,.25)');ell(g,16,19,13,9,LG(g,0,10,0,28,'#b8b8c6','#82828f'),'#2a2a36');
  ell(g,16,18,10,6,LG(g,0,12,0,24,'#4a88f0','#1e4cb0'),'#2a2a36');g.strokeStyle='rgba(255,255,255,.6)';g.beginPath();g.moveTo(11,18);g.quadraticCurveTo(13,16.5,15,18);g.stroke();
  g.strokeStyle='rgba(255,255,255,.35)';for(let i=0;i<8;i++){g.beginPath();g.arc(16,19,12.5,i*.8,i*.8+.3);g.stroke();}};
PT['N']=(g)=>{g.lineWidth=1.1;g.strokeStyle='#2a1608';ell(g,16,29,8,2.5,'rgba(0,0,0,.3)');rrect(g,14.5,12,3,17,1,'#7a4b22','#2a1608');
  rrect(g,4,4,24,12,2,LG(g,0,4,0,16,'#d8a860','#b07e3c'),'#2a1608');g.fillStyle='#4a2c14';for(let i=0;i<3;i++)g.fillRect(8,7+i*3,16-i*3,1.3);};
PT['q']=(g)=>{g.lineWidth=1.1;g.strokeStyle='#2a2a36';rrect(g,3,17,26,12,2,LG(g,0,17,0,29,'#d0d0dc','#8a8a9a'),'#2a2a36');rrect(g,6,13,20,5,1.5,'#e4e4ee','#2a2a36');
  const q=g.createRadialGradient(16,8,1,16,8,10);q.addColorStop(0,'rgba(255,220,120,.85)');q.addColorStop(1,'rgba(255,200,80,0)');g.fillStyle=q;g.fillRect(4,0,24,20);
  rrect(g,14.5,8,3,6,.8,'#fff6d8','#9a8a5a');poly(g,[[16,2.5],[18,6.5],[14,6.5]],'#ffb02a');ell(g,16,5.6,1,1.4,'#fff6a0');};
PT['J']=(g)=>{g.fillStyle='#14121c';g.fillRect(0,0,32,32);for(let x=3;x<32;x+=6){g.fillStyle=LG(g,x-1.5,0,x+1.5,0,'#c9cad6','#6a6b7a');g.fillRect(x-1.5,0,3,32);g.fillStyle='rgba(255,255,255,.5)';g.fillRect(x-1.5,0,.8,32);}
  g.fillStyle='#5a5b6a';g.fillRect(0,3,32,3);g.fillRect(0,26,32,3);g.fillStyle='rgba(255,255,255,.3)';g.fillRect(0,3,32,.8);};
PT['P']=(g)=>{ell(g,16,29,11,3,'rgba(0,0,0,.3)');g.lineWidth=1.1;g.strokeStyle='#2a2a36';rrect(g,6,25,20,5,1.5,'#b0b0be','#2a2a36');rrect(g,10,6,12,20,1,LG(g,10,0,22,0,'#e4e4f0','#8a8a9c'),'#2a2a36');rrect(g,6,2,20,5,1.5,'#c4c4d2','#2a2a36');
  g.strokeStyle='rgba(0,0,0,.2)';for(const x of[13,16,19]){g.beginPath();g.moveTo(x,8);g.lineTo(x,25);g.stroke();}};
// world map icons
PT['V']=(g,r)=>{PT['.'](g,r);g.lineWidth=1.1;g.strokeStyle='#2a1608';ell(g,16,28,14,3,'rgba(0,0,0,.25)');
  const house=(x,y,w,h,roof)=>{rrect(g,x,y,w,h,1,LG(g,0,y,0,y+h,'#f0e2c0','#d4bf90'),'#2a1608');poly(g,[[x-2,y+1],[x+w/2,y-8],[x+w+2,y+1]],roof,'#2a1608');rrect(g,x+w/2-2,y+h-6,4,6,1,'#6b4423','#2a1608');};
  house(2,15,13,12,'#c83a32');house(17,12,13,15,'#3a64c8');ell(g,22,18,1.5,1.5,'#ffe08a');ell(g,8,19,1.5,1.5,'#ffe08a');};
PT['A']=(g,r)=>{PT['.'](g,r);g.lineWidth=1.2;g.strokeStyle='#2d2536';ell(g,16,28,14,3,'rgba(0,0,0,.25)');
  poly(g,[[1,29],[5,14],[12,5],[22,5],[28,14],[31,29]],LG(g,0,5,0,29,'#a39a9e','#6c6270'),'#2d2536');
  g.beginPath();g.moveTo(9,29);g.lineTo(9,19);g.quadraticCurveTo(16,8,23,19);g.lineTo(23,29);g.closePath();g.fillStyle='#07040a';g.fill();g.stroke();g.fillStyle='rgba(255,255,255,.25)';g.fillRect(8,6,8,1.5);};
PT['Y']=(g,r)=>{PT['.'](g,r);g.lineWidth=1.1;g.strokeStyle='#4a1010';ell(g,16,29,13,3,'rgba(0,0,0,.25)');g.fillStyle='#e8dcc4';g.fillRect(12,23,8,9);
  rrect(g,6,9,3.6,21,1,LG(g,6,0,10,0,'#e0483a','#a82820'),'#4a1010');rrect(g,22.4,9,3.6,21,1,LG(g,22,0,26,0,'#e0483a','#a82820'),'#4a1010');
  rrect(g,7,13,18,3,1,'#c83a2e','#4a1010');poly(g,[[1,9],[31,9],[28,4],[4,4]],'#1a1a22','#0a0a10');rrect(g,2,8,28,3,1,'#d8402f','#4a1010');};
PT['Z']=(g,r)=>{PT['x'](g,r);g.lineWidth=1.1;g.strokeStyle='#120a1c';
  const gl=g.createRadialGradient(16,22,2,16,22,18);gl.addColorStop(0,'rgba(255,60,40,.5)');gl.addColorStop(1,'rgba(255,60,40,0)');g.fillStyle=gl;g.fillRect(0,0,32,32);
  rrect(g,10,10,12,19,1,LG(g,0,10,0,29,'#4a3a66','#2a1f40'),'#120a1c');
  const tower=(x,w,top)=>{rrect(g,x,top,w,29-top,1,LG(g,x,0,x+w,0,'#5a4a78','#2e2348'),'#120a1c');poly(g,[[x-1,top],[x+w/2,top-8],[x+w+1,top]],'#8a1a2e','#120a1c');};
  tower(2,8,12);tower(22,8,12);g.fillStyle='#120a1c';g.beginPath();g.moveTo(13,29);g.lineTo(13,23);g.quadraticCurveTo(16,18,19,23);g.lineTo(19,29);g.fill();
  g.fillStyle='#ff4a3a';g.fillRect(5,17,2,3);g.fillRect(25,17,2,3);g.fillRect(15,13,2,3);};

PT['a']=(g,r,fr)=>{PT['~'](g,r,fr);g.lineWidth=1.1;g.strokeStyle='#2a1608';const b=fr?.6:0;
  poly(g,[[4,17+b],[28,17+b],[24,25+b],[8,25+b]],LG(g,0,17,0,25,'#b87a3a','#7a4a22'),'#2a1608');
  g.strokeStyle='#e8e0d0';g.beginPath();g.moveTo(16,17+b);g.lineTo(16,3+b);g.stroke();
  poly(g,[[16.5,4+b],[26,15+b],[16.5,15+b]],'#f6f1e4','#8a8070');poly(g,[[15.5,6+b],[8,15+b],[15.5,15+b]],'#e0d8c6','#8a8070');
  g.strokeStyle='rgba(255,255,255,.5)';g.beginPath();g.moveTo(5,26+b);g.quadraticCurveTo(16,29,27,26+b);g.stroke();};
PT['I']=(g,r)=>{PT['.'](g,r);g.lineWidth=1.1;g.strokeStyle='#2a2a36';ell(g,16,29,11,3,'rgba(0,0,0,.28)');
  poly(g,[[9,29],[12,9],[20,9],[23,29]],LG(g,9,0,23,0,'#fafafa','#c9c9d6'),'#2a2a36');
  poly(g,[[10.4,22],[21.6,22],[22.4,26],[9.6,26]],'#d23a3a');poly(g,[[11.3,14],[20.7,14],[21.4,18],[10.6,18]],'#d23a3a');
  rrect(g,10,6,12,3.4,1,'#3a3a4a','#2a2a36');rrect(g,12,2.6,8,4,1,'#ffe27a','#2a2a36');poly(g,[[11,3],[16,0.2],[21,3]],'#b82a2a','#2a2a36');};
PT['n']=(g)=>{g.lineWidth=1.1;g.strokeStyle='#2a1608';ell(g,16,29,12,2.5,'rgba(0,0,0,.25)');rrect(g,4,6,3.4,23,1,'#8a5a2a','#2a1608');rrect(g,24.6,6,3.4,23,1,'#8a5a2a','#2a1608');
  g.strokeStyle='rgba(235,235,210,.85)';g.lineWidth=.8;for(let i=0;i<9;i++){g.beginPath();g.moveTo(7.4,8+i*1.9);g.lineTo(24.6,10+i*1.9);g.stroke();g.beginPath();g.moveTo(7.4+i*1.9,8);g.lineTo(9+i*1.9,24);g.stroke();}
  g.strokeStyle='#2a1608';g.lineWidth=1;for(const[x,y]of[[13,20],[20,23]]){ell(g,x,y,2.8,1.4,'#cfd8e4','#4a5260');poly(g,[[x+2.6,y],[x+5,y-1.4],[x+5,y+1.4]],'#cfd8e4','#4a5260');}};
PT['r']=(g)=>{g.lineWidth=1.1;g.strokeStyle='#2a1608';ell(g,16,29,13,2.5,'rgba(0,0,0,.28)');
  for(const[x,y,w]of[[3,12,13],[16,15,13],[9,3,13]]){rrect(g,x,y,w,15,3.5,LG(g,x,0,x+w,0,'#c28a48','#8a5a2a'),'#2a1608');g.fillStyle='#4a4a58';g.fillRect(x,y+3.6,w,1.7);g.fillRect(x,y+10,w,1.7);ell(g,x+w/2,y+1,w/2-.5,2,'#9a6a34','#2a1608');}};
PT['i']=(g)=>{g.lineWidth=1.1;g.strokeStyle='#2a1608';rrect(g,3,16,26,13,1.5,LG(g,0,16,0,29,'#b07a40','#7a4b22'),'#2a1608');
  for(let i=0;i<6;i++){const x=2+i*4.7;poly(g,[[x,3],[x+4.7,3],[x+5.6,14],[x+.9,14]],i%2?'#f4f1ea':'#d23a3a','#2a1608');}
  rrect(g,2,13.2,28,2.4,1,'#8a2a2a','#2a1608');for(const[x,c]of[[8,'#cfd8e4'],[14,'#ffd23f'],[20,'#e23a3a'],[26,'#8ad06a']])ell(g,x,19.5,2.6,2.6,c,'#2a1608');};
PT['u']=(g)=>{g.lineWidth=1.1;g.strokeStyle='#1a1a22';ell(g,16,29,11,2.8,'rgba(0,0,0,.28)');rrect(g,10,19,12,10,1.5,LG(g,10,0,22,0,'#8a5a2a','#5e3a18'),'#2a1608');
  poly(g,[[4,13],[22,13],[26,16],[22,19],[10,19],[8,17],[4,17]],LG(g,0,13,0,19,'#8a92a2','#3a4050'),'#1a1a22');ell(g,15,12.2,2,1,'rgba(255,255,255,.4)');
  for(const[x,y]of[[18,9],[22,7],[14,7]]){g.fillStyle='#ffb02a';g.fillRect(x,y,2,2);}};
PT['m']=(g)=>{g.lineWidth=1.1;g.strokeStyle='#1a1a22';g.fillStyle='#4a3a2a';g.fillRect(0,26,32,2);g.fillRect(0,29,32,2);for(let x=2;x<32;x+=6){g.fillStyle='#6a4a2a';g.fillRect(x,25,2.6,7);}
  poly(g,[[4,10],[28,10],[25,24],[7,24]],LG(g,0,10,0,24,'#6a7080','#3a4050'),'#1a1a22');ell(g,10,25.5,2.6,2.6,'#2a2a32','#1a1a22');ell(g,22,25.5,2.6,2.6,'#2a2a32','#1a1a22');
  for(const[x,y,c]of[[10,8,'#8ad8e8'],[16,6.4,'#c8d0e0'],[22,8,'#8ad8e8'],[13,9,'#e8f0ff']])ell(g,x,y,3.4,2.8,c,'#2a3a4a');};
PT['v']=(g,r)=>{g.fillStyle=LG(g,0,0,32,32,'#6a6070','#4a4254');g.fillRect(0,0,32,32);spk(g,r,40,['#3a3242','#8a8094'],1.6);g.lineWidth=1.2;g.strokeStyle='#1a1008';
  g.fillStyle='#0a0608';g.fillRect(6,8,20,24);g.strokeRect(6,8,20,24);rrect(g,3,6,6,26,1,'#7a4b22','#1a1008');rrect(g,23,6,6,26,1,'#7a4b22','#1a1008');rrect(g,3,3,26,6,1,'#8a5a2a','#1a1008');
  g.fillStyle='#ffd23f';g.fillRect(15,10,2,2);};
const LANT=(g,lit,fr=0)=>{g.lineWidth=1.1;g.strokeStyle='#2a2a36';ell(g,16,29,9,2.6,'rgba(0,0,0,.3)');
  if(lit){const q=g.createRadialGradient(16,13,1,16,13,17);q.addColorStop(0,'rgba(255,220,120,'+(.62+.13*Math.sin(fr*2.1+1))+')');q.addColorStop(1,'rgba(255,200,80,0)');g.fillStyle=q;g.fillRect(-2,-4,36,36);}
  rrect(g,10,25,12,4,1,LG(g,0,25,0,29,'#b0b0be','#8a8a9a'),'#2a2a36');rrect(g,13.6,15,4.8,10,1,LG(g,13,0,19,0,'#c0c0cc','#8a8a9a'),'#2a2a36');
  rrect(g,8.5,6,15,10,1.5,LG(g,0,6,0,16,'#d0d0dc','#9a9aaa'),'#2a2a36');rrect(g,11,8,10,6,1,lit?'#ffe27a':'#26222e','#2a2a36');
  poly(g,[[6,7],[16,0.5],[26,7]],LG(g,0,0,0,7,'#b0b0be','#7a7a8a'),'#2a2a36');if(lit){ell(g,16,11,2.2,2.6,'#fff6c0');}};
PT['L']=(g)=>LANT(g,false);PT['l']=(g,r,fr)=>LANT(g,true,fr|0);
PT['p']=(g)=>{g.lineWidth=1.1;g.strokeStyle='#1a1a22';ell(g,16,29,7,2.2,'rgba(0,0,0,.3)');
  const q=g.createRadialGradient(16,8,1,16,8,15);q.addColorStop(0,'rgba(255,220,120,.7)');q.addColorStop(1,'rgba(255,200,80,0)');g.fillStyle=q;g.fillRect(0,-6,32,28);
  rrect(g,14.6,9,2.8,20,1,LG(g,14,0,18,0,'#5a5a6a','#2a2a36'),'#1a1a22');rrect(g,12,26,8,3,1,'#3a3a4a','#1a1a22');
  rrect(g,11,2.6,10,8,2.5,'#ffe27a','#2a2a36');ell(g,16,6.6,2.2,2.6,'#fffbe0');rrect(g,10,1.2,12,2.4,1,'#3a3a4a','#1a1a22');};
const TC={};
function tileImg(ch,floor,fr,v,kind){
  const fq=(ANIM.includes(ch)||ANIM4.includes(ch))?fr:0,key=ch+floor+fq+'_'+v+kind;
  if(TC[key])return TC[key];
  const c=document.createElement('canvas');c.width=c.height=T*S;const g=c.getContext('2d');g.scale(S,S);
  let s=(ch.charCodeAt(0)*31+v*977+floor.charCodeAt(0)*13+1)%233280;const r=()=>{s=(s*9301+49297)%233280;return s/233280;};
  g.lineJoin='round';g.lineCap='round';
  if(OBJ.includes(ch))(PT[floor]||PT['.'])(g,r,fq,kind,v);
  (PT[ch]||PT['.'])(g,r,fq,kind,v);
  TC[key]=c;return c;
}
function drawTile(ch,x,y,floor,fr,v,kind){ctx.drawImage(tileImg(ch,floor,fr,v,kind),x,y,T,T);}
// ---- big castle overlay for the world map (5x5 tiles, gate at bottom centre) ----
PT['Q']=(g,r)=>PT['x'](g,r);
let CASTLE_IMG=null;
function castleImg(){
  if(CASTLE_IMG)return CASTLE_IMG;
  const w=5*T,h=5*T,c=document.createElement('canvas');c.width=w*S;c.height=h*S;const g=c.getContext('2d');g.scale(S,S);
  g.lineJoin='round';g.lineCap='round';g.lineWidth=1.4;g.strokeStyle='#120a1c';
  const gl=g.createRadialGradient(80,100,6,80,100,84);gl.addColorStop(0,'rgba(255,60,40,.45)');gl.addColorStop(1,'rgba(255,60,40,0)');g.fillStyle=gl;g.fillRect(0,0,w,h);
  ell(g,80,154,70,6,'rgba(0,0,0,.4)');
  const wall=(x,y,ww,hh)=>rrect(g,x,y,ww,hh,2,LG(g,x,0,x+ww,0,'#5a4a78','#2a1f40'),'#120a1c');
  const bat=(x,y,ww)=>{g.fillStyle='#3a2d58';for(let i=0;i<ww;i+=7){g.fillRect(x+i,y-5,4.5,5);g.strokeRect(x+i,y-5,4.5,5);}};
  const spire=(x,y,ww,sh)=>poly(g,[[x-2,y],[x+ww/2,y-sh],[x+ww+2,y]],'#8a1a2e','#120a1c');
  const win=(x,y)=>{g.fillStyle='#ff4a3a';g.fillRect(x,y,3,6);};
  // tall centre tower + flag
  wall(62,30,36,100);spire(62,30,36,26);g.strokeStyle='#120a1c';g.beginPath();g.moveTo(80,4);g.lineTo(80,-0);g.stroke();
  g.beginPath();g.moveTo(80,5);g.lineTo(80,14);g.stroke();poly(g,[[80,5],[92,8],[80,11]],'#ff3a3a','#120a1c');
  win(77,44);win(77,64);
  // mid towers
  wall(40,54,24,80);spire(40,54,24,20);bat(40,54,24);win(49,66);win(49,88);
  wall(96,54,24,80);spire(96,54,24,20);bat(96,54,24);win(105,66);win(105,88);
  // main keep wall
  wall(34,104,92,50);bat(34,104,92);
  // outer side towers
  wall(6,86,32,68);spire(6,86,32,22);bat(6,86,32);win(18,100);win(18,120);
  wall(122,86,32,68);spire(122,86,32,22);bat(122,86,32);win(134,100);win(134,120);
  // windows on keep
  win(48,114);win(106,114);win(76,114);win(86,114);
  // gate
  g.fillStyle='#07040a';g.beginPath();g.moveTo(66,160);g.lineTo(66,128);g.quadraticCurveTo(80,108,94,128);g.lineTo(94,160);g.closePath();g.fill();g.stroke();
  g.strokeStyle='rgba(255,70,50,.55)';g.lineWidth=1;for(let x=70;x<=90;x+=5){g.beginPath();g.moveTo(x,130);g.lineTo(x,160);g.stroke();}
  g.strokeStyle='#120a1c';
  CASTLE_IMG=c;return c;
}


// ---------- characters ----------
const CH={
  hero:{hair:'#8a4a1a',cloth:'#2f5fd0',pants:'#5a3a1a',band:'#e03030',sword:1},
  vb:{hair:'#4a3020',cloth:'#a07a4a',pants:'#6a4a2a',hat:'#d8b24a'},
  mayor:{hair:'#ddd',cloth:'#7a3aa8',pants:'#4a2070',beard:'#eee',hat:'#7a3aa8'},
  minister:{hair:'#222',cloth:'#22224a',pants:'#111',hat:'#222',gold:1,glass:1},
  hermit:{hair:'#eee',cloth:'#8a8a98',pants:'#666',beard:'#eee',staff:1},
  gal:{hair:'#ffb347',cloth:'#ff5fa8',pants:'#ff8fc8',tails:'#ffb347',skirt:1,ribbon:'#ff2f7a'},
  rogue:{hair:'#222',cloth:'#555',pants:'#333',band:'#a22',stripes:1},
  man:{hair:'#5a3a20',cloth:'#4a8a4a',pants:'#6a4a2a'},
  man2:{hair:'#2a2a2a',cloth:'#8a4a2a',pants:'#3a3a4a'},
  woman:{hair:'#a05a2a',cloth:'#c05a8a',pants:'#8a3a6a',skirt:1},
  girl:{hair:'#7a4a2a',cloth:'#e8c84a',pants:'#e8c84a',skirt:1,ribbon:'#ff7aa8'},
  boy:{hair:'#3a2a1a',cloth:'#e86a2a',pants:'#3a5a8a'},
  granny:{hair:'#e8e8ee',cloth:'#b5688c',pants:'#8a4a6a',skirt:1,bun:1,apron:'#f4ecdc',staff:1},
  old:{hair:'#ddd',cloth:'#a08a6a',pants:'#6a5a3a',beard:'#ddd',staff:1},
  inn:{hair:'#4a3020',cloth:'#eee',pants:'#555',apron:'#fff'},
  shop:{hair:'#2a2a2a',cloth:'#2a7a4a',pants:'#444',apron:'#2a7a4a'},
  guard:{hair:'#333',cloth:'#8a9aa8',pants:'#6a7a88',helm:'#aab',spear:1},
  demon:{hair:'#222',skin:'#8a5ab8',cloth:'#3a1a5a',pants:'#2a1040',horns:1,beard:'#3a1a5a'},
  cat:{hair:'#c8a050',skin:'#c8a050',cloth:'#c8a050',pants:'#c8a050'}
};
function drawChar(g,x,y,key,dir=0,st=0){
  if(key&&key.startsWith('cat_'))return drawCatChar(g,x,y,key,dir,st);   // ネコ編(ミケと仲間たち)
  const s=CH[key]||CH.man,skin=s.skin||'#f6cfa6',O='#1d1530';
  g.save();g.translate(x,y);
  if(dir===3){g.translate(32,0);g.scale(-1,1);dir=2;}
  const side=dir===2;
  g.lineJoin='round';g.lineCap='round';g.lineWidth=1.2;g.strokeStyle=O;
  const bob=st?-1.5:((G.tick>>5)&1&&!st?-.3:0),hy=10+bob;
  const HG=LG(g,0,hy-9,0,hy+8,shade(s.hair,.18),s.hair);
  ell(g,16,30,9,2.8,'rgba(0,0,0,.3)');
  if(s.spear){g.strokeStyle='#bfc4d0';g.lineWidth=1.8;g.beginPath();g.moveTo(4.5,6);g.lineTo(4.5,30);g.stroke();g.strokeStyle=O;g.lineWidth=1.2;poly(g,[[2.5,7],[4.5,.5],[6.5,7]],'#eef',O);}
  if(s.tails){const tg=LG(g,0,hy,0,hy+14,shade(s.tails,.2),s.tails);if(side){ell(g,23.2,hy+6.5+(st?1:0),3.6,7.4,tg,O);}else{ell(g,5.8,hy+6,3.4,7,tg,O);ell(g,26.2,hy+6,3.4,7,tg,O);}}
  // legs
  const la=st===1?-2.6:0,lb=st===2?-2.6:0,sw=st===1?1.3:st===2?-1.3:0,L1=side?12.6:10.6,L2=side?15.4:16.6,lw=side?4.4:4.9;
  rrect(g,L1,23+la,lw,7-la,1.6,s.pants,O);rrect(g,L2,23+lb,lw,7-lb,1.6,s.pants,O);
  rrect(g,L1-.3,28.2+la*.3,lw+.6,2.6,1.2,'#2b1c12',O);rrect(g,L2-.3,28.2+lb*.3,lw+.6,2.6,1.2,'#2b1c12',O);
  // torso
  const bw=side?11:14,bx=16-bw/2;
  if(s.skirt)poly(g,[[bx,24],[bx-2,28.6],[bx+bw+2,28.6],[bx+bw,24]],s.pants,O);
  rrect(g,bx,16+bob,bw,10,3.2,LG(g,0,16,0,26,shade(s.cloth,.2),s.cloth),O);
  g.fillStyle=shade(s.pants,-.2);g.fillRect(bx+.6,23.3+bob,bw-1.2,1.5);
  if(s.apron)rrect(g,bx+2.5,19+bob,bw-5,8,1.5,s.apron==='#fff'?'#fff':shade(s.apron,.5),O);
  if(s.stripes){g.strokeStyle='#e8e8ee';g.lineWidth=1;for(let i=0;i<3;i++){g.beginPath();g.moveTo(bx+1,18.5+bob+i*2.6);g.lineTo(bx+bw-1,18.5+bob+i*2.6);g.stroke();}g.strokeStyle=O;g.lineWidth=1.2;}
  if(s.gold){ell(g,16,20+bob,.9,.9,'#ffd23f');ell(g,16,23+bob,.9,.9,'#ffd23f');}
  // arms
  if(side){rrect(g,14,17+bob+sw,4.4,8,2.2,s.cloth,O);ell(g,16.2,25.4+bob+sw,2,2,skin,O);}
  else{rrect(g,bx-3.8,17+bob+sw,4.2,8,2.1,s.cloth,O);rrect(g,bx+bw-.4,17+bob-sw,4.2,8,2.1,s.cloth,O);ell(g,bx-1.7,25.4+bob+sw,2,2,skin,O);ell(g,bx+bw+1.7,25.4+bob-sw,2,2,skin,O);}
  if(s.staff&&dir!==1){const hx=side?16.2:bx+bw+1.7,hy2=25.4+bob+(side?sw:-sw);
    g.strokeStyle='#6b4423';g.lineWidth=1.8;g.beginPath();g.moveTo(hx,7);g.lineTo(hx,30);g.stroke();
    g.strokeStyle=O;g.lineWidth=1.2;ell(g,hx,5.5,2.3,2.3,'#ffd23f',O);ell(g,hx,hy2,2,2,skin,O);}
  if(s.sword&&dir!==2){rrect(g,25.2,10,2.2,13,.8,'#eef0f8',O);rrect(g,23.6,21,5.4,1.8,.6,'#ffd23f',O);rrect(g,25.4,22.6,1.8,3.2,.6,'#5a3a1a',O);}
  // head
  if(dir===1){ell(g,16,hy,9.2,9.2,HG,O);}
  else{
    ell(g,16,hy,8.6,8.4,LG(g,10,hy-8,22,hy+8,shade(skin,.1),skin),O);
    if(s.beard){g.beginPath();if(side){g.moveTo(9,hy+3);g.quadraticCurveTo(9,hy+11,15,hy+13);g.quadraticCurveTo(19,hy+11,19,hy+3);}
      else{g.moveTo(8.8,hy+3);g.quadraticCurveTo(9,hy+12,16,hy+14);g.quadraticCurveTo(23,hy+12,23.2,hy+3);g.quadraticCurveTo(16,hy+7,8.8,hy+3);}
      g.closePath();g.fillStyle=s.beard;g.fill();g.stroke();}
    const ex=side?[11.8]:[12.6,19.4];
    for(const e of ex){ell(g,e,hy+1.6,1.3,1.8,'#1d1530');ell(g,e-.4,hy+.9,.5,.5,'#fff');}
    g.fillStyle='rgba(255,110,110,.35)';if(side)ell(g,10.4,hy+4.6,1.7,1.1,'rgba(255,110,110,.35)');else{ell(g,10.2,hy+4.6,1.7,1.1,'rgba(255,110,110,.35)');ell(g,21.8,hy+4.6,1.7,1.1,'rgba(255,110,110,.35)');}
    if(!s.beard){g.strokeStyle='#8a4a3a';g.lineWidth=.9;g.beginPath();g.arc(side?11.2:16,hy+4.4,1.5,.15*Math.PI,.85*Math.PI);g.stroke();g.strokeStyle=O;g.lineWidth=1.2;}
    // hair
    g.beginPath();
    if(!side){g.moveTo(6.9,hy+2.5);g.arc(16,hy,9.1,Math.PI*.97,Math.PI*2.03);g.lineTo(25.1,hy+2.5);g.lineTo(23,hy+4);g.lineTo(23,hy-1.5);g.lineTo(19.8,hy+.6);g.lineTo(16.5,hy-2.8);g.lineTo(13,hy+.6);g.lineTo(9.6,hy-1.5);g.lineTo(9,hy+4);}
    else{g.arc(16,hy,9.1,Math.PI*.97,Math.PI*2.03);g.lineTo(25.1,hy+5);g.quadraticCurveTo(21,hy+8.5,17.5,hy+3.5);g.lineTo(16.2,hy-3);g.lineTo(12,hy-.5);g.lineTo(8.2,hy-2.5);}
    g.closePath();g.fillStyle=HG;g.fill();g.stroke();
  }
  // accessories
  if(s.band){g.fillStyle=s.band;g.fillRect(7.2,hy-3.6,17.6,2.4);g.strokeStyle=O;g.lineWidth=.8;g.strokeRect(7.2,hy-3.6,17.6,2.4);g.lineWidth=1.2;}
  if(s.hat){ell(g,16,hy-4.5,12,3.6,shade(s.hat,-.1),O);rrect(g,9.8,hy-12,12.4,8.5,4,LG(g,0,hy-12,0,hy-3,shade(s.hat,.2),s.hat),O);if(s.gold){g.fillStyle='#c9a227';g.fillRect(10.2,hy-6.8,11.6,1.8);}}
  if(s.helm){g.beginPath();g.arc(16,hy,9.6,Math.PI,Math.PI*2);g.lineTo(25.6,hy+1);g.lineTo(6.4,hy+1);g.closePath();g.fillStyle=LG(g,0,hy-9,0,hy+1,'#dde','#8a92a2');g.fill();g.stroke();if(dir===0)rrect(g,15,hy,2,5,.8,'#9aa2b2',O);}
  if(s.bun){ell(g,16,hy-9.6,4.4,3.6,HG,O);ell(g,16,hy-9.6,1.6,1.4,'#c9a227');}
  if(s.horns){poly(g,[[8.5,hy-5],[6,hy-12.5],[12.5,hy-7.5]],'#f4efe0',O);poly(g,[[23.5,hy-5],[26,hy-12.5],[19.5,hy-7.5]],'#f4efe0',O);}
  if(s.glass&&dir===0){g.strokeStyle='#8fbfe0';g.lineWidth=1;ell(g,12.6,hy+1.6,2.8,2.4,null,'#8fbfe0');ell(g,19.4,hy+1.6,2.8,2.4,null,'#8fbfe0');g.beginPath();g.moveTo(15.4,hy+1.4);g.lineTo(16.6,hy+1.4);g.stroke();g.strokeStyle=O;g.lineWidth=1.2;}
  if(s.tails){if(side)ell(g,22.4,hy-1.2,2.4,2.4,s.ribbon,O);else{ell(g,7.5,hy-1.5,2.2,2.2,s.ribbon,O);ell(g,24.5,hy-1.5,2.2,2.2,s.ribbon,O);}}
  else if(s.ribbon){poly(g,[[9,hy-7],[4.5,hy-10.5],[4.5,hy-4]],s.ribbon,O);poly(g,[[9,hy-7],[13,hy-10.5],[13,hy-4]],s.ribbon,O);ell(g,9,hy-7,1.5,1.5,s.ribbon,O);}
  g.restore();
}


// ---------- ネコ(三毛猫ミケと仲間たち): 正面・背面・横むき ----------
const CATS={
  cat_mike:{body:'#f8f3ea',shade:'#e2d9c6',p1:'#ee9a3c',p2:'#2c2630',eye:'#2a2a2a',nose:'#f09aa0',bell:1},
  cat_kuro:{body:'#3a3644',shade:'#2a2634',eye:'#ffd23f',nose:'#d88a96'},
  cat_tora:{body:'#e49c48',shade:'#c8802c',stripe:'#8a4a1a',eye:'#2a2a2a',nose:'#d86a6a'},
  cat_shiro:{body:'#fbfbff',shade:'#d6dcf2',eye:'#4a8ae8',nose:'#f2a0a8'},
  cat_yami:{body:'#52427a',shade:'#3a2c5a',eye:'#ff7ad8',nose:'#c07ab8',glow:1}
};
let CATF=1;
function drawCatChar(g,x,y,key,dir,st){
  const s=CATS[key]||CATS.cat_mike,O='#1d1530',t=G.tick;
  const bob=st?-1:(((t>>5)&1)?-.4:0),tail=Math.sin(t*.12)*2.4,leg=st===1?2:st===2?-2:0;
  g.save();g.translate(x,y);g.lineJoin='round';g.lineCap='round';g.lineWidth=1.2;g.strokeStyle=O;
  ell(g,16,30.4,10.5,2.8,'rgba(0,0,0,.3)');
  const BG=(a,b)=>LG(g,0,a,0,b,s.body,s.shade);
  const patches=(fn)=>{g.save();fn();g.restore();};
  const eye=(ex,ey)=>{ell(g,ex,ey,1.5,2,s.eye);if(s.glow){ell(g,ex,ey,2.7,3.2,'rgba(255,120,220,.28)');ell(g,ex,ey,1.5,2,s.eye);}ell(g,ex-.4,ey-.7,.55,.65,'#fff');g.fillStyle=O;g.fillRect(ex-.3,ey-.9,.7,1.9);};
  if(dir===2)CATF=-1;else if(dir===3)CATF=1;
  if(dir===0||dir===1){ // ---- 正面 / 背面 ----
    const back=dir===1;
    // しっぽ
    g.lineWidth=3.2;g.strokeStyle=s.shade;g.beginPath();g.moveTo(back?19:23,27);g.quadraticCurveTo(30,23+tail,back?25:27,13+tail);g.stroke();
    g.lineWidth=1.2;g.strokeStyle=O;
    if(s.p2){g.lineWidth=3.2;g.strokeStyle=s.p2;g.beginPath();g.moveTo(26.6,19);g.quadraticCurveTo(28.6,17+tail,27,13.6+tail);g.stroke();g.lineWidth=1.2;g.strokeStyle=O;}
    if(s.stripe){g.strokeStyle=s.stripe;g.lineWidth=1.3;for(const[ax,ay]of[[27.6,21],[28,18],[27.4,15]]){g.beginPath();g.moveTo(ax-1.3,ay+tail*.3);g.lineTo(ax+1.3,ay+tail*.3);g.stroke();}g.strokeStyle=O;g.lineWidth=1.2;}
    // うしろあし(背面) / まえあし(正面)
    rrect(g,10.6,26+(leg>0?-1:0),4.2,5.6,1.8,s.body,O);rrect(g,17.2,26+(leg<0?-1:0),4.2,5.6,1.8,s.body,O);
    // からだ
    ell(g,16,24.2+bob*.5,8.4,6.6,BG(18,31),O);
    if(s.p1)patches(()=>{g.beginPath();g.ellipse(16,24.2+bob*.5,8.4,6.6,0,0,7);g.clip();ell(g,10.6,22,4.6,4,s.p1);ell(g,22,27,4,3.2,s.p2);ell(g,20,20.5,2.6,2,s.p1);});
    if(s.stripe)patches(()=>{g.beginPath();g.ellipse(16,24.2+bob*.5,8.4,6.6,0,0,7);g.clip();g.strokeStyle=s.stripe;g.lineWidth=1.3;for(const sx of[9,12.4,19.6,23]){g.beginPath();g.moveTo(sx,19);g.lineTo(sx+(sx<16?1.2:-1.2),26);g.stroke();}});
    // 頭
    const hy=13.6+bob;
    // 耳
    poly(g,[[8.6,hy-2],[9.6,hy-10],[14.6,hy-5]],s.body,O);poly(g,[[23.4,hy-2],[22.4,hy-10],[17.4,hy-5]],s.body,O);
    if(!back){poly(g,[[10.2,hy-4],[10.6,hy-8],[13,hy-5.4]],'#f6a8b4');poly(g,[[21.8,hy-4],[21.4,hy-8],[19,hy-5.4]],'#f6a8b4');}
    if(s.p1&&!back){poly(g,[[8.6,hy-2],[9.6,hy-10],[14.6,hy-5]],s.p1,O);poly(g,[[23.4,hy-2],[22.4,hy-10],[17.4,hy-5]],s.p2,O);poly(g,[[10.2,hy-4],[10.6,hy-8],[13,hy-5.4]],'#f6a8b4');poly(g,[[21.8,hy-4],[21.4,hy-8],[19,hy-5.4]],'#f6a8b4');}
    ell(g,16,hy,8.2,7,BG(hy-7,hy+7),O);
    if(s.p1)patches(()=>{g.beginPath();g.ellipse(16,hy,8.2,7,0,0,7);g.clip();ell(g,9.6,hy-3,5.6,5,s.p1);ell(g,23.4,hy-2.4,4.8,4.4,s.p2);});
    if(s.stripe)patches(()=>{g.strokeStyle=s.stripe;g.lineWidth=1.3;for(const sx of[13.4,16,18.6]){g.beginPath();g.moveTo(sx,hy-6.6);g.lineTo(sx,hy-3.4);g.stroke();}});
    if(!back){
      eye(12.6,hy+.6);eye(19.4,hy+.6);
      poly(g,[[15,hy+3.2],[17,hy+3.2],[16,hy+4.4]],s.nose,O);
      g.lineWidth=.9;g.beginPath();g.moveTo(16,hy+4.4);g.quadraticCurveTo(14.6,hy+6,13.2,hy+5);g.moveTo(16,hy+4.4);g.quadraticCurveTo(17.4,hy+6,18.8,hy+5);g.stroke();
      g.strokeStyle='rgba(60,40,50,.55)';for(const sy of[-.8,.6]){g.beginPath();g.moveTo(8.4,hy+3.4+sy);g.lineTo(3.4,hy+2.2+sy*3);g.moveTo(23.6,hy+3.4+sy);g.lineTo(28.6,hy+2.2+sy*3);g.stroke();}
      g.strokeStyle=O;g.lineWidth=1.2;
      if(s.bell){rrect(g,10.6,hy+6.2,10.8,2.4,1.2,'#e03a3a',O);ell(g,16,hy+9.4,1.7,1.7,'#ffd23f','#8a6a00');}
    }
  }else{ // ---- 横むき(右むき。左は反転) ----
    g.translate(16,0);g.scale(CATF,1);g.translate(-16,0);
    // しっぽ
    g.lineWidth=3.2;g.strokeStyle=s.p2||s.shade;g.beginPath();g.moveTo(6.5,22);g.quadraticCurveTo(-1,19+tail,2.5,10.5+tail);g.stroke();
    g.strokeStyle=s.body;g.lineWidth=2.4;g.beginPath();g.moveTo(6.5,22);g.quadraticCurveTo(-1,19+tail,2.5,10.5+tail);g.stroke();
    if(s.p2){g.strokeStyle=s.p2;g.lineWidth=2.4;g.beginPath();g.moveTo(.4,15.4+tail*.8);g.quadraticCurveTo(.8,12.6+tail,2.5,10.5+tail);g.stroke();}
    g.lineWidth=1.2;g.strokeStyle=O;
    // あし(奥→手前)
    const lg=(lx,dy)=>rrect(g,lx,24.4+dy,3.8,6.4-dy,1.6,s.shade,O);
    lg(21,leg>0?-1.6:0);lg(7.4,leg<0?-1.6:0);
    // からだ
    ell(g,14,22.6+bob*.5,10,5.8,BG(17,29),O);
    if(s.p1)patches(()=>{g.beginPath();g.ellipse(14,22.6+bob*.5,10,5.8,0,0,7);g.clip();ell(g,9,20.4,5.2,4,s.p1);ell(g,19.4,25,4.4,3.2,s.p2);ell(g,5.4,25,3,2.6,s.p2);});
    if(s.stripe)patches(()=>{g.beginPath();g.ellipse(14,22.6+bob*.5,10,5.8,0,0,7);g.clip();g.strokeStyle=s.stripe;g.lineWidth=1.3;for(const sx of[7,10.6,14.2,17.8,21.2]){g.beginPath();g.moveTo(sx,17);g.lineTo(sx+1.4,23);g.stroke();}});
    lg(17.4,leg<0?-1.6:0);lg(11,leg>0?-1.6:0);
    // 頭
    const hx=24,hy=15.4+bob;
    poly(g,[[hx-5,hy-3],[hx-3.6,hy-10],[hx+.4,hy-5]],s.p1||s.body,O);poly(g,[[hx-.6,hy-5],[hx+2.4,hy-9.4],[hx+4,hy-3]],s.p2||s.body,O);
    poly(g,[[hx-3.4,hy-5],[hx-3.2,hy-8],[hx-1,hy-5.4]],'#f6a8b4');
    ell(g,hx,hy,6.2,5.6,BG(hy-6,hy+6),O);
    if(s.p1)patches(()=>{g.beginPath();g.ellipse(hx,hy,6.2,5.6,0,0,7);g.clip();ell(g,hx-3.6,hy-2.6,4.2,3.6,s.p1);ell(g,hx+3.8,hy-3,3,2.6,s.p2);});
    if(s.stripe)patches(()=>{g.strokeStyle=s.stripe;g.lineWidth=1.2;for(const sx of[hx-2,hx,hx+2]){g.beginPath();g.moveTo(sx,hy-5.4);g.lineTo(sx,hy-3);g.stroke();}});
    eye(hx+2.6,hy-.4);
    poly(g,[[hx+5.2,hy+.8],[hx+6.8,hy+1.2],[hx+5.4,hy+2.4]],s.nose,O);
    g.strokeStyle='rgba(60,40,50,.55)';g.lineWidth=.8;for(const sy of[0,1.4]){g.beginPath();g.moveTo(hx+4.6,hy+2+sy);g.lineTo(hx+9.6,hy+1.4+sy*2);g.stroke();}
    g.strokeStyle=O;g.lineWidth=1.2;
    if(s.bell){rrect(g,hx-3.6,hy+3.6,5,2.2,1,'#e03a3a',O);ell(g,hx-1.2,hy+6.6,1.5,1.5,'#ffd23f','#8a6a00');}
  }
  g.restore();
}
