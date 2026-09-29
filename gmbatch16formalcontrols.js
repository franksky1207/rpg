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
 function fixedValueHtml(text){return `<div class="btn gm-formal-fixed-value" aria-disabled="true" tabindex="-1" style="cursor:default;pointer-events:none;opacity:.82">${String(text||"")}</div>`;}

 const baseSpecHtml=window.gmSpecializationManagementHtml;
 if(typeof baseSpecHtml==="function"){
  window.gmSpecializationManagementHtml=function(){
   if(!specializationLocked())return baseSpecHtml();
   const keys=Array.isArray(window.SPECIALIZATION_KEYS)?window.SPECIALIZATION_KEYS:[];
   const defs=window.SPECIALIZATION_DEFS&&typeof window.SPECIALIZATION_DEFS==="object"?window.SPECIALIZATION_DEFS:{};
   const max=Math.max(0,Math.floor(Number(window.SPECIALIZATION_MAX_LEVEL)||60));
   const world=phase()===3?"高維紀元":"宇宙紀元";
   const rows=keys.map(key=>`<label><span>${String(defs[key]?.name||key)}</span>${fixedValueHtml(`Lv.${max}`)}</label>`).join("");
   return `<div class="muted gm-hub-note">目前${world}正式專精固定 Lv.${max}，無法修改。GM 測試區仍可自由測試 Lv.0～Lv.${max}。</div><div class="gm-specialization-grid">${rows}</div>`;
  };
  if(typeof window.replaceGmHubSectionRenderer==="function")window.replaceGmHubSectionRenderer("manage","spec-manage",()=>window.gmSpecializationManagementHtml());
 }

 const baseMarkHtml=window.gmMarkManagementHtml;
 if(typeof baseMarkHtml==="function"){
  window.gmMarkManagementHtml=function(){
   if(!markLocked())return baseMarkHtml();
   const rows=Array.from(window.CIVILIZATION_CALAMITY_CONFIG||[]);
   const grid=rows.map(row=>`<label><span>${String(row?.markName||row?.markId||"")}</span>${fixedValueHtml("Lv.10")}</label>`).join("");
   const world=phase()===3?"高維紀元":"宇宙紀元";
   return `<div class="muted gm-hub-note">目前${world}正式角色的 10 枚印記固定為 Lv.10，無法修改。GM 測試區仍可自由測試 Lv.0～Lv.10。</div><div class="gm-specialization-grid gm-mark-grid">${grid}</div>`;
  };
  if(typeof window.replaceGmHubSectionRenderer==="function")window.replaceGmHubSectionRenderer("manage","marks-manage",()=>window.gmMarkManagementHtml());
 }

 const baseCivilizationHtml=window.gmCivilizationManagementHtml;
 if(typeof baseCivilizationHtml==="function"){
  window.gmCivilizationManagementHtml=function(){
   if(phase()!==3)return baseCivilizationHtml();
   const max=Math.max(0,Math.floor(Number(window.CIVILIZATION_LEVEL_MAX)||10));
   const bonus=max*Math.max(0,Number(window.CIVILIZATION_FINAL_DAMAGE_PERCENT_PER_LEVEL)||5);
   const multiplier=(1+bonus/100).toFixed(2);
   return `<div class="muted gm-hub-note">高維紀元正式文明等級固定 Lv.${max}，無法修改；正式戰鬥固定套用文明最終傷害。GM 測試沙盒仍可自由測試 Lv.0～Lv.${max}。</div><div class="controls" style="align-items:end"><label>文明等級<br>${fixedValueHtml(`Lv.${max}`)}</label><span class="muted">文明 Lv.${max}｜最終傷害 +${bonus}%｜×${multiplier}</span></div>`;
  };
  if(typeof window.replaceGmHubSectionRenderer==="function")window.replaceGmHubSectionRenderer("manage","civilization-manage",()=>window.gmCivilizationManagementHtml());
 }

 window.gmBatch16FormalWorldPhase=phase;
 window.gmBatch16SpecializationLocked=specializationLocked;
 window.gmBatch16MarkLocked=markLocked;
 window.gmBatch16FixedValueHtml=fixedValueHtml;
 window.GM_BATCH16_FORMAL_CONTROLS_VERSION=1;
 window.GM_BATCH16_FIXED_VALUE_UI_VERSION=2;
})();
