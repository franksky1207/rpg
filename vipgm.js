(function(){
 const GM_TEST_STATE_VERSION=2;
 const GM_TEST_CHARACTER_SANDBOX_VERSION=1;
 window.gmTestVipLevel=0;

 function cloneValue(value){
  if(value==null)return value;
  try{return typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value));}
  catch(e){try{return JSON.parse(JSON.stringify(value));}catch(_){return value;}}
 }
 function formalWorld(){return state?.secondWorld?.entered===true?2:1;}
 function clampWorld(value){return Number(value)===2?2:1;}
 function levelRange(world=window.gmTestWorld){return clampWorld(world)===2?{min:500,max:1000}:{min:1,max:500};}
 function clampTestLevel(value,world=window.gmTestWorld){
  const range=levelRange(world),n=Math.floor(Number(value)||range.min);
  return Math.max(range.min,Math.min(range.max,n));
 }
 function equipmentSlots(){return Array.isArray(EQUIPMENT_TYPES)?Array.from(EQUIPMENT_TYPES):["weapon","helmet","armor","shoes","accessory"];}
 function formalEquipmentSnapshot(){
  return Object.fromEntries(equipmentSlots().map(type=>[type,cloneValue(state?.equipment?.[type]||null)]));
 }
 function firstWorldMapForLevel(level){
  if(!Array.isArray(MAPS)||!MAPS.length)return 0;
  const lv=Math.max(1,Math.min(500,Math.floor(Number(level)||1)));
  let exact=MAPS.findIndex(map=>lv>=Math.max(1,Number(map?.min)||1)&&lv<=Math.max(1,Number(map?.max)||1));
  if(exact>=0)return exact;
  let best=0;
  MAPS.forEach((map,index)=>{if((Number(map?.min)||1)<=lv)best=index;});
  return best;
 }
 function generateTestEquipment(world,level){
  const w=clampWorld(world),lv=clampTestLevel(level,w),out={};
  if(w===2){
   const bossIndex=typeof window.secondWorldBossIndexForPlayerLevel==="function"?window.secondWorldBossIndexForPlayerLevel(lv):-1;
   equipmentSlots().forEach(type=>{
    out[type]=typeof window.makeSecondWorldEquipmentForBoss==="function"&&bossIndex>=0
     ?window.makeSecondWorldEquipmentForBoss(bossIndex,{level:lv,forcedQ:5,forcedType:type})
     :null;
   });
  }else{
   const mapIdx=firstWorldMapForLevel(lv);
   equipmentSlots().forEach(type=>{
    out[type]=typeof makeItem==="function"?makeItem(lv,mapIdx,"boss",5,type):null;
   });
  }
  return out;
 }
 function setTestCharacterBase(world,level,equipment,source){
  window.gmTestWorld=clampWorld(world);
  window.gmTestLevel=clampTestLevel(level,window.gmTestWorld);
  window.gmTestEquipment=equipment&&typeof equipment==="object"?cloneValue(equipment):generateTestEquipment(window.gmTestWorld,window.gmTestLevel);
  window.gmTestEquipmentSource=source==="synced"?"synced":"generated";
  return window.gmTestCharacterSnapshot();
 }
 window.gmTestWorld=formalWorld();
 window.gmTestLevel=clampTestLevel(state?.level,window.gmTestWorld);
 window.gmTestEquipment=formalEquipmentSnapshot();
 window.gmTestEquipmentSource="synced";
 function testVip(){return Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(window.gmTestVipLevel)||0)));}
 function enhancementSlots(){return Array.isArray(window.ENHANCEMENT_SLOTS)?Array.from(window.ENHANCEMENT_SLOTS):["weapon","helmet","armor","shoes","accessory"];}
 function enhancementMax(){return Math.max(0,Math.floor(Number(window.ENHANCEMENT_ABSOLUTE_MAX_LEVEL)||Number(window.SECOND_WORLD_ENHANCEMENT_CAP)||Number(window.ENHANCEMENT_MAX_LEVEL)||0));}
 function clampEnhancement(value){return Math.max(0,Math.min(enhancementMax(),Math.floor(Number(value)||0)));}
 function blankEnhancementLevels(){return typeof window.createBlankEnhancementLevels==="function"?window.createBlankEnhancementLevels():Object.fromEntries(enhancementSlots().map(type=>[type,0]));}
 window.gmTestEnhancementLevels=blankEnhancementLevels();

 function equipmentLabel(type){
  return typeof window.gmEnhancementSlotLabel==="function"?window.gmEnhancementSlotLabel(type):({weapon:"武器",helmet:"頭盔",armor:"鎧甲",shoes:"鞋子",accessory:"飾品"}[type]||type);
 }
 function testEquipmentSummaryHtml(){
  const rows=equipmentSlots().map(type=>{
   const item=window.gmTestEquipment?.[type]||null;
   const label=equipmentLabel(type);
   if(!item)return `<div class="muted">${label}：無</div>`;
   const quality=typeof QUALITY!=="undefined"&&QUALITY[item.q]?.n?QUALITY[item.q].n:`Q${item.q}`;
   const affixes=Array.isArray(item.affixes)&&item.affixes.length?item.affixes.map(a=>`${a.stat} +${a.value}`).join("、"):"無";
   return `<div><b>${label}</b>｜【${quality}】${item.name||"裝備"} Lv.${item.level}<div class="muted" style="margin-top:3px">詞條：${affixes}</div></div>`;
  }).join("");
  return `<div class="item" style="margin-top:10px">${rows}</div>`;
 }
 function refreshCharacterBaseControls(){
  const world=document.getElementById("gmTestCharacterWorld");if(world)world.value=String(window.gmTestWorld);
  const level=document.getElementById("gmTestCharacterLevel");if(level){const range=levelRange();level.min=String(range.min);level.max=String(range.max);level.value=String(window.gmTestLevel);}
  const info=document.getElementById("gmTestCharacterBaseInfo");if(info)info.textContent=window.gmTestCharacterLabel();
  const gear=document.getElementById("gmTestCharacterEquipment");if(gear)gear.innerHTML=testEquipmentSummaryHtml();
 }
 function refreshVipControls(){
  const select=document.getElementById("gmTestVipLevel");if(select)select.value=String(testVip());
  const info=document.getElementById("gmTestVipInfo");if(info)info.textContent=window.gmTestVipLabel();
 }
 function refreshSpecializationControls(){
  const keys=Array.isArray(window.SPECIALIZATION_KEYS)?window.SPECIALIZATION_KEYS:[];
  keys.forEach(key=>{
   const select=document.getElementById(`gmSpec-test-${key}`);
   if(select&&typeof window.specializationLevel==="function")select.value=String(window.specializationLevel(key,true));
  });
  const info=document.getElementById("gmSpecEconomyInfo");
  if(info&&typeof window.gmTestSpecializationEconomyLabel==="function")info.textContent=window.gmTestSpecializationEconomyLabel();
 }
 function refreshEnhancementControls(){
  enhancementSlots().forEach(type=>{
   const select=document.getElementById(`gmEnhance-test-${type}`);
   if(select)select.value=String(window.gmTestEnhancementLevel(type));
  });
  const info=document.getElementById("gmEnhancementTestInfo");if(info)info.textContent=window.gmTestEnhancementLabel();
 }
 window.gmRefreshTestControls=function(){
  refreshCharacterBaseControls();
  refreshVipControls();
  refreshSpecializationControls();
  refreshEnhancementControls();
  if(typeof window.refreshGmCivilizationTestControls==="function")window.refreshGmCivilizationTestControls();
  if(typeof window.refreshGmMarkTestControls==="function")window.refreshGmMarkTestControls();
  return true;
 };
 window.gmSetTestVipLevel=function(value,refresh=true){
  window.gmTestVipLevel=Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(value)||0)));
  if(refresh&&typeof window.gmPowerBenchmarkInvalidateSnapshot==="function")window.gmPowerBenchmarkInvalidateSnapshot();
  if(refresh&&typeof window.gmRefreshTestControls==="function")window.gmRefreshTestControls();
  return testVip();
 };
 window.gmSetTestEnhancement=function(type,value,refresh=true){
  if(!enhancementSlots().includes(type))return false;
  window.gmTestEnhancementLevels[type]=clampEnhancement(value);
  if(refresh&&typeof window.gmPowerBenchmarkInvalidateSnapshot==="function")window.gmPowerBenchmarkInvalidateSnapshot();
  if(refresh&&typeof window.gmRefreshTestControls==="function")window.gmRefreshTestControls();
  return true;
 };
 window.gmUseCurrentEnhancementTestStatus=function(refresh=true){
  if(typeof normalizeEnhancementState==="function")normalizeEnhancementState(state);
  enhancementSlots().forEach(type=>window.gmSetTestEnhancement(type,typeof enhancementLevel==="function"?enhancementLevel(state,type):state?.enhancement?.levels?.[type],false));
  if(refresh&&typeof window.gmRefreshTestControls==="function")window.gmRefreshTestControls();
  return Object.fromEntries(enhancementSlots().map(type=>[type,window.gmTestEnhancementLevel(type)]));
 };
 window.gmSetTestWorld=function(value,refresh=true){
  const next=clampWorld(value),range=levelRange(next);
  let nextLevel=Math.floor(Number(window.gmTestLevel)||range.min);
  if(nextLevel<range.min||nextLevel>range.max)nextLevel=range.min;
  setTestCharacterBase(next,nextLevel,generateTestEquipment(next,nextLevel),"generated");
  if(typeof window.gmPowerBenchmarkInvalidateSnapshot==="function")window.gmPowerBenchmarkInvalidateSnapshot();
  if(refresh&&typeof window.gmRefreshTestControls==="function")window.gmRefreshTestControls();
  return window.gmTestWorld;
 };
 window.gmSetTestLevel=function(value,refresh=true){
  const lv=clampTestLevel(value);
  setTestCharacterBase(window.gmTestWorld,lv,generateTestEquipment(window.gmTestWorld,lv),"generated");
  if(typeof window.gmPowerBenchmarkInvalidateSnapshot==="function")window.gmPowerBenchmarkInvalidateSnapshot();
  if(refresh&&typeof window.gmRefreshTestControls==="function")window.gmRefreshTestControls();
  return window.gmTestLevel;
 };
 window.gmRegenerateTestEquipment=function(refresh=true){
  window.gmTestEquipment=generateTestEquipment(window.gmTestWorld,window.gmTestLevel);
  window.gmTestEquipmentSource="generated";
  if(typeof window.gmPowerBenchmarkInvalidateSnapshot==="function")window.gmPowerBenchmarkInvalidateSnapshot();
  if(refresh&&typeof window.gmRefreshTestControls==="function")window.gmRefreshTestControls();
  return cloneValue(window.gmTestEquipment);
 };
 window.gmTestCharacterSnapshot=function(){
  return {world:clampWorld(window.gmTestWorld),level:clampTestLevel(window.gmTestLevel),equipment:cloneValue(window.gmTestEquipment||{}),equipmentSource:window.gmTestEquipmentSource==="synced"?"synced":"generated"};
 };
 window.gmTestCharacterLabel=function(){
  const source=window.gmTestEquipmentSource==="synced"?"正式角色實穿裝備":"同級神話預測裝備";
  return `${window.gmTestWorld===2?"宇宙紀元":"銀河紀元"}｜Lv.${window.gmTestLevel}｜${source}`;
 };
 window.gmTestCharacterBaseHtml=function(){
  const range=levelRange();
  return `<div class="muted gm-hub-note">GM 測試角色與正式進度解鎖脫鉤。手動切換紀元或等級時，會使用正式裝備公式重新隨機生成五件「同等級神話裝備」；不修改正式角色。</div><div class="controls" style="align-items:end"><label>測試紀元<br><select id="gmTestCharacterWorld" class="btn" onchange="gmSetTestWorld(this.value)"><option value="1" ${window.gmTestWorld===1?"selected":""}>銀河紀元</option><option value="2" ${window.gmTestWorld===2?"selected":""}>宇宙紀元</option></select></label><label>測試等級<br><input id="gmTestCharacterLevel" class="btn" type="number" min="${range.min}" max="${range.max}" step="1" value="${window.gmTestLevel}" onchange="gmSetTestLevel(this.value)"></label><button class="btn" type="button" onclick="gmRegenerateTestEquipment()">重新隨機神話裝備</button><span id="gmTestCharacterBaseInfo" class="muted">${window.gmTestCharacterLabel()}</span></div><div id="gmTestCharacterEquipment">${testEquipmentSummaryHtml()}</div>`;
 };

 window.gmUseCurrentTestStatus=function(){
  setTestCharacterBase(formalWorld(),state?.level,formalEquipmentSnapshot(),"synced");
  const currentVip=Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(state?.vipLevel)||0)));
  window.gmSetTestVipLevel(currentVip,false);
  if(typeof ensureSpecializationState==="function")ensureSpecializationState();
  const keys=Array.isArray(window.SPECIALIZATION_KEYS)?window.SPECIALIZATION_KEYS:[];
  if(!window.gmTestSpecializations||typeof window.gmTestSpecializations!=="object")window.gmTestSpecializations={};
  keys.forEach(key=>{
   const current=typeof window.specializationLevel==="function"?window.specializationLevel(key,false):Math.max(0,Math.floor(Number(state?.specializations?.[key])||0));
   if(typeof window.gmSetTestSpecialization==="function")window.gmSetTestSpecialization(key,current,false);
   else window.gmTestSpecializations[key]=current;
  });
  window.gmUseCurrentEnhancementTestStatus(false);
  if(typeof window.gmUseCurrentCivilizationTestStatus==="function")window.gmUseCurrentCivilizationTestStatus(false);
  if(typeof window.gmUseCurrentMarkTestStatus==="function")window.gmUseCurrentMarkTestStatus(false);
  if(typeof window.gmPowerBenchmarkInvalidateSnapshot==="function")window.gmPowerBenchmarkInvalidateSnapshot();
  if(typeof window.gmRefreshTestControls==="function")window.gmRefreshTestControls();
  if(typeof window.gmPowerBenchmarkRefreshUi==="function")window.gmPowerBenchmarkRefreshUi();
  return {character:window.gmTestCharacterSnapshot(),vip:testVip(),specializations:{...(window.gmTestSpecializations||{})},enhancements:{...(window.gmTestEnhancementLevels||{})},civilizationLevel:typeof window.gmTestCivilizationLevelValue==="function"?window.gmTestCivilizationLevelValue():0,marks:typeof window.markLevelsSnapshot==="function"?window.markLevelsSnapshot(true):{}};
 };
 window.gmTestEnhancementSlots=function(){return enhancementSlots();};
 window.gmClampTestEnhancementLevel=clampEnhancement;
 window.gmTestEnhancementLevel=function(type){return enhancementSlots().includes(type)?clampEnhancement(window.gmTestEnhancementLevels?.[type]):0;};
 window.gmTestEnhancedEquippedStats=function(){
  const lv=clampTestLevel(window.gmTestLevel),gear=window.gmTestEquipment||{};
  const out={hp:typeof baseHP==="function"?baseHP(lv):1,atk:typeof baseATK==="function"?baseATK(lv):1,def:typeof baseDEF==="function"?baseDEF(lv):0,crit:0,dodge:0};
  equipmentSlots().forEach(type=>{
   const item=gear[type];if(!item)return;
   out.hp+=Number(item.hp)||0;out.atk+=Number(item.atk)||0;out.def+=Number(item.def)||0;out.crit+=Number(item.crit)||0;out.dodge+=Number(item.dodge)||0;
   const stat=item.mainStat?.stat,raw=Math.max(0,Number(item.mainStat?.value)||0),enhance=window.gmTestEnhancementLevel(type);
   if(raw&&["hp","atk","def","crit","dodge"].includes(stat)&&typeof window.enhancedMainStatValue==="function"){
    const enhanced=window.enhancedMainStatValue(raw,enhance);
    out[stat]+=Math.max(0,Number(enhanced)||0)-raw;
   }
  });
  out.hp=Math.max(0,Number(out.hp)||0);out.atk=Math.max(0,Number(out.atk)||0);out.def=Math.max(0,Number(out.def)||0);
  out.crit=typeof round1==="function"?round1(Math.max(0,Number(out.crit)||0)):Math.max(0,Number(out.crit)||0);
  out.dodge=typeof round1==="function"?round1(Math.max(0,Number(out.dodge)||0)):Math.max(0,Number(out.dodge)||0);
  return out;
 };
 window.gmTestPlayerStats=function(baseStats=null){
  const equipment=baseStats||window.gmTestEnhancedEquippedStats();
  return createSpecialPlayerSnapshot(playerCombatStats(equipment,testVip()));
 };
 window.gmTestVipLabel=function(){const lv=testVip(),b=vipBonusStats(lv);return `VIP${lv}｜HP/ATK +${b.hp}%｜DEF +${b.def}%｜暴擊/閃避 +${b.crit}%`;};
 window.gmTestEnhancementLabel=function(){return `強化｜${enhancementSlots().map(type=>`${typeof window.gmEnhancementSlotLabel==="function"?window.gmEnhancementSlotLabel(type):type} +${window.gmTestEnhancementLevel(type)}`).join("｜")}`;};
 window.gmTestVipOptions=function(){return Array.from({length:VIP_MAX_LEVEL+1},(_,i)=>`<option value="${i}" ${i===testVip()?"selected":""}>VIP${i}</option>`).join("");};
 window.gmTestCurrentStatusHtml=function(){return `<div class="item gm-test-current-status" style="margin:0 0 12px"><b>目前測試狀態</b><div class="muted" style="margin-top:6px">${window.gmTestCharacterLabel()}</div><div class="controls" style="margin-top:8px;align-items:center"><button class="btn blue" type="button" onclick="gmUseCurrentTestStatus()">同步正式角色到測試設定</button><span class="muted">完整同步正式角色的紀元、等級、五件實穿裝備（含品質／主屬性／詞條）、VIP、專精、強化、印記與文明等級；只寫入 GM 測試沙盒，不修改正式角色。</span></div></div>`;};
 window.gmTestVipControlHtml=function(){return `<div class="muted gm-hub-note">設定本次工作階段使用的測試 VIP 等級；只影響 GM 測試，不修改正式角色 VIP。</div><div class="controls" style="align-items:end"><label>VIP<br><select id="gmTestVipLevel" class="btn" onchange="gmSetTestVipLevel(this.value)">${gmTestVipOptions()}</select></label><span id="gmTestVipInfo" class="muted">${gmTestVipLabel()}</span></div>`;};
 window.GM_TEST_STATE_VERSION=GM_TEST_STATE_VERSION;
 window.GM_TEST_CHARACTER_SANDBOX_VERSION=GM_TEST_CHARACTER_SANDBOX_VERSION;
 window.GM_TEST_CHARACTER_EQUIPMENT_MODE_VERSION=1;
 window.GM_ENHANCEMENT_TEST_PIPELINE_VERSION=6;
 window.GM_ENHANCEMENT_TEST_RANGE_VERSION=1;
})();

window.GM_TEST_RESULT_INVALIDATION_VERSION=1;
window.GM_TEST_SYNC_BENCHMARK_REFRESH_VERSION=1;
window.GM_TEST_BATCH_SYNC_VERSION=1;
window.GM_TEST_SESSION_ONLY_VERSION=1;
