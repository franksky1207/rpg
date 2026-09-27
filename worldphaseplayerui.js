(function(){
 const VERSION=1;
 const legacyHomePage=typeof window.homePage==="function"?window.homePage:null;
 const legacyAdventurePage=typeof window.adventurePage==="function"?window.adventurePage:null;
 const legacyGo=typeof window.go==="function"?window.go:null;

 function phase(target=state){
  if(typeof window.currentWorldPhase!=="function")return 1;
  const value=Number(window.currentWorldPhase(target));
  return value===2||value===3?value:1;
 }
 function phaseMeta(target=state){
  const current=phase(target);
  return typeof window.worldPhaseMeta==="function"?window.worldPhaseMeta(current):null;
 }
 function replaceOnce(html,from,to){return String(html||"").replace(from,to);}

 function phaseAwareHomePage(){
  if(!legacyHomePage)return `<section class="home-screen"><div class="notice"><b>主畫面介面尚未載入。</b></div></section>`;
  let html=legacyHomePage();
  if(phase()!==3)return html;
  html=replaceOnce(html,"打怪、升級、換裝，前往更強的地圖。","攻略高維存在，推進第三紀元正式戰線。");
  html=replaceOnce(html,"進入宇宙主線並挑戰 Boss","進入高維戰線，攻略十名高維存在");
  html=replaceOnce(html,"挑戰懸賞、競技場與虛空幻境","挑戰鏡像戰、虛空與已開放副本");
  html=replaceOnce(html,"討伐宇宙文明級威脅並提升文明等級","回顧舊紀元文明災厄");
  return html;
 }

 function thirdWorldAdventureFallback(){
  if(typeof window.wrapFunctionPage==="function")return window.wrapFunctionPage(`<div class="card"><h2>高維戰線</h2><div class="notice"><b>高維正式玩家介面尚未載入。</b><div class="muted" style="margin-top:6px">高維紀元已由共用世界路由正確接管；十王正式玩家 UI 將由第三紀元介面 owner 提供。</div></div></div>`);
  return `<section class="map-screen"><div class="page-top"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button><h2 class="page-title">高維戰線</h2><span></span></div><div class="notice"><b>高維正式玩家介面尚未載入。</b></div></section>`;
 }
 function phaseAwareAdventurePage(){
  const current=phase();
  if(current===3)return typeof window.thirdWorldAdventurePageHtml==="function"?window.thirdWorldAdventurePageHtml():thirdWorldAdventureFallback();
  return legacyAdventurePage?legacyAdventurePage():`<section class="map-screen"><div class="notice"><b>冒險介面尚未載入。</b></div></section>`;
 }

 function phaseAwareGo(view){
  if(!legacyGo)return false;
  const result=legacyGo(view);
  if(view==="adventure"&&phase()===3&&typeof window.cancelSecondWorldAdventureProgressFocus==="function")window.cancelSecondWorldAdventureProgressFocus();
  return result;
 }

 function snapshot(target=state){
  const current=phase(target),meta=phaseMeta(target);
  return Object.freeze({phase:current,id:String(meta?.id||""),name:String(meta?.name||""),adventureOwner:current===3?"thirdworldui":"legacy"});
 }
 function validate(){
  const errors=[];
  if(typeof window.currentWorldPhase!=="function")errors.push("WORLD_PHASE_OWNER_MISSING");
  if(typeof legacyHomePage!=="function")errors.push("LEGACY_HOME_PAGE_MISSING");
  if(typeof legacyAdventurePage!=="function")errors.push("LEGACY_ADVENTURE_PAGE_MISSING");
  if(typeof legacyGo!=="function")errors.push("LEGACY_GO_MISSING");
  return Object.freeze({version:VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }

 window.homePage=phaseAwareHomePage;
 window.adventurePage=phaseAwareAdventurePage;
 window.go=phaseAwareGo;
 window.playerWorldPhaseUiSnapshot=snapshot;
 window.validatePlayerWorldPhaseUiRouting=validate;
 window.PLAYER_WORLD_PHASE_UI_VERSION=VERSION;
 window.PLAYER_WORLD_PHASE_ADVENTURE_ROUTING_VERSION=1;
 window.PLAYER_WORLD_PHASE_HOME_COPY_VERSION=1;
 window.PLAYER_WORLD_PHASE_UI_INTEGRITY=validate();

 if(typeof window.render==="function")window.render();
})();
