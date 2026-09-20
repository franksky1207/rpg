(function(){
 window.gmTestVipLevel=0;
 function testVip(){return Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(window.gmTestVipLevel)||0)));}
 function enhancementSlots(){return Array.isArray(window.ENHANCEMENT_SLOTS)?window.ENHANCEMENT_SLOTS:["weapon","helmet","armor","shoes","accessory"];}
 function enhancementMax(){return Math.max(0,Math.floor(Number(window.ENHANCEMENT_MAX_LEVEL)||0));}
 function clampEnhancement(value){return Math.max(0,Math.min(enhancementMax(),Math.floor(Number(value)||0)));}
 function blankEnhancementLevels(){return Object.fromEntries(enhancementSlots().map(type=>[type,0]));}
 window.gmTestEnhancementLevels=blankEnhancementLevels();
 window.gmSetTestVipLevel=function(value){
  window.gmTestVipLevel=Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(value)||0)));
  const select=document.getElementById("gmTestVipLevel");if(select)select.value=String(window.gmTestVipLevel);
  const info=document.getElementById("gmTestVipInfo");if(info)info.textContent=gmTestVipLabel();
 };
 window.gmSetTestEnhancement=function(type,value){
  if(!enhancementSlots().includes(type))return;
  window.gmTestEnhancementLevels[type]=clampEnhancement(value);
  const select=document.getElementById(`gmEnhance-test-${type}`);if(select)select.value=String(window.gmTestEnhancementLevels[type]);
  const info=document.getElementById("gmEnhancementTestInfo");if(info&&typeof window.gmTestEnhancementLabel==="function")info.textContent=window.gmTestEnhancementLabel();
 };
 window.gmUseCurrentEnhancementTestStatus=function(){
  if(typeof normalizeEnhancementState==="function")normalizeEnhancementState(state);
  enhancementSlots().forEach(type=>window.gmSetTestEnhancement(type,typeof enhancementLevel==="function"?enhancementLevel(state,type):state?.enhancement?.levels?.[type]));
 };
 window.gmUseCurrentTestStatus=function(){
  const currentVip=Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(state?.vipLevel)||0)));
  window.gmSetTestVipLevel(currentVip);
  if(typeof ensureSpecializationState==="function")ensureSpecializationState();
  const keys=Array.isArray(window.SPECIALIZATION_KEYS)?window.SPECIALIZATION_KEYS:[];
  if(!window.gmTestSpecializations||typeof window.gmTestSpecializations!=="object")window.gmTestSpecializations={};
  keys.forEach(key=>{
   const current=typeof window.specializationLevel==="function"?window.specializationLevel(key,false):Math.max(0,Math.floor(Number(state?.specializations?.[key])||0));
   if(typeof window.gmSetTestSpecialization==="function")window.gmSetTestSpecialization(key,current);
   else window.gmTestSpecializations[key]=current;
   const select=document.getElementById(`gmSpec-test-${key}`);if(select)select.value=String(current);
  });
  window.gmUseCurrentEnhancementTestStatus();
  if(typeof window.gmUseCurrentMarkTestStatus==="function")window.gmUseCurrentMarkTestStatus();
  if(typeof window.refreshGmMarkTestControls==="function")window.refreshGmMarkTestControls();
 };
 window.gmTestEnhancementLevel=function(type){return enhancementSlots().includes(type)?clampEnhancement(window.gmTestEnhancementLevels?.[type]):0;};
 window.gmTestEnhancedEquippedStats=function(){
  const levels=Object.fromEntries(enhancementSlots().map(type=>[type,window.gmTestEnhancementLevel(type)]));
  return typeof equippedStatsWithEnhancementLevels==="function"?equippedStatsWithEnhancementLevels(levels):(typeof rawEquippedStats==="function"?rawEquippedStats():equippedStats());
 };
 window.gmTestPlayerStats=function(baseStats=null){
  const equipment=baseStats||window.gmTestEnhancedEquippedStats();
  return createSpecialPlayerSnapshot(playerCombatStats(equipment,testVip()));
 };
 window.gmTestVipLabel=function(){const lv=testVip(),b=vipBonusStats(lv);return `VIP${lv}｜HP/ATK +${b.hp}%｜DEF +${b.def}%｜暴擊/閃避 +${b.crit}%`;};
 window.gmTestVipOptions=function(){return Array.from({length:VIP_MAX_LEVEL+1},(_,i)=>`<option value="${i}" ${i===testVip()?"selected":""}>VIP${i}</option>`).join("");};
 window.gmTestCurrentStatusHtml=function(){return `<div class="item gm-test-current-status" style="margin:0 0 12px"><b>目前測試狀態</b><div class="controls" style="margin-top:8px;align-items:center"><button class="btn blue" type="button" onclick="gmUseCurrentTestStatus()">同步目前角色狀態</button><span class="muted">一次同步 VIP／專精／強化／印記；測試資料僅本次網頁工作階段保留，重新整理後回預設值。</span></div></div>`;};
 window.gmTestVipControlHtml=function(){return `<div class="muted gm-hub-note">設定本次工作階段使用的測試 VIP 等級；只影響 GM 測試，不修改正式角色 VIP。</div><div class="controls" style="align-items:end"><label>VIP<br><select id="gmTestVipLevel" class="btn" onchange="gmSetTestVipLevel(this.value)">${gmTestVipOptions()}</select></label><span id="gmTestVipInfo" class="muted">${gmTestVipLabel()}</span></div>`;};
 window.GM_ENHANCEMENT_TEST_PIPELINE_VERSION=4;
})();
