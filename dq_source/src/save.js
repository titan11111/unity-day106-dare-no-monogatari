'use strict';
// ===== save / load (localStorage with in-memory fallback) =====
const MEMSAVE={};
const SAVE_KEY=i=>'dq_save_'+i;
function storeGet(k){try{const v=localStorage.getItem(k);if(v!==null)return v;}catch(e){}return MEMSAVE[k]||null;}
function storeSet(k,v){MEMSAVE[k]=v;try{localStorage.setItem(k,v);}catch(e){}}
function snapshot(){
  return {ver:1,t:Date.now(),story:G.story,f:G.f,open:G.open,pc:G.pc,gold:G.gold,home:G.home,map:G.map.id,x:G.px,y:G.py,dir:G.dir};
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
  G.story=d.story;G.f=d.f||{};G.open=d.open||{};G.pc=d.pc;G.gold=d.gold;G.home=d.home||'v1';G.fx=[];
  G.pc.spells=CHARS[d.story].spells;G.pc.gr=GR;
  G.map=MAPS[d.map];G.px=d.x;G.py=d.y;G.dir=d.dir||0;G.mv=null;G.steps=0;G.card=null;
  refreshMap();G.wname=G.map.id==='world'?worldName(d.x,d.y):null;G.banner={text:G.map.id==='world'?worldName(d.x,d.y):G.map.name,t:110};
}
async function saveMenu(){
  const i=await choose([1,2,3].map(slotLabel).concat(['やめる']),{x:20,y:60,w:470,title:'どこに セーブする？',cancel:1});
  if(i<0||i>2)return;
  if(G.map.kind==='cave'||G.map.kind==='world'){/* allowed everywhere; kept simple */}
  if(readSlot(i+1)){const c=await choose(['うわがきする','やめる'],{x:300,y:130,w:170,cancel:1});if(c!==0)return;}
  sfx('buy');
  await say(writeSlot(i+1)?'ぼうけんの しょを きろくした！':'セーブに しっぱいした……。');
}
async function loadMenu(fromTitle){
  const have=[0,1,2,3].filter(i=>readSlot(i));
  if(!have.length){await say('セーブデータが ない。');return false;}
  const dis=[0,1,2,3].map(i=>!readSlot(i));
  const i=await choose([0,1,2,3].map(slotLabel).concat(['やめる']),{x:20,y:50,w:470,title:'どれを ロードする？',cancel:1,dis:dis.concat([false])});
  if(i<0||i>3)return false;
  const d=readSlot(i);if(!d)return false;
  await fade(1,250);applySave(d);G.mode='map';
  await fade(0,250);
  await say('ぼうけんの しょを よみこんだ！');
  return true;
}
async function titleFlow(){
  if([0,1,2,3].some(i=>readSlot(i))){
    const i=await choose(['はじめから','つづきから'],{x:170,y:230,w:170,cancel:0});
    if(i===1){if(await loadMenu(true))return;}
    if(i<0)return;
  }
  await selectStory(false);
}
