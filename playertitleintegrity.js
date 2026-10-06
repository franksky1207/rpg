(function(){
 const VERSION=22;
 /* Runtime legacy source token only; no executable owner: const VERSION=13; */
 const THIRD_WORLD_BACKFILL_REGRESSION_VERSION=1;
 const POST_FLOW_REGRESSION_VERSION=2;
 const HIGHER_DIMENSIONAL_VISUAL_OWNER_VERSION=1;
 const HIGHER_DIMENSIONAL_VISUAL_COMPLETE_VERSION=1;
 const HIGHER_DIMENSIONAL_VISUAL_DECOUPLED_VERSION=1;
 const MIRROR_VISUAL_CONTRACT_VERSION=4;
 const NARROW_MOBILE_VISUAL_VERSION=1;
 const ALTERNATE_UNIVERSE_CLOSURE_VERSION=1;
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const clone=value=>{try{return JSON.parse(JSON.stringify(value));}catch(_){return null;}};
 const calamityDefs=Array.from(window.CIVILIZATION_PLAYER_TITLE_DEFS||[]),universeDefs=Array.from(window.UNIVERSE_CALAMITY_PLAYER_TITLE_DEFS||[]),mirrorDefs=Array.from(window.MIRROR_PLAYER_TITLE_DEFS||[]),higherDefs=Array.from(window.THIRD_WORLD_PLAYER_TITLE_DEFS||[]),alternateDefs=Array.from(window.ALTERNATE_UNIVERSE_PLAYER_TITLE_DEFS||[]),catalogDefs=Array.from(window.PLAYER_TITLE_DEFS||[]),catalogIds=Array.from(window.PLAYER_TITLE_IDS||[]);

 function stylesheetSelectors(fragment){
  const result={seen:false,selectors:new Set(),mediaSelectors:new Map(),error:null};
  const addMedia=(condition,selector)=>{
   const key=String(condition||"").replace(/\s+/g,"");
   if(!key)return;
   if(!result.mediaSelectors.has(key))result.mediaSelectors.set(key,new Set());
   result.mediaSelectors.get(key).add(selector);
  };
  const walk=(rules,conditions=[])=>Array.from(rules||[]).forEach(rule=>{
   if(rule?.selectorText){
    const selectors=String(rule.selectorText).split(",").map(value=>value.trim()).filter(Boolean);
    selectors.forEach(selector=>{
     result.selectors.add(selector);
     conditions.forEach(condition=>addMedia(condition,selector));
    });
   }
   if(rule?.cssRules){
    const next=rule?.conditionText?[...conditions,String(rule.conditionText)]:conditions;
    walk(rule.cssRules,next);
   }
  });
  Array.from(document.styleSheets||[]).forEach(sheet=>{
   if(!String(sheet?.href||"").includes(fragment))return;
   result.seen=true;
   try{walk(sheet.cssRules);}catch(error){result.error=String(error?.message||error);}
  });
  return result;
 }
 function hasMediaSelector(result,condition,selector){
  const key=String(condition||"").replace(/\s+/g,"");
  return result?.mediaSelectors?.get(key)?.has(selector)===true;
 }

 if(Number(window.PLAYER_TITLE_STATE_VERSION)!==1)fail("TITLE_STATE_VERSION","玩家稱號 state 應為 V1",window.PLAYER_TITLE_STATE_VERSION);
 if(Number(window.PLAYER_TITLE_CATALOG_VERSION)!==5||Number(window.PLAYER_TITLE_CANONICAL_CATALOG_VERSION)!==4||Number(window.PLAYER_TITLE_THIRD_WORLD_CATALOG_EXTENSION_VERSION)!==1||Number(window.PLAYER_TITLE_ALTERNATE_UNIVERSE_CATALOG_EXTENSION_VERSION)!==1||Number(window.PLAYER_TITLE_UNIFIED_DEFS_VERSION)!==2||Number(window.PLAYER_TITLE_MIRROR_LAST_ORDER_VERSION)!==1)fail("TITLE_CATALOG_VERSION","玩家稱號 catalog 必須維持銀河／宇宙／高維／異宇宙順序並固定鏡像稱號最後",{catalog:window.PLAYER_TITLE_CATALOG_VERSION,canonical:window.PLAYER_TITLE_CANONICAL_CATALOG_VERSION,higherExtension:window.PLAYER_TITLE_THIRD_WORLD_CATALOG_EXTENSION_VERSION,alternateExtension:window.PLAYER_TITLE_ALTERNATE_UNIVERSE_CATALOG_EXTENSION_VERSION,unified:window.PLAYER_TITLE_UNIFIED_DEFS_VERSION,mirrorLast:window.PLAYER_TITLE_MIRROR_LAST_ORDER_VERSION});
 if(window.PLAYER_TITLE_DEFS!==window.PLAYER_TITLE_CATALOG_DEFS||window.PLAYER_TITLE_DEFS!==window.PLAYER_TITLE_ALL_DEFS||window.PLAYER_TITLE_IDS!==window.PLAYER_TITLE_CATALOG_IDS||window.PLAYER_TITLE_IDS!==window.PLAYER_TITLE_ALL_IDS)fail("TITLE_CATALOG_SINGLE_OWNER","PLAYER_TITLE_DEFS／CATALOG／ALL 必須指向同一正式 catalog");
 if(Number(window.THIRD_WORLD_TITLE_BACKFILL_VERSION)!==1)fail("TITLE_THIRD_WORLD_BACKFILL_VERSION","高維稱號 backfill owner V1 未載入",window.THIRD_WORLD_TITLE_BACKFILL_VERSION);
 if(Number(window.PLAYER_TITLE_RENDERER_VERSION)!==5||Number(window.PLAYER_TITLE_UNIVERSE_RENDERER_VERSION)!==1||Number(window.PLAYER_TITLE_MIRROR_RENDERER_VERSION)!==3||Number(window.PLAYER_TITLE_THIRD_WORLD_RENDERER_VERSION)!==2||Number(window.PLAYER_TITLE_ALTERNATE_UNIVERSE_RENDERER_VERSION)!==1)fail("TITLE_RENDERER_VERSION","玩家稱號 renderer 版本異常",{base:window.PLAYER_TITLE_RENDERER_VERSION,universe:window.PLAYER_TITLE_UNIVERSE_RENDERER_VERSION,mirror:window.PLAYER_TITLE_MIRROR_RENDERER_VERSION,higher:window.PLAYER_TITLE_THIRD_WORLD_RENDERER_VERSION,alternate:window.PLAYER_TITLE_ALTERNATE_UNIVERSE_RENDERER_VERSION});
 if(Number(window.PLAYER_TITLE_MIRROR_VISUAL_CLASS_VERSION)!==3||Number(window.PLAYER_TITLE_MIRROR_PRESENTATION_VERSION)!==4||Number(window.PLAYER_TITLE_THIRD_WORLD_PRESENTATION_VERSION)!==4||Number(window.PLAYER_TITLE_ALTERNATE_UNIVERSE_PRESENTATION_VERSION)!==1)fail("TITLE_VISUAL_VERSION_SEMANTICS","鏡像／高維／異宇宙 presentation 版本異常",{mirrorClass:window.PLAYER_TITLE_MIRROR_VISUAL_CLASS_VERSION,mirrorPresentation:window.PLAYER_TITLE_MIRROR_PRESENTATION_VERSION,higherPresentation:window.PLAYER_TITLE_THIRD_WORLD_PRESENTATION_VERSION,alternatePresentation:window.PLAYER_TITLE_ALTERNATE_UNIVERSE_PRESENTATION_VERSION});
 if(Number(window.PLAYER_TITLE_UI_VERSION)!==4||Number(window.PLAYER_TITLE_UNIVERSE_NOTICE_VERSION)!==1||Number(window.PLAYER_TITLE_THIRD_WORLD_NOTICE_VERSION)!==1||Number(window.PLAYER_TITLE_ALTERNATE_UNIVERSE_NOTICE_VERSION)!==1||Number(window.PLAYER_TITLE_POST_FLOW_NOTIFICATION_VERSION)!==1||Number(window.PLAYER_TITLE_POST_FLOW_HOLD_VERSION)!==1||Number(window.PLAYER_TITLE_LEGACY_QUEUE_DELEGATE_VERSION)!==1||Number(window.PLAYER_TITLE_THIRD_WORLD_POST_FLOW_READY_VERSION)!==1)fail("TITLE_UI_VERSION","玩家稱號 UI／異宇宙來源文案／三紀元 post-flow 通知版本異常",{ui:window.PLAYER_TITLE_UI_VERSION,universe:window.PLAYER_TITLE_UNIVERSE_NOTICE_VERSION,higher:window.PLAYER_TITLE_THIRD_WORLD_NOTICE_VERSION,alternate:window.PLAYER_TITLE_ALTERNATE_UNIVERSE_NOTICE_VERSION,postFlow:window.PLAYER_TITLE_POST_FLOW_NOTIFICATION_VERSION,legacyDelegate:window.PLAYER_TITLE_LEGACY_QUEUE_DELEGATE_VERSION,higherReady:window.PLAYER_TITLE_THIRD_WORLD_POST_FLOW_READY_VERSION});
 const postFlowEras=Array.from(window.PLAYER_TITLE_POST_FLOW_ERAS||[]);
 if(JSON.stringify(postFlowEras)!==JSON.stringify(["galaxy","universe","higher-dimensional"]))fail("TITLE_POST_FLOW_ERAS","稱號 post-flow owner 必須覆蓋三紀元",postFlowEras);
 if(calamityDefs.length!==10||universeDefs.length!==10||higherDefs.length!==10||alternateDefs.length!==10||mirrorDefs.length!==6||catalogDefs.length!==46||catalogIds.length!==46)fail("TITLE_DEFINITION_COUNT","正式 catalog 應為銀河10＋宇宙10＋高維10＋異宇宙10＋鏡像6",{calamity:calamityDefs.length,universe:universeDefs.length,higher:higherDefs.length,alternate:alternateDefs.length,mirror:mirrorDefs.length,total:catalogDefs.length});
 const expectedOrder=[...calamityDefs,...universeDefs,...higherDefs,...alternateDefs,...mirrorDefs].map(def=>def.id);
 if(JSON.stringify(catalogIds)!==JSON.stringify(expectedOrder))fail("TITLE_UNIFIED_ORDER","稱號順序必須固定為銀河10、宇宙10、高維10、異宇宙10、鏡像6；鏡像系列永遠置底",catalogIds);
 higherDefs.forEach((def,index)=>{
  const source=Array.from(window.THIRD_WORLD_TITLE_DEFINITIONS||[])[index];
  if(!source||def.id!==source.id||def.name!==source.name||def.tier!==index+1||def.series!=="higher-dimensional"||def.order!==21+index||Number(def.thresholdRemainingHp)!==Number(source.thresholdRemainingHp))fail("TITLE_THIRD_WORLD_ORDER",`高維第 ${index+1} 階稱號 metadata 異常`,{def,source});
 });
  alternateDefs.forEach((def,index)=>{const source=Array.from(window.ALTERNATE_UNIVERSE_TITLE_ROWS||[])[index];if(!source||def.id!==source.id||def.name!==source.name||def.tier!==index+1||def.series!=="alternate-universe"||def.depthThreshold!==(index+1)*100||def.order!==31+index)fail("TITLE_ALTERNATE_UNIVERSE_ORDER",`異宇宙第 ${index+1} 階稱號 metadata 異常`,{def,source});});
  mirrorDefs.forEach((def,index)=>{if(def.series!=="mirror"||def.order!==41+index)fail("TITLE_MIRROR_LAST_ORDER",`鏡像 ${def.mirrorWins} 勝稱號必須位於正式 catalog 最後一組`,def);});

 const higherVisualOwner=document.querySelector('link[data-player-title-higher-dimensional-owner="1"]');
 const alternateVisualOwner=document.querySelector('link[data-player-title-alternate-universe-owner="1"]');
 const mirrorVisualOwner=document.querySelector('link[data-player-title-mirror-owner="3"]');
 if(!higherVisualOwner||!String(higherVisualOwner.getAttribute("href")||"").includes("playertitleshigherdimensional.css"))fail("TITLE_HIGHER_VISUAL_OWNER","高維紀元稱號獨立視覺 owner V1 未載入",higherVisualOwner?.getAttribute("href")||null);
 if(!alternateVisualOwner||!String(alternateVisualOwner.getAttribute("href")||"").includes("playertitlesalternateuniverse.css"))fail("TITLE_ALTERNATE_VISUAL_OWNER","異宇宙稱號獨立視覺 owner V1 未載入",alternateVisualOwner?.getAttribute("href")||null);
 if(!mirrorVisualOwner||!String(mirrorVisualOwner.getAttribute("href")||"").includes("playertitlesmirror.css"))fail("TITLE_MIRROR_VISUAL_OWNER","鏡像稱號獨立視覺 owner 未載入",mirrorVisualOwner?.getAttribute("href")||null);
 const higherSheet=stylesheetSelectors("playertitleshigherdimensional.css"),alternateSheet=stylesheetSelectors("playertitlesalternateuniverse.css"),mirrorSheet=stylesheetSelectors("playertitlesmirror.css");
 if(!higherSheet.seen||higherSheet.error)fail("TITLE_HIGHER_VISUAL_STYLESHEET","高維稱號視覺 stylesheet 無法完整讀取",higherSheet);
 if(!alternateSheet.seen||alternateSheet.error)fail("TITLE_ALTERNATE_VISUAL_STYLESHEET","異宇宙稱號視覺 stylesheet 無法完整讀取",alternateSheet);
 if(!mirrorSheet.seen||mirrorSheet.error)fail("TITLE_MIRROR_VISUAL_STYLESHEET","鏡像稱號視覺 stylesheet 無法完整讀取",mirrorSheet);
 if(higherSheet.seen&&!higherSheet.error){
  [".player-title--higher-dimensional",...Array.from({length:10},(_,index)=>`.player-title--higher-dimensional-${index+1}`)].forEach(selector=>{if(!higherSheet.selectors.has(selector))fail("TITLE_HIGHER_VISUAL_SELECTOR",`缺少高維正式視覺 selector：${selector}`);});
  [".player-title--higher-dimensional",...Array.from({length:10},(_,index)=>`.player-title--higher-dimensional-${index+1}::after`)].forEach(selector=>{if(!hasMediaSelector(higherSheet,"(max-width: 360px)",selector))fail("TITLE_HIGHER_NARROW_MOBILE",`缺少高維極窄手機保護：${selector}`);});
 }
 if(alternateSheet.seen&&!alternateSheet.error){
  [".player-title--alternate-universe",...Array.from({length:10},(_,index)=>`.player-title--alternate-universe-${index+1}`)].forEach(selector=>{if(!alternateSheet.selectors.has(selector))fail("TITLE_ALTERNATE_VISUAL_SELECTOR",`缺少異宇宙正式視覺 selector：${selector}`);});
  [".player-title--alternate-universe",...Array.from({length:10},(_,index)=>`.player-title--alternate-universe-${index+1}::after`)].forEach(selector=>{if(!hasMediaSelector(alternateSheet,"(max-width: 360px)",selector))fail("TITLE_ALTERNATE_NARROW_MOBILE",`缺少異宇宙極窄手機保護：${selector}`);});
 }
 if(mirrorSheet.seen&&!mirrorSheet.error){
  [".player-title--mirror-v3",...mirrorDefs.map(def=>`.player-title--mirror-v3-${def.mirrorWins}`)].forEach(selector=>{if(!mirrorSheet.selectors.has(selector))fail("TITLE_MIRROR_VISUAL_SELECTOR",`缺少鏡像正式視覺 selector：${selector}`);});
  [".player-title--mirror-v3",...mirrorDefs.map(def=>`.player-title--mirror-v3-${def.mirrorWins}::after`)].forEach(selector=>{if(!hasMediaSelector(mirrorSheet,"(max-width: 360px)",selector))fail("TITLE_MIRROR_NARROW_MOBILE",`缺少鏡像極窄手機保護：${selector}`);});
 }

 const required=["normalizePlayerTitleState","getPlayerTitleDefinition","getPlayerTitleDefinitionForCalamity","getPlayerTitleDefinitionForUniverseCalamity","getPlayerTitleDefinitionForMirrorWins","getPlayerTitleDefinitionForThirdWorldTier","getPlayerTitleDefinitionForAlternateUniverseTier","getPlayerTitleDefinitionForAlternateUniverseDepth","grantPlayerTitleForCalamityFirstKill","grantPlayerTitleForUniverseCalamityFirstKill","grantPlayerTitlesForMirrorWins","grantPlayerTitlesForThirdWorldTier","grantPlayerTitlesForAlternateUniverseDepth","getPendingPlayerTitleNotice","clearPendingPlayerTitleNotice","getUnlockedPlayerTitleDefinitions","getEquippedPlayerTitleDefinition","playerTitleHtml","playerIdentityNameHtml","equipPlayerTitle","openPlayerTitlePicker","closePlayerTitlePicker","selectPlayerTitle","showPendingPlayerTitleNotice","closePlayerTitleNotice","setPlayerTitlePostFlowHold","flushPendingPlayerTitleNoticeAfterFlow","queuePendingPlayerTitleNotice","getPlayerTitlePostFlowStatus","gmPlayerTitlePreviewHtml","gmSetPlayerTitlePreviewTier"];
 required.forEach(name=>{if(typeof window[name]!=="function")fail("TITLE_API_MISSING",`${name} 未載入`);});

 try{
  const max=Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_MAX_HP)||1));
  const probe={marks:{entries:{}},secondWorld:{entered:true,calamities:universeDefs.map((def,index)=>({calamityId:def.calamityId,trueKills:index===0?1:0}))},thirdWorld:{entered:true,bosses:Array.from({length:10},(_,index)=>({currentHp:index===0?0:max})),story:{introSeen:false,unlockedStage:1,finalSeen:false}},reincarnation:{alternateUniverse:{unlocked:true,deepestCleared:350}},dungeon:{mirror:{history:{bestWins:15}}},titles:{version:1,unlocked:[],equipped:null,pendingNotice:null}};
  calamityDefs.forEach(def=>{probe.marks.entries[def.markId]={acquired:false,level:0,progress:0};});
  if(calamityDefs[0])probe.marks.entries[calamityDefs[0].markId].acquired=true;
  window.normalizePlayerTitleState(probe);
  const first=JSON.stringify(probe.titles);window.normalizePlayerTitleState(probe);const second=JSON.stringify(probe.titles);
  if(first!==second)fail("TITLE_NORMALIZE_IDEMPOTENT","稱號 normalization 必須 idempotent",{first,second});
  if(probe.titles.pendingNotice!==null)fail("TITLE_BACKFILL_NOTICE","靜默 backfill 不得建立 pendingNotice",probe.titles);
  const expected=[calamityDefs[0]?.id,universeDefs[0]?.id,higherDefs[0]?.id,...alternateDefs.slice(0,3).map(def=>def.id),mirrorDefs[0]?.id].filter(Boolean);
  if(JSON.stringify(probe.titles.unlocked)!==JSON.stringify(expected))fail("TITLE_BACKFILL_UNION","五系列靜默補發結果異常",{expected,actual:probe.titles.unlocked});
 }catch(error){fail("TITLE_NORMALIZE_PROBE","稱號 normalization probe 失敗",String(error?.message||error));}

 try{
  const max=Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_MAX_HP)||1)),targetTier=4,total=Math.max(0,Math.floor(Number(higherDefs[targetTier-1]?.thresholdRemainingHp)||0));
  let left=total;const bosses=Array.from({length:10},()=>{const currentHp=Math.max(0,Math.min(max,left));left-=currentHp;return {currentHp};});
  const oldSave={marks:{entries:{}},secondWorld:{entered:true,calamities:[]},thirdWorld:{entered:true,bosses,story:{introSeen:false,unlockedStage:0,finalSeen:false}},dungeon:{mirror:{history:{bestWins:0}}},titles:{version:1,unlocked:["retired-title-id","unknown-title-id"],equipped:"retired-title-id",pendingNotice:"unknown-title-id"}};
  window.normalizePlayerTitleState(oldSave);
  const expectedHigher=higherDefs.slice(0,targetTier).map(def=>def.id),actualHigher=oldSave.titles.unlocked.filter(id=>expectedHigher.includes(id));
  if(JSON.stringify(actualHigher)!==JSON.stringify(expectedHigher))fail("TITLE_THIRD_WORLD_BACKFILL_REGRESSION","舊存檔缺少高維稱號時，應依正式十王總 HP 靜默補齊至目前階級",{expectedHigher,actualHigher,titles:oldSave.titles,total});
  if(oldSave.titles.unlocked.some(id=>id==="retired-title-id"||id==="unknown-title-id")||oldSave.titles.equipped!==null||oldSave.titles.pendingNotice!==null)fail("TITLE_UNKNOWN_ID_SANITIZE_REGRESSION","未知／退役稱號 id 應在 normalization 移除，且 backfill 不得建立通知",oldSave.titles);
 }catch(error){fail("TITLE_THIRD_WORLD_BACKFILL_REGRESSION_PROBE","高維舊存檔 backfill regression 失敗",String(error?.message||error));}

 try{
  const target={titles:{version:1,unlocked:[],equipped:null,pendingNotice:null}};
  const grant=window.grantPlayerTitlesForThirdWorldTier(3,target,{previousTier:0});
  if(grant?.changed!==true||grant?.unlockedTitles?.length!==3||grant?.noticeTitle?.id!==higherDefs[2]?.id||target.titles.pendingNotice!==higherDefs[2]?.id)fail("TITLE_THIRD_WORLD_MULTI_UNLOCK","高維 0→3 應補齊1～3階並只通知最高階",{grant,titles:target.titles});
  const again=window.grantPlayerTitlesForThirdWorldTier(3,target,{previousTier:3});
  if(again?.changed!==false||again?.unlockedTitles?.length!==0)fail("TITLE_THIRD_WORLD_ONCE","已取得高維稱號不得重複取得",again);
 }catch(error){fail("TITLE_THIRD_WORLD_GRANT_PROBE","高維稱號取得 probe 失敗",String(error?.message||error));}

 try{
  const oldAu={reincarnation:{alternateUniverse:{unlocked:true,deepestCleared:680}},marks:{entries:{}},secondWorld:{entered:false,calamities:[]},thirdWorld:{entered:false,bosses:[]},dungeon:{mirror:{history:{bestWins:0}}},titles:{version:1,unlocked:[],equipped:null,pendingNotice:null}};
  window.normalizePlayerTitleState(oldAu);
  const expectedAu=alternateDefs.slice(0,6).map(def=>def.id),actualAu=oldAu.titles.unlocked.filter(id=>expectedAu.includes(id));
  if(JSON.stringify(actualAu)!==JSON.stringify(expectedAu)||oldAu.titles.pendingNotice!==null)fail("TITLE_ALTERNATE_UNIVERSE_BACKFILL","舊存檔異宇宙 680 層應靜默補齊前 6 階稱號",{expectedAu,actualAu,titles:oldAu.titles});
 }catch(error){fail("TITLE_ALTERNATE_UNIVERSE_BACKFILL_PROBE","異宇宙稱號 backfill regression 失敗",String(error?.message||error));}

 try{
  const target={titles:{version:1,unlocked:[],equipped:null,pendingNotice:null}};
  const grant=window.grantPlayerTitlesForAlternateUniverseDepth(300,target,{previousDepth:299});
  if(grant?.changed!==true||grant?.unlockedTitles?.length!==3||grant?.noticeTitle?.id!==alternateDefs[2]?.id||target.titles.pendingNotice!==alternateDefs[2]?.id)fail("TITLE_ALTERNATE_UNIVERSE_MULTI_UNLOCK","異宇宙 299→300 應補齊 1～3 階並只通知第 3 階",{grant,titles:target.titles});
  const again=window.grantPlayerTitlesForAlternateUniverseDepth(300,target,{previousDepth:300});
  if(again?.changed!==false||again?.unlockedTitles?.length!==0)fail("TITLE_ALTERNATE_UNIVERSE_ONCE","已取得異宇宙稱號不得重複取得",again);
 }catch(error){fail("TITLE_ALTERNATE_UNIVERSE_GRANT_PROBE","異宇宙稱號取得 probe 失敗",String(error?.message||error));}

 try{
  const target={
   reincarnation:{count:2,breakthrough:{permanent:20,milestoneLifeId:2,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:680,activeAttempt:{lifeId:2,depth:681,attemptId:"title-closure",traits:["strong","swift"]},lifeFailures:{lifeId:2,failures:{"681":2}}}},
   marks:{entries:{}},secondWorld:{entered:false,calamities:[]},thirdWorld:{entered:false,bosses:[]},dungeon:{mirror:{history:{bestWins:0}}},
   titles:{version:1,unlocked:alternateDefs.slice(0,6).map(def=>def.id),equipped:alternateDefs[5]?.id||null,pendingNotice:alternateDefs[5]?.id||null}
  };
  const equippedBefore=target.titles.equipped,pendingBefore=target.titles.pendingNotice;
  target.reincarnation.count=3;
  const life=typeof window.reconcileReincarnationLifeChange==="function"?window.reconcileReincarnationLifeChange(target,2):null;
  window.normalizePlayerTitleState(target);
  const expectedIds=alternateDefs.slice(0,6).map(def=>def.id),actualIds=target.titles.unlocked.filter(id=>expectedIds.includes(id));
  if(!life?.ok||life.changed!==true||target.reincarnation.alternateUniverse.deepestCleared!==680||JSON.stringify(actualIds)!==JSON.stringify(expectedIds)||target.titles.equipped!==equippedBefore||target.titles.pendingNotice!==pendingBefore)fail("TITLE_ALTERNATE_UNIVERSE_REINCARNATION_PRESERVE","異宇宙永久稱號／裝備／待通知必須跨轉生保留",{life,target,expectedIds,actualIds,equippedBefore,pendingBefore});
 }catch(error){fail("TITLE_ALTERNATE_UNIVERSE_REINCARNATION_PROBE","異宇宙稱號跨轉生保留 probe 失敗",String(error?.message||error));}

 try{
  const target={reincarnation:{alternateUniverse:{unlocked:true,deepestCleared:300}},marks:{entries:{}},secondWorld:{entered:false,calamities:[]},thirdWorld:{entered:false,bosses:[]},dungeon:{mirror:{history:{bestWins:0}}},titles:{version:1,unlocked:[],equipped:null,pendingNotice:null}};
  window.normalizePlayerTitleState(target);
  const tier3=alternateDefs[2],tier4=alternateDefs[3];
  const equipped=window.equipPlayerTitle(tier3?.id,target);
  const grant=window.grantPlayerTitlesForAlternateUniverseDepth(400,target,{previousDepth:300});
  target.reincarnation.alternateUniverse.deepestCleared=50;
  window.normalizePlayerTitleState(target);
  if(equipped!==true||grant?.noticeTitle?.id!==tier4?.id||target.titles.equipped!==tier3?.id||target.titles.pendingNotice!==tier4?.id||!target.titles.unlocked.includes(tier4?.id))fail("TITLE_ALTERNATE_UNIVERSE_PERMANENT_HONOR","異宇宙稱號達成後即為永久榮譽；降低進度不得回收解鎖、裝備或待通知",{equipped,grant,titles:target.titles});
 }catch(error){fail("TITLE_ALTERNATE_UNIVERSE_PERMANENT_HONOR_PROBE","異宇宙永久榮譽 probe 失敗",String(error?.message||error));}

 try{
  const beforeHold=clone(state?.titles);window.setPlayerTitlePostFlowHold?.("__integrity__",true);const held=window.getPlayerTitlePostFlowStatus?.();window.setPlayerTitlePostFlowHold?.("__integrity__",false);const status=window.getPlayerTitlePostFlowStatus?.();
  if(!held||held.held!==true||!Array.isArray(held.holdSources)||!held.holdSources.includes("__integrity__")||!status||status.held!==false||typeof status.queued!=="boolean"||typeof status.open!=="boolean")fail("TITLE_POST_FLOW_STATUS","共用稱號 post-flow hold/status contract 異常",{held,status});
  if(JSON.stringify(beforeHold)!==JSON.stringify(state?.titles))fail("TITLE_POST_FLOW_HOLD_STATE","session-only title hold 不得修改正式稱號 state",{beforeHold,after:state?.titles});
 }catch(error){fail("TITLE_POST_FLOW_PROBE","共用稱號 post-flow probe 失敗",String(error?.message||error));}

 try{
  const ownedTarget={playerName:"Frank",titles:{version:1,unlocked:[calamityDefs[9]?.id,universeDefs[9]?.id,mirrorDefs[5]?.id,higherDefs[9]?.id].filter(Boolean),equipped:higherDefs[9]?.id,pendingNotice:null}};
  const higherHtml=window.playerIdentityNameHtml({name:"Frank",titleId:higherDefs[9]?.id,target:ownedTarget});
  if(!higherHtml.includes("player-title--higher-dimensional-10")||higherHtml.includes("player-title--tier-")||!higherHtml.includes(higherDefs[9]?.name||"")||!higherHtml.includes("data-title-text")||!higherHtml.includes("player-identity-name"))fail("TITLE_THIRD_WORLD_RENDERER","高維稱號 renderer 應只使用高維視覺 class，不得再掛銀河 tier class",higherHtml);
  Array.from({length:10},(_,index)=>index+1).forEach(tier=>{
   const def=higherDefs[tier-1],html=def?window.playerTitleHtml(def.id):"";
   if(!html.includes(`player-title--higher-dimensional-${tier}`)||html.includes("player-title--tier-")||!html.includes(`data-title-text=\"${def?.name||""}\"`))fail("TITLE_HIGHER_ALL_RENDER",`高維第 ${tier} 階正式 renderer／視覺解耦異常`,html);
  });
  alternateDefs.forEach(def=>{
   const html=window.playerTitleHtml(def.id);
   if(!html.includes("player-title--alternate-universe")||!html.includes(`player-title--alternate-universe-${def.tier}`)||html.includes("player-title--tier-")||!html.includes(`data-title-text=\"${def.name}\"`))fail("TITLE_ALTERNATE_ALL_RENDER",`異宇宙第 ${def.tier} 階 renderer／專屬 class 異常`,html);
  });
  mirrorDefs.forEach(def=>{
   const html=window.playerTitleHtml(def.id);
   if(!html.includes("player-title--mirror-v3")||!html.includes(`player-title--mirror-v3-${def.mirrorWins}`)||html.includes("player-title--tier-")||!html.includes(`data-title-text=\"${def.name}\"`))fail("TITLE_MIRROR_ALL_RENDER",`鏡像 ${def.mirrorWins} 勝稱號 stable class ABI／renderer 異常`,html);
  });
  const blocked=window.playerIdentityNameHtml({name:"Frank",titleId:higherDefs[8]?.id,target:ownedTarget});
  if(blocked.includes(higherDefs[8]?.name||""))fail("TITLE_UNOWNED_RENDER_BLOCK","正式 renderer 不得顯示未取得稱號",blocked);
 }catch(error){fail("TITLE_RENDER_PROBE","稱號 renderer probe 失敗",String(error?.message||error));}

 try{
  const before=clone(state?.titles),beforeSave=typeof localStorage!=="undefined"?localStorage.getItem(SAVE_KEY):null,html=typeof window.gmPlayerTitlePreviewHtml==="function"?String(window.gmPlayerTitlePreviewHtml()||""):"",after=clone(state?.titles),afterSave=typeof localStorage!=="undefined"?localStorage.getItem(SAVE_KEY):null;
  if(Number(window.GM_PLAYER_TITLE_PREVIEW_VERSION)!==11||Number(window.GM_PLAYER_TITLE_PREVIEW_ALL_CATALOG_VERSION)!==6||Number(window.GM_PLAYER_TITLE_PREVIEW_CANONICAL_CATALOG_VERSION)!==6||Number(window.GM_PLAYER_TITLE_PREVIEW_DISPLAY_ORDER_VERSION)!==4||Number(window.GM_PLAYER_TITLE_PREVIEW_REDUNDANT_AU_QUICK_RETIRED_VERSION)!==1||!html.includes("實戰名稱預覽全部 46 個正式稱號")||!html.includes("高維紀元稱號")||!html.includes("異宇宙稱號")||!html.includes("鏡像戰稱號")||html.includes("異宇宙 1～10 階快速視覺測試"))fail("TITLE_GM_PREVIEW","GM 稱號預覽應維持 46 稱號唯一選單、異宇宙重複快速入口已退休且鏡像置底",{preview:window.GM_PLAYER_TITLE_PREVIEW_VERSION,displayOrder:window.GM_PLAYER_TITLE_PREVIEW_DISPLAY_ORDER_VERSION,redundantAuQuickRetired:window.GM_PLAYER_TITLE_PREVIEW_REDUNDANT_AU_QUICK_RETIRED_VERSION,html});
  const higherPos=html.indexOf("高維紀元稱號"),alternatePos=html.indexOf("異宇宙稱號"),mirrorPos=html.indexOf("鏡像戰稱號");
  if(!(higherPos>=0&&alternatePos>higherPos&&mirrorPos>alternatePos))fail("TITLE_GM_PREVIEW_ORDER","GM 稱號預覽應維持高維→異宇宙→鏡像最後",{higherPos,alternatePos,mirrorPos});
  if(JSON.stringify(before)!==JSON.stringify(after)||beforeSave!==afterSave)fail("TITLE_GM_SIDE_EFFECT","GM 稱號預覽不得修改正式 state 或存檔",{before,after});
 }catch(error){fail("TITLE_GM_PROBE","GM 稱號預覽 probe 失敗",String(error?.message||error));}

 const report={version:VERSION,thirdWorldBackfillRegressionVersion:THIRD_WORLD_BACKFILL_REGRESSION_VERSION,postFlowRegressionVersion:POST_FLOW_REGRESSION_VERSION,higherDimensionalVisualOwnerVersion:HIGHER_DIMENSIONAL_VISUAL_OWNER_VERSION,higherDimensionalVisualCompleteVersion:HIGHER_DIMENSIONAL_VISUAL_COMPLETE_VERSION,higherDimensionalVisualDecoupledVersion:HIGHER_DIMENSIONAL_VISUAL_DECOUPLED_VERSION,mirrorVisualContractVersion:MIRROR_VISUAL_CONTRACT_VERSION,narrowMobileVisualVersion:NARROW_MOBILE_VISUAL_VERSION,alternateUniverseClosureVersion:ALTERNATE_UNIVERSE_CLOSURE_VERSION,passed:errors.length===0,errors,checkedAt:Date.now()};
 window.PLAYER_TITLE_INTEGRITY_VERSION=VERSION;
 window.PLAYER_TITLE_THIRD_WORLD_BACKFILL_REGRESSION_VERSION=THIRD_WORLD_BACKFILL_REGRESSION_VERSION;
 window.PLAYER_TITLE_POST_FLOW_REGRESSION_VERSION=POST_FLOW_REGRESSION_VERSION;
 window.PLAYER_TITLE_HIGHER_DIMENSIONAL_VISUAL_OWNER_VERSION=HIGHER_DIMENSIONAL_VISUAL_OWNER_VERSION;
 window.PLAYER_TITLE_HIGHER_DIMENSIONAL_VISUAL_COMPLETE_VERSION=HIGHER_DIMENSIONAL_VISUAL_COMPLETE_VERSION;
 window.PLAYER_TITLE_HIGHER_DIMENSIONAL_VISUAL_DECOUPLED_VERSION=HIGHER_DIMENSIONAL_VISUAL_DECOUPLED_VERSION;
 window.PLAYER_TITLE_MIRROR_VISUAL_CONTRACT_VERSION=MIRROR_VISUAL_CONTRACT_VERSION;
 window.PLAYER_TITLE_NARROW_MOBILE_VISUAL_VERSION=NARROW_MOBILE_VISUAL_VERSION;
 window.PLAYER_TITLE_ALTERNATE_UNIVERSE_CLOSURE_VERSION=ALTERNATE_UNIVERSE_CLOSURE_VERSION;
 window.PLAYER_TITLE_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Player title integrity error",errors);
})();
