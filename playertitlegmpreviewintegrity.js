(function(){
 const VERSION=2;
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const clone=value=>{try{return JSON.parse(JSON.stringify(value));}catch(_){return null;}};
 try{
  const defs=Array.from(window.PLAYER_TITLE_DEFS||[]);
  const ids=defs.map(def=>def.id);
  if(Number(window.GM_HUB_SECTION_RENDERER_REPLACE_VERSION)!==1)fail("GM_SECTION_REPLACE","GM section renderer replacement owner V1 未載入",window.GM_HUB_SECTION_RENDERER_REPLACE_VERSION);
  if(Number(window.GM_CALAMITY_LEGACY_TITLE_PREVIEW_RETIRED_VERSION)!==1)fail("GM_TITLE_LEGACY_RETIRED","calamitygm 舊 16 稱號 preview owner 尚未退休",window.GM_CALAMITY_LEGACY_TITLE_PREVIEW_RETIRED_VERSION);
  if(Number(window.GM_PLAYER_TITLE_PREVIEW_VERSION)!==5||Number(window.GM_PLAYER_TITLE_PREVIEW_ALL_CATALOG_VERSION)!==2||Number(window.GM_PLAYER_TITLE_PREVIEW_CANONICAL_CATALOG_VERSION)!==2||Number(window.GM_PLAYER_TITLE_PREVIEW_OWNER_VERSION)!==1||Number(window.GM_PLAYER_TITLE_PREVIEW_SECTION_OWNER_VERSION)!==1)fail("GM_TITLE_PREVIEW_VERSION","GM 26 稱號唯一 owner 版本異常",{preview:window.GM_PLAYER_TITLE_PREVIEW_VERSION,catalog:window.GM_PLAYER_TITLE_PREVIEW_ALL_CATALOG_VERSION,canonical:window.GM_PLAYER_TITLE_PREVIEW_CANONICAL_CATALOG_VERSION,owner:window.GM_PLAYER_TITLE_PREVIEW_OWNER_VERSION,section:window.GM_PLAYER_TITLE_PREVIEW_SECTION_OWNER_VERSION});
  if(window.PLAYER_TITLE_DEFS!==window.PLAYER_TITLE_CATALOG_DEFS||defs.length!==26)fail("GM_TITLE_COUNT","GM 稱號預覽必須直接使用 26 個正式 canonical catalog",{count:defs.length,sameOwner:window.PLAYER_TITLE_DEFS===window.PLAYER_TITLE_CATALOG_DEFS});
  if(defs.slice(0,10).some(def=>def.series!=="calamity")||defs.slice(10,20).some(def=>def.series!=="universe-calamity")||defs.slice(20).some(def=>def.series!=="mirror"))fail("GM_TITLE_ORDER","GM 稱號預覽順序必須為銀河10、宇宙10、鏡像6",defs.map(def=>def.series));
  const before=clone(state?.titles);
  const beforeSave=typeof localStorage!=="undefined"?localStorage.getItem(SAVE_KEY):null;
  const html=typeof window.gmPlayerTitlePreviewHtml==="function"?String(window.gmPlayerTitlePreviewHtml()||""):"";
  if(!html.includes("實戰名稱預覽全部 26 個正式稱號")||!html.includes("銀河紀元災厄稱號")||!html.includes("宇宙紀元災厄稱號")||!html.includes("鏡像戰稱號")||!html.includes("gm-player-title-combat-preview")||!html.includes("player-identity-name"))fail("GM_TITLE_HTML","GM 26 稱號實戰名稱預覽 HTML 不完整",html);
  ids.forEach(id=>{if(!html.includes(`value=\"${id}\"`))fail("GM_TITLE_OPTION",`GM 預覽缺少稱號 ${id}`);});
  const after=clone(state?.titles);
  const afterSave=typeof localStorage!=="undefined"?localStorage.getItem(SAVE_KEY):null;
  if(JSON.stringify(before)!==JSON.stringify(after)||beforeSave!==afterSave)fail("GM_TITLE_SIDE_EFFECT","GM 稱號預覽不得修改正式 title state 或存檔",{before,after});
  const sectionIds=typeof window.gmHubRegisteredSectionIds==="function"?window.gmHubRegisteredSectionIds("test"):[];
  if(sectionIds.filter(id=>id==="player-title-preview").length!==1)fail("GM_TITLE_SECTION","GM 測試頁應且只應存在一個稱號預覽 section",sectionIds);
 }catch(error){fail("EXCEPTION","GM 26 稱號預覽完整性檢查失敗",String(error?.message||error));}
 const report={version:VERSION,passed:errors.length===0,errors,checkedAt:Date.now()};
 window.GM_PLAYER_TITLE_PREVIEW_INTEGRITY_VERSION=VERSION;
 window.GM_PLAYER_TITLE_PREVIEW_INTEGRITY_REPORT=report;
 if(errors.length)console.error("[文明戰線] GM player title preview integrity error",errors);
})();
