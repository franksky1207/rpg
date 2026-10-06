(function(){
 const VERSION=8;
 let selectedId=null;

 function canonicalDefs(){return Array.from(window.PLAYER_TITLE_DEFS||[]);}
 function defs(){return canonicalDefs();}
 function current(){
  const list=defs();
  if(!selectedId&&list.length)selectedId=list[0].id;
  return list.find(def=>def.id===selectedId)||list[0]||null;
 }
 function label(def){
  if(!def)return "";
  if(def.series==="mirror")return `鏡像 ${def.mirrorWins} 勝｜${def.name}`;
  if(def.series==="universe-calamity")return `宇宙災厄第 ${def.tier} 階｜${def.name}`;
  if(def.series==="higher-dimensional")return `高維紀元第 ${def.tier} 階｜${def.name}`;
  return `銀河災厄第 ${def.tier} 階｜${def.name}`;
 }
 function divider(series){
  if(series==="calamity")return "──── 銀河紀元災厄稱號 ────";
  if(series==="universe-calamity")return "──── 宇宙紀元災厄稱號 ────";
  if(series==="higher-dimensional")return "──── 高維紀元稱號 ────";
  if(series==="mirror")return "──── 鏡像戰稱號 ────";
  return "";
 }
 function options(){
  let previousSeries="";
  return defs().map(def=>{
   const series=String(def?.series||"");
   const heading=series!==previousSeries?`<option disabled>${divider(series)}</option>`:"";
   previousSeries=series;
   return heading+`<option value="${def.id}" ${def.id===selectedId?"selected":""}>${label(def)}</option>`;
  }).join("");
 }
 function playerName(){
  const name=typeof state?.playerName==="string"?state.playerName.trim():"";
  return name||"玩家";
 }
 function combatPreview(def){
  const identity=def&&typeof window.playerIdentityNameHtml==="function"
   ?window.playerIdentityNameHtml({name:playerName(),titleId:def.id,compact:true,allowUnownedTitle:true})
   :playerName();
  return `<div class="gm-player-title-combat-preview"><div class="combatant player"><h2>${identity}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span>100 / 100</span></div><div class="bar"><span class="hp" style="width:100%"></span></div></div></div></div>`;
 }
 function setPreview(value){
  const list=defs(),id=String(value||"");
  selectedId=list.some(def=>def.id===id)?id:(list[0]?.id||null);
  const box=document.getElementById("gmPlayerTitlePreviewBox"),def=current();
  if(box&&def)box.innerHTML=`${combatPreview(def)}<div class="muted" style="text-align:center;margin-top:8px">${label(def)}</div>`;
  return selectedId;
 }
 function html(){
  const def=current();
  return `<div class="muted gm-hub-note">實戰名稱預覽全部 36 個正式稱號；依序為銀河災厄 10 個、宇宙災厄 10 個、高維紀元 10 個、鏡像戰 6 個。直接使用目前正式玩家名稱與正式 playerIdentityNameHtml()；此區只做視覺預覽，不解鎖、不裝備、不修改任何正式狀態，也不寫入存檔。</div><div class="controls" style="align-items:end"><label>稱號<br><select class="btn" onchange="gmSetPlayerTitlePreviewTier(this.value)">${options()}</select></label></div><div id="gmPlayerTitlePreviewBox" class="notice" style="margin-top:12px">${combatPreview(def)}<div class="muted" style="text-align:center;margin-top:8px">${label(def)}</div></div>`;
 }

 window.gmSetPlayerTitlePreviewTier=setPreview;
 window.gmPlayerTitlePreviewHtml=html;
 window.GM_PLAYER_TITLE_PREVIEW_VERSION=VERSION;
 window.GM_PLAYER_TITLE_PREVIEW_ALL_CATALOG_VERSION=4;
 window.GM_PLAYER_TITLE_PREVIEW_CANONICAL_CATALOG_VERSION=4;
 window.GM_PLAYER_TITLE_PREVIEW_DISPLAY_ORDER_VERSION=2;
 window.GM_PLAYER_TITLE_PREVIEW_OWNER_VERSION=1;
 let registered=false;
 if(typeof window.replaceGmHubSectionRenderer==="function")registered=window.replaceGmHubSectionRenderer("test","player-title-preview",html,"稱號預覽")===true;
 if(!registered&&typeof window.registerGmHubSection==="function")registered=window.registerGmHubSection("test","稱號預覽",html,{id:"player-title-preview"})===true;
 window.GM_PLAYER_TITLE_PREVIEW_SECTION_OWNER_VERSION=registered?1:0;
})();
