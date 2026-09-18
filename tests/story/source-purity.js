// 永久回歸檢查：原始正式 storydata 顯示文字必須本身為中文；不得依賴 Story Integrity 先行修正。
const fs=require('fs');
const vm=require('vm');

const files=[
 'data.js',
 'worldmaps-earth.js','worldmaps-solar.js','worldmaps-nearstar.js','worldmaps-frontier.js','worldmaps-orion.js','worldmaps-galactic-frontier.js','worldmaps-galactic-mid.js','worldmaps-core-outer.js','worldmaps-core-war.js','worldmaps-galactic-unification.js',
 'storydata-earth.js','storydata-solar.js','storydata-nearstar.js','storydata-frontier.js','storydata-orion.js','storydata-galactic-frontier.js','storydata-galactic-mid.js','storydata-core-outer.js','storydata-core-war.js','storydata-galactic-unification.js'
];
const context={console,Date,Math,JSON,Object,Array,Set,Map,String,Number,Boolean,RegExp,Error,Buffer,atob:s=>Buffer.from(String(s),'base64').toString('binary'),btoa:s=>Buffer.from(String(s),'binary').toString('base64')};
context.window=context;
vm.createContext(context);
for(const file of files)vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});

const failures=[];
const bannedNarrativeTerms=['小區域','關卡','第幾關','普通怪','菁英怪','Boss','Ｂｏｓｓ','玩家','頁數','遊戲','等級','首領戰'];
const hasEnglish=v=>/[A-Za-z]/.test(String(v??''));
const plain=v=>typeof v==='string'?v:(v&&typeof v==='object'&&typeof v.em==='string'?v.em:'');
function check(value,where){if(hasEnglish(value))failures.push({where,type:'english',text:String(value)});}
function checkNarrative(value,where){
 const text=String(value??'');
 const found=bannedNarrativeTerms.filter(term=>text.includes(term));
 if(found.length)failures.push({where,type:'internal-term',terms:found,text});
}

for(const region of context.CIVILIZATION_STORY_REGIONS||[]){
 check(region?.name,`${region?.id||'unknown'} region.name`);
 for(const row of Array.isArray(region?.stories)?region.stories:[])check(row?.label,`${row?.id||'unknown'} registry.label`);
}
for(const [id,story] of Object.entries(context.CIVILIZATION_STORIES||{})){
 check(story?.chapter,`${id} chapter`);
 check(story?.location,`${id} location`);
 check(story?.title,`${id} title`);
 (Array.isArray(story?.pages)?story.pages:[]).forEach((page,pageIndex)=>{
  const text=(Array.isArray(page)?page:[]).map(plain).filter(Boolean).join('\n');
  check(text,`${id} page ${pageIndex+1}`);
  checkNarrative(text,`${id} page ${pageIndex+1}`);
 });
}

if(failures.length){
 console.error(`STORY SOURCE PURITY FAILED: ${failures.length} item(s)`);
 failures.forEach((row,index)=>console.error(`${index+1}. ${row.where} [${row.type}]${row.terms?.length?` (${row.terms.join('、')})`:''}: ${row.text}`));
 process.exit(1);
}
console.log(`STORY SOURCE PURITY PASSED: regions=${(context.CIVILIZATION_STORY_REGIONS||[]).length} stories=${Object.keys(context.CIVILIZATION_STORIES||{}).length}`);
