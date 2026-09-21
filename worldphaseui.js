(function(){
 const UI_VERSION=2;
 const IDS=Object.freeze({
  notice:"secondWorldUnlockNotice",
  requirements:"secondWorldRequirementsModal",
  confirm:"secondWorldConfirmModal",
  welcome:"secondWorldWelcomeModal"
 });

 function esc(v){return String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
 function ensureOverlay(id,className="world-phase-overlay"){
  let el=document.getElementById(id);
  if(el)return el;
  el=document.createElement("div");
  el.id=id;
  el.className=className;
  el.setAttribute("role","dialog");
  el.setAttribute("aria-modal","true");
  document.body.appendChild(el);
  return el;
 }
 function closeOverlay(id){
  const el=document.getElementById(id);
  if(el)el.classList.remove("open");
 }
 function req(){
  return typeof window.secondWorldEntryRequirements==="function"?window.secondWorldEntryRequirements():null;
 }
 function statusMark(ok){return ok?'<span class="world-phase-check ok">✓</span>':'<span class="world-phase-check pending">•</span>';}
 function requirementRowsHtml(r){
  if(!r)return '<div class="muted">突破條件資料尚未載入。</div>';
  return [
   {ok:r.level?.ok,label:"角色等級",value:`Lv.${Number(r.level?.current)||0} / Lv.${Number(r.level?.required)||500}`},
   {ok:r.mainline?.ok,label:"完成銀河紀元主線",value:r.mainline?.ok?"已完成":"尚未完成"},
   {ok:r.specializations?.ok,label:"專精全滿",value:`${Number(r.specializations?.completed)||0} / ${Number(r.specializations?.total)||8}`},
   {ok:r.enhancement?.ok,label:"五個裝備欄位強化 +20",value:`${Number(r.enhancement?.completed)||0} / ${Number(r.enhancement?.total)||5}`},
   {ok:r.marks?.ok,label:"十種印記 Lv.10",value:`${Number(r.marks?.completed)||0} / ${Number(r.marks?.total)||10}`}
  ].map(row=>`<div class="world-phase-requirement-row">${statusMark(row.ok)}<div class="world-phase-requirement-copy"><b>${esc(row.label)}</b><span>${esc(row.value)}</span></div></div>`).join("");
 }

 window.secondWorldHomeEntryHtml=function(){
  if(typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered())return "";
  const r=req();
  if(!r?.mainline?.bossCompleted)return "";
  const ready=r.eligible===true;
  return `<section class="world-phase-home-card">
   <div class="world-phase-home-copy">
    <div class="world-phase-kicker">新紀元</div>
    <h3>宇宙紀元</h3>
    <div class="world-phase-home-desc">${ready?"突破條件已全部完成。文明已準備跨越銀河疆界。":"銀河紀元主線已完成。完成所有突破條件後，即可正式進入宇宙紀元。"}</div>
    <div class="world-phase-progress">突破條件 <b>${Number(r.completed)||0} / ${Number(r.total)||5}</b></div>
   </div>
   <div class="world-phase-home-actions">
    <button class="btn" onclick="openSecondWorldRequirements()">查看突破條件</button>
    ${ready?'<button class="btn primary" onclick="openSecondWorldConfirmation()">進入宇宙紀元</button>':""}
   </div>
  </section>`;
 };

 window.openSecondWorldRequirements=function(){
  const r=req();
  const modal=ensureOverlay(IDS.requirements);
  modal.innerHTML=`<div class="world-phase-card world-phase-requirements-card">
   <div class="world-phase-modal-head">
    <div class="world-phase-kicker">銀河紀元 → 宇宙紀元</div>
    <h2>宇宙紀元突破條件</h2>
    <div class="muted">完成全部條件後，才可正式進入新的紀元。</div>
   </div>
   <div class="world-phase-requirement-list">${requirementRowsHtml(r)}</div>
   <div class="world-phase-modal-actions">
    <button class="btn" onclick="closeSecondWorldRequirements()">關閉</button>
    ${r?.eligible?'<button class="btn primary" onclick="closeSecondWorldRequirements();openSecondWorldConfirmation()">進入宇宙紀元</button>':""}
   </div>
  </div>`;
  modal.classList.add("open");
 };
 window.closeSecondWorldRequirements=function(){closeOverlay(IDS.requirements);};

 window.openSecondWorldConfirmation=function(){
  const r=req();
  if(!r?.eligible)return window.openSecondWorldRequirements();
  const modal=ensureOverlay(IDS.confirm);
  modal.innerHTML=`<div class="world-phase-card world-phase-confirm-card">
   <div class="world-phase-scroll">
    <div class="world-phase-modal-head">
     <div class="world-phase-kicker">不可逆世界突破</div>
     <h2>確定進入「宇宙紀元」？</h2>
    </div>
    <p>進入後將結束「銀河紀元」的正式成長，並開啟新的成長階段。</p>
    <div class="world-phase-info-block"><b>會保留</b><span>等級、VIP、所有裝備、專精、強化等級、印記、鏡像戰、虛空與歷史紀錄。</span></div>
    <div class="world-phase-info-block warning"><b>會清空</b><span>金幣、基礎／進階強化石、待贖回裝備、特殊遭遇，以及銀河紀元未結算的離線狀態。</span></div>
    <div class="world-phase-info-block speed"><b>宇宙紀元新功能</b><span>解鎖 <strong>1.5× 戰鬥速度</strong>，可於設定中自由切換。</span></div>
    <p class="world-phase-review-note">銀河紀元之後仍可回顧，但不再產生收益、損失或正式進度。</p>
    <div class="world-phase-danger-text">此操作無法復原。</div>
   </div>
   <div class="world-phase-modal-actions fixed">
    <button class="btn" onclick="closeSecondWorldConfirmation()">取消</button>
    <button id="secondWorldConfirmEnterButton" class="btn primary" onclick="confirmSecondWorldEntry()">進入宇宙紀元</button>
   </div>
  </div>`;
  modal.classList.add("open");
 };
 window.closeSecondWorldConfirmation=function(){closeOverlay(IDS.confirm);};
 window.confirmSecondWorldEntry=function(){
  const button=document.getElementById("secondWorldConfirmEnterButton");
  if(button)button.disabled=true;
  const result=typeof window.enterSecondWorld==="function"?window.enterSecondWorld():{ok:false,reason:"transition-owner-missing"};
  if(result?.ok===true)return true;
  if(button)button.disabled=false;
  const message=result?.reason==="requirements-incomplete"?"突破條件已變更，請重新確認。":result?.reason==="save-failed"?"世界轉換存檔失敗，原有進度已還原。":result?.reason==="backup-failed"?"無法建立安全備份，已取消世界轉換。":"世界轉換未完成，請稍後再試。";
  alert(message);
  return false;
 };

 function welcomeMarkerPresent(){try{return sessionStorage.getItem("civilization_second_world_just_entered_v1")==="1";}catch(e){return false;}}
 function clearWelcomeMarker(){try{sessionStorage.removeItem("civilization_second_world_just_entered_v1");}catch(e){}}
 window.showSecondWorldWelcome=function(){
  if(typeof window.isSecondWorldEntered!=="function"||!window.isSecondWorldEntered()||!welcomeMarkerPresent())return false;
  const modal=ensureOverlay(IDS.welcome);
  modal.innerHTML=`<div class="world-phase-card world-phase-welcome-card">
   <div class="world-phase-scroll">
    <div class="world-phase-modal-head welcome">
     <div class="world-phase-kicker">新紀元正式展開</div>
     <h2>歡迎來到「宇宙紀元」</h2>
    </div>
    <div class="world-phase-war-copy"><b>宇宙紀元，不再有銀河紀元的共存與協調。</b><span>從這一刻起，文明之間將進入全面戰爭。</span></div>
    <div class="world-phase-speed-unlock"><span>⚡</span><b>1.5× 戰鬥速度已解鎖</b><small>可於「設定」自由切換 1×／1.5× 戰鬥速度。</small></div>
    <h3 class="world-phase-section-title">宇宙紀元的新變化</h3>
    <div class="world-phase-change-list">
     <div><b>全新主線形式</b><span>不再有普通怪與菁英怪，主線將以連續 Boss 戰為核心。</span></div>
     <div><b>全新資源</b><span><strong>暗物質</strong>成為宇宙紀元的主要資源；<strong>暗能量</strong>將用於新的高階成長系統。</span></div>
     <div><b>新的成長階段</b><span>玩家、裝備與強化系統都將進入新的成長區間。</span></div>
     <div><b>文明等級開放</b><span>完成宇宙紀元的文明災厄，可持續提升文明力量。</span></div>
     <div><b>既有內容延續</b><span>鏡像戰與虛空進度完整保留；銀河紀元仍可進行回顧。</span></div>
    </div>
   </div>
   <div class="world-phase-modal-actions fixed">
    <button class="btn primary world-phase-start-button" onclick="closeSecondWorldWelcome()">開始宇宙紀元</button>
   </div>
  </div>`;
  modal.classList.add("open");
  clearWelcomeMarker();
  return true;
 };
 window.closeSecondWorldWelcome=function(){
  closeOverlay(IDS.welcome);
  if(typeof go==="function")go("home");
 };
 function tryShowWelcomeAfterReload(){
  if(!welcomeMarkerPresent())return false;
  if(typeof window.isSecondWorldEntered!=="function"||!window.isSecondWorldEntered())return false;
  if(window.CIVILIZATION_AUTH_REQUIRED===true&&!window.civilizationAuthSession)return false;
  if(window.BACKGROUND_PRELOAD_READY!==true)return false;
  return window.showSecondWorldWelcome();
 }

 window.showSecondWorldUnlockNotice=function(){
  if(typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered())return false;
  const r=req();
  if(!r?.mainline?.bossCompleted||!r?.mainline?.finalStoryCompleted)return false;
  const modal=ensureOverlay(IDS.notice);
  modal.innerHTML=`<div class="world-phase-card world-phase-unlock-card">
   <div class="world-phase-kicker">新紀元已開啟</div>
   <h2>宇宙紀元已開啟</h2>
   <p>銀河紀元的主線已走到終點。新的世界突破入口已出現在主畫面。</p>
   <div class="world-phase-modal-actions">
    <button class="btn" onclick="closeSecondWorldUnlockNotice()">稍後再說</button>
    <button class="btn primary" onclick="goToSecondWorldHome()">回主畫面查看</button>
   </div>
  </div>`;
  modal.classList.add("open");
  return true;
 };
 window.closeSecondWorldUnlockNotice=function(){closeOverlay(IDS.notice);};
 window.goToSecondWorldHome=function(){
  closeOverlay(IDS.notice);
  if(typeof go==="function")go("home");
  else{
   try{view="home";}catch(e){}
   if(typeof render==="function")render();
  }
 };

 window.handleSecondWorldStoryCompletion=function(storyId){
  if(typeof window.isFinalFirstWorldStoryId!=="function"||!window.isFinalFirstWorldStoryId(storyId))return false;
  queueMicrotask(()=>window.showSecondWorldUnlockNotice());
  return true;
 };

 window.addEventListener("civilization-background-ready-before-reveal",()=>setTimeout(tryShowWelcomeAfterReload,0));
 window.addEventListener("civilization-auth-ready",()=>setTimeout(tryShowWelcomeAfterReload,0));
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(tryShowWelcomeAfterReload,0),{once:true});else setTimeout(tryShowWelcomeAfterReload,0);

 window.SECOND_WORLD_PHASE_UI_VERSION=UI_VERSION;
})();
