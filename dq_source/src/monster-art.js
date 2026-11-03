/* Original vector bestiary. No external images, fonts, filters or runtime requests.
   480-square transparent SVG, shared feet baseline, separately posed body/wing/weapon.
   SVG CSS animates exported files; explicit poses animate canvas (SVG image CSS clocks
   are not portable to drawImage). Twelve cached frames per active creature. */
const MonsterArt = (() => {
  const names={slime:'プルン',bat:'ヨルコウモリ',ghost:'おばけ',wolf:'ガルム',skel:'がいこつ',imp:'ブチコ',golem:'いわおとこ',knight:'あくまのきし',drake:'ドレイク',slimeKing:'プルンキング',boneBoss:'ほねおやぶん',dragon:'ファイアドラゴン',demonKing:'まおう',tsukiusagi:'ツキウサギ'};
  const bosses=['slimeKing','boneBoss','dragon','demonKing'];
  const path=(d,f='url(#skin)',s='#151c30',w=3)=>`<path d="${d}" fill="${f}" stroke="${s}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const ellipse=(x,y,rx,ry,f,s='none',w=2)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" stroke="${s}" stroke-width="${w}"/>`;
  const line=(d,c='#dbeaff',w=2)=>path(d,'none',c,w);
  const group=(id,body,tr='')=>`<g class="${id}" transform="${tr}">${body}</g>`;
  function eye(x,y,sz=1,c='#ffcc58') {return group('eye',ellipse(x,y,15*sz,9*sz,'#111827')+path(`M${x-13*sz} ${y-4*sz} Q${x} ${y+4*sz} ${x+13*sz} ${y-7*sz} Q${x+10*sz} ${y+12*sz} ${x-8*sz} ${y+7*sz}Z`,c,'none')+ellipse(x+2*sz,y+2*sz,2.5*sz,7*sz,'#181220')+ellipse(x-4*sz,y-1*sz,2*sz,2*sz,'#fff6cf'));}
  function teeth(x,y,n,step=11,len=14) {return Array.from({length:n},(_,i)=>path(`M${x+i*step} ${y} l${step*.4} ${len+(i%2)*4} ${step*.4} ${-len-(i%2)*4}Z`,'url(#bone)','#293043',1.4)).join('');}
  function crown(x=240,y=120,sc=1) {return `<g transform="translate(${x} ${y}) scale(${sc})">`+path('M-57 17 L-66 -37 -32 -14 0 -65 32 -14 66 -37 57 17Z','url(#gold)','#5b381b',3)+path('M-56 7 Q0 21 56 7 L55 27 Q0 39 -55 27Z','url(#gold)','#5b381b',3)+[-34,0,34].map((x,i)=>ellipse(x,i===1?-24:1,6,i===1?10:6,['#46d2f4','#f14c77','#66e7a4'][i],'#fff1bb',1.6)).join('')+line('M-51 19 Q0 30 51 19','#fff1bb',2)+'</g>';}
  function wing(side,color,phase,large=false) {
    const rot=(side===-1?-1:1)*(Math.sin(phase)*7+(large?-7:0));
    const shape=path('M0 0 C-29 -53 -80 -108 -158 -128 L-138 -75 -157 -35 Q-113 -45 -103 -9 Q-74 -26 -57 16 L-30 8Z',color,'#17172a',4)+path('M-7 -8 L-151 -123 -110 -38 -58 6Z','#100e23','none')+path('M-14 -15 L-145 -117 -111 -51 -62 -5Z',color,'none')+line('M-4 0 L-151 -123 M-4 0 L-111 -39 M-4 0 L-58 11','#dba7ac',2)+line('M-150 -124 L-156 -130','#fff0d9',5);
    return `<g class="wing-${side===-1?'l':'r'}" transform="translate(${side===-1?194:286} ${large?214:232}) scale(${side===-1?1:-1} 1) rotate(${rot})">${shape}</g>`;
  }
  function sword(phase,royal=false) {return group('weapon',path('M359 360 L354 156 368 99 382 157 374 360Z','url(#steel)','#182433',3)+path('M368 113 L369 352 360 352 359 157Z','#d7f0ef','none')+line('M370 174 L370 306','#fdffff',2)+path('M338 348 Q368 337 395 348 L394 360 338 360Z','url(#gold)')+path('M361 361 L374 361 377 402 361 402Z','#442b3b')+ellipse(369,406,9,8,royal?'#eb4e89':'url(#gold)','#152033'),`rotate(${Math.sin(phase)*2} 368 365)`);}
  function bone(phase,royal) {
    let a=royal?path('M131 160 Q240 112 332 166 L371 417 Q309 395 263 420 L224 398 109 420Z','url(#cloak)')+Array.from({length:6},(_,i)=>line(`M${143+i*30} 192 Q${151+i*26} 302 ${126+i*42} 400`,'#261933',4)).join(''):'';
    a+=sword(phase,royal);
    a+=path('M210 336 L198 383 174 414 202 417 227 391 239 343 M263 339 L275 379 266 411 300 411 297 376 283 333','url(#bone)');
    a+=path('M219 342 Q194 324 201 310 L230 301 267 303 287 322 275 344 254 330 243 344Z','url(#bone)');
    a+=path('M232 208 L249 208 252 315 236 323Z','url(#bone)');
    for(let i=0;i<5;i++){let y=218+i*16;a+=path(`M239 ${y} Q176 ${y-19} 192 ${y+9} Q212 ${y+19} 239 ${y+8} M250 ${y} Q312 ${y-19} 295 ${y+9} Q274 ${y+19} 250 ${y+8}`,'none','url(#bone)',7);}
    a+=path('M202 208 L174 225 156 284 164 333 M285 210 L318 230 330 276 364 296','none','#9d988f',13)+path('M202 205 L175 222 159 282 M286 207 L321 230 333 275 366 296','none','url(#bone)',8);
    for(const [x,y] of [[174,225],[158,282],[321,230],[333,275]])a+=ellipse(x,y,8,8,'url(#bone)','#38404c');
    a+=path('M179 155 C175 78 217 55 257 63 C316 65 326 123 302 157 L282 171 281 192 Q244 215 206 187 L206 172Z','url(#bone)')+path('M191 124 Q207 108 231 125 L225 149 Q199 159 193 142Z','#1d2230')+path('M253 124 Q276 106 295 119 L290 141 Q276 157 257 146Z','#1d2230')+ellipse(212,136,7,9,'#fc715e')+ellipse(275,133,7,9,'#fc715e')+path('M241 144 L232 163 251 161Z','#293140')+line('M218 179 Q246 193 275 177','#67676d',3)+[220,231,243,255,267].map(x=>line(`M${x} 173 L${x} 187`,'#5a5b64',2)).join('')+line('M249 68 L241 87 252 97 248 111','#736c6c',2)+line('M185 106 Q195 77 223 76','#fffce8',3);
    if(royal)a+=crown(242,64,.79)+ellipse(240,248,11,15,'#bf53ea','#f6d781',3);
    return a;
  }
  function reptile(phase,red) {
    let a=wing(-1,'url(#membrane)',phase,true)+wing(1,'url(#membrane)',phase,true);
    a+=group('tail',path('M286 359 Q397 414 416 299 Q458 402 356 423 L283 399Z','url(#skin)')+path('M412 316 L426 300 431 323 419 334Z','url(#bone)'),`rotate(${Math.sin(phase)*3} 290 365)`);
    a+=path('M173 342 Q138 367 130 410 L185 418 207 388 276 389 300 417 351 410 Q345 364 307 335Z','url(#skin)');
    a+=path('M195 198 Q168 243 166 305 C159 396 304 424 322 321 Q334 247 287 196Z','url(#skin)')+path('M218 217 Q194 279 205 348 Q241 390 282 345 Q297 278 267 220Z','url(#belly)');
    for(let i=0;i<7;i++)a+=line(`M207 ${248+i*15} Q243 ${262+i*15} 282 ${247+i*15}`,'#9f6e42',2);
    a+=path('M180 227 Q131 230 126 293 L148 326 182 304 203 251 M291 229 Q346 227 353 285 L332 321 301 301 280 253','url(#skin)');
    for(const x of [132,148,164,303,319,335])a+=path(`M${x} 303 l-4 25 13 -22Z`,'url(#bone)');
    for(const x of [141,161,181,303,323,343])a+=path(`M${x} 402 l-10 16 17 -1Z`,'url(#bone)');
    a+=path('M188 159 Q162 113 178 91 L207 112 220 95 249 102 280 88 297 119 315 142 297 197 269 224 216 206Z','url(#skin)');
    a+=path('M191 119 Q156 109 150 59 Q181 82 209 89Z','url(#bone)')+path('M278 104 Q309 85 329 53 Q327 99 297 132Z','url(#bone)');
    a+=path('M194 146 L221 159 214 184 188 166Z',red?'#642225':'#123f40')+eye(213,149,.88)+eye(275,145,.88);
    a+=path('M219 172 Q248 159 281 171 L284 199 Q251 226 217 198Z','#261323')+teeth(220,174,5,12,15)+path('M228 207 Q245 186 271 207Z','#cc5255','#6f3040',1.5)+path('M225 161 L238 153 254 155 269 162 258 177 236 178Z','url(#skin)')+ellipse(239,165,3,3,'#162a2d')+ellipse(255,164,3,3,'#162a2d');
    for(let i=0;i<23;i++){let x=177+(i%4)*37,y=240+Math.floor(i/4)*22;a+=path(`M${x} ${y} q7 10 15 -1 q-6 15 -15 1Z`,'none',red?'#f6a06a':'#7bba9c',1.3);}
    // Long, offset muzzle and swept horns give dragons their own anatomy.
    a+=path('M192 170 L211 143 244 145 276 170 324 174 343 193 322 209 296 207 278 231 245 241 218 216Z','url(#skin)')
      +path('M233 182 L272 194 329 190 327 208 302 214 273 235 244 224Z','#211a2b')
      +teeth(244,194,7,11,14)+path('M243 222 L267 215 286 219 270 230Z','#dc6c73','#592f47',1.2)
      +path('M241 162 L278 174 324 174 339 190 321 197 274 192 244 181Z','url(#skin)')
      +ellipse(315,183,4,3,'#172633')+eye(218,158,1.02)+line('M199 143 L231 150','#d8be8c',3)
      +path('M186 144 Q149 126 139 80 Q175 115 205 118Z','url(#bone)')
      +line('M177 187 L196 199 186 215 M197 218 L211 233 204 251','#84b1a0',2);
    if(red)a+=path('M231 112 L241 90 253 113 267 99 266 130Z','url(#obsidian)')+ellipse(312,200,7,4,'#ffb14e');
    return a;
  }
  function art(key,phase=0) {
    const royal=key==='slimeKing',red=key==='dragon';
    if(key==='slime'||royal){let a=royal?path('M128 360 L147 218 Q240 177 333 231 L364 385 Q240 424 115 381Z','url(#cloak)'):'';
      a+=path('M77 347 C65 291 136 262 176 224 Q210 202 236 150 Q246 137 261 165 C289 220 329 242 365 284 C425 362 348 401 242 400 C160 405 87 390 77 347Z','url(#skin)');
      a+=path('M96 347 Q130 384 226 387 Q350 400 380 342 Q386 397 243 400 Q114 402 96 347Z','#073b43','none')+path('M131 280 Q147 254 178 249 Q197 252 177 268 L145 288Z','#b8ffdc','none')+ellipse(197,227,9,15,'#e2fff0')+eye(186,309,1.15,'#8be8fa')+eye(292,309,1.15,'#8be8fa')+path('M190 340 Q241 366 289 337 Q264 388 216 365Z','#0d2939')+teeth(215,351,3,17,10)+[ [119,329,10],[330,311,8],[299,367,6],[170,370,5]].map(([x,y,r])=>ellipse(x,y,r,r*.6,'#79ebbc')).join('');
      if(royal)a+=crown(244,171,1.05);return a;}
    if(key==='bat'||key==='imp'){const imp=key==='imp';let a=wing(-1,'url(#membrane)',phase)+wing(1,'url(#membrane)',phase);
      if(imp)a+=path('M283 337 Q378 395 374 288','none','#c46753',13)+path('M359 291 L376 269 388 298Z','url(#gold)')+group('weapon',line('M345 416 L352 164','#aabfc7',7)+path('M329 180 L329 144 336 168 350 164 353 126 360 163 374 165 382 143 378 182Z','url(#steel)'),`rotate(${Math.sin(phase)*3} 350 300)`);
      a+=path('M194 306 L178 382 210 389 235 331 258 333 277 389 309 380 286 305Z','url(#skin)')+path('M190 248 Q240 214 286 254 L297 325 Q240 365 184 318Z','url(#skin)')+path('M218 268 Q245 254 266 277 L268 323 Q243 345 214 319Z','url(#belly)')+path('M190 258 Q160 264 163 313 L183 323 204 290 M285 258 Q318 270 316 308 L296 321 278 291','url(#skin)');
      a+=path('M180 193 L174 125 221 172 256 171 299 123 294 197 Q324 259 267 282 Q205 298 184 246Z','url(#skin)')+path('M183 183 L182 146 207 176Z','#ce809c')+path('M271 177 L290 144 289 183Z','#ce809c')+eye(214,222,1.05,'#ff8d74')+eye(271,218,1.05,'#ff8d74')+ellipse(244,242,8,6,'#221e35')+path('M213 253 Q243 270 280 247 L271 272 230 278Z','#1a1726')+teeth(224,259,4,12,13)+line('M190 197 L210 207 M272 201 L291 188','#e8adc1',3);return a;}
    if(key==='ghost'){let a='';for(let i=0;i<5;i++){let x=103+i*68,y=190+Math.sin(phase+i)*45;a+=path(`M${x} ${y-23} q-20 32 0 38 q22 -8 0 -38Z`,'url(#spirit)','none');}a+=path('M120 284 Q126 133 231 114 Q343 94 362 283 L405 324 354 314 Q372 391 332 393 L295 365 269 406 230 376 191 405 161 371 123 391 130 316 76 336Z','url(#spirit)','#9aaad2',2.5)+path('M152 281 Q149 162 226 141 Q176 160 174 284 L166 355 149 369Z','#eaffff','none')+path('M179 240 L215 249 212 268 188 276Z','#25385c')+path('M259 248 L298 234 291 273 266 274Z','#25385c')+ellipse(202,259,4,9,'#b1faff')+ellipse(276,257,4,9,'#b1faff')+path('M209 311 Q237 274 269 308 L259 347 Q234 369 217 341Z','#29335b')+ellipse(240,342,12,8,'#ba92e9');return a;}
    if(key==='skel'||key==='boneBoss')return bone(phase,key==='boneBoss');
    if(key==='drake'||red)return reptile(phase,red);
    if(key==='wolf'){let a=group('tail',path('M306 352 Q411 340 379 232 L415 266 Q456 362 326 402Z','url(#fur)'),`rotate(${Math.sin(phase)*4} 314 359)`);
      a+=path('M157 245 L136 304 102 346 116 410 185 413 202 372 280 368 305 410 374 408 358 344 329 304 311 244Z','url(#fur)')+path('M188 269 L190 337 163 367 159 400 203 404 219 359 243 327 267 361 278 403 321 401 317 369 289 336 290 269Z','url(#steel)');
      a+=path('M155 153 L162 68 207 116 244 95 282 113 325 61 328 160 351 202 321 207 334 234 300 234 309 268 276 250 248 286 209 254 179 272 182 242 147 240 160 209 131 202Z','url(#fur)')+path('M169 137 L174 92 196 126Z','#c0899d')+path('M290 125 L315 88 313 140Z','#c0899d')+path('M198 177 L221 201 240 194 253 202 285 173 294 231 266 254 236 270 204 242Z','url(#steel)')+eye(195,178,1.1)+eye(288,176,1.1)+path('M211 215 Q241 229 276 211 L272 246 248 261 222 248Z','#201e2a')+teeth(217,219,5,11,15)+path('M220 204 L258 201 269 212 244 228 221 220Z','#15232f')+line('M161 171 L183 143 M296 145 L324 160 M172 224 L182 203','#cedbea',2);for(const x of [126,148,170,313,335,357])a+=path(`M${x} 396 l-4 19 13 -2Z`,'url(#bone)');return a;}
    if(key==='golem'){let a=path('M159 353 L135 412 213 418 226 351 M262 351 L273 418 347 409 326 350','url(#stone)');
      a+=path('M116 205 L78 223 65 304 87 366 130 356 151 261 M342 204 L386 226 413 310 391 365 348 358 324 260','url(#stone)')+path('M145 198 L204 176 285 179 334 211 323 338 282 368 197 361 147 333Z','url(#stone)')+path('M172 202 L165 323 202 346 202 214Z','#adc0c4','none')+path('M206 193 L203 111 229 85 286 99 300 126 292 184 260 204Z','url(#stone)')+path('M210 147 L239 149 238 162 210 161Z','#ffcb64')+path('M260 148 L285 141 285 157 261 163Z','#ffcb64')+path('M240 231 L272 270 240 308 214 268Z','url(#gold)','#3e4855',4)+ellipse(241,268,8,17,'#fff4bf');
      for(const d of ['M187 209 l15 30 -12 17 13 23','M305 225 l-19 27 13 19 -22 30','M91 248 l17 25 -15 33 20 19','M368 251 l-10 30 22 20 -10 35','M222 113 l19 11 -10 17','M203 355 l-23 38'])a+=line(d,'#202c39',3)+line(d,'#c5b78c',.9);return a;}
    if(key==='knight'||key==='demonKing'){const king=key==='demonKing';let a=king?wing(-1,'url(#membrane)',phase,true)+wing(1,'url(#membrane)',phase,true):'';
      a+=path('M149 174 Q240 135 328 180 L366 411 310 400 280 421 229 405 183 422 107 407Z','url(#cloak)');
      for(let i=0;i<6;i++)a+=path(`M${163+i*26} 205 Q${152+i*30} 317 ${126+i*40} 405`,'none',i%2?'#7d3754':'#251e3a',5);
      a+=path('M194 325 L180 411 221 414 242 339 265 412 310 410 286 325Z','url(#steel)')+path('M176 202 L207 177 275 178 312 210 293 326 267 354 205 344 182 312Z',king?'url(#obsidian)':'url(#steel)')+path('M211 200 L240 215 276 197 266 294 241 315 217 293Z',king?'url(#skin)':'#596a83')+path('M235 202 L245 202 246 295 277 298 276 308 245 310 245 333 235 333 235 309 202 306 204 297 235 296Z','url(#gold)')+ellipse(241,301,10,12,'#f36b5c','#f8d7a0',2);
      a+=path('M165 179 L136 211 154 250 192 238 207 205 M294 205 L313 179 344 207 328 250 294 237Z','url(#steel)');
      for(const x of [152,174,312,331])a+=path(`M${x} 205 l-6 -38 23 32Z`,'url(#bone)');
      a+=path('M195 152 L195 108 Q238 60 284 103 L292 154 275 196 218 197Z',king?'url(#obsidian)':'url(#steel)')+path('M202 125 L236 140 282 121 277 145 242 157 205 147Z','#161d32')+eye(219,139,.65,'#ff6b51')+eye(268,135,.65,'#ff6b51')+path('M241 96 L248 112 250 177 239 192 232 177Z','url(#steel)')+line('M213 163 L226 168 M214 173 L226 178 M262 165 L276 158 M262 175 L271 171','#212b40',3);
      if(king)a+=path('M204 110 Q143 92 145 42 Q168 80 214 88 M277 96 Q318 72 332 30 Q352 80 288 121','url(#bone)')+crown(242,85,.6)+group('weapon',line('M363 405 L367 143','url(#gold)',9)+path('M345 143 L344 109 362 121 368 92 375 120 391 104 390 142Z','url(#gold)')+ellipse(367,125,17,22,'#f36967','#f8da93',3)+ellipse(361,117,5,7,'#fff4da'),`rotate(${Math.sin(phase)*2} 363 350)`);
      else a+=sword(phase)+path('M203 94 Q225 57 236 39 L257 45 Q275 77 257 92Z','#ce594f')+path('M138 254 L193 264 191 338 163 370 127 334Z','url(#cloak)','#c8a358',5)+path('M161 277 L177 302 161 326 146 300Z','url(#gold)');
      return a;}
    if(key==='tsukiusagi'){let a=`<g class="halo" transform="rotate(${phase*7} 240 235)">`+ellipse(240,235,158,158,'none','#9b8655',2)+ellipse(240,235,145,145,'none','#ead496',1);
      for(let i=0;i<12;i++){let t=i*Math.PI/6,x=240+158*Math.cos(t),y=235+158*Math.sin(t);a+=ellipse(x,y,4,4,i%2?'#fff5c9':'#ee7d92');}a+='</g>';
      a+=path('M195 371 L168 410 222 414 244 393 265 411 315 410 288 368Z','url(#gold)')+ellipse(324,361,25,23,'url(#gold)','#6d4f39')+ellipse(242,321,72,82,'url(#gold)','#6d4f39',3)+ellipse(238,332,46,59,'#fff4d5')+path('M204 199 Q157 136 172 39 Q208 43 226 181 M260 182 Q274 48 314 29 Q333 115 282 201Z','url(#gold)','#6d4f39',3)+path('M198 164 Q177 102 183 57 Q201 79 212 170 M279 165 Q302 104 305 49 Q285 72 271 169Z','#df9a9e','none')+ellipse(242,228,67,57,'url(#gold)','#6d4f39',3)+eye(216,229,1.1,'#e86a8e')+eye(271,229,1.1,'#e86a8e')+path('M234 248 L251 248 243 258Z','#cd697b')+line('M243 258 Q231 275 224 262 M243 258 Q254 274 262 261','#644653',2)+ellipse(179,313,19,29,'url(#gold)','#6d4f39')+ellipse(306,311,19,29,'url(#gold)','#6d4f39')+path('M224 281 L259 280 243 302Z','#d66482','#f5dc93',2)+ellipse(240,183,9,11,'#df6d9f','#fff6d0',2);return a;}
    return '';
  }
  function palette(key){return key==='dragon'?['#f39764','#a8393c','#421f33']:key==='drake'?['#79bca3','#276564','#183848']:key==='imp'?['#ed9977','#ac4249','#451e38']:key==='bat'?['#b2a2e5','#65518f','#292642']:key==='slime'||key==='slimeKing'?['#b0f4c6','#36b695','#0d555a']:['#b997db','#634583','#2b2947'];}
  function svg(key,frame=0,animate=false){
    const p=frame/12*Math.PI*2,[hi,mid,dark]=palette(key),floating=['bat','ghost','tsukiusagi'].includes(key),boss=bosses.includes(key);
    const bob=floating?Math.sin(p)*7:Math.sin(p)*1.4,sq=key.includes('slime')?Math.sin(p)*.025:Math.sin(p)*.006;
    const css=animate?`<style>.body{animation:breathe ${floating?2.1:3.2}s ease-in-out infinite;transform-origin:240px 410px}.wing-l,.wing-r{animation:flap 1.65s ease-in-out infinite;transform-box:fill-box;transform-origin:center right}.wing-r{animation-delay:-.2s}.eye{animation:ember 3s ease-in-out infinite}.weapon,.tail{animation:sway 3.6s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 90%}@keyframes breathe{50%{translate:0 -${floating?8:2}px;scale:1.015 .985}}@keyframes flap{50%{rotate:5deg}}@keyframes ember{50%{opacity:.65}}@keyframes sway{50%{rotate:2deg}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}</style>`:'';
    const grad=(id,stops)=>`<linearGradient id="${id}" x1="0" y1="0" x2=".85" y2="1">${stops.map(([o,c])=>`<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
    const defs=grad('skin',[[0,hi],[.4,mid],[1,dark]])+grad('steel',[[0,'#edf4e9'],[.27,'#9fb1c2'],[.5,'#53617b'],[.65,'#8192a5'],[1,'#273248']])+grad('obsidian',[[0,'#9689ba'],[.35,'#504666'],[.55,'#282a43'],[1,'#121b30']])+grad('gold',[[0,'#fff4c4'],[.3,'#efcb74'],[.6,'#bf8741'],[1,'#704d34']])+grad('bone',[[0,'#fffce6'],[.45,'#d4ccb1'],[1,'#807b80']])+grad('stone',[[0,'#c3ccc5'],[.35,'#839496'],[.58,'#516679'],[1,'#2f3b50']])+grad('fur',[[0,'#b6c9d3'],[.4,'#61778e'],[1,'#253748']])+grad('cloak',[[0,'#ba6279'],[.38,'#6d335c'],[1,'#251d3d']])+grad('membrane',[[0,key==='dragon'?'#dd8473':'#b783a7'],[.5,key==='drake'?'#306f71':'#733e65'],[1,'#25273f']])+grad('belly',[[0,'#fff0ba'],[.5,'#c5a578'],[1,'#836c68']])+grad('spirit',[[0,'#f0ffff'],[.4,'#a0c4e0'],[1,'#454b89']]);
    let aura='';if(boss||key==='tsukiusagi')for(let i=0;i<8;i++){let t=i*.785+p*.15,x=240+Math.cos(t)*159,y=246+Math.sin(t)*151;aura+=path(`M${x} ${y-5} l2 4 4 1 -4 2 -2 4 -1 -4 -4 -2 4 -1Z`,key==='dragon'?'#f4b580':'#c2b4ea','none');}
    let details='';
    // Small etched marks describe surfaces without heavy SVG filter stacks.
    if(['knight','demonKing'].includes(key)){
      details+=line('M181 215 L192 227 183 241 M305 213 L319 223 311 236 M204 215 L213 225 218 264 M268 211 L259 225 257 271','#d4d8d1',1.4);
      for(let i=0;i<4;i++)details+=path(`M${213+i*18} 321 l4 5 -4 5 -4 -5Z`,'url(#gold)','none');
      details+=line('M194 365 L207 354 214 363 M278 361 L290 355 297 370','#d4b57e',2);
    }
    if(key==='wolf')for(const [x,y] of [[164,188],[174,228],[192,254],[304,220],[309,260],[156,311],[327,313]])details+=line(`M${x} ${y} l-5 17 11 -7 -4 14`,'#b2c7d3',1.5);
    if(key==='golem')for(let i=0;i<30;i++){let x=157+(i*37)%159,y=211+(i*31)%116;details+=line(`M${x} ${y} l${i%2?4:-3} 2`,'#adbbc0',1);}
    if(['skel','boneBoss'].includes(key))details+=line('M215 78 Q194 89 193 108 M261 78 Q284 82 295 105 M212 312 L220 320 M276 316 L267 322','#fff5d4',2);
    const bossScale=key==='dragon'?'translate(-12 -25) scale(1.05)':key==='demonKing'?'translate(-7 -13) scale(1.03)':'';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480" role="img" aria-label="${names[key]}"><title>${names[key]}</title><defs>${defs}</defs>${css}${ellipse(240,422,floating?68:110,11,'#0b1029', 'none')}${ellipse(240,422,floating?55:85,5,'#080c1e')}${aura}<g class="body" transform="translate(0 ${bob.toFixed(2)}) translate(240 410) scale(${(1+sq).toFixed(4)} ${(1-sq).toFixed(4)}) translate(-240 -410)"><g transform="${bossScale}">${art(key,p)}${details}</g></g></svg>`;
  }
  const cache=new Map();const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)');
  function frames(key){if(cache.has(key))return cache.get(key);const a=[];cache.set(key,a);for(let i=0;i<12;i++){const im=new Image();im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg(key,i));a.push(im);}if(cache.size>3)cache.delete(cache.keys().next().value);return a;}
  function draw(g,key,tick,state){const a=frames(key),quiet=reduced&&reduced.matches,f=quiet?0:Math.floor(tick/12)%12,im=a[f].complete&&a[f].naturalWidth?a[f]:a.find(x=>x.complete&&x.naturalWidth);if(!im)return false;
    const now=performance.now(),attack=quiet?0:Math.max(0,1-(now-(state?.attackAt||-10000))/420),hit=quiet?0:Math.max(0,1-(now-(state?.hitAt||-10000))/340);g.save();
    g.beginPath();g.rect(186,20,306,280);g.clip();let s=attack?1+Math.sin(attack*Math.PI)*.12:1;
    g.translate(339+(hit?Math.sin(hit*26)*hit*8:0),166+Math.sin(attack*Math.PI)*12);g.scale(s,s);g.drawImage(im,-153,-146,306,306);
    if(hit>.6){g.globalAlpha*=.35;g.globalCompositeOperation='screen';g.drawImage(im,-153,-146,306,306);}g.restore();return true;}
  return {names,bosses,svg,draw,frames};
})();
if(typeof module!=='undefined')module.exports=MonsterArt;
