const fs=require("fs");
const vm=require("vm");
function assert(condition,message){if(!condition)throw new Error(message);}
function textOf(categories){return (Array.isArray(categories)?categories:[]).flatMap(category=>[category?.label,...(Array.isArray(category?.items)?category.items.flatMap(item=>Array.isArray(item)?item:[]):[])]).join("\n");}
const context={console,Math,JSON,Object,Array,Set,Map,String,Number,Boolean,RegExp,Error,Date};
context.window=context;
context.MIRROR_DUNGEON_CONFIG={runBattles:20};
context.currentWorldPhase=target=>target?.thirdWorld?.entered===true?3:(target?.secondWorld?.entered===true?2:1);
context.effectiveLevelCap=target=>target?.thirdWorld?.entered===true?2000:(target?.secondWorld?.entered===true?1000:500);
context.effectiveExpNeed=(level,target)=>target?.thirdWorld?.entered===true?10000000:12345;
context.effectiveEnhancementCap=target=>target?.thirdWorld?.entered===true?40:20;
context.THIRD_WORLD_ENTRY_CONFIG={level:1000,vipLevel:20};
context.THIRD_WORLD_EQUIPMENT_BASE_POLICY={legendaryChance:.95,mythicChance:.05};
context.DEATH_EQUIPMENT_LOSS_CHANCE=.30;
context.OFFLINE_PROGRESS_MAX_HOURS=12;
context.THIRD_WORLD_BOSS_COUNT=10;
context.THIRD_WORLD_BOSS_MAX_HP=1100000000;
context.THIRD_WORLD_FIVE_POINT_HP_GAP=55000000;
context.THIRD_WORLD_RUN_MAX_DEATHS=100;
context.THIRD_WORLD_BOSS_STAGE_CONFIG={maxStage:9,atkPerStage:600,defPerStage:1200,critPointsPerStage:2,dodgePointsPerStage:2,stepPercent:10};
context.THIRD_WORLD_EQUIPMENT_NAME_ROWS=Array.from({length:10},(_,index)=>({index}));
context.THIRD_WORLD_CORE_MAX_LEVEL=10;
context.THIRD_WORLD_CORE_COST_PER_LEVEL=1000000000;
context.THIRD_WORLD_SUPPRESSION_BASE_POINTS=.5;
context.THIRD_WORLD_CORE_SUPPRESSION_REDUCTION_PER_LEVEL=.04;
vm.createContext(context);
for(const file of ["gameguide.js","mirrordungeonguide.js","cloudsaveguide.js"])vm.runInContext(fs.readFileSync(file,"utf8"),context,{filename:file});
assert(typeof context.registerGameGuideExtension==="function","Guide shared extension registry missing.");
assert(JSON.stringify(context.gameGuideExtensionIds())===JSON.stringify(["mirror-dungeon","cloud-save"]),"Guide extension registration/order drift.");
const expectedIds={1:["adventure","gear","combat","special","dungeon","growth"],2:["adventure","gear","combat","special","dungeon","growth"],3:["adventure","gear","combat","dungeon","growth"]};
for(const phase of [1,2,3]){
 context.state={level:phase===3?1000:phase===2?501:1,secondWorld:{entered:phase>=2},thirdWorld:{entered:phase===3}};
 const categories=context.gameGuideCategoriesForState(context.state),ids=categories.map(row=>row?.id),dungeon=categories.find(row=>row?.id==="dungeon"),text=textOf(categories);
 assert(JSON.stringify(ids)===JSON.stringify(expectedIds[phase]),`Phase ${phase} category resolver drift: ${JSON.stringify(ids)}`);
 assert(dungeon&&Array.isArray(dungeon.items),`Phase ${phase} dungeon guide missing.`);
 assert(dungeon.items.filter(item=>Array.isArray(item)&&item[0]==="鏡像戰").length===1,`Phase ${phase} mirror guide must appear exactly once.`);
 const html=context.gameGuidePage();
 assert((html.match(/帳號與雲端存檔/g)||[]).length===1,`Phase ${phase} cloud guide must appear exactly once.`);
 if(phase===3){
  assert(categories[0]?.label==="高維戰線","W3 first category must be 高維戰線.");
  assert(!/(暗物質|暗能量|強化石|文明災厄|特殊怪|懸賞戰|印記)/.test(text),"W3 rendered guide contains retired W1/W2-only terminology.");
  assert(!/十王|十名高維存在/.test(text)&&/10 名高維存在/.test(text),"W3 rendered guide terminology must use 10 名高維存在.");
  for(const token of ["Lv2000","10,000,000 EXP","95% 傳說","5% 神話","+40 強化","VIP20","30%","12 小時","55,000,000 HP","100 次死亡"]){assert(text.includes(token),`W3 rendered guide missing canonical owner value: ${token}`);}
  assert(text.includes("背景補播與快速追趕只加速等待與演出"),"W3 Fast Catch-up wording must describe presentation/wait acceleration.");
  assert(text.includes("不會因補播機制額外加發正式進度或收益"),"W3 Fast Catch-up wording must forbid extra progress/reward caused by catch-up itself.");
  assert(text.includes("實際戰鬥仍依正式戰鬥與結算流程落帳"),"W3 Fast Catch-up wording must state formal combat/settlement still applies.");
  const before=context.gameGuidePage();context.setGameGuideCategory("special");const after=context.gameGuidePage();
  assert(!after.includes('data-guide-category="special" class="active"'),"W3 must reject legacy special category selection.");
 }
}
const cloud=fs.readFileSync("cloudsaveguide.js","utf8"),mirror=fs.readFileSync("mirrordungeonguide.js","utf8");
assert(!/window\.gameGuidePage\s*=/.test(cloud),"Cloud guide must not monkey-patch gameGuidePage.");
assert(!/GAME_GUIDE_CATEGORIES/.test(mirror),"Mirror guide must not mutate legacy base categories directly.");
const saveMigration=fs.readFileSync("savemigration.js","utf8");
assert(/const SAVE_SCHEMA_VERSION=16;/.test(saveMigration),"Guide optimization must not change Save Schema 16.");
console.log("GAME GUIDE EXTENSION INTEGRITY PASSED: W1/W2/W3 behavior, terminology, canonical values, catch-up semantics, extensions, schema16");
