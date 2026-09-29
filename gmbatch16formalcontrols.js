(function(){
 function phase(target=null){
  const holder=target&&typeof target==="object"?target:(typeof state!=="undefined"&&state&&typeof state==="object"?state:null);
  if(!holder)return 1;
  if(holder?.thirdWorld?.entered===true)return 3;
  if(holder?.secondWorld?.entered===true)return 2;
  return 1;
 }
 function specializationLocked(target=null){return phase(target)>=2;}
 function markLocked(target=null){return phase(target)>=2;}

 const baseSpecHtml=window.gmSpecializationManagementHtml;
 if(typeof baseSpecHtml==="function"){
  window.gmSpecializationManagementHtml=function(){
   if(!specializationLocked())return baseSpecHtml();
   const keys=Array.isArray(window.SPECIALIZATION_KEYS)?window.SPECIALIZATION_KEYS:[];
   const defs=window.SPECIALIZATION_DEFS&&typeof window.SPECIALIZATION_DEFS==="object"?window.SPECIALIZATION_DEFS:{};
   const max=Math.max(0,Math.floor(Number(window.SPECIALIZATION_MAX_LEVEL)||60));
   const world=phase()===3?"高維紀元":"宇宙紀元";
   const rows=keys.map(key=>`<label><span>${String(defs[key]?.name||key)}</span><select class="btn" id="gmSpec-manage-${key}" disabled><option value="${max}" selected>Lv.${max}</option></select></label>`).join("");
   return `<div class="muted gm-hub-note">目前${world}正式專精固定 Lv.${max}，無法修改。GM 測試區仍可自由測試 Lv.0～Lv.${max}。</div><div class="gm-specialization-grid">${rows}</div><div class="controls"><button class="btn blue" onclick="gmApplySpecializations()" disabled>套用專精等級</button></div>`;
  };
 }

 const baseMarkHtml=window.gmMarkManagementHtml;
 if(typeof baseMarkHtml==="function"){
  window.gmMarkManagementHtml=function(){
   if(!markLocked())return baseMarkHtml();
   const rows=Array.from(window.CIVILIZATION_CALAMITY_CONFIG||[]);
   const grid=rows.map(row=>`<label><span>${String(row?.markName||row?.markId||"")}</span><select class="btn" id="gmMark-manage-${String(row?.markId||"")}" disabled><option value="10" selected>Lv.10</option></select></label>`).join("");
   const world=phase()===3?"高維紀元":"宇宙紀元";
   return `<div class="muted gm-hub-note">目前${world}正式角色的 10 枚印記固定為 Lv.10，無法修改。GM 測試區仍可自由測試 Lv.0～Lv.10。</div><div class="gm-specialization-grid gm-mark-grid">${grid}</div><div class="controls"><button class="btn blue" onclick="gmApplyFormalMarks()" disabled>套用印記狀態</button></div>`;
  };
 }

 window.gmBatch16FormalWorldPhase=phase;
 window.gmBatch16SpecializationLocked=specializationLocked;
 window.gmBatch16MarkLocked=markLocked;
 window.GM_BATCH16_FORMAL_CONTROLS_VERSION=1;
})();
