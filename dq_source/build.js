const fs=require('fs');
const files=['core','sprites','maps','battle','story','towns','save','alt','cat','bgm','main','extras','world'];
let js=files.map(f=>fs.readFileSync('src/'+f+'.js','utf8')).join('\n');
const out=fs.readFileSync('tpl.html','utf8').replace('/*JS*/',()=>js);
fs.writeFileSync('index.html',out);
fs.writeFileSync('/tmp/all.js',js);
console.log('built',out.length,'bytes');
