'use strict';
// ===== save / load (localStorage with in-memory fallback) =====
const MEMSAVE={};
const SAVE_KEY=i=>'dq_save_'+i;
function storeGet(k){try{const v=localStorage.getItem(k);if(v!==null)return v;}catch(e){}return MEMSAVE[k]||null;}
function storeSet(k,v){MEMSAVE[k]=v;try{localStorage.setItem(k,v);}catch(e){}}
function snapshot(){
  return {ver:1,t:Date.now(),story:G.story,f:G.f,open:G.open,pc:G.pc,gold:G.gold,home:G.home,map:G.map.id,x:G.px,y:G.py,dir:G.dir,cleared:clearedList()};
}
function writeSlot(i){try{storeSet(SAVE_KEY(i),JSON.stringify(snapshot()));return true;}catch(e){return false;}}
function autoSave(){if(G.mode==='map'&&G.pc&&G.map&&G.map.kind!=='cave')writeSlot(0);}
function readSlot(i){
  const raw=storeGet(SAVE_KEY(i));if(!raw)return null;
  try{const d=JSON.parse(raw);if(d&&d.ver===1&&MAPS[d.map]&&CHARS[d.story]&&d.pc)return d;}catch(e){}
  return null;
}
function slotLabel(i){
  const d=readSlot(i),nm=i===0?'オート':'セーブ'+i;
  if(!d)return `${nm}　――からっぽ――`;
  return `${nm}　${CHARS[d.story].label} LV${d.pc.lv}　${d.map==='world'?worldName(d.x,d.y):MAPS[d.map].name}`;
}
function applySave(d){
  if(Array.isArray(d.cleared))for(const id of d.cleared)if(Object.hasOwn(CHARS,id))markCleared(id);
  G.story=d.story;G.f=d.f||{};G.open=d.open||{};G.pc=d.pc;G.gold=d.gold;G.home=d.home||'v1';G.fx=[];
  G.pc.spells=CHARS[d.story].spells;G.pc.gr=GR;
  G.map=MAPS[d.map];G.px=d.x;G.py=d.y;G.dir=d.dir||0;G.mv=null;G.steps=0;G.card=null;
  refreshMap();G.wname=G.map.id==='world'?worldName(d.x,d.y):null;G.banner={text:G.map.id==='world'?worldName(d.x,d.y):G.map.name,t:110};
}
// The code contains the save itself, so it works without this browser's storage.
// FNV-1a detects copying errors; this is a recovery code, not an account secret.
function passwordChecksum(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return (h>>>0).toString(16).padStart(8,'0');}
function encodePassword(d){
  const pc={...d.pc};delete pc.spells;delete pc.gr;
  const bytes=new TextEncoder().encode(JSON.stringify({...d,pc}));
  const payload=btoa(Array.from(bytes,b=>String.fromCharCode(b)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  return 'DQ106.'+payload+'.'+passwordChecksum(payload);
}
function validatePasswordSave(d){
  const obj=o=>o&&typeof o==='object'&&!Array.isArray(o);
  const num=n=>Number.isFinite(n)&&n>=0&&n<=1000000000;
  const safe=o=>!obj(o)&&!Array.isArray(o)||Object.keys(o).every(k=>!['__proto__','prototype','constructor'].includes(k)&&safe(o[k]));
  if(!obj(d)||!safe(d)||d.ver!==1||!Object.hasOwn(MAPS,d.map)||!Object.hasOwn(CHARS,d.story)||!obj(d.pc))throw Error('data');
  const m=MAPS[d.map],p=d.pc;
  if(!Number.isInteger(d.x)||!Number.isInteger(d.y)||d.x<0||d.y<0||d.x>=m.w||d.y>=m.h||!num(d.gold))throw Error('position');
  for(const k of ['lv','exp','mhp','hp','mmp','mp','atk','def','wp','ar'])if(!num(p[k]))throw Error('stats');
  if(p.lv<1||p.mhp<1||p.hp>p.mhp||p.mp>p.mmp||p.id!==d.story||!obj(p.items)||!Object.values(p.items).every(num))throw Error('player');
  for(const k of ['name','wpn','arn'])if(typeof p[k]!=='string'||p[k].length>100)throw Error('text');
  if(!obj(d.f)||!obj(d.open)||!Object.hasOwn(MAPS,d.home)||!Number.isInteger(d.dir)||d.dir<0||d.dir>3)throw Error('state');
  if(d.cleared!==undefined&&(!Array.isArray(d.cleared)||!d.cleared.every(id=>Object.hasOwn(CHARS,id))))throw Error('clear');
  return d;
}
function decodePassword(code){
  code=code.normalize('NFKC').replace(/\s/g,'');
  if(code.length>65536)throw Error('length');
  const m=/^DQ106\.([A-Za-z0-9_-]+)\.([0-9a-f]{8})$/.exec(code);
  if(!m||passwordChecksum(m[1])!==m[2])throw Error('checksum');
  const b64=m[1].replace(/-/g,'+').replace(/_/g,'/');
  const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
  return validatePasswordSave(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)));
}
function passwordDialog(code){
  return new Promise(resolve=>{
    const panel=document.getElementById('password-panel'),form=document.getElementById('password-form'),field=document.getElementById('password-code');
    const status=document.getElementById('password-status'),ok=document.getElementById('password-ok'),close=document.getElementById('password-close');
    const exporting=typeof code==='string',previous=document.activeElement;
    passwordOpen=true;for(const k in keys)keys[k]=false;clearKeys();RUN.h=RUN.t=RUN.p=false;
    document.getElementById('password-title').textContent=exporting?'ぼうけんを きろくした！':'パスワードで つづきから';
    document.getElementById('password-help').textContent=exporting?'この長いパスワードを全部コピーして、メモなどに保存してね。別の端末でも、この時点から再開できるよ。':'セーブしたときのパスワードを全部貼り付けてね。途中の改行や空白はそのままで大丈夫。';
    field.value=exporting?code:'';field.readOnly=exporting;status.textContent='';ok.textContent=exporting?'コピーする':'つづきから はじめる';close.textContent=exporting?'とじる':'やめる';
    const finish=value=>{panel.hidden=true;passwordOpen=false;form.onsubmit=null;close.onclick=null;panel.onkeydown=null;for(const k in keys)keys[k]=false;clearKeys();if(previous&&previous.focus)previous.focus();resolve(value);};
    close.onclick=()=>finish(null);
    panel.onkeydown=e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();finish(null);}else if(e.key==='Tab'){const list=[field,ok,close],i=list.indexOf(document.activeElement);if(e.shiftKey&&i===0){e.preventDefault();close.focus();}else if(!e.shiftKey&&i===2){e.preventDefault();field.focus();}}};
    form.onsubmit=async e=>{e.preventDefault();if(exporting){field.focus();field.select();try{await navigator.clipboard.writeText(code);status.textContent='コピーしたよ。メモなどに貼り付けて保存してね。';}catch(_){status.textContent='長押しして「コピー」を選んでね（PCは Ctrl/Cmd+C）。';}}else{try{const d=decodePassword(field.value);finish(d);}catch(_){status.textContent='パスワードが正しくないよ。最初から最後までコピーしてね。';field.focus();}}};
    panel.hidden=false;field.focus();if(exporting)field.select();
  });
}
async function resumePassword(){
  const d=await passwordDialog();if(!d)return false;
  await fade(1,250);applySave(d);G.mode='map';writeSlot(0);await fade(0,250);
  await say('パスワードから ぼうけんを さいかいした！');return true;
}
async function saveMenu(){
  const i=await choose([1,2,3].map(slotLabel).concat(['やめる']),{x:20,y:60,w:470,title:'どこに セーブする？',cancel:1});
  if(i<0||i>2)return;
  if(readSlot(i+1)){const c=await choose(['うわがきする','やめる'],{x:300,y:130,w:170,cancel:1});if(c!==0)return;}
  const d=snapshot();
  try{const code=encodePassword(d);storeSet(SAVE_KEY(i+1),JSON.stringify(d));sfx('buy');await passwordDialog(code);}
  catch(_){await say('セーブに しっぱいした……。');}
}
async function loadMenu(fromTitle){
  const dis=[0,1,2,3].map(i=>!readSlot(i));
  const i=await choose([0,1,2,3].map(slotLabel).concat(['パスワードで さいかい','やめる']),{x:20,y:50,w:470,title:'どれを ロードする？',cancel:1,dis:dis.concat([false,false])});
  if(i===4)return resumePassword();
  if(i<0||i>3)return false;
  const d=readSlot(i);if(!d)return false;
  await fade(1,250);applySave(d);G.mode='map';
  await fade(0,250);
  await say('ぼうけんの しょを よみこんだ！');
  return true;
}
async function titleFlow(){
  while(true){
    const i=await choose(['はじめから','つづきから','パスワードで さいかい'],{x:95,y:260,w:330,cancel:0,dis:[false,![0,1,2,3].some(i=>readSlot(i)),false]});
    if(i<0)return;
    if(i===0){await selectStory(false);return;}
    if(i===1&&await loadMenu(true))return;
    if(i===2&&await resumePassword())return;
  }
}
