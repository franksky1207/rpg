(function(){
 const VERSION=1;
 function esc(v){return String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
 function ensureOverlay(id,className="world-phase-overlay"){
  let el=document.getElementById(id);if(el)return el;
  el=document.createElement("div");el.id=id;el.className=className;el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");document.body.appendChild(el);return el;
 }
 function closeOverlay(id){const el=document.getElementById(id);if(el)el.classList.remove("open");}
 function statusMark(ok){return ok?'<span class="world-phase-check ok">✓</span>':'<span class="world-phase-check pending">•</span>';}
 function requirementRow(ok,label,value){return `<div class="world-phase-requirement-row">${statusMark(ok)}<div class="world-phase-requirement-copy"><b>${esc(label)}</b><span>${esc(value)}</span></div></div>`;}
 function requirementSummary(r){return `${Number(r?.completed)||0} / ${Number(r?.total)||0}`;}
 function requirementsCardHtml(options={}){
  const kicker=esc(options.kicker||""),title=esc(options.title||""),description=esc(options.description||"");
  const rows=Array.isArray(options.rows)?options.rows.join(""):String(options.rowsHtml||"");
  const closeAction=String(options.closeAction||""),primaryAction=String(options.primaryAction||""),primaryLabel=esc(options.primaryLabel||"");
  return `<div class="world-phase-card world-phase-requirements-card"><div class="world-phase-modal-head"><div class="world-phase-kicker">${kicker}</div><h2>${title}</h2><div class="muted">${description}</div></div><div class="world-phase-requirement-list">${rows}</div><div class="world-phase-modal-actions"><button class="btn" onclick="${closeAction}">關閉</button>${primaryAction?`<button class="btn primary" onclick="${primaryAction}">${primaryLabel}</button>`:""}</div></div>`;
 }
 function confirmationCardHtml(options={}){
  const kicker=esc(options.kicker||""),title=esc(options.title||""),body=String(options.bodyHtml||"");
  const danger=esc(options.dangerText||"此操作無法復原。"),cancelAction=String(options.cancelAction||"");
  const buttonId=esc(options.confirmButtonId||"majorTransitionConfirmButton"),confirmAction=String(options.confirmAction||""),confirmLabel=esc(options.confirmLabel||"確認");
  return `<div class="world-phase-card world-phase-confirm-card"><div class="world-phase-scroll"><div class="world-phase-modal-head"><div class="world-phase-kicker">${kicker}</div><h2>${title}</h2></div>${body}<div class="world-phase-danger-text">${danger}</div></div><div class="world-phase-modal-actions fixed"><button class="btn" onclick="${cancelAction}">取消</button><button id="${buttonId}" class="btn primary" onclick="${confirmAction}">${confirmLabel}</button></div></div>`;
 }
 function openOverlay(id,html){const modal=ensureOverlay(id);modal.innerHTML=String(html||"");modal.classList.add("open");return modal;}
 window.MAJOR_TRANSITION_UI_VERSION=VERSION;
 window.majorTransitionEscape=esc;
 window.majorTransitionEnsureOverlay=ensureOverlay;
 window.majorTransitionCloseOverlay=closeOverlay;
 window.majorTransitionStatusMark=statusMark;
 window.majorTransitionRequirementRow=requirementRow;
 window.majorTransitionRequirementSummary=requirementSummary;
 window.majorTransitionRequirementsCardHtml=requirementsCardHtml;
 window.majorTransitionConfirmationCardHtml=confirmationCardHtml;
 window.majorTransitionOpenOverlay=openOverlay;
})();