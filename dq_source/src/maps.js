'use strict';
// ===== maps: world + villages(4) + caves(3) + shrines(3) + castle =====
const WALK='.,=fdezcGEhxBFVAYZ';
const MAPS={};
function Grid(w,h,fill){
  const g=Array.from({length:h},()=>Array(w).fill(fill));
  const o={w,h,g,
    r(x,y,ww,hh,c){for(let j=y;j<y+hh;j++)for(let i=x;i<x+ww;i++)if(g[j]&&g[j][i]!==undefined)g[j][i]=c;return o;},
    p(x,y,c){if(g[y]&&g[y][x]!==undefined)g[y][x]=c;return o;},
    ps(list,c){for(const [x,y] of list)o.p(x,y,c);return o;},
    border(c){return o.r(0,0,w,1,c).r(0,h-1,w,1,c).r(0,0,1,h,c).r(w-1,0,1,h,c);},
    house(x,y,ww,hh,dx,top,floor){floor=floor||'f';o.r(x,y,ww,hh,'H').r(x+1,y+1,ww-2,hh-2,floor);return o.p(x+dx,top?y:y+hh-1,'D');}
  };
  return o;
}
function reg(id,name,o,g,ex){MAPS[id]=Object.assign({id,name,w:g.w,h:g.h,g:g.g,floor:'f',kind:'in',enc:0,chests:[],dyn:[]},o,ex||{});return MAPS[id];}

// ---------- WORLD 48x36 ----------
(function(){
  const w=48,h=36,g=Grid(w,h,'~');
  g.r(1,1,46,34,'.');
  g.r(18,20,29,15,'x');                       // region4 wasteland
  g.r(1,19,46,1,'^');                         // ridge A
  g.r(31,1,1,18,'^');                         // ridge B
  g.r(17,20,1,15,'^');                        // ridge C (no gap)
  g.r(9,19,1,1,'=').r(31,9,1,1,'=').r(40,19,1,1,'=');   // passes (guards stand here)
  // lakes & sea inlets
  g.r(16,4,5,3,'~').r(10,24,3,3,'~').r(26,22,4,3,'~').r(34,30,5,3,'~').r(2,13,3,2,'~').r(36,3,3,2,'~');
  // seeded scatter: forests / hills / mountains
  let s=12345;const rr=()=>{s=(s*9301+49297)%233280;return s/233280;};
  for(let i=0;i<70;i++){const x=1+Math.floor(rr()*45),y=1+Math.floor(rr()*33);if(g.g[y][x]==='.')g.p(x,y,'F');if(g.g[y][x]==='F'&&rr()<.6&&g.g[y][x+1]==='.')g.p(x+1,y,'F');}
  for(let i=0;i<22;i++){const x=1+Math.floor(rr()*45),y=1+Math.floor(rr()*33);if(g.g[y][x]==='.')g.p(x,y,'h');}
  for(let i=0;i<22;i++){const x=1+Math.floor(rr()*45),y=1+Math.floor(rr()*33);if(g.g[y][x]==='.'||g.g[y][x]==='x')g.p(x,y,'^');}
  // roads (L-shaped, only over land)
  const road=(x0,y0,x1,y1)=>{const put=(x,y)=>{const c=g.g[y][x];if(c==='.'||c==='F'||c==='h'||c==='x'||c===',')g.p(x,y,'=');};
    const sy=Math.sign(y1-y0)||1,sx=Math.sign(x1-x0)||1;
    for(let y=y0;y!==y1+sy;y+=sy)put(x0,y);for(let x=x0;x!==x1+sx;x+=sx)put(x,y1);};
  const warps={};
  const place=(x,y,ch,to,tx,ty)=>{g.p(x,y,ch);warps[x+','+y]={to,x:tx,y:ty};};
  const V=[[6,27],[14,14],[37,10],[30,27]],A=[[13,31],[22,13],[41,15]],Y=[[3,22],[8,11],[44,4]];
  road(6,27,9,20);road(9,19,14,14);road(14,14,31,9);road(32,9,37,10);road(37,10,40,19);road(40,20,30,27);road(30,27,30,29);road(30,29,23,29);
  V.forEach((v,i)=>{road(v[0],v[1],A[i]?A[i][0]:v[0],A[i]?A[i][1]:v[1]);if(Y[i])road(v[0],v[1],Y[i][0],Y[i][1]);});
  const sp=[[11,18],[11,18],[11,20],[11,18]];
  V.forEach((v,i)=>place(v[0],v[1],'V','v'+(i+1),[11,11,11,11][i],[18,18,20,18][i]));
  A.forEach((v,i)=>place(v[0],v[1],'A','cave'+(i+1),[2,21,12][i],[16,15,16][i]));
  Y.forEach((v,i)=>place(v[0],v[1],'Y','shrine'+(i+1),6,8));
  place(23,28,'Z','castle',10,21);
  [[9,18,'.'],[9,20,'.'],[30,9,'.'],[32,9,'.'],[40,18,'.'],[40,20,'x']].forEach(([x,y,c])=>g.p(x,y,c));
  // clear obstacles around entrances
  [...V,...A,...Y,[23,28]].forEach(([x,y])=>{for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){const c=g.g[y+dy]&&g.g[y+dy][x+dx];if(c==='^'||c==='~'||c==='F')g.p(x+dx,y+dy,'.');}});
  g.r(21,24,5,5,'Q').p(23,28,'Z');   // big castle footprint (solid), gate at bottom centre
  reg('world','せかい',{kind:'world',floor:'.',warps,gates:{'9,19':1,'31,9':2,'40,19':3}},g);
})();
// zone (1..4) by position on the world map
function worldZone(x,y){if(y>=20)return x<17?1:4;return x<31?2:3;}

// ---------- VILLAGES ----------
(function(){ // v1 はじまりの村
  const g=Grid(24,20,'.').border('T');
  g.r(1,8,22,1,'=').r(11,9,1,10,'=').r(7,9,1,2,'=').r(19,9,1,2,'=');
  g.house(2,3,7,5,3).house(10,3,5,5,2).house(16,2,7,6,3).house(2,11,8,6,5,1).house(14,11,8,6,5,1);
  g.ps([[3,4],[11,4],[21,3],[3,15],[3,14],[4,15]],'b').ps([[6,5],[13,5],[20,5]],'t').ps([[7,4],[17,3],[18,3],[15,15],[16,15]],'K');
  g.r(5,13,4,1,'k').r(15,13,4,1,'k');
  g.ps([[3,9],[4,10],[8,10],[14,9],[15,10],[22,12],[22,13],[2,18],[5,17],[10,12],[12,15]],',').ps([[13,10]],'W').p(10,17,'N').ps([[1,11],[1,12],[22,16],[22,17]],'T').p(11,19,'E');
  g.r(2,18,5,1,'|').r(15,18,6,1,'|');
  reg('v1','はじまりの村',{kind:'village',floor:'.',start:{x:11,y:18},ret:{map:'world',x:6,y:27},
    chests:[{id:'v1c1',x:20,y:3,g:30}]},g);g.p(20,3,'X');
})();
(function(){ // v2 みなと村
  const g=Grid(26,20,'.').border('T');
  g.r(20,3,5,13,'~').r(20,8,3,1,'B').r(1,8,19,1,'=').r(11,9,1,10,'=').r(7,9,1,2,'=').r(16,9,1,2,'=');
  g.house(2,3,7,5,3).house(10,3,6,5,2).house(2,11,8,6,5,1).house(12,11,7,6,4,1);
  g.ps([[3,4],[11,4],[3,15],[4,15],[3,14]],'b').ps([[6,6],[14,5]],'t').ps([[7,4],[14,4],[13,15],[14,15]],'K');
  g.r(5,13,4,1,'k').r(13,13,3,1,'k');
  g.ps([[4,9],[9,10],[14,10],[18,12],[19,13],[2,18],[6,18],[15,18],[18,17]],',').p(9,9,'W').p(10,17,'N').p(11,19,'E').r(1,18,4,1,'|').r(14,18,4,1,'|');
  g.ps([[18,5],[18,10],[19,16]],'T');
  reg('v2','みなと村',{kind:'village',floor:'.',start:{x:11,y:18},ret:{map:'world',x:14,y:14},chests:[]},g);
})();
(function(){ // v3 たかね村 (屋敷と牢屋)
  const g=Grid(26,22,'.').border('^');
  g.r(1,10,24,1,'=').r(11,11,1,10,'=').r(7,9,1,1,'=').r(19,9,1,1,'=').r(7,11,1,1,'=').r(18,11,1,1,'=');
  g.house(2,2,12,7,5).r(7,5,1,3,'G');g.p(7,8,'D');
  g.ps([[3,3],[4,3],[11,3],[12,3]],'K').ps([[4,7],[11,7]],'S').ps([[6,4],[8,4]],'P');
  g.house(16,2,8,7,3).r(20,3,1,3,'J').p(22,6,'J').p(21,6,'J').ps([[22,3],[17,3],[18,3]],'b');
  g.house(2,12,8,6,5,1).house(14,12,8,6,4,1);
  g.ps([[3,16],[3,15],[4,16]],'b').r(5,14,4,1,'k').ps([[15,16],[16,16]],'K').r(15,14,3,1,'k');
  g.p(12,12,'S').p(12,5,'X').p(10,18,'N').p(11,21,'E').ps([[3,11],[10,13],[20,11],[22,19],[6,19],[15,19]],',').ps([[1,19],[24,19],[24,14]],'T');
  reg('v3','たかね村',{kind:'village',floor:'.',start:{x:11,y:20},ret:{map:'world',x:37,y:10},chests:[{id:'v3c1',x:12,y:5,g:0,item:'やくそう'}],
    dyn:[{x:21,y:6,fl:'cellOpen',on:'f',off:'J'}]},g);
})();
(function(){ // v4 やみの村 ヨイヤミ
  const g=Grid(24,20,'x').border('T');
  g.r(1,10,22,1,'=').r(11,11,1,8,'=').r(5,10,1,1,'=').r(16,10,1,1,'=').r(17,11,1,1,'=').r(7,11,1,1,'=');
  g.house(2,4,8,6,3).house(13,4,7,6,3).house(14,12,8,6,3,1).house(2,12,8,6,5,1);
  g.r(11,12,1,5,'G').ps([[3,5],[18,5],[3,16],[4,16]],'b').ps([[8,6],[16,7]],'t').ps([[3,8],[4,8],[7,8],[15,5],[16,5],[17,5],[19,16],[20,16]],'K');
  g.r(3,6,5,1,'k').r(15,14,4,1,'k').r(4,14,4,1,'k');
  g.ps([[10,12],[12,18],[22,8]],'S').p(10,17,'N').p(11,19,'E').ps([[1,5],[1,16],[22,13]],'T');
  reg('v4','ヨイヤミの村',{kind:'village',floor:'x',start:{x:11,y:18},ret:{map:'world',x:30,y:27},chests:[]},g);
})();

// ---------- SHRINES ----------
function shrine(id,name,deco,world){
  const g=Grid(12,10,'H');g.r(1,1,10,8,'z');g.p(6,9,'E');
  deco(g);
  reg(id,name,{kind:'shrine',floor:'z',start:{x:6,y:8},ret:{map:'world',x:world[0],y:world[1]},chests:[]},g);
}
shrine('shrine1','はじまりの祠',g=>{g.p(6,2,'q').ps([[3,2],[9,2]],'S').ps([[3,5],[9,5],[3,7],[9,7]],'P').r(6,3,1,6,'G');},[3,22]);
shrine('shrine2','月かげの祠',g=>{g.p(6,2,'q').r(2,2,2,1,'K').r(8,2,2,1,'K').r(3,4,2,2,'W').r(7,4,2,2,'W').r(6,3,1,6,'G').ps([[2,7],[9,7]],'P');},[8,11]);
shrine('shrine3','星みの祠',g=>{g.p(6,2,'q').ps([[2,2],[9,2],[2,6],[9,6]],'S').ps([[4,3],[8,3],[4,5],[8,5],[4,7],[8,7]],'P').r(6,3,1,6,'G');},[44,4]);

// ---------- CAVES ----------
function cave(id,name,zone,world,build,start){
  const g=Grid(24,18,'C');build(g);
  reg(id,name,{kind:'cave',floor:'c',enc:zone,start,ret:{map:'world',x:world[0],y:world[1]},chests:[]},g);
  return MAPS[id];
}
(function(){
  const m=cave('cave1','ねむりの洞窟',1.5,[13,31],g=>{
    g.r(1,14,6,3,'c').r(6,15,10,1,'c').r(15,6,1,10,'c').r(10,3,10,5,'c').r(15,11,2,1,'c').r(17,10,5,4,'c').r(4,12,1,2,'c').r(3,9,3,3,'c');
    g.p(2,17,'E').p(20,11,'X').p(4,9,'X').p(11,4,'S').p(18,4,'S');
  },{x:2,y:16});
  m.chests=[{id:'c1a',x:20,y:11,item:'やくそう'},{id:'c1b',x:4,y:9,g:40}];m.boss={id:1,x:15,y:4};
})();
(function(){
  const m=cave('cave2','こだまの洞窟',2.5,[22,13],g=>{
    g.r(17,13,6,4,'c').r(10,14,8,1,'c').r(4,11,7,5,'c').r(6,5,1,6,'c').r(3,1,10,4,'c').r(3,1,2,2,'M').r(11,1,2,2,'M').r(8,12,2,2,'M');
    g.p(21,17,'E').p(22,13,'X').p(4,11,'X').p(7,1,'S').p(9,1,'S');
  },{x:21,y:16});
  m.chests=[{id:'c2a',x:22,y:13,item:'やくそう'},{id:'c2b',x:4,y:11,g:90}];m.boss={id:2,x:7,y:3};
})();
(function(){
  const m=cave('cave3','ほのおの洞窟',3.5,[41,15],g=>{
    g.r(10,14,5,3,'c').r(12,9,1,5,'c').r(6,7,13,3,'c').r(8,1,9,4,'c').r(12,5,1,2,'c').r(3,4,4,6,'c').r(6,5,1,3,'c').r(15,9,5,1,'c');
    g.r(7,8,2,1,'M').r(16,8,2,1,'M').r(9,1,1,2,'M').r(15,1,1,2,'M').r(10,15,1,1,'M');
    g.p(12,17,'E').p(3,4,'X').p(19,9,'X').p(8,4,'S').p(16,4,'S');
  },{x:12,y:16});
  m.chests=[{id:'c3a',x:3,y:4,item:'やくそう'},{id:'c3b',x:19,y:9,g:0,item:'げんきの玉'}];m.boss={id:3,x:12,y:2};
})();

// ---------- CASTLE ----------
(function(){
  const g=Grid(20,24,'C');g.r(2,2,16,20,'z').r(9,3,2,18,'G').r(6,2,8,2,'z');
  for(const y of [6,9,12,15,18]){g.p(5,y,'P').p(14,y,'P');}
  g.ps([[9,2],[10,2]],'q').p(10,22,'E').ps([[3,3],[16,3],[3,20],[16,20]],'X').ps([[3,10],[16,10],[3,14],[16,14]],'M');
  reg('castle','魔王城',{kind:'cave',floor:'z',enc:4.5,start:{x:10,y:21},ret:{map:'world',x:23,y:28},
    chests:[{id:'k1',x:3,y:3,item:'やくそう'},{id:'k2',x:16,y:3,g:120},{id:'k3',x:3,y:20,item:'やくそう'},{id:'k4',x:16,y:20,g:200}],boss:{id:4,x:10,y:3}},g);
})();
