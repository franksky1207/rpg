(function(){
 const VERSION=1;
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const defs=Array.from(window.CIVILIZATION_PLAYER_TITLE_DEFS||[]);
 const ids=Array.from(window.CIVILIZATION_PLAYER_TITLE_IDS||[]);
 const expectedNames=["灰潮餘燼","蝕日王冠","星骸殘響","黑域孤星","天環墜落","寂滅遠航","萬域寂滅","黑核權柄","無聲王權","萬星終寂"];
 const clone=value=>{try{return JSON.parse(JSON.stringify(value));}catch(_){return null;}};

 if(Number(window.PLAYER_TITLE_STATE_VERSION)!==1)fail("TITLE_STATE_VERSION","玩家稱號 state 應為 V1",window.PLAYER_TITLE_STATE_VERSION);
 if(defs.length!==10||ids.length!==10)fail("TITLE_DEFINITION_COUNT","玩家稱號必須固定 10 階",{defs:defs.length,ids:ids.length});
 expectedNames.forEach((name,index)=>{
  const def=defs[index];
  if(!def||def.name!==name||def.tier!==index+1||def.id!==`calamity_title_${String(index+1).padStart(2,"0")}`)fail("TITLE_DEFINITION_ORDER",`第 ${index+1} 階稱號定義異常`,def||null);
 });
 const required=["normalizePlayerTitleState","getPlayerTitleDefinition","getPlayerTitleDefinitionForCalamity","grantPlayerTitleForCalamityFirstKill","getPendingPlayerTitleNotice","clearPendingPlayerTitleNotice","getUnlockedPlayerTitleDefinitions","getEquippedPlayerTitleDefinition","playerTitleHtml","playerIdentityNameHtml","equipPlayerTitle","openPlayerTitlePicker","closePlayerTitlePicker","selectPlayerTitle"];
 required.forEach(name=>{if(typeof window[name]!=="function")fail("TITLE_API_MISSING",`${name} 未載入`);});

 try{
  const probe={marks:{entries:{}},titles:{version:1,unlocked:[],equipped:null,pendingNotice:null}};
  defs.forEach(def=>{probe.marks.entries[def.markId]={acquired:false,level:0,progress:0};});
  if(defs[0])probe.marks.entries[defs[0].markId].acquired=true;
  if(defs[2])probe.marks.entries[defs[2].markId].acquired=true;
  window.normalizePlayerTitleState(probe);
  const first=JSON.stringify(probe.titles);
  window.normalizePlayerTitleState(probe);
  const second=JSON.stringify(probe.titles);
  if(first!==second)fail("TITLE_NORMALIZE_IDEMPOTENT","稱號 normalization 必須 idempotent",{first,second});
  if(probe.titles.pendingNotice!==null)fail("TITLE_BACKFILL_NOTICE","舊檔／normalization 靜默補發不得建立 pendingNotice",probe.titles);
  const expected=[defs[0]?.id,defs[2]?.id].filter(Boolean);
  if(JSON.stringify(probe.titles.unlocked)!==JSON.stringify(expected))fail("TITLE_BACKFILL_UNION","印記 acquired 靜默補發結果異常",{expected,actual:probe.titles.unlocked});
  probe.titles.unlocked.push(defs[1].id);
  probe.marks.entries[defs[1].markId].acquired=false;
  window.normalizePlayerTitleState(probe);
  if(!probe.titles.unlocked.includes(defs[1].id))fail("TITLE_BACKFILL_ADDITIVE","稱號 normalization 不得回收既有 unlocked",probe.titles.unlocked);
 }catch(error){fail("TITLE_NORMALIZE_PROBE","稱號 normalization probe 失敗",String(error?.message||error));}

 try{
  const target={marks:{entries:{}},titles:{version:1,unlocked:[],equipped:null,pendingNotice:null}};
  defs.forEach(def=>{target.marks.entries[def.markId]={acquired:false,level:0,progress:0};});
  const def=defs[4];
  const first=window.grantPlayerTitleForCalamityFirstKill(def.calamityId,target);
  const second=window.grantPlayerTitleForCalamityFirstKill(def.calamityId,target);
  if(first?.firstAcquisition!==true||second?.firstAcquisition!==false)fail("TITLE_FIRST_KILL_ONCE","同一災厄稱號只可首次取得一次",{first,second});
  if(target.titles.pendingNotice!==def.id)fail("TITLE_FIRST_KILL_PENDING","真正首殺必須留下 pendingNotice",target.titles);
 }catch(error){fail("TITLE_FIRST_KILL_PROBE","首殺稱號 probe 失敗",String(error?.message||error));}

 try{
  const html=window.playerIdentityNameHtml({name:"Frank",titleId:defs[9]?.id});
  if(!html.includes("player-title--tier-10")||!html.includes("萬星終寂")||!html.includes("player-identity-name"))fail("TITLE_RENDERER","正式 renderer 未同時輸出稱號與獨立玩家名 span",html);
 }catch(error){fail("TITLE_RENDERER_PROBE","稱號 renderer probe 失敗",String(error?.message||error));}

 try{
  const before=clone(state?.titles);
  const beforeSave=typeof localStorage!=="undefined"?localStorage.getItem(SAVE_KEY):null;
  const html=typeof window.gmPlayerTitlePreviewHtml==="function"?String(window.gmPlayerTitlePreviewHtml()||""):"";
  const after=clone(state?.titles);
  const afterSave=typeof localStorage!=="undefined"?localStorage.getItem(SAVE_KEY):null;
  if(Number(window.GM_PLAYER_TITLE_PREVIEW_VERSION)!==1||!html.includes("純視覺預覽"))fail("TITLE_GM_PREVIEW","GM 稱號預覽 V1 未載入",{version:window.GM_PLAYER_TITLE_PREVIEW_VERSION});
  if(JSON.stringify(before)!==JSON.stringify(after)||beforeSave!==afterSave)fail("TITLE_GM_SIDE_EFFECT","GM 稱號預覽不得修改正式 title state 或存檔",{before,after});
 }catch(error){fail("TITLE_GM_PROBE","GM 稱號預覽無副作用 probe 失敗",String(error?.message||error));}

 const report={version:VERSION,passed:errors.length===0,errors,checkedAt:Date.now()};
 window.PLAYER_TITLE_INTEGRITY_VERSION=VERSION;
 window.PLAYER_TITLE_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Player title integrity error",errors);
})();
