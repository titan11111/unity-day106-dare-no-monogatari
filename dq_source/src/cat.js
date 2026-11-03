'use strict';
// ===== ニャンコ編: ？？？ もう１つの にゃん生 ？？？ =====
// 三毛猫ミケが 各町の ねこを なかまに して、つりたいかいの さかなを ごうだつする。
const catN=()=>['kuro','tora','shiro','yami'].filter(k=>G.f[k]).length;
const catShow=k=>()=>G.story==='cat'&&!G.f[k];
const MK='ミケ';
const joinMsg=async(k,nm)=>{G.f[k]=1;sfx('win');await say(`${nm}が なかまに なった！（なかま ${catN()}/4）`);if(catN()===4)await say('これで ぜんいん そろった！\nみなと村の つりばし（かんりにんの いる ばしょ）へ むかおう。');};
npc('cat_kuro','v1',2,9,'cat_kuro',async()=>{
  await say('ふん。ひるねの じゃまを するな。','クロ');
  while(true){
    const i=await choose(['さかなの はなしを する','ごろごろ すりよる','ひっかく'],{x:240,y:150,w:230});
    if(i===0)break;
    if(i===1)await say('……ごろごろ されても ごまかされん。','クロ');
    else await say('ひっかきかえされた！ いたい！\nミケは そっと あたまを さげた。');
  }
  await sayAll(['みなと村の つりたいかいの おおものを、ぜんぶ いただく けいかくよ。','さかな……だと？ しかも うみ神さまの さかな……。\n……のった。くらがりの しごとなら まかせろ。'],'');
  await joinMsg('kuro','クロ');
},catShow('kuro'),0);
npc('cat_tora','v2',19,12,'cat_tora',async()=>{
  if((G.pc.items['やきざかな']||0)<=0){
    await sayAll(['はらが へって うごけねえ……。','やきざかな 1ぴき もってきたら、はなしぐらい きいてやる。\nつりばしの はしっこで つれるぜ。'],'トラ');return;}
  G.pc.items['やきざかな']--;if(G.pc.items['やきざかな']<=0)delete G.pc.items['やきざかな'];
  await sayAll(['(ミケは やきざかなを そっと さしだした)','うまい！ ……で、なんの はなしだ？','……つりたいかいの さかなを ごうだつ？ のった、のった！\nただし ぶんまえは おれが おおめ だ。'],'トラ');
  await joinMsg('tora','トラ');
},catShow('tora'),0);
npc('cat_shiro','v3',5,19,'cat_shiro',async()=>{
  if(catN()<2){await sayAll(['ひとりで やるのは、こわいの……。','もう すこし なかまが いるなら、いっしょに いってあげる。'],'シロ');return;}
  await sayAll(['まあ、もう ふたりも いるのね。それなら あんしん。','さかなの ごうだつ……？ ふふ、おじょうひんな わたしに ぴったり。\n……ゆうわく は、おまかせ ください。'],'シロ');
  await joinMsg('shiro','シロ');
},catShow('shiro'),0);
npc('cat_yami','v4',14,18,'cat_yami',async()=>{
  if(catN()<3){await sayAll(['……ひかりは、にがて。','さんにん ぐらい そろったら また きなさい。'],'ヤミ');return;}
  await sayAll(['……ふふ。よる の けはいが する。','さかなの ごうだつ。うみ神の さかな。\nいい ひびき だわ。……この ヤミが ちからを かそう。'],'ヤミ');
  await joinMsg('yami','ヤミ');
},catShow('yami'),0);
const HUMAN_LINES=['あら ノラねこちゃん。……ふふ、かわいい。','しっ、しっ！ むこうへ いきなさい。','ねこが こっちを みてる……。','にゃーん♪ ……あれ、つうじてないか。','さかなは ないよ。ほら、あっちへ おゆき。'];
async function catTalk(n){
  if(n.id.startsWith('cat_')){await n.talk();return;}
  if(n.id==='harbor'){await catHeist();return;}
  await say(HUMAN_LINES[(n.x+n.y)%HUMAN_LINES.length],'にんげん');
  await say('(にんげんの ことばは、ミケには ただの おとに きこえた)');
}
async function catHeist(){
  if(catN()<4){await sayAll(['おや、のらねこか。つりたいかいの さかなには ちかづくなよ！','しっし！'],'みなとの かんりにん');await say('(……まだ ひとりじゃ ぶが わるい。なかまを あつめよう)');return;}
  if(!G.f.plan){
    G.f.plan=1;
    await sayAll(['ミケ「みんな、けいかくを おさらい するわ」','ミケ「クロは かげから ようすを みはる」\nクロ「……まかせろ」','ミケ「トラは かんりにんの あしもとで ごろにゃん」\nトラ「ぶんまえ、わすれんなよ」','ミケ「シロは つりびとを ゆうわく して」\nシロ「おほほ、おまかせ」','ミケ「ヤミは あかりを けして。……わたしが つる！」\nヤミ「……ふふ、よるが くる」']);
  }
  while(true){
    const i=await choose(['さくせんを じっこう する','もうすこし じゅんび する'],{x:150,y:130,w:300,cancel:1});
    if(i!==0){await say('ミケ「あわてない、あわてない。ねこは まつのが とくい」');return;}
    await say('ミケ「さくせん かいし！ 3かい なげて、2かい つりあげれば かち よ！」');
    let n=0;
    const ROLE=['クロ「(かげから かんりにんを みはる)……いまだ、ミケ」','トラ「(かんりにんの あしもとで ごろにゃん)……ふあぁ」','シロ「(つりびとを ゆうわく)……ふふ、こっちを みて」'];
    const WIN=[900,800,700];
    for(let k=1;k<=3;k++){
      await say(ROLE[k-1]);await say(`${k}かいめ！ ひげが ぴくぴく する……！${k===3?'\nヤミ「……あかりを けすわ」':''}`);
      if(await castLine(WIN[k-1])){n++;await say('つれた！！ うみ神さまの さかなが ゆれている……！');}
      else await say('にげられた！ ……かんりにんが ふりむきかけた！');
    }
    G.fish=null;
    if(n>=2){
      await sayAll(['ぱっくん！ ミケは さかなを くわえて ダッシュ！','「あっ！ さかなが ない！？ どろぼうねこ だー！！」','クロ「にげろ！」 トラ「うまそうだ！」 シロ「きゃー！」 ヤミ「……あかり、けしたわ」'],'');
      await finishStory();return;
    }
    await sayAll(['かんりにん「……いま、なにか うごいたか？」','ミケ「(……しっぱい。でも ばれて ない。もういちど、やりなおし よ)」']);
  }
}
