(function(){
 const VERSION=1;
 const TARGET_IDENTITY_FIX_VERSION=1;
 const COMBAT_SPEED_BADGE_REUSE_VERSION=1;
 const firstRunOwners=Object.freeze({
  enemyUnlocked:typeof window.enemyUnlocked==="function"?window.enemyUnlocked:null,
  canBoss:typeof window.canBoss==="function"?window.canBoss:null,
  mapStatusText:typeof window.mapStatusText==="function"?window.mapStatusText:null,
  enemyProgressHtml:typeof window.enemyProgressHtml==="function"?window.enemyProgressHtml:null,
  enemyNoteHtml:typeof window.enemyNoteHtml==="function"?window.enemyNoteHtml:null,
  adventureMapPage:typeof window.adventureMapPage==="function"?window.adventureMapPage:null,
  adventurePreparePage:typeof window.adventurePreparePage==="function"?window.adventurePreparePage:null,
  adventureCombatPage:typeof window.adventureCombatPage==="function"?window.adventureCombatPage:null
 });
 const regionOpenState=Object.create(null);
 let regionOpenInitialized=false;

 function finiteWhole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function worldPhase(target=state){
  if(typeof window.currentWorldPhase==="function")return Number(window.currentWorldPhase(target))||1;
  if(target?.thirdWorld?.entered===true)return 3;
  if(target?.secondWorld?.entered===true)return 2;
  return 1;
 }
 function rerunContext(target=state){
  const context=typeof window.worldReincarnationContext==="function"?window.worldReincarnationContext(target):null;
  const active=context?.reincarnationRun===true&&worldPhase(target)===1;
  return Object.freeze({version:VERSION,active,count:Math.max(0,finiteWhole(context?.count,0)),lifeId:Math.max(0,finiteWhole(context?.lifeId,0)),firstRun:context?.firstRun!==false&&!active,reincarnationRun:context?.reincarnationRun===true,world:worldPhase(target),source:context?"reincarnation-context":"fail-closed"});
 }
 function rerunActive(target=state){return rerunContext(target).active===true;}
 function regions(){try{return typeof WORLD_REGIONS!=="undefined"&&Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[];}catch(_){return [];}}
 function maps(){try{return typeof MAPS!=="undefined"&&Array.isArray(MAPS)?MAPS:[];}catch(_){return [];}}
 function actualBossKilled(mapIndex,target=state){return target?.bossKilled?.[Math.max(0,finiteWhole(mapIndex,0))]===true;}
 function keyBossCoverage(target=state){
  if(!rerunActive(target))return 0;
  let coverage=0;
  regions().forEach((region,index)=>{if(actualBossKilled(region?.mapEnd,target))coverage=Math.max(coverage,index+1);});
  return Math.max(0,Math.min(regions().length,coverage));
 }
 function regionQualified(regionIndex,target=state){return rerunActive(target)&&keyBossCoverage(target)>=Math.max(1,finiteWhole(regionIndex,0)+1);}
 function actualBossCountInRegion(region,target=state){
  const start=Math.max(0,finiteWhole(region?.mapStart,0)),end=Math.min(maps().length-1,finiteWhole(region?.mapEnd,start));
  let count=0;for(let i=start;i<=end;i++)if(actualBossKilled(i,target))count++;
  return count;
 }
 function validMapIndex(value){const index=finiteWhole(value,-1);return index>=0&&index<maps().length?index:-1;}
 function validEnemyIndex(value){const index=finiteWhole(value,-1);return index>=0&&index<=4?index:-1;}
 function rerunMapStatus(mapIndex,target=state){return actualBossKilled(mapIndex,target)?"Boss 已擊敗":"全怪可挑戰";}
 function esc(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
 function initializeRegionOpenState(){
  if(regionOpenInitialized)return;
  regionOpenInitialized=true;
  const list=regions();
  if(!list.length)return;
  const coverage=keyBossCoverage(state),preferred=Math.max(0,Math.min(list.length-1,coverage>0?coverage-1:0));
  regionOpenState[list[preferred].id]=true;
 }
 function rerunMapCardsHtml(region){
  const start=Math.max(0,finiteWhole(region?.mapStart,0)),end=Math.min(maps().length-1,finiteWhole(region?.mapEnd,start)),cards=[];
  for(let index=start;index<=end;index++){
   const map=maps()[index];if(!map)continue;
   const cleared=actualBossKilled(index,state),status=rerunMapStatus(index,state);
   cards.push(`<button class="map-card ${cleared?"cleared":""}" type="button" onclick="openReincarnationRerunWorld1Map(${index})"><b>${index+1}. ${esc(map.name)}</b><div class="muted">Lv.${finiteWhole(map.min,1)}～${finiteWhole(map.max,1)}</div><div class="map-status">${esc(status)}</div></button>`);
  }
  return cards.join("");
 }
 function rerunRegionHtml(region,index){
  const id=String(region?.id||`region-${index}`),open=regionOpenState[id]===true,bossCount=actualBossCountInRegion(region,state),allBosses=bossCount>=10,keyKilled=actualBossKilled(region?.mapEnd,state);
  const meta=allBosses?"10 / 10 Boss・已全數擊敗":keyKilled?`${bossCount} / 10 Boss・關鍵王已擊敗`:`${bossCount} / 10 Boss・全區可挑戰`;
  return `<section class="world-region ${allBosses?"completed":""}" data-rerun-world1-region="${index+1}"><button class="world-region-header" type="button" aria-expanded="${open?"true":"false"}" onclick="toggleReincarnationRerunWorld1Region('${esc(id)}')"><span class="world-region-title-wrap"><b class="world-region-title">${esc(region?.name||`第${index+1}區`)}</b><span class="world-region-level">Lv.${finiteWhole(region?.min,(index*50)+1)}～${finiteWhole(region?.max,(index+1)*50)}</span></span><span class="world-region-meta"><span>${esc(meta)}</span><span class="world-region-toggle">${open?"▲":"▼"}</span></span></button>${open?`<div class="world-region-body"><div class="map-grid">${rerunMapCardsHtml(region)}</div></div>`:""}</section>`;
 }
 function rerunAdventureMapPage(){
  initializeRegionOpenState();
  const coverage=keyBossCoverage(state);
  return `<section class="map-screen reincarnation-rerun-world1" data-rerun-world1="1"><div class="page-top"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button><h2 class="page-title">冒險地圖</h2><span></span></div><div class="notice"><b>轉生重征服・銀河紀元</b><div class="muted" style="margin-top:6px">100 張地圖與所有普通／菁英／Boss 均可直接挑戰；只有實際擊敗的 Boss 會寫入正式通關紀錄。</div><div class="muted" style="margin-top:4px">目前關鍵王向下資格：${coverage} / ${regions().length}</div></div><div class="world-region-list">${regions().map(rerunRegionHtml).join("")}</div></section>`;
 }
 function rerunAdventurePreparePage(){
  if(typeof firstRunOwners.adventurePreparePage!=="function")return "";
  if(!rerunActive(state))return firstRunOwners.adventurePreparePage();
  const index=validMapIndex(selectedMap);if(index<0)return firstRunOwners.adventurePreparePage();
  const originalUnlocked=state?.unlockedMap;
  try{
   if(state&&typeof state==="object")state.unlockedMap=Math.max(finiteWhole(originalUnlocked,0),index);
   return firstRunOwners.adventurePreparePage();
  }finally{
   if(state&&typeof state==="object")state.unlockedMap=originalUnlocked;
  }
 }
 function rerunAdventureCombatPage(){
  if(typeof firstRunOwners.adventureCombatPage!=="function")return "";
  const html=firstRunOwners.adventureCombatPage();
  if(!rerunActive(state)||typeof html!=="string")return html;
  return html.replace(/<div class="combat-head">([\s\S]*?)｜(1(?:\.5)?|2)×<\/div>/,`<div class="combat-head">$1<span class="universe-combat-speed">$2×</span></div>`);
 }

 window.FIRST_WORLD_REINCARNATION_RERUN_POLICY_VERSION=VERSION;
 window.FIRST_WORLD_REINCARNATION_TARGET_IDENTITY_FIX_VERSION=TARGET_IDENTITY_FIX_VERSION;
 window.FIRST_WORLD_REINCARNATION_COMBAT_SPEED_BADGE_REUSE_VERSION=COMBAT_SPEED_BADGE_REUSE_VERSION;
 window.firstWorldReincarnationRerunContext=rerunContext;
 window.isFirstWorldReincarnationRerun=rerunActive;
 window.firstWorldRerunKeyBossCoverage=keyBossCoverage;
 window.firstWorldRerunRegionQualified=regionQualified;
 window.firstWorldRerunPolicySnapshot=function(target=state){const context=rerunContext(target);return {...context,keyBossCoverage:keyBossCoverage(target),regionCount:regions().length,mapCount:maps().length,targetIdentityFixVersion:TARGET_IDENTITY_FIX_VERSION,combatSpeedBadgeReuseVersion:COMBAT_SPEED_BADGE_REUSE_VERSION};};
 window.toggleReincarnationRerunWorld1Region=function(id){initializeRegionOpenState();const key=String(id||"");if(!key)return false;regionOpenState[key]=regionOpenState[key]!==true;if(typeof render==="function")render();return regionOpenState[key];};
 window.openReincarnationRerunWorld1Map=function(mapIndex){
  if(!rerunActive(state))return false;
  const index=validMapIndex(mapIndex);if(index<0)return false;
  if(typeof resetMonsterPreviewCache==="function")resetMonsterPreviewCache();
  selectedMap=index;selectedEnemy=0;selectedBattleCount=1;adventureScreen="prepare";
  if(typeof render==="function")render();
  return true;
 };

 window.enemyUnlocked=function(mapIdx,enemyIdx){
  if(rerunActive(state))return validMapIndex(mapIdx)>=0&&validEnemyIndex(enemyIdx)>=0;
  return typeof firstRunOwners.enemyUnlocked==="function"?firstRunOwners.enemyUnlocked(mapIdx,enemyIdx):false;
 };
 window.canBoss=function(mapIdx){
  if(rerunActive(state))return validMapIndex(mapIdx)>=0;
  return typeof firstRunOwners.canBoss==="function"?firstRunOwners.canBoss(mapIdx):false;
 };
 window.mapStatusText=function(mapIdx){
  if(rerunActive(state))return validMapIndex(mapIdx)>=0?rerunMapStatus(mapIdx,state):"未解鎖";
  return typeof firstRunOwners.mapStatusText==="function"?firstRunOwners.mapStatusText(mapIdx):"";
 };
 window.enemyProgressHtml=function(mapIdx,enemyIdx){
  if(rerunActive(state)){
   if(validMapIndex(mapIdx)<0||validEnemyIndex(enemyIdx)<0)return "";
   if(Number(enemyIdx)===4)return `<div class="enemy-card-progress boss-ready">${actualBossKilled(mapIdx,state)?"已擊敗・可再次挑戰":"可直接挑戰首領"}</div>`;
   return '<div class="enemy-card-progress boss-ready">自由挑戰</div>';
  }
  return typeof firstRunOwners.enemyProgressHtml==="function"?firstRunOwners.enemyProgressHtml(mapIdx,enemyIdx):"";
 };
 window.enemyNoteHtml=function(mapIdx,enemyIdx){
  if(rerunActive(state)){
   if(Number(enemyIdx)===4)return '<div class="enemy-card-note boss-note">轉生重征服：首領不受前置擊殺、Boss 鎖定或角色等級門檻限制；正式紀錄只在實際擊敗後寫入。</div>';
   return "";
  }
  return typeof firstRunOwners.enemyNoteHtml==="function"?firstRunOwners.enemyNoteHtml(mapIdx,enemyIdx):"";
 };
 window.adventureMapPage=function(){
  if(rerunActive(state))return rerunAdventureMapPage();
  return typeof firstRunOwners.adventureMapPage==="function"?firstRunOwners.adventureMapPage():"";
 };
 if(typeof firstRunOwners.adventurePreparePage==="function")window.adventurePreparePage=rerunAdventurePreparePage;
 if(typeof firstRunOwners.adventureCombatPage==="function")window.adventureCombatPage=rerunAdventureCombatPage;
})();
