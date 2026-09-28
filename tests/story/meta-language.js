const fs=require('fs');
const vm=require('vm');
const files=[
 'storydata-universe-galaxy-beyond.js','storydata-universe-local-group-war.js','storydata-universe-star-cluster-frontier.js','storydata-universe-stellar-battlefront.js','storydata-universe-trans-domain-frontier.js','storydata-universe-myriad-domain-frontline.js','storydata-universe-cosmic-filament.js','storydata-universe-stellar-great-wall.js','storydata-universe-cosmic-deep-domain.js','storydata-universe-cosmic-unification-war.js',
 'storydata-higher-dimensional.js','storydata-higher-dimensional-stage2-3.js','storydata-higher-dimensional-stage4-5.js','storydata-higher-dimensional-stage6-7.js','storydata-higher-dimensional-stage8-9.js'
];
const context={console,Date,Math,JSON,Object,Array,Set,Map,String,Number,Boolean,RegExp,Error};context.window=context;vm.createContext(context);
for(const file of files){if(!fs.existsSync(file))throw new Error(`缺少正式劇情來源檔：${file}`);vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});}
const strictTerms=['主線','配角','玩家','遊戲','關卡','頁數','破關','通關','劇情','章節','篇章','讀者','故事要收尾'];
const strictPatterns=[/第[一二三四五六七八九十百千0-9]+區/g,/第[一二三四五六七八九十百千0-9]+篇/g,/第[一二三四五六七八九十百千0-9]+章/g,/最後[一二三四五六七八九十百千0-9]+場/g,/(?:本區|前幾區|下一區|這一區)/g];
const reviewTerms=['系統','回合','機制','勝率'];const failures=[];const reviews=[];const plain=v=>typeof v==='string'?v:(v&&typeof v==='object'&&typeof v.em==='string'?v.em:'');
for(const [id,story] of Object.entries(context.CIVILIZATION_STORIES||{})){
 if(!id.startsWith('universe-')&&!id.startsWith('higher-dimensional-'))continue;
 (Array.isArray(story.pages)?story.pages:[]).forEach((page,pageIndex)=>{const text=(Array.isArray(page)?page:[]).map(plain).filter(Boolean).join('\n');const found=[...strictTerms.filter(term=>text.includes(term))];for(const pattern of strictPatterns){const hits=text.match(pattern);if(hits)found.push(...hits);}if(found.length)failures.push({id,page:pageIndex+1,terms:[...new Set(found)],text});const review=reviewTerms.filter(term=>text.includes(term));if(review.length)reviews.push({id,page:pageIndex+1,terms:review,text});});
}
for(const row of reviews)console.log(`META REVIEW ${row.id} page ${row.page} (${row.terms.join('、')}): ${row.text}`);
if(failures.length){console.error(`STORY META LANGUAGE FAILED: ${failures.length} page(s)`);for(const [i,row] of failures.entries())console.error(`${i+1}. ${row.id} page ${row.page} (${row.terms.join('、')}): ${row.text}`);process.exit(1);}
const universeCount=Object.keys(context.CIVILIZATION_STORIES||{}).filter(id=>id.startsWith('universe-')).length;const w3Count=Object.keys(context.CIVILIZATION_STORIES||{}).filter(id=>id.startsWith('higher-dimensional-')).length;
if(w3Count!==10){console.error(`Batch 13-6 高維 meta audit 應載入 10 篇，實際 ${w3Count}`);process.exit(2);}
console.log(`STORY META LANGUAGE PASSED: universe=${universeCount} higher-dimensional=${w3Count}/11 approved=10, system-review=${reviews.length} page(s)`);
