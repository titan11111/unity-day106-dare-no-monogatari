'use strict';
// ===== VFX: ドット絵エフェクト（pixel-vfx-forge方式）=====
// 低解像度キャンバスに1pxずつ描き → 3倍拡大(ニアレスト) → 縮小コピーでブルームを重ねる。
// 呪文・特技・攻撃の演出を VFX.spell / VFX.special / VFX.play で呼び出す。
const VFX=(()=>{
  const PAL={
    FIRE:['#fffbe0','#ffe070','#ffb030','#ff7a1f','#e0401a','#a02a14','#5a1a12'],
    GOLD:['#ffffff','#fff8c0','#ffe050','#f0b020','#a06810','#5a3a08'],
    VIO:['#ffffff','#f0d0ff','#c070ff','#8a3ae0','#5a24a8','#2e1460'],
    PINK:['#ffffff','#ffd0e8','#ff8ac0','#e0409a','#8a1a5a'],
    GREEN:['#ffffff','#d0ffd0','#7aff8a','#2ec84a','#146a2a'],
    CYAN:['#ffffff','#d0fcff','#7aeaff','#2aaad8','#146a98'],
    RED:['#fff0f0','#ff9a9a','#ff4a4a','#c01820','#600a10'],
    WHITE:['#ffffff','#e8f0ff','#a8b8e0','#5a6a98'],
    SMOKE:['#8a8a96','#5a5a66','#3a3a44','#22222a'],
    DUST:['#e8d8b8','#b89c70','#8a7048','#5a4630']
  };
  const SPR={
    heart:['.xx.xx.','xxxxxxx','xxxxxxx','.xxxxx.','..xxx..','...x...'],
    star:['..x..','.xxx.','xxxxx','.xxx.','..x..'],
    plus:['.x.','xxx','.x.'],
    note:['..xx','..x.','..x.','xxx.','xx..'],
    paw:['x.xx.x','x.xx.x','.xxxx.','xxxxxx','xxxxxx','.xxxx.'],
    anger:['x..x','.xx.','.xx.','x..x']
  };
  const REG={foe:{x:186,y:20,w:306,h:280,lw:102,lh:93},pc:{x:12,y:10,w:150,h:112,lw:50,lh:37}};
  const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const R={};
  for(const k in REG){const g=REG[k];const F=mk(g.lw,g.lh),B1=mk(g.lw>>1,g.lh>>1),B2=mk(Math.round(g.lw/6),Math.round(g.lh/6));
    R[k]={F,fc:F.getContext('2d'),B1,b1:B1.getContext('2d'),B2,b2:B2.getContext('2d'),runs:[],last:0,acc:0};}
  const rr=(a,b)=>a+Math.random()*(b-a),ri=n=>Math.floor(Math.random()*n),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  const fl=new Map();   // 全画面フラッシュ

  function mkE(run){
    const reg=run.reg,g=REG[reg],fc=R[reg].fc;
    const E={W:g.lw,H:g.lh,T:reg==='foe'?{x:51,y:56}:{x:25,y:18},d:run.d,o:run.o,pal:PAL[run.o.pal]||null,
      add(o){if(run.parts.length<700)run.parts.push(Object.assign({age:0,life:30,size:1,grav:0,drag:1,vx:0,vy:0,pal:PAL.FIRE},o));},
      px(x,y,w,h,c,a=1,comp='source-over'){fc.globalCompositeOperation=comp;fc.globalAlpha=a;fc.fillStyle=c;fc.fillRect(Math.round(x),Math.round(y),w,h);fc.globalAlpha=1;},
      circ(cx,cy,r,c,a=1){fc.globalCompositeOperation='source-over';fc.globalAlpha=a;fc.fillStyle=c;for(let dy=-r;dy<=r;dy++){const hw=Math.round(Math.sqrt(Math.max(0,r*r-dy*dy)));fc.fillRect(Math.round(cx)-hw,Math.round(cy)+dy,hw*2+1,1);}fc.globalAlpha=1;},
      ring(cx,cy,r,c,a=1,sq=1){fc.globalCompositeOperation='lighter';fc.globalAlpha=a;fc.fillStyle=c;const n=Math.max(12,Math.round(r*6));for(let i=0;i<n;i++){const an=i/n*Math.PI*2;fc.fillRect(Math.round(cx+Math.cos(an)*r),Math.round(cy+Math.sin(an)*r*sq),1,1);}fc.globalAlpha=1;},
      line(x0,y0,x1,y1,c,w=1,a=1){fc.globalCompositeOperation='source-over';fc.globalAlpha=a;fc.fillStyle=c;x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
        const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let er=dx+dy,n=0;
        while(n++<400){fc.fillRect(x0,y0,w,w);if(x0===x1&&y0===y1)break;const e2=2*er;if(e2>=dy){er+=dy;x0+=sx;}if(e2<=dx){er+=dx;y0+=sy;}}fc.globalAlpha=1;},
      poly(pts,c,w=1){for(let i=0;i<pts.length-1;i++)E.line(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],c,w);},
      bolt(x0,y0,x1,y1,jit,seg){const p=[[x0,y0]];for(let i=1;i<seg;i++){const q=i/seg;p.push([x0+(x1-x0)*q+rr(-jit,jit),y0+(y1-y0)*q+rr(-jit*.3,jit*.3)]);}p.push([x1,y1]);return p;},
      spr(rows,cx,cy,c,a=1){fc.globalCompositeOperation='source-over';fc.globalAlpha=a;fc.fillStyle=c;const h=rows.length,w=rows[0].length;
        for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(rows[j][i]==='x')fc.fillRect(Math.round(cx-w/2)+i,Math.round(cy-h/2)+j,1,1);fc.globalAlpha=1;},
      rect(x,y,w,h,c,a=1){fc.globalCompositeOperation='lighter';fc.globalAlpha=a;fc.fillStyle=c;fc.fillRect(Math.round(x),Math.round(y),w,h);fc.globalAlpha=1;},
      flash(a,rgb='255,255,255'){fl.set(reg,{a,rgb});},
      burst(x,y,n,o){for(let i=0;i<n;i++){const an=Math.random()*Math.PI*2,s=rr(o.s0||.8,o.s1||3);E.add(Object.assign({x,y,vx:Math.cos(an)*s,vy:Math.sin(an)*s+(o.up||0),life:20+ri(14),size:2+ri(2),pal:PAL.FIRE,grav:.03,drag:.93},o.p||{}));}}
    };
    return E;
  }

  // ---------- エフェクトのレシピ ----------
  const FXS={};
  // ひのこ：火の玉が飛んで着弾→炎の柱（焚き火レシピ）
  FXS.fire={reg:'foe',dur:80,frame(E,t){const T=E.T;
    if(t<26){const p=t/26,x=4+(T.x-4)*p,y=82+(T.y-82)*p-Math.sin(p*Math.PI)*20;
      for(let i=0;i<3;i++)E.add({x,y,vx:rr(-.3,.3),vy:rr(-.5,.2),life:16+ri(8),size:3,pal:PAL.FIRE,grav:-.02,drag:.96});
      E.circ(x,y,4,'#e0401a');E.circ(x,y,3,'#ff9a28');E.circ(x,y,2,'#ffe070');E.circ(x,y,1,'#fffbe0');}
    if(t===26){E.flash(.4,'255,190,100');E.burst(T.x,T.y,80,{s0:.8,s1:3.4,up:-.4});}
    if(t>=26&&t<42)E.ring(T.x,T.y,(t-26)*2.4,'#ffb030',1-(t-26)/16,.8);
    if(t>=26&&t<58){for(let i=0;i<3;i++)E.add({x:T.x+rr(-12,12),y:T.y+16,vx:0,vy:rr(-1.8,-.8),life:26+ri(10),size:3,pal:PAL.FIRE,pull:.012,tx:T.x,wob:.25,wf:.3,ph:rr(0,6)});
      if(t%2===0)E.add({x:T.x+rr(-10,10),y:T.y-8,vx:rr(-.3,.3),vy:rr(-.6,-.2),life:30,size:2,pal:PAL.SMOKE,drag:.98});}}};
  // いかずち/かみなり：稲妻（折れ線のジッター・3フレームごと再生成）
  FXS.thunder={reg:'foe',dur:70,frame(E,t){const T=E.T;
    if(t===2)E.flash(.55,'230,240,255');
    if(t===6)E.flash(.8,'200,230,255');
    if(t>=4&&t<34){if(t%3===1||!E.d.b){E.d.b=[E.bolt(T.x+rr(-10,10),0,T.x,T.y,7,9),E.bolt(T.x+rr(-26,26),0,T.x+rr(-10,10),T.y+rr(-6,6),6,8)];}
      E.poly(E.d.b[1],'#2aaad8',3);E.poly(E.d.b[1],'#d0fcff',1);E.poly(E.d.b[0],'#7aeaff',5);E.poly(E.d.b[0],'#ffffff',2);E.circ(T.x,T.y,3+(t%2),'#ffffff');
      for(let i=0;i<2;i++)E.add({x:T.x,y:T.y,vx:rr(-2.4,2.4),vy:rr(-2.4,.6),life:10+ri(8),size:2,pal:PAL.CYAN,grav:.06,drag:.94});}
    if(t>=6&&t<22)E.ring(T.x,T.y,(t-6)*2.6,'#7aeaff',1-(t-6)/16,.7);}};
  // ひゃくねんの ちから：光柱（外・内・芯の3矩形を加算）
  FXS.pillar={reg:'foe',dur:96,frame(E,t){const T=E.T,a=cl(Math.min(t/10,(96-t)/22),0,1),pu=Math.sin(t*.3);
    if(t===8)E.flash(.35,'200,140,255');
    E.rect(T.x-15,0,30,86,'#5a24a8',.35*a);E.rect(T.x-9,0,18,86,'#c070ff',.5*a);E.rect(T.x-(3+pu),0,6+pu*2,86,'#ffffff',.9*a);
    for(let i=0;i<5;i++){const y=((t*3+i*19)%86);E.rect(T.x-9,y,18,3,'#f0d0ff',.35*a);}
    for(let i=0;i<3;i++)E.ring(T.x,84,((t*1.6+i*9)%26)+2,'#c070ff',a*.8,.22);
    if(t<80)for(let i=0;i<2;i++)E.add({x:T.x+rr(-14,14),y:84,vy:rr(-2.4,-1),life:36+ri(14),size:2,pal:i?PAL.VIO:PAL.GOLD,wob:.2,wf:.2,ph:rr(0,6)});}};
  // そんちょうの いかり：赤い衝撃波と放射線
  FXS.rage={reg:'foe',dur:78,frame(E,t){const T=E.T;
    if(t===4){E.flash(.4,'255,60,40');G.shake=8;}
    for(let k=0;k<3;k++){const t0=k*10,r=(t-t0)*2.6;if(r>0&&r<34)E.ring(T.x,T.y,r,k%2?'#ff9a9a':'#ff4a4a',1-r/34,.85);}
    if(t>=4&&t<24)for(let i=0;i<12;i++){const an=i/12*Math.PI*2+.2,r0=8+(t-4)*1.2,r1=r0+8+(i%3)*4;E.line(T.x+Math.cos(an)*r0,T.y+Math.sin(an)*r0*.85,T.x+Math.cos(an)*r1,T.y+Math.sin(an)*r1*.85,i%2?'#ffe070':'#ff4a4a',1);}
    if(t>=6&&t<40)E.spr(SPR.anger,T.x+22+Math.sin(t*.5)*1.5,T.y-30,'#ff3a3a');
    if(t%3===0&&t<50)E.add({x:T.x+rr(-6,6),y:T.y+rr(-6,6),vx:rr(-2,2),vy:rr(-2,2),life:18,size:2,pal:PAL.RED,drag:.95});}};
  // 斬撃（たたかう／ばっさい／ひきょうな こうげき）
  FXS.slash={reg:'foe',dur:34,frame(E,t){const T=E.T,n=E.o.n||1,col=E.o.col||'#ffffff',pal=PAL[E.o.pal]||PAL.WHITE,sc=E.W/102;
    const S=[[[T.x+22*sc,T.y-30*sc],[T.x-22*sc,T.y+28*sc],0],[[T.x-24*sc,T.y-26*sc],[T.x+24*sc,T.y+30*sc],7],[[T.x+4*sc,T.y-34*sc],[T.x-4*sc,T.y+34*sc],14]];
    for(let i=0;i<Math.min(n,3);i++){const [a,b,t0]=S[i],p=cl((t-t0)/6,0,1),q=cl((t-t0-4)/7,0,1);if(t<t0)continue;
      const x1=a[0]+(b[0]-a[0])*p,y1=a[1]+(b[1]-a[1])*p,x0=a[0]+(b[0]-a[0])*q,y0=a[1]+(b[1]-a[1])*q;
      if(q<1){E.line(x0,y0,x1,y1,col,3,.55);E.line(x0,y0,x1,y1,'#ffffff',1);}
      if(t===t0+5){E.add({x:x1,y:y1,vx:0,vy:0,life:1,size:1,pal:pal});for(let j=0;j<10;j++)E.add({x:x1,y:y1,vx:rr(-2.4,2.4),vy:rr(-2.4,1),life:12+ri(8),size:2,pal:pal,grav:.08,drag:.94});if(i===0)E.flash(.22,'255,255,255');}}}};
  // 敵のひっかき（自分側HUD）
  FXS.claw={reg:'pc',dur:30,frame(E,t){for(let i=0;i<3;i++){const t0=i*3,p=cl((t-t0)/5,0,1);if(t<t0)continue;const x=8+i*13,a=[x+10,2],b=[x-2,34];
    const q=cl((t-t0-3)/8,0,1),x0=a[0]+(b[0]-a[0])*q,y0=a[1]+(b[1]-a[1])*q,x1=a[0]+(b[0]-a[0])*p,y1=a[1]+(b[1]-a[1])*p;if(q<1){E.line(x0,y0,x1,y1,'#ff4a4a',2,.7);E.line(x0,y0,x1,y1,'#ffffff',1);}}
    if(t===4)E.flash(.25,'255,60,40');}};
  // ナイフなげ
  FXS.knife={reg:'foe',dur:48,frame(E,t){const T=E.T;
    for(let k=0;k<3;k++){const t0=k*7,p=cl((t-t0)/14,0,1);if(t<t0||p>=1)continue;const sx=6,sy=70+k*7,ex=T.x+(k-1)*9,ey=T.y+(k-1)*8,x=sx+(ex-sx)*p,y=sy+(ey-sy)*p;
      const dx=ex-sx,dy=ey-sy,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L;E.line(x-ux*9,y-uy*9,x,y,'#8a90a8',2);E.line(x-ux*3,y-uy*3,x+ux*3,y+uy*3,'#ffffff',1);E.circ(x-ux*10,y-uy*10,1,'#5a3a1a');
      E.add({x:x-ux*6,y:y-uy*6,life:10,size:1,pal:PAL.WHITE});
      if(t===t0+13){E.burst(ex,ey,12,{s0:.6,s1:2.4,p:{pal:PAL.WHITE,life:12}});}}
    if(t===14)E.flash(.18,'255,255,255');}};
  // どろだんご
  FXS.mud={reg:'foe',dur:64,frame(E,t){const T=E.T;
    if(t<24){const p=t/24,x=4+(T.x-4)*p,y=80+(T.y-80)*p-Math.sin(p*Math.PI)*24;E.circ(x,y,4,'#5a3a1c');E.circ(x,y,3,'#7a5230');E.px(x-2,y-2,2,1,'#b08a5a');E.add({x,y,vx:rr(-.3,.3),vy:rr(-.2,.4),life:12,size:2,pal:PAL.DUST,grav:.05});}
    if(t>=24&&t<32){const r=Math.min(10,(t-24)*2);E.circ(T.x,T.y,r,'#5a3a1c',.9);E.circ(T.x-2,T.y-2,Math.max(0,r-3),'#7a5230',.9);}
    if(t===24){E.burst(T.x,T.y,46,{s0:.8,s1:3,up:-1.2,p:{pal:PAL.DUST,grav:.12,floor:88,life:40,size:3}});G.shake=4;}
    if(t>=32&&t<56){const r=10;E.circ(T.x,T.y,r,'#5a3a1c',cl((56-t)/24,0,1)*.9);}}};
  // 打撃（ギャルパンチ／ねこパンチ／ぷるぷるタックル）：星形の衝撃
  FXS.punch={reg:'foe',dur:48,frame(E,t){const T=E.T,pal=PAL[E.o.pal]||PAL.GOLD;
    if(t===3){E.flash(.4,'255,255,255');G.shake=6;E.burst(T.x,T.y,34,{s0:1,s1:3.4,p:{pal:pal,life:22}});}
    if(t>=3&&t<24){const q=(t-3)/21,r0=4+q*10,r1=r0+14*(1-q)+6;for(let i=0;i<10;i++){const an=i/10*Math.PI*2+q*.4,rr1=i%2?r1:r1*.6;E.line(T.x+Math.cos(an)*r0,T.y+Math.sin(an)*r0,T.x+Math.cos(an)*rr1,T.y+Math.sin(an)*rr1,i%2?pal[1]:pal[2],i%2?2:1,1-q);}
      E.ring(T.x,T.y,q*22,pal[2],1-q,.9);}
    if(E.o.paw&&t>=2&&t<28)E.spr(SPR.paw,T.x,T.y,'#ffe9b0',cl((28-t)/10,0,1));
    if(t>=4&&t<30&&t%4===0)E.spr(SPR.star,T.x+rr(-22,22),T.y+rr(-22,10),pal[2]);}};
  // 状態異常・うっとり：頭上を星/ハート/音符が周回
  FXS.swirl={reg:'foe',dur:84,frame(E,t){const T=E.T,pal=PAL[E.o.pal]||PAL.PINK,sh=SPR[E.o.shape||'star'],a=cl(Math.min(t/8,(84-t)/14),0,1);
    if(t===2)E.flash(.18,'255,255,255');
    const n=5,items=[];for(let i=0;i<n;i++){const an=t*.1+i/n*Math.PI*2;items.push([Math.cos(an)*24,Math.sin(an)*7,Math.sin(an)]);}
    items.sort((p,q)=>p[2]-q[2]).forEach(([dx,dy,z])=>{E.spr(sh,T.x+dx,T.y-30+dy,z<0?pal[3]:pal[1],a);});
    if(t%3===0&&t<70)E.add({x:T.x+rr(-26,26),y:T.y-30+rr(-6,6),vx:0,vy:rr(-.5,-.1),life:20,size:1,pal:pal,wob:.2,wf:.3,ph:rr(0,6)});
    E.ring(T.x,T.y-30,24,pal[3],.25*a,.3);}};
  // ぬすむ：土ぼこり＋コインが手前へ飛ぶ
  FXS.steal={reg:'foe',dur:64,frame(E,t){const T=E.T;
    if(t<12&&t%2===0)E.add({x:T.x+rr(-14,14),y:T.y+rr(0,14),vx:rr(-.6,.6),vy:rr(-.8,-.2),life:22,size:3,pal:PAL.DUST,drag:.96});
    for(let k=0;k<5;k++){const t0=6+k*5,p=cl((t-t0)/24,0,1);if(t<t0||p>=1)continue;const x=T.x+(6-T.x)*p+Math.sin(p*6+k)*3,y=T.y+(86-T.y)*p-Math.sin(p*Math.PI)*34;
      E.circ(x,y,2,'#f0b020');E.px(x-1,y-1,1,1,'#ffffff');E.add({x,y,life:10,size:1,pal:PAL.GOLD,vy:.2});}}};
  // かいふく（HUD側）：緑の光が舞い上がる／ハート／祈りの柱
  FXS.heal={reg:'pc',dur:80,frame(E,t){const pal=PAL[E.o.pal]||PAL.GREEN,big=E.o.big,sh=E.o.shape?SPR[E.o.shape]:null;
    if(t===2)E.flash(big?.3:.18,E.o.pal==='GOLD'?'255,240,160':E.o.pal==='PINK'?'255,170,210':'160,255,190');
    const a=cl(Math.min(t/8,(80-t)/18),0,1);
    if(E.o.pillar){E.rect(10,0,30,37,pal[3],.3*a);E.rect(17,0,16,37,pal[1],.5*a);E.rect(22,0,6,37,'#ffffff',.9*a);}
    for(let k=0;k<(big?2:1);k++){const r=((t*.9+k*14)%30);E.ring(25,34,r,pal[2],a*(1-r/30),.3);}
    if(t<60)for(let i=0;i<(big?4:2);i++)E.add({x:rr(6,44),y:rr(26,36),vx:0,vy:rr(-1.2,-.4),life:30+ri(14),size:ri(3)+1,pal:pal,wob:.25,wf:.25,ph:rr(0,6)});
    if(t%8===0&&t<64)E.spr(sh||SPR.plus,rr(8,42),rr(14,30),pal[1]);}};
  // 敵の特技ブレス（炎）
  FXS.breath={reg:'foe',dur:70,frame(E,t){const T=E.T,pal=PAL[E.o.pal]||PAL.FIRE;
    if(t===6)E.flash(.35,E.o.pal==='VIO'?'170,90,255':'255,150,60');if(t===10)G.shake=10;
    if(t>=4&&t<44)for(let i=0;i<7;i++)E.add({x:T.x-8,y:T.y-8+rr(-4,4),vx:rr(-3.6,-2),vy:rr(.4,1.6),life:26+ri(10),size:3+ri(2),pal:pal,grav:.01,drag:.985,wob:.3,wf:.3,ph:rr(0,6)});}};

  // ---------- 実行エンジン ----------
  function step(reg){
    const r=R[reg],fc=r.fc;fc.setTransform(1,0,0,1,0,0);fc.clearRect(0,0,r.F.width,r.F.height);
    for(let i=r.runs.length-1;i>=0;i--){const run=r.runs[i],spec=run.spec;
      if(!run.E)run.E=mkE(run);
      if(run.t<spec.dur){try{spec.frame(run.E,run.t);}catch(e){console.error('VFX',e&&e.message);run.t=spec.dur;run.parts.length=0;}}
      fc.globalCompositeOperation='lighter';
      for(let j=run.parts.length-1;j>=0;j--){const p=run.parts[j];p.age++;
        if(p.age>=p.life){run.parts.splice(j,1);continue;}
        const q=p.age/p.life;
        if(p.pull)p.vx+=(p.tx-p.x)*p.pull;
        p.vy+=p.grav;p.vx*=p.drag;p.vy*=p.drag;p.x+=p.vx+(p.wob?Math.sin(p.wf*p.age+p.ph)*p.wob:0);p.y+=p.vy;
        if(p.floor!==undefined&&p.y>p.floor){run.parts.splice(j,1);continue;}
        const sz=p.size>1&&q>.55?p.size-1:p.size;
        fc.fillStyle=p.pal[Math.min(p.pal.length-1,Math.floor(q*p.pal.length))];
        fc.fillRect(Math.round(p.x-sz/2),Math.round(p.y-sz/2),sz,sz);}
      run.t++;
      if(run.t>=spec.dur&&!run.parts.length)r.runs.splice(i,1);}
  }
  function draw(reg){
    const r=R[reg],g=REG[reg];if(!r.runs.length)return;
    const now=performance.now();let dt=Math.min(100,now-(r.last||now));r.last=now;r.acc+=dt;let n=0;
    if(r.frozen)r.acc=0;
    while(r.acc>=1000/60&&n<4){step(reg);r.acc-=1000/60;n++;if(!r.runs.length)break;}
    ctx.save();ctx.beginPath();ctx.rect(g.x,g.y,g.w,g.h);ctx.clip();
    ctx.imageSmoothingEnabled=false;ctx.globalCompositeOperation='source-over';ctx.drawImage(r.F,g.x,g.y,g.w,g.h);
    r.b1.clearRect(0,0,r.B1.width,r.B1.height);r.b1.imageSmoothingEnabled=true;r.b1.drawImage(r.F,0,0,r.B1.width,r.B1.height);
    r.b2.clearRect(0,0,r.B2.width,r.B2.height);r.b2.imageSmoothingEnabled=true;r.b2.drawImage(r.F,0,0,r.B2.width,r.B2.height);
    ctx.imageSmoothingEnabled=true;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.45;ctx.drawImage(r.B1,g.x,g.y,g.w,g.h);ctx.globalAlpha=.7;ctx.drawImage(r.B2,g.x,g.y,g.w,g.h);
    const f=fl.get(reg);if(f&&f.a>.02){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=f.a;ctx.fillStyle=`rgb(${f.rgb})`;ctx.fillRect(g.x,g.y,g.w,g.h);f.a*=.82;}
    ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  }
  async function play(name,o={}){
    const spec=FXS[name];if(!spec)return;
    try{const r=R[spec.reg];r.runs.push({reg:spec.reg,spec,t:0,parts:[],d:{},o,E:null});}catch(e){return;}
    await sleep(Math.round(spec.dur*16.7*(spec.hold||.85)));
  }
  // 呪文名 → エフェクト
  const MAP={
    'ひのこ':['fire'],'いかずち':['thunder'],'かみなり':['thunder'],'ひゃくねんの ちから':['pillar'],'そんちょうの いかり':['rage'],
    'ばっさい':['slash',{n:3,col:'#ff6a5a',pal:'RED'}],'ナイフなげ':['knife'],'どろだんご':['mud'],
    'ギャルパンチ':['punch',{pal:'PINK'}],'ねこパンチ':['punch',{pal:'GOLD',paw:1}],'ひきょうな こうげき':['slash',{n:2,col:'#c070ff',pal:'VIO'}],
    'ありがたい おはなし':['swirl',{shape:'star',pal:'GOLD'}],'おせじ':['swirl',{shape:'heart',pal:'PINK'}],'ウインク':['swirl',{shape:'heart',pal:'PINK'}],'にゃーおん':['swirl',{shape:'note',pal:'CYAN'}],
    'ぬすむ':['steal'],
    'いやしび':['heal'],'おおいやしび':['heal',{big:1}],'いのり':['heal',{pillar:1,pal:'GOLD',big:1}],'かあちゃんの はげまし':['heal',{shape:'heart',pal:'PINK'}],
    'こうしょう':['heal',{big:1,pal:'CYAN'}],'ごろごろ':['heal',{pal:'GOLD'}],'ハートビーム':['heal',{shape:'heart',pal:'PINK',big:1}]
  };
  const SPECIAL={'ぷるぷるタックル':['punch',{pal:'GREEN'}],'ほねほねスラッシュ':['slash',{n:3,col:'#ffffff'}],'ごうかのほのお':['breath',{pal:'FIRE'}],'やみのほのお':['breath',{pal:'VIO'}]};
  const spell=sp=>{const m=MAP[sp.n]||(sp.t==='heal'?['heal']:sp.t==='stun'?['swirl',{shape:'star',pal:'GOLD'}]:sp.t==='steal'?['steal']:['punch',{pal:'GOLD'}]);return play(m[0],m[1]||{});};
  const special=n=>{const m=SPECIAL[n];return m?play(m[0],m[1]||{}):Promise.resolve();};
  const debug=(name,o,frames)=>{const spec=FXS[name],r=R[spec.reg];r.runs.length=0;r.runs.push({reg:spec.reg,spec,t:0,parts:[],d:{},o:o||{},E:null});for(let i=0;i<frames;i++)step(spec.reg);r.last=performance.now();r.acc=0;r.frozen=true;};   // テスト用：指定フレームまで進める
  return {play,draw,spell,special,debug,PAL,FXS,MAP,R};
})();
