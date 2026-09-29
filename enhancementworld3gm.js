(function(){
 function formalWorld(){
  if(typeof window.enhancementWorldPhase==="function")return window.enhancementWorldPhase(state);
  if(state?.thirdWorld?.entered===true)return 3;
  if(state?.secondWorld?.entered===true)return 2;
  return 1;
 }
 const baseManagementHtml=window.gmEnhancementManagementHtml;
 if(typeof baseManagementHtml==="function"){
  window.gmEnhancementManagementHtml=function(){
   if(formalWorld()!==3)return baseManagementHtml();
   if(typeof normalizeEnhancementState==="function")normalizeEnhancementState(state);
   const slots=typeof window.gmTestEnhancementSlots==="function"?window.gmTestEnhancementSlots():["weapon","helmet","armor","shoes","accessory"];
   const rows=slots.map(type=>{
    const label=typeof window.gmEnhancementSlotLabel==="function"?window.gmEnhancementSlotLabel(type):String(type);
    return `<label><span>${label}</span><select class="btn" id="gmEnhance-manage-${type}" disabled><option value="40" selected>+40</option></select></label>`;
   }).join("");
   return `<div class="muted gm-hub-note">直接修改玩家正式裝備欄位強化等級；高維紀元正式強化固定 +40，無法修改。此設定不影響 GM 測試沙盒。</div><div class="gm-enhancement-grid">${rows}</div><div class="controls"><button class="btn blue" onclick="gmApplyEnhancementLevels()" disabled>套用強化等級</button></div>`;
  };
 }
 window.GM_ENHANCEMENT_WORLD3_LOCK_VERSION=1;
})();
