'use strict';
// ===== core: canvas, input, DQ-style windows =====
const W=512,H=448,T=32,VW=16,VH=14,S=3;
const cv=document.getElementById('c');let ctx=cv.getContext('2d');
cv.width=W*S;cv.height=H*S;
const FONT='"DotGothic16","Hiragino Kaku Gothic ProN","MS Gothic",monospace';
let passwordOpen=false;
const keys={},pressed={},RUN={t:false,h:false};
const KM={ArrowUp:'u',ArrowDown:'d',ArrowLeft:'l',ArrowRight:'r',w:'u',s:'d',a:'l',d:'r',Enter:'a',z:'a',' ':'a',x:'b',Escape:'b',Backspace:'b'};
addEventListener('keydown',e=>{if(passwordOpen)return;if(e.key==='Shift'){RUN.h=true;return;}const m=KM[e.key];if(!m)return;e.preventDefault();if(!keys[m])pressed[m]=true;keys[m]=true;});
addEventListener('keyup',e=>{if(e.key==='Shift'){RUN.h=false;return;}const m=KM[e.key];if(m)keys[m]=false;});
const vib=ms=>{try{if(window.UICFG&&UICFG.vib===false)return;navigator.vibrate&&navigator.vibrate(ms);}catch(e){}};
// --- Gamepad (Switch Pro / Joy-Con / any standard pad). Nintendo layout(入れ替え済み): B=bottom(0)=決定, A=right(1)=キャンセル ---
const PAD={u:0,d:0,l:0,r:0,a:0,b:0,run:0};let padOn=false;
const PADINFO={ok:true,err:'',id:'',mapping:'',btn:[],axes:[],show:false};
function readPads(){ // iframe等でGamepad APIが禁止されていても例外でゲームが止まらないようにする
  try{const gps=navigator.getGamepads?navigator.getGamepads():[];PADINFO.ok=!!navigator.getGamepads;return gps||[];}
  catch(e){PADINFO.ok=false;PADINFO.err=String(e&&e.name||e);return [];}
}
const PMAP_DEF={a:[0,2,8],b:[1,3,9],run:[4,5,6,7]};
let PCAP=null;
function pmap(k){const m=window.UICFG&&UICFG.pmap&&UICFG.pmap[k];return Array.isArray(m)&&m.length?m:PMAP_DEF[k];}
function padUI(any,n){const b=document.getElementById('padb');if(!b)return;
  if(any!==b._on){b._on=any;b.style.display=any?'flex':'none';}
  if(any)b.classList.toggle('act',!!(n.u||n.d||n.l||n.r||n.a||n.b||n.run));}
function padLost(){if((typeof G!=="undefined"&&G.paused))return;G.paused=true;const e=document.getElementById('padmsg');if(e)e.classList.add('open');}
function padResume(){if(!((typeof G!=="undefined"&&G.paused)))return;G.paused=false;const e=document.getElementById('padmsg');if(e)e.classList.remove('open');for(const k in keys)keys[k]=false;clearKeys();}
function pollPad(){
  const gps=readPads();let n={u:0,d:0,l:0,r:0,a:0,b:0,run:0},any=false;
  for(const g of gps){if(!g||!g.connected)continue;any=true;const B=i=>g.buttons[i]&&(g.buttons[i].pressed||g.buttons[i].value>.5);
    const ax=g.axes[0]||0,ay=g.axes[1]||0,big=Math.abs(ax)>=Math.abs(ay);
    if(B(12)||(!big&&ay<-.5))n.u=1;if(B(13)||(!big&&ay>.5))n.d=1;
    if(B(14)||(big&&ax<-.5))n.l=1;if(B(15)||(big&&ax>.5))n.r=1;
    // 非standardマッピング(Joy-Con/一部のProコン)は十字キーが axes[9] のハット値で来る
    if(g.axes.length>9&&!(n.u||n.d||n.l||n.r)){const h=g.axes[9];
      if(h<=1.05){const d=Math.round((h+1)*3.5)%8;if([7,0,1].includes(d))n.u=1;if([1,2,3].includes(d))n.r=1;if([3,4,5].includes(d))n.d=1;if([5,6,7].includes(d))n.l=1;}}
    // ボタン割り当て(⚙で変更可)。初期値: 決定=B/Y/−(0,2,8) メニュー=A/X/+(1,3,9) はしる=L/R/ZL/ZR(4-7)
    const hit=ks=>ks.some(i=>B(i));
    if(hit(pmap('a')))n.a=1;if(hit(pmap('b')))n.b=1;if(hit(pmap('run')))n.run=1;
    const pv=PADINFO.prev||(PADINFO.prev=[]);
    g.buttons.forEach((b,i)=>{const on=!!(b&&(b.pressed||b.value>.5));if(on&&!pv[i]){PADINFO.last=i;if(PCAP){const f=PCAP;PCAP=null;try{f(i);}catch(e){}}}pv[i]=on;});
    PADINFO.id=(g.id||'').slice(0,40);PADINFO.mapping=g.mapping||'(none)';
    PADINFO.btn=g.buttons.map((b,i)=>b&&(b.pressed||b.value>.5)?i:-1).filter(i=>i>=0);PADINFO.axes=g.axes.map(v=>Math.round(v*10)/10);
    if(PADINFO.btn.length||n.u||n.d||n.l||n.r){try{bgmUnlock();}catch(e){}}  // コントローラー操作でもBGMを開始
  }
  if(PCAP){n={u:0,d:0,l:0,r:0,a:0,b:0,run:0};}   // 割り当て変更中は ゲームへ入力しない
  padUI(any,n);
  if(any&&!padOn){padOn=true;try{window.onPad&&window.onPad();}catch(e){}}
  if(!any&&padOn){padOn=false;PADINFO.id='';}
  for(const k of['u','d','l','r','a','b']){if(n[k]&&!PAD[k]){if(!keys[k])pressed[k]=true;keys[k]=true;}else if(!n[k]&&PAD[k])keys[k]=false;PAD[k]=n[k];}
  RUN.p=n.run;
}
addEventListener('gamepadconnected',e=>{try{window.onPad&&window.onPad(e.gamepad&&e.gamepad.id);padResume();}catch(_){}});
addEventListener('gamepaddisconnected',()=>{try{if(readPads().some(g=>g&&g.connected))return;if(G.mode==='map'||G.mode==='battle'||G.mode==='select')padLost();}catch(_){}});
addEventListener('keydown',e=>{if(passwordOpen)return;if(G.paused){padResume();return;}if(e.key==='p'||e.key==='P'){window.padDiag&&padDiag();}});
document.addEventListener('pointerdown',()=>{if((typeof G!=="undefined"&&G.paused))padResume();},true);
// --- touch hardening: no double-tap zoom, no pinch, no scroll / pull-to-refresh, no long-press menu ---
(()=>{let last=0;
  document.addEventListener('touchend',e=>{if(e.target.closest('#password-panel'))return;const n=Date.now();if(n-last<400)e.preventDefault();last=n;},{passive:false});
  document.addEventListener('touchstart',e=>{if(e.touches.length>1)e.preventDefault();},{passive:false});
  document.addEventListener('touchmove',e=>{if(!e.target.closest('#password-panel'))e.preventDefault();},{passive:false});
  for(const ev of['gesturestart','gesturechange','gestureend','dblclick','contextmenu','selectstart','dragstart'])document.addEventListener(ev,e=>{if(!e.target.closest('#password-panel'))e.preventDefault();});
})();
// ===== 操作UI：十字キー(広い判定) / A・B(広い当たり判定) / 画面に合わせた自動最大サイズ / 設定(⚙) =====
var UICFG=Object.assign({size:2,swap:false,wide:true,op:.82,vib:true},(()=>{try{return JSON.parse(localStorage.getItem('dq_ui')||'{}')||{};}catch(e){return{};}})());
(()=>{
  const $=id=>document.getElementById(id);
  const ctl=$('ctl'),dp=$('dp'),ab=$('ab'),dpz=$('dpz');
  if(!ctl||!dp||!ab||!dpz)return;
  const SIZES=[.72,.86,1],landQ=matchMedia('(orientation:landscape) and (max-height:520px)');
  const save=()=>{try{localStorage.setItem('dq_ui',JSON.stringify(UICFG));}catch(e){}};
  // --- レイアウト：Aボタンの直径 u を「いま使える最大」に決め、ほかは全部 u から割り出す ---
  function layout(){
    const vw=innerWidth,vh=innerHeight,land=landQ.matches;
    ctl.classList.toggle('swap',!!UICFG.swap);ctl.style.setProperty('--op',UICFG.op);
    const r0=ctl.getBoundingClientRect();let u;
    if(land){const cw=vh*512/448,g=(vw-cw)/2;u=Math.min(Math.max((g-18)/2.3,vh*.22),vh*.27);}   // よこ持ち：画面の左右のあきスペースにちょうど収める
    else{u=Math.min((r0.width-28)/4.45,(r0.height-20)/2.3,130);}                                  // たて持ち：ゲーム画面の下ぜんぶが操作エリア
    u=Math.max(40,Math.floor(u*(SIZES[UICFG.size]||1)));ctl.style.setProperty('--u',u+'px');
    // 十字キーのタッチ判定ゾーン：見た目より広い（ひろい=操作エリアの片側ぜんぶ / ふつう=見た目+15%）
    const rc=ctl.getBoundingClientRect(),rd=dp.getBoundingClientRect(),ra=ab.getBoundingClientRect(),cw=rc.width,ch=rc.height,D=rd.width;
    let x0,x1,y0,y1;
    if(UICFG.wide){
      if(land){y0=Math.max(0,rd.top-rc.top-D*.5);y1=ch;
        if(!UICFG.swap){x0=0;x1=Math.min(rd.right-rc.left+D*.3,ra.left-rc.left-6);}else{x1=cw;x0=Math.max(rd.left-rc.left-D*.3,ra.right-rc.left+6);}}
      else{y0=0;y1=ch;if(!UICFG.swap){x0=0;x1=ra.left-rc.left-6;}else{x1=cw;x0=ra.right-rc.left+6;}}
    }else{x0=rd.left-rc.left-D*.15;x1=rd.right-rc.left+D*.15;y0=rd.top-rc.top-D*.15;y1=rd.bottom-rc.top+D*.15;}
    Object.assign(dpz.style,{left:x0+'px',top:y0+'px',width:Math.max(0,x1-x0)+'px',height:Math.max(0,y1-y0)+'px'});
  }
  // --- 十字キー：1本の指でスライドして向きを変える（角度で判定。ゾーンのどこを触ってもOK） ---
  let pid=null,cur=null;
  const set=k=>{if(k===cur)return;if(cur)keys[cur]=false;cur=k;if(k){if(!keys[k])pressed[k]=true;keys[k]=true;vib(5);}
    dp.querySelectorAll('[data-k]').forEach(b=>b.classList.toggle('on',b.dataset.k===k));};
  const calc=e=>{const r=dp.getBoundingClientRect(),x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2),R=r.width/2;
    if(Math.hypot(x,y)<R*.12)return null;const ax=Math.abs(x),ay=Math.abs(y);
    const horiz=cur==='l'||cur==='r',vert=cur==='u'||cur==='d';
    let h=ax>=ay;if(horiz&&ax>=ay*.62)h=true;else if(vert&&ay>=ax*.62)h=false;   // ななめは 今の向きを優先(ヒステリシス)
    return h?(x<0?'l':'r'):(y<0?'u':'d');};
  dpz.addEventListener('pointerdown',e=>{e.preventDefault();if(pid!==null)return;pid=e.pointerId;try{dpz.setPointerCapture(pid);}catch(_){}set(calc(e));});
  dpz.addEventListener('pointermove',e=>{if(e.pointerId===pid)set(calc(e));});
  const up=e=>{if(e.pointerId===pid){pid=null;set(null);}};
  dpz.addEventListener('pointerup',up);dpz.addEventListener('pointercancel',up);dpz.addEventListener('lostpointercapture',up);
  document.addEventListener('pointerup',up);document.addEventListener('pointercancel',up);   // 取りこぼし防止(キャプチャが外れても離したら必ず解除)
  // --- A / B / はしる：マルチタッチ、広い当たり判定(CSSの::after)、指が外へずれても押しっぱなし維持 ---
  ab.querySelectorAll('[data-k]').forEach(b=>{
    const k=b.dataset.k;
    if(k==='run'){b.addEventListener('pointerdown',e=>{e.preventDefault();RUN.t=!RUN.t;b.classList.toggle('on',RUN.t);b.textContent=RUN.t?'はしる ON':'はしる';vib(8);});return;}
    const on=e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId);}catch(_){}if(!keys[k])pressed[k]=true;keys[k]=true;b.classList.add('on');vib(8);};
    const off=e=>{e.preventDefault();keys[k]=false;b.classList.remove('on');};
    b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',off);
  });
  // --- 入力が残りっぱなしにならないように：画面を離れる/ブラウザ復帰/回転のとき全部リリース ---
  const rel=()=>{pid=null;set(null);for(const k in keys)keys[k]=false;ab.querySelectorAll('button:not(.run)').forEach(b=>b.classList.remove('on'));};
  addEventListener('blur',rel);addEventListener('pagehide',rel);addEventListener('orientationchange',rel);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)rel();});
  // --- そうさ せってい(⚙) ---
  const OPTS=[
    {t:'ボタンの おおきさ',k:'size',o:[['小',0],['中',1],['大(さいだい)',2]]},
    {t:'ボタンの はいち',k:'swap',o:[['みぎきき',false],['ひだりきき',true]]},
    {t:'十字キーの タッチはんい',k:'wide',o:[['ひろい',true],['ふつう',false]]},
    {t:'ボタンの こさ',k:'op',o:[['うすい',.55],['ふつう',.82],['こい',1]]},
    {t:'しんどう',k:'vib',o:[['あり',true],['なし',false]]}];
  const cfgp=$('cfgp'),rows=$('cfgrows');
  function render(){rows.innerHTML='';
    for(const r of OPTS){const row=document.createElement('div');row.className='row';row.innerHTML='<span>'+r.t+'</span><div class="opts"></div>';
      const box=row.lastChild;
      for(const [lab,val] of r.o){const b=document.createElement('button');b.textContent=lab;if(UICFG[r.k]===val)b.className='sel';
        b.addEventListener('pointerdown',e=>{e.preventDefault();UICFG[r.k]=val;save();layout();render();vib(10);});box.appendChild(b);}
      rows.appendChild(row);}
    const sec=document.createElement('div');sec.className='row';sec.innerHTML='<span>🎮 コントローラー（ホリコンなど）</span>';
    const names={a:'決定',b:'メニュー・もどる',run:'はしる'};
    for(const k of['a','b','run']){const bt=document.createElement('button');bt.className='padmap';bt.textContent=names[k]+'：ボタン '+pmap(k).join('・')+'（おして へんこう）';
      bt.addEventListener('pointerdown',e=>{e.preventDefault();bt.textContent=names[k]+'：コントローラーの ボタンを おしてね…';PCAP=i=>{UICFG.pmap=Object.assign({},UICFG.pmap||{},{[k]:[i]});save();render();};});sec.appendChild(bt);}
    const rs=document.createElement('button');rs.className='padmap';rs.textContent='わりあてを もとに もどす';rs.addEventListener('pointerdown',e=>{e.preventDefault();PCAP=null;delete UICFG.pmap;save();render();});sec.appendChild(rs);
    const dg=document.createElement('button');dg.className='padmap';dg.textContent='コントローラー しんだん を ひらく';dg.addEventListener('pointerdown',e=>{e.preventDefault();open(false);padDiag();});sec.appendChild(dg);
    rows.appendChild(sec);}
  const open=o=>{if(!o)PCAP=null;cfgp.classList.toggle('open',o);if(o)render();};
  // --- コントローラー しんだん(P キー / ⚙から) ---
  const diag=$('diag'),dt=$('diagt');let dtm=null;
  function diagText(){const g=(readPads().filter(x=>x&&x.connected))[0];
    const yn=v=>v?'●':'○';
    let t='ブラウザの ゲームパッドAPI: '+(PADINFO.ok?'つかえる':'つかえない '+PADINFO.err)+'\n';
    if(!g)return t+'つながって いるコントローラー: なし\n\n▶ コントローラーを つないで、この ページを一どクリック → ボタンを ひとつ おしてね（ブラウザの しようで、おすまで みえない ことが あります）';
    t+='なまえ: '+(g.id||'').slice(0,60)+'\nマッピング: '+(g.mapping||'(standardじゃない)')+'\nボタンすう: '+g.buttons.length+'  じくすう: '+g.axes.length+'\n';
    t+='いま おしてる ボタン: '+(g.buttons.map((b,i)=>b&&(b.pressed||b.value>.5)?i:-1).filter(i=>i>=0).join(',')||'なし')+'\n';
    t+='さいごに おした ボタン: '+(PADINFO.last===undefined?'まだ':PADINFO.last)+'\n';
    t+='じくの あたい: '+g.axes.map(v=>(Math.round(v*100)/100)).join(' , ')+'\n\n';
    t+='ゲームへの にゅうりょく: '+['u','d','l','r'].map((k,i)=>'↑↓←→'[i]+yn(keys[k])).join(' ')+'  A'+yn(keys.a)+' B'+yn(keys.b)+' はしる'+yn(RUN.p)+'\n';
    t+='わりあて: 決定='+pmap('a').join('・')+' / メニュー='+pmap('b').join('・')+' / はしる='+pmap('run').join('・');
    return t;}
  window.padDiag=()=>{const o=!diag.classList.contains('open');diag.classList.toggle('open',o);clearInterval(dtm);if(o){dt.textContent=diagText();dtm=setInterval(()=>{dt.textContent=diagText();},150);}};
  $('diagx').addEventListener('pointerdown',e=>{e.preventDefault();window.padDiag();});
  diag.addEventListener('pointerdown',e=>{if(e.target===diag)window.padDiag();});
  $('cfgb').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();open(!cfgp.classList.contains('open'));});
  $('cfgx').addEventListener('pointerdown',e=>{e.preventDefault();open(false);});
  cfgp.addEventListener('pointerdown',e=>{if(e.target===cfgp)open(false);});
  addEventListener('resize',layout);addEventListener('orientationchange',()=>setTimeout(layout,150));
  if(window.visualViewport)visualViewport.addEventListener('resize',layout);
  if(window.ResizeObserver)new ResizeObserver(layout).observe(ctl);
  layout();setTimeout(layout,300);
  window.dqLayout=layout;
})();
function took(k){if(pressed[k]){pressed[k]=false;return true;}return false;}
function clearKeys(){for(const k in pressed)pressed[k]=false;}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const rnd=n=>Math.floor(Math.random()*n);
const G={mode:'title',f:{},story:'hero',busy:false,tick:0,fade:0,shake:0};

// ---- text & boxes ----
function text(s,x,y,c='#fff',sz=16){ctx.font=sz+'px '+FONT;ctx.fillStyle=c;ctx.textBaseline='top';ctx.fillText(s,x,y);}
function tw(s,sz=16){ctx.font=sz+'px '+FONT;return ctx.measureText(s).width;}
function box(x,y,w,h){
  ctx.fillStyle='#000';ctx.fillRect(x,y,w,h);
  ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.strokeRect(x+2,y+2,w-4,h-4);
  ctx.strokeStyle='#6a7cff';ctx.lineWidth=1;ctx.strokeRect(x+7,y+7,w-14,h-14);
}
function wrapText(s,maxw){
  ctx.font='16px '+FONT;const out=[];
  for(const para of s.split('\n')){let line='';
    for(const ch of para){if(ctx.measureText(line+ch).width>maxw){out.push(line);line=ch;}else line+=ch;}
    out.push(line);}
  return out;
}
function statBox(x,y,pc,w=150){
  box(x,y,w,112);
  text(pc.name,x+16,y+14);text('LV '+pc.lv,x+16,y+38);
  text('HP '+String(pc.hp).padStart(3,' '),x+16,y+62,pc.hp<=pc.mhp/4?'#ff6':'#fff');
  text('MP '+String(pc.mp).padStart(3,' '),x+16,y+84);
}

// ---- UI stack (async dialog / menu) ----
const UI=[];
function say(s,name){
  return new Promise(res=>{
    const L=wrapText(s,W-84),pages=[];
    for(let i=0;i<L.length;i+=3)pages.push(L.slice(i,i+3));
    UI.push({t:'msg',pages,p:0,n:0,name,res});
  });
}
async function sayAll(arr,name){for(const s of arr)await say(s,name);}
function choose(opts,o={}){
  return new Promise(res=>UI.push({t:'menu',opts,i:0,x:o.x??24,y:o.y??24,w:o.w,cancel:o.cancel,title:o.title,dis:o.dis||[],res}));
}
const HOLD={};
function repeat(k,start=16,every=4){if(keys[k]){const n=HOLD[k]=(HOLD[k]||0)+1;return n>start&&(n-start)%every===0;}HOLD[k]=0;return false;}
function uiUpdate(){
  const u=UI[UI.length-1];if(!u)return;
  if(u.t==='msg'){
    const tot=u.pages[u.p].join('').length;
    u.n=Math.min(tot,u.n+0.9);
    if(took('a')||took('b')||repeat('a',26,6)){
      if(u.n<tot)u.n=tot;
      else{u.p++;u.n=0;if(u.p>=u.pages.length){UI.pop();u.res();}}
    }
  }else if(u.t==='menu'){
    const n=u.opts.length;
    if(took('u')||repeat('u'))u.i=(u.i+n-1)%n;
    if(took('d')||repeat('d'))u.i=(u.i+1)%n;
    if(took('a')){if(!u.dis[u.i]){UI.pop();u.res(u.i);}}
    else if(took('b')&&u.cancel){UI.pop();u.res(-1);}
  }
}
function uiDraw(){
  for(const u of UI){
    if(u.t==='msg'){
      const y=H-132;box(12,y,W-24,120);
      if(u.name){const nw=tw(u.name)+44;box(12,y-38,nw,44);text(u.name,34,y-26,'#ffd23f');}
      let left=u.n;
      u.pages[u.p].forEach((ln,i)=>{text(ln.slice(0,Math.max(0,Math.floor(left))),34,y+20+i*28);left-=ln.length;});
      if(u.n>=u.pages[u.p].join('').length&&((G.tick>>4)&1))text('▼',W-52,y+88);
    }else if(u.t==='menu'){
      let w=u.w||Math.max(...u.opts.map(o=>tw(o)))+72;
      const th=u.title?30:0,h=u.opts.length*28+36+th;
      box(u.x,u.y,w,h);
      if(u.title)text(u.title,u.x+20,u.y+14,'#ffd23f');
      u.opts.forEach((o,i)=>text(o,u.x+44,u.y+18+th+i*28,u.dis[i]?'#777':'#fff'));
      text('▶',u.x+18,u.y+18+th+u.i*28);
    }
  }
}
async function fade(to,ms=350){
  const from=G.fade,n=Math.max(1,Math.floor(ms/16));
  for(let i=1;i<=n;i++){G.fade=from+(to-from)*i/n;await sleep(16);}
  G.fade=to;
}
