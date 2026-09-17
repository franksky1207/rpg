(()=>{
 let overlay=null;
 let overlayMode="running";
 let clockTimer=null;
 let clockStartTimer=null;
 let currentPointerId=null;
 let dragStartX=0;
 let dragMax=0;
 let dragThreshold=0;
 let dragX=0;
 let unsubscribeEnvironment=null;

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

 function syncValues(){
  if(!overlay)return;
  if(overlayMode==="running"&&!isMainContinuousCombat()){
   closeMainPowerSave();
   return;
  }
  const encounter=currentEncounter();
  const time=overlay.querySelector("[data-main-power-save-clock]");
  const enemy=overlay.querySelector("[data-main-power-save-enemy]");
  const round=overlay.querySelector("[data-main-power-save-round]");
  const level=overlay.querySelector("[data-main-power-save-level]");
  const exp=overlay.querySelector("[data-main-power-save-exp]");
  const gold=overlay.querySelector("[data-main-power-save-gold]");
  if(time)time.textContent=formatClock();
  if(enemy&&overlayMode==="running")enemy.textContent=encounter?`${encounter.name}　Lv.${encounter.level}`:"戰鬥中";
  if(round)round.textContent=`第 ${Math.max(1,Math.floor(Number(combatRound)||1))} 場`;
  if(level)level.textContent=Number(state?.level)>=Number(MAX_LEVEL)?`Lv.${MAX_LEVEL} MAX`:`Lv.${state.level}`;
  if(exp)exp.textContent=`EXP　${expText()}`;
  if(gold)gold.textContent=`金幣　${Math.max(0,Math.floor(Number(state?.gold)||0)).toLocaleString()}`;
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
  const status=overlay.querySelector("[data-main-power-save-status]");
  const note=overlay.querySelector("[data-main-power-save-note]");
  const slider=overlay.querySelector(".main-power-save-slider");
  const sliderText=overlay.querySelector(".main-power-save-slider-text");
  const knob=overlay.querySelector(".main-power-save-knob");
  const copy=sliderCopyForMode(overlayMode);
  if(status){
   status.classList.toggle("is-stopped",overlayMode==="stopped");
   status.classList.toggle("is-complete",overlayMode==="story");
   status.textContent=overlayMode==="story"?"戰鬥已完成":overlayMode==="stopped"?"戰鬥已停止":"戰鬥持續進行中";
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
  const knob=overlay.querySelector(".main-power-save-knob");
  const text=overlay.querySelector(".main-power-save-slider-text");
  if(knob){knob.classList.remove("dragging","ready");knob.style.transform="translateX(0px)";}
  if(text)text.style.opacity="1";
  currentPointerId=null;dragStartX=0;dragMax=0;dragThreshold=0;dragX=0;
 }

 function closeMainPowerSave(){
  if(!overlay)return;
  stopClock();
  stopEnvironmentWatch();
  document.body.classList.remove("main-power-save-open");
  const old=overlay;
  overlay=null;
  overlayMode="running";
  old.classList.remove("show");
  setTimeout(()=>old.remove(),250);
 }

 function finishDrag(ev){
  if(!overlay||currentPointerId===null||ev.pointerId!==currentPointerId)return;
  const knob=overlay.querySelector(".main-power-save-knob");
  const success=dragThreshold>0&&dragX>=dragThreshold;
  try{knob?.releasePointerCapture(currentPointerId);}catch(e){}
  currentPointerId=null;
  if(success){closeMainPowerSave();return;}
  resetSlider();
 }

 function wireSlider(){
  if(!overlay)return;
  const slider=overlay.querySelector(".main-power-save-slider");
  const knob=overlay.querySelector(".main-power-save-knob");
  const text=overlay.querySelector(".main-power-save-slider-text");
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
   setTimeout(closeMainPowerSave,120);
  });
 }

 function ensureCombatHeader(options={}){
  if(overlay)setTimeout(syncValues,0);
  if(options?.continuous!==true)return false;
  const head=document.querySelector(".combat-screen>.combat-head");
  if(!head)return false;
  if(head.classList.contains("main-power-save-head"))return true;
  const labelText=head.textContent||"連續戰鬥";
  head.classList.add("main-power-save-head");
  head.textContent="";
  const label=document.createElement("span");
  label.className="main-power-save-head-label";
  label.textContent=labelText;
  const button=document.createElement("button");
  button.type="button";
  button.className="main-power-save-enter";
  button.textContent="極簡模式";
  button.addEventListener("click",openMainPowerSave);
  head.append(label,button);
  return true;
 }

 function handleBattleResult(ctx){
  if(!overlay)return false;
  applyOverlayMode(ctx?.pendingStoryId?"story":"stopped");
  return true;
 }

 function handleSpecialResult(ctx,special,result){
  if(!overlay||result?.win!==false)return false;
  applyOverlayMode("stopped");
  return true;
 }

 function openMainPowerSave(){
  if(overlay||!isMainContinuousCombat())return false;
  overlayMode="running";
  overlay=document.createElement("div");
  overlay.id="mainPowerSaveOverlay";
  overlay.setAttribute("role","dialog");
  overlay.setAttribute("aria-modal","true");
  overlay.setAttribute("aria-label","極簡模式");
  overlay.innerHTML=`<div class="main-power-save-shell">
    <div class="main-power-save-clock" data-main-power-save-clock>${formatClock()}</div>
    <div class="main-power-save-center">
      <div class="main-power-save-block"><div class="main-power-save-label">目前敵人</div><div class="main-power-save-value" data-main-power-save-enemy>戰鬥中</div></div>
      <div class="main-power-save-block"><div class="main-power-save-label">連續戰鬥</div><div class="main-power-save-value" data-main-power-save-round>第 1 場</div></div>
      <div class="main-power-save-block"><div class="main-power-save-label">角色</div><div class="main-power-save-value" data-main-power-save-level>Lv.${state.level}</div></div>
      <div class="main-power-save-block main-power-save-stats"><div data-main-power-save-exp>EXP　${expText()}</div><div data-main-power-save-gold>金幣　${Math.max(0,Math.floor(Number(state.gold)||0)).toLocaleString()}</div></div>
      <div class="main-power-save-state" aria-live="polite"><div class="main-power-save-status" data-main-power-save-status>戰鬥持續進行中</div><div class="main-power-save-note" data-main-power-save-note hidden></div></div>
    </div>
    <div class="main-power-save-exit-wrap"><div class="main-power-save-slider" aria-label="滑動退出極簡模式"><div class="main-power-save-slider-text">滑動退出極簡模式</div><button type="button" class="main-power-save-knob" aria-label="滑動退出極簡模式">›</button></div></div>
  </div>`;
  document.body.appendChild(overlay);
  document.body.classList.add("main-power-save-open");
  wireSlider();
  watchEnvironment();
  syncValues();
  startClock();
  requestAnimationFrame(()=>overlay?.classList.add("show"));
  return true;
 }

 window.openMainPowerSave=openMainPowerSave;
 window.closeMainPowerSave=closeMainPowerSave;
 window.syncMainPowerSave=syncValues;
 window.setMainPowerSaveState=applyOverlayMode;
 window.isMainPowerSaveOpen=()=>!!overlay;
 window.mainMinimalModeEnsureCombatHeader=ensureCombatHeader;
 window.mainMinimalModeHandleBattleResult=handleBattleResult;
 window.mainMinimalModeHandleSpecialResult=handleSpecialResult;
 window.mainMinimalModeBackgroundPolicy=()=>"follow-gm-background-setting";
 window.MAIN_MINIMAL_MODE_HOOK_VERSION=1;
 window.MAIN_MINIMAL_MODE_BACKGROUND_POLICY_VERSION=1;
})();