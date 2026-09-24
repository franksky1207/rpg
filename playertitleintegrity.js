(function(){
 const VERSION=9;
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const calamityDefs=Array.from(window.CIVILIZATION_PLAYER_TITLE_DEFS||[]);
 const calamityIds=Array.from(window.CIVILIZATION_PLAYER_TITLE_IDS||[]);
 const universeDefs=Array.from(window.UNIVERSE_CALAMITY_PLAYER_TITLE_DEFS||[]);
 const universeIds=Array.from(window.UNIVERSE_CALAMITY_PLAYER_TITLE_IDS||[]);
 const mirrorDefs=Array.from(window.MIRROR_PLAYER_TITLE_DEFS||[]);
 const mirrorIds=Array.from(window.MIRROR_PLAYER_TITLE_IDS||[]);
 const catalogDefs=Array.from(window.PLAYER_TITLE_DEFS||[]);
 const catalogIds=Array.from(window.PLAYER_TITLE_IDS||[]);
 const calamityConfig=Array.from(window.CIVILIZATION_CALAMITY_CONFIG||[]);
 const universeConfig=Array.from(window.SECOND_WORLD_CALAMITY_DEFINITIONS||[]);
 const mirrorUnlocks=Array.from(window.MIRROR_DUNGEON_CONFIG?.titleUnlocks||[]);
 const clone=value=>{try{return JSON.parse(JSON.stringify(value));}catch(_){return null;}};

 if(Number(window.PLAYER_TITLE_STATE_VERSION)!==1)fail("TITLE_STATE_VERSION","玩家稱號 state 應為 V1",window.PLAYER_TITLE_STATE_VERSION);
 if(Number(window.PLAYER_TITLE_CATALOG_VERSION)!==3||Number(window.PLAYER_TITLE_CANONICAL_CATALOG_VERSION)!==2||Number(window.PLAYER_TITLE_UNIFIED_DEFS_VERSION)!==1)fail("TITLE_CATALOG_VERSION","玩家稱號應使用單一 26 稱號正式 catalog",{catalog:window.PLAYER_TITLE_CATALOG_VERSION,canonical:window.PLAYER_TITLE_CANONICAL_CATALOG_VERSION,unified:window.PLAYER_TITLE_UNIFIED_DEFS_VERSION});
 if(window.PLAYER_TITLE_DEFS!==window.PLAYER_TITLE_CATALOG_DEFS||window.PLAYER_TITLE_DEFS!==window.PLAYER_TITLE_ALL_DEFS||window.PLAYER_TITLE_IDS!==window.PLAYER_TITLE_CATALOG_IDS||window.PLAYER_TITLE_IDS!==window.PLAYER_TITLE_ALL_IDS)fail("TITLE_CATALOG_SINGLE_OWNER","PLAYER_TITLE_DEFS／CATALOG／ALL 應指向同一份正式 catalog，不得再維護雙 owner");
 if(typeof window.PLAYER_TITLE_LEGACY_DEFS!=="undefined"||typeof window.PLAYER_TITLE_LEGACY_IDS!=="undefined"||typeof window.PLAYER_TITLE_LEGACY_ALIAS_VERSION!=="undefined")fail("TITLE_LEGACY_ALIAS_RETIRED","舊 16 稱號 catalog alias 應已退休");
 if(Number(window.CIVILIZATION_CALAMITY_CONFIG_VERSION)!==2)fail("TITLE_CALAMITY_CONFIG_VERSION","銀河災厄稱號 metadata owner 應為 Calamity Config V2",window.CIVILIZATION_CALAMITY_CONFIG_VERSION);
 if(Number(window.SECOND_WORLD_CALAMITY_TITLE_METADATA_VERSION)!==1)fail("TITLE_UNIVERSE_CONFIG_VERSION","宇宙災厄稱號 metadata owner V1 未載入",window.SECOND_WORLD_CALAMITY_TITLE_METADATA_VERSION);
 if(Number(window.UNIVERSE_CALAMITY_TITLE_BACKFILL_VERSION)!==1||Number(window.UNIVERSE_CALAMITY_TITLE_ID_BACKFILL_VERSION)!==1)fail("TITLE_UNIVERSE_BACKFILL_VERSION","宇宙災厄稱號舊檔／ID 補發 owner 未完整載入",{backfill:window.UNIVERSE_CALAMITY_TITLE_BACKFILL_VERSION,id:window.UNIVERSE_CALAMITY_TITLE_ID_BACKFILL_VERSION});
 if(Number(window.PLAYER_TITLE_RENDERER_VERSION)!==2||Number(window.PLAYER_TITLE_UNIVERSE_RENDERER_VERSION)!==1||Number(window.PLAYER_TITLE_MIRROR_RENDERER_VERSION)!==3)fail("TITLE_RENDERER_VERSION","玩家稱號 renderer 應為 Base V2／Universe V1／Mirror V3",{base:window.PLAYER_TITLE_RENDERER_VERSION,universe:window.PLAYER_TITLE_UNIVERSE_RENDERER_VERSION,mirror:window.PLAYER_TITLE_MIRROR_RENDERER_VERSION});
 if(Number(window.PLAYER_TITLE_UI_VERSION)!==1)fail("TITLE_UI_VERSION","玩家稱號 UI 應為 V1",window.PLAYER_TITLE_UI_VERSION);
 if(Number(window.MIRROR_TITLE_CLONE_PERFORMANCE_VERSION)!==1)fail("TITLE_MIRROR_CLONE_PERFORMANCE","鏡像敵人稱號手機效能控制 V1 未載入",window.MIRROR_TITLE_CLONE_PERFORMANCE_VERSION);
 if(calamityDefs.length!==10||calamityIds.length!==10||universeDefs.length!==10||universeIds.length!==10||mirrorDefs.length!==6||mirrorIds.length!==6||catalogDefs.length!==26||catalogIds.length!==26){
  fail("TITLE_DEFINITION_COUNT","玩家稱號正式 catalog 應為銀河災厄 10＋宇宙災厄 10＋鏡像 6",{calamityDefs:calamityDefs.length,universeDefs:universeDefs.length,mirrorDefs:mirrorDefs.length,catalogDefs:catalogDefs.length});
 }
 calamityConfig.forEach((entry,index)=>{
  const def=calamityDefs[index];
  if(!def||def.name!==String(entry?.titleName||"")||def.id!==String(entry?.titleId||"")||def.calamityId!==String(entry?.id||"")||def.markId!==String(entry?.markId||"")||def.tier!==index+1||def.series!=="calamity"||def.order!==index+1)fail("TITLE_CALAMITY_ORDER",`銀河災厄第 ${index+1} 階稱號與 calamity config 不一致`,{config:entry||null,def:def||null});
 });
 universeConfig.forEach((entry,index)=>{
  const def=universeDefs[index];
  if(!def||def.name!==String(entry?.titleName||"")||def.id!==String(entry?.titleId||"")||def.calamityId!==String(entry?.id||"")||def.tier!==index+1||def.series!=="universe-calamity"||def.order!==11+index)fail("TITLE_UNIVERSE_ORDER",`宇宙災厄第 ${index+1} 階稱號與 second world calamity config 不一致`,{config:entry||null,def:def||null});
 });
 mirrorUnlocks.forEach((entry,index)=>{
  const def=mirrorDefs[index],wins=Math.floor(Number(entry?.wins)||0);
  if(!def||def.id!==String(entry?.id||"")||def.name!==String(entry?.name||"")||def.mirrorWins!==wins||def.series!=="mirror"||def.order!==21+index)fail("TITLE_MIRROR_ORDER",`鏡像 ${wins} 勝稱號與 mirror config 不一致`,{config:entry||null,def:def||null});
 });
 if(JSON.stringify(catalogIds)!==JSON.stringify([...calamityIds,...universeIds,...mirrorIds]))fail("TITLE_UNIFIED_ORDER","完整稱號順序必須固定為銀河 10、宇宙 10、鏡像 6",catalogIds);

 const required=["normalizePlayerTitleState","getPlayerTitleDefinition","getPlayerTitleDefinitionForCalamity","getPlayerTitleDefinitionForUniverseCalamity","getPlayerTitleDefinitionForMirrorWins","grantPlayerTitleForCalamityFirstKill","grantPlayerTitleForUniverseCalamityFirstKill","grantPlayerTitlesForMirrorWins","getPendingPlayerTitleNotice","clearPendingPlayerTitleNotice","getUnlockedPlayerTitleDefinitions","getEquippedPlayerTitleDefinition","playerTitleHtml","playerIdentityNameHtml","equipPlayerTitle","openPlayerTitlePicker","closePlayerTitlePicker","selectPlayerTitle","showPendingPlayerTitleNotice","closePlayerTitleNotice","queuePendingPlayerTitleNotice","gmPlayerTitlePreviewHtml","gmSetPlayerTitlePreviewTier"];
 required.forEach(name=>{if(typeof window[name]!=="function")fail("TITLE_API_MISSING",`${name} 未載入`);});

 try{
  const probe={marks:{entries:{}},secondWorld:{calamities:universeDefs.map((def,index)=>({calamityId:def.calamityId,trueKills:index===0?1:index===4?7:0}))},dungeon:{mirror:{history:{bestWins:17}}},titles:{version:1,unlocked:[],equipped:null,pendingNotice:null}};
  calamityDefs.forEach(def=>{probe.marks.entries[def.markId]={acquired:false,level:0,progress:0};});
  if(calamityDefs[0])probe.marks.entries[calamityDefs[0].markId].acquired=true;
  if(calamityDefs[2])probe.marks.entries[calamityDefs[2].markId].acquired=true;
  [probe.secondWorld.calamities[0],probe.secondWorld.calamities[4]]=[probe.secondWorld.calamities[4],probe.secondWorld.calamities[0]];
  window.normalizePlayerTitleState(probe);
  const first=JSON.stringify(probe.titles);
  window.normalizePlayerTitleState(probe);
  const second=JSON.stringify(probe.titles);
  if(first!==second)fail("TITLE_NORMALIZE_IDEMPOTENT","稱號 normalization 必須 idempotent",{first,second});
  if(probe.titles.pendingNotice!==null)fail("TITLE_BACKFILL_NOTICE","舊檔／normalization 靜默補發不得建立 pendingNotice",probe.titles);
  const expected=[calamityDefs[0]?.id,calamityDefs[2]?.id,universeDefs[0]?.id,universeDefs[4]?.id,mirrorDefs[0]?.id,mirrorDefs[1]?.id,mirrorDefs[2]?.id].filter(Boolean);
  if(JSON.stringify(probe.titles.unlocked)!==JSON.stringify(expected))fail("TITLE_BACKFILL_UNION","銀河／宇宙／鏡像靜默補發結果、ID 對齊或排序異常",{expected,actual:probe.titles.unlocked});
  probe.titles.unlocked.push(calamityDefs[1].id);
  probe.marks.entries[calamityDefs[1].markId].acquired=false;
  probe.secondWorld.calamities.forEach(row=>row.trueKills=0);
  probe.dungeon.mirror.history.bestWins=0;
  window.normalizePlayerTitleState(probe);
  if(!probe.titles.unlocked.includes(calamityDefs[1].id)||!probe.titles.unlocked.includes(universeDefs[0].id)||!probe.titles.unlocked.includes(mirrorDefs[2].id))fail("TITLE_BACKFILL_ADDITIVE","稱號 normalization 不得回收既有 unlocked",probe.titles.unlocked);
 }catch(error){fail("TITLE_NORMALIZE_PROBE","稱號 normalization probe 失敗",String(error?.message||error));}

 try{
  const target={marks:{entries:{}},secondWorld:{calamities:universeDefs.map(def=>({calamityId:def.calamityId,trueKills:0}))},dungeon:{mirror:{history:{bestWins:0}}},titles:{version:1,unlocked:[],equipped:null,pendingNotice:null}};
  calamityDefs.forEach(def=>{target.marks.entries[def.markId]={acquired:false,level:0,progress:0};});
  const def=calamityDefs[4];
  const first=window.grantPlayerTitleForCalamityFirstKill(def.calamityId,target);
  const second=window.grantPlayerTitleForCalamityFirstKill(def.calamityId,target);
  if(first?.firstAcquisition!==true||second?.firstAcquisition!==false)fail("TITLE_FIRST_KILL_ONCE","同一銀河災厄稱號只可首次取得一次",{first,second});
  if(target.titles.pendingNotice!==def.id)fail("TITLE_FIRST_KILL_PENDING","真正銀河首殺必須留下 pendingNotice",target.titles);
  target.titles.pendingNotice=null;
  const udef=universeDefs[4];
  const ufirst=window.grantPlayerTitleForUniverseCalamityFirstKill(udef.calamityId,target);
  const usecond=window.grantPlayerTitleForUniverseCalamityFirstKill(udef.calamityId,target);
  if(ufirst?.firstAcquisition!==true||usecond?.firstAcquisition!==false)fail("TITLE_UNIVERSE_FIRST_KILL_ONCE","同一宇宙災厄稱號只可首次取得一次",{ufirst,usecond});
  if(target.titles.pendingNotice!==udef.id)fail("TITLE_UNIVERSE_FIRST_KILL_PENDING","真正宇宙首殺 grant 必須留下 pendingNotice",target.titles);
 }catch(error){fail("TITLE_FIRST_KILL_PROBE","首殺稱號 probe 失敗",String(error?.message||error));}

 try{
  const target={marks:{entries:{}},secondWorld:{calamities:universeDefs.map(def=>({calamityId:def.calamityId,trueKills:0}))},dungeon:{mirror:{history:{bestWins:18}}},titles:{version:1,unlocked:[],equipped:null,pendingNotice:null}};
  calamityDefs.forEach(def=>{target.marks.entries[def.markId]={acquired:false,level:0,progress:0};});
  const settlement=window.grantPlayerTitlesForMirrorWins(18,target,{previousBestWins:14});
  const expected=mirrorDefs.slice(0,4).map(def=>def.id);
  if(JSON.stringify(settlement?.unlockedTitles?.map(def=>def.id)||[])!==JSON.stringify(expected))fail("TITLE_MIRROR_MULTI_UNLOCK","14→18 應一次解鎖鏡像 15～18",settlement);
  if(settlement?.noticeTitle?.id!==mirrorDefs[3]?.id||target.titles.pendingNotice!==mirrorDefs[3]?.id)fail("TITLE_MIRROR_HIGHEST_NOTICE","跨多階只應通知最高新鏡像稱號",{settlement,titles:target.titles});
 }catch(error){fail("TITLE_MIRROR_GRANT_PROBE","鏡像稱號取得 probe 失敗",String(error?.message||error));}

 try{
  const ownedTarget={playerName:"Frank",titles:{version:1,unlocked:[calamityDefs[9]?.id,universeDefs[9]?.id,mirrorDefs[5]?.id].filter(Boolean),equipped:universeDefs[9]?.id,pendingNotice:null}};
  const calamityHtml=window.playerIdentityNameHtml({name:"Frank",titleId:calamityDefs[9]?.id,target:ownedTarget});
  const universeHtml=window.playerIdentityNameHtml({name:"Frank",titleId:universeDefs[9]?.id,target:ownedTarget});
  const mirrorHtml=window.playerIdentityNameHtml({name:"Frank",titleId:mirrorDefs[5]?.id,target:ownedTarget});
  const blockedHtml=window.playerIdentityNameHtml({name:"Frank",titleId:mirrorDefs[4]?.id,target:ownedTarget});
  const previewHtml=window.playerIdentityNameHtml({name:"Frank",titleId:mirrorDefs[4]?.id,target:ownedTarget,allowUnownedTitle:true});
  if(!calamityHtml.includes("player-title--tier-10")||!calamityHtml.includes(calamityDefs[9]?.name||"")||!calamityHtml.includes("player-identity-name"))fail("TITLE_CALAMITY_RENDERER","銀河災厄 renderer 異常",calamityHtml);
  if(!universeHtml.includes("player-title--universe-calamity-10")||!universeHtml.includes(universeDefs[9]?.name||""))fail("TITLE_UNIVERSE_RENDERER","宇宙災厄 renderer 異常",universeHtml);
  if(!mirrorHtml.includes("player-title--mirror-v3-20")||mirrorHtml.includes("player-title--mirror-20")||!mirrorHtml.includes(mirrorDefs[5]?.name||"")||mirrorHtml.indexOf(mirrorDefs[5]?.name||"")>mirrorHtml.indexOf("Frank"))fail("TITLE_MIRROR_RENDERER","鏡像 renderer 未正確輸出 V3 class 於玩家名稱前",mirrorHtml);
  if(blockedHtml.includes("player-title")||blockedHtml.includes(mirrorDefs[4]?.name||""))fail("TITLE_UNOWNED_RENDER_BLOCK","正式 renderer 不得顯示未取得稱號",blockedHtml);
  if(!previewHtml.includes("player-title--mirror-v3-19")||previewHtml.includes("player-title--mirror-19")||!previewHtml.includes(mirrorDefs[4]?.name||""))fail("TITLE_PREVIEW_BYPASS","明確 allowUnownedTitle 預覽應以 Mirror V3 顯示未取得稱號",previewHtml);
 }catch(error){fail("TITLE_RENDERER_PROBE","稱號 renderer probe 失敗",String(error?.message||error));}

 try{
  const before=clone(state?.titles);
  const beforeSave=typeof localStorage!=="undefined"?localStorage.getItem(SAVE_KEY):null;
  const html=typeof window.gmPlayerTitlePreviewHtml==="function"?String(window.gmPlayerTitlePreviewHtml()||""):"";
  const after=clone(state?.titles);
  const afterSave=typeof localStorage!=="undefined"?localStorage.getItem(SAVE_KEY):null;
  if(Number(window.GM_CALAMITY_LEGACY_TITLE_PREVIEW_RETIRED_VERSION)!==1||Number(window.GM_PLAYER_TITLE_PREVIEW_VERSION)!==5||Number(window.GM_PLAYER_TITLE_PREVIEW_OWNER_VERSION)!==1||Number(window.GM_PLAYER_TITLE_PREVIEW_SECTION_OWNER_VERSION)!==1||!html.includes("實戰名稱預覽全部 26 個正式稱號")||!html.includes("gm-player-title-combat-preview")||!html.includes("player-identity-name"))fail("TITLE_GM_PREVIEW","GM 稱號預覽應只保留新版 26 稱號正式 owner",{retired:window.GM_CALAMITY_LEGACY_TITLE_PREVIEW_RETIRED_VERSION,gm:window.GM_PLAYER_TITLE_PREVIEW_VERSION,owner:window.GM_PLAYER_TITLE_PREVIEW_OWNER_VERSION,section:window.GM_PLAYER_TITLE_PREVIEW_SECTION_OWNER_VERSION,html});
  if(JSON.stringify(before)!==JSON.stringify(after)||beforeSave!==afterSave)fail("TITLE_GM_SIDE_EFFECT","GM 稱號預覽不得修改正式 title state 或存檔",{before,after});
 }catch(error){fail("TITLE_GM_PROBE","GM 稱號預覽無副作用 probe 失敗",String(error?.message||error));}

 const report={version:VERSION,passed:errors.length===0,errors,checkedAt:Date.now()};
 window.PLAYER_TITLE_INTEGRITY_VERSION=VERSION;
 window.PLAYER_TITLE_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Player title integrity error",errors);
})();