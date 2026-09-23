(function(){
 const VERSION=1;
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 try{
  const universe=Array.from(window.UNIVERSE_CALAMITY_PLAYER_TITLE_DEFS||[]);
  const mirror=Array.from(window.MIRROR_PLAYER_TITLE_DEFS||[]);
  if(Number(window.PLAYER_TITLE_UNIVERSE_RENDERER_VERSION)!==1)fail("UNIVERSE_RENDERER_VERSION","宇宙災厄稱號 renderer V1 未載入",window.PLAYER_TITLE_UNIVERSE_RENDERER_VERSION);
  if(Number(window.PLAYER_TITLE_UNIVERSE_NOTICE_VERSION)!==1)fail("UNIVERSE_NOTICE_VERSION","宇宙災厄稱號取得通知 V1 未載入",window.PLAYER_TITLE_UNIVERSE_NOTICE_VERSION);
  if(universe.length!==10)fail("UNIVERSE_TITLE_COUNT","宇宙災厄稱號應為 10 個",universe.length);
  universe.forEach((def,index)=>{
   const html=typeof window.playerTitleHtml==="function"?window.playerTitleHtml(def.id):"";
   if(def.series!=="universe-calamity"||def.tier!==index+1)fail("UNIVERSE_TITLE_META",`宇宙稱號第 ${index+1} 階 metadata 異常`,def);
   if(!html.includes(`player-title--universe-calamity-${index+1}`)||!html.includes("player-title--universe-calamity")||!html.includes("data-title-text"))fail("UNIVERSE_RENDER",`宇宙稱號第 ${index+1} 階 renderer class 異常`,html);
  });
  const universeIds=universe.map(def=>def.id);
  const probe={titles:{version:1,unlocked:universeIds.slice(),equipped:universeIds[9]||null,pendingNotice:null},secondWorld:{calamities:Array.from({length:10},(_,i)=>({trueKills:i===9?1:0}))},marks:{entries:{}},dungeon:{mirror:{history:{bestWins:0}}}};
  const unlocked=typeof window.getUnlockedPlayerTitleDefinitions==="function"?window.getUnlockedPlayerTitleDefinitions(probe):[];
  if(unlocked.filter(def=>def.series==="universe-calamity").length!==10)fail("UNIVERSE_PICKER_CATALOG","角色介面稱號 catalog 未完整納入宇宙 10 稱號",unlocked);
  const equipped=typeof window.getEquippedPlayerTitleDefinition==="function"?window.getEquippedPlayerTitleDefinition(probe):null;
  if(equipped?.id!==universeIds[9])fail("UNIVERSE_EQUIP","宇宙稱號無法沿用正式 equipped owner",equipped);
  try{
   const noticeSource=Function.prototype.toString.call(window.showPendingPlayerTitleNotice);
   if(!/titleSourceText/.test(noticeSource))fail("UNIVERSE_NOTICE_WIRING","取得通知未接到 world-aware source text",noticeSource);
  }catch(error){fail("UNIVERSE_NOTICE_SOURCE","無法檢查宇宙稱號取得通知",String(error?.message||error));}
  if(mirror.length!==6)fail("MIRROR_TITLE_COUNT","鏡像稱號應維持 6 個",mirror.length);
  mirror.forEach(def=>{
   const html=typeof window.playerTitleHtml==="function"?window.playerTitleHtml(def.id):"";
   if(!html.includes(`player-title--mirror-${def.mirrorWins}`)||!html.includes("data-title-text"))fail("MIRROR_RENDER_V2",`鏡像 ${def.mirrorWins} 勝 renderer anomaly hook 遺失`,html);
  });
  const link=Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(node=>String(node.getAttribute("href")||"").includes("playertitlesera.css"));
  if(!link)fail("ERA_STYLESHEET","宇宙／鏡像新版稱號 stylesheet 未載入");
 }catch(error){fail("EXCEPTION","宇宙／鏡像稱號顯示完整性檢查失敗",String(error?.message||error));}
 const report={version:VERSION,passed:errors.length===0,errors,checkedAt:Date.now()};
 window.PLAYER_TITLE_UNIVERSE_VISUAL_INTEGRITY_VERSION=VERSION;
 window.PLAYER_TITLE_UNIVERSE_VISUAL_INTEGRITY_REPORT=report;
})();
