(function(){
 const VERSION=7;
 const WORLD_PHASE_OWNER_VERSION=1;
 const policies=new Map();
 function currentPhase(target=null){
  const s=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);
  if(typeof window.currentWorldPhase!=="function")throw new Error("Canonical world phase owner unavailable.");
  const phase=Number(window.currentWorldPhase(s));
  if(phase!==1&&phase!==2&&phase!==3)throw new Error("Canonical world phase owner returned an invalid phase.");
  return phase;
 }
 function registerPolicy(name,checker){const key=String(name||"").trim();if(!key||typeof checker!=="function")return false;policies.set(key,checker);return true;}
 function unregisterPolicy(name){return policies.delete(String(name||"").trim());}
 function availability(mode,target=null){
  const key=String(mode||""),s=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);
  const result={mode:key,visible:true,enabled:true,buttonLabel:"",statusText:"",reason:"",titleText:null,rewardText:null,unlockText:null,descriptionText:null,phase:currentPhase(s)};
  policies.forEach((checker,name)=>{try{const next=checker(key,s,{...result});if(!next||typeof next!=="object")return;if(next.visible===false)result.visible=false;if(next.enabled===false)result.enabled=false;if(typeof next.buttonLabel==="string"&&next.buttonLabel)result.buttonLabel=next.buttonLabel;if(typeof next.statusText==="string"&&next.statusText)result.statusText=next.statusText;if(typeof next.reason==="string"&&next.reason)result.reason=next.reason;["titleText","rewardText","unlockText","descriptionText"].forEach(key=>{if(Object.prototype.hasOwnProperty.call(next,key)&&(next[key]===null||typeof next[key]==="string"))result[key]=next[key];});}catch(error){console.error("Dungeon mode availability policy failed",name,error);result.enabled=false;result.reason="副本狀態檢查失敗，請重新整理後再試。";}});
  if(result.visible===false)result.enabled=false;
  return result;
 }
 function thirdWorldPolicy(mode,target){
  if(currentPhase(target)!==3)return null;
  if(mode==="bounty")return {visible:false,enabled:false,reason:"高維紀元已關閉懸賞戰。"};
  if(mode==="arena")return {visible:true,enabled:true,titleText:"高維競技場",rewardText:"VIP 積分",unlockText:"高維紀元可挑戰",descriptionText:"選擇定相或異相競技場，完成三戰取得 VIP 積分。",buttonLabel:"進入高維競技場"};
  if(mode==="tower")return {visible:true,enabled:true,unlockText:"高維紀元可挑戰"};
  if(mode==="mirror")return {visible:true,enabled:true,unlockText:"高維紀元可挑戰"};
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
 function setCardVisibility(card,visible){
  if(!card)return false;
  const show=visible!==false;
  card.hidden=!show;
  if(show){card.style.removeProperty("display");delete card.dataset.dungeonPolicyHidden;}
  else{card.style.setProperty("display","none","important");card.dataset.dungeonPolicyHidden="1";}
  return true;
 }
 function applyModeCardPolicy(main,mode,selector){
  const card=main?.querySelector(selector);if(!card)return false;
  const policy=availability(mode);
  setCardVisibility(card,policy.visible!==false);
  if(policy.visible===false)return true;
  const button=card.querySelector(".dungeon-entry-btn"),cost=card.querySelector(".dungeon-cost"),title=card.querySelector(".dungeon-mode-head h3"),reward=card.querySelector(".dungeon-mode-reward"),unlock=card.querySelector(".dungeon-unlock-label"),description=card.querySelector("p");
  if(policy.titleText!==null&&title)title.textContent=policy.titleText;
  if(policy.rewardText!==null&&reward)reward.textContent=policy.rewardText;
  if(policy.descriptionText!==null&&description)description.textContent=policy.descriptionText;
  if(policy.unlockText!==null&&unlock){unlock.textContent=policy.unlockText;unlock.hidden=!policy.unlockText;}
  let note=card.querySelector("[data-dungeon-policy-note]");
  if(policy.enabled===false){
   card.classList.add("locked");
   if(button){button.disabled=true;button.onclick=null;button.removeAttribute("onclick");if(policy.buttonLabel)button.textContent=policy.buttonLabel;}
   if(policy.statusText&&cost)cost.textContent=policy.statusText;
   if(policy.reason){if(!note){note=document.createElement("div");note.dataset.dungeonPolicyNote="1";note.className="muted";note.style.marginTop="8px";note.style.lineHeight="1.5";cost?.insertAdjacentElement("afterend",note);}note.textContent=policy.reason;}
  }else{
   card.classList.remove("locked");
   if(note)note.remove();
   if(button){button.disabled=false;if(policy.buttonLabel)button.textContent=policy.buttonLabel;}
  }
  return true;
 }
 function syncMirrorCardPolicy(main){
  if(currentPhase()!==3)return false;
  const card=main?.querySelector("[data-mirror-dungeon-card], .dungeon-mode-mirror");if(!card)return false;
  const policy=availability("mirror"),unlock=card.querySelector(".dungeon-unlock-label");
  setCardVisibility(card,policy.visible!==false);
  if(unlock&&policy.unlockText!==null){unlock.textContent=policy.unlockText||"";unlock.hidden=!policy.unlockText;}
  return true;
 }
 function syncHomePage(main){
  if(!main||currentPhase()!==3)return false;
  const cards=Array.from(main.querySelectorAll(".menu-card"));
  const dungeon=cards.find(card=>(card.getAttribute("onclick")||"").includes("go('dungeon')"));
  const desc=dungeon?.querySelector("span");if(desc)desc.textContent="挑戰高維競技場、鏡像戰與虛空幻境";
  return true;
 }
 function syncReturnNavigation(main,viewName){
  if(!main||currentPhase()!==3||!String(viewName||"").startsWith("dungeon"))return false;
  const homeButton=String(viewName)==="dungeon"?main.querySelector(".back-home .back-btn"):null;
  if(homeButton){homeButton.textContent="← 返回主頁";homeButton.setAttribute("onclick","go('home')");}
  if(String(viewName)!=="dungeon")main.querySelectorAll("button").forEach(button=>{const click=button.getAttribute("onclick")||"",text=button.textContent.trim();if(click.includes("go('dungeon')")||text==="返回副本"||text==="← 返回副本"||text==="返回副本列表"||text==="← 返回副本列表")button.textContent=text.startsWith("←")?"← 返回副本列表":"返回副本列表";});
  return true;
 }
 function syncDungeonPage(context={}){
  const main=context.main||document.getElementById("main"),viewName=String(context.view||"");if(!main)return false;
  syncStatusResource(main);
  if(viewName==="dungeon"){
   applyModeCardPolicy(main,"bounty",".dungeon-mode-bounty");
   applyModeCardPolicy(main,"arena",".dungeon-mode-arena");
   applyModeCardPolicy(main,"tower",".dungeon-mode-tower");
   syncMirrorCardPolicy(main);
  }else if(viewName==="home")syncHomePage(main);
  syncReturnNavigation(main,viewName);
  return true;
 }
 function blockedMessage(mode){const policy=availability(mode);return policy.reason||"此副本目前無法挑戰。";}
 function navigationPolicy(nextView,target=null){
  const phase=currentPhase(target),next=String(nextView||"");
  const mapping={"dungeon-bounty":"bounty","dungeon-arena":"arena","dungeon-void-mirage":"tower"},mode=mapping[next];
  if(!mode)return {allowed:true,redirect:null,reason:"",mode:null,phase};
  const policy=availability(mode,target);if(policy.visible!==false&&policy.enabled!==false)return {allowed:true,redirect:null,reason:"",mode,phase};
  return {allowed:false,redirect:"dungeon",reason:policy.reason||"此副本目前無法挑戰。",mode,phase};
 }
 function navigationGuard(nextView){
  const decision=navigationPolicy(nextView);if(decision.allowed)return true;
  if(typeof alert==="function")alert(decision.reason);
  if(decision.redirect)setTimeout(()=>{if(typeof go==="function")go(decision.redirect);},0);
  return false;
 }
 function wrapEntry(name,mode){
  const base=window[name];if(typeof base!=="function"||base.__dungeonPolicyWrapped===true)return false;
  const wrapped=function(...args){const policy=availability(mode);if(policy.visible===false||policy.enabled===false){if(typeof alert==="function")alert(blockedMessage(mode));return false;}return base.apply(this,args);};
  wrapped.__dungeonPolicyWrapped=true;window[name]=wrapped;return true;
 }
 registerPolicy("third-world",thirdWorldPolicy);
 window.DUNGEON_MODE_AVAILABILITY_POLICY_VERSION=5;
 window.DUNGEON_MODE_PRESENTATION_POLICY_VERSION=4;
 window.registerDungeonModeAvailabilityPolicy=registerPolicy;
 window.unregisterDungeonModeAvailabilityPolicy=unregisterPolicy;
 window.dungeonModeAvailability=availability;
 window.THIRD_WORLD_DUNGEON_UI_VERSION=VERSION;
 window.THIRD_WORLD_DUNGEON_WORLD_PHASE_OWNER_VERSION=WORLD_PHASE_OWNER_VERSION;
 window.THIRD_WORLD_DUNGEON_ERA_POLICY_OWNER="thirdworlddungeonui";
 window.THIRD_WORLD_DUNGEON_LEGACY_PRESENTATION_RETIRED_VERSION=1;
 window.THIRD_WORLD_ARENA_LIVE_VERSION=1;
 window.THIRD_WORLD_DUNGEON_HOME_POLICY_VERSION=2;
 window.THIRD_WORLD_DUNGEON_RESOURCE_BAR_VERSION=1;
 window.THIRD_WORLD_DUNGEON_RETURN_NAV_VERSION=1;
 window.THIRD_WORLD_DUNGEON_BOUNTY_HIDDEN_VERSION=2;
 window.THIRD_WORLD_DUNGEON_CALAMITY_REVIEW_VERSION=1;
 window.THIRD_WORLD_DUNGEON_ARENA_COPY_VERSION=2;
 window.THIRD_WORLD_DUNGEON_INITIAL_SYNC_VERSION=1;
 window.thirdWorldDungeonModeVisible=function(mode,target=null){return availability(mode,target).visible!==false;};
 window.thirdWorldDungeonResourceSnapshot=resourceSnapshot;
 window.thirdWorldDungeonNavigationPolicy=navigationPolicy;
 window.syncThirdWorldDungeonUi=syncDungeonPage;
 wrapEntry("enterBountyDungeon","bounty");
 wrapEntry("openArenaDungeon","arena");
 wrapEntry("startArenaDungeon","arena");
 wrapEntry("startArenaStageFight","arena");
 wrapEntry("enterVoidMirageDungeon","tower");
 if(typeof window.registerDungeonPostRenderHook==="function")window.registerDungeonPostRenderHook(syncDungeonPage);
 if(typeof window.registerDungeonNavigationGuard==="function")window.registerDungeonNavigationGuard(navigationGuard);
 setTimeout(()=>{try{syncDungeonPage({view:typeof view==="undefined"?"":view,main:document.getElementById("main")});}catch(error){console.error("Third World dungeon initial sync failed",error);}},0);
})();
