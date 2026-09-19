(function(){
 const VERSION=2;
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const calamityDefs=Array.from(window.CIVILIZATION_PLAYER_TITLE_DEFS||[]);
 const calamityIds=Array.from(window.CIVILIZATION_PLAYER_TITLE_IDS||[]);
 const mirrorDefs=Array.from(window.MIRROR_PLAYER_TITLE_DEFS||[]);
 const mirrorIds=Array.from(window.MIRROR_PLAYER_TITLE_IDS||[]);
 const allDefs=Array.from(window.PLAYER_TITLE_DEFS||[]);
 const allIds=Array.from(window.PLAYER_TITLE_IDS||[]);
 const expectedCalamityNames=["灰潮餘燼","蝕日王冠","星骸殘響","黑域孤星","天環墜落","寂滅遠航","萬域寂滅","黑核權柄","無聲王權","萬星終寂"];
 const expectedMirror=[
  ["mirror_title_15","幸運眷顧",15],["mirror_title_16","天選之刻",16],["mirror_title_17","逆命者",17],
  ["mirror_title_18","傳說之日",18],["mirror_title_19","距神一步",19],["mirror_title_20","神蹟",20]
 ];
 const clone=value=>{try{return JSON.parse(JSON.stringify(value));}catch(_){return null;}};

 if(Number(window.PLAYER_TITLE_STATE_VERSION)!==1)fail("TITLE_STATE_VERSION","玩家稱號 state 應為 V1",window.PLAYER_TITLE_STATE_VERSION);
 if(calamityDefs.length!==10||calamityIds.length!==10||mirrorDefs.length!==6||mirrorIds.length!==6||allDefs.length!==16||allIds.length!==16){
  fail("TITLE_DEFINITION_COUNT","玩家稱號定義應為災厄 10＋鏡像 6",{calamityDefs:calamityDefs.length,calamityIds:calamityIds.length,mirrorDefs:mirrorDefs.length,mirrorIds:mirrorIds.length,allDefs:allDefs.length,allIds:allIds.length});
 }
 expectedCalamityNames.forEach((name,index)=>{
  const def=calamityDefs[index];
  if(!def||def.name!==name||def.tier!==index+1||def.id!==`calamity_title_${String(index+1).padStart(2,"0")}`||def.series!=="calamity"||def.order!==index+1)fail("TITLE_CALAMITY_ORDER",`災厄第 ${index+1} 階稱號定義異常`,def||null);
 });
 expectedMirror.forEach(([id,name,wins],index)=>{
  const def=mirrorDefs[index];
  if(!def||def.id!==id||def.name!==name||def.mirrorWins!==wins||def.series!=="mirror"||def.order!==11+index)fail("TITLE_MIRROR_ORDER",`鏡像 ${wins} 勝稱號定義異常`,def||null);
 });
 if(JSON.stringify(allIds)!==JSON.stringify([...calamityIds,...mirrorIds]))fail("TITLE_UNIFIED_ORDER","統一稱號順序必須固定為災厄 10 個後接鏡像 6 個",allIds);

 const required=["normalizePlayerTitleState","getPlayerTitleDefinition","getPlayerTitleDefinitionForCalamity","getPlayerTitleDefinitionForMirrorWins","grantPlayerTitleForCalamityFirstKill","grantPlayerTitlesForMirrorWins","getPendingPlayerTitleNotice","clearPendingPlayerTitleNotice","getUnlockedPlayerTitleDefinitions","getEquippedPlayerTitleDefinition","playerTitleHtml","playerIdentityNameHtml","equipPlayerTitle","openPlayerTitlePicker","closePlayerTitlePicker","selectPlayerTitle"];
 required.forEach(name=>{if(typeof window[name]!=="function")fail("TITLE_API_MISSING",`${name} 未載入`);});

 try{
  const probe={marks:{entries:{}},dungeon:{mirror:{history:{bestWins:17}}},titles:{version:1,unlocked:[],equipped:null,pendingNotice:null}};
  calamityDefs.forEach(def=>{probe.marks.entries[def.markId]={acquired:false,level:0,progress:0};});
  if(calamityDefs[0])probe.marks.entries[calamityDefs[0].markId].acquired=true;
  if(calamityDefs[2])probe.marks.entries[calamityDefs[2].markId].acquired=true;
  window.normalizePlayerTitleState(probe);
  const first=JSON.stringify(probe.titles);
  window.normalizePlayerTitleState(probe);
  const second=JSON.stringify(probe.titles);
  if(first!==second)fail("TITLE_NORMALIZE_IDEMPOTENT","稱號 normalization 必須 idempotent",{first,second});
  if(probe.titles.pendingNotice!==null)fail("TITLE_BACKFILL_NOTICE","舊檔／normalization 靜默補發不得建立 pendingNotice",probe.titles);
  const expected=[calamityDefs[0]?.id,calamityDefs[2]?.id,mirrorDefs[0]?.id,mirrorDefs[1]?.id,mirrorDefs[2]?.id].filter(Boolean);
  if(JSON.stringify(probe.titles.unlocked)!==JSON.stringify(expected))fail("TITLE_BACKFILL_UNION","災厄／鏡像靜默補發結果或排序異常",{expected,actual:probe.titles.unlocked});
  probe.titles.unlocked.push(calamityDefs[1].id);
  probe.marks.entries[calamityDefs[1].markId].acquired=false;
  probe.dungeon.mirror.history.bestWins=0;
  window.normalizePlayerTitleState(probe);
  if(!probe.titles.unlocked.includes(calamityDefs[1].id)||!probe.titles.unlocked.includes(mirrorDefs[2].id))fail("TITLE_BACKFILL_ADDITIVE","稱號 normalization 不得回收既有 unlocked",probe.titles.unlocked);
 }catch(error){fail("TITLE_NORMALIZE_PROBE","稱號 normalization probe 失敗",String(error?.message||error));}

 try{
  const target={marks:{entries:{}},dungeon:{mirror:{history:{bestWins:0}}},titles:{version:1,unlocked:[],equipped:null,pendingNotice:null}};
  calamityDefs.forEach(def=>{target.marks.entries[def.markId]={acquired:false,level:0,progress:0};});
  const def=calamityDefs[4];
  const first=window.grantPlayerTitleForCalamityFirstKill(def.calamityId,target);
  const second=window.grantPlayerTitleForCalamityFirstKill(def.calamityId,target);
  if(first?.firstAcquisition!==true||second?.firstAcquisition!==false)fail("TITLE_FIRST_KILL_ONCE","同一災厄稱號只可首次取得一次",{first,second});
  if(target.titles.pendingNotice!==def.id)fail("TITLE_FIRST_KILL_PENDING","真正首殺必須留下 pendingNotice",target.titles);
 }catch(error){fail("TITLE_FIRST_KILL_PROBE","首殺稱號 probe 失敗",String(error?.message||error));}

 try{
  const target={marks:{entries:{}},dungeon:{mirror:{history:{bestWins:18}}},titles:{version:1,unlocked:[],equipped:null,pendingNotice:null}};
  calamityDefs.forEach(def=>{target.marks.entries[def.markId]={acquired:false,level:0,progress:0};});
  const settlement=window.grantPlayerTitlesForMirrorWins(18,target,{previousBestWins:14});
  const expected=mirrorDefs.slice(0,4).map(def=>def.id);
  if(JSON.stringify(settlement?.unlockedTitles?.map(def=>def.id)||[])!==JSON.stringify(expected))fail("TITLE_MIRROR_MULTI_UNLOCK","14→18 應一次解鎖鏡像 15～18",settlement);
  if(settlement?.noticeTitle?.id!==mirrorDefs[3]?.id||target.titles.pendingNotice!==mirrorDefs[3]?.id)fail("TITLE_MIRROR_HIGHEST_NOTICE","跨多階只應通知最高新鏡像稱號",{settlement,titles:target.titles});
 }catch(error){fail("TITLE_MIRROR_GRANT_PROBE","鏡像稱號取得 probe 失敗",String(error?.message||error));}

 try{
  const calamityHtml=window.playerIdentityNameHtml({name:"Frank",titleId:calamityDefs[9]?.id});
  const mirrorHtml=window.playerIdentityNameHtml({name:"Frank",titleId:mirrorDefs[5]?.id});
  if(!calamityHtml.includes("player-title--tier-10")||!calamityHtml.includes("萬星終寂")||!calamityHtml.includes("player-identity-name"))fail("TITLE_CALAMITY_RENDERER","災厄 renderer 異常",calamityHtml);
  if(!mirrorHtml.includes("player-title--mirror-20")||!mirrorHtml.includes("神蹟")||mirrorHtml.indexOf("神蹟")>mirrorHtml.indexOf("Frank"))fail("TITLE_MIRROR_RENDERER","鏡像 renderer 未正確輸出於玩家名稱前",mirrorHtml);
 }catch(error){fail("TITLE_RENDERER_PROBE","稱號 renderer probe 失敗",String(error?.message||error));}

 try{
  const before=clone(state?.titles);
  const beforeSave=typeof localStorage!=="undefined"?localStorage.getItem(SAVE_KEY):null;
  const html=typeof window.gmPlayerTitlePreviewHtml==="function"?String(window.gmPlayerTitlePreviewHtml()||""):"";
  const after=clone(state?.titles);
  const afterSave=typeof localStorage!=="undefined"?localStorage.getItem(SAVE_KEY):null;
  if(Number(window.GM_PLAYER_TITLE_PREVIEW_VERSION)!==2||!html.includes("全部 16 個正式稱號")||!html.includes("鏡像戰稱號"))fail("TITLE_GM_PREVIEW","GM 稱號預覽 V2／16 稱號未載入",{version:window.GM_PLAYER_TITLE_PREVIEW_VERSION,html});
  if(JSON.stringify(before)!==JSON.stringify(after)||beforeSave!==afterSave)fail("TITLE_GM_SIDE_EFFECT","GM 稱號預覽不得修改正式 title state 或存檔",{before,after});
 }catch(error){fail("TITLE_GM_PROBE","GM 稱號預覽無副作用 probe 失敗",String(error?.message||error));}

 const report={version:VERSION,passed:errors.length===0,errors,checkedAt:Date.now()};
 window.PLAYER_TITLE_INTEGRITY_VERSION=VERSION;
 window.PLAYER_TITLE_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Player title integrity error",errors);
})();