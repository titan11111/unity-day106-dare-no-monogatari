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
  const sk=c.createLinearGradient(0,0,0,210);sk.addColorStop(0,'#5aa8f0');sk.addColorStop(1,'#cfe9ff');c.fillStyle=sk;c.fillRect(0,0,W,210);
  c.fillStyle='#fff9';for(const[x,y,w]of[[60,40,70],[250,26,90],[380,64,60]]){const dx=(tk*.12+x)%(W+120)-60;c.beginPath();c.ellipse(dx,y,w/2,12,0,0,7);c.ellipse(dx+w*.25,y-8,w/3,11,0,0,7);c.fill();}
  const sea=c.createLinearGradient(0,210,0,H);sea.addColorStop(0,'#3a8ae6');sea.addColorStop(1,'#123a86');c.fillStyle=sea;c.fillRect(0,210,W,H-210);
  c.strokeStyle='#ffffff66';c.lineWidth=1.5;for(let i=0;i<14;i++){const y=222+i*13,x=((i*83+tk*(.3+i%3*.15))%W);c.beginPath();c.moveTo(x-20,y);c.quadraticCurveTo(x-10,y-4,x,y);c.quadraticCurveTo(x+10,y+4,x+20,y);c.stroke();}
  c.fillStyle='#7a6a5a';c.beginPath();c.ellipse(448,214,64,10,0,0,7);c.fill();
  c.fillStyle='#fafafa';c.beginPath();c.moveTo(430,210);c.lineTo(438,110);c.lineTo(458,110);c.lineTo(466,210);c.fill();
  c.fillStyle='#d23a3a';c.beginPath();c.moveTo(433,182);c.lineTo(463,182);c.lineTo(465,196);c.lineTo(431,196);c.fill();c.beginPath();c.moveTo(436,136);c.lineTo(460,136);c.lineTo(462,150);c.lineTo(434,150);c.fill();
  c.fillStyle='#3a3a4a';c.fillRect(434,100,28,12);c.fillStyle='#ffe27a';c.fillRect(438,86,20,14);c.fillStyle='#b82a2a';c.beginPath();c.moveTo(434,88);c.lineTo(448,74);c.lineTo(462,88);c.fill();
  const bb=Math.sin(tk/30)*3;c.fillStyle='#8a5a2a';c.beginPath();c.moveTo(250,228+bb);c.lineTo(318,228+bb);c.lineTo(306,246+bb);c.lineTo(262,246+bb);c.fill();
  c.fillStyle='#f6f1e4';c.beginPath();c.moveTo(284,224+bb);c.lineTo(284,176+bb);c.lineTo(312,224+bb);c.fill();c.fillStyle='#e0d8c6';c.beginPath();c.moveTo(280,224+bb);c.lineTo(280,186+bb);c.lineTo(258,224+bb);c.fill();
  // pier
  c.fillStyle='#8e5e2c';c.fillRect(0,196,190,16);c.fillStyle='#6a4220';for(let x=0;x<190;x+=22)c.fillRect(x,196,3,16);c.fillStyle='#5a3818';c.fillRect(24,212,10,84);c.fillRect(140,212,10,84);
  // hero
  const bend=f.phase==='hit'?Math.sin(tk*.9)*3:0;
  c.save();c.translate(36,104);c.scale(3,3);drawChar(c,0,0,CHARS[G.story].spr,3,f.phase==='catch'?1:0);c.restore();
  const tipx=196+bend,tipy=70+bend;c.strokeStyle='#6b4423';c.lineWidth=4;c.beginPath();c.moveTo(108,170);c.quadraticCurveTo(160,110,tipx,tipy);c.stroke();
  let bx=340,by=250+Math.sin(tk/12)*2;
  if(f.phase==='hit')by=262+Math.sin(tk*1.2)*5;
  if(f.phase==='catch'||f.phase==='miss'){bx=300;by=250;}
  if(f.phase!=='catch'){c.strokeStyle='#fff';c.lineWidth=1;c.beginPath();c.moveTo(tipx,tipy);c.quadraticCurveTo((tipx+bx)/2,tipy+30,bx,by);c.stroke();
    c.fillStyle='#e23a3a';c.beginPath();c.arc(bx,by,6,Math.PI,0);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(bx,by,6,0,Math.PI);c.fill();
    c.strokeStyle='#ffffffaa';c.lineWidth=1.5;for(let r=0;r<3;r++){const k=((tk/2+r*10)%30);c.globalAlpha=1-k/30;c.beginPath();c.ellipse(bx,by+5,8+k,2+k/4,0,0,7);c.stroke();}c.globalAlpha=1;}
  const fish=(x,y,sc,rot,col)=>{c.save();c.translate(x,y);c.rotate(rot);c.scale(sc,sc);c.fillStyle=col;c.strokeStyle='#14305a';c.lineWidth=1.5;
    c.beginPath();c.ellipse(0,0,30,13,0,0,7);c.fill();c.stroke();c.beginPath();c.moveTo(-26,0);c.lineTo(-44,-14);c.lineTo(-44,14);c.closePath();c.fill();c.stroke();
    c.fillStyle='#fff';c.beginPath();c.ellipse(16,-3,4,4,0,0,7);c.fill();c.fillStyle='#111';c.beginPath();c.arc(17,-3,2,0,7);c.fill();
    c.fillStyle='#ffffff66';c.beginPath();c.ellipse(-2,6,16,4,0,0,7);c.fill();c.restore();};
  if(f.phase==='hit'){c.fillStyle='#ffffffcc';for(let i=0;i<8;i++){const a=i*.8+tk*.3;c.beginPath();c.arc(bx+Math.cos(a)*(12+f.t%12),by-4+Math.sin(a)*6-(f.t%12),2.4,0,7);c.fill();}
    c.fillStyle='#ffd23f';c.font='bold 40px '+FONT;c.textBaseline='top';c.fillText('！',108,52);
    c.fillStyle='#000a';c.fillRect(120,10,272,34);c.fillStyle='#fff';c.font='18px '+FONT;c.fillText('ヒット！ Aボタンで ひけ！',134,18);}
  if(f.phase==='catch'){const p=Math.min(1,f.t/30),y=130-Math.sin(p*Math.PI)*70+ (1-p)*120;fish(230,y,1.5,-.3+Math.sin(tk/5)*.15,'#ff8a3a');
    c.fillStyle='#ffd23f';for(let i=0;i<10;i++){const a=i*.63+tk*.05;c.fillRect(230+Math.cos(a)*(50+f.t%20),y+Math.sin(a)*(34+f.t%14),4,4);}}
  if(f.phase==='miss'){const p=Math.min(1,f.t/40);fish(300+p*140,250-Math.sin(p*3)*30,1.2-p*.3,.5+p*.4,'#4a5a7a');c.fillStyle='#000a';c.fillRect(150,60,212,34);c.fillStyle='#fff';c.font='18px '+FONT;c.textBaseline='top';c.fillText('にげられた……！',190,68);}
}
// ---------- walking townsfolk ----------
const WANDER={v1a:2,v1b:2,v1c:1,v2a:2,v2b:1,fisher:1,v3a:2,v3b:2,maid:1,v4a:2,v4b:2,dancer:1,miner:1,stargazer:1,netman:1,hiroba:1,fishwife:2};
for(const n of NPCS)if(WANDER[n.id])n.wander=WANDER[n.id];
