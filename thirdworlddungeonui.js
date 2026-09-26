(function(){
 const VERSION=1;
 const policies=new Map();
 function currentPhase(target=null){
  const s=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);
  return typeof window.currentWorldPhase==="function"?window.currentWorldPhase(s):(s?.thirdWorld?.entered===true?3:(s?.secondWorld?.entered===true?2:1));
 }
 function registerPolicy(name,checker){const key=String(name||"").trim();if(!key||typeof checker!=="function")return false;policies.set(key,checker);return true;}
 function unregisterPolicy(name){return policies.delete(String(name||"").trim());}
 function availability(mode,target=null){
  const key=String(mode||""),s=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);
  const result={mode:key,visible:true,enabled:true,buttonLabel:"",statusText:"",reason:"",phase:currentPhase(s)};
  policies.forEach((checker,name)=>{try{const next=checker(key,s,{...result});if(!next||typeof next!=="object")return;if(next.visible===false)result.visible=false;if(next.enabled===false)result.enabled=false;if(typeof next.buttonLabel==="string"&&next.buttonLabel)result.buttonLabel=next.buttonLabel;if(typeof next.statusText==="string"&&next.statusText)result.statusText=next.statusText;if(typeof next.reason==="string"&&next.reason)result.reason=next.reason;}catch(error){console.error("Dungeon mode availability policy failed",name,error);result.enabled=false;result.reason="副本狀態檢查失敗，請重新整理後再試。";}});
  if(result.visible===false)result.enabled=false;
  return result;
 }
 function thirdWorldPolicy(mode,target){
  if(currentPhase(target)!==3)return null;
  if(mode==="bounty")return {visible:false,enabled:false,reason:"高維紀元已關閉懸賞戰。"};
  if(mode==="arena")return {visible:true,enabled:false,buttonLabel:"等待高維競技場開放",statusText:"高維競技場調整中",reason:"高維紀元競技場規則與戰力曲線尚未定案，既有競技場進度已完整保留。"};
  return {visible:true,enabled:true};
 }
 function resourceSnapshot(target=null){
  const s=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);
  if(typeof window.primaryWorldResourceSnapshot==="function")return window.primaryWorldResourceSnapshot(s);
  if(currentPhase(s)===3)return {label:"維度之弦",amount:Math.max(0,Math.floor(Number(s?.thirdWorld?.dimensionalStrings)||0)),secondaryLabel:null,secondaryAmount:0};
  if(currentPhase(s)===2)return {label:"暗物質",amount:Math.max(0,Math.floor(Number(s?.secondWorld?.darkMatter)||0)),secondaryLabel:"暗能量",secondaryAmount:Math.max(0,Math.floor(Number(s?.secondWorld?.darkEnergy)||0))};
  return {label:"金幣",amount:Math.max(0,Math.floor(Number(s?.gold)||0)),secondaryLabel:null,secondaryAmount:0};
 }
 function syncStatusResource(main){
  if(!main)return false;
  const status=main.querySelector("#dungeon-home-status, #dungeon-status"),cell=status?.children?.[2];if(!cell)return false;
  const label=cell.querySelector("span"),value=cell.querySelector("strong"),resource=resourceSnapshot();
  if(label)label.textContent=resource.label||"資源";
  if(value)value.textContent=Math.max(0,Math.floor(Number(resource.amount)||0)).toLocaleString();
  return true;
 }
 function applyModeCardPolicy(main,mode,selector){
  const card=main?.querySelector(selector);if(!card)return false;
  const policy=availability(mode);
  card.hidden=policy.visible===false;
  if(policy.visible===false)return true;
  const button=card.querySelector(".dungeon-entry-btn"),cost=card.querySelector(".dungeon-cost");
  let note=card.querySelector("[data-dungeon-policy-note]");
  if(policy.enabled===false){
   card.classList.add("locked");
   if(button){button.disabled=true;button.onclick=null;button.removeAttribute("onclick");if(policy.buttonLabel)button.textContent=policy.buttonLabel;}
   if(policy.statusText&&cost)cost.textContent=policy.statusText;
   if(policy.reason){if(!note){note=document.createElement("div");note.dataset.dungeonPolicyNote="1";note.className="muted";note.style.marginTop="8px";note.style.lineHeight="1.5";cost?.insertAdjacentElement("afterend",note);}note.textContent=policy.reason;}
  }
  return true;
 }
 function syncDungeonPage(context={}){
  const main=context.main||document.getElementById("main");if(!main)return false;
  syncStatusResource(main);
  if(String(context.view||"")==="dungeon"){
   applyModeCardPolicy(main,"bounty",".dungeon-mode-bounty");
   applyModeCardPolicy(main,"arena",".dungeon-mode-arena");
   applyModeCardPolicy(main,"tower",".dungeon-mode-tower");
  }
  return true;
 }
 function blockedMessage(mode){const policy=availability(mode);return policy.reason||"此副本目前無法挑戰。";}
 function navigationGuard(nextView){
  const mapping={"dungeon-bounty":"bounty","dungeon-arena":"arena","dungeon-void-mirage":"tower"},mode=mapping[String(nextView||"")];if(!mode)return true;
  const policy=availability(mode);if(policy.visible!==false&&policy.enabled!==false)return true;
  if(typeof alert==="function")alert(blockedMessage(mode));
  setTimeout(()=>{if(typeof go==="function")go("dungeon");},0);
  return false;
 }
 function wrapEntry(name,mode){
  const base=window[name];if(typeof base!=="function"||base.__dungeonPolicyWrapped===true)return false;
  const wrapped=function(...args){const policy=availability(mode);if(policy.visible===false||policy.enabled===false){if(typeof alert==="function")alert(blockedMessage(mode));return false;}return base.apply(this,args);};
  wrapped.__dungeonPolicyWrapped=true;window[name]=wrapped;return true;
 }
 registerPolicy("third-world",thirdWorldPolicy);
 window.DUNGEON_MODE_AVAILABILITY_POLICY_VERSION=1;
 window.registerDungeonModeAvailabilityPolicy=registerPolicy;
 window.unregisterDungeonModeAvailabilityPolicy=unregisterPolicy;
 window.dungeonModeAvailability=availability;
 window.THIRD_WORLD_DUNGEON_UI_VERSION=VERSION;
 window.THIRD_WORLD_ARENA_PROVISIONAL_GATE_VERSION=1;
 window.thirdWorldDungeonModeVisible=function(mode,target=null){return availability(mode,target).visible!==false;};
 window.thirdWorldDungeonResourceSnapshot=resourceSnapshot;
 window.syncThirdWorldDungeonUi=syncDungeonPage;
 wrapEntry("enterBountyDungeon","bounty");
 wrapEntry("openArenaDungeon","arena");
 wrapEntry("startArenaDungeon","arena");
 wrapEntry("startArenaStageFight","arena");
 wrapEntry("enterVoidMirageDungeon","tower");
 if(typeof window.registerDungeonPostRenderHook==="function")window.registerDungeonPostRenderHook(syncDungeonPage);
 if(typeof window.registerDungeonNavigationGuard==="function")window.registerDungeonNavigationGuard(navigationGuard);
})();