(function(){
 const VERSION=1;
 function currentPhase(target=null){
  const s=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);
  return typeof window.currentWorldPhase==="function"?window.currentWorldPhase(s):(s?.thirdWorld?.entered===true?3:(s?.secondWorld?.entered===true?2:1));
 }
 function modeVisible(mode,target=null){
  const key=String(mode||"");
  if(currentPhase(target)!==3)return true;
  return key!=="bounty";
 }
 function resourceSnapshot(target=null){
  const s=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);
  if(typeof window.primaryWorldResourceSnapshot==="function")return window.primaryWorldResourceSnapshot(s);
  if(currentPhase(s)===3)return {label:"維度之弦",amount:Math.max(0,Math.floor(Number(s?.thirdWorld?.dimensionalStrings)||0)),secondaryLabel:null,secondaryAmount:0};
  if(currentPhase(s)===2)return {label:"暗物質",amount:Math.max(0,Math.floor(Number(s?.secondWorld?.darkMatter)||0)),secondaryLabel:"暗能量",secondaryAmount:Math.max(0,Math.floor(Number(s?.secondWorld?.darkEnergy)||0))};
  return {label:"金幣",amount:Math.max(0,Math.floor(Number(s?.gold)||0)),secondaryLabel:null,secondaryAmount:0};
 }
 function syncStatusResource(main){
  if(currentPhase()!==3||!main)return false;
  const status=main.querySelector("#dungeon-home-status, #dungeon-status");
  const cell=status?.children?.[2];if(!cell)return false;
  const label=cell.querySelector("span"),value=cell.querySelector("strong"),resource=resourceSnapshot();
  if(label)label.textContent=resource.label||"維度之弦";
  if(value)value.textContent=Math.max(0,Math.floor(Number(resource.amount)||0)).toLocaleString();
  return true;
 }
 function syncDungeonPage(context={}){
  if(currentPhase()!==3)return false;
  const main=context.main||document.getElementById("main");if(!main)return false;
  syncStatusResource(main);
  if(String(context.view||"")==="dungeon")main.querySelector(".dungeon-mode-bounty")?.remove();
  if(String(context.view||"")==="dungeon-bounty")setTimeout(()=>{if(typeof go==="function")go("dungeon");},0);
  return true;
 }
 function navigationGuard(nextView){
  if(currentPhase()!==3||String(nextView||"")!=="dungeon-bounty")return true;
  if(typeof alert==="function")alert("高維紀元已關閉懸賞戰。競技場、鏡像戰與虛空仍可使用。");
  setTimeout(()=>{if(typeof go==="function")go("dungeon");},0);
  return false;
 }
 window.THIRD_WORLD_DUNGEON_UI_VERSION=VERSION;
 window.thirdWorldDungeonModeVisible=modeVisible;
 window.thirdWorldDungeonResourceSnapshot=resourceSnapshot;
 window.syncThirdWorldDungeonUi=syncDungeonPage;
 if(typeof window.registerDungeonPostRenderHook==="function")window.registerDungeonPostRenderHook(syncDungeonPage);
 if(typeof window.registerDungeonNavigationGuard==="function")window.registerDungeonNavigationGuard(navigationGuard);
})();