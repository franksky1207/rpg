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
 const context={console,state:{secondWorld:{entered:second},thirdWorld:{entered:third}},render(){},CIVILIZATION_STORIES:stories,CIVILIZATION_STORY_REGIONS:[{id:'galaxy',name:'銀河測試區',stories:[{id:'galaxy-probe'}]}],CIVILIZATION_UNIVERSE_STORY_REGIONS:[{id:'universe',name:'宇宙測試區',stories:[{id:'universe-probe'}]}],civilizationStoryProgress:{get:()=>({completedStories:completed})},thirdWorldStoryTriggerDescriptors:()=>w3Ids.map((storyId,index)=>({storyId,kind:index===0?'intro':index===10?'final':'milestone',stage:index})),isSecondWorldEntered:()=>second||third,isThirdWorldEntered:()=>third};
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