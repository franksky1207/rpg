from pathlib import Path

TAG='20260928-thirdworld-guide-batch4'

p=Path('gameguide.js')
s=p.read_text(encoding='utf-8')
anchor=' let activeGuideCategory="adventure";\n'
if anchor not in s: raise SystemExit('activeGuideCategory anchor missing')
insert=r''' let activeGuideCategory="adventure";
 function guidePhase(target=null){
  const holder=target&&typeof target==="object"?target:(typeof state!=="undefined"&&state&&typeof state==="object"?state:null);
  if(typeof window.currentWorldPhase==="function"){
   try{const value=Number(window.currentWorldPhase(holder));if(Number.isInteger(value)&&value>=1&&value<=3)return value;}catch(_){}
  }
  if(holder?.thirdWorld?.entered===true)return 3;
  if(holder?.secondWorld?.entered===true)return 2;
  return 1;
 }
 function thirdWorldBossSpecializationGuideText(){
  const rows=Array.isArray(window.THIRD_WORLD_BOSS_DEFINITIONS)?window.THIRD_WORLD_BOSS_DEFINITIONS:[];
  if(!rows.length)return "十名高維存在各自具有不同個體特化，詳細數值以冒險頁當前顯示為準。";
  return rows.map((boss,index)=>{const profile=typeof window.thirdWorldBossSpecializationPresentation==="function"?window.thirdWorldBossSpecializationPresentation(index):null;return `${boss?.name||`高維存在 ${index+1}`}：${profile?.label||"個體特化"}${profile?.effect?`（${profile.effect}）`:""}`;}).join("；");
 }
 function thirdWorldAbilityGuideText(){
  const rows=Array.isArray(window.THIRD_WORLD_BOSS_ABILITY_DEFINITIONS)?window.THIRD_WORLD_BOSS_ABILITY_DEFINITIONS:[];
  if(!rows.length)return "Boss 永久 HP 降低後會逐步解鎖共通能力，詳細門檻以高維戰線顯示為準。";
  return `Boss 剩餘 HP 降到指定門檻時依序解鎖：${rows.map(row=>`${Math.max(0,Number(row?.unlockRemainingPercent)||0)}% ${row?.name||"高維能力"}`).join("、")}。`;
 }
 function thirdWorldStageGuideText(){
  const cfg=window.THIRD_WORLD_BOSS_STAGE_CONFIG||{};
  const atk=Math.max(0,Math.floor(Number(cfg.atkPerStage)||600)),def=Math.max(0,Math.floor(Number(cfg.defPerStage)||1200)),crit=Math.max(0,Number(cfg.critPointsPerStage)||2),dodge=Math.max(0,Number(cfg.dodgePointsPerStage)||2);
  return `Boss 永久 HP 每跨過 90%、80%……10% 門檻就進入下一個 Stage，最高 Stage 9。每提升 1 Stage：ATK +${atk.toLocaleString()}、DEF +${def.toLocaleString()}、暴擊 +${crit}%、閃避 +${dodge}%。`;
 }
 function thirdWorldCoreGuideText(){
  const max=Math.max(0,Math.floor(Number(window.THIRD_WORLD_CORE_MAX_LEVEL)||10)),cost=Math.max(1,Math.floor(Number(window.THIRD_WORLD_CORE_COST_PER_LEVEL)||1000000000)),base=Math.max(0,Number(window.THIRD_WORLD_SUPPRESSION_BASE_POINTS)||.5),reduction=Math.max(0,Number(window.THIRD_WORLD_CORE_SUPPRESSION_REDUCTION_PER_LEVEL)||.04);
  return `界弦核心最高 Lv.${max}，每級需注入 ${cost.toLocaleString()} 維度之弦。高維連戰每次死亡基礎會把本輪 HP 上限再壓低 ${base.toFixed(2)}%；核心每提升 1 級，會把每次死亡的壓制幅度減少 ${reduction.toFixed(2)}%。連戰開始後核心等級會鎖定到該輪結束。`;
 }
 function thirdWorldGuideCategories(target=null){
  const bossCount=Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_COUNT)||10)),bossHp=Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_MAX_HP)||1100000000)),gap=Math.max(1,Math.floor(Number(window.THIRD_WORLD_FIVE_POINT_HP_GAP)||55000000)),maxDeaths=Math.max(1,Math.floor(Number(window.THIRD_WORLD_RUN_MAX_DEATHS)||100);
  return [
   {id:"adventure",label:"高維戰線",items:[
    ["高維紀元",`第三紀元以同時攻略 ${bossCount} 名高維存在為主線。正式成長只在高維紀元進行；銀河與宇宙內容改為回顧，不再產生正式成長。`],
    ["十王戰線",`十名高維存在各有 ${bossHp.toLocaleString()} 最大 HP，全部保留各自永久 HP。玩家可以在仍存活且符合戰線限制的目標之間切換。`],
    ["永久削血","每場正式戰鬥以 Boss 目前永久 HP 開始；本場實際削掉的 HP 會永久保留。汲取只能在該場戰鬥內回復角色 HP，不會回復 Boss 已被永久削掉的 HP。"],
    ["5% 戰線",`存活 Boss 之間最多只能相差 5% 戰線；以目前十王基準換算為 ${gap.toLocaleString()} HP。若目標已超前，該場若已合法開始仍完整結算，但下一場會鎖定，直到其他存活 Boss 跟上。最後一名存活 Boss 不受此限制。`],
    ["連續戰鬥",`高維主線以連續戰鬥為主要流程。沒有進度事件時，一輪最多累積 ${maxDeaths} 次死亡；玩家可手動停止。Boss 擊破、Stage 跨越、5% 戰線鎖定或整體進度事件都會結束本輪，確認後再開始下一輪。`],
    ["回顧戰","已擊破的高維存在可在原位置進行回顧戰；回顧固定使用最終高階狀態，角色以完整 HP 開場，不會取得 EXP、維度之弦、裝備，也不會改變任何正式 Boss 進度。冒險頁亦可切回銀河／宇宙回顧。"],
    ["高維離線","完成正式前景高維戰鬥並成功結算後，可建立高維離線裝備樣本。離線只模擬裝備掉落機會，不取得 EXP、維度之弦，也不推進界弦核心、稱號、劇情或 Boss 永久 HP。最多計算 12 小時。"],
    ["目前等級上限","高維紀元角色等級上限為 Lv2000。Lv1000～1999 每級固定需要 10,000,000 EXP；到達 Lv2000 後不再累積 EXP。"]
   ]},
   {id:"gear",label:"角色與裝備",items:[
    ["高維裝備","每場可正式落帳的高維戰鬥都會產生高維裝備。基礎品質池為 95% 傳說、5% 神話，並繼續套用目前仍有效的 VIP 裝備特權。"],
    ["裝備等級","高維裝備等級依正式結算後的角色等級產生，最高 Lv2000。"],
    ["裝備命名","高維裝備名稱會隨十王整體永久 HP 進度分成 10 個階段變化；只影響名稱與風格，不另建第二套戰鬥公式。"],
    ["裝備處理","高維裝備可在背包比較、裝備與整理；高維裝備本身沒有販售價值，裝備處理不會額外產生主要資源。"],
    ["裝備欄位強化","第三紀元沿用已完成的五部位 +40 強化，強化等級永久保留；高維紀元不再新增更高的欄位強化階段。"],
    ["VIP20 裝備保護","第三紀元死亡仍會執行原本 30% 的裝備遺失判定，但進入第三紀元本來就要求 VIP20，因此所有實際裝備遺失都會被 VIP20 阻止。高維連戰結算會顯示本輪成功阻止的次數。"]
   ]},
   {id:"combat",label:"高維戰鬥",items:[
    ["戰鬥結算","正式戰鬥只在角色死亡或 Boss 被擊破後形成可落帳結果；有效永久削血等於該場開始時正式 Boss HP 減去戰鬥結束 HP。"],
    ["戰鬥收益","每 1 點有效永久削血同時換算為 1 EXP 與 1 維度之弦。即使角色死亡，只要該場是合法且完整的正式戰鬥，仍可依實際永久削血完成結算。"],
    ["十王個體特化",thirdWorldBossSpecializationGuideText()],
    ["Stage 強化",thirdWorldStageGuideText()],
    ["共通能力",thirdWorldAbilityGuideText()],
    ["死亡壓制","高維連戰的死亡次數只在本輪 runtime 中累積，不寫入存檔。角色死亡且 Boss 尚未擊破時才增加 1 次死亡；下一場的可用 HP 上限會依本輪死亡壓制重新計算。"],
    ["戰鬥速度","第三紀元沿用已解鎖的 1.5× 戰鬥速度，可隨時切回 1×；GM 測試速度不改變正式玩家規則。"]
   ]},
   {id:"dungeon",label:"副本與 VIP",items:[
    ["高維副本","進入第三紀元後，副本首頁只呈現目前仍可使用的模式與高維狀態；不適用的舊模式不再作為第三紀元正式成長來源。"],
    ["高維競技場","高維競技場目前尚未開放，入口維持等待狀態，不會偷偷沿用舊紀元競技場規則。"],
    ["虛空幻境","虛空幻境不分紀元並完整承接既有進度；仍可依正式規則挑戰與取得對應 VIP 積分。"],
    ["鏡像戰","鏡像戰不分紀元並完整承接既有進度；仍使用開始挑戰時的角色戰力建立對手。"],
    ["VIP 系統","VIP 等級沒有上限；VIP20 是最後一個特殊特權階段，之後仍可持續提升基本能力。第三紀元會繼續套用目前仍有效的 VIP 特權。"],
    ["VIP20","VIP20 同時是進入第三紀元的必要條件，也是第三紀元死亡裝備保護的來源；高維結算會把這項保護明確呈現給玩家。"]
   ]},
   {id:"growth",label:"高維成長",items:[
    ["維度之弦","維度之弦是第三紀元的永久成長資源；正式戰鬥每造成 1 點有效永久削血，就取得 1 點維度之弦。"],
    ["界弦核心",thirdWorldCoreGuideText()],
    ["核心注入","可將目前持有的維度之弦一次注入界弦核心，連續跨級時進度會正確保留。高維連戰進行中不能注入，必須先停止該輪戰鬥。"],
    ["高維稱號","十王整體永久 HP 降到指定門檻時會推進高維稱號；稱號進度由十王總剩餘 HP 統一判定，不依單一 Boss 或回顧戰重複發放。"],
    ["既有養成","進入第三紀元前已完成的角色養成會依正式戰鬥 owner 繼續生效；第三紀元本身不再新增另一套平行養成資源或重複系統。"],
    ["極簡模式","高維連續戰鬥可使用共用極簡模式；背景補播與快速追趕只處理演出／節奏，不會額外創造正式高維進度。"],
    ["存檔","角色正式進度會持續寫入本機存檔；帳號登入後仍可使用設定頁的手動雲端上傳／下載。高維連戰的死亡次數、目前目標與最近戰鬥摘要都屬暫時狀態，不會寫入正式存檔。"]
   ]}
  ];
 }
'''
s=s.replace(anchor,insert,1)
old=''' function guideUniverse(target=null){\n  const holder=target&&typeof target==="object"?target:(typeof state!=="undefined"&&state&&typeof state==="object"?state:null);\n  return typeof window.isSecondWorldEntered==="function"?window.isSecondWorldEntered(holder)===true:holder?.secondWorld?.entered===true;\n }'''
new=''' function guideUniverse(target=null){return guidePhase(target)===2;}'''
if old not in s: raise SystemExit('guideUniverse block missing')
s=s.replace(old,new,1)
old=''' function gameGuideCategoriesForState(target=null){\n  return GUIDE_CATEGORIES.map(category=>({...category,items:(category.items||[]).map((item,index)=>{'''
new=''' function gameGuideCategoriesForState(target=null){\n  if(guidePhase(target)===3)return thirdWorldGuideCategories(target);\n  return GUIDE_CATEGORIES.map(category=>({...category,items:(category.items||[]).map((item,index)=>{'''
if old not in s: raise SystemExit('categories block missing')
s=s.replace(old,new,1)
s=s.replace(' window.GAME_GUIDE_VERSION=20;',' window.GAME_GUIDE_VERSION=21;',1)
s=s.replace(' window.GAME_GUIDE_WORLD_AWARE_VERSION=7;',' window.GAME_GUIDE_WORLD_AWARE_VERSION=8;\n window.GAME_GUIDE_WORLD_PHASE_OWNER_VERSION=1;\n window.GAME_GUIDE_THIRD_WORLD_VERSION=1;',1)
old='''  const worldLabel=guideUniverse()?"宇宙紀元":"銀河紀元";'''
new='''  const phase=guidePhase(),worldLabel=phase===3?"高維紀元":phase===2?"宇宙紀元":"銀河紀元";'''
if old not in s: raise SystemExit('world label missing')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

p=Path('index.html')
s=p.read_text(encoding='utf-8')
old='gameguide.js?v=20260928-thirdworld-vip20-death-protection1'
new=f'gameguide.js?v={TAG}'
if s.count(old)!=1: raise SystemExit(f'gameguide cache old count={s.count(old)}')
p.write_text(s.replace(old,new,1),encoding='utf-8')

p=Path('tests/runtime/js-integrity.js')
s=p.read_text(encoding='utf-8')
old='''assert(/第三紀元仍保留這個原判定/.test(gameGuideSource)&&/VIP20 完全攔下/.test(gameGuideSource),"遊戲說明必須明確解釋 W3 的 VIP20 死亡裝備保護。");'''
new=r'''const thirdWorldGuideSource=(gameGuideSource.match(/function thirdWorldGuideCategories[\s\S]*?function guideUniverse/)||[""])[0];
assert(/GAME_GUIDE_VERSION=21/.test(gameGuideSource)&&/GAME_GUIDE_WORLD_AWARE_VERSION=8/.test(gameGuideSource)&&/GAME_GUIDE_WORLD_PHASE_OWNER_VERSION=1/.test(gameGuideSource)&&/GAME_GUIDE_THIRD_WORLD_VERSION=1/.test(gameGuideSource),"遊戲說明必須由同一 owner 正式支援三紀元，並提供 W3 Guide V1。");
assert(/if\(guidePhase\(target\)===3\)return thirdWorldGuideCategories\(target\)/.test(gameGuideSource)&&/phase===3\?"高維紀元"/.test(gameGuideSource),"W3 遊戲說明必須按 current world phase 路由，不得再誤投影宇宙紀元。");
assert(/永久削血/.test(thirdWorldGuideSource)&&/5% 戰線/.test(thirdWorldGuideSource)&&/Stage 強化/.test(thirdWorldGuideSource)&&/共通能力/.test(thirdWorldGuideSource)&&/死亡壓制/.test(thirdWorldGuideSource)&&/界弦核心/.test(thirdWorldGuideSource)&&/維度之弦/.test(thirdWorldGuideSource)&&/高維離線/.test(thirdWorldGuideSource)&&/回顧戰/.test(thirdWorldGuideSource),"W3 Guide 必須涵蓋十王正式核心規則、成長、離線與回顧。");
assert(/thirdWorldBossSpecializationPresentation/.test(thirdWorldGuideSource)&&/THIRD_WORLD_BOSS_ABILITY_DEFINITIONS/.test(thirdWorldGuideSource)&&/THIRD_WORLD_BOSS_STAGE_CONFIG/.test(thirdWorldGuideSource),"W3 Guide 的十王特化、共通能力與 Stage 必須委派 canonical owner，不得複製第二份數值表。");
assert(!/(暗物質|暗能量|強化石|文明災厄|特殊怪|懸賞戰|印記)/.test(thirdWorldGuideSource),"W3 玩家說明不得殘留第一／二紀元專屬資源、特殊怪、懸賞、災厄或印記語意。");
assert(/第三紀元死亡仍會執行原本 30% 的裝備遺失判定/.test(thirdWorldGuideSource)&&/VIP20/.test(thirdWorldGuideSource),"W3 Guide 必須保留 VIP20 死亡裝備保護的玩家體感說明。");
assert(index.includes('gameguide.js?v=20260928-thirdworld-guide-batch4'),"第4批修改 gameguide.js 後必須同步更新 index.html cache-bust。");'''
if old not in s: raise SystemExit('old guide integrity assertion missing')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('batch4 guide patch applied')
