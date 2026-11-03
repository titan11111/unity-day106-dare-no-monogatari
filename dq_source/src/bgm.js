'use strict';
// ===== bgm: 外部音源なし。Web Audio でその場で曲を生成するジェネラティブBGM =====
// 構成: 3種のシンセ(パッド/ベース/アルペジオ) + 生成メロディ(シード付き) + 合成ドラム
//       → リバーブ(畳み込み) + テンポ同期風ディレイ → コンプレッサー → master
const BGM={ac:null,master:null,rev:null,dly:null,noise:null,run:null,want:null,muted:false,timer:null};
try{BGM.muted=localStorage.getItem('dq_mute')==='1';}catch(e){}
const mtof=n=>440*Math.pow(2,(n-69)/12);
const CT={M:[0,4,7],m:[0,3,7],M7:[0,4,7,11],m7:[0,3,7,10],sus:[0,5,7],add9:[0,4,7,14],m9:[0,3,7,14]};
const MODE={min:[0,2,3,5,7,8,10],maj:[0,2,4,5,7,9,11],dor:[0,2,3,5,7,9,10],phr:[0,1,3,5,7,8,10],lyd:[0,2,4,6,7,9,11]};
const RHY=[[[0,4],[4,2],[6,2],[8,4],[12,4]],[[0,2],[2,2],[4,4],[8,2],[10,2],[12,4]],[[0,6],[6,2],[8,4],[12,2],[14,2]],[[2,2],[4,2],[8,6],[14,2]],[[0,8],[8,8]],[[0,3],[3,3],[6,2],[8,3],[11,3],[14,2]],[[0,2],[2,2],[4,2],[6,2],[8,2],[10,2],[12,2],[14,2]]];
// bass: x=ルート o=オクターブ 5=5度 .=休み / arp: 数字=和音の何番目か(0始まり) U=1オクターブ上
const THEMES={
 title:{bpm:70,key:9,mode:'min',prog:[[45,'m9'],[41,'M7'],[48,'M'],[43,'sus']],pad:.11,padCut:900,bass:'x.......o.......',arp:'0.1.2.1.0.1.2.3.',arpVol:.07,lead:.07,rhy:[4,0,3],mphr:[0,1,0,2],rev:.9,dly:.45,leadType:'triangle'},
 select:{bpm:84,key:7,mode:'maj',prog:[[43,'M'],[40,'m'],[36,'M7'],[38,'sus']],pad:.09,padCut:1200,bass:'x...x...x...x...',arp:'0.1.2.1.',arpVol:.06,lead:.08,rhy:[0,1],mphr:[0,0,1,0],rev:.7,dly:.3,leadType:'triangle'},
 village:{bpm:104,key:0,mode:'maj',prog:[[48,'M'],[43,'M'],[45,'m'],[41,'M7']],pad:.06,padCut:1500,bass:'x.....x.x.....o.',arp:'0.12.1.20.12.1.2',arpVol:.075,lead:.1,rhy:[1,0,5],mphr:[0,1,0,2],rev:.5,dly:.28,leadType:'triangle',sw:.1},
 world:{bpm:116,key:2,mode:'dor',prog:[[38,'m7'],[45,'M'],[46,'M7'],[41,'M']],pad:.07,padCut:1800,bass:'x..x..x.x..x.o..',arp:'0.1.2.1.0.1.2.1.',arpVol:.06,lead:.1,rhy:[0,1,2,6],mphr:[0,1,0,2],kick:'x.......x.......',hat:'..x...x...x...x.',rev:.6,dly:.34,leadType:'sawtooth'},
 cave:{bpm:58,key:4,mode:'phr',prog:[[40,'m'],[41,'M'],[40,'m'],[47,'sus']],pad:.1,padCut:500,bass:'x...............',arp:'',arpVol:0,lead:.07,rhy:[4,3],mphr:[0,1,2,1],rev:1,dly:.55,leadType:'sine',sparse:.55},
 shrine:{bpm:66,key:5,mode:'lyd',prog:[[41,'M7'],[43,'M'],[45,'m7'],[43,'add9']],pad:.1,padCut:1400,bass:'x...............',arp:'0...2...1...3...',arpVol:.06,lead:.08,rhy:[4,3,0],mphr:[0,1,0,2],rev:1,dly:.5,leadType:'sine'},
 castle:{bpm:86,key:0,mode:'min',prog:[[36,'m'],[44,'M'],[46,'M'],[43,'M']],pad:.09,padCut:700,bass:'x.x.x.x.x.x.x.o.',arp:'0.2.1.2.0.2.1.3.',arpVol:.05,lead:.09,rhy:[3,0,5],mphr:[0,1,0,2],kick:'x.......x..x....',hat:'',rev:.8,dly:.4,leadType:'sawtooth'},
 battle:{bpm:158,key:4,mode:'min',prog:[[40,'m'],[36,'M'],[43,'M'],[38,'M']],pad:.05,padCut:1800,bass:'xxoxxoxxxxoxxoxx',arp:'0.1.2.1.0.1.2.1.',arpVol:.05,lead:.1,rhy:[6,0,1,5],mphr:[0,1,0,2],kick:'x...x...x...x...',snare:'....x.......x...',hat:'x.x.x.x.x.x.x.xx',rev:.35,dly:.2,leadType:'sawtooth'},
 boss:{bpm:166,key:2,mode:'min',prog:[[38,'m'],[34,'M'],[36,'M'],[33,'M']],pad:.06,padCut:2200,bass:'xxxxoxxxxxxxoxxx',arp:'0121232101212321',arpVol:.06,lead:.11,rhy:[6,5,0,1],mphr:[0,1,0,2],kick:'x..xx..xx..xx..x',snare:'....x.......x..x',hat:'xxxxxxxxxxxxxxxx',rev:.35,dly:.25,leadType:'sawtooth'},
 ending:{bpm:76,key:0,mode:'maj',prog:[[48,'M'],[45,'m'],[41,'M7'],[43,'sus']],pad:.12,padCut:1600,bass:'x.......x.......',arp:'0.1.2.3.2.1.0.1.',arpVol:.07,lead:.1,rhy:[4,0,1],mphr:[0,1,2,3],rev:.9,dly:.4,leadType:'triangle'}
};
function bgmInit(){
  if(BGM.ac)return BGM.ac;
  const ac=AC=AC||new (window.AudioContext||window.webkitAudioContext)();BGM.ac=ac;
  const master=ac.createGain();master.gain.value=BGM.muted?0:.55;
  const comp=ac.createDynamicsCompressor();comp.threshold.value=-20;comp.ratio.value=3.5;comp.attack.value=.008;comp.release.value=.22;
  master.connect(comp);comp.connect(ac.destination);
  const len=Math.floor(ac.sampleRate*2.4),buf=ac.createBuffer(2,len,ac.sampleRate);
  for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.8);}
  const conv=ac.createConvolver();conv.buffer=buf;const rg=ac.createGain();rg.gain.value=.34;conv.connect(rg);rg.connect(master);
  const dl=ac.createDelay(1.5);dl.delayTime.value=.375;const fb=ac.createGain();fb.gain.value=.34;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2600;
  const dg=ac.createGain();dg.gain.value=.26;dl.connect(lp);lp.connect(fb);fb.connect(dl);lp.connect(dg);dg.connect(master);
  const nl=ac.sampleRate,nb=ac.createBuffer(1,nl,ac.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nl;i++)nd[i]=Math.random()*2-1;
  Object.assign(BGM,{master,rev:conv,dly:dl,noise:nb});
  return ac;
}
function prng(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
// 1音: オシレータ(デチューン重ね) → ローパス(エンベロープ) → ゲイン(ADR) → bus
function voice(run,t,f,dur,o){
  const ac=BGM.ac,g=ac.createGain(),flt=ac.createBiquadFilter();
  flt.type='lowpass';flt.Q.value=o.q||.8;flt.frequency.setValueAtTime(o.cut||2400,t);
  if(o.cutEnd)flt.frequency.exponentialRampToValueAtTime(Math.max(60,o.cutEnd),t+dur);
  const A=o.a||.008,R=o.r||.15,v=o.vol||.1;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+A);g.gain.setTargetAtTime(.0001,t+dur,R/3);
  const dets=o.det||[0],oscs=[];
  for(const d of dets){const os=ac.createOscillator();os.type=o.type||'sawtooth';os.frequency.value=f;os.detune.value=d;os.connect(flt);os.start(t);os.stop(t+dur+R*2.2);oscs.push(os);}
  flt.connect(g);
  let out=g;if(o.pan&&ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=o.pan;g.connect(p);out=p;}
  out.connect(run.bus);
}
function drum(run,t,kind,vel){
  const ac=BGM.ac,g=ac.createGain();g.connect(run.dbus);
  if(kind==='k'){const o=ac.createOscillator();o.type='sine';o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(42,t+.13);
    g.gain.setValueAtTime(.55*vel,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(g);o.start(t);o.stop(t+.25);return;}
  const n=ac.createBufferSource();n.buffer=BGM.noise;const f=ac.createBiquadFilter();
  if(kind==='s'){f.type='bandpass';f.frequency.value=1800;f.Q.value=.7;g.gain.setValueAtTime(.32*vel,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);
    const o=ac.createOscillator();o.type='triangle';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(130,t+.09);const og=ac.createGain();og.gain.setValueAtTime(.2*vel,t);og.gain.exponentialRampToValueAtTime(.001,t+.1);o.connect(og);og.connect(run.dbus);o.start(t);o.stop(t+.12);}
  else{f.type='highpass';f.frequency.value=7000;g.gain.setValueAtTime(.12*vel,t);g.gain.exponentialRampToValueAtTime(.001,t+.045);}
  n.connect(f);f.connect(g);n.start(t,Math.random()*.5);n.stop(t+.2);
}
function melodyBar(T,bar,chord){
  const pcs=CT[chord[1]].map(i=>(chord[0]+i)%12),sc=MODE[T.mode].map(i=>(T.key+i)%12);
  const pool=[];for(let n=62;n<=91;n++)if(sc.includes(n%12))pool.push(n);
  const ph=T.mphr[bar%T.mphr.length],r=prng(T.bpm*131+T.key*977+ph*7919+(ph?bar%2:0));
  const tmpl=RHY[T.rhy[Math.floor(r()*T.rhy.length)]],ev=[];
  let idx=pool.findIndex(n=>pcs.includes(n%12)&&n>=72);if(idx<0)idx=Math.floor(pool.length/2);idx+=Math.floor(r()*4)-1;idx=Math.max(0,Math.min(pool.length-1,idx));
  tmpl.forEach(([st,len],i)=>{
    if(T.sparse&&r()<T.sparse)return;
    if(st%4===0&&i>0){let best=idx,bd=99;for(let k=0;k<pool.length;k++){if(pcs.includes(pool[k]%12)){const d=Math.abs(k-idx)+r()*1.5;if(d<bd){bd=d;best=k;}}}idx=best;}
    else if(i>0){idx+=(r()<.5?-1:1)*(r()<.7?1:2);}
    if(bar%4===3&&i===tmpl.length-1){let k=pool.findIndex(n=>n%12===chord[0]%12&&n>=70);if(k>=0)idx=k;}
    idx=Math.max(0,Math.min(pool.length-1,idx));
    ev.push([st,pool[idx],len]);
  });
  return ev;
}
function bgmStep(run,s,t){
  const T=run.T,bar=Math.floor(s/16),k=s%16,ch=T.prog[bar%T.prog.length],tones=CT[ch[1]],d16=60/T.bpm/4;
  const jt=()=>(Math.random()-.5)*.008;
  if(k===0){ // pad: 小節ごとにコード(3本デチューン)
    for(const iv of tones.slice(0,4))voice(run,t,mtof(ch[0]+12+iv),d16*16,{type:'sawtooth',vol:T.pad/tones.length*1.6,a:.5,r:.9,cut:T.padCut*.6,cutEnd:T.padCut,det:[-9,0,9],pan:(Math.random()-.5)*.8});
    run.mel=melodyBar(T,bar,ch);
  }
  const bp=T.bass[k];
  if(bp&&bp!=='.'){const n=ch[0]+(bp==='o'?12:bp==='5'?7:0);
    voice(run,t,mtof(n),d16*1.6,{type:'square',vol:.11,a:.005,r:.1,cut:420,cutEnd:260,q:1.4});voice(run,t,mtof(n-12),d16*1.8,{type:'sine',vol:.16,a:.01,r:.12,cut:300});}
  if(T.arp&&T.arpVol){const a=T.arp[k%T.arp.length];
    if(a&&a!=='.'){const i=+a,n=ch[0]+24+tones[i%tones.length]+(i>=tones.length?12:0);
      voice(run,t+jt(),mtof(n),d16*1.1,{type:'triangle',vol:T.arpVol,a:.003,r:.12,cut:3200,cutEnd:900,pan:(i%2?.35:-.35)});}}
  if(T.lead&&run.mel)for(const [st,n,len] of run.mel)if(st===k){
    const sw=T.sw?d16*T.sw:0;
    voice(run,t+sw+jt(),mtof(n),d16*len*.92,{type:T.leadType,vol:T.lead*(.85+Math.random()*.3),a:T.leadType==='sawtooth'?.012:.02,r:.18,cut:T.leadType==='sawtooth'?2600:4200,cutEnd:1400,det:T.leadType==='sawtooth'?[-7,7]:[0,4],pan:.15});}
  if(T.kick&&T.kick[k]==='x')drum(run,t,'k',k===0?1:.85);
  if(T.snare&&T.snare[k]==='x')drum(run,t,'s',1);
  if(T.hat&&T.hat[k]==='x')drum(run,t+(k%2?d16*(T.sw||0):0),'h',k%4===2?1:.6);
}
function bgmTick(){
  const run=BGM.run,ac=BGM.ac;if(!run||!ac||ac.state!=='running')return;
  const d16=60/run.T.bpm/4;
  if(run.t<ac.currentTime-.5)run.t=ac.currentTime+.05; // タブ復帰などで遅れたら詰める
  while(run.t<ac.currentTime+.18){bgmStep(run,run.step,run.t);run.t+=d16;run.step++;}
}
function bgmStart(name){
  const T=THEMES[name];if(!T)return;const ac=bgmInit(),now=ac.currentTime;
  const old=BGM.run;
  if(old){old.fade.gain.cancelScheduledValues(now);old.fade.gain.setValueAtTime(old.fade.gain.value,now);old.fade.gain.linearRampToValueAtTime(0,now+.9);
    setTimeout(()=>{try{old.fade.disconnect();old.bus.disconnect();old.dbus.disconnect();}catch(e){}},2500);}
  const run={name,T,step:0,t:now+.06,mel:null};
  run.fade=ac.createGain();run.fade.gain.setValueAtTime(.0001,now);run.fade.gain.linearRampToValueAtTime(1,now+1.4);run.fade.connect(BGM.master);
  run.bus=ac.createGain();run.bus.connect(run.fade);
  const sr=ac.createGain();sr.gain.value=T.rev;run.bus.connect(sr);sr.connect(BGM.rev);
  const sd=ac.createGain();sd.gain.value=T.dly;run.bus.connect(sd);sd.connect(BGM.dly);
  run.dbus=ac.createGain();run.dbus.connect(run.fade);
  BGM.run=run;
  if(!BGM.timer)BGM.timer=setInterval(bgmTick,25);
}
function bgmSet(name){
  BGM.want=name;
  if(!BGM.ac||BGM.ac.state!=='running')return; // 初回タップまで待つ
  if(!BGM.run||BGM.run.name!==name)bgmStart(name);
}
function bgmTheme(){
  try{
    if(G.mode==='title')return 'title';
    if(G.mode==='battle')return (typeof foe!=='undefined'&&foe&&foe.m&&foe.m.boss)?'boss':'battle';
    if(G.mode==='select')return 'select';
    if(G.mode==='card')return (G.card==='FIN'||G.card==='おしまい')?'ending':null;
    if(G.mode==='map'&&G.map){const m=G.map;
      if(m.id==='world')return 'world';if(m.id==='castle')return 'castle';
      if(m.kind==='village')return 'village';if(/^shrine/.test(m.id))return 'shrine';
      if(m.kind==='cave')return 'cave';return 'village';}
  }catch(e){}
  return null;
}
function bgmSetMute(m){
  BGM.muted=m;try{localStorage.setItem('dq_mute',m?'1':'0');}catch(e){}
  if(BGM.master)BGM.master.gain.setTargetAtTime(m?0:.55,BGM.ac.currentTime,.08);
  const b=document.getElementById('mute');if(b)b.textContent=m?'🔇':'🔊';
}
function bgmUnlock(){
  try{const ac=bgmInit();
    const go=()=>{const w=bgmTheme()||BGM.want;if(w){BGM.want=w;if(!BGM.run||BGM.run.name!==w)bgmStart(w);}};
    if(ac.state!=='running')ac.resume().then(go).catch(()=>{});else go();}catch(e){}
}

// ---- 環境音レイヤー: 風・小鳥・波/カモメ・虫・水滴・地鳴り(BGMの下に小さく重ねる) ----
const AMB={cur:null,kind:null};
function ambKind(){
  try{if(G.mode!=='map'||!G.map)return null;const m=G.map;
    if(m.id==='world')return worldZone(G.px,G.py)===4?'waste':'field';
    if(m.id==='castle')return 'castle';if(m.id==='v2')return 'harbor';if(m.id==='v4')return 'night';
    if(m.kind==='village')return 'village';if(/^shrine/.test(m.id))return 'shrine';if(m.kind==='cave')return 'cave';}catch(e){}
  return null;
}
function ambNoise(a,dest,type,freq,q,vol,lfoHz,lfoDepth){
  const n=a.createBufferSource();n.buffer=BGM.noise;n.loop=true;
  const f=a.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;
  const g=a.createGain();g.gain.value=vol;
  n.connect(f);f.connect(g);g.connect(dest);n.start(0,Math.random());
  const srcs=[n];
  if(lfoHz){const l=a.createOscillator();l.frequency.value=lfoHz;const lg=a.createGain();lg.gain.value=lfoDepth;l.connect(lg);lg.connect(g.gain);l.start();srcs.push(l);}
  return srcs;
}
function ambSet(kind){
  if(AMB.kind===kind)return;
  const ac=BGM.ac;if(!ac||ac.state!=='running'||!BGM.noise)return;
  AMB.kind=kind;const old=AMB.cur,now=ac.currentTime;
  if(old){old.g.gain.cancelScheduledValues(now);old.g.gain.setValueAtTime(old.g.gain.value,now);old.g.gain.linearRampToValueAtTime(0,now+1.2);
    setTimeout(()=>{try{old.srcs.forEach(s=>s.stop());old.g.disconnect();}catch(e){}},1600);}
  AMB.cur=null;if(!kind)return;
  const g=ac.createGain();g.gain.setValueAtTime(.0001,now);g.gain.linearRampToValueAtTime(1,now+2);g.connect(BGM.master);
  let srcs=[];
  const wind=(v,f,q)=>srcs.push(...ambNoise(ac,g,'bandpass',f,q,v,.09+Math.random()*.06,v*.7));
  if(kind==='field'||kind==='village'){wind(.05,500,.6);}
  if(kind==='harbor'){wind(.03,550,.6);srcs.push(...ambNoise(ac,g,'lowpass',650,.4,.06,.13,.045));}
  if(kind==='waste'){wind(.09,380,.5);}
  if(kind==='night'){wind(.04,420,.6);}
  if(kind==='shrine'){wind(.025,600,.7);}
  if(kind==='cave'){srcs.push(...ambNoise(ac,g,'lowpass',120,.5,.07,.05,.025));}
  if(kind==='castle'){srcs.push(...ambNoise(ac,g,'lowpass',140,.5,.08,.04,.03));wind(.03,300,.5);}
  AMB.cur={g,srcs,next:now+1.5};
}
function ambEvent(a,cur,now){
  const k=AMB.kind,g=cur.g,pan=(Math.random()-.5)*1.4;
  const tone=(t,type,f0,f1,dur,vol,pn)=>{const o=a.createOscillator(),e=a.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur*.8);
    e.gain.setValueAtTime(.0001,t);e.gain.linearRampToValueAtTime(vol,t+dur*.2);e.gain.exponentialRampToValueAtTime(.0001,t+dur);
    let out=e;if(a.createStereoPanner){const p=a.createStereoPanner();p.pan.value=pn;e.connect(p);out=p;}
    o.connect(e);out.connect(g);if(BGM.rev){const s=a.createGain();s.gain.value=.5;out.connect(s);s.connect(BGM.rev);}o.start(t);o.stop(t+dur+.05);};
  if(k==='field'||k==='village'){const f=2300+Math.random()*1700,n=2+Math.floor(Math.random()*3);for(let i=0;i<n;i++)tone(now+i*.12,'sine',f*(1+i*.05),f*1.45,.09,.028,pan);cur.next=now+3+Math.random()*8;}
  else if(k==='harbor'){if(Math.random()<.6){tone(now,'sawtooth',1100,1500,.22,.012,pan);tone(now+.24,'sawtooth',1500,800,.34,.012,pan);}else{const f=2600+Math.random()*1200;tone(now,'sine',f,f*1.4,.09,.025,pan);}cur.next=now+4+Math.random()*9;}
  else if(k==='night'||k==='shrine'){const f=4100+Math.random()*700;for(let i=0;i<5;i++)tone(now+i*.07,'sine',f,f*1.01,.045,.011,pan);cur.next=now+.8+Math.random()*1.6;}
  else if(k==='cave'){tone(now,'sine',1500,650,.16,.03,pan);cur.next=now+1.6+Math.random()*4.5;}
  else cur.next=now+6;
}
function ambTick(){
  const ac=BGM.ac,cur=AMB.cur;if(!ac||!cur||ac.state!=='running')return;
  if(ac.currentTime>=cur.next)ambEvent(ac,cur,ac.currentTime+.02);
}
(function(){
  ['pointerdown','touchend','keydown','click'].forEach(ev=>window.addEventListener(ev,bgmUnlock,{passive:true}));
  window.addEventListener('keydown',e=>{if(e.key==='m'||e.key==='M')bgmSetMute(!BGM.muted);});
  document.addEventListener('visibilitychange',()=>{try{if(!BGM.ac)return;if(document.hidden)BGM.ac.suspend();else BGM.ac.resume();}catch(e){}});
  setInterval(()=>{const w=bgmTheme();if(w)bgmSet(w);ambSet(ambKind());},250);setInterval(ambTick,120);
  const b=document.getElementById('mute');
  if(b){b.textContent=BGM.muted?'🔇':'🔊';b.addEventListener('pointerdown',e=>{e.stopPropagation();bgmSetMute(!BGM.muted);},{passive:true});}
})();
