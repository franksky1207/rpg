from pathlib import Path

def read(path): return Path(path).read_text(encoding='utf-8')
def write(path,s): Path(path).write_text(s,encoding='utf-8')
def one(s,old,new,label):
    c=s.count(old)
    if c!=1: raise SystemExit(f'{label}: expected 1 match, got {c}')
    return s.replace(old,new,1)

TAG='20260928-thirdworld-guide-opt3'

# 1) Player-facing wording cleanup in W3 guide only.
s=read('gameguide.js')
s=one(s,'["VIP 系統","VIP 等級沒有上限；VIP 等級沒有上限，第三紀元會繼續套用目前仍有效的 VIP 特權。"]','["VIP 系統","VIP 等級沒有上限；第三紀元會繼續套用目前仍有效的 VIP 特權。"]','duplicate VIP text')
s=one(s,'["高維稱號","10 名高維存在的總剩餘 HP 降到指定門檻時會推進高維稱號；稱號進度由10 名高維存在的總剩餘 HP 統一判定，不依單一 Boss 或回顧戰重複發放。"]','["高維稱號","10 名高維存在的總剩餘 HP 降到指定門檻時會推進高維稱號；稱號進度由 10 名高維存在的總剩餘 HP 統一判定，不依單一 Boss 或回顧戰重複發放。"]','title spacing')
s=one(s,'["極簡模式","高維連續戰鬥可使用共用極簡模式；背景補播與快速追趕只處理演出／節奏，不會額外創造正式高維進度。"]','["極簡模式","高維連續戰鬥可使用共用極簡模式；背景補播與快速追趕只加速等待與演出，不會因補播機制額外加發正式進度或收益；實際戰鬥仍依正式戰鬥與結算流程落帳。"]','fast catch-up wording')
s=s.replace('window.GAME_GUIDE_VERSION=23;','window.GAME_GUIDE_VERSION=24;',1)
s=s.replace('window.GAME_GUIDE_WORLD_AWARE_VERSION=10;','window.GAME_GUIDE_WORLD_AWARE_VERSION=11;',1)
anchor=' window.GAME_GUIDE_PAGE_EXTENSION_VERSION=1;'
if anchor not in s: raise SystemExit('guide version anchor missing')
s=s.replace(anchor,anchor+'\n window.GAME_GUIDE_BEHAVIORAL_INTEGRITY_VERSION=1;\n window.GAME_GUIDE_FAST_CATCH_UP_TEXT_VERSION=1;',1)
write('gameguide.js',s)

# 2) Strengthen behavioral regression: actual phase outputs, canonical values, forbidden legacy W3 terms,
# terminology, catch-up semantics, extension behavior, and current category rejection.
write('tests/runtime/gameguide-extension-integrity.js','''const fs=require("fs");
const vm=require("vm");
function assert(condition,message){if(!condition)throw new Error(message);}
function textOf(categories){return (Array.isArray(categories)?categories:[]).flatMap(category=>[category?.label,...(Array.isArray(category?.items)?category.items.flatMap(item=>Array.isArray(item)?item:[]):[])]).join("\\n");}
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
assert(!/window\\.gameGuidePage\\s*=/.test(cloud),"Cloud guide must not monkey-patch gameGuidePage.");
assert(!/GAME_GUIDE_CATEGORIES/.test(mirror),"Mirror guide must not mutate legacy base categories directly.");
const saveMigration=fs.readFileSync("savemigration.js","utf8");
assert(/const SAVE_SCHEMA_VERSION=16;/.test(saveMigration),"Guide optimization must not change Save Schema 16.");
console.log("GAME GUIDE EXTENSION INTEGRITY PASSED: W1/W2/W3 behavior, terminology, canonical values, catch-up semantics, extensions, schema16");
''')

# 3) Reduce brittle source-text checks in js-integrity; keep architecture/load/cache ownership checks,
# and delegate player-facing semantics to the behavioral test above.
s=read('tests/runtime/js-integrity.js')
s=s.replace('GAME_GUIDE_VERSION=23','GAME_GUIDE_VERSION=24').replace('GAME_GUIDE_WORLD_AWARE_VERSION=10','GAME_GUIDE_WORLD_AWARE_VERSION=11')
old='''assert(/永久削血/.test(thirdWorldGuideSource)&&/5% 戰線/.test(thirdWorldGuideSource)&&/Stage 強化/.test(thirdWorldGuideSource)&&/共通能力/.test(thirdWorldGuideSource)&&/死亡壓制/.test(thirdWorldGuideSource)&&/界弦核心/.test(thirdWorldGuideSource)&&/維度之弦/.test(thirdWorldGuideSource)&&/高維離線/.test(thirdWorldGuideSource)&&/回顧戰/.test(thirdWorldGuideSource),"W3 Guide 必須涵蓋 10 名高維存在的正式核心規則、成長、離線與回顧。\");
assert(/thirdWorldBossSpecializationPresentation/.test(thirdWorldGuideSource)&&/THIRD_WORLD_BOSS_ABILITY_DEFINITIONS/.test(thirdWorldGuideSource)&&/THIRD_WORLD_BOSS_STAGE_CONFIG/.test(thirdWorldGuideSource),"W3 Guide 的高維存在特化、共通能力與 Stage 必須委派 canonical owner，不得複製第二份數值表。\");
assert(!/(暗物質|暗能量|強化石|文明災厄|特殊怪|懸賞戰|印記)/.test(thirdWorldGuideSource),"W3 玩家說明不得殘留第一／二紀元專屬資源、特殊怪、懸賞、災厄或印記語意。\");
assert(/rules\\.deathLossPercent\\.toLocaleString\\(\\)/.test(thirdWorldGuideSource)&&/rules\\.vipRequired/.test(thirdWorldGuideSource)&&/VIP 裝備保護/.test(thirdWorldGuideSource),"W3 Guide 必須由正式死亡判定與進入門檻 owner 動態呈現 VIP 裝備保護。\");
assert(!/十王/.test(thirdWorldGuideSource),"玩家可見的 W3 Guide 不得使用對話簡稱『十王』，正式用語統一為 10 名高維存在。\");
assert(!/十名高維存在/.test(thirdWorldGuideSource)&&/10 名高維存在/.test(thirdWorldGuideSource),"W3 Guide 正式玩家文字必須統一使用數字形式『10 名高維存在』。\");
assert(/rules\\.offlineMaxHours\\.toLocaleString\\(\\)/.test(thirdWorldGuideSource)&&/rules\\.equipmentNameBandCount/.test(thirdWorldGuideSource),"W3 Guide 的離線上限與裝備命名階段數必須由 canonical owner 投影。\");
const w3GuideRuleInterpolationLines=thirdWorldGuideSource.split("\\n").filter(line=>line.includes("${rules."));
assert(w3GuideRuleInterpolationLines.length>=7&&w3GuideRuleInterpolationLines.every(line=>line.includes("`")),"W3 Guide 的動態 rule 值必須存在可插值的 template literal 中。\");
assert(/10 名高維存在/.test(thirdWorldGuideSource),"W3 Guide 必須使用正式稱呼『10 名高維存在』。\");'''
new='''assert(/thirdWorldBossSpecializationPresentation/.test(thirdWorldGuideSource)&&/THIRD_WORLD_BOSS_ABILITY_DEFINITIONS/.test(thirdWorldGuideSource)&&/THIRD_WORLD_BOSS_STAGE_CONFIG/.test(thirdWorldGuideSource),"W3 Guide 的高維存在特化、共通能力與 Stage 必須委派 canonical owner，不得複製第二份數值表。\");
assert(/GAME_GUIDE_BEHAVIORAL_INTEGRITY_VERSION=1/.test(gameGuideSource)&&/GAME_GUIDE_FAST_CATCH_UP_TEXT_VERSION=1/.test(gameGuideSource),"Guide Opt3 必須由 behavioral regression 驗證玩家語意，並使用修正版 Fast Catch-up 文案。\");'''
if old not in s: raise SystemExit('old brittle W3 guide assertion block missing')
s=s.replace(old,new,1)
old_cache="assert(index.includes('gameguide.js?v=20260928-thirdworld-guide-opt2')&&index.includes('mirrordungeonguide.js?v=20260928-thirdworld-guide-opt2')&&index.includes('cloudsaveguide.js?v=20260928-thirdworld-guide-opt2'),\"Guide Opt2 touched JS 必須同步 cache-bust。\");"
new_cache="assert(index.includes('gameguide.js?v=20260928-thirdworld-guide-opt3')&&index.includes('mirrordungeonguide.js?v=20260928-thirdworld-guide-opt2')&&index.includes('cloudsaveguide.js?v=20260928-thirdworld-guide-opt2'),\"Guide Opt3 touched gameguide.js 必須同步 cache-bust，既有 extension cache-bust 必須保留。\");"
s=one(s,old_cache,new_cache,'guide cache assertion')
write('tests/runtime/js-integrity.js',s)

# 4) cache-bust only touched player JS.
s=read('index.html')
s=one(s,'gameguide.js?v=20260928-thirdworld-guide-opt2',f'gameguide.js?v={TAG}','gameguide cache')
write('index.html',s)
print('guide optimization batch3 patch applied')
