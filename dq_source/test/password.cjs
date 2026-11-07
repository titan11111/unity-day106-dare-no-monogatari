const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const src=path.join(__dirname,'../src');
function game(){
  const context=vm.createContext({TextEncoder,TextDecoder,btoa,atob,console});
  const story=fs.readFileSync(path.join(src,'story.js'),'utf8');
  vm.runInContext(`const G={};const MAPS=Object.fromEntries(['v1','v2','v3','v4','shrine1'].map(id=>[id,{id,w:40,h:40}]));
    const keys={},RUN={};let passwordOpen=false;function clearKeys(){}function refreshMap(){}function worldName(){return 'world';}
    const localStorage={getItem(){throw Error('disabled')},setItem(){throw Error('disabled')}};
    ${story.slice(0,story.indexOf('const NPCS='))}
    ${story.slice(story.indexOf('function mkPC('),story.indexOf('async function startStory('))}
    ${fs.readFileSync(path.join(src,'save.js'),'utf8')}
    function seed(id='hero') {const c=CHARS[id];Object.assign(G,{mode:'map',story:id,pc:mkPC(id),gold:777,home:'v1',map:MAPS[c.map],px:c.x,py:c.y,dir:1,f:{questDone:1},open:{chest1:1}});G.pc.items['げんきの玉']=3;markCleared('gal');}
  `,context);
  return expression=>vm.runInContext(expression,context);
}
test('all eight stories recover full snapshots without browser storage',()=>{
 const run=game();
 const results=JSON.parse(run(`JSON.stringify(Object.keys(CHARS).map(id=>{seed(id);const before=snapshot();const code=encodePassword(before);const after=decodePassword(code);const pc={...before.pc};delete pc.spells;delete pc.gr;return {before:{...before,pc},after,length:code.length};}))`));
 assert.equal(results.length,8);for(const r of results)assert.deepEqual(r.after,r.before);
});
test('copying errors, truncated codes and invalid state are rejected',()=>{
 const run=game();run('seed()');
 for(const expr of ["''","encodePassword(snapshot()).slice(0,-1)","encodePassword(snapshot()).replace('DQ106','DQ107')","encodePassword({...snapshot(),map:'constructor'})","encodePassword({...snapshot(),story:'__proto__'})","encodePassword({...snapshot(),x:9999})","encodePassword({...snapshot(),pc:{...G.pc,hp:'oops'}})","encodePassword({...snapshot(),pc:{...G.pc,items:null}})","encodePassword({...snapshot(),cleared:['invalid']})"]){assert.throws(()=>run(`decodePassword(${expr})`));}
});
test('whitespace is tolerated and save state is restored with runtime abilities',()=>{
 const run=game();run(`seed();G.pc.hp=17;const code=encodePassword(snapshot());const saved=decodePassword('  '+code.slice(0,80)+'\\n'+code.slice(80)+'  ');G.gold=0;G.pc=null;applySave(saved);writeSlot(0);`);
 const state=JSON.parse(run(`JSON.stringify({gold:G.gold,hp:G.pc.hp,x:G.px,y:G.py,dir:G.dir,flags:G.f,open:G.open,items:G.pc.items,cleared:clearedList(),spells:G.pc.spells===CHARS.hero.spells,gr:G.pc.gr===GR,auto:readSlot(0).gold})`));
 assert.equal(state.gold,777);assert.equal(state.hp,17);assert.equal(state.x,4);assert.equal(state.y,5);assert.equal(state.dir,1);assert.equal(state.flags.questDone,1);assert.equal(state.open.chest1,1);assert.equal(state.items['げんきの玉'],3);assert(state.cleared.includes('gal'));assert(state.spells&&state.gr);assert.equal(state.auto,777);
});
test('existing version 1 local saves remain loadable',()=>{
 const run=game();run('seed();const legacy=snapshot();delete legacy.cleared;storeSet(SAVE_KEY(1),JSON.stringify(legacy));applySave(readSlot(1));');assert.equal(run('G.gold'),777);
});
test('title and load menus offer password recovery with no local save',async()=>{
 const run=game();run(`var seen=[];async function choose(opts){seen.push(opts);return -1;}`);
 await run('titleFlow()');await run('loadMenu(true)');
 assert.equal(run("seen[0].includes('パスワードで さいかい')"),true);assert.equal(run("seen[1].includes('パスワードで さいかい')"),true);
});
