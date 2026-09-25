const fs=require("fs");
const path=require("path");
const {spawnSync}=require("child_process");

function assert(condition,message){if(!condition)throw new Error(message);}
function walk(dir){
 const rows=[];
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if([".git","node_modules"].includes(entry.name))continue;
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())rows.push(...walk(full));
  else if(entry.isFile()&&entry.name.endsWith(".js"))rows.push(full);
 }
 return rows;
}
const read=file=>fs.readFileSync(file,"utf8");
const files=walk(".").sort();
assert(files.length>0,"找不到任何 JavaScript 檔案。");
const failures=[];
for(const file of files){
 const checked=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
 if(checked.status!==0)failures.push(file+": "+String(checked.stderr||checked.stdout||"syntax error").trim());
}
assert(failures.length===0,"JavaScript 語法檢查失敗：\n"+failures.join("\n\n"));

const index=read("index.html");
const contract=read("integritycontract.js");
const runtime=read("runtimeintegrity.js");
const finalIntegrity=read("finalintegrity.js");
const saveMigration=read("savemigration.js");
const saveVersionGuard=read("saveversionguard.js");
const offlineStateCore=read("offlinestatecore.js");
const offlineProgress=read("offlineprogress.js");
const cloudSave=read("cloudsave.js");
const gmData=read("gmdata.js");
const dungeonProgress=read("dungeonprogress.js");
const arena=read("dungeonarena.js");
const bounty=read("dungeonbounty.js");
const secondWorldCombat=read("secondworldcombat.js");
const worldmap=read("worldmapui.js");
const ui=read("ui.js");
const playerSemanticsUi=read("playersemanticsui.js");
const secondWorldCalamityIntegrity=read("secondworldcalamityintegrity.js");
const secondWorldCalamityRun=read("secondworldcalamityrun.js");
const secondWorldCalamityUi=read("secondworldcalamityui.js");
const titleCore=read("playertitlecore.js");
const compatibilityOwners=read("compatibilityowners.js");
const levelAudit=read("levelprogressionaudit.js");
const dungeonVoid=read("dungeonvoid.js");
const dungeonGm=read("dungeongm.js");
const specialEncounter=read("specialencounter.js");
const inventoryFocus=read("inventoryfocus.js");
const vipLootCore=read("viplootcore.js");
const traitDrop=read("traitdrop.js");
const combatCore=read("combatcore.js");
const secondWorldRewards=read("secondworldrewards.js");
const secondWorldMainline=read("secondworldmainline.js");

const localScripts=[...index.matchAll(/<script\s+src=["']([^"']+)["']/g)]
 .map(match=>match[1].split("?")[0])
 .filter(src=>!/^https?:\/\//.test(src));
for(const src of localScripts)assert(fs.existsSync(src),"index.html 載入不存在的本地 script："+src);
const pos=name=>index.indexOf('src="'+name+'?v=');
assert(pos("offlinestatecore.js")>=0&&pos("offlinestatecore.js")<pos("savemigration.js"),"offlinestatecore.js 必須先於 savemigration.js 載入。");
assert(pos("saveversionguard.js")>pos("savemigration.js"),"saveversionguard.js 必須在正式 migration 之後載入。");
assert(pos("saveversionguard.js")<pos("gmdata.js")&&pos("saveversionguard.js")<pos("cloudsave.js"),"saveversionguard.js 必須先於 JSON／Cloud 存檔入口載入。");
assert(pos("offlineprogress.js")>pos("offlinestatecore.js"),"offlineprogress.js 必須在 Offline state owner 之後載入。");
assert(pos("levelprogressionaudit.js")>pos("levelprogression.js"),"levelprogressionaudit.js 必須在正式等級 owner 之後載入。");
assert(pos("compatibilityowners.js")>pos("dungeonprogress.js")&&pos("compatibilityowners.js")>pos("levelprogression.js")&&pos("compatibilityowners.js")<pos("integritycontract.js"),"compatibilityowners.js 必須在正式 owner 後、Integrity Contract 前載入。");
assert(pos("integritycontract.js")>=0,"index.html 缺少 integritycontract.js cache-bust 載入。");
assert(pos("runtimeintegrity.js")>pos("integritycontract.js"),"integritycontract.js 必須先於 runtimeintegrity.js 載入。");
assert(pos("finalintegrity.js")>pos("runtimeintegrity.js"),"finalintegrity.js 必須晚於 runtimeintegrity.js 載入。");
assert(!index.includes('src="runtimeintegrityaddon.js?v='),"runtimeintegrityaddon.js 已納入正式 Runtime owner，不應再載入。");
assert(!index.includes('src="level100balance.js?v='),"level100balance.js 已退休，不應再由正式頁面載入。");
assert(!fs.existsSync("level100balance.js"),"level100balance.js 已退休，repo 不應再保留舊檔。");

assert(pos("viplootcore.js")>pos("vipprogression.js")&&pos("viplootcore.js")<pos("traitdrop.js")&&pos("viplootcore.js")<pos("dungeonbounty.js")&&pos("viplootcore.js")<pos("combatcore.js"),"viplootcore.js 必須在 VIP progression 後、正式掉裝 consumer 前載入。");
assert(/VIP_LOOT_CORE_VERSION=VERSION/.test(vipLootCore)&&/const VERSION=2;/.test(vipLootCore),"VIP Loot 共用 owner 應為 V2。");
assert(/vip8:Object\.freeze\(\{level:VIP8_LEVEL,chance:VIP8_WEAK_SLOT_CHANCE\}\)/.test(vipLootCore)&&/vip14:Object\.freeze\(\{level:VIP14_LEVEL,chance:VIP14_QUALITY_CHANCE\}\)/.test(vipLootCore)&&/vip16:Object\.freeze\(\{level:VIP16_LEVEL,chance:VIP16_BOSS_EXTRA_CHANCE\}\)/.test(vipLootCore)&&/vip18:Object\.freeze\(\{level:VIP18_LEVEL,chance:VIP18_BOSS_QUALITY_CHANCE\}\)/.test(vipLootCore),"VIP8／14／16／18 裝備特權必須由 viplootcore.js 統一持有。");
assert(/resolveVipLootModifiers=resolveVipLootModifiers/.test(vipLootCore)&&/defaultWeakEquipmentTypes/.test(vipLootCore)&&/options\.state/.test(vipLootCore)&&/weakTypesResolver/.test(vipLootCore)&&!/weakEquipmentTypes\(/.test(vipLootCore),"VIP Loot V2 必須統一 modifiers，VIP8 最弱部位必須支援 target state／resolver 且不得依賴漂移舊名稱。");
assert(/resolveVipLootModifiers/.test(traitDrop)&&!/applyVipLootQualityPromotions/.test(traitDrop)&&!/vipLootForcedType/.test(traitDrop),"銀河主線 VIP8／14／18 必須只委派單一 VIP Loot modifier resolver。");
assert(/function bountyLootModifiers\(enemy\)/.test(bounty)&&/resolveVipLootModifiers\(q,\{boss:false,state\}\)/.test(bounty)&&!/bountyForcedType/.test(bounty),"銀河／宇宙懸賞 VIP8／14 必須共用單一 VIP Loot modifier resolver。");
assert(/vipLootBossExtraDropTriggered\(\{boss:e\.kind==="boss"\}\)/.test(combatCore)&&!/e\.kind==="boss"&&\(state\.vipLevel\|\|0\)>=16&&Math\.random\(\)<\.15/.test(combatCore),"銀河主線 VIP16 Boss 額外掉落必須委派共用 VIP Loot owner。");
assert(index.includes('viplootcore.js?v=20260925-vip-loot-cleanup1')&&index.includes('traitdrop.js?v=20260925-vip-loot-cleanup1')&&index.includes('dungeonbounty.js?v=20260925-vip-loot-cleanup1'),"index.html 必須載入 VIP Loot Cleanup1 最新共用 owner cache-bust。");
assert(/const VERSION=5;/.test(secondWorldRewards)&&/SECOND_WORLD_VIP_LOOT_PIPELINE_VERSION=1/.test(secondWorldRewards),"宇宙主線 VIP Loot pipeline 應使用 Reward V5。");
assert(/resolveVipLootModifiers\(baseQuality,\{boss:true,rng/.test(secondWorldRewards)&&/weakTypesResolver:options\.weakTypesResolver/.test(secondWorldRewards),"宇宙主線固定 Boss 裝備必須套用單一 VIP8／14／18 resolver，且支援 target state／resolver。");
assert(/vipLootBossExtraDropTriggered\(\{boss:true,rng,vipLevel:options\.vipLevel\}\)/.test(secondWorldRewards)&&/vip16Extra:true/.test(secondWorldRewards),"宇宙主線 VIP16 必須由共用 owner 產生額外 Boss 裝備，並共用可注入 RNG。");
assert(/equipmentRewards=drops\.map/.test(secondWorldRewards)&&/equipmentRewards,levelBefore/.test(secondWorldRewards),"宇宙主線結算必須保留所有基礎／VIP16 額外裝備結果。");
assert(/function secondWorldEquipmentRewardRows\(result\)/.test(secondWorldRewards)&&/function rewardRows\(result\)/.test(secondWorldMainline)&&/secondWorldEquipmentRewardRows\(result\)/.test(secondWorldMainline)&&/VIP16 額外主線裝備/.test(secondWorldMainline),"宇宙主線單場結算必須共用 reward-row owner 並呈現 VIP16 額外裝備。");
assert(/secondWorldEquipmentRewardRows\(settled\)/.test(secondWorldMainline)&&/rows\.forEach\(row=>/.test(secondWorldMainline)&&/row\.sale\?\.quote\?\.darkMatter/.test(secondWorldMainline)&&/row\.sale\?\.quote\?\.darkEnergy/.test(secondWorldMainline),"宇宙主線連續戰鬥必須共用 reward-row owner 並逐件統計保留／自售與暗物質／暗能量。");
assert(index.includes('secondworldrewards.js?v=20260925-vip-loot-cleanup1')&&index.includes('secondworldmainline.js?v=20260925-vip-loot-cleanup1'),"index.html 必須載入 VIP Loot Cleanup1 最新宇宙主線 cache-bust。");
assert(pos("inventoryfocus.js")>pos("equipmentlock.js")&&pos("inventoryfocus.js")>pos("gearupgrade.js"),"inventoryfocus.js 必須在 equipmentlock.js 與 gearupgrade.js 後載入，以共用正式裝備比較 owner。");
assert(/INVENTORY_FOCUS_VERSION=VERSION/.test(inventoryFocus)&&/const VERSION=3;/.test(inventoryFocus),"背包定位 owner 應為 V3。");
assert(/requestInventoryEntryFocus=requestEntryFocus/.test(inventoryFocus)&&/requestInventoryPostRedeemFocus=requestPostRedeemFocus/.test(inventoryFocus)&&/applyInventoryFocus=applyFocus/.test(inventoryFocus),"背包定位必須提供 entry、post-redeem 與 apply API。");
assert(/scrollIntoView/.test(inventoryFocus)&&/\.lost-gear-card/.test(inventoryFocus)&&/equipBestAll/.test(inventoryFocus),"背包定位必須使用實際 DOM 目標，不得依賴固定像素位置。");
assert(!/baseGo|baseAdventureInventory|window\.go=function|window\.openAdventureInventory=function/.test(inventoryFocus),"背包定位 owner 不得 monkey-patch go 或 openAdventureInventory。");
assert(/function go\(v\)[\s\S]*requestInventoryEntryFocus[\s\S]*render\(\)[\s\S]*applyInventoryFocus/.test(ui)&&/function openAdventureInventory\(\)[\s\S]*requestInventoryEntryFocus[\s\S]*render\(\)[\s\S]*applyInventoryFocus/.test(ui),"首頁與冒險背包正式入口必須直接共用背包定位 owner。");
assert(/resolveInventoryFocusTarget=resolveFocusTarget/.test(inventoryFocus),"背包定位必須提供單一 target resolver。");
assert(/isActualGearUpgrade/.test(inventoryFocus)&&!/equipmentScore\(item\)>/.test(inventoryFocus),"背包較強裝備判定必須委派正式 isActualGearUpgrade owner。");
assert(/function redeemGear\(i\)[\s\S]*requestInventoryPostRedeemFocus[\s\S]*render\(\)[\s\S]*applyInventoryFocus/.test(ui),"成功贖回後必須在 render 前建立 post-redeem request，並在 render 後套用背包定位。");
assert(index.includes('inventoryfocus.js?v=20260925-inventory-focus-cleanup1'),"index.html 必須載入正式 inventoryfocus.js cache-bust。");

// Inventory Focus behavior contract: verify actual resolver output instead of source-code if-order.
const vm=require("vm");
function createInventoryFocusHarness({lost=false,upgrade=false}={}){
 const scrolls=[];
 const lostTarget={scrollIntoView:()=>scrolls.push("lost-gear")};
 const upgradeTarget={scrollIntoView:()=>scrolls.push("upgrade")};
 const inventoryPage={};
 const context={
  state:{lostGear:lost?[{item:{}}]:[],inventory:upgrade?[{upgrade:true}]:[]},
  document:{querySelector(selector){
   if(selector===".inventory-page")return inventoryPage;
   if(selector===".inventory-page .lost-gear-card")return lostTarget;
   if(selector==='.inventory-page [onclick="equipBestAll()"]')return upgradeTarget;
   return null;
  }},
  requestAnimationFrame(fn){fn();},
  setTimeout(fn){fn();},
  console
 };
 context.window={
  isActualGearUpgrade:item=>item?.upgrade===true,
  scrollTo:()=>scrolls.push("top")
 };
 vm.createContext(context);
 vm.runInContext(inventoryFocus,context,{filename:"inventoryfocus.js"});
 return {api:context.window,scrolls,context};
}
function inventoryFocusTarget(mode,options){
 const h=createInventoryFocusHarness(options);
 return h.api.resolveInventoryFocusTarget(mode);
}
assert(inventoryFocusTarget("entry",{lost:true,upgrade:true})==="lost-gear","背包定位行為：有遺失裝備時必須優先定位遺失裝備。");
assert(inventoryFocusTarget("entry",{lost:false,upgrade:true})==="upgrade","背包定位行為：無遺失裝備但有較強裝備時必須定位一鍵裝備。");
assert(inventoryFocusTarget("entry",{lost:false,upgrade:false})==="top","背包定位行為：一般進入且無待處理裝備時必須回到頂部。");
assert(inventoryFocusTarget("post-redeem",{lost:true,upgrade:true})==="lost-gear","背包定位行為：贖回後仍有遺失裝備時必須留在遺失裝備區。");
assert(inventoryFocusTarget("post-redeem",{lost:false,upgrade:true})==="upgrade","背包定位行為：最後一件贖回後若有較強裝備必須定位一鍵裝備。");
assert(inventoryFocusTarget("post-redeem",{lost:false,upgrade:false})==="none","背包定位行為：贖回後無遺失與升級裝備時不得額外移動畫面。");
const inventoryPendingHarness=createInventoryFocusHarness({lost:false,upgrade:false});
inventoryPendingHarness.api.requestInventoryEntryFocus();
assert(inventoryPendingHarness.api.applyInventoryFocus()===true,"背包定位 pending：第一次 apply 必須消耗 request。");
assert(inventoryPendingHarness.api.applyInventoryFocus()===false,"背包定位 pending：同一 request 不得重複 apply。");
assert(inventoryPendingHarness.scrolls.filter(x=>x==="top").length===1,"背包定位 pending：一次 request 只能造成一次實際定位。");

assert(/CIVILIZATION_INTEGRITY_CONTRACT_VERSION=VERSION/.test(contract),"Canonical Integrity Contract V1 export 缺失。");
assert(/SAVE_SCHEMA_VERSION:15/.test(contract),"Integrity Contract 的 Save Schema 應為 15。");
assert(/SAVE_LEGACY_SUPPORT_POLICY_VERSION:1/.test(contract),"Integrity Contract 必須要求舊存檔支援政策 V1。");
assert(/OFFLINE_STATE_NORMALIZATION_VERSION:1/.test(contract),"Integrity Contract 必須要求 Offline state normalization V1。");
assert(/SAVE_FUTURE_VERSION_GUARD_VERSION:1/.test(contract),"Integrity Contract 必須要求未來版本存檔保護 V1。");
assert(/LEGACY_COMPATIBILITY_OWNER_VERSION:1/.test(contract)&&/LEVEL_PROGRESSION_AUDIT_VERSION:1/.test(contract),"Integrity Contract 必須要求 compatibility owner 與通用等級 audit V1。");
assert(/PLAYER_TITLE_CATALOG_VERSION:3/.test(contract),"Integrity Contract 的稱號 catalog 應為 V3。");
assert(/ARENA_BY_WORLD_STATE_VERSION:2/.test(contract),"Integrity Contract 的 Arena By World state 應為 V2。");
assert(/SECOND_WORLD_ARENA_UNLOCK_VERSION:2/.test(contract),"Integrity Contract 的宇宙 Arena unlock 應為 V2。");
assert(/SECOND_WORLD_ARENA_RANK_CURVE_VERSION:2/.test(contract),"Integrity Contract 的宇宙 Arena curve 應為 V2。");
assert(/SECOND_WORLD_CIVILIZATION_COMBAT_VERSION:2/.test(contract),"Integrity Contract 的宇宙文明戰鬥應為 V2。");
assert(/BOUNTY_BALANCE_VERSION:2/.test(contract)&&/BOUNTY_DIFFICULTY_FORMULA_VERSION:2/.test(contract),"Integrity Contract 的 Bounty 應為 V2。");
assert(/SECOND_WORLD_ADVENTURE_UI_VERSION:4/.test(contract),"Integrity Contract 的宇宙冒險 UI 應為 V4。");
assert(/SECOND_WORLD_CALAMITY_FULL_INTEGRITY_VERSION:2/.test(contract),"Integrity Contract 的宇宙災厄完整檢查應為 V2。");

assert(/LEGACY_COMPATIBILITY_OWNER_VERSION=VERSION/.test(compatibilityOwners),"compatibilityowners.js 缺少正式 V1 export。");
assert(/LEGACY_SAVE_VERSION_VALUE!==13/.test(compatibilityOwners)&&/LEGACY_MAX_LEVEL_VALUE!==500/.test(compatibilityOwners),"compatibilityowners.js 必須固定驗證 legacy Save V13 與舊第一世界上限 500。");
assert(/SAVE_SCHEMA_OWNER="savemigration"/.test(compatibilityOwners)&&/LEVEL_CAP_RUNTIME_OWNER="levelprogression"/.test(compatibilityOwners)&&/ARENA_RUNTIME_OWNER="arenaByWorld"/.test(compatibilityOwners),"compatibilityowners.js 正式 owner 宣告不完整。");
assert(/LEVEL_PROGRESSION_AUDIT_VERSION=VERSION/.test(levelAudit),"levelprogressionaudit.js 缺少正式 V1 export。");
assert(!/level100ExpFactor/.test(levelAudit),"通用等級 audit 不得復活 level100ExpFactor 舊 alias。");

const productionFiles=files.filter(file=>!file.startsWith("tests"+path.sep));
const basename=file=>path.basename(file);
const maxLevelConsumers=productionFiles.filter(file=>/\bMAX_LEVEL\b/.test(read(file))).map(basename).sort();
const allowedMaxLevelConsumers=["compatibilityowners.js","dungeonbounty.js","dungeonui.js","engine.js","enhancementcore.js","enhancementintegrity.js","gmhub.js","gmtools.js","levelprogression.js","mainminimalmode.js","offlineprogress.js","savemigration.js","traitdrop.js","ui.js"].sort();
assert(JSON.stringify(maxLevelConsumers)===JSON.stringify(allowedMaxLevelConsumers),"MAX_LEVEL consumer audit 異常："+maxLevelConsumers.join(", "));
const saveVersionConsumers=productionFiles.filter(file=>/\bSAVE_VERSION\b/.test(read(file))).map(basename).sort();
const allowedSaveVersionConsumers=["compatibilityowners.js","data.js","dungeonprogress.js","engine.js","ui.js"].sort();
assert(JSON.stringify(saveVersionConsumers)===JSON.stringify(allowedSaveVersionConsumers),"SAVE_VERSION consumer audit 異常："+saveVersionConsumers.join(", "));
const directArenaConsumers=productionFiles.filter(file=>/(?:dungeon\.arena|dungeon\?\.arena)/.test(read(file))).map(basename).sort();
const allowedDirectArenaConsumers=["dungeonarena.js","dungeonprogress.js","runtimeintegrity.js","savemigration.js"].sort();
assert(JSON.stringify(directArenaConsumers)===JSON.stringify(allowedDirectArenaConsumers),"legacy dungeon.arena consumer audit 異常："+directArenaConsumers.join(", "));
const retiredLevel100Consumers=productionFiles.filter(file=>/\blevel100ExpFactor\b/.test(read(file))).map(basename);
assert(retiredLevel100Consumers.length===0,"level100ExpFactor 已退休，不得再有 consumer："+retiredLevel100Consumers.join(", "));

assert(/SAVE_LEGACY_SUPPORT_POLICY_VERSION=1/.test(saveMigration),"savemigration.js 必須宣告舊存檔支援政策 V1。");
assert(/SAVE_MIN_SUPPORTED_VERSION=1/.test(saveMigration)&&/SAVE_LEGACY_SUPPORT_MODE="all-known"/.test(saveMigration),"savemigration.js 應維持所有已知 V1+ 舊存檔支援政策。");
assert(/normalizeOfflineSaveState\(target,\{sourceVersion:version\}\)/.test(saveMigration),"savemigration.js 必須委派 Offline state normalization 給單一 owner。");
assert(!/function normalizeOffline\(/.test(saveMigration)&&!/function normalizeRealBattleSamples\(/.test(saveMigration),"savemigration.js 不得保留重複 Offline normalization owner。");
assert(/OFFLINE_STATE_NORMALIZATION_VERSION=VERSION/.test(offlineStateCore),"offlinestatecore.js 缺少正式 normalization V1 export。");
assert(/OFFLINE_BATTLE_SAMPLE_VERSION=3/.test(offlineStateCore),"offlinestatecore.js 應持有 Offline battle sample V3 正式常數。");
assert(/window\.normalizeOfflineSaveState=normalizeOfflineSaveState/.test(offlineStateCore),"offlinestatecore.js 缺少正式 normalizeOfflineSaveState API。");
assert(/return window\.normalizeOfflineSaveState\(state,/.test(offlineProgress),"offlineprogress.js runtime ensure 必須委派給 Offline state owner。");
assert(!/storedSampleVersion/.test(offlineProgress),"offlineprogress.js 不得保留第二套 battleSampleVersion normalization。");

assert(/SAVE_FUTURE_VERSION_GUARD_VERSION=VERSION/.test(saveVersionGuard),"saveversionguard.js 缺少正式 V1 export。");
assert(/FUTURE_SAVE_VERSION/.test(saveVersionGuard),"saveversionguard.js 必須具備 future-version fail-closed 錯誤碼。");
assert(/SAVE_MIN_SUPPORTED_VERSION/.test(saveVersionGuard)&&/isLegacy/.test(saveVersionGuard),"saveversionguard.js 必須套用正式 legacy support policy。");
assert(/window\.migrateSave=function/.test(saveVersionGuard),"saveversionguard.js 必須防護 direct migrateSave 呼叫。");
assert(/window\.load=function/.test(saveVersionGuard)&&/reason=info\.isFuture\?"future-version":"unsupported-legacy-version"/.test(saveVersionGuard),"Local Load 必須依正式相容範圍 fail-closed。");
assert(/assertSaveVersionSupported\(source,\{label:"雲端存檔"\}\)/.test(cloudSave),"Cloud Download 必須使用共用未來版本存檔保護。");
assert(/migrateSave\(source,compatibility\.sourceVersion/.test(cloudSave),"Cloud Download 必須走正式 migration pipeline。");
assert(/assertSaveVersionSupported\(raw,\{version,label:"JSON 存檔"\}\)/.test(gmData),"GM JSON Import 必須使用共用未來版本存檔保護。");

assert(/const VERSION=19;/.test(runtime),"runtimeintegrity.js 應為 V19。");
assert(/runCivilizationIntegrityContract\(\{phase:"runtime"\}\)/.test(runtime),"runtimeintegrity.js 必須執行 canonical contract。");
assert(/SAVE_LEGACY_SUPPORT_POLICY_VERSION/.test(runtime)&&/OFFLINE_STATE_NORMALIZATION_VERSION/.test(runtime),"runtimeintegrity.js 必須 probe legacy policy 與 Offline state owner。");
assert(/PROJECT_RUNTIME_INTEGRITY_VERSION=VERSION/.test(runtime),"runtimeintegrity.js 缺少正式版本 export。");
assert(!runtime.includes("v11 → v14"),"runtimeintegrity.js 不得保留舊 Schema 14 診斷文字。");
assert(!/PLAYER_TITLE_DEFS\.length!==16/.test(runtime),"runtimeintegrity.js 不得再以 16 稱號為正式基準。");
assert(!/SECOND_WORLD_CIVILIZATION_COMBAT_VERSION\)!==1/.test(runtime),"runtimeintegrity.js 不得再要求舊宇宙文明戰鬥 V1。");
assert(!/ARENA_BY_WORLD_STATE_VERSION\)!==1/.test(runtime),"runtimeintegrity.js 不得再要求舊 Arena By World V1。");

assert(/const VERSION=19;/.test(finalIntegrity),"finalintegrity.js 應為 V19。");
assert(/PROJECT_RUNTIME_INTEGRITY_VERSION\)!==19/.test(finalIntegrity),"finalintegrity.js 必須要求 Runtime Integrity V19。");
assert(/runCivilizationIntegrityContract\(\{phase:"final"\}\)/.test(finalIntegrity),"finalintegrity.js 必須執行 canonical contract。");
assert(!/PLAYER_TITLE_DEFS\.length!==16/.test(finalIntegrity),"finalintegrity.js 不得再以 16 稱號為正式基準。");
assert(!/ARENA_BY_WORLD_STATE_VERSION\)!==1/.test(finalIntegrity),"finalintegrity.js 不得再要求舊 Arena By World V1。");
assert(!/SECOND_WORLD_ADVENTURE_UI_VERSION\)!==2/.test(finalIntegrity),"finalintegrity.js 不得再要求舊宇宙冒險 UI V2。");

assert(/ARENA_BY_WORLD_STATE_VERSION=2/.test(dungeonProgress),"dungeonprogress.js Arena By World state 應為 V2。");
assert(/SECOND_WORLD_ARENA_UNLOCK_VERSION=2/.test(dungeonProgress),"dungeonprogress.js 宇宙 Arena unlock 應為 V2。");
assert(/SECOND_WORLD_ARENA_RANK_CURVE_VERSION=2/.test(arena),"dungeonarena.js 第二世界 Arena Rank Curve 應為 V2。");
assert(/hp:Object\.freeze\(\{base:1\.68,linear:\.05,quadratic:-\.0015\}\)/.test(arena),"dungeonarena.js 第二世界 Arena HP curve 係數不符。");
assert(/damage:Object\.freeze\(\{base:1\.52,linear:\.04,quadratic:-\.001\}\)/.test(arena),"dungeonarena.js 第二世界 Arena damage curve 係數不符。");
assert(/def:Object\.freeze\(\{base:1\.11,linear:\.022,quadratic:-\.0004\}\)/.test(arena),"dungeonarena.js 第二世界 Arena DEF curve 係數不符。");
assert(/BOUNTY_BALANCE_VERSION=2/.test(bounty),"dungeonbounty.js Bounty Balance 應為 V2。");
assert(/BOUNTY_DIFFICULTY_FORMULA_VERSION=2/.test(bounty),"dungeonbounty.js Bounty Difficulty Formula 應為 V2。");
assert(/const BASE_STAT=2700;/.test(secondWorldCombat),"secondworldcombat.js 宇宙 Boss 單一基準應為 2700。");
assert(/SECOND_WORLD_CIVILIZATION_COMBAT_VERSION=2/.test(secondWorldCombat),"secondworldcombat.js 宇宙文明戰鬥 owner 應為 V2。");
assert(/STAT_RATIO=Object\.freeze\(\{hp:12,atk:2,def:1\}\)/.test(secondWorldCombat),"secondworldcombat.js 宇宙 Boss 比例應為 12:2:1。");
assert(/SECOND_WORLD_ADVENTURE_UI_VERSION=4/.test(worldmap),"worldmapui.js 宇宙冒險 UI 應為 V4。");
assert(/SECOND_WORLD_ADVENTURE_AUTO_FOCUS_VERSION=2/.test(worldmap),"宇宙冒險目前進度自動定位應為 V2。");
assert(/requestSecondWorldAdventureProgressFocus=function/.test(worldmap)&&/applySecondWorldAdventureProgressFocus=function/.test(worldmap)&&/cancelSecondWorldAdventureProgressFocus=function/.test(worldmap),"宇宙冒險必須提供一次性定位 request/apply/cancel owner。");
assert(/scrollIntoView/.test(worldmap)&&/block:"center"/.test(worldmap)&&/data-second-world-boss/.test(worldmap),"宇宙冒險定位必須以目前 Boss 元素置中，不得依賴固定像素捲動。");
assert(/function secondWorldActiveRegionIndex\(\)[\s\S]*secondWorldLatestProgressBossIndex\(\)/.test(worldmap),"宇宙目前區域必須共用 latest-progress Boss owner。");
assert(!/installStyles|applyUniverseAdventureSemantics|SECOND_WORLD_ADVENTURE_HEADER_POLISH_VERSION/.test(playerSemanticsUi),"已退休的宇宙冒險頂部背包 cleanup 不得殘留。");
for(const fn of ["go","backToAdventureFromInventory","closeBattleResultModal"]){
 const start=ui.indexOf("function "+fn+"(");
 assert(start>=0,"找不到 "+fn+"。");
 const next=ui.indexOf("\nfunction ",start+1);
 const body=ui.slice(start,next>=0?next:ui.length);
 assert(body.includes("requestSecondWorldAdventureProgressFocus"),fn+" 必須保留宇宙目前 Boss 定位請求。");
}
assert(/applySecondWorldAdventureProgressFocus/.test(playerSemanticsUi),"playersemanticsui.js 必須在 render 後套用一次性宇宙冒險定位。");
assert(/SECOND_WORLD_CALAMITY_FULL_INTEGRITY_VERSION=VERSION/.test(secondWorldCalamityIntegrity)&&/const VERSION=2;/.test(secondWorldCalamityIntegrity),"secondworldcalamityintegrity.js 應為完整 Integrity V2。");
assert(/PLAYER_TITLE_CATALOG_VERSION=3/.test(titleCore),"playertitlecore.js 正式稱號 catalog 應為 V3。");

assert(/const CONTINUOUS_VERSION=2;/.test(secondWorldCalamityRun),"宇宙災厄連續討伐版本應為 V2。");
assert(/SECOND_WORLD_CALAMITY_BACKGROUND_VERSION=1/.test(secondWorldCalamityRun)&&/SECOND_WORLD_CALAMITY_FAST_CATCH_UP_POLICY_VERSION=1/.test(secondWorldCalamityRun),"宇宙災厄必須宣告背景戰鬥與 fast catch-up owner 版本。");
assert(/backgroundProgressStart\("calamity",\{mode:"continuous"\}\)/.test(secondWorldCalamityRun)&&/backgroundProgressStop\("calamity"\)/.test(secondWorldCalamityRun),"宇宙災厄連續討伐必須共用 calamity 背景 start/stop owner。");
assert(/backgroundProgressFastCatchUpActive\("calamity"\)/.test(secondWorldCalamityRun)&&/backgroundProgressCatchUpPolicy\("calamity",next,false\)/.test(secondWorldCalamityRun),"宇宙災厄連續討伐必須接上 fast catch-up policy。");
assert(/startBackground\(\);[\s\S]*const previewPolicy=catchUpPreviewPolicy\(\);/.test(secondWorldCalamityRun),"宇宙災厄 continuous 必須先啟動背景 flow，再套用 catch-up policy。");
assert(/save:fast\?previewPolicy\?\.shouldCheckpoint===true:options\.save/.test(secondWorldCalamityRun)&&/preparePresentation:fast\?previewPolicy\?\.shouldPresentBattle===true:options\.preparePresentation/.test(secondWorldCalamityRun),"宇宙災厄 fast catch-up 必須降低存檔與演出頻率。");
assert(/if\(activeRun\.mode==="continuous"&&backgroundEnabled\(\)\)return;/.test(secondWorldCalamityRun)&&/addEventListener\("pagehide",stopForPageHide\)/.test(secondWorldCalamityRun),"宇宙災厄 pagehide 必須在背景戰鬥開啟時保留連續討伐。");
assert(/backgroundProgressSleep\(ms,"calamity"\)/.test(secondWorldCalamityUi)&&/backgroundProgressCatchUpStep\("calamity"\)/.test(secondWorldCalamityUi)&&/backgroundProgressConsumeCatchUpCredit\(delay,"calamity"\)/.test(secondWorldCalamityUi),"宇宙災厄 UI 必須共用 calamity 背景 sleep、catch-up step 與 credit。");
assert(/backgroundProgressCatchUpFinalPolicy\("calamity"\)/.test(secondWorldCalamityUi)&&/combatOuterGapMs\("calamity","battle"\)/.test(secondWorldCalamityUi),"宇宙災厄 UI 必須在追趕完成後收斂並維持正式場間節奏。");
assert(index.includes('src="secondworldcalamityrun.js?v=20260924-universe-background-batch1"')&&index.includes('src="secondworldcalamityui.js?v=20260924-universe-background-batch1"'),"index.html 必須載入宇宙災厄背景戰鬥 Batch1 cache-bust。");

assert(/const VOID_MIRAGE_HP_BASE=100\.0;/.test(dungeonVoid)&&/const VOID_MIRAGE_HP_PER_FLOOR=9\.6;/.test(dungeonVoid),"虛空 HP 線性公式應為 100.0 + 9.6F。");
assert(/const VOID_MIRAGE_ATK_BASE=10\.0;/.test(dungeonVoid)&&/const VOID_MIRAGE_ATK_PER_FLOOR=1\.3;/.test(dungeonVoid),"虛空 ATK 線性公式應為 10.0 + 1.3F。");
assert(/const VOID_MIRAGE_DEF_BASE=5\.0;/.test(dungeonVoid)&&/const VOID_MIRAGE_DEF_PER_FLOOR=0\.6;/.test(dungeonVoid),"虛空 DEF 線性公式應為 5.0 + 0.6F。");
assert(/formulaVersion:2/.test(dungeonVoid),"虛空公式版本應為 V2。");
assert(/Math\.ceil\(VOID_MIRAGE_HP_BASE\+VOID_MIRAGE_HP_PER_FLOOR\*f\)/.test(dungeonVoid),"虛空 HP baseStats 未使用正式線性公式。");
assert(/Math\.ceil\(VOID_MIRAGE_ATK_BASE\+VOID_MIRAGE_ATK_PER_FLOOR\*f\)/.test(dungeonVoid),"虛空 ATK baseStats 未使用正式線性公式。");
assert(/Math\.ceil\(VOID_MIRAGE_DEF_BASE\+VOID_MIRAGE_DEF_PER_FLOOR\*f\)/.test(dungeonVoid),"虛空 DEF baseStats 未使用正式線性公式。");
assert(!/VOID_MIRAGE_(HP|ATK|DEF)_MULTIPLIER/.test(dungeonVoid),"虛空 V2 不得復活舊倍率公式。");
assert(/voidMirageBaseStats\(floor\)/.test(dungeonGm)&&/buildVoidMirageEnemy\(floor/.test(dungeonGm),"GM 虛空測試必須共用正式虛空公式 owner。");
assert(index.includes('src="dungeonvoid.js?v=20260924-void-linear-cleanup1"'),"index.html 必須載入虛空線性公式 V2 cleanup cache-bust。");
assert(/if\(world===1&&baseEnemy\?\.kind==="boss"\)return false;/.test(specialEncounter),"銀河紀元 Boss 必須維持禁止特殊遭遇。");
assert(!/equivalentPower/.test(dungeonVoid),"虛空 V2 已改為純樓層線性公式，不得保留 equivalentPower 舊語意。");
const specialFlowStart=specialEncounter.indexOf('const special=rollSpecialMonster(');
const specialFlowEnd=specialEncounter.indexOf('if(result.win&&world===1',specialFlowStart);
const specialFlow=specialFlowStart>=0&&specialFlowEnd>specialFlowStart?specialEncounter.slice(specialFlowStart,specialFlowEnd):"";
const specialAlertPos=specialFlow.indexOf('await showSpecialEncounterAlert(special,forcedByBlackMarket);');
const specialHealPos=specialFlow.indexOf('if(typeof restorePlayerHp==="function")restorePlayerHp({save:false});');
const specialFightPos=specialFlow.indexOf('const result=await fightFormalSpecial(ctx,special,{world,bossIndex:options.bossIndex});');
assert(specialAlertPos>=0&&specialHealPos>specialAlertPos&&specialFightPos>specialHealPos,"特殊遭遇流程必須為提示完成後回滿血，再進入正式特殊戰鬥。");
assert(index.includes('src="specialencounter.js?v=20260924-special-heal-order2"'),"index.html 必須載入特殊遭遇回血順序 V2 cache-bust。");

console.log("Runtime integrity passed: "+files.length+" JavaScript files parsed; canonical source contract, save compatibility policy, offline state owner, legacy compatibility consumers, and load order are synchronized.");
