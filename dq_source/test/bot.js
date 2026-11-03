window.NOWANDER=true;
(()=>{
const D=[[0,1],[0,-1],[-1,0],[1,0]],KEYS=['d','u','l','r'];
const sl=ms=>new Promise(r=>setTimeout(r,ms));
const bot=window.bot={log:[],st:{battles:0,wins:0,loses:0,doors:0,shopbuys:0},sub:null,mm:null,pick:0,lastProg:Date.now()};
const HEAL=['やくそう','やきざかな','さかなの スープ','ヨイヤミだんご'];
const LG=s=>{bot.log.push(`[${G.story||'-'}|${G.map?G.map.id:'-'}] ${s}`);};
bot.LG=LG;
function dump(){return {story:G.story,map:G.map&&G.map.id,x:G.px,y:G.py,mode:G.mode,busy:G.busy,mv:!!G.mv,fade:G.fade,ui:UI.map(u=>u.t+':'+(u.pages?u.pages[u.p].join('/'):u.opts.join('|'))),lv:G.pc&&G.pc.lv,hp:G.pc&&G.pc.hp,gold:G.gold,flags:Object.keys(G.f||{}).join(',')};}
bot.dump=dump;
const idleNow=()=>!UI.length&&!G.busy&&G.mode==='map'&&!G.mv&&G.fade<0.05&&G.map&&!pressed.a;
async function idle(to=90000){const t0=Date.now();while(!idleNow()){if(Date.now()-t0>to)throw new Error('idle timeout '+JSON.stringify(dump()));await sl(2);}await sl(1);}
bot.idle=idle;
// ---- UI driver ----
function policy(u){
  const o=u.opts,pc=G.pc;
  if(o[0]==='たたかう'){
    if(pc.hp<pc.mhp*.45){
      const sp=pc.spells.filter(s=>s.lv<=pc.lv&&s.t==='heal'&&pc.mp>=s.mp);
      if(sp.length){bot.sub='spell';return 1;}
      if(HEAL.some(n=>pc.items[n]>0)){bot.sub='item';return 2;}
    }
    if(typeof foe!=='undefined'&&foe&&foe.m.boss){
      const at=pc.spells.filter(s=>s.lv<=pc.lv&&s.t==='atk'&&pc.mp>=s.mp+6);
      if(at.length){bot.sub='atk';return 1;}
    }
    bot.sub=null;return 0;
  }
  if(bot.sub&&o.some(x=>/MP\d+$/.test(x)||/ x\d+$/.test(x))){
    const s=bot.sub;bot.sub=null;
    if(s==='atk'){const sps=pc.spells.filter(x=>x.lv<=pc.lv);let b=0,bp=-1;sps.forEach((x,i)=>{if(x.t==='atk'&&pc.mp>=x.mp+6&&x.p>bp){bp=x.p;b=i;}});return b;}
    if(s==='spell'){const sps=pc.spells.filter(x=>x.lv<=pc.lv);let b=0,bp=-1;sps.forEach((x,i)=>{if(x.t==='heal'&&pc.mp>=x.mp&&x.p>bp){bp=x.p;b=i;}});return b;}
    const names=Object.keys(pc.items).filter(k=>pc.items[k]>0);for(const h of HEAL){const i=names.indexOf(h);if(i>=0)return i;}return 0;
  }
  if(o[0]==='じゅもん'&&o.length===7){ // field menu
    if(bot.mm==='heal'){
      const sp=pc.spells.filter(s=>s.lv<=pc.lv&&s.t==='heal'&&pc.mp>=s.mp);
      if(sp.length){bot.mm='sub-spell';return 0;}
      if(HEAL.some(n=>pc.items[n]>0)){bot.mm='sub-item';return 1;}
    }
    if(bot.mm==='save'){bot.mm='sub-save';return 4;}
    if(bot.mm==='load'){bot.mm='sub-load';return 5;}
    bot.mm=null;return 6;
  }
  if(bot.mm==='sub-spell'&&o.some(x=>/MP\d+$/.test(x))){bot.mm='done';const sps=pc.spells.filter(x=>x.lv<=pc.lv);let b=0,bp=-1;sps.forEach((x,i)=>{if(x.t==='heal'&&pc.mp>=x.mp&&x.p>bp){bp=x.p;b=i;}});return b;}
  if(bot.mm==='sub-item'&&o.some(x=>/ x\d+$/.test(x))){bot.mm='done';const names=Object.keys(pc.items).filter(k=>pc.items[k]>0);for(const h of HEAL){const i=names.indexOf(h);if(i>=0)return i;}return 0;}
  if(bot.mm==='sub-save'){bot.mm='done';return bot.slot||0;}
  if(bot.mm==='sub-load'){bot.mm='done';return bot.slot||0;}
  if(u.title&&u.title.startsWith('もちぶん')){ // shop
    const st=STOCK[G.map.id]||[];
    let best=-1;
    // weapons/armor upgrades first
    st.forEach((s,i)=>{if(best>=0||G.gold<s.price)return;if((s.t==='wp'&&s.v>pc.wp)||(s.t==='ar'&&s.v>pc.ar))best=i;});
    if(best<0&&bot.herbs!==false){st.forEach((s,i)=>{if(best<0&&G.gold>=s.price&&s.t==='item'&&(pc.items[s.n]||0)<(bot.herbCap||6))best=i;});}
    if(best>=0){bot.st.shopbuys++;return best;}
    return o.length-1;
  }
  if(o[0]==='はじめから')return bot.titlePick||0;
  if(u.title&&u.title.indexOf('じせいのくを')>=0)return bot.pick;
  return 0;
}
setInterval(()=>{
  const u=UI[UI.length-1];
  if(!u){if(G.banner&&/ヒット/.test(G.banner.text||''))pressed.a=true;return;}
  if(u.t==='menu'){let i=policy(u);if(u.dis[i])i=u.dis.findIndex(x=>!x);u.i=Math.max(0,Math.min(u.opts.length-1,i));}
  pressed.a=true;
},10);
// ---- navigation ----
const isSpecial=(m,x,y)=>m.g[y][x]==='E'||(m.kind==='world'&&m.warps&&m.warps[x+','+y]);
function pass(x,y){const m=G.map;if(x<0||y<0||x>=m.w||y>=m.h)return false;const t=m.g[y][x];if(t==='D')return !npcAt(x,y);return canWalk(x,y);}
function bfs(goalFn){
  const m=G.map,seen=new Map(),q=[[G.px,G.py]];seen.set(G.px+','+G.py,null);
  while(q.length){
    const [x,y]=q.shift();
    if(goalFn(x,y,m)&&(x!==G.px||y!==G.py||true)){
      const path=[];let k=x+','+y;
      while(seen.get(k)){const [px,py,d]=seen.get(k);path.unshift(d);k=px+','+py;}
      return {path,x,y};
    }
    for(let d=0;d<4;d++){
      const nx=x+D[d][0],ny=y+D[d][1],k=nx+','+ny;
      if(seen.has(k)||!pass(nx,ny))continue;
      if(isSpecial(m,nx,ny)&&!goalFn(nx,ny,m))continue;
      seen.set(k,[x,y,d]);q.push([nx,ny]);
    }
  }
  return null;
}
async function stepDir(d){
  await idle();const m0=G.map,x0=G.px,y0=G.py;
  keys[KEYS[d]]=true;const t0=Date.now();
  while(Date.now()-t0<900){await sl(1);if(G.mv||G.busy||UI.length||G.map!==m0||G.px!==x0||G.py!==y0)break;}
  keys[KEYS[d]]=false;
  if(G.busy&&!G.mv&&G.map===m0&&G.px===x0&&G.py===y0)bot.st.doors++;
  await idle();
}
async function face(d){await idle();keys[KEYS[d]]=true;await sl(30);keys[KEYS[d]]=false;await sl(3);if(G.dir!==d)throw new Error('face failed '+d+' got '+G.dir);}
async function goTo(x,y,max=600){
  const m0=G.map;
  for(let i=0;i<max;i++){
    if(G.map!==m0||(G.px===x&&G.py===y))return;
    await idle();
    const r=bfs((a,b)=>a===x&&b===y);
    if(!r)throw new Error(`no path to ${x},${y} on ${G.map.id} from ${G.px},${G.py}`);
    await stepDir(r.path[0]);bot.lastProg=Date.now();
  }
  throw new Error('goTo too long');
}
// stand positions to interact with tile (tx,ty)
function standSpots(tx,ty){
  const m=G.map,res=new Map();
  for(let d=0;d<4;d++){
    const ax=tx-D[d][0],ay=ty-D[d][1];
    if(ax>=0&&ay>=0&&ax<m.w&&ay<m.h&&pass(ax,ay)&&!isSpecial(m,ax,ay)&&!res.has(ax+','+ay))res.set(ax+','+ay,d);
    if(ax>=0&&ay>=0&&ax<m.w&&ay<m.h&&(m.g[ay][ax]==='k'||m.g[ay][ax]==='J')){
      const bx=ax-D[d][0],by=ay-D[d][1];
      if(bx>=0&&by>=0&&bx<m.w&&by<m.h&&pass(bx,by)&&!res.has(bx+','+by))res.set(bx+','+by,d);
    }
  }
  return res;
}
async function pressA(){pressed.a=true;const t0=Date.now();while(pressed.a&&Date.now()-t0<500)await sl(2);await sl(3);}
async function interactTile(tx,ty){
  const spots=standSpots(tx,ty);
  if(!spots.size)throw new Error(`no stand spot for ${tx},${ty} on ${G.map.id}`);
  const r=bfs((a,b)=>spots.has(a+','+b));
  if(!r)throw new Error(`unreachable interact ${tx},${ty} on ${G.map.id} from ${G.px},${G.py}`);
  await goTo(r.x,r.y);
  const d=spots.get(G.px+','+G.py);
  await face(d);await pressA();await idle();bot.lastProg=Date.now();
}
async function goMap(id){
  for(let i=0;i<20&&G.map.id!==id;i++){
    await idle();
    const m=G.map;
    if(m.kind!=='world'){
      const r=bfs((x,y,mm)=>mm.g[y][x]==='E');
      if(!r)throw new Error('no exit in '+m.id);
      await goTo(r.x,r.y);
    }else{
      const ent=Object.entries(m.warps).find(([k,w])=>w.to===id);
      if(!ent)throw new Error('no warp to '+id);
      const [x,y]=ent[0].split(',').map(Number);
      await goTo(x,y);
    }
    await idle();
  }
  if(G.map.id!==id)throw new Error('goMap failed '+id);
}
async function talk(id){
  const n=NPCS.find(x=>x.id===id);if(!n)throw new Error('npc '+id);
  await goMap(n.map);
  if(n.show&&!n.show())throw new Error('npc hidden '+id);
  await interactTile(n.x,n.y);LG('talk '+id);
}
async function openChestAt(id){
  const ch=Object.values(MAPS).flatMap(m=>m.chests.map(c=>({m,c}))).find(o=>o.c.id===id);
  await goMap(ch.m.id);await interactTile(ch.c.x,ch.c.y);LG('chest '+id+' f='+!!G.f[id]);
}
async function tileEv(map,x,y){await goMap(map);await interactTile(x,y);}
// ---- healing / grinding ----
async function healMenu(){bot.mm='heal';await idle();pressed.b=true;await sl(10);await idle();bot.mm=null;}
const HOME_INN={v1:'inn1',v2:'inn2',v3:'inn3',v4:'inn4'};
async function restInn(v){const id=HOME_INN[v];const p=G.gold;await talk(id);}
async function ensureHp(thr,vil){
  const pc=G.pc;
  if(pc.hp>=pc.mhp*thr)return;
  if(G.map.kind!=='village'&&(pc.mp>=2||HEAL.some(n=>pc.items[n]>0)))await healMenu();
  if(pc.hp>=pc.mhp*thr)return;
  const cost={v1:5,v2:15,v3:30,v4:50}[vil];
  if(G.gold>=cost){await restInn(vil);}
}
async function wander(n=6){
  for(let i=0;i<n;i++){
    const m=G.map;const opts=[];
    for(let d=0;d<4;d++){const nx=G.px+D[d][0],ny=G.py+D[d][1];if(pass(nx,ny)&&!isSpecial(m,nx,ny)&&m.g[ny][nx]!=='D')opts.push(d);}
    if(!opts.length)throw new Error('stuck wander');
    const d=opts[Math.floor(Math.random()*opts.length)];
    await stepDir(d);
    if(G.map!==m)return;
  }
}
async function grind(mapId,lv,vil){
  await goMap(mapId);
  const t0=Date.now();
  while(G.pc.lv<lv){
    await ensureHp(.5,vil);
    if(G.map.id!==mapId)await goMap(mapId);
    await wander(8);bot.lastProg=Date.now();
    if(Date.now()-t0>900000)throw new Error('grind timeout');
  }
  LG(`grind done lv${G.pc.lv}`);
}
async function shopVisit(sid){await talk(sid);}
async function boss(n,mapId,lv,vil,innId){
  for(let tr=0;tr<10&&!G.f['b'+n];tr++){
    await grind(mapId,lv+tr*2,vil);
    await goMap(vil);
    if(G.gold>=300)await talk('shop'+vil.slice(1));
    if(G.pc.hp<G.pc.mhp||G.pc.mp<G.pc.mmp){if(G.gold>=({v1:5,v2:15,v3:30,v4:50}[vil]))await talk(innId);}
    await talk('boss'+n);
    LG(`boss${n} try${tr} result b=${!!G.f['b'+n]} hp=${G.pc.hp}`);
    await idle();
  }
  if(!G.f['b'+n])throw new Error('boss'+n+' failed');
}
// ---- story switching ----
async function waitStory(id,to=60000){
  const t0=Date.now();
  while(!(G.story===id&&G.mode==='map'&&idleNow())){if(Date.now()-t0>to)throw new Error('story switch timeout '+JSON.stringify(dump()));await sl(5);}
}
async function toSelect(next,to=120000){
  // wait for select menu then choose
  const t0=Date.now();
  bot.pick=PI(next);
  await waitStory(next,to);
}
const PI=window.PI=id=>id==="cat"?ORDER.length:ORDER.indexOf(id);
const T={};
Object.assign(bot,{T,talk,goMap,goTo,grind,boss,openChestAt,tileEv,interactTile,ensureHp,healMenu,waitStory,toSelect,idle,sl,bfs,stepDir,face,pressA,wander,restInn});
// ---- 7 story plans ----
bot.plans={
 async hero(){
  await idle();
  await talk('mom');await talk('mayor');await talk('hermit1');
  await boss(1,'cave1',5,'v1','inn1');
  await talk('shop1');
  await talk('hermit2');
  await talk('shop2');
  await boss(2,'cave2',10,'v2','inn2');
  await talk('minister');await talk('rogueCell');
  await talk('shop3');await talk('hermit3');
  await boss(3,'cave3',16,'v3','inn3');
  await talk('elder4');await talk('shop4');
  await boss(4,'castle',21,'v4','inn4');
 },
 async vb(){await idle();await talk('wifeB');await talk('daughter');},
 async mayor(){await idle();await talk('hermit1');await openChestAt('c1b');},
 async minister(){await idle();await talk('kingTalk');},
 async hermit(){await idle();await talk('inn1');},
 async gal(){await idle();await talk('boutique');await talk('model');},
 async cat(){
  await idle();
  await talk('cat_kuro');
  for(let i=0;i<10&&!(G.pc.items['やきざかな']>0);i++){await tileEv('v2',21,7);}
  if(!(G.pc.items['やきざかな']>0))throw new Error('no fish');
  await talk('cat_tora');await talk('cat_shiro');await talk('cat_yami');
  if(!(G.f.kuro&&G.f.tora&&G.f.shiro&&G.f.yami))throw new Error('recruit fail '+JSON.stringify(G.f));
  await talk('harbor');
 },
 async rogue(){await idle();await talk('guardJail');await openChestAt('c3b');await talk('hermit3');}
};
})();
bot.run=async function(order,opts={}){
  window.NODRAW=!opts.draw;
  pressed.a=true;
  bot.pick=PI(order[0]);
  await bot.waitStory(order[0],60000);
  for(let i=0;i<order.length;i++){
    const id=order[i],next=order[i+1];
    bot.LG(`=== START ${id} lv=${G.pc.lv}`);
    bot.pick=next?PI(next):0;
    const t0=Date.now();
    try{await bot.plans[id]();}
    catch(e){if(!(next===undefined&&G.mode==='title'))throw e;}
    bot.LG(`=== END ${id} in ${Math.round((Date.now()-t0)/1000)}s`);
    bot.res=bot.res||{};bot.res[id]={sec:Math.round((Date.now()-t0)/1000)};
    if(next)await bot.waitStory(next,60000);
  }
  const t0=Date.now();while(G.mode!=='title'&&Date.now()-t0<60000)await bot.sl(20);
  bot.LG('final mode='+G.mode);
  return G.mode;
};
