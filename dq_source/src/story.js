'use strict';
// ===== story: 7 viewpoints, NPCs, quests, shops, endings =====
const GR={hp:6,mp:2,atk:2,def:2};
const CHARS={
  hero:{name:'ゆうしゃ',label:'ゆうしゃ',spr:'hero',lv:1,hp:24,mp:6,atk:9,def:4,wp:3,wpn:'こんぼう',ar:0,arn:'ぬののふく',gold:20,items:{'やくそう':2},map:'v1',x:4,y:5,
    spells:[{n:'いやしび',mp:2,t:'heal',p:25,lv:1},{n:'ひのこ',mp:3,t:'atk',p:22,lv:3},{n:'おおいやしび',mp:6,t:'heal',p:80,lv:9},{n:'いかずち',mp:10,t:'atk',p:120,lv:15}],
    title:'だい1しょう　ゆうしゃの ものがたり',intro:['ゆうしゃよ、おきなさい。\nきょうは だいじな ひ。そんちょうさまが およびですよ。'],
    end:['まおうは くだけちり、せかいに ひかりが もどった。','ゆうしゃの なは しろの かべにも、むらの うたにも のこるだろう。','――めでたし、めでたし。','しかし。','むらの かたすみで、だれかが ふと つぶやいた。','「ところで……これは、だれの ものがたり だったのかな？」']},
  vb:{name:'むらびとB',label:'むらびとB',spr:'vb',lv:6,hp:70,mp:14,atk:22,def:14,wp:6,wpn:'くわ',ar:3,arn:'のらぎ',gold:80,items:{'やくそう':3},map:'v1',x:12,y:5,
    spells:[{n:'かあちゃんの はげまし',mp:3,t:'heal',p:40,lv:1},{n:'どろだんご',mp:2,t:'atk',p:20,lv:1}],
    title:'だい2しょう　むらびとBの ものがたり',intro:['ぼくは はじまりの村の むらびとB。\nなまえは ない。\nゆうしゃが たびだった あと、みなと村の むすめが ねつを だしたと ふみが とどいた。','……ゆうしゃのように つよくは ない。でも、ぼくにも まもりたい ものが ある。'],
    end:['むすめの ねつは すっかり さがった。','「パパ、きてくれたの？」\n「あたりまえだ。ゆうしゃより いそいできたぞ」','せかいを すくう ひとが いれば、その うらで ちいさな せかいを まもる ひとも いる。','それも また、りっぱな ゆうしゃ だった。']},
  mayor:{name:'そんちょう',label:'そんちょう',spr:'mayor',lv:7,hp:80,mp:30,atk:20,def:16,wp:4,wpn:'つえ',ar:4,arn:'むらのほうい',gold:300,items:{'やくそう':3},map:'v1',x:19,y:5,
    spells:[{n:'いやしび',mp:4,t:'heal',p:40,lv:1},{n:'ありがたい おはなし',mp:3,t:'stun',pr:8,lv:1},{n:'そんちょうの いかり',mp:6,t:'atk',p:40,lv:1}],
    title:'だい3しょう　そんちょうの ものがたり',intro:['わしは はじまりの村の そんちょう。\nゆうしゃを おくりだした いま、わすれては ならぬ ことを おもいだした。','ゆうしゃの ちちに わたす はずだった『ちかいの手紙』を、ねむりの洞窟に かくしたまま じゃった……！\nまずは はじまりの祠で ひとに あっておこう。'],
    end:['てがみには こう かかれていた。','「わが子よ。おまえが たびに でる ひ、わたしは もう そばに いないだろう。\nだが おまえの ゆうきは、わたしの ほこりだ」','そんちょうは てがみを だきしめ、あさひの さす そらを みあげた。','「……ちゃんと、わたせたぞ。」']},
  minister:{name:'だいじん',label:'だいじん',spr:'minister',lv:16,hp:160,mp:70,atk:40,def:34,wp:18,wpn:'ペーパーナイフ',ar:14,arn:'ぎょうせいふく',gold:1500,items:{'やくそう':5},map:'v3',x:7,y:5,
    spells:[{n:'おせじ',mp:3,t:'stun',pr:9,lv:1},{n:'ばっさい',mp:8,t:'atk',p:55,lv:1},{n:'こうしょう',mp:8,t:'heal',p:70,lv:1}],
    title:'だい4しょう　だいじんの ものがたり',intro:['わしは この国の だいじん。\nゆうしゃを おくりだして ほっとした ところで、ひきだしから 一まいの しょるいが でてきた。','『まおうとの ふかしんじょうやく』……はんこが まだ おされていない！\nやみの村の むこう、まおう城まで とどけねば、せきにんもんだいだ！'],
    end:['まおうは はんこを たしかめると、ふかぶかと うなずいた。','「たしかに。では ひとつ、おちゃでも」\n「いえ、わしは これで しつれい……」','かえりみち、だいじんは そっと つぶやいた。','「……ゆうしゃに ばれる まえに、かえらねば」']},
  hermit:{name:'ほこらの人',label:'ほこらで まつ人',spr:'hermit',lv:12,hp:130,mp:80,atk:28,def:24,wp:6,wpn:'ひのきのつえ',ar:6,arn:'ほこらのころも',gold:100,items:{'やくそう':3,'げんきの玉':1},map:'shrine1',x:6,y:5,
    spells:[{n:'いのり',mp:5,t:'heal',p:90,lv:1},{n:'かみなり',mp:9,t:'atk',p:90,lv:1},{n:'ひゃくねんの ちから',mp:16,t:'atk',p:160,lv:1}],
    title:'だい5しょう　ほこらで まつ人の ものがたり',intro:['ひゃくねん。ひゃくねん、ここで ゆうしゃを まった。\nそして いま、ゆうしゃは たびだち、わしの やくめは おわった。','……ふと おもった。\nわしは、むらの やどやで ひとばん だって あたたかい ごはんを たべたことが ない。','よし。いってみよう。はじめての、さんぽじゃ。'],
    end:['やどやの スープは ほんの すこし しおからく、あたたかかった。','「ひゃくねんで いちばん うまい」\nやどの あるじは なぜか なみだぐんだ。','ほこらの ひとは、その よる はじめて ふとんで ねむった。\nゆめの なかで、ゆうしゃが てを ふっていた。']},
  gal:{name:'ギャル',label:'ぴちぴちギャル',spr:'gal',lv:16,hp:150,mp:60,atk:42,def:34,wp:12,wpn:'ネイルチップ',ar:10,arn:'ミニスカ',gold:1500,items:{'やくそう':5},map:'v2',x:12,y:5,
    spells:[{n:'ウインク',mp:2,t:'stun',pr:9,lv:1},{n:'ギャルパンチ',mp:5,t:'atk',p:70,lv:1},{n:'ハートビーム',mp:7,t:'heal',p:80,lv:1}],
    title:'だい6しょう　ぴちぴちギャルの ものがたり',intro:['やっほー！ あたし、みなと村の ぴちぴちギャル！\nきいた？ ヨイヤミの村で『ぜんこくファッションショー』が あるんだって！','ゆうしゃが まおうと たたかってる あいだに、あたしは ショーに でるっ！\nせかいの へいわ？ もちろん、おしゃれで まもるっしょ！'],
    end:['ステージに たった ギャルの ウインクに、かいじょうは どっと わいた。','「ゆうしょうは、ミナトむらの ギャルちゃん！」','しょうひんは きらきらリボン と ごうかな ぬいぐるみ。\nそして なぜか、さいごの ばんしゃくは まおうの ふぁんクラブ からの おくりもの だった。','「ま、まおう……？ ――まあ いっか！」']},
  rogue:{name:'ごろつき',label:'ろうやの ごろつき',spr:'rogue',lv:15,hp:140,mp:30,atk:48,def:30,wp:14,wpn:'ぬすんだ ナイフ',ar:10,arn:'ぼろコート',gold:400,items:{'やくそう':4},map:'v3',x:22,y:4,
    spells:[{n:'ぬすむ',mp:0,t:'steal',lv:1},{n:'ナイフなげ',mp:4,t:'atk',p:60,lv:1},{n:'ひきょうな こうげき',mp:8,t:'atk',p:100,lv:1}],
    title:'だい7しょう　ろうやの ごろつきの ものがたり',intro:['ちっ……また ろうやか。\nだが ほのおの洞窟に かくした おたからが ある。ここで くさってる ひまは ねえ。','まずは あの ねぼけた かんしゅから カギを かっぱらうか。'],
    end:['ごろつきは ほこらの ひとに たからを さしだした。','「……それは、ゆうしゃの ためじゃ。おまえが さいごに すくうのは、おまえ自身じゃ」','「けっ。しらねえよ」\nそう いいながら、ごろつきは ほこらを あとにした。','その あしどりは、なぜか すこしだけ かるかった。']}
};
CHARS.cat={name:'ミケ',label:'？？？ もう１つの にゃん生 ？？？',spr:'cat_mike',lv:12,hp:110,mp:40,atk:34,def:26,wp:10,wpn:'するどい ツメ',ar:6,arn:'あかい くびわ',gold:0,items:{'やくそう':2},map:'v2',x:15,y:10,
  spells:[{n:'ごろごろ',mp:3,t:'heal',p:60,lv:1},{n:'ねこパンチ',mp:3,t:'atk',p:45,lv:1},{n:'にゃーおん',mp:5,t:'stun',pr:9,lv:1}],
  title:'さいしゅうしょう　？？？　もう１つの にゃん生　？？？',
  intro:['……にゃあ。','わたしは ミケ。みなと村に すむ、のらねこ。\nにんげんたちの ものがたりは どれも おもしろかった。でも だれも、ねこの はなしは きいてくれない。','きいたわ。みなと村の つりたいかいで、いちばん おおきな さかなが うみ神さまに ささげられるって。','……ささげる？ ばかね。さかなは ねこが たべる ものよ。','こうして ミケは、せかいを ゆるがす（かもしれない）\n『さかな ごうだつ けいかく』を たてたのだった。','まずは なかまあつめ。はじまりの村、みなと村、たかね村、ヨイヤミの村。\nどの まちにも ひとりずつ、くせの つよい ねこが いるはず。'],
  end:['うみ神さまの ぞうの まえに、かつて ない ごちそうが ならんだ。','……ただし たべたのは、ねこたち。','「うまい！」「うまいわ！」「……ふ、にゃ」\nクロも トラも シロも ヤミも、おなかを まるくして ねむった。','かんりにんは からっぽの たいを みつめて つぶやいた。\n「……うみ神さま、ことしは ねこの かたで いらっしゃったか」','みなと村の ひとびとは なぜか なっとくした。\nそして ミケは ひなたで まるくなり、ちいさく あくびを した。','「にゃあ。……これも、ねこの ものがたり」']};
const ORDER=['hero','vb','mayor','minister','hermit','gal','rogue'];
const NPCS=[];
const npc=(id,map,x,y,spr,talk,show,dir)=>NPCS.push({id,map,x,y,spr,talk,show,dir:dir||0});
const L=(name,...lines)=>async()=>{for(const s of lines)await say(s,name);};
const isStory=(...ids)=>ids.includes(G.story);
const gateOpen=n=>!!G.f['b'+n];

// ---- helpers: inn / shop / chest ----
async function inn(price){
  await say((GREET.inn[G.story]||'ようこそ やどやへ！')+`\nひとばん ${price}ゴールドですが おとまりに なりますか？`,'やどや');
  const i=await choose(['はい','いいえ'],{x:300,y:130,w:130});
  if(i!==0){await say('また おこしください。','やどや');return;}
  if(G.gold<price){await say('おや、おかねが たりないようですね……','やどや');return;}
  G.gold-=price;await fade(1,500);G.pc.hp=G.pc.mhp;G.pc.mp=G.pc.mmp;sfx('heal');await sleep(500);
  if(typeof phaseNow==='function'){G.clock=(dayCycle()+(phaseNow()===0?0:1))*PH_LEN*3;G.lastPh=0;G.banner={text:'あさに なった！',t:110};}   // 泊まったら朝にリセット
  await fade(0,500);
  const AFTER={
    v1:['あさですよ、おきゃくさん。\nからだは かるく なりましたか？','おはようございます！\nあたたかい スープが ありますよ。','よく ねむれたようで なによりです。\nきょうも いい いちにちを！'],
    v2:['うみの かおりで めが さめたでしょう？\nさあ、きょうも なみに のって いきましょう！','かもめの こえが きこえますか。\nいい あさですよ！','しおかぜが きもちいい あさですね。\nいってらっしゃいませ。'],
    v3:['やまの くうきが おいしい あさです。\nぐっすり やすめましたか？','さむく ありませんでしたか？\nたかねの あさは ひえますよ。','ゆきどけみずで いれた おちゃを どうぞ。\nげんきが でますよ。'],
    v4:['……ヨイヤミの むらにも あさは きます。\nさあ、ひかりを あびて いきなさい。','かげたちも ぐっすり ねむって いましたよ。\nいい ゆめを みましたか？','ともしびは きえずに のこって います。\nどうか おきを つけて。']
  };
  const mid=(G.map&&G.map.id)||'v1';
  const L=AFTER[mid]||AFTER.v1;
  await say(L[rnd(L.length)],'やどや');
}
async function shop(stock){
  await say(GREET.shop[G.story]||'いらっしゃい！ なにを おさがしで？','みせ');
  while(true){
    const opts=stock.map(s=>`${s.n}  ${s.price}G`).concat(['やめる']);
    const i=await choose(opts,{x:150,y:60,title:`もちぶん ${G.gold}G`,cancel:1});
    if(i<0||i>=stock.length){await say('まいどあり！ また きてね！','みせ');return;}
    const s=stock[i];
    if(G.gold<s.price){await say('おかねが たりないよ。','みせ');continue;}
    const pc=G.pc;
    if(s.t==='wp'&&s.v<=pc.wp){await say('いまの ぶきの ほうが つよいよ。','みせ');continue;}
    if(s.t==='ar'&&s.v<=pc.ar){await say('いまの ぼうぐの ほうが かたいよ。','みせ');continue;}
    G.gold-=s.price;sfx('buy');
    if(s.t==='item'){pc.items[s.n]=(pc.items[s.n]||0)+1;await say(`${s.n}を てにいれた！`);}
    else if(s.t==='wp'){pc.wp=s.v;pc.wpn=s.n;await say(`${s.n}を そうびした！\nこうげきりょくが あがった！`);}
    else{pc.ar=s.v;pc.arn=s.n;await say(`${s.n}を そうびした！\nしゅびりょくが あがった！`);}
  }
}
const HERB={n:'やくそう',price:10,t:'item'};
const STOCK={
  v1:[HERB,{n:'ぬののふく',price:40,t:'ar',v:3},{n:'あかがねの けん',price:120,t:'wp',v:9}],
  v2:[HERB,{n:'てつのよろい',price:280,t:'ar',v:10},{n:'くろがねの けん',price:400,t:'wp',v:16}],
  v3:[HERB,{n:'ミスリルのたて',price:700,t:'ar',v:16},{n:'ほのおのけん',price:900,t:'wp',v:24}],
  v4:[HERB,{n:'まもりのよろい',price:1500,t:'ar',v:24},{n:'せいなるつるぎ',price:2000,t:'wp',v:34}]
};
async function openChest(c){
  if(G.f[c.id]){await say('からっぽだ。');return;}
  { const m=G.map;sfx('chest');m.g[c.y][c.x]='U';G.fx.push({k:'spark',x:c.x,y:c.y,t:0});await sleep(480); }
  G.f[c.id]=1;refreshMap();
  if(c.id==='c1b'&&G.story==='mayor'){G.f.letter=1;await say('はこの おくに ふるびた ふうとうが ある！\nそんちょうは『ちかいの手紙』を てにいれた！');await finishStory();return;}
  if(c.id==='c3b'&&G.story==='rogue'){G.f.loot=1;await say('へへっ、あった あった！\nぬすんだ たからだ。……ずっしり おもい。\n『げんきの玉』も はいっている！');G.pc.items['げんきの玉']=(G.pc.items['げんきの玉']||0)+1;return;}
  if(c.item){G.pc.items[c.item]=(G.pc.items[c.item]||0)+1;await say(`たからばこを あけた！\n${c.item}を てにいれた！`);}
  else{const g=c.g||20;G.gold+=g;await say(`たからばこを あけた！\n${g}ゴールドを みつけた！`);}
}

// ---- NPC definitions ----
// world gate guards
[[9,19,1,'ねむりの洞窟の プルンキングを たおした ものだけ とおそう！'],[31,9,2,'こだまの洞窟の ほねおやぶんを たおさぬ かぎり、ここは とおせん！'],[40,19,3,'ほのおの洞窟の ドラゴンを たおした ゆうしゃ以外、とおれぬ！']].forEach(([x,y,n,t])=>
  npc('gate'+n,'world',x,y,'guard',L('かんもんの へいし','ここは かんもんだ。まものが おおくて あぶない。',t),()=>!gateOpen(n),1));
// v1
npc('mom','v1',5,4,'woman',async()=>{
  if(isStory('hero')&&!G.f.mom1){G.f.mom1=1;await say('おはよう。きょうは そんちょうさまが よんでいたわ。\nこれ、もっていきなさい。','おかあさん');G.gold+=20;await say('20ゴールドを もらった！');}
  else if(isStory('hero'))await say('きをつけて いってらっしゃい。ちゃんと やどやで やすむのよ。','おかあさん');
  else await say('うちの こは まおうを たおしに いったわ……どうか ぶじで。','ゆうしゃの はは');});
npc('wifeB','v1',13,4,'woman',async()=>{
  if(isStory('vb')){
    if(!G.f.med){G.f.med=1;G.pc.items['せんじぐすり']=1;await say('あなた、みなと村の むすめが ねつを だしたって……！\nこの せんじぐすりを とどけてあげて！\nきけんな みちだけど、あなたなら きっと だいじょうぶ。','つま');await say('せんじぐすりを てにいれた！');}
    else await say('むすめを おねがいね、あなた。','つま');
  }else await say('うちの ひとは むらの はたけで はたらく まじめな ひとなの。','むらびとの つま');});
npc('mayor','v1',19,4,'mayor',async()=>{
  if(isStory('hero')){
    if(!G.f.mayor1){G.f.mayor1=1;
      await sayAll(['おお、ゆうしゃよ！ よくぞ きた！','ふたたび まおうが めざめた。せかいは やみに つつまれようと している。','おまえの ちちも かつて ここから たびだった……。','まずは むらの きたにしの『はじまりの祠』を おとずれなさい。そこに おまえを まつ ひとが おる。','これは ささやかな ししゅつ金じゃ。うけとってくれ。'],'そんちょう');
      G.gold+=60;await say('60ゴールドを もらった！');}
    else await say('まおうを たおすまで かえってくるな……とは いわぬ。\nむりは するでないぞ。','そんちょう');
  }else await say('いまは ゆうしゃの かえりを まつだけ じゃ。','そんちょう');},()=>!isStory('mayor'));
npc('inn1','v1',7,14,'inn',async()=>{
  if(isStory('hermit')){
    await sayAll(['おや、ほこらの ごろうにんじゃ ありませんか！','ひとばんは とまらず、ただ いっぱい スープを どうぞ。','……ずず……。'],'やどや');await finishStory();
  }else await inn(5);});
npc('shop1','v1',17,14,'shop',()=>shop(STOCK.v1));
npc('v1a','v1',8,9,'man',L('むらびと','ゆうしゃが たびに でたって？ このむらも さびしく なるな。'));
npc('v1b','v1',15,9,'girl',L('おんなのこ','ひだりの いえが ゆうしゃの いえ なんだよ！\nかっこいいでしょ！'));
npc('v1c','v1',12,11,'old',L('ろうじん','むかし、ゆうしゃの ちちは ほこらで ある ひとに あったそうな……。'));
// v2
npc('daughter','v2',4,4,'girl',async()=>{
  if(isStory('vb')){
    if(G.pc.items['せんじぐすり']){G.pc.items['せんじぐすり']=0;await sayAll(['……パパ？ ほんとうに パパなの……？','ごほっ。……あ、にがい。でも、あたたかい。','もう だいじょうぶ。パパが きて くれたから。'],'むすめ');await finishStory();}
    else await say('こほっ……パパ、まだ かな……。','むすめ');
  }else await say('こほっ……ゆうしゃさま、がんばって……。','ねつの むすめ');});
npc('motherB','v2',6,5,'woman',L('むすめの ははおや','ひとり おやの わたしには、この こが ぜんぶ なんです……。'),()=>true);
npc('galmom','v2',13,4,'woman',async()=>{
  if(isStory('gal'))await say('ヨイヤミの むらは あぶないから きをつけるのよ！\nあと ちゃんと ごはんは たべなさいね！','ギャルの ママ');
  else await say('うちの むすめは いつも げんきで……。\nきょうは ちょうど ヨイヤミの ファッションショーの ことで はしゃいでたわ。','ギャルの ママ');});
npc('inn2','v2',7,14,'inn',()=>inn(15));
npc('shop2','v2',14,14,'shop',()=>shop(STOCK.v2));
npc('fisher','v2',19,10,'man2',L('つりびと','みなと村の さかなは いいぞ。ここから ほのおの洞窟の ほうまで、かわが つながって いるらしい。'));
npc('v2a','v2',8,10,'boy',L('おとこのこ','ゆうしゃさまは すごいなあ。ぼくも おおきく なったら ふねに のるんだ！'));
npc('v2b','v2',14,9,'old',L('ろうじん','こだまの洞窟の ほねおやぶんは つよい。いやしびを わすれずにの。'));
// v3
npc('minister','v3',7,4,'minister',async()=>{
  if(isStory('hero')){
    await sayAll(['ようこそ、ゆうしゃどの！ わしは この国の だいじん。','まおう城は ここから 南東、ヨイヤミの村の さらに むこうじゃ。','ここへ くるまでに ずいぶん きたえられた ようじゃな。','……ところで、ゆうしゃどの。\nわしは あしたも しごとが あるので、おみおくりは ここまで と させて もらう。'],'だいじん');
  }else await say('……。','だいじん');},()=>isStory('hero'));
npc('rogueCell','v3',21,4,'rogue',async()=>{
  if(isStory('hero')){
    await sayAll(['へっ、ゆうしゃさまかい。りっぱな かおを してやがる。','ここから だしてくれりゃ いいことを おしえて やるぜ？……ダメか。','ほのおの洞窟の ドラゴンは ３ターンごとに ごうかの ほのおを はく。そのターンは いのちがけで ふせげ。\nけっ、ひとりごとだ。'],'ごろつき');
  }else await say('……。','ごろつき');},()=>isStory('hero')||(!isStory('rogue')));
npc('guardJail','v3',19,5,'guard',async()=>{
  if(isStory('rogue')&&!G.f.cellOpen){
    const i=await choose(['カギを ぬすむ','しばらく ようすを みる'],{x:140,y:130,w:300});
    if(i===0){await sayAll(['そーっと……そーっと……','(かんしゅは ぐうすか ねている！ こしの カギを そっと ぬきとった！)','カチャリ。ろうやの とびらが ひらいた！'],'ごろつき');G.f.cellOpen=1;G.f.key=1;sfx('open');refreshMap();}
    else await say('ぐぅー……ぐぅー……','かんしゅ');
  }else if(isStory('rogue'))await say('ぐぅー……むにゃ、ゆうしゃ さま……。','かんしゅ');
  else await say('ぐぅー……。このろうやは あんぜんで ございます……むにゃ。','かんしゅ');});
npc('inn3','v3',7,15,'inn',()=>inn(30));
npc('shop3','v3',16,15,'shop',()=>shop(STOCK.v3));
npc('maid','v3',4,5,'woman',L('メイド','だいじんさまの おへやに ある しょるいの やまが すごくて……。'));
npc('v3a','v3',9,11,'man',L('むらびと','ほのおの洞窟は あつい。ほのおの けんが ないと きびしいぞ。'));
npc('v3b','v3',13,13,'girl',L('おんなのこ','ろうやの おじさん、ときどき ひとりごとで『おたからが…』って いってるの。'));
// v4
npc('boutique','v4',5,5,'woman',async()=>{
  if(isStory('gal')){
    if(!G.f.ribbon){G.f.ribbon=1;await sayAll(['あら、ミナト村の ギャルちゃん！ まってたわよ！','これが ショーに でるための『きらきらリボン』。','ステージは ちゅうおうの あかい カーペットの うえ。モデルさんに はなしかけてね！'],'ブティックの てんしゅ');await say('きらきらリボンを てにいれた！');}
    else await say('ステージで かがやいてね！','ブティックの てんしゅ');
  }else await say('いらっしゃい。やみの むらでも おしゃれは だいじ よ。','ブティックの てんしゅ');});
npc('inn4','v4',16,6,'inn',()=>inn(50));
npc('shop4','v4',17,15,'shop',()=>shop(STOCK.v4));
npc('elder4','v4',6,15,'old',async()=>{
  await say(isStory('hero')?'まおうは ふかい ふかい おくに いる。ここで ととのえて いきなさい。なにしろ、ほれ、ふくそう というものが ある。':'むかし まおうは やみの ひとを まもる ために ちからを つけたと いわれておる……。','むらの ちょうろう');});
npc('model','v4',11,15,'woman',async()=>{
  if(isStory('gal')){
    if(!G.f.ribbon){await say('まずは ブティックで リボンを うけとってね！','モデル');return;}
    await sayAll(['いよいよ ほんばんよ！','――ステージの あかい カーペットに ギャルが たつ。','――ライトが ついた！ ウインクが きらり！\nかんきゃくが どよめいた！'],'モデル');
    await finishStory();
  }else await say('ここが ショーの ステージ。あした から よ！','モデル');});
npc('v4a','v4',6,11,'man',L('むらびと','まおう城は ひがしの すぐそば。ひかりが とどかない むらだから、せめて リボンで あかるく してる。'));
npc('v4b','v4',20,11,'boy',L('おとこのこ','まおうの おしろ、よる ひとりで わらってるって、きいた。'));
// shrines
npc('hermit1','shrine1',6,3,'hermit',async()=>{
  if(isStory('hero')){
    if(!G.f.hermit1){G.f.hermit1=1;await sayAll(['……よくぞ きた、ゆうしゃよ。わしは ひゃくねん この ほこらで おまえを まっておった。','みなみの ねむりの洞窟に プルンキングが すみついた。やつを たおせ。さすれば さきへ すすむ みちが ひらかれる。','これを もって ゆけ。ちちが のこした ひのきの つるぎ じゃ。'],'ほこらの 人');G.pc.wp=9;G.pc.wpn='ひのきのつるぎ';await say('ひのきの つるぎを てにいれた！\nこうげきりょくが あがった！');}
    else await say('たびは まだ はじまったばかり。しっかり やすむ のじゃ。','ほこらの 人');
  }else if(isStory('mayor')){G.f.hermit1m=1;await sayAll(['おお そんちょう どの。『ちかいの手紙』なら、ねむりの洞窟の おくに あると きいた ことが ある。','ひだり うえの いきどまりの たからばこ かもしれぬ。'],'ほこらの 人');}
  else if(isStory('hermit'))await say('……わしは ここに もう いない。はやく むらへ いこう。','');
  else await say('……ようこそ ほこらへ。','ほこらの 人');},()=>!isStory('hermit'));
npc('hermit2','shrine2',6,3,'granny',async()=>{
  if(isStory('hero')){
    if(!G.f.hermit2){G.f.hermit2=1;await sayAll(['まあ、よく きなすった。つきのしずくが ひかる いいよるじゃ。','こだまの洞窟の ほねおやぶんは かたい。ほねの つるぎで こうげきが つよいから ふせぐ ときは しっかりと。','これは むかし しなだいが わすれて いった てつの よろいじゃ。もってゆき。'],'ほこらの ばあさん');G.pc.ar=Math.max(G.pc.ar,8);G.pc.arn='てつのよろい';await say('てつの よろいを てにいれた！\nしゅびりょくが あがった！');}
    else await say('きばらずに いきなされ。ほねおやぶんの おかげで みちが ふさがって おる。','ほこらの ばあさん');
  }else await say('ふむ。いい つきじゃ。','ほこらの ばあさん');});
npc('hermit3','shrine3',6,3,'hermit',async()=>{
  if(isStory('hero')){
    if(!G.f.hermit3){G.f.hermit3=1;await sayAll(['ほしの みちびきが おまえを ここへ つれてきた。','ほのおの洞窟の ドラゴンは ごうかの ほのおを はく。じゅうぶんに かいふくして いどめ。','ほしの たてを さずけよう。まおうとの たたかいに やくだつじゃろう。'],'ほこらの 人');G.pc.ar=Math.max(G.pc.ar,16);G.pc.arn='ほしのたて';await say('ほしの たてを てにいれた！\nしゅびりょくが おおきく あがった！');}
    else await say('ほしは いつも みている。','ほこらの 人');
  }else if(isStory('rogue')){
    if(G.f.loot&&!G.f.donated){G.f.donated=1;await sayAll(['……ほう。みなれぬ おとこが ほこらに なんの ようじゃ。','……へへ。これ、ひろった。\nゆうしゃに、わたしてくれ。','ほっほ。ひろった、のう。わかった、しかと うけとった。'],'ほこらの 人');await finishStory();}
    else if(!G.f.loot)await say('ほしの ひかりが あやしい おとこを みている……。たからを とりに いったのでは ないのか？','ほこらの 人');
  }else await say('ほしは いつも みている。','ほこらの 人');});
// castle: king talk (minister story) / real boss created from MAPS.*.boss below
npc('kingTalk','castle',10,3,'demon',async()=>{
  await sayAll(['……ほう。だいじん ではないか。ひさしぶりじゃな。','はんこが ほしいと きいた。……たしかに。ここに おそう。','ところで、ゆうしゃが ちかく くるそうじゃな。\nおちゃでも のんで いかぬか？','……あ、いや。しょるいを うけとったのは うちの かいけいがかりで……。'],'まおう');
  await finishStory();},()=>isStory('minister'));
// boss NPCs
const BOSS={1:['slimeKing',0.38],2:['boneBoss',0.3],3:['dragon',0.3],4:['demonKing',0.28]};
['cave1','cave2','cave3','castle'].forEach(mid=>{
  const b=MAPS[mid].boss,[key,k]=BOSS[b.id];
  NPCS.push({id:'boss'+b.id,map:mid,x:b.x,y:b.y,spr:null,mon:key,mk:k,dir:0,show:()=>isStory('hero')&&!G.f['b'+b.id],
    talk:async()=>{
      const pre={1:['ぷるぷる……ぷるん！ ここは ぼくの すみかだ ぷるん！'],2:['カタカタ……ここを とおりたければ、おれを こえて いけ。'],3:['グオオオ……！ ひとの こごときが わが ほのおに たえられるか！'],4:['よくぞ ここまで きた、ゆうしゃよ。','わたしは ながい ねむりから さめた。せかいを やみに そめる ために な。','さあ、かかってこい――！']}[b.id];
      await sayAll(pre,MON[key].n);
      const r=await battle(key);
      if(r==='lose'){await onLose();return;}
      if(r==='win'){G.f['b'+b.id]=1;refreshMap();
        if(b.id===4)await finishStory();
        else{const gift={1:'きずな石',2:'つきの しずく',3:'ほのおの もんしょう'}[b.id];sfx('lvl');await say(`${MON[key].n}を たおした！\n${gift}を てにいれた！`);await say({1:'どこかで かんもんが ひらく おとが した……。',2:'どこかで かんもんが ひらく おとが した……。',3:'まおう城への みちが ひらいた！'}[b.id]);}}
    }});
});
const npcsOn=mid=>NPCS.filter(n=>n.map===mid&&(!n.show||n.show()));

// ---- story flow ----
function goalText(){
  const f=G.f,s=G.story;
  if(s==='hero')return !f.mayor1?'そんちょうに はなしを きこう（むらの いえの おく）':!f.hermit1?'きたにしの はじまりの祠へ いこう':!f.b1?'ねむりの洞窟（みなみ）の プルンキングを たおせ':!f.b2?'みなと村の ちかくの こだまの洞窟へ。しょうしょう つよく なって から':!f.b3?'たかね村の ちかくの ほのおの洞窟の ドラゴンを たおせ':'ヨイヤミ村の ひがし、まおう城へ！';
  if(s==='vb')return !f.med?'つまから くすりを うけとろう':'みなと村の むすめに くすりを とどけよう（きたの おか を こえた むこう）';
  if(s==='mayor')return !f.hermit1m?'はじまりの祠（きたにし）の ひとに はなしを きこう':'ねむりの洞窟（みなみ）の おくの たからばこを さがせ';
  if(s==='minister')return '『まおうとの しょるい』を まおう城へ とどけよう（ヨイヤミ村の ひがし）';
  if(s==='hermit')return '山を おりて はじまりの村の やどやで スープを たべよう';
  if(s==='gal')return !f.ribbon?'ヨイヤミ村の ブティックで リボンを もらおう':'ステージの モデルに はなしかけよう';
  if(s==='rogue')return !f.key?'ろうやの かんしゅから カギを ぬすもう':!f.loot?'ほのおの洞窟の たからばこを あけろ':!f.donated?'たかね村の ほくとう ほし見の祠へ たからを とどけろ':'……';
  if(s==='cat'){const n=['kuro','tora','shiro','yami'].filter(k=>f[k]).length;return n<4?`なかまを あつめよう（のこり ${4-n}ひき）：はじまりの村・みなと村・たかね村・ヨイヤミの村`:'みなと村の つりばし（つりたいかいの かんりにん）で さくせんを じっこうしよう';}
  return '';
}
function mkPC(id){
  const c=CHARS[id];
  return {id,name:c.name,lv:c.lv,exp:0,mhp:c.hp,hp:c.hp,mmp:c.mp,mp:c.mp,atk:c.atk,def:c.def,wp:c.wp,wpn:c.wpn,ar:c.ar,arn:c.arn,gr:GR,spells:c.spells,items:Object.assign({},c.items)};
}
function clearedList(){try{const l=JSON.parse(storeGet('dq_cleared')||'[]');return Array.isArray(l)?l:[];}catch(e){return[];}}   // localStorage不可(Artifact等)でもメモリに保持
function markCleared(id){try{const l=clearedList();if(!l.includes(id)){l.push(id);storeSet('dq_cleared',JSON.stringify(l));}}catch(e){}}
async function startStory(id){
  const c=CHARS[id];
  G.story=id;G.f={};G.open={};G.fx=[];G.pc=mkPC(id);G.gold=c.gold;G.home=c.map.startsWith('v')?c.map:'v1';
  if(id!=='hero'){G.f.b1=G.f.b2=G.f.b3=1;}
  await fade(1,300);G.mode='card';G.card=c.title;await sleep(1500);
  await warpTo(c.map,c.x,c.y,false);G.dir=0;
  G.mode='map';G.card=null;await fade(0,500);autoSave();
  for(const s of c.intro)await say(s,id==='hero'?'':c.name);
  if(id==='hero'){await say('(とびらは ほうこうキーで すすむと じどうで ひらく。たからばこや ひとへは Aボタン。まずは いえの とびらを あけて むらへ でよう)');}
}
async function finishStory(){
  G.busy=true;
  const c=CHARS[G.story];
  await fade(1,600);G.mode='card';G.card='おしまい';
  sfx('win');
  await fade(0,300);
  await sayAll(c.end);
  markCleared(G.story);
  await fade(1,500);
  G.busy=false;
  await selectStory(true);
}
async function onLose(){
  G.busy=true;
  await fade(1,500);G.mode='map';
  await say('めのまえが まっくらに なった……');
  G.gold=Math.floor(G.gold/2);G.pc.hp=G.pc.mhp;G.pc.mp=G.pc.mmp;
  await warpTo(G.home,MAPS[G.home].start.x,MAPS[G.home].start.y,false);
  await fade(0,500);
  await say('……はっと めを さました。\nだれかが ここまで はこんで くれたらしい。\nふところの おかねが はんぶんに へっている……。');
  G.busy=false;
}
async function selectStory(afterEnd){
  G.mode='select';G.card=null;
  const cl=clearedList();
  const all7=ORDER.every(id=>cl.includes(id));
  if(afterEnd&&cl.includes('cat')&&!G.f.credits){G.f.credits=1;await credits();return;}
  if(afterEnd)await say('？これは、だれの ものがたり だったのか……。\nだれかに とっては、ここからが はじまり。');
  if(afterEnd&&all7&&!cl.includes('cat')&&!G.f.catHint){G.f.catHint=1;await say('……にゃあ。\nどこかで、ねこの なきごえが した。\n(？？？ もう１つの にゃん生 が ひらかれた！)');}
  while(true){
    const unlocked=cl.includes('hero');
    const ids=ORDER.concat(all7?['cat']:[]);
    const dis=ids.map((id,i)=>i>0&&!unlocked);
    const opts=ids.map((id,i)=>(cl.includes(id)?'★ ':'　')+(dis[i]?'？？？':CHARS[id].label));
    const i=await choose(opts,{x:40,y:30,w:432,title:afterEnd?'だれの じせいのくを あゆむ？':'まずは じせいのくを えらぼう',dis});
    await startStory(ids[i]);return;
  }
}
async function credits(){
  await fade(1,500);G.mode='card';G.card='FIN';await fade(0,500);
  await sayAll(['ゆうしゃ、むらびと、そんちょう、だいじん、ほこらの ひと、ギャル、ごろつき、そして ねこ。','だれも が、どこかの ものがたりの しゅやく だった。','――あなたの ものがたりも、きっと。','ありがとうございました！'],'');
  await sayAll(['……ふと、どこかで しらない たびびとの ふえが きこえた。','（？？？　つづく……かも　？？？）'],'');
  await fade(1,600);G.card=null;G.mode='title';await fade(0,500);
}
