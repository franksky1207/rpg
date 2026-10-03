(function(){
 const REINCARNATION_UI_VERSION=1;
 const INSTALL_VERSION=1;
 const REQUIREMENTS_ID="worldPhaseRequirementsModal";
 const CONFIRM_ID="worldPhaseConfirmModal";
 const CONFIRM_BUTTON_ID="reincarnationConfirmEnterButton";

 function esc(v){return String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
 function ensureOverlay(id){let el=document.getElementById(id);if(el)return el;el=document.createElement("div");el.id=id;el.className="world-phase-overlay";el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");document.body.appendChild(el);return el;}
 function closeOverlay(id){const el=document.getElementById(id);if(el)el.classList.remove("open");}
 function statusMark(ok){return ok?'<span class="world-phase-check ok">✓</span>':'<span class="world-phase-check pending">•</span>';}
 function requirementRow(ok,label,value){return `<div class="world-phase-requirement-row">${statusMark(ok)}<div class="world-phase-requirement-copy"><b>${esc(label)}</b><span>${esc(value)}</span></div></div>`;}
 function requirements(){return typeof window.reincarnationEligibilitySnapshot==="function"?window.reincarnationEligibilitySnapshot():null;}
 function thirdWorldEntered(){return typeof window.isThirdWorldEntered==="function"&&window.isThirdWorldEntered()===true;}
 function visible(r){return thirdWorldEntered()&&r?.bosses?.ok===true;}
 function requirementSummary(r){return `${Number(r?.completed)||0} / ${Number(r?.total)||0}`;}
 function rows(r){return [
  requirementRow(r?.level?.ok,"角色等級",`Lv.${Number(r?.level?.current)||0} / Lv.${Number(r?.level?.required)||2000}`),
  requirementRow(r?.bosses?.ok,"擊敗 10 名高維存在",`${Number(r?.bosses?.current)||0} / ${Number(r?.bosses?.required)||10}`),
  requirementRow(r?.core?.ok,"界弦核心 Lv.10",`Lv.${Number(r?.core?.current)||0} / Lv.${Number(r?.core?.required)||10}`)
 ];}
 function reincarnationHomeEntryHtml(){
  const r=requirements();if(!r||!visible(r))return "";const ready=r.eligible===true;
  const desc=ready?"所有轉生條件已完成。你可以保留永久成果，重新從銀河紀元開始。":"本輪高維征服已完成。完成其餘轉生條件後，即可重啟文明征途。";
  return `<section class="world-phase-home-card" data-major-transition="reincarnation"><div class="world-phase-home-copy"><div class="world-phase-kicker">文明轉生</div><h3>重新開始文明征途</h3><div class="world-phase-home-desc">${esc(desc)}</div><div class="world-phase-progress">轉生條件 <b>${esc(requirementSummary(r))}</b></div></div><div class="world-phase-home-actions"><button class="btn" onclick="openReincarnationRequirements()">查看轉生條件</button>${ready?'<button class="btn primary" onclick="openReincarnationConfirmation()">開始轉生</button>':""}</div></section>`;
 }
 function openReincarnationRequirements(){
  const r=requirements();if(!r)return false;const modal=ensureOverlay(REQUIREMENTS_ID);
  modal.innerHTML=`<div class="world-phase-card world-phase-requirements-card"><div class="world-phase-modal-head"><div class="world-phase-kicker">高維紀元 → 文明轉生</div><h2>文明轉生條件</h2><div class="muted">完成全部條件後，才可進行正式轉生。</div></div><div class="world-phase-requirement-list">${rows(r).join("")}</div><div class="world-phase-modal-actions"><button class="btn" onclick="closeReincarnationRequirements()">關閉</button>${r.eligible?'<button class="btn primary" onclick="closeReincarnationRequirements();openReincarnationConfirmation()">開始轉生</button>':""}</div></div>`;
  modal.classList.add("open");return true;
 }
 function closeReincarnationRequirements(){closeOverlay(REQUIREMENTS_ID);}
 function confirmationBody(){return `<p>轉生會結束目前這一輪的正式成長，讓角色從 Lv.1、銀河紀元重新開始；永久成果則會帶往下一輪。</p><div class="world-phase-info-block"><b>會保留</b><span>VIP、永久突破等級、已裝備與背包中的高維紀元 Lv.2000 裝備、稱號、設定與 1.5× 戰鬥速度解鎖、鏡像戰與虛空永久歷史、異宇宙永久解鎖與最深進度，以及已閱讀／體驗過的戰線紀錄。當日副本已使用次數與獎勵狀態不會刷新。</span></div><div class="world-phase-info-block warning"><b>會重置</b><span>角色等級與 EXP、強化、8 種專精、10 種印記、文明等級、銀河／宇宙／高維紀元本輪進度、銀河與宇宙競技場階級、各紀元成長資源、遺失裝備、離線樣本與未結算戰鬥暫態，以及異宇宙本輪挑戰狀態。</span></div><div class="world-phase-info-block speed"><b>轉生後突破</b><span>轉生後每輪於 Lv.100、200、300…1000 各獲得 1 級永久突破，每輪最多 +10；Lv.1000～2000 不再增加突破。永久突破會持續強化裝備三圍與最終傷害。</span></div><p class="world-phase-review-note">轉生後已體驗過的劇情仍可於戰線紀錄回顧，不會因重新征服而清除閱讀歷史。</p>`;}
 function openReincarnationConfirmation(){
  const r=requirements();if(!r)return false;if(!r.eligible)return openReincarnationRequirements();
  const modal=ensureOverlay(CONFIRM_ID);modal.innerHTML=`<div class="world-phase-card world-phase-confirm-card"><div class="world-phase-scroll"><div class="world-phase-modal-head"><div class="world-phase-kicker">不可逆文明轉生</div><h2>確定進行「文明轉生」？</h2></div>${confirmationBody()}<div class="world-phase-danger-text">此操作無法復原。</div></div><div class="world-phase-modal-actions fixed"><button class="btn" onclick="closeReincarnationConfirmation()">取消</button><button id="${CONFIRM_BUTTON_ID}" class="btn primary" onclick="confirmReincarnationEntry()">確認轉生</button></div></div>`;modal.classList.add("open");return true;
 }
 function closeReincarnationConfirmation(){closeOverlay(CONFIRM_ID);}
 function failureMessage(result){
  const reason=String(result?.reason||"");
  if(reason==="requirements-incomplete")return "轉生條件已變更，請重新確認。";
  if(reason==="save-failed")return "轉生存檔失敗，原有進度已完整還原。";
  if(reason==="active-runtime")return "目前仍有戰鬥、戰鬥介面或背景流程正在執行，請先結束後再進行轉生。";
  if(reason==="transaction-busy")return "目前仍有另一個正式結算正在處理，請稍後再試。";
  if(reason==="transaction-owner-missing")return "轉生安全交易元件尚未完整載入，請重新整理後再試。";
  if(reason==="reincarnation-committed")return "本次轉生已完成，正在重新載入新的文明輪迴。";
  return "轉生未完成，請稍後再試。";
 }
 function confirmReincarnationEntry(){
  const button=document.getElementById(CONFIRM_BUTTON_ID);if(button?.disabled)return false;if(button)button.disabled=true;
  const result=typeof window.executeFormalReincarnation==="function"?window.executeFormalReincarnation():{ok:false,reason:"transaction-owner-missing"};
  if(result?.ok===true)return true;
  if(button)button.disabled=false;
  alert(failureMessage(result));return false;
 }
 function installHomeBridge(){
  if(Number(window.REINCARNATION_HOME_BRIDGE_VERSION)>=INSTALL_VERSION)return true;
  const base=window.secondWorldHomeEntryHtml;if(typeof base!=="function")return false;
  window.secondWorldHomeEntryHtml=function(){return String(base.apply(this,arguments)||"")+reincarnationHomeEntryHtml();};
  window.REINCARNATION_HOME_BRIDGE_VERSION=INSTALL_VERSION;
  return true;
 }

 window.REINCARNATION_UI_VERSION=REINCARNATION_UI_VERSION;
 window.reincarnationHomeEntryHtml=reincarnationHomeEntryHtml;
 window.openReincarnationRequirements=openReincarnationRequirements;
 window.closeReincarnationRequirements=closeReincarnationRequirements;
 window.openReincarnationConfirmation=openReincarnationConfirmation;
 window.closeReincarnationConfirmation=closeReincarnationConfirmation;
 window.confirmReincarnationEntry=confirmReincarnationEntry;
 window.reincarnationTransitionFailureMessage=failureMessage;
 installHomeBridge();
 try{if(typeof render==="function"&&typeof view!=="undefined"&&view==="home")setTimeout(()=>render(),0);}catch(_){}
})();
