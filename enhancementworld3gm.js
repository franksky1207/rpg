(function(){
 function formalWorld(){
  if(typeof window.enhancementWorldPhase==="function")return window.enhancementWorldPhase(state);
  if(state?.thirdWorld?.entered===true)return 3;
  if(state?.secondWorld?.entered===true)return 2;
  return 1;
 }
 function fixedValueHtml(text){
  if(typeof window.gmBatch16FixedValueHtml==="function")return window.gmBatch16FixedValueHtml(text);
  return `<div class="btn gm-formal-fixed-value" aria-disabled="true" tabindex="-1" style="cursor:default;pointer-events:none;opacity:.82">${String(text||"")}</div>`;
 }
 const baseManagementHtml=window.gmEnhancementManagementHtml;
 if(typeof baseManagementHtml==="function"){
  window.gmEnhancementManagementHtml=function(){
   if(formalWorld()!==3)return baseManagementHtml();
   if(typeof normalizeEnhancementState==="function")normalizeEnhancementState(state);
   const slots=typeof window.gmTestEnhancementSlots==="function"?window.gmTestEnhancementSlots():["weapon","helmet","armor","shoes","accessory"];
   const rows=slots.map(type=>{
    const label=typeof window.gmEnhancementSlotLabel==="function"?window.gmEnhancementSlotLabel(type):String(type);
    return `<label><span>${label}</span>${fixedValueHtml("+40")}</label>`;
   }).join("");
   return `<div class="muted gm-hub-note">高維紀元正式強化固定 +40，無法修改。此設定不影響 GM 測試沙盒。</div><div class="gm-enhancement-grid">${rows}</div>`;
  };
 }
 window.GM_ENHANCEMENT_WORLD3_LOCK_VERSION=1;
 window.GM_ENHANCEMENT_WORLD3_FIXED_VALUE_UI_VERSION=1;
 window.GM_ENHANCEMENT_HUB_REPLACE_WORKAROUND_RETIRED_VERSION=1;
})();