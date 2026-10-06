(function(){
 const VERSION=7;
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const clone=value=>{try{return JSON.parse(JSON.stringify(value));}catch(_){return null;}};
 try{
  const defs=Array.from(window.PLAYER_TITLE_DEFS||[]),ids=defs.map(def=>def.id);
  if(Number(window.GM_HUB_SECTION_RENDERER_REPLACE_VERSION)!==1)fail("GM_SECTION_REPLACE","GM section renderer replacement owner V1 未載入",window.GM_HUB_SECTION_RENDERER_REPLACE_VERSION);
  if(Number(window.GM_CALAMITY_LEGACY_TITLE_PREVIEW_RETIRED_VERSION)!==1)fail("GM_TITLE_LEGACY_RETIRED","calamitygm 舊稱號 preview owner 尚未退休",window.GM_CALAMITY_LEGACY_TITLE_PREVIEW_RETIRED_VERSION);
  if(Number(window.GM_PLAYER_TITLE_PREVIEW_VERSION)!==10||Number(window.GM_PLAYER_TITLE_PREVIEW_ALL_CATALOG_VERSION)!==6||Number(window.GM_PLAYER_TITLE_PREVIEW_CANONICAL_CATALOG_VERSION)!==6||Number(window.GM_PLAYER_TITLE_PREVIEW_DISPLAY_ORDER_VERSION)!==4||Number(window.GM_PLAYER_TITLE_PREVIEW_ALTERNATE_UNIVERSE_QUICK_VERSION)!==1||Number(window.GM_PLAYER_TITLE_PREVIEW_OWNER_VERSION)!==1||Number(window.GM_PLAYER_TITLE_PREVIEW_SECTION_OWNER_VERSION)!==1||Number(window.PLAYER_TITLE_MIRROR_LAST_ORDER_VERSION)!==1)fail("GM_TITLE_PREVIEW_VERSION","GM 46 稱號唯一 owner／異宇宙快速預覽版本異常",{preview:window.GM_PLAYER_TITLE_PREVIEW_VERSION,catalog:window.GM_PLAYER_TITLE_PREVIEW_ALL_CATALOG_VERSION,canonical:window.GM_PLAYER_TITLE_PREVIEW_CANONICAL_CATALOG_VERSION,displayOrder:window.GM_PLAYER_TITLE_PREVIEW_DISPLAY_ORDER_VERSION,alternateQuick:window.GM_PLAYER_TITLE_PREVIEW_ALTERNATE_UNIVERSE_QUICK_VERSION,owner:window.GM_PLAYER_TITLE_PREVIEW_OWNER_VERSION,section:window.GM_PLAYER_TITLE_PREVIEW_SECTION_OWNER_VERSION});
  if(window.PLAYER_TITLE_DEFS!==window.PLAYER_TITLE_CATALOG_DEFS||defs.length!==46)fail("GM_TITLE_COUNT","GM 稱號預覽必須直接使用 46 個正式 canonical catalog",{count:defs.length,sameOwner:window.PLAYER_TITLE_DEFS===window.PLAYER_TITLE_CATALOG_DEFS});
  if(defs.slice(0,10).some(def=>def.series!=="calamity")||defs.slice(10,20).some(def=>def.series!=="universe-calamity")||defs.slice(20,30).some(def=>def.series!=="higher-dimensional")||defs.slice(30,40).some(def=>def.series!=="alternate-universe")||defs.slice(40).some(def=>def.series!=="mirror"))fail("GM_TITLE_CANONICAL_ORDER","正式稱號 catalog 必須為銀河10、宇宙10、高維10、異宇宙10、鏡像6，且鏡像永遠最後",defs.map(def=>def.series));
  const before=clone(state?.titles),beforeSave=typeof localStorage!=="undefined"?localStorage.getItem(SAVE_KEY):null,html=typeof window.gmPlayerTitlePreviewHtml==="function"?String(window.gmPlayerTitlePreviewHtml()||""):"";
  if(!html.includes("實戰名稱預覽全部 46 個正式稱號")||!html.includes("銀河紀元災厄稱號")||!html.includes("宇宙紀元災厄稱號")||!html.includes("高維紀元稱號")||!html.includes("異宇宙稱號")||!html.includes("異宇宙 1～10 階快速視覺測試")||!html.includes("鏡像戰稱號")||!html.includes("gm-player-title-combat-preview")||!html.includes("player-identity-name"))fail("GM_TITLE_HTML","GM 46 稱號實戰名稱預覽／異宇宙快速測試 HTML 不完整",html);
  ids.forEach(id=>{if(!html.includes(`value=\"${id}\"`))fail("GM_TITLE_OPTION",`GM 預覽缺少稱號 ${id}`);});
  const alternateDefs=defs.filter(def=>def.series==="alternate-universe");alternateDefs.forEach(def=>{if(!html.includes(`gmSetPlayerTitlePreviewTier(\'${def.id}\')`)||!html.includes(`${def.tier}｜${def.name}`)||!html.includes(`${def.depthThreshold} 層域`))fail("GM_TITLE_ALTERNATE_QUICK_OPTION",`GM 異宇宙快速預覽缺少第 ${def.tier} 階`,def);});
  const galaxyPos=html.indexOf("銀河紀元災厄稱號"),universePos=html.indexOf("宇宙紀元災厄稱號"),higherPos=html.indexOf("高維紀元稱號"),alternatePos=html.indexOf("異宇宙稱號"),mirrorPos=html.indexOf("鏡像戰稱號");
  if(!(galaxyPos>=0&&galaxyPos<universePos&&universePos<higherPos&&higherPos<alternatePos&&alternatePos<mirrorPos))fail("GM_TITLE_DISPLAY_ORDER","GM 稱號預覽顯示順序必須為銀河10、宇宙10、高維10、異宇宙10、鏡像6",{galaxyPos,universePos,higherPos,alternatePos,mirrorPos});
  const higherFirst=html.indexOf('value="higher-dimensional-title-01"'),mirrorFirst=html.indexOf('value="mirror_title_15"');
  if(!(higherFirst>=0&&mirrorFirst>higherFirst))fail("GM_TITLE_MIRROR_LAST","鏡像稱號必須位於高維紀元稱號之後",{higherFirst,mirrorFirst});
  const quickResults=alternateDefs.map(def=>({id:def.id,result:window.gmSetPlayerTitlePreviewTier?.(def.id)}));
  if(quickResults.some(row=>row.result!==row.id))fail("GM_TITLE_ALTERNATE_QUICK_SELECT","異宇宙快速視覺測試必須能逐階切換正式 renderer",quickResults);
  const after=clone(state?.titles),afterSave=typeof localStorage!=="undefined"?localStorage.getItem(SAVE_KEY):null;
  if(JSON.stringify(before)!==JSON.stringify(after)||beforeSave!==afterSave)fail("GM_TITLE_SIDE_EFFECT","GM 稱號預覽／異宇宙快速視覺測試不得修改正式 title state 或存檔",{before,after,quickResults});
  const sectionIds=typeof window.gmHubRegisteredSectionIds==="function"?window.gmHubRegisteredSectionIds("test"):[];
  if(sectionIds.filter(id=>id==="player-title-preview").length!==1)fail("GM_TITLE_SECTION","GM 測試頁應且只應存在一個稱號預覽 section",sectionIds);
 }catch(error){fail("EXCEPTION","GM 46 稱號預覽完整性檢查失敗",String(error?.message||error));}
 const report={version:VERSION,passed:errors.length===0,errors,checkedAt:Date.now()};
 window.GM_PLAYER_TITLE_PREVIEW_INTEGRITY_VERSION=VERSION;
 window.GM_PLAYER_TITLE_PREVIEW_INTEGRITY_REPORT=report;
 if(errors.length)console.error("[文明戰線] GM player title preview integrity error",errors);
})();
