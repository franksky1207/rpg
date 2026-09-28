// 永久回歸檢查：已建立的銀河與宇宙正式 storydata／Registry 顯示文字必須本身為中文；不得依賴 Story Integrity 先行修正。
// Batch 12-O2 exact-head：W3 completion 單一 owner 與 Story formal／generic lifecycle identity 必須同時通過 Story／Runtime Integrity。
// Batch 12-O3 exact-head：Story normalization 收斂、foreign pending 共用仲裁與 behavioral regression 必須同時通過 Story／Runtime Integrity。
// Batch 12-O4 exact-head：W3 Boss 特化玩家文案 % 收尾、handoff 更新與第 12 大批整體狀態必須同時通過 Story／Runtime Integrity。
// W3 UI Text Batch 2 exact-head：背包／裝備處理／設定與 phase3 零資源政策必須同時通過 Story／Runtime Integrity。
// W3 UI Text Batch 3 exact-head：副本首頁與 VIP 第三紀元呈現必須同時通過 Story／Runtime Integrity。
// W3 VIP20 death protection exact-head：共用 30% 死亡掉裝 owner、第三紀元 VIP20 保護呈現與零實際遺失必須同時通過 Story／Runtime Integrity。
// W3 Guide Batch 4 exact-head：三紀元遊戲說明與高維語意收尾必須同時通過 Story／Runtime Integrity。
// W3 terminology exact-head：玩家正式用語統一為「10 名高維存在」，不得使用對話簡稱「十王」。
// Guide Opt1 exact-head：W3 Guide canonical owner snapshot、current-world category validation 與 offline duration owner 必須同時通過 Story／Runtime Integrity。
const fs=require('fs');
const vm=require('vm');

const files=[
 'data.js',
 'worldmaps-earth.js','worldmaps-solar.js','worldmaps-nearstar.js','worldmaps-frontier.js','worldmaps-orion.js','worldmaps-galactic-frontier.js','worldmaps-galactic-mid.js','worldmaps-core-outer.js','worldmaps-core-war.js','worldmaps-galactic-unification.js',
 'secondworlddata.js','secondworldstoryregistry.js',
 'storydata-earth.js','storydata-solar.js','storydata-nearstar.js','storydata-frontier.js','storydata-orion.js','storydata-galactic-frontier.js','storydata-galactic-mid.js','storydata-core-outer.js','storydata-core-war.js','storydata-galactic-unification.js',
 'storydata-universe-galaxy-beyond.js','storydata-universe-local-group-war.js','storydata-universe-star-cluster-frontier.js','storydata-universe-stellar-battlefront.js','storydata-universe-cosmic-filament.js','storydata-universe-stellar-great-wall.js','storydata-universe-cosmic-deep-domain.js','storydata-universe-trans-domain-frontier.js','storydata-universe-myriad-domain-frontline.js','storydata-universe-cosmic-unification-war.js'
];
const context={console,Date,Math,JSON,Object,Array,Set,Map,String,Number,Boolean,RegExp,Error,Buffer,atob:s=>Buffer.from(String(s),'base64').toString('binary'),btoa:s=>Buffer.from(String(s),'binary').toString('base64')};context.window=context;vm.createContext(context);
for(const file of files){if(!fs.existsSync(file))throw new Error(`缺少正式劇情來源檔：${file}`);vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});}
const failures=[];const bannedNarrativeTerms=['小區域','關卡','第幾關','普通怪','菁英怪','Boss','Ｂｏｓｓ','玩家','頁數','遊戲','等級','首領戰'];const bannedPlayerReferences=['主角'];const hasEnglish=v=>/[A-Za-z]/.test(String(v??''));const plain=v=>typeof v==='string'?v:(v&&typeof v==='object'&&typeof v.em==='string'?v.em:'');
function check(value,where){if(hasEnglish(value))failures.push({where,type:'english',text:String(value)});}function checkNarrative(value,where){const text=String(value??'');const found=bannedNarrativeTerms.filter(term=>text.includes(term));if(found.length)failures.push({where,type:'internal-term',terms:found,text});const playerRefs=bannedPlayerReferences.filter(term=>text.includes(term));if(playerRefs.length)failures.push({where,type:'player-reference',terms:playerRefs,text});}
function checkRegistry(regions,era){for(const region of regions||[]){check(region?.name,`${era}:${region?.id||'unknown'} region.name`);for(const row of Array.isArray(region?.stories)?region.stories:[])check(row?.label,`${era}:${row?.id||'unknown'} registry.label`);}}
checkRegistry(context.CIVILIZATION_STORY_REGIONS,'galaxy');
checkRegistry(context.CIVILIZATION_UNIVERSE_STORY_REGIONS,'universe');
for(const [id,story] of Object.entries(context.CIVILIZATION_STORIES||{})){check(story?.chapter,`${id} chapter`);check(story?.location,`${id} location`);check(story?.title,`${id} title`);(Array.isArray(story?.pages)?story.pages:[]).forEach((page,pageIndex)=>{const text=(Array.isArray(page)?page:[]).map(plain).filter(Boolean).join('\n');check(text,`${id} page ${pageIndex+1}`);checkNarrative(text,`${id} page ${pageIndex+1}`);});}
if(failures.length){console.error(`STORY SOURCE PURITY FAILED: ${failures.length} item(s)`);failures.forEach((row,index)=>console.error(`${index+1}. ${row.where} [${row.type}]${row.terms?.length?` (${row.terms.join('、')})`:''}: ${row.text}`));process.exit(1);}
console.log(`STORY SOURCE PURITY PASSED: galaxyRegions=${(context.CIVILIZATION_STORY_REGIONS||[]).length} universeRegistry=${(context.CIVILIZATION_UNIVERSE_STORY_REGIONS||[]).length} loadedStories=${Object.keys(context.CIVILIZATION_STORIES||{}).length}`);
