(function(){
 const PLAYER_TITLE_UI_VERSION=1;
 const TITLE_NOTICE_MODAL_ID="playerTitleNoticeModal";
 const TITLE_PICKER_MODAL_ID="playerTitlePickerModal";
 let titleNoticeOpen=false;

 const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));

 function persistOrRollback(rollback){
  if(typeof save!=="function"){rollback?.();return false;}
  if(save(false)===false){rollback?.();return false;}
  return true;
 }

 function titleChoiceHtml(target=state){
  const unlocked=typeof window.getUnlockedPlayerTitleDefinitions==="function"?window.getUnlockedPlayerTitleDefinitions(target):[];
  const equipped=target?.titles?.equipped||null;
  const none=`<button class="player-title-choice ${equipped?"":"active"}" onclick="selectPlayerTitle(null)"><span class="player-title-choice-name">不裝備稱號</span></button>`;
  return none+unlocked.map(def=>`<button class="player-title-choice ${equipped===def.id?"active":""}" onclick="selectPlayerTitle('${esc(def.id)}')">${typeof window.playerTitleHtml==="function"?window.playerTitleHtml(def.id):esc(def.name)}</button>`).join("");
 }

 function ensureTitlePickerModal(){
  let modal=document.getElementById(TITLE_PICKER_MODAL_ID);
  if(modal)return modal;
  modal=document.createElement("div");
  modal.id=TITLE_PICKER_MODAL_ID;
  modal.className="modal";
  modal.setAttribute("role","dialog");
  modal.setAttribute("aria-modal","true");
  document.body.appendChild(modal);
  return modal;
 }

 function openPlayerTitlePicker(){
  const unlocked=typeof window.getUnlockedPlayerTitleDefinitions==="function"?window.getUnlockedPlayerTitleDefinitions(state):[];
  if(!unlocked.length)return false;
  const modal=ensureTitlePickerModal();
  modal.innerHTML=`<div class="modal-box player-title-picker"><h3>選擇稱號</h3><div class="player-title-choice-list">${titleChoiceHtml(state)}</div><div class="controls"><button class="btn" onclick="closePlayerTitlePicker()">關閉</button></div></div>`;
  modal.classList.add("show");
  return true;
 }

 function closePlayerTitlePicker(){
  const modal=document.getElementById(TITLE_PICKER_MODAL_ID);
  if(modal){modal.classList.remove("show");modal.remove();}
  return true;
 }

 function selectPlayerTitle(id){
  if(typeof window.equipPlayerTitle!=="function")return false;
  const previous=state?.titles?.equipped??null;
  if(!window.equipPlayerTitle(id,state))return false;
  const ok=persistOrRollback(()=>{if(state?.titles)state.titles.equipped=previous;});
  if(!ok)return false;
  closePlayerTitlePicker();
  if(typeof render==="function")render();
  return true;
 }

 function ensureTitleNoticeModal(){
  let modal=document.getElementById(TITLE_NOTICE_MODAL_ID);
  if(modal)return modal;
  modal=document.createElement("div");
  modal.id=TITLE_NOTICE_MODAL_ID;
  modal.className="modal";
  modal.setAttribute("role","dialog");
  modal.setAttribute("aria-modal","true");
  document.body.appendChild(modal);
  return modal;
 }

 function showPendingPlayerTitleNotice(){
  if(titleNoticeOpen||document.hidden)return false;
  const def=typeof window.getPendingPlayerTitleNotice==="function"?window.getPendingPlayerTitleNotice():null;
  if(!def)return false;
  const modal=ensureTitleNoticeModal();
  const sourceText=def.series==="mirror"
   ?`鏡像戰歷史最高達 ${Math.max(0,Math.floor(Number(def.mirrorWins)||0))} 勝後取得。`
   :"首次擊敗對應文明災厄後取得。";
  modal.innerHTML=`<div class="modal-box"><h3>獲得稱號</h3><div class="player-title-notice-preview">${typeof window.playerTitleHtml==="function"?window.playerTitleHtml(def.id):esc(def.name)}</div><div class="muted">${esc(sourceText)}</div><div class="controls" style="margin-top:16px"><button class="btn primary" onclick="closePlayerTitleNotice()">確認</button></div></div>`;
  modal.classList.add("show");
  titleNoticeOpen=true;
  return true;
 }

 function closePlayerTitleNotice(){
  const current=typeof window.getPendingPlayerTitleNotice==="function"?window.getPendingPlayerTitleNotice():null;
  if(current&&typeof window.clearPendingPlayerTitleNotice==="function"){
   if(!window.clearPendingPlayerTitleNotice(state))return false;
   const ok=persistOrRollback(()=>{if(state?.titles)state.titles.pendingNotice=current.id;});
   if(!ok)return false;
  }
  const modal=document.getElementById(TITLE_NOTICE_MODAL_ID);
  if(modal){modal.classList.remove("show");modal.remove();}
  titleNoticeOpen=false;
  return true;
 }

 function queuePendingPlayerTitleNotice(){
  if(document.hidden)return false;
  if(typeof queueMicrotask==="function")queueMicrotask(showPendingPlayerTitleNotice);
  else setTimeout(showPendingPlayerTitleNotice,0);
  return true;
 }

 document.addEventListener("visibilitychange",()=>{if(!document.hidden)queuePendingPlayerTitleNotice();});
 setTimeout(queuePendingPlayerTitleNotice,0);

 window.PLAYER_TITLE_UI_VERSION=PLAYER_TITLE_UI_VERSION;
 window.openPlayerTitlePicker=openPlayerTitlePicker;
 window.closePlayerTitlePicker=closePlayerTitlePicker;
 window.selectPlayerTitle=selectPlayerTitle;
 window.showPendingPlayerTitleNotice=showPendingPlayerTitleNotice;
 window.closePlayerTitleNotice=closePlayerTitleNotice;
 window.queuePendingPlayerTitleNotice=queuePendingPlayerTitleNotice;
})();
