(()=>{
 let overlay=null;
 let overlayMode="running";
 let activeAdapterId="main";
 let clockTimer=null;
 let clockStartTimer=null;
 let currentPointerId=null;
 let dragStartX=0;
 let dragMax=0;
 let dragThreshold=0;
 let dragX=0;
 let unsubscribeEnvironment=null;
 const adapters=new Map();

 function isMainContinuousCombat(){
  const ctx=window.activeMainBattleContext;
  return typeof adventureScreen!=="undefined"&&adventureScreen==="combat"&&(ctx?.continuous===true||combatTotal===0||combatTotal===window.CONTINUOUS_BATTLE_COUNT);
 }

 function formatClock(){
  const d=new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
 }

 function currentEncounter(){
  if(typeof currentCombatEncounter!=="undefined"&&currentCombatEncounter)return currentCombatEncounter;
  if(typeof getPreviewEncounter==="function")return getPreviewEncounter(selectedMap,selectedEnemy);
  return typeof monsterObj==="function"?monsterObj(selectedMap,selectedEnemy):null;
 }

 function expText(){
  if(Number(state?.level)>=Number(MAX_LEVEL))return "MAX";
  const need=typeof expNeed==="function"?expNeed(state.level):0;
  return `${Number(state?.exp)||0} / ${Number(need)||0}`;
 }

 function resourceText(){const snap=typeof window.primaryWorldResourceSnapshot==="function"?window.primaryWorldResourceSnapshot():{label:"金幣",amount:Math.max(0,Math.floor(Number(state?.gold)||0))};return `${snap.label}　${Math.max(0,Math.floor(Number(snap.amount)||0)).toLocaleString()}`;}

 function mainContentHtml(){
  return `<div class="main-minimal-mode-block"><div class="main-minimal-mode-label">目前敵人</div><div class="main-minimal-mode-value" data-main-minimal-mode-enemy>戰鬥中</div></div>
      <div class="main-minimal-mode-block"><div class="main-minimal-mode-label">連續戰鬥</div><div class="main-minimal-mode-value" data-main-minimal-mode-round>第 1 場</div></div>
      <div class="main-minimal-mode-block"><div class="main-minimal-mode-label">角色</div><div class="main-minimal-mode-value" data-main-minimal-mode-level>Lv.${state.level}</div></div>
      <div class="main-minimal-mode-block main-minimal-mode-stats"><div data-main-minimal-mode-exp>EXP　${expText()}</div><div data-main-minimal-mode-gold>${resourceText()}</div></div>`;
 }

 function syncMainValues(root,mode){
  const encounter=currentEncounter();
  const enemy=root.querySelector("[data-main-minimal-mode-enemy]");
  const round=root.querySelector("[data-main-minimal-mode-round]");
  const level=root.querySelector("[data-main-minimal-mode-level]");
  const exp=root.querySelector("[data-main-minimal-mode-exp]");
  const gold=root.querySelector("[data-main-minimal-mode-gold]");
  if(enemy&&mode==="running")enemy.textContent=encounter?`${encounter.name}　Lv.${encounter.level}`:"戰鬥中";
  if(round)round.textContent=`第 ${Math.max(1,Math.floor(Number(combatRound)||1))} 場`;
  if(level)level.textContent=Number(state?.level)>=Number(MAX_LEVEL)?`Lv.${MAX_LEVEL} MAX`:`Lv.${state.level}`;
  if(exp)exp.textContent=`EXP　${expText()}`;
  if(gold)gold.textContent=resourceText();
 }

 adapters.set("main",{
  isActive:isMainContinuousCombat,
  runningStatus:"戰鬥持續進行中",
  centerClass:"",
  contentHtml:mainContentHtml,
  sync:syncMainValues
 });

 function getActiveAdapter(){return adapters.get(activeAdapterId)||adapters.get("main");}

 function registerMinimalModeAdapter(id,adapter){
  const key=String(id||"").trim();
  if(!key||key==="main"||!adapter||typeof adapter!=="object")return false;
  if(typeof adapter.isActive!=="function"||typeof adapter.contentHtml!=="function"||typeof adapter.sync!=="function")return false;
  adapters.set(key,adapter);
  return true;
 }

 function syncValues(){
  if(!overlay)return;
  const adapter=getActiveAdapter();
  if(overlayMode==="running"&&typeof adapter?.isActive==="function"&&!adapter.isActive()){
   closeMainMinimalMode();
   return;
  }
  const time=overlay.querySelector("[data-main-minimal-mode-clock]");
  if(time)time.textContent=formatClock();
  if(typeof adapter?.sync==="function")adapter.sync(overlay,overlayMode);
 }

 function stopClock(){
  if(clockStartTimer){clearTimeout(clockStartTimer);clockStartTimer=null;}
  if(clockTimer){clearInterval(clockTimer);clockTimer=null;}
 }

 function startClock(){
  stopClock();
  const delay=60000-(Date.now()%60000)+30;
  clockStartTimer=setTimeout(()=>{
   clockStartTimer=null;
   if(!overlay)return;
   syncValues();
   clockTimer=setInterval(()=>{if(overlay)syncValues();},60000);
  },delay);
 }

 function watchEnvironment(){
  if(unsubscribeEnvironment){unsubscribeEnvironment();unsubscribeEnvironment=null;}
  if(typeof window.backgroundProgressOnEnvironmentChange!=="function")return;
  unsubscribeEnvironment=window.backgroundProgressOnEnvironmentChange(isBackground=>{
   if(!overlay)return;
   if(!isBackground){
    syncValues();
    if(!overlay.classList.contains("show"))requestAnimationFrame(()=>overlay?.classList.add("show"));
   }
  });
 }

 function stopEnvironmentWatch(){
  if(!unsubscribeEnvironment)return;
  unsubscribeEnvironment();
  unsubscribeEnvironment=null;
 }

 function sliderCopyForMode(mode){
  if(mode==="story")return {text:"滑動繼續",aria:"滑動繼續查看後續內容"};
  if(mode==="stopped")return {text:"滑動查看戰鬥結果",aria:"滑動查看戰鬥結果"};
  return {text:"滑動退出極簡模式",aria:"滑動退出極簡模式"};
 }

 function applyOverlayMode(mode){
  if(!overlay)return;
  overlayMode=mode==="story"?"story":mode==="stopped"?"stopped":"running";
  const adapter=getActiveAdapter();
  const status=overlay.querySelector("[data-main-minimal-mode-status]");
  const note=overlay.querySelector("[data-main-minimal-mode-note]");
  const slider=overlay.querySelector(".main-minimal-mode-slider");
  const sliderText=overlay.querySelector(".main-minimal-mode-slider-text");
  const knob=overlay.querySelector(".main-minimal-mode-knob");
  const copy=sliderCopyForMode(overlayMode);
  if(status){
   status.classList.toggle("is-stopped",overlayMode==="stopped");
   status.classList.toggle("is-complete",overlayMode==="story");
   status.textContent=overlayMode==="story"?"戰鬥已完成":overlayMode==="stopped"?"戰鬥已停止":String(adapter?.runningStatus||"戰鬥持續進行中");
  }
  if(note){
   note.textContent=overlayMode==="story"?"有新的劇情等待查看":"";
   note.hidden=overlayMode!=="story";
  }
  if(slider)slider.setAttribute("aria-label",copy.aria);
  if(sliderText)sliderText.textContent=copy.text;
  if(knob)knob.setAttribute("aria-label",copy.aria);
  resetSlider();
  syncValues();
 }

 function resetSlider(){
  if(!overlay)return;
  const knob=overlay.querySelector(".main-minimal-mode-knob");
  const text=overlay.querySelector(".main-minimal-mode-slider-text");
  if(knob){knob.classList.remove("dragging","ready");knob.style.transform="translateX(0px)";}
  if(text)text.style.opacity="1";
  currentPointerId=null;dragStartX=0;dragMax=0;dragThreshold=0;dragX=0;
 }

 function closeMainMinimalMode(){
  if(!overlay)return;
  stopClock();
  stopEnvironmentWatch();
  document.body.classList.remove("main-minimal-mode-open");
  const old=overlay;
  overlay=null;
  overlayMode="running";
  activeAdapterId="main";
  old.classList.remove("show");
  setTimeout(()=>old.remove(),250);
 }

 function finishDrag(ev){
  if(!overlay||currentPointerId===null||ev.pointerId!==currentPointerId)return;
  const knob=overlay.querySelector(".main-minimal-mode-knob");
  const success=dragThreshold>0&&dragX>=dragThreshold;
  try{knob?.releasePointerCapture(currentPointerId);}catch(e){}
  currentPointerId=null;
  if(success){closeMainMinimalMode();return;}
  resetSlider();
 }

 function wireSlider(){
  if(!overlay)return;
  const slider=overlay.querySelector(".main-minimal-mode-slider");
  const knob=overlay.querySelector(".main-minimal-mode-knob");
  const text=overlay.querySelector(".main-minimal-mode-slider-text");
  if(!slider||!knob)return;

  knob.addEventListener("pointerdown",ev=>{
   if(currentPointerId!==null)return;
   currentPointerId=ev.pointerId;
   dragStartX=ev.clientX;
   const sliderRect=slider.getBoundingClientRect();
   const knobRect=knob.getBoundingClientRect();
   dragMax=Math.max(0,sliderRect.width-knobRect.width-10);
   dragThreshold=dragMax*.78;
   dragX=0;
   knob.classList.add("dragging");
   knob.setPointerCapture(ev.pointerId);
   ev.preventDefault();
  });
  knob.addEventListener("pointermove",ev=>{
   if(currentPointerId===null||ev.pointerId!==currentPointerId)return;
   dragX=Math.max(0,Math.min(dragMax,ev.clientX-dragStartX));
   knob.style.transform=`translateX(${dragX}px)`;
   knob.classList.toggle("ready",dragX>=dragThreshold);
   if(text)text.style.opacity=String(Math.max(.12,1-(dragX/Math.max(1,dragMax))*.88));
  });
  knob.addEventListener("pointerup",finishDrag);
  knob.addEventListener("pointercancel",finishDrag);
  knob.addEventListener("lostpointercapture",ev=>{if(currentPointerId!==null&&ev.pointerId===currentPointerId)resetSlider();});
  knob.addEventListener("keydown",ev=>{
   if(ev.key!=="ArrowRight"&&ev.key!=="End")return;
   ev.preventDefault();
   const sliderRect=slider.getBoundingClientRect();
   const knobRect=knob.getBoundingClientRect();
   const max=Math.max(0,sliderRect.width-knobRect.width-10);
   knob.style.transform=`translateX(${max}px)`;
   if(text)text.style.opacity=".12";
   setTimeout(closeMainMinimalMode,120);
  });
 }

 function ensureCombatHeader(options={}){
  if(overlay&&activeAdapterId==="main")setTimeout(syncValues,0);
  if(options?.continuous!==true)return false;
  const head=document.querySelector(".combat-screen>.combat-head");
  if(!head)return false;
  if(head.classList.contains("main-minimal-mode-head"))return true;
  const labelText=head.textContent||"連續戰鬥";
  head.classList.add("main-minimal-mode-head");
  head.textContent="";
  const label=document.createElement("span");
  label.className="main-minimal-mode-head-label";
  label.textContent=labelText;
  const button=document.createElement("button");
  button.type="button";
  button.className="main-minimal-mode-enter";
  button.textContent="極簡模式";
  button.addEventListener("click",openMainMinimalMode);
  head.append(label,button);
  return true;
 }

 function handleBattleResult(ctx){
  if(!overlay||activeAdapterId!=="main")return false;
  applyOverlayMode(ctx?.pendingStoryId?"story":"stopped");
  return true;
 }

 function handleSpecialResult(ctx,special,result){
  if(!overlay||activeAdapterId!=="main"||result?.win!==false)return false;
  applyOverlayMode("stopped");
  return true;
 }

 function openMinimalMode(adapterId="main"){
  const key=String(adapterId||"main");
  const adapter=adapters.get(key);
  if(overlay||!adapter||typeof adapter.isActive!=="function"||!adapter.isActive())return false;
  activeAdapterId=key;
  overlayMode="running";
  const centerClass=["main-minimal-mode-center",String(adapter.centerClass||"").trim()].filter(Boolean).join(" ");
  const content=String(adapter.contentHtml()||"");
  overlay=document.createElement("div");
  overlay.id="mainMinimalModeOverlay";
  overlay.setAttribute("role","dialog");
  overlay.setAttribute("aria-modal","true");
  overlay.setAttribute("aria-label","極簡模式");
  overlay.dataset.minimalModeAdapter=key;
  overlay.innerHTML=`<div class="main-minimal-mode-shell">
    <div class="main-minimal-mode-clock" data-main-minimal-mode-clock>${formatClock()}</div>
    <div class="${centerClass}">
      ${content}
      <div class="main-minimal-mode-state" aria-live="polite"><div class="main-minimal-mode-status" data-main-minimal-mode-status>${String(adapter.runningStatus||"戰鬥持續進行中")}</div><div class="main-minimal-mode-note" data-main-minimal-mode-note hidden></div></div>
    </div>
    <div class="main-minimal-mode-exit-wrap"><div class="main-minimal-mode-slider" aria-label="滑動退出極簡模式"><div class="main-minimal-mode-slider-text">滑動退出極簡模式</div><button type="button" class="main-minimal-mode-knob" aria-label="滑動退出極簡模式">›</button></div></div>
  </div>`;
  document.body.appendChild(overlay);
  document.body.classList.add("main-minimal-mode-open");
  wireSlider();
  watchEnvironment();
  syncValues();
  startClock();
  requestAnimationFrame(()=>overlay?.classList.add("show"));
  return true;
 }

 function openMainMinimalMode(){return openMinimalMode("main");}
 function closeMinimalMode(){return closeMainMinimalMode();}
 function syncMinimalMode(){return syncValues();}
 function setMinimalModeState(mode){return applyOverlayMode(mode);}
 function isMinimalModeOpen(){return !!overlay;}
 function minimalModeBackgroundPolicy(){return "follow-gm-background-setting";}

 window.openMinimalMode=openMinimalMode;
 window.closeMinimalMode=closeMinimalMode;
 window.syncMinimalMode=syncMinimalMode;
 window.setMinimalModeState=setMinimalModeState;
 window.isMinimalModeOpen=isMinimalModeOpen;
 window.registerMinimalModeAdapter=registerMinimalModeAdapter;
 window.getMinimalModeAdapterId=()=>overlay?activeAdapterId:null;

 // Main-specific aliases remain during the compatibility transition.
 window.openMainMinimalMode=openMainMinimalMode;
 window.closeMainMinimalMode=closeMinimalMode;
 window.syncMainMinimalMode=syncMinimalMode;
 window.setMainMinimalModeState=setMinimalModeState;
 window.isMainMinimalModeOpen=isMinimalModeOpen;
 window.mainMinimalModeEnsureCombatHeader=ensureCombatHeader;
 window.mainMinimalModeHandleBattleResult=handleBattleResult;
 window.mainMinimalModeHandleSpecialResult=handleSpecialResult;
 window.minimalModeBackgroundPolicy=minimalModeBackgroundPolicy;
 window.mainMinimalModeBackgroundPolicy=minimalModeBackgroundPolicy;
 window.MINIMAL_MODE_SHARED_API_VERSION=1;
 window.MAIN_MINIMAL_MODE_HOOK_VERSION=2;
 window.MAIN_MINIMAL_MODE_ADAPTER_VERSION=1;
 window.MAIN_MINIMAL_MODE_BACKGROUND_POLICY_VERSION=1;
})();