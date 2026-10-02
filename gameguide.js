(function(){
 const GUIDE_CATEGORIES=[
  {id:"adventure",label:"冒險入門",items:[
   ["遊戲基本玩法","依目前紀元進行主線戰鬥、升級、取得裝備與推進戰區。"],
   ["主線地圖","主線內容會依目前紀元切換。"],
   ["地圖探索","尚未到達的主線內容會隨進度逐步解鎖。"],
   ["地圖推進","依目前紀元的主線條件推進。"],
   ["Boss","Boss 可依目前紀元規則進行挑戰。"],
   ["戰鬥模式","主線可依目前紀元支援單場或連續戰鬥。"],
   ["離線收益","離線超過 1 分鐘後可依最近有效戰鬥紀錄取得部分收益，最多計算 12 小時。"],
   ["目前等級上限","角色等級上限會依目前紀元決定。"]
  ]},
  {id:"gear",label:"角色與裝備",items:[
   ["角色能力","HP 代表生命值；攻擊影響造成的傷害；防禦可以降低受到的傷害；暴擊有機會造成更高傷害；閃避有機會完全避開一次攻擊。角色升級後，基礎 HP、攻擊與防禦也會成長。"],
   ["裝備部位","角色共有武器、頭盔、鎧甲、鞋子與飾品 5 個裝備部位。武器主要提升攻擊，頭盔與鞋子主要提升 HP，鎧甲主要提升防禦，飾品主要提升暴擊。"],
   ["裝備品質","裝備共有普通、優良、稀有、史詩、傳說、神話 6 種品質。品質越高，主要能力通常越強，也更容易擁有較多額外詞條；高品質裝備通常也具有更高的出售價值。"],
   ["裝備詞條","部分裝備除了主要能力之外，還會附帶攻擊、防禦、HP、暴擊或閃避等額外詞條。不同部位可以出現的詞條種類不同，同一件裝備不會重複出現相同詞條。"],
   ["裝備評分","裝備評分會綜合裝備提供的各種能力，用來快速比較同部位裝備的整體價值。一鍵裝備功能也會依照評分選擇較好的裝備。"],
   ["裝備掉落","裝備掉落規則與最高等級會依目前紀元切換。"],
   ["背包","背包可以查看裝備能力與評分、手動裝備與出售，也可以處理遺失裝備贖回。"],
   ["自動出售","普通、優良、稀有、史詩、傳說、神話 6 種品質都可在設定中自行勾選自動出售；鎖定裝備不會被自動出售，開啟「若新裝備比目前裝備強，自動保留」時，較強掉落也會優先保留。出售資源會依目前紀元切換。"],
   ["死亡懲罰","戰鬥失敗不會損失任何既有 EXP。正式死亡流程仍有 30% 機率遺失一件已裝備的裝備；VIP20 可以完全防止死亡時遺失裝備。第三紀元仍保留這個原判定，但因進入第三紀元必須達成 VIP20，所以裝備遺失會被 VIP20 全部阻止，並在高維連戰結算中顯示保護結果。"],
   ["裝備欄位強化","五個裝備欄位的強化會永久保留，並依目前紀元使用對應的強化資源與上限。"],
   ["強化石","強化石屬於銀河紀元的強化資源。"]
  ]},
  {id:"combat",label:"戰鬥與怪物",items:[
   ["基本戰鬥","戰鬥會自動進行，玩家與敵人輪流攻擊，直到其中一方 HP 歸零。每次戰鬥的結果會依雙方能力、暴擊、閃避與各種特殊效果決定。除競技場三連戰的場間之外，戰鬥結束後 HP 會回滿。"],
   ["暴擊與閃避","暴擊成功時會造成更高傷害；閃避成功時可以完全避開該次攻擊。玩家與敵人都可能擁有暴擊與閃避能力。"],
   ["怪物特性","部分敵人會隨機擁有怪物特性：強壯提高 HP、兇猛提高攻擊、堅硬提高防禦、迅捷提高閃避、致命提高暴擊、狂暴會在低 HP 時提高攻擊、巨體提高 HP 與攻擊但降低閃避。"],
   ["多重特性","敵人可能沒有任何特性，也可能同時擁有多個特性。"],
   ["特殊戰鬥提示","先制、連擊、穿透、反擊、汲取、狂暴與 HP 回復等特殊效果，會以不同的彩色浮字顯示在戰鬥畫面中，方便快速辨識觸發狀況。"]
  ]},
  {id:"special",label:"特殊怪",items:[
   ["特殊遭遇","特殊遭遇的觸發來源會依目前紀元切換。"],
   ["稀有資源聚合體","特殊怪資料會依目前紀元切換。"],
   ["誘餌補給艙","特殊怪資料會依目前紀元切換。"],
   ["終止協議單元","特殊怪資料會依目前紀元切換。"],
   ["機率增幅信標","特殊怪資料會依目前紀元切換。"],
   ["封存警戒機","特殊怪資料會依目前紀元切換。"],
   ["裝備保全單元","特殊怪資料會依目前紀元切換。"],
   ["黑市武裝頭目","特殊怪資料會依目前紀元切換。"],
   ["戰利品回收者","特殊怪資料會依目前紀元切換。"],
   ["流動交易代理人","特殊怪資料會依目前紀元切換。"],
   ["VIP 與特殊怪","部分 VIP 特權會影響特殊遭遇機率或特殊怪收益。"]
  ]},
  {id:"dungeon",label:"副本與 VIP",items:[
   ["副本解鎖","副本內容會依目前紀元與既有進度運作。"],
   ["每日重置","副本每日次數與獎勵固定於每日凌晨 0 點重置。"],
   ["懸賞戰","懸賞戰是資源型副本，每天最多挑戰 20 次，可單場或連續挑戰。"],
   ["懸賞難度","懸賞分為普通、高級與危險三種難度。"],
   ["競技場","競技場每輪為 3 場連續戰鬥，場間不回血。"],
   ["競技場解鎖","競技場解鎖需同時符合評估與主線區域條件。"],
   ["競技場 VIP 積分","完成競技場可取得 VIP 積分。"],
   ["虛空幻境","虛空幻境是沒有最高層數的無限型副本。"],
   ["虛空每日獎勵","虛空依當日最高層提供 VIP 積分，每天只能領取一次。"],
   ["VIP 系統","透過競技場、虛空幻境等玩法取得 VIP 積分並提升 VIP 等級。VIP 等級沒有上限；VIP20 是最後一個特殊特權階段，之後仍可持續提升基本能力。"],
   ["VIP 基礎能力","VIP 每提升 1 級，HP／攻擊 +0.5%、防禦 +0.25%、暴擊／閃避 +0.25 個百分點；VIP20 之後仍持續成長。"],
   ["VIP 特權","VIP2～VIP20 會依指定等級解鎖裝備、特殊怪、副本與死亡保護等特權；VIP20 為最後一個特殊特權，VIP21 以上不新增特權。進入第三紀元後，VIP20 的死亡裝備保護仍會持續生效，原本 30% 的裝備遺失判定若觸發，會由 VIP20 完全攔下。"],
   ["文明災厄","文明災厄規則會依目前紀元切換。"]
  ]},
  {id:"growth",label:"成長與功能",items:[
   ["專精系統","專精共有 8 種，每一種最高 Lv60。"],
   ["實戰訓練","提升戰鬥 EXP 收益。"],
   ["搜刮技巧","提升主線直接取得的主要資源。"],
   ["鑑價技巧","提升裝備出售取得的主要資源。"],
   ["先制技巧","提高每場戰鬥第一次主動普通攻擊的傷害；每遇到新的敵人，都會重新取得一次先制機會。"],
   ["連擊技巧","提高連擊觸發機率，觸發後會追加一次較低傷害的攻擊，而且追加攻擊仍可能再次觸發連擊。"],
   ["穿透技巧","提高穿透觸發機率，發動時會忽略敵人的部分防禦；普通攻擊、連擊與反擊都可以觸發。"],
   ["反擊技巧","敵人成功造成傷害且角色仍存活後，有機會立即反擊。反擊本身也可以觸發部分其他戰鬥效果。"],
   ["汲取技巧","玩家造成傷害時有機會觸發汲取，依實際造成的傷害回復部分 HP，且不會超過最大 HP。"],
   ["文明等級","文明等級會在宇宙紀元開放。"],
   ["極簡模式","連續戰鬥中可切換為極簡顯示畫面，僅保留必要資訊；戰鬥仍會持續進行，滑動即可退出極簡模式。"],
   ["本機存檔","遊戲會自動將進度儲存在目前裝置的瀏覽器中，更換裝置時本機存檔不會自動轉移。"],
   ["雲端存檔","登入帳號後，可在設定頁手動上傳或下載雲端存檔，用來在不同裝置之間搬移進度；雲端存檔不會自動同步，也不會在登入時自動覆蓋本機存檔。"]
  ]}
 ];
 const SPECIAL_GUIDE_IDS=Object.freeze(["gold_slime","mimic","reaper","lucky_rabbit","ancient_guardian","relic_guardian","bandit_king","collector","mysterious_traveler"]);
 let activeGuideCategory="adventure";
 function guideState(target=null){return target&&typeof target==="object"?target:(typeof state!=="undefined"&&state&&typeof state==="object"?state:null);}
 function guidePhase(target=null){
  const holder=guideState(target);
  if(typeof window.currentWorldPhase==="function"){
   try{const value=Number(window.currentWorldPhase(holder));if(Number.isInteger(value)&&value>=1&&value<=3)return value;}catch(_){}
  }
  // 僅保留早期載入／測試相容 fallback；正式 runtime 以 currentWorldPhase 為唯一 owner。
  return holder?.thirdWorld?.entered===true?3:(holder?.secondWorld?.entered===true?2:1);
 }
 function thirdWorldGuideRuleSnapshot(target=null){
  const holder=guideState(target),entry=window.THIRD_WORLD_ENTRY_CONFIG||{},quality=window.THIRD_WORLD_EQUIPMENT_BASE_POLICY||{},stage=window.THIRD_WORLD_BOSS_STAGE_CONFIG||{};
  const levelCap=typeof window.effectiveLevelCap==="function"?Math.max(1,Math.floor(Number(window.effectiveLevelCap(holder))||1)):Math.max(1,Math.floor(Number(window.THIRD_WORLD_LEVEL_CAP)||Number(window.ABSOLUTE_MAX_LEVEL)||1));
  const entryLevel=Math.max(1,Math.floor(Number(entry.level)||Math.min(levelCap,1)));
  const expPerLevel=typeof window.effectiveExpNeed==="function"?Math.max(0,Math.floor(Number(window.effectiveExpNeed(entryLevel,holder))||0)):Math.max(0,Math.floor(Number(window.THIRD_WORLD_EXP_PER_LEVEL)||0));
  const enhancementCap=typeof window.effectiveEnhancementCap==="function"?Math.max(0,Math.floor(Number(window.effectiveEnhancementCap(holder))||0)):Math.max(0,Math.floor(Number(window.ENHANCEMENT_ABSOLUTE_MAX_LEVEL)||0));
  const vipRequired=Math.max(0,Math.floor(Number(entry.vipLevel)||0));
  const deathLossPercent=Math.max(0,Number(window.DEATH_EQUIPMENT_LOSS_CHANCE)||0)*100;
  const legendaryPercent=Math.max(0,Number(quality.legendaryChance)||0)*100,mythicPercent=Math.max(0,Number(quality.mythicChance)||0)*100;
  const offlineMaxHours=Math.max(0,Number(window.OFFLINE_PROGRESS_MAX_HOURS)||0);
  return Object.freeze({
   phase:guidePhase(holder),entryLevel,levelCap,expPerLevel,enhancementCap,vipRequired,deathLossPercent,legendaryPercent,mythicPercent,offlineMaxHours,
   bossCount:Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_COUNT)||1)),bossMaxHp:Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_MAX_HP)||1)),fivePointHpGap:Math.max(1,Math.floor(Number(window.THIRD_WORLD_FIVE_POINT_HP_GAP)||1)),maxDeaths:Math.max(1,Math.floor(Number(window.THIRD_WORLD_RUN_MAX_DEATHS)||1)),maxStage:Math.max(0,Math.floor(Number(stage.maxStage)||0)),equipmentNameBandCount:Math.max(1,Array.isArray(window.THIRD_WORLD_EQUIPMENT_NAME_ROWS)?window.THIRD_WORLD_EQUIPMENT_NAME_ROWS.length:1)
  });
 }
 function thirdWorldBossSpecializationGuideText(){
  const rows=Array.isArray(window.THIRD_WORLD_BOSS_DEFINITIONS)?window.THIRD_WORLD_BOSS_DEFINITIONS:[];
  if(!rows.length)return "10 名高維存在各自具有不同個體特化，詳細數值以冒險頁當前顯示為準。";
  return rows.map((boss,index)=>{const profile=typeof window.thirdWorldBossSpecializationPresentation==="function"?window.thirdWorldBossSpecializationPresentation(index):null;return `${boss?.name||`高維存在 ${index+1}`}：${profile?.label||"個體特化"}${profile?.effect?`（${profile.effect}）`:""}`;}).join("；");
 }
 function thirdWorldAbilityGuideText(){
  const rows=Array.isArray(window.THIRD_WORLD_BOSS_ABILITY_DEFINITIONS)?window.THIRD_WORLD_BOSS_ABILITY_DEFINITIONS:[];
  if(!rows.length)return "Boss 永久 HP 降低後會逐步解鎖共通能力，詳細門檻以高維戰線顯示為準。";
  return `Boss 剩餘 HP 降到指定門檻時依序解鎖：${rows.map(row=>`${Math.max(0,Number(row?.unlockRemainingPercent)||0)}% ${row?.name||"高維能力"}`).join("、")}。`;
 }
 function thirdWorldStageGuideText(rules=null){
  const cfg=window.THIRD_WORLD_BOSS_STAGE_CONFIG||{},snapshot=rules&&typeof rules==="object"?rules:thirdWorldGuideRuleSnapshot();
  const atk=Math.max(0,Math.floor(Number(cfg.atkPerStage)||0)),def=Math.max(0,Math.floor(Number(cfg.defPerStage)||0)),crit=Math.max(0,Number(cfg.critPointsPerStage)||0),dodge=Math.max(0,Number(cfg.dodgePointsPerStage)||0),step=Math.max(1,Math.floor(Number(cfg.stepPercent)||10));
  const firstThreshold=Math.max(step,100-step),lastThreshold=Math.max(step,100-snapshot.maxStage*step);
  return `Boss 永久 HP 每跨過 ${firstThreshold}%、${Math.max(lastThreshold,step)}% 等 ${step}% 門檻就進入下一個 Stage，最高 Stage ${snapshot.maxStage}。每提升 1 Stage：ATK +${atk.toLocaleString()}、DEF +${def.toLocaleString()}、暴擊 +${crit}%、閃避 +${dodge}%。`;
 }
 function thirdWorldCoreGuideText(){
  const max=Math.max(0,Math.floor(Number(window.THIRD_WORLD_CORE_MAX_LEVEL)||10)),cost=Math.max(1,Math.floor(Number(window.THIRD_WORLD_CORE_COST_PER_LEVEL)||1000000000)),base=Math.max(0,Number(window.THIRD_WORLD_SUPPRESSION_BASE_POINTS)||.5),reduction=Math.max(0,Number(window.THIRD_WORLD_CORE_SUPPRESSION_REDUCTION_PER_LEVEL)||.04);
  return `界弦核心最高 Lv.${max}，每級需注入 ${cost.toLocaleString()} 維度之弦。高維連戰每次死亡基礎會把本輪 HP 上限再壓低 ${base.toFixed(2)}%；核心每提升 1 級，會把每次死亡的壓制幅度減少 ${reduction.toFixed(2)}%。連戰開始後核心等級會鎖定到該輪結束。`;
 }
 function thirdWorldGuideCategories(target=null){
  const rules=thirdWorldGuideRuleSnapshot(target),bossCount=rules.bossCount,bossHp=rules.bossMaxHp,gap=rules.fivePointHpGap,maxDeaths=rules.maxDeaths;
  return [
   {id:"adventure",label:"高維戰線",items:[
    ["高維紀元",`第三紀元以同時攻略 ${bossCount} 名高維存在為主線。正式成長只在高維紀元進行；銀河與宇宙內容改為回顧，不再產生正式成長。`],
    ["10 名高維存在",`10 名高維存在各有 ${bossHp.toLocaleString()} 最大 HP，全部保留各自永久 HP。玩家可以在仍存活且符合戰線限制的目標之間切換。`],
    ["永久削血","每場正式戰鬥以 Boss 目前永久 HP 開始；本場實際削掉的 HP 會永久保留。汲取只能在該場戰鬥內回復角色 HP，不會回復 Boss 已被永久削掉的 HP。"],
    ["5% 戰線",`存活 Boss 之間最多只能相差 5% 戰線；以目前 10 名高維存在的基準換算為 ${gap.toLocaleString()} HP。若目標已超前，該場若已合法開始仍完整結算，但下一場會鎖定，直到其他存活 Boss 跟上。最後一名存活 Boss 不受此限制。`],
    ["連續戰鬥",`高維主線以連續戰鬥為主要流程。沒有進度事件時，一輪最多累積 ${maxDeaths} 次死亡；玩家可手動停止。Boss 擊破、Stage 跨越、5% 戰線鎖定或整體進度事件都會結束本輪，確認後再開始下一輪。`],
    ["回顧戰","已擊破的高維存在可在原位置進行回顧戰；回顧固定使用最終高階狀態，角色以完整 HP 開場，不會取得 EXP、維度之弦、裝備，也不會改變任何正式 Boss 進度。冒險頁亦可切回銀河／宇宙回顧。"],
    ["高維離線",`完成正式前景高維戰鬥並成功結算後，可建立高維離線裝備樣本。離線只模擬裝備掉落機會，不取得 EXP、維度之弦，也不推進界弦核心、稱號、劇情或 Boss 永久 HP。最多計算 ${rules.offlineMaxHours.toLocaleString()} 小時。`],
    ["目前等級上限",`高維紀元角色等級上限為 Lv${rules.levelCap}。Lv${rules.entryLevel}～${Math.max(rules.entryLevel,rules.levelCap-1)} 每級固定需要 ${rules.expPerLevel.toLocaleString()} EXP；到達 Lv${rules.levelCap} 後不再累積 EXP。`]
   ]},
   {id:"gear",label:"角色與裝備",items:[
    ["高維裝備",`每場可正式落帳的高維戰鬥都會產生高維裝備。基礎品質池為 ${rules.legendaryPercent.toLocaleString()}% 傳說、${rules.mythicPercent.toLocaleString()}% 神話，並繼續套用目前仍有效的 VIP 裝備特權。`],
    ["裝備等級",`高維裝備等級依正式結算後的角色等級產生，最高 Lv${rules.levelCap}。`],
    ["裝備命名",`高維裝備名稱會隨 10 名高維存在的整體永久 HP 進度分成 ${rules.equipmentNameBandCount} 個階段變化；只影響名稱與風格，不另建第二套戰鬥公式。`],
    ["裝備處理","高維裝備可在背包比較、裝備與整理；設定可依普通至神話 6 種品質自行勾選自動處理。鎖定裝備不會被自動處理，開啟「若新裝備比目前裝備強，自動保留」時，較強掉落會優先保留。高維裝備處理後永久移除，且不會產生任何主要資源。"],
    ["裝備欄位強化",`第三紀元沿用已完成的五部位 +${rules.enhancementCap} 強化，強化等級永久保留；高維紀元不再新增更高的欄位強化階段。`],
    [`VIP${rules.vipRequired} 裝備保護`,`第三紀元死亡仍會執行原本 ${rules.deathLossPercent.toLocaleString()}% 的裝備遺失判定，但進入第三紀元本來就要求 VIP${rules.vipRequired}，因此所有實際裝備遺失都會被 VIP${rules.vipRequired} 阻止。高維連戰結算會顯示本輪成功阻止的次數。`]
   ]},
   {id:"combat",label:"高維戰鬥",items:[
    ["戰鬥結算","正式戰鬥只在角色死亡或 Boss 被擊破後形成可落帳結果；有效永久削血等於該場開始時正式 Boss HP 減去戰鬥結束 HP。"],
    ["戰鬥收益","每 1 點有效永久削血同時換算為 1 EXP 與 1 維度之弦。即使角色死亡，只要該場是合法且完整的正式戰鬥，仍可依實際永久削血完成結算。"],
    ["10 名高維存在的個體特化",thirdWorldBossSpecializationGuideText()],
    ["Stage 強化",thirdWorldStageGuideText(rules)],
    ["共通能力",thirdWorldAbilityGuideText()],
    ["死亡壓制","高維連戰的死亡次數只在本輪 runtime 中累積，不寫入存檔。角色死亡且 Boss 尚未擊破時才增加 1 次死亡；下一場的可用 HP 上限會依本輪死亡壓制重新計算。"],
    ["戰鬥速度","第三紀元沿用已解鎖的 1.5× 戰鬥速度，可隨時切回 1×；GM 測試速度不改變正式玩家規則。"]
   ]},
   {id:"dungeon",label:"副本與 VIP",items:[
    ["高維副本","進入第三紀元後，副本首頁只呈現目前仍可使用的模式與高維狀態；不適用的舊模式不再作為第三紀元正式成長來源。"],
    ["高維競技場","高維競技場目前尚未開放，入口維持等待狀態，不會偷偷沿用舊紀元競技場規則。"],
    ["虛空幻境","虛空幻境不分紀元並完整承接既有進度；仍可依正式規則挑戰與取得對應 VIP 積分。"],
    ["鏡像戰","鏡像戰不分紀元並完整承接既有進度；仍使用開始挑戰時的角色戰力建立對手。"],
    ["VIP 系統","VIP 等級沒有上限；第三紀元會繼續套用目前仍有效的 VIP 特權。"],
    ["VIP 裝備保護",`VIP${rules.vipRequired} 同時是進入第三紀元的必要條件，也是第三紀元死亡裝備保護的來源；高維結算會把這項保護明確呈現給玩家。`]
   ]},
   {id:"growth",label:"高維成長",items:[
    ["維度之弦","維度之弦是第三紀元的永久成長資源；正式戰鬥每造成 1 點有效永久削血，就取得 1 點維度之弦。"],
    ["界弦核心",thirdWorldCoreGuideText()],
    ["核心注入","可將目前持有的維度之弦一次注入界弦核心，連續跨級時進度會正確保留。高維連戰進行中不能注入，必須先停止該輪戰鬥。"],
    ["高維稱號","10 名高維存在的總剩餘 HP 降到指定門檻時會推進高維稱號；稱號進度由 10 名高維存在的總剩餘 HP 統一判定，不依單一 Boss 或回顧戰重複發放。"],
    ["既有養成","進入第三紀元前已完成的角色養成會依正式戰鬥 owner 繼續生效；第三紀元本身不再新增另一套平行養成資源或重複系統。"],
    ["極簡模式","高維連續戰鬥可使用共用極簡模式；背景補播與快速追趕只加速等待與演出，不會因補播機制額外加發正式進度或收益；實際戰鬥仍依正式戰鬥與結算流程落帳。"],
    ["存檔","角色正式進度會持續寫入本機存檔；帳號登入後仍可使用設定頁的手動雲端上傳／下載。高維連戰的死亡次數、目前目標與最近戰鬥摘要都屬暫時狀態，不會寫入正式存檔。"]
   ]}
  ];
 }
 function guideUniverse(target=null){return guidePhase(target)===2;}
 function coreGuideWorldText(title,target=null){
  const universe=guideUniverse(target);
  const galaxy={
   "遊戲基本玩法":"銀河紀元以打怪、升級、取得裝備與推進地圖為核心。戰鬥可獲得 EXP、金幣與裝備。",
   "主線地圖":"銀河主線由多個區域與地圖組成，每張地圖都有普通怪、菁英怪與 Boss。完成目前地圖後會逐步開啟後續戰區。",
   "地圖探索":"尚未抵達的地圖不會提前顯示；首次擊敗目前地圖 Boss 後開啟下一張。已探索地圖可隨時返回挑戰。",
   "地圖推進":"普通怪與菁英怪各擊敗 10 次，並達到該地圖最高等級後，即可挑戰 Boss。",
   "Boss":"Boss 可單場或連續挑戰。首次擊敗會開啟下一張地圖；若挑戰失敗，需再擊敗該地圖菁英怪 10 次才能重新挑戰。",
   "戰鬥模式":"普通怪、菁英怪與 Boss 都可單場或連續戰鬥。連續戰鬥會持續至戰敗或玩家要求停止。",
   "離線收益":"離線超過 1 分鐘後，可依最近有效的普通怪或菁英怪戰鬥取得部分 EXP、金幣、裝備與強化石，最多計算 12 小時。離線收益不增加副本額度或 VIP 積分。",
   "目前等級上限":"銀河紀元角色等級上限為 Lv500。到達 Lv500 後不再累積 EXP，原本可取得的 EXP 會轉換為金幣。",
   "裝備掉落":"銀河主線的普通怪、菁英怪與 Boss 都可能掉落裝備，Boss 勝利必定掉落。裝備等級最高 Lv500。",
   "背包":"背包可查看、裝備與出售裝備，也能處理戰敗時遺失的裝備。銀河紀元遺失裝備可使用金幣贖回。",
   "自動出售":"普通至神話 6 種品質都可在設定中自行勾選自動出售並取得金幣；鎖定裝備不會被自動出售，較強掉落可依設定優先保留。鑑價技巧會提高出售收益。",
   "死亡懲罰":"戰敗不會損失 EXP，但正式死亡有 30% 機率遺失一件已裝備裝備，可在背包贖回。VIP20 可完全防止裝備遺失，戰後 HP 回滿。",
   "裝備欄位強化":"五個裝備欄位可永久強化至 +20，換裝或裝備遺失都不會降低強化等級。",
   "強化石":"基礎與進階強化石用於銀河紀元 +1～+20，可由主線、部分裝備出售與離線收益取得。"
  };
  const universeText={
   "遊戲基本玩法":"宇宙紀元以挑戰主線 Boss、升級與取得裝備為核心。勝利可獲得 EXP、暗物質、暗能量與宇宙紀元裝備。",
   "主線地圖":"宇宙主線共有 10 個區域、100 隻 Boss，等級由 Lv505 推進至 Lv1000。依序擊敗 Boss 即可前往後續戰區。",
   "地圖探索":"尚未抵達的宇宙 Boss 不會提前顯示；擊敗前一隻後逐步向後推進。冒險頁也可切到「銀河紀元・回顧」進行純挑戰。",
   "地圖推進":"宇宙紀元沒有普通怪與菁英怪主線。達到需求等級並擊敗前一隻 Boss 後，即可挑戰下一隻。",
   "Boss":"宇宙主線全由 Boss 組成，可單場或連續挑戰。首次擊敗會推進主線；戰敗時連續戰鬥立即停止。",
   "戰鬥模式":"宇宙主線 Boss 可選擇單場或連續戰鬥。連續戰鬥會持續挑戰目前 Boss，直到戰敗或玩家要求停止。",
   "離線收益":"離線超過 1 分鐘後，可依最近的宇宙主線戰鬥樣本取得部分 EXP、暗物質、裝備與少量直接暗能量收益，最多計算 12 小時；不增加副本額度或 VIP 積分。",
   "目前等級上限":"宇宙紀元角色等級上限為 Lv1000。進入宇宙紀元後可繼續累積 EXP 升級，到達 Lv1000 後不再累積 EXP，且不會把滿等 EXP 轉成銀河金幣。",
   "裝備掉落":"宇宙主線 Boss 勝利會取得宇宙紀元裝備，裝備等級最高 Lv1000。裝備品質與詞條仍會影響實際能力。",
   "背包":"背包可查看、裝備與出售裝備，也能處理戰敗時遺失的裝備。宇宙紀元裝備出售使用暗物質；宇宙裝備贖回以暗物質支付，若遺失的是銀河紀元裝備則可免費贖回。",
   "自動出售":"普通至神話 6 種品質都可在設定中自行勾選自動出售宇宙紀元裝備，出售後主要取得暗物質；神話裝備同樣可以自動出售，並依正式規則額外取得暗能量。鎖定裝備不會被自動出售，較強掉落可依設定優先保留；鑑價技巧只提高暗物質出售收益。",
   "死亡懲罰":"戰敗不會損失 EXP，但正式死亡有 30% 機率遺失一件已裝備裝備，可在背包贖回。VIP20 可完全防止裝備遺失，戰後 HP 回滿。",
   "裝備欄位強化":"五個裝備欄位可由 +20 繼續強化至 +40，使用暗物質與暗能量。強化永久保留，不受換裝或裝備遺失影響。",
   "強化石":"進入宇宙紀元時銀河紀元的基礎／進階強化石會清空。宇宙紀元 +21～+40 不再使用強化石，改用暗物質與暗能量。"
  };
  return (universe?universeText:galaxy)[title]||null;
 }
 function combatGuideWorldText(title,target=null){
  const universe=guideUniverse(target);
  if(title==="多重特性")return universe?"宇宙主線 Boss 可能帶有多個怪物特性，會直接影響戰鬥方式與難度。":"普通怪、菁英怪與 Boss 都可能帶有怪物特性，較強敵人通常更容易出現。";
  return null;
 }
 function specialGuideWorldText(title,target=null){
  const universe=guideUniverse(target);
  if(title==="特殊遭遇")return universe?"宇宙主線 Boss 勝利後有機會觸發特殊遭遇。特殊戰鬥結束後 HP 回滿；勝利後繼續原本流程，失敗則結束連續戰鬥。":"普通怪與菁英怪勝利後有機會觸發特殊遭遇，Boss 不會觸發。特殊戰鬥結束後 HP 回滿；失敗會結束連續戰鬥。";
  if(title==="VIP 與特殊怪")return "部分 VIP 特權會提高特殊遭遇機率或增加特殊怪收益，詳細效果可在 VIP 特權中查看。";
  return null;
 }
 function specialGuideWorldItem(item,index,target=null){
  if(index>=1&&index<=SPECIAL_GUIDE_IDS.length){
   const monster=typeof window.getSpecialMonsterById==="function"?window.getSpecialMonsterById(SPECIAL_GUIDE_IDS[index-1],guideUniverse(target)?2:1):null;
   if(monster)return [monster.name,monster.description||item?.[1]||""];
  }
  const text=specialGuideWorldText(item?.[0],target);
  return text?[item[0],text]:item.slice();
 }
 function dungeonCommonGuideWorldText(title,target=null){
  const universe=guideUniverse(target);
  if(title==="副本解鎖")return universe?"宇宙紀元沿用懸賞戰、競技場、虛空幻境與鏡像戰，並依各副本的宇宙規則運作。":"銀河紀元會隨等級逐步開放懸賞戰、競技場、虛空幻境與鏡像戰。各副本提供資源、VIP 積分或特殊挑戰。";
  if(title==="每日重置")return "副本的每日次數與獎勵於每天凌晨 0 點重置；各副本依自己的額度與規則運作。";
  if(title==="虛空幻境")return "虛空幻境是無限層挑戰，每次從歷史最高紀錄前 100 層開始。每層戰後回滿 HP，每 10 層會遇到 Boss。";
  if(title==="虛空每日獎勵")return "虛空依當日最高層提供 VIP 積分，每天可手動領取一次；領取後當日無法再次領取。";
  if(title==="VIP 系統")return "透過競技場、虛空幻境等玩法取得 VIP 積分並提升 VIP 等級。VIP 等級沒有上限；VIP20 是最後一個特殊特權階段，之後仍可持續提升基本能力。";
  if(title==="VIP 基礎能力")return "VIP 每提升 1 級，HP／攻擊 +0.5%、防禦 +0.25%、暴擊／閃避 +0.25 個百分點；VIP20 之後仍持續成長。";
  if(title==="VIP 特權")return "VIP2～VIP20 會解鎖裝備、特殊怪、副本與死亡保護等特權；VIP20 為最後一個特殊特權，VIP21 以上不新增特權。完整效果可在「查看特權」確認。";
  return null;
 }
 function specializationGuideWorldText(title,target=null){
  const universe=guideUniverse(target);
  if(title==="專精系統")return universe?"專精共有 8 種，最高 Lv60。進入宇宙紀元時已全部滿級，效果會永久保留並繼續生效。":"專精共有 8 種，最高 Lv60，可使用金幣升級。不同專精會提升戰鬥、EXP、金幣與裝備相關能力。";
  if(title==="實戰訓練")return universe?"提升宇宙主線 Boss 的 EXP 收益。":"提升擊敗怪物時取得的 EXP。";
  if(title==="搜刮技巧")return universe?"提升宇宙主線 Boss 直接取得的暗物質，不影響裝備出售收益。":"提升怪物直接掉落的金幣，不影響裝備出售收益。";
  if(title==="鑑價技巧")return universe?"提升宇宙紀元裝備出售取得的暗物質，不影響暗能量。":"提升出售裝備取得的金幣。";
  return null;
 }
 function civilizationGuideWorldText(title,target=null){
  if(title!=="文明等級")return null;
  return guideUniverse(target)?"文明等級是宇宙紀元的永久成長系統，最高 Lv10。每級提高 5% 最終傷害，主要透過討伐文明災厄提升。":"文明等級會在進入宇宙紀元後開放；銀河紀元不套用這項加成。";
 }
 function bountyGuideWorldText(title,target=null){
  const universe=guideUniverse(target);
  if(title==="懸賞戰")return universe?"宇宙懸賞每天最多挑戰 20 次，可單場或連續挑戰。勝利可取得較多 EXP、暗物質與宇宙紀元裝備，每場結束後 HP 回滿。":"銀河懸賞每天最多挑戰 20 次，可單場或連續挑戰。勝利可取得較多 EXP、金幣與裝備，每場結束後 HP 回滿。";
  if(title==="懸賞難度")return universe?"懸賞分為普通、高級與危險三種難度。難度越高，EXP、暗物質與裝備收益越高；裝備最低為稀有品質。":"每次懸賞會隨機遇到普通、高級或危險懸賞。難度越高，EXP、金幣與裝備數量越高；懸賞裝備最低為稀有品質。";
  return null;
 }
 function arenaGuideWorldText(title,target=null){
  const universe=guideUniverse(target);
  if(title==="競技場")return `${universe?"宇宙":"銀河"}紀元共有 10 個競技場，每輪連戰 3 場，場間不回血，任一場戰敗即結束。每天最多挑戰 20 輪，整輪結束後 HP 回滿。`;
  if(title==="競技場解鎖")return universe?"最多顯示最近 3 個已解鎖競技場。開啟下一個競技場需通過目前最高競技場的戰力評估，並解鎖對應的宇宙主線區域。":"最多顯示最近 3 個已解鎖競技場。想開啟下一個競技場，必須先通過目前最高競技場的戰力評估，並解鎖下一個競技場所對應的主線區域。";
  if(title==="競技場 VIP 積分")return "完成競技場可取得 VIP 積分。競技場越後期、挑戰難度越高，獎勵越多；中途失敗仍會依實際勝場取得部分積分。";
  return null;
 }
 function calamityGuideWorldText(title,target=null){
  if(title!=="文明災厄")return null;
  return guideUniverse(target)?"擊敗各區域最終 Boss 後會發現對應災厄，符合前置文明條件即可挑戰。每隻災厄完成 30 次完整擊殺後會完成該文明階段並提升文明等級；災厄不提供一般戰鬥獎勵。":"擊敗各區域最終 Boss 後解鎖對應災厄。成功討伐可取得並提升永久印記，最高 Lv.10；災厄不提供一般戰鬥獎勵。";
 }
 function baseGameGuideCategoriesForState(target=null){
  if(guidePhase(target)===3)return thirdWorldGuideCategories(target);
  return GUIDE_CATEGORIES.map(category=>({...category,items:(category.items||[]).map((item,index)=>{
   if(category.id==="special")return specialGuideWorldItem(item,index,target);
   const coreText=(category.id==="adventure"||category.id==="gear")?coreGuideWorldText(item?.[0],target):null;
   const combatText=category.id==="combat"?combatGuideWorldText(item?.[0],target):null;
   const dungeonCommonText=category.id==="dungeon"?dungeonCommonGuideWorldText(item?.[0],target):null;
   const specializationText=category.id==="growth"?specializationGuideWorldText(item?.[0],target):null;
   const civilizationText=category.id==="growth"?civilizationGuideWorldText(item?.[0],target):null;
   const bountyText=category.id==="dungeon"?bountyGuideWorldText(item?.[0],target):null;
   const arenaText=category.id==="dungeon"?arenaGuideWorldText(item?.[0],target):null;
   const calamityText=category.id==="dungeon"?calamityGuideWorldText(item?.[0],target):null;
   const worldText=calamityText||arenaText||bountyText||dungeonCommonText||combatText||civilizationText||specializationText||coreText;
   return worldText?[item[0],worldText]:item.slice();
  })}));
 }
 const GUIDE_EXTENSION_REGISTRY=new Map();
 function normalizeGuideExtensionOrder(value){const n=Number(value);return Number.isFinite(n)?n:100;}
 function registerGameGuideExtension(extension){
  if(!extension||typeof extension!=="object")return false;
  const id=String(extension.id||"").trim();if(!id)return false;
  const normalized=Object.freeze({id,order:normalizeGuideExtensionOrder(extension.order),extendCategories:typeof extension.extendCategories==="function"?extension.extendCategories:null,renderBeforeLayout:typeof extension.renderBeforeLayout==="function"?extension.renderBeforeLayout:null});
  GUIDE_EXTENSION_REGISTRY.set(id,normalized);return true;
 }
 function gameGuideExtensions(){return Array.from(GUIDE_EXTENSION_REGISTRY.values()).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id));}
 function cloneGuideCategories(categories){return (Array.isArray(categories)?categories:[]).map(category=>({...category,items:(Array.isArray(category?.items)?category.items:[]).map(item=>Array.isArray(item)?item.slice():item)}));}
 function gameGuideExtensionContext(target=null){const holder=guideState(target);return Object.freeze({target:holder,phase:guidePhase(holder)});}
 function applyGameGuideCategoryExtensions(categories,target=null){
  let current=cloneGuideCategories(categories),context=gameGuideExtensionContext(target);
  for(const extension of gameGuideExtensions()){
   if(typeof extension.extendCategories!=="function")continue;
   const result=extension.extendCategories(current,context);
   if(Array.isArray(result))current=result;
  }
  return current;
 }
 function gameGuideBeforeLayoutHtml(target=null){
  const context=gameGuideExtensionContext(target);
  return gameGuideExtensions().map(extension=>typeof extension.renderBeforeLayout==="function"?extension.renderBeforeLayout(context):"").filter(html=>typeof html==="string"&&html).join("");
 }
 function gameGuideCategoriesForState(target=null){return applyGameGuideCategoryExtensions(baseGameGuideCategoriesForState(target),target);}
 function itemHtml(item){return `<div class="guide-item"><h4>${item[0]}</h4><div class="guide-item-body">${item[1]}</div></div>`;}
 window.GAME_GUIDE_VERSION=25;
 window.GAME_GUIDE_WORLD_AWARE_VERSION=12;
 window.GAME_GUIDE_WORLD_PHASE_OWNER_VERSION=2;
 window.GAME_GUIDE_THIRD_WORLD_RULE_SNAPSHOT_VERSION=1;
 window.GAME_GUIDE_CURRENT_CATEGORY_VALIDATION_VERSION=1;
 window.GAME_GUIDE_EXTENSION_REGISTRY_VERSION=1;
 window.GAME_GUIDE_CATEGORY_RESOLVER_VERSION=1;
 window.GAME_GUIDE_PAGE_EXTENSION_VERSION=1;
 window.GAME_GUIDE_BEHAVIORAL_INTEGRITY_VERSION=1;
 window.GAME_GUIDE_FAST_CATCH_UP_TEXT_VERSION=1;
 window.GAME_GUIDE_THIRD_WORLD_VERSION=1;
 window.GAME_GUIDE_SPECIALIZATION_WORLD_VERSION=1;
 window.GAME_GUIDE_CIVILIZATION_WORLD_VERSION=1;
 window.GAME_GUIDE_CALAMITY_WORLD_VERSION=2;
 window.GAME_GUIDE_BOUNTY_WORLD_VERSION=2;
 window.GAME_GUIDE_ARENA_WORLD_VERSION=2;
 window.GAME_GUIDE_SPECIAL_WORLD_VERSION=2;
 window.GAME_GUIDE_SPECIAL_PROFILE_TITLE_VERSION=1;
 window.GAME_GUIDE_DUNGEON_COMMON_WORLD_VERSION=1;
 window.GAME_GUIDE_COMBAT_WORLD_VERSION=1;
 window.GAME_GUIDE_AUTO_SELL_QUALITY_VERSION=2;
 window.GAME_GUIDE_CATEGORIES=GUIDE_CATEGORIES;
 window.GAME_GUIDE_SPECIAL_IDS=SPECIAL_GUIDE_IDS;
 window.gameGuideCategoriesForState=gameGuideCategoriesForState;
 window.registerGameGuideExtension=registerGameGuideExtension;
 window.gameGuideExtensionIds=function(){return gameGuideExtensions().map(extension=>extension.id);};
 window.thirdWorldGuideRuleSnapshot=thirdWorldGuideRuleSnapshot;
 window.setGameGuideCategory=function(id){const categories=gameGuideCategoriesForState();if(!categories.some(x=>x.id===id))return;activeGuideCategory=id;if(typeof render==="function")render();};
 window.gameGuidePage=function(){
  const categories=gameGuideCategoriesForState();
  const current=categories.find(x=>x.id===activeGuideCategory)||categories[0];
  const tabs=categories.map(x=>`<button class="guide-category ${x.id===current.id?"active":""}" onclick="setGameGuideCategory('${x.id}')">${x.label}</button>`).join("");
  const phase=guidePhase(),worldLabel=phase===3?"高維紀元":phase===2?"宇宙紀元":"銀河紀元";
  const extensionHtml=gameGuideBeforeLayoutHtml();
  return `<div class="function-page guide-page"><div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div><div class="guide-header"><h2>遊戲說明</h2><div class="muted">${worldLabel}｜查看目前紀元的玩法、系統、戰鬥與各項規則。</div></div>${extensionHtml}<div class="guide-layout"><nav class="guide-categories">${tabs}</nav><section class="guide-content card"><h3>${current.label}</h3><div class="guide-items">${current.items.map(itemHtml).join("")}</div></section></div></div>`;
 };
})();
