'use strict';
// ===== towns: unique culture & events for v2 みなと村 / v3 たかね村 / v4 ヨイヤミの村 =====
const TILEEV={};
const putTiles=(id,list)=>{const m=MAPS[id];for(const[x,y,c]of list)m.g[y][x]=c;};
// ---------- v2 みなと村: 港・つりたいかい・うみの かみさま ----------
putTiles('v2',[[22,4,'a'],[21,12,'a'],[23,14,'a'],[24,17,'I'],[17,6,'n'],[17,7,'n'],[19,14,'r'],[19,15,'r'],[18,9,'i'],[22,17,'S'],[3,9,'i']]);
const fishWait=async(ms)=>{const t0=Date.now();while(Date.now()-t0<ms)await sleep(30);};
async function castLine(win){
  G.fish={phase:'wait',t:0};
  await say('つりざおを なげた……');
  await fishWait(700+rnd(1400));
  G.apress=0;sfx('crit');G.fish.phase='hit';G.fish.t=0;G.banner={text:'！ ヒット ！　Aボタンで ひけ！',t:46};
  const t0=Date.now();let ok=false;
  while(Date.now()-t0<(win||900)){if(G.apress>0){ok=true;break;}await sleep(16);}
  G.banner=null;
  if(ok){sfx('hit');G.fish.phase='catch';G.fish.t=0;return true;}
  G.fish.phase='miss';G.fish.t=0;return false;
}
TILEEV['v2:21,7']=TILEEV['v2:21,9']=async()=>{
  if((G.f.fishN||0)>=6){await say('きょうは もう じゅうぶん つれた。\nつぎは つりたいかいで うでを ためそう！');return;}
  const i=await choose(['つりを する','やめる'],{x:300,y:130,w:150,cancel:1});
  if(i!==0)return;
  G.f.fishN=(G.f.fishN||0)+1;
  if(await castLine()){
    const big=rnd(5)===0,nushi=rnd(12)===0;
    if(nushi){G.gold+=200;G.f.nushi=1;sfx('win');await sayAll(['ぐぐぐっ……！ ものすごい ひきだ！！','うみの ぬし『ごんぞう』が あらわれた！\nぬしは ひとにらみ すると、ひかる うろこを のこして うみへ かえった。','『ぬしの うろこ』を うって 200ゴールドに なった！']);}
    else if(big){G.pc.items['さかなの スープ']=(G.pc.items['さかなの スープ']||0)+1;await say('おおものだ！ しずみかけの つぼから\n『さかなの スープ』を てにいれた！');}
    else{G.pc.items['やきざかな']=(G.pc.items['やきざかな']||0)+1;await say('つれた！ そのばで やいて\n『やきざかな』に した！');}
  }else await say('にげられた……！ ざんねん。');
  G.fish=null;
};
npc('harbor','v2',19,7,'guard',async()=>{
  if(G.f.contest){await say('いい ひきだった！ うみの おとこ だ！\nみなと村は いつでも きみを かんげいする！','みなとの かんりにん');return;}
  await sayAll(['みなと村では まいとし『つりたいかい』を ひらく！','むかしの うみ神さまに その とし 一ばんの さかなを ささげる しきたりだ。'],'みなとの かんりにん');
  const i=await choose(['さんかする (さんかひ 0G)','やめておく'],{x:150,y:130,w:300,cancel:1});
  if(i!==0)return;
  await say('ルールは かんたん。3かい なげて、2ひき つれれば ゆうしょうだ！\nウキが しずんだら すぐ Aボタン だぞ！','みなとの かんりにん');
  let n=0;
  for(let k=1;k<=3;k++){await say(`${k}かいめ！`,'みなとの かんりにん');if(await castLine()){n++;await say('つれた！ かんせいが あがる！');}else await say('ざんねん、にげられた！');}
  G.fish=null;
  if(n>=2){G.f.contest=1;G.gold+=150;G.pc.items['さかなの スープ']=(G.pc.items['さかなの スープ']||0)+2;
    await sayAll([`${n}ひき！ ゆうしょうだ！！`,'しょうきん 150ゴールドと『さかなの スープ』2つを もらった！'],'みなとの かんりにん');}
  else await say(`${n}ひき か……。 また ちょうせん してくれ！\nさんかしょうに 10ゴールドだ。`,'みなとの かんりにん'),G.gold+=10;
});
npc('fishvend','v2',17,9,'woman',async()=>{const mk=typeof phaseNow==='function'&&phaseNow()===0,st=[{n:'やきざかな',price:12,t:'item'},{n:'さかなの スープ',price:35,t:'item'},HERB];
  if(mk){await say('朝市だよ！ きょうは ぜんぶ 3わり びき！','さかなやの おかみ');await shop(st.map(s=>Object.assign({},s,{price:Math.max(1,Math.ceil(s.price*.7))})));}else await shop(st);},()=>true);
npc('netman','v2',16,6,'old',L('あみつくろいの ろうじん','あみは むらの ほこりじゃ。\nよるの うみには ひかる さかなが おってな、とうだいの ひかりを めじるしに かえってくる。'));
npc('fishwife','v2',20,17,'woman',L('さかなやの おかみ','うみ神さまに おそなえを すると、おまもりを くださるって いわれてるの。\nそこの いしぞうに おいのり してみて！'));
TILEEV['v2:22,17']=async()=>{
  if(G.f.sea){await say('うみ神さまの いしぞうだ。\nなみの おとが やさしく きこえる。');return;}
  await say('うみ神さまの いしぞうだ。\nおそなえ ばこが おいて ある。（おそなえ 20ゴールド）');
  const i=await choose(['おそなえする','しない'],{x:300,y:130,w:150,cancel:1});
  if(i!==0)return;
  if(G.gold<20){await say('おかねが たりない……。');return;}
  G.gold-=20;G.f.sea=1;sfx('lvl');G.pc.mhp+=6;G.pc.hp+=6;
  await sayAll(['……ざざ……ん。\nどこかで うみの こえが した。','『うみ神の おまもり』を てにいれた！\nさいだいHPが 6 あがった！']);
};
// ---------- v3 たかね村: かじと こうざんと ほしみ ----------
putTiles('v3',[[14,2,'v'],[20,18,'u'],[22,18,'m'],[2,19,'r'],[3,19,'r'],[2,18,'r']]);
npc('smith','v3',19,18,'man2',async()=>{
  const lv=G.f.forge||0,costs=[150,300,500];
  if(lv>=3){await say('もう おまえの ぶきは おれの さいこうけっさく だ！\nこれ いじょうは かみさまに まかせな！','かじや');return;}
  await say(`よう！ おれは たかね村の かじやだ。\nぶきを きたえなおして やろう。`+`\n${costs[lv]}ゴールドで こうげきりょくを +4 してやる！`,'かじや');
  const i=await choose([`きたえる (${costs[lv]}G)`,'やめておく'],{x:300,y:130,w:200,cancel:1});
  if(i!==0)return;
  if(G.gold<costs[lv]){await say('かねが たりねえな。かせいで こい！','かじや');return;}
  G.gold-=costs[lv];G.f.forge=lv+1;G.pc.wp+=4;sfx('lvl');await fade(1,200);await sleep(350);await fade(0,200);
  await say(`カンッ！ カンッ！\n${G.pc.wpn}が きたえなおされた！\nこうげきりょくが +4 に なった！`,'かじや');
});
npc('miner','v3',15,5,'man',L('こうざんふ','あそこの こうざんは まだ ほれる。\nただし ほりすぎると まものを おこすぞ。\nいりぐちは そこの たてあなだ。'));
npc('stargazer','v3',24,9,'old',L('ほしみの ろうじん','たかね村は くもの うえに ちかい。\nよる、ほしが おちてくる ようで のう……。\nほくとうの だいちで ひとり ほしを みる ものが おる。'));
npc('hiroba','v3',13,19,'granny',L('ひまつりの おばば','ふゆの はじめに むらじゅうの たいまつを かまどの ひから わけるんだよ。\nそれが たかね村の『ひわけ』の まつり さ。'));
TILEEV['v3:14,2']=async()=>{
  const used=G.f.mine||0;
  await say(used>=3?'こうざんの いりぐち。\nもう たくさん ほった ようだ……。それでも ほる？':'こうざんの いりぐち。\nつるはしが たてかけて ある。ほってみる？');
  const i=await choose(['ほってみる','やめる'],{x:300,y:130,w:160,cancel:1});
  if(i!==0)return;
  G.f.mine=used+1;sfx('hit');G.shake=8;await sleep(500);
  if(used>=3){ // dug too much: the mountain gets angry
    sfx('enc');G.shake=14;await say('ゴゴゴゴ……！ ほりすぎた！\nやまの ぬしが めを さました！');
    const rs=await battle(pickFoe(3));if(rs==='lose')await onLose();return;
  }
  const r=rnd(100);
  if(r<45){const g=40+rnd(70);G.gold+=g;sfx('buy');await say(`カーン！ てつこうせきが でてきた！\nうりはらって ${g}ゴールドに なった！`);}
  else if(r<70){G.pc.items['やくそう']=(G.pc.items['やくそう']||0)+2;await say('いわの かげに やくそうが はえていた！\n『やくそう』を 2つ てにいれた！');}
  else{await say('ゴゴゴ……！ あなから まものが とびだした！');const rs=await battle(pickFoe(2.5));if(rs==='lose')await onLose();}
};
// ---------- v4 ヨイヤミの村: ともしび まつり ----------
putTiles('v4',[[1,11,'p'],[22,11,'p'],[17,18,'i'],[7,18,'i'],[18,18,'r'],[19,18,'r']]);
const LANTS=[[9,11],[13,11],[10,15],[13,15]];
MAPS.v4.dyn=LANTS.map(([x,y],i)=>({x,y,fl:'lan'+i,on:'l',off:'L'}));
const lantCount=()=>LANTS.filter((_,i)=>G.f['lan'+i]).length;
LANTS.forEach(([x,y],i)=>{TILEEV[`v4:${x},${y}`]=async()=>{
  if(G.f['lan'+i]){await say('ともしびが やさしく ゆれている。');return;}
  await say('きえた いしとうろうだ。\nそばに ひうち石が おいて ある。\nひを ともす？');
  const c=await choose(['ともす','やめる'],{x:300,y:130,w:140,cancel:1});
  if(c!==0)return;
  G.f['lan'+i]=1;sfx('heal');refreshMap();G.fx.push({k:'spark',x,y,t:0});await sleep(400);
  const n=lantCount();
  if(n<4)await say(`ぽう……と あかりが ともった。\n（ともしび ${n}/4）`);
  else{sfx('lvl');G.f.fest=1;await sayAll(['ぽう……と さいごの あかりが ともった！','むらじゅうの とうろうが いっせいに かがやく！','やみの むらヨイヤミが、ほんの すこし だけ あかるく なった。','ともしびまつりの はじまりだ！']);}
};});
npc('lampkeeper','v4',8,11,'old',async()=>{
  if(G.f.festdone){await say('まつりは いつも きみの ともしびと ともに ある。\nよい たびを。','ともしびの もりびと');return;}
  if(!G.f.fest){
    await sayAll(['ヨイヤミは ひかりが とどきにくい むらでのう。\nだから まいとし『ともしびまつり』で\nむらじゅうに あかりを ともすんじゃ。','そこで たのみが ある。\nむらの 4つの とうろうに ひを ともして くれんか？','ひうち石は とうろうの そばに あるぞい。'],'ともしびの もりびと');
    await say(`いまの ともしび：${lantCount()}/4`,'ともしびの もりびと');return;
  }
  G.f.festdone=1;G.gold+=120;G.pc.items['ヨイヤミだんご']=(G.pc.items['ヨイヤミだんご']||0)+3;
  await sayAll(['おお……！ むらが こんなに あかるい のは なんねんぶりか。','おれいに『ヨイヤミだんご』と 120ゴールドを おくろう！'],'ともしびの もりびと');
  await say('『ヨイヤミだんご』を 3つ、120ゴールドを もらった！');
});
npc('vend4','v4',16,18,'man2',()=>shop([{n:'ヨイヤミだんご',price:25,t:'item'},{n:'さかなの スープ',price:40,t:'item'},HERB]),()=>true);
npc('seer','v4',8,18,'woman',async()=>{
  await say('かげうらないの みせ へ ようこそ。……ほう。','かげうらない');
  await say('あなたの いくべき みちが かげに うかぶ……。\n「'+goalText()+'」','かげうらない');
},()=>true);
npc('dancer','v4',15,11,'girl',L('かげおどりの こ','ヨイヤミでは よるに かげと おどるの。\nひかりが あると かげが うまれる。だから あかりは だいじ なのよ。'));

// ---------- fishing scene (full-screen picture while fishing) ----------
function drawFish(){
  const f=G.fish;if(!f)return;f.t++;const tk=G.tick,c=ctx;
  const ph=(typeof phaseNow==='function')?phaseNow():0;
  const SKY=[['#6ab6f5','#e4f4ff','#fff3c4'],['#4a5fb8','#f08a6a','#ffd08a'],['#0c1440','#2a3a7a','#6a7ab8']][ph];
  const HZ=206;
  const rrect=(x,y,w,h,r)=>{c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();};
  const star4=(x,y,s,a)=>{c.save();c.globalAlpha=a;c.fillStyle='#fff';c.beginPath();c.moveTo(x,y-s);c.quadraticCurveTo(x,y,x+s,y);c.quadraticCurveTo(x,y,x,y+s);c.quadraticCurveTo(x,y,x-s,y);c.quadraticCurveTo(x,y,x,y-s);c.fill();c.restore();};
  // sky
  const sk=c.createLinearGradient(0,0,0,HZ);sk.addColorStop(0,SKY[0]);sk.addColorStop(.7,SKY[1]);sk.addColorStop(1,SKY[2]);c.fillStyle=sk;c.fillRect(0,0,W,HZ);
  // sun / moon glow
  const sx=ph===2?96:330,sy=ph===0?58:ph===1?150:52;
  const gl=c.createRadialGradient(sx,sy,2,sx,sy,120);gl.addColorStop(0,ph===2?'#f4f0ffcc':'#fff6c8dd');gl.addColorStop(.25,ph===2?'#b8c4ff55':'#ffe39a55');gl.addColorStop(1,'#ffffff00');c.fillStyle=gl;c.fillRect(0,0,W,HZ);
  c.fillStyle=ph===2?'#f2f0ff':'#fffbe8';c.beginPath();c.arc(sx,sy,ph===2?13:16,0,7);c.fill();
  if(ph===2){for(let i=0;i<26;i++){star4((i*97)%W,(i*53)%150+6,1.5+(i%3),.4+.4*Math.sin(tk/20+i));}}
  // clouds
  c.fillStyle=ph===2?'#8a94d055':ph===1?'#ffd9c066':'#ffffffaa';
  for(const[x,y,w]of[[60,40,80],[250,26,100],[390,70,64],[170,90,70]]){const dx=(tk*.08+x)%(W+160)-80;for(let k=0;k<5;k++){c.beginPath();c.ellipse(dx+(k-2)*w*.2,y+Math.abs(k-2)*-2,w*.22,9+(2-Math.abs(k-2))*3,0,0,7);c.fill();}}
  // distant mountains & far shore
  c.fillStyle=ph===2?'#1a2458':ph===1?'#7a5a8a':'#8fb0d8';c.beginPath();c.moveTo(0,HZ);c.lineTo(0,176);c.quadraticCurveTo(50,150,100,172);c.quadraticCurveTo(150,150,210,180);c.lineTo(250,HZ);c.fill();
  c.fillStyle=ph===2?'#121a48':ph===1?'#5e4676':'#6e98c6';c.beginPath();c.moveTo(150,HZ);c.quadraticCurveTo(220,176,300,HZ);c.fill();
  // gulls
  c.strokeStyle=ph===2?'#c8d0ff':'#fff';c.lineWidth=1.6;
  for(let i=0;i<3;i++){const gx=(tk*.35+i*150)%(W+80)-40,gy=48+i*22+Math.sin(tk/28+i)*6,fl=Math.sin(tk/6+i*2)*4;c.beginPath();c.moveTo(gx-8,gy+fl);c.quadraticCurveTo(gx-4,gy-4,gx,gy);c.quadraticCurveTo(gx+4,gy-4,gx+8,gy+fl);c.stroke();}
  // sea
  const sea=c.createLinearGradient(0,HZ,0,H);sea.addColorStop(0,ph===2?'#1c3070':ph===1?'#e08a7a':'#5ab4f0');sea.addColorStop(.35,ph===2?'#122058':ph===1?'#5a5aa8':'#2a82dc');sea.addColorStop(1,ph===2?'#060c30':ph===1?'#1a2468':'#0e3278');c.fillStyle=sea;c.fillRect(0,HZ,W,H-HZ);
  // sun path reflection
  for(let i=0;i<22;i++){const y=HZ+4+i*10,wd=(10+i*3)*(1+.3*Math.sin(tk/16+i)),ox=Math.sin(tk/22+i*1.3)*6;c.fillStyle=(ph===2?'#d8dcff':'#fff2b8')+(Math.max(0,Math.floor(150-i*6))).toString(16).padStart(2,'0');c.fillRect(sx-wd/2+ox,y,wd,2);}
  // soft waves
  c.lineWidth=1.2;for(let i=0;i<16;i++){const y=HZ+10+i*(10+i*.5),x=((i*83+tk*(.18+i%3*.1))%(W+60))-30;c.strokeStyle='#ffffff'+(i<6?'33':'22');c.beginPath();c.moveTo(x-24,y);c.bezierCurveTo(x-12,y-4,x-4,y-4,x,y);c.bezierCurveTo(x+4,y+4,x+12,y+4,x+24,y);c.stroke();}
  // lighthouse (soft glow at dusk/night)
  c.fillStyle='#6a5e56';c.beginPath();c.ellipse(448,214,64,10,0,0,7);c.fill();
  c.fillStyle='#fbfbfb';c.beginPath();c.moveTo(430,210);c.lineTo(438,110);c.lineTo(458,110);c.lineTo(466,210);c.fill();
  c.fillStyle='#c83a3a';c.beginPath();c.moveTo(433,182);c.lineTo(463,182);c.lineTo(465,196);c.lineTo(431,196);c.fill();c.beginPath();c.moveTo(436,136);c.lineTo(460,136);c.lineTo(462,150);c.lineTo(434,150);c.fill();
  c.fillStyle='#ffffff22';c.beginPath();c.moveTo(450,110);c.lineTo(458,110);c.lineTo(466,210);c.lineTo(456,210);c.fill();
  c.fillStyle='#3a3a4a';c.fillRect(434,100,28,12);c.fillStyle='#ffe27a';c.fillRect(438,86,20,14);c.fillStyle='#a82a2a';c.beginPath();c.moveTo(434,88);c.lineTo(448,74);c.lineTo(462,88);c.fill();
  if(ph>0){const lg=c.createRadialGradient(448,93,2,448,93,70);lg.addColorStop(0,'#fff2a0cc');lg.addColorStop(1,'#fff2a000');c.fillStyle=lg;c.fillRect(370,20,160,150);}
  // sailboat
  const bb=Math.sin(tk/34)*3,br=Math.sin(tk/34+1)*.03;
  c.save();c.translate(284,232+bb);c.rotate(br);
  c.fillStyle='#7a4e24';c.beginPath();c.moveTo(-34,-4);c.lineTo(34,-4);c.quadraticCurveTo(26,16,10,16);c.lineTo(-16,16);c.quadraticCurveTo(-28,14,-34,-4);c.fill();
  c.fillStyle='#5a3818';c.fillRect(-34,-4,68,3);c.fillStyle='#4a3018';c.fillRect(-1,-52,2.5,48);
  c.fillStyle='#faf5e8';c.beginPath();c.moveTo(3,-50);c.quadraticCurveTo(26,-30,30,-8);c.lineTo(3,-8);c.fill();c.fillStyle='#e6dcc4';c.beginPath();c.moveTo(-3,-44);c.quadraticCurveTo(-18,-26,-24,-8);c.lineTo(-3,-8);c.fill();
  c.restore();c.fillStyle='#ffffff44';c.beginPath();c.ellipse(284,252+bb,40,3,0,0,7);c.fill();
  // pier
  c.fillStyle='#9a6a34';c.fillRect(0,196,196,14);c.fillStyle='#b88448';c.fillRect(0,196,196,3);c.fillStyle='#6e4824';for(let x=0;x<196;x+=24)c.fillRect(x,199,2,11);
  c.fillStyle='#4a2e14';c.fillRect(22,210,9,86);c.fillRect(140,210,9,86);c.fillStyle='#00000030';c.fillRect(22,210,9,86);
  c.fillStyle='#ffffff30';for(const px of[26,144])c.fillRect(px-6,214+Math.sin(tk/20+px)*1,20,2);
  // hero
  c.save();c.translate(36,104);c.scale(3,3);drawChar(c,0,0,CHARS[G.story].spr,3,f.phase==='catch'?1:0);c.restore();
  // rod & line
  const bend=f.phase==='hit'?Math.sin(tk*.9)*3:0,pull=f.phase==='hit'?7:0;
  const tipx=204+bend,tipy=66+bend+pull*.4;
  c.strokeStyle='#4a2c14';c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(108,172);c.quadraticCurveTo(160,104+pull,tipx,tipy);c.stroke();
  c.strokeStyle='#c89a5a';c.lineWidth=1.5;c.beginPath();c.moveTo(108,172);c.quadraticCurveTo(160,104+pull,tipx,tipy);c.stroke();
  let bx=344,by=252+Math.sin(tk/16)*2;
  if(f.phase==='hit')by=264+Math.abs(Math.sin(tk*.55))*8;
  if(f.phase==='catch'||f.phase==='miss'){bx=300;by=252;}
  const ripple=(x,y,t0,n,col)=>{c.lineWidth=1.4;for(let r=0;r<n;r++){const k=((t0+r*(60/n))%60)/60,e=1-Math.pow(1-k,2);c.strokeStyle=col;c.globalAlpha=(1-k)*.8;c.beginPath();c.ellipse(x,y,6+e*34,2+e*9,0,0,7);c.stroke();}c.globalAlpha=1;};
  if(f.phase!=='catch'){
    // gentle catenary line
    const sag=f.phase==='hit'?10:34;c.strokeStyle='#ffffffcc';c.lineWidth=1;c.beginPath();c.moveTo(tipx,tipy);c.quadraticCurveTo((tipx+bx)/2,Math.max(tipy,by)-(by-tipy)*.1+sag*.5,bx,by-6);c.stroke();
    ripple(bx,by+4,tk,f.phase==='hit'?3:2,'#ffffff');
    // bobber
    const bob=f.phase==='hit'?Math.sin(tk*.9)*.2:Math.sin(tk/16)*.05;
    c.save();c.translate(bx,by);c.rotate(bob);
    c.fillStyle='#00000026';c.beginPath();c.ellipse(0,5,7,2,0,0,7);c.fill();
    c.fillStyle='#fdfdfd';c.beginPath();c.ellipse(0,0,5.5,7,0,0,7);c.fill();
    c.fillStyle='#e23a4a';c.beginPath();c.ellipse(0,-3,5.5,4.4,0,Math.PI,0);c.fill();c.beginPath();c.ellipse(0,-3,5.5,4.4,0,Math.PI,0);c.fill();c.fillRect(-5.2,-3.4,10.4,2);
    c.fillStyle='#ffffffcc';c.beginPath();c.ellipse(-2,-3,1.4,2.2,0,0,7);c.fill();c.fillStyle='#2a2a3a';c.fillRect(-1,-12,2,5);
    c.restore();
  }
  // gentle drifting sparkles on water
  for(let i=0;i<9;i++){const p=(tk*.4+i*47)%90;star4((i*61+40)%W,HZ+14+((i*37)%170),1.5+Math.sin((p/90)*Math.PI)*2.2,Math.sin((p/90)*Math.PI)*.85);}
  const fish=(x,y,sc,rot,col,a)=>{c.save();c.globalAlpha=a==null?1:a;c.translate(x,y);c.rotate(rot);c.scale(sc,sc);
    const gr=c.createLinearGradient(0,-14,0,14);gr.addColorStop(0,col);gr.addColorStop(1,'#fff6e0');
    c.fillStyle=col;c.strokeStyle='#14305a';c.lineWidth=1.4;
    const tw=Math.sin(tk/3)*5;c.beginPath();c.moveTo(-24,0);c.quadraticCurveTo(-36,-6+tw,-46,-16+tw);c.quadraticCurveTo(-40,0,-46,16+tw);c.quadraticCurveTo(-36,6+tw,-24,0);c.fill();c.stroke();
    c.beginPath();c.moveTo(-4,-11);c.quadraticCurveTo(4,-24,14,-10);c.closePath();c.fill();c.stroke();
    c.fillStyle=gr;c.beginPath();c.moveTo(-28,0);c.quadraticCurveTo(-4,-20,30,-3);c.quadraticCurveTo(4,16,-28,0);c.fill();c.stroke();
    c.fillStyle='#ffffff77';for(let i=0;i<5;i++){c.beginPath();c.arc(-14+i*6,-3+Math.abs(i-2)*1.2,2.2,Math.PI,0);c.stroke();}
    c.fillStyle='#fff';c.beginPath();c.arc(18,-4,3.6,0,7);c.fill();c.fillStyle='#111';c.beginPath();c.arc(19,-4,1.8,0,7);c.fill();
    c.restore();c.globalAlpha=1;};
  const panel=(x,y,w,h,txt,col)=>{c.save();c.globalAlpha=.9;const g=c.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'#1a2a58');g.addColorStop(1,'#0c1636');c.fillStyle=g;rrect(x,y,w,h,12);c.fill();c.strokeStyle=col;c.lineWidth=2;rrect(x+2,y+2,w-4,h-4,10);c.stroke();c.globalAlpha=1;c.fillStyle='#fff';c.font='bold 17px '+FONT;c.textBaseline='middle';c.textAlign='center';c.fillText(txt,x+w/2,y+h/2+1);c.textAlign='left';c.restore();};
  if(f.phase==='hit'){
    for(let i=0;i<10;i++){const k=((f.t*1.4+i*6)%36)/36,a=i*.9+i*.3,r=10+k*30;c.fillStyle='#ffffff';c.globalAlpha=(1-k)*.9;c.beginPath();c.arc(bx+Math.cos(a)*r*.9,by-2-Math.sin(k*Math.PI)*28+Math.sin(a)*3,2.4*(1-k)+.6,0,7);c.fill();}c.globalAlpha=1;
    star4(bx,by-10,10+Math.sin(tk/3)*3,.9);
    const pu=1+Math.sin(tk/4)*.08;c.save();c.translate(130,48);c.scale(pu,pu);c.fillStyle='#ffd23f';c.strokeStyle='#8a4a00';c.lineWidth=4;c.font='bold 44px '+FONT;c.textAlign='center';c.textBaseline='middle';c.strokeText('！',0,0);c.fillText('！',0,0);c.restore();c.textAlign='left';
    panel(150,12,252,34,'ヒット！ Aボタンで ひけ！','#ffd23f');}
  if(f.phase==='catch'){
    const p=Math.min(1,f.t/36),e=1-Math.pow(1-p,2),fx=300-e*70,y=252-e*140-Math.sin(p*Math.PI)*60+(p>=1?Math.sin(tk/8)*3:0);
    if(f.t<14)ripple(300,256,f.t*4,3,'#ffffff');
    for(let i=0;i<12;i++){const k=((f.t+i*3)%34)/34,a=i*.52;c.fillStyle='#bfe6ff';c.globalAlpha=(1-k)*.9;c.beginPath();c.arc(fx+Math.cos(a)*(6+k*50),y+Math.sin(a)*(4+k*40)+k*30*k,2.2*(1-k)+.6,0,7);c.fill();}c.globalAlpha=1;
    const rg=c.createRadialGradient(fx,y,4,fx,y,80);rg.addColorStop(0,'#ffe9a088');rg.addColorStop(1,'#ffe9a000');c.fillStyle=rg;c.fillRect(fx-80,y-80,160,160);
    fish(fx,y,1.5,-.3+Math.sin(tk/6)*.12,'#ff8a3a');
    for(let i=0;i<7;i++){const a=i*.9+tk*.04,r=44+(f.t*2+i*9)%26;star4(fx+Math.cos(a)*r,y+Math.sin(a)*r*.7,3+(i%3)*1.5,.5+.5*Math.sin(tk/5+i));}}
  if(f.phase==='miss'){
    const p=Math.min(1,f.t/60),fx=300+p*150,fy=252-Math.sin(Math.min(1,p*1.6)*Math.PI)*34+p*8;
    if(f.t<24)ripple(300,256,f.t*2.5,2,'#ffffff');
    fish(fx,fy,1.2-p*.5,.4+p*.5,'#4a6a9a',1-p*.7);
    for(let i=0;i<6;i++){const k=((f.t+i*5)%28)/28;c.fillStyle='#ffffff';c.globalAlpha=(1-k)*.8*(1-p*.6);c.beginPath();c.arc(fx-30+i*4,fy+8-Math.sin(k*Math.PI)*14,2*(1-k)+.5,0,7);c.fill();}c.globalAlpha=1;
    panel(150,60,212,34,'にげられた……','#8a9acb');}
  // soft vignette
  const vg=c.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,W*.62);vg.addColorStop(0,'#00000000');vg.addColorStop(1,ph===2?'#00000066':'#10204044');c.fillStyle=vg;c.fillRect(0,0,W,H);
}
// ---------- walking townsfolk ----------
const WANDER={v1a:2,v1b:2,v1c:1,v2a:2,v2b:1,fisher:1,v3a:2,v3b:2,maid:1,v4a:2,v4b:2,dancer:1,miner:1,stargazer:1,netman:1,hiroba:1,fishwife:2};
for(const n of NPCS)if(WANDER[n.id])n.wander=WANDER[n.id];
