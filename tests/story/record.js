const fs=require('fs');const vm=require('vm');
function assert(v,m){if(!v)throw new Error(m);}
const source=fs.readFileSync('storyrecordtabs.js','utf8');
const w3Ids=['higher-dimensional-intro',...Array.from({length:9},(_,i)=>`higher-dimensional-milestone-${String(i+1).padStart(2,'0')}`),'higher-dimensional-final'];
function build({second=false,third=false}={}){
 const completed=['earth-prologue','galaxy-probe','universe-probe',...w3Ids];
 const stories={
  'earth-prologue':{id:'earth-prologue',chapter:'銀河紀元',location:'地球',title:'序章'},
  'galaxy-probe':{id:'galaxy-probe',chapter:'銀河測試區',location:'銀河',title:'銀河測試'},
  'universe-probe':{id:'universe-probe',chapter:'宇宙測試區',location:'宇宙',title:'宇宙測試'}
 };
 w3Ids.forEach((id,index)=>stories[id]={id,chapter:'高維紀元',location:'高維',title:index===0?'觀測之外':index===10?'觀測者也必須接受被選擇':`高維測試${index}`});
 const context={console,state:{secondWorld:{entered:second},thirdWorld:{entered:third}},storyReincarnationContext(target){return {reincarnationRun:Number(target?.reincarnation?.count)>=1};},render(){},CIVILIZATION_STORIES:stories,CIVILIZATION_STORY_REGIONS:[{id:'galaxy',name:'銀河測試區',stories:[{id:'galaxy-probe'}]}],CIVILIZATION_UNIVERSE_STORY_REGIONS:[{id:'universe',name:'宇宙測試區',stories:[{id:'universe-probe'}]}],civilizationStoryProgress:{get:()=>({completedStories:completed})},thirdWorldStoryTriggerDescriptors:()=>w3Ids.map((storyId,index)=>({storyId,kind:index===0?'intro':index===10?'final':'milestone',stage:index})),isSecondWorldEntered:()=>second||third,isThirdWorldEntered:()=>third};
 context.window=context;vm.createContext(context);vm.runInContext(source,context,{filename:'storyrecordtabs.js'});return context;
}
const w3=build({second:true,third:true});let html=w3.storyRecordPageHtml();
assert(w3.STORY_RECORD_TABS_VERSION===9&&w3.STORY_RECORD_WORLD_REVIEW_VERSION===4&&w3.THIRD_WORLD_STORY_RECORD_VERSION===1,'W3 Story Record 版本未就緒');
assert(w3.getStoryRecordEraView()==='higher-dimensional','進入高維紀元後 Story Record 預設應為高維紀元');
assert(html.includes('高維紀元')&&html.includes('宇宙紀元・回顧')&&html.includes('銀河紀元・回顧'),'W3 Story Record 缺少三紀元切換');
assert((html.match(/story-record-entry/g)||[]).length===11,'W3 Story Record 應依 trigger 順序顯示 11 篇已完成正式劇情');
assert(html.includes('觀測之外')&&html.includes('觀測者也必須接受被選擇'),'W3 Story Record 缺少序章或 Final');
assert(!html.includes('戰區紀錄'),'W3 Story Record 不應顯示多餘的單一戰區分頁');
w3.setStoryRecordEraView('universe-review');html=w3.storyRecordPageHtml();assert(w3.getStoryRecordEraView()==='universe-review'&&html.includes('宇宙測試')&&!html.includes('觀測之外'),'W3 session 切到宇宙回顧後不得被 render 強制跳回高維紀元');
w3.setStoryRecordEraView('galaxy-review');html=w3.storyRecordPageHtml();assert(w3.getStoryRecordEraView()==='galaxy-review'&&html.includes('銀河測試')&&html.includes('序章'),'W3 銀河回顧應保留既有銀河紀錄與序章');
const w2=build({second:true,third:false});html=w2.storyRecordPageHtml();assert(w2.getStoryRecordEraView()==='universe'&&html.includes('宇宙紀元')&&html.includes('銀河紀元・回顧')&&!html.includes('高維紀元</button>'),'W2 Story Record 預設／分頁不可被 W3 改動');
const w1=build({second:false,third:false});html=w1.storyRecordPageHtml();assert(w1.getStoryRecordEraView()==='galaxy-review'&&html.includes('銀河測試')&&!html.includes('宇宙紀元・回顧'),'W1 Story Record 應維持銀河紀錄');
console.log('STORY RECORD PASSED | W3 default=yes | W3 11/11 replay list=yes | W2/W1 preserved | session era view preserved');
 
// Batch1: reincarnation archive is a read-only view, independent of formal completedStories.
function buildArchive({count=0,second=false,third=false,loaded=true}={}){
 const galaxyIds=Array.from({length:100},(_,i)=>`galaxy-archive-${i+1}`);
 const universeIds=Array.from({length:100},(_,i)=>`universe-archive-${i+1}`);
 const ids=['earth-prologue',...galaxyIds,...universeIds,...w3Ids];
 const stories=Object.fromEntries(ids.map(id=>[id,{id,title:id,chapter:id.startsWith('universe')?'宇宙紀元':'銀河紀元',location:'測試',pages:loaded?['正文']:[]}]));
 const archiveState={reincarnation:{count},secondWorld:{entered:second||third},thirdWorld:{entered:third,completed:false,story:{introSeen:false,unlockedStage:0,finalSeen:false},bosses:Array.from({length:10},()=>({currentHp:100}))},storyProgress:{completedStories:[],pendingStory:null}};
 const opened=[];
 const ctx={console,state:archiveState,storyReincarnationContext(target){return {reincarnationRun:Number(target?.reincarnation?.count)>=1};},render(){},CIVILIZATION_STORIES:stories,
  CIVILIZATION_STORY_REGIONS:[{id:'galaxy',name:'銀河',stories:galaxyIds.map(id=>({id}))}],
  CIVILIZATION_UNIVERSE_STORY_REGIONS:[{id:'universe',name:'宇宙',stories:universeIds.map(id=>({id}))}],
  thirdWorldStoryTriggerDescriptors:()=>w3Ids.map((storyId,index)=>({storyId,kind:index===0?'intro':index===10?'final':'milestone',stage:index})),
  civilizationStoryProgress:{get:()=>archiveState.storyProgress},
  isSecondWorldEntered:()=>archiveState.secondWorld.entered,isThirdWorldEntered:()=>archiveState.thirdWorld.entered,
  openStory(id,options){opened.push({id,options});return true;}
 };
 ctx.window=ctx;vm.createContext(ctx);vm.runInContext(source,ctx,{filename:'storyrecordtabs.js'});
 return {ctx,opened,galaxyIds,universeIds,archiveState};
}
assert(source.includes('STORY_RECORD_REINCARNATION_ARCHIVE_VERSION=1'),'轉生戰線紀錄唯讀 owner 未載入');
for(const count of [1,2,3]){
 const x=buildArchive({count});
 const before=JSON.stringify(x.archiveState);
 let html=x.ctx.storyRecordPageHtml();
 assert((html.match(/story-record-entry/g)||[]).length===101,`轉生${count}輪銀河101篇必須立即顯示`);
 assert(x.ctx.replayStoryRecordEntry('galaxy-archive-1')===true,'轉生紀錄應可以 generic 重播未標記 completed 的劇情');
 assert(x.opened[0].options.lifecycleOwner==='generic','紀錄回顧不得冒充 formal 劇情');
 assert(JSON.stringify(x.archiveState)===before,'唯讀戰線紀錄不可寫入遊戲狀態');
 assert(x.ctx.replayStoryRecordEntry('universe-archive-1')===false,'未進入宇宙紀元不得提前解鎖宇宙篇章');
 const y=buildArchive({count,second:true});
 const yBefore=JSON.stringify(y.archiveState);
 html=y.ctx.storyRecordPageHtml();
 assert((html.match(/story-record-entry/g)||[]).length===100,`轉生${count}輪宇宙100篇必須在進入時顯示`);
 y.ctx.setStoryRecordEraView('galaxy-review');html=y.ctx.storyRecordPageHtml();
 assert((html.match(/story-record-entry/g)||[]).length===101,'宇宙紀元應同時保留銀河101篇');
 assert(JSON.stringify(y.archiveState)===yBefore,'切換戰線紀錄不可更新 formal state');
 const z=buildArchive({count,second:true,third:true});
 const zBefore=JSON.stringify(z.archiveState);
 html=z.ctx.storyRecordPageHtml();
 assert((html.match(/story-record-entry/g)||[]).length===11,'高維紀元11篇應在進入時全部可回顧');
 assert(z.ctx.replayStoryRecordEntry('higher-dimensional-final')===true,'高維 Final 可直接 generic 回顧');
 assert(z.opened[0].options.lifecycleOwner==='generic','高維 Final 回顧不得完成正式劇情');
 z.ctx.setStoryRecordEraView('universe-review');
 assert((z.ctx.storyRecordPageHtml().match(/story-record-entry/g)||[]).length===100,'高維宇宙回顧仍須100篇');
 z.ctx.setStoryRecordEraView('galaxy-review');
 assert((z.ctx.storyRecordPageHtml().match(/story-record-entry/g)||[]).length===101,'高維銀河回顧仍須101篇');
 assert(JSON.stringify(z.archiveState)===zBefore,'高維11篇回顧不得更改 completed / introSeen / finalSeen / Boss / 通關');
}
const first=buildArchive({count:0,second:true,third:true});
assert(!first.ctx.storyRecordPageHtml().includes('story-record-entry'),'首輪未完成劇情不得提前進入戰線紀錄');
assert(first.ctx.replayStoryRecordEntry('higher-dimensional-final')===false,'首輪不可偷看未完成 Final');
const unloaded=buildArchive({count:2,second:true,third:true,loaded:false});
assert(!unloaded.ctx.storyRecordPageHtml().includes('story-record-entry'),'尚未載入正式頁面的紀錄不可誤視為已就緒');
assert(source.includes("STORY_RECORD_ARCHIVE_CONTEXT_UNIFICATION_VERSION=1"),'戰線紀錄使用正式 storyReincarnationContext owner');
assert(source.includes("STORY_RECORD_RENDER_SET_REUSE_VERSION=1"),'單次 render 共用同一 completed set');
assert(!source.includes("Number.isInteger(count)"),'戰線紀錄不得再自行建立轉生判定');
const oldMalformed=buildArchive({count:2,second:true});
oldMalformed.archiveState.reincarnation.count="2";
assert((oldMalformed.ctx.storyRecordPageHtml().match(/story-record-entry/g)||[]).length===101,'正式 lifecycle owner 統一解讀可規範化的舊數字轉生資料');
const copy=buildArchive({count:2,second:true});
assert(copy.ctx.storyRecordPageHtml().includes('文明歷史已永久歸檔'),'轉生後 UI 應採永久歷史文案');
assert(!first.ctx.storyRecordPageHtml().includes('文明歷史已永久歸檔'),'首輪應維持原有正式劇情文案');
console.log('REINCARNATION STORY ARCHIVE BATCH1 PASSED | count 0/1/2/3 | 101/100/11 | entry without bosses | read-only | final isolated');
