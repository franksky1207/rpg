(function(){
 const VERSION=1;
 const POLICY_VERSION=1;
 const SECTION_POLICY_VERSION=1;
 function phase(target=null){
  const holder=target&&typeof target==="object"?target:(typeof state!=="undefined"&&state&&typeof state==="object"?state:null);
  if(!holder)return 1;
  if(typeof window.currentWorldPhase==="function"){
   const value=Number(window.currentWorldPhase(holder));
   if(value===1||value===2||value===3)return value;
  }
  return holder?.thirdWorld?.entered===true?3:holder?.secondWorld?.entered===true?2:1;
 }
 function policy(kind,target=null){
  const world=phase(target),key=String(kind||"");
  const locked=(key==="specialization"||key==="mark")?world>=2:key==="civilization"?world===3:false;
  return Object.freeze({version:POLICY_VERSION,kind:key,phase:world,locked,worldLabel:world===3?"高維紀元":world===2?"宇宙紀元":"銀河紀元"});
 }
 function specializationLocked(target=null){return policy("specialization",target).locked;}
 function markLocked(target=null){return policy("mark",target).locked;}
 function fixedValueHtml(text){return `<div class="btn gm-formal-fixed-value" aria-disabled="true" tabindex="-1" style="cursor:default;pointer-events:none;opacity:.82">${String(text||"")}</div>`;}

 const baseSpecHtml=window.gmSpecializationManagementHtml;
 const baseMarkHtml=window.gmMarkManagementHtml;
 const baseCivilizationHtml=window.gmCivilizationManagementHtml;
 function specializationRenderer(){
  const p=policy("specialization");
  if(!p.locked)return typeof baseSpecHtml==="function"?baseSpecHtml():"";
  const keys=Array.isArray(window.SPECIALIZATION_KEYS)?window.SPECIALIZATION_KEYS:[];
  const defs=window.SPECIALIZATION_DEFS&&typeof window.SPECIALIZATION_DEFS==="object"?window.SPECIALIZATION_DEFS:{};
  const max=Math.max(0,Math.floor(Number(window.SPECIALIZATION_MAX_LEVEL)||60));
  const rows=keys.map(key=>`<label><span>${String(defs[key]?.name||key)}</span>${fixedValueHtml(`Lv.${max}`)}</label>`).join("");
  return `<div class="muted gm-hub-note">目前${p.worldLabel}正式專精固定 Lv.${max}，無法修改。GM 測試區仍可自由測試 Lv.0～Lv.${max}。</div><div class="gm-specialization-grid">${rows}</div>`;
 }
 function markRenderer(){
  const p=policy("mark");
  if(!p.locked)return typeof baseMarkHtml==="function"?baseMarkHtml():"";
  const rows=Array.from(window.CIVILIZATION_CALAMITY_CONFIG||[]);
  const grid=rows.map(row=>`<label><span>${String(row?.markName||row?.markId||"")}</span>${fixedValueHtml("Lv.10")}</label>`).join("");
  return `<div class="muted gm-hub-note">目前${p.worldLabel}正式角色的 10 枚印記固定為 Lv.10，無法修改。GM 測試區仍可自由測試 Lv.0～Lv.10。</div><div class="gm-specialization-grid gm-mark-grid">${grid}</div>`;
 }
 function civilizationRenderer(){
  const p=policy("civilization");
  if(!p.locked)return typeof baseCivilizationHtml==="function"?baseCivilizationHtml():"";
  const max=Math.max(0,Math.floor(Number(window.CIVILIZATION_LEVEL_MAX)||10));
  const bonus=max*Math.max(0,Number(window.CIVILIZATION_FINAL_DAMAGE_PERCENT_PER_LEVEL)||5);
  const multiplier=(1+bonus/100).toFixed(2);
  return `<div class="muted gm-hub-note">高維紀元正式文明等級固定 Lv.${max}，無法修改；正式戰鬥固定套用文明最終傷害。GM 測試沙盒仍可自由測試 Lv.0～Lv.${max}。</div><div class="controls" style="align-items:end"><label>文明等級<br>${fixedValueHtml(`Lv.${max}`)}</label><span class="muted">文明 Lv.${max}｜最終傷害 +${bonus}%｜×${multiplier}</span></div>`;
 }
 function installSectionPolicies(){
  if(typeof window.replaceGmHubSectionRenderer!=="function")return false;
  const spec=window.replaceGmHubSectionRenderer("manage","spec-manage",specializationRenderer);
  const mark=window.replaceGmHubSectionRenderer("manage","marks-manage",markRenderer);
  const civ=window.replaceGmHubSectionRenderer("manage","civilization-manage",civilizationRenderer);
  return spec||mark||civ;
 }

 window.gmBatch16FormalWorldPhase=phase;
 window.gmBatch16FormalControlPolicy=policy;
 window.gmBatch16SpecializationLocked=specializationLocked;
 window.gmBatch16MarkLocked=markLocked;
 window.gmBatch16FixedValueHtml=fixedValueHtml;
 window.gmBatch16SpecializationSectionRenderer=specializationRenderer;
 window.gmBatch16MarkSectionRenderer=markRenderer;
 window.gmBatch16CivilizationSectionRenderer=civilizationRenderer;
 window.GM_BATCH16_FORMAL_CONTROLS_VERSION=VERSION;
 window.GM_BATCH16_FORMAL_POLICY_VERSION=POLICY_VERSION;
 window.GM_BATCH16_SECTION_POLICY_VERSION=SECTION_POLICY_VERSION;
 window.GM_BATCH16_FIXED_VALUE_UI_VERSION=3;
 window.GM_BATCH16_HUB_REPLACE_WORKAROUND_RETIRED_VERSION=2;
 window.GM_BATCH16_GLOBAL_RENDERER_OVERRIDE_RETIRED_VERSION=1;
 window.GM_BATCH16_SECTION_POLICY_INSTALLED=installSectionPolicies();
})();