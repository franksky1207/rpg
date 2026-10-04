(function(){
 const VERSION=1;
 let busy=false;

 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}}
 function currentPhase(target=null){
  const s=target&&typeof target==="object"?target:currentState();
  if(!s)return 1;
  if(typeof window.currentWorldPhase==="function"){
   const value=Number(window.currentWorldPhase(s));
   if(Number.isInteger(value)&&value>=1&&value<=3)return value;
  }
  return s?.thirdWorld?.entered===true?3:s?.secondWorld?.entered===true?2:1;
 }
 function clone(value){try{return JSON.parse(JSON.stringify(value));}catch(_){return null;}}
 function restore(snapshot){if(!snapshot||typeof snapshot!=="object")return false;state=snapshot;return true;}
 function inject(html,selector,markup){
  if(typeof html!=="string"||!markup||typeof document==="undefined")return html;
  const template=document.createElement("template");template.innerHTML=html;
  const target=template.content.querySelector(selector);if(!target)return html;
  target.insertAdjacentHTML("beforeend",markup);
  return template.innerHTML;
 }

 function specializationBatchPlan(target=null){
  const s=target&&typeof target==="object"?target:currentState();
  const keys=Array.isArray(window.SPECIALIZATION_KEYS)?window.SPECIALIZATION_KEYS.slice():[];
  const cap=Math.max(0,Math.floor(Number(window.SPECIALIZATION_MAX_LEVEL)||60));
  if(!s||currentPhase(s)!==1||!keys.length||typeof window.specializationUpgradeCost!=="function")return {available:false,reason:"phase",steps:[],spend:0};
  if(typeof window.normalizeSpecializationState==="function")window.normalizeSpecializationState(s);
  const levels=Object.fromEntries(keys.map(key=>[key,Math.max(0,Math.min(cap,Math.floor(Number(s.specializations?.[key])||0)))]));
  let gold=Math.max(0,Math.floor(Number(s.gold)||0)),spend=0;
  const steps=[];
  while(true){
   const min=Math.min(...keys.map(key=>levels[key]));
   if(min>=cap)break;
   const key=keys.find(candidate=>levels[candidate]===min&&levels[candidate]<cap);
   if(!key)break;
   const next=levels[key]+1,cost=Math.max(0,Math.floor(Number(window.specializationUpgradeCost(next))||0));
   if(gold<cost)break;
   gold-=cost;spend+=cost;steps.push({key,from:levels[key],to:next,cost});levels[key]=next;
  }
  return {available:true,steps,spend,goldAfter:gold,levelsAfter:levels,complete:keys.every(key=>levels[key]>=cap)};
 }
 function specializationButtonHtml(){
  const plan=specializationBatchPlan();
  const disabled=!plan.available||!plan.steps.length;
  const label=plan.available&&plan.complete&&plan.steps.length===0?"專精已滿級":plan.available&&plan.steps.length===0?"金幣不足":"一鍵平均提升";
  return `<button class="btn primary specialization-batch-upgrade" onclick="batchUpgradeSpecializations()" ${disabled?"disabled":""}>${label}</button>`;
 }
 window.batchUpgradeSpecializations=function(){
  if(busy)return false;
  const s=currentState(),plan=specializationBatchPlan(s);if(!plan.available)return false;
  if(!plan.steps.length){alert(plan.complete?"8 項專精皆已滿級。":"目前金幣不足，無法再平均提升專精。");return false;}
  const before=Object.fromEntries(window.SPECIALIZATION_KEYS.map(key=>[key,Math.floor(Number(s.specializations?.[key])||0)]));
  const minBefore=Math.min(...Object.values(before)),maxAfter=Math.max(...Object.values(plan.levelsAfter));
  if(!confirm(`確定要一鍵平均提升專精嗎？\n本次共提升 ${plan.steps.length} 級，消耗金幣 ${plan.spend.toLocaleString()}。\n最低專精 Lv.${minBefore} → 最高可達 Lv.${maxAfter}`))return false;
  const snapshot=clone(s);if(!snapshot){alert("無法建立專精升級前存檔快照。");return false;}
  busy=true;
  try{
   if(currentPhase(s)!==1){alert("目前紀元不開放專精升級。");return false;}
   if(typeof window.normalizeSpecializationState==="function")window.normalizeSpecializationState(s);
   for(const step of plan.steps){
    const current=Math.floor(Number(s.specializations?.[step.key])||0);
    const expectedCost=Math.max(0,Math.floor(Number(window.specializationUpgradeCost(current+1))||0));
    if(current!==step.from||step.to!==current+1||expectedCost!==step.cost||s.gold<step.cost){restore(snapshot);alert("專精狀態或資源已變更，已取消本次一鍵提升。");if(typeof render==="function")render();return false;}
    s.gold-=step.cost;s.specializations[step.key]=step.to;
   }
   if(typeof save!=="function"||save(false)!==true){restore(snapshot);alert("存檔失敗，已回復專精升級前狀態。");if(typeof render==="function")render();return false;}
   if(typeof render==="function")render();
   return true;
  }finally{busy=false;}
 };

 function enhancementBatchPlan(target=null){
  const s=target&&typeof target==="object"?target:currentState(),phase=currentPhase(s);
  const slots=Array.isArray(window.ENHANCEMENT_SLOTS)?window.ENHANCEMENT_SLOTS.slice():[];
  if(!s||!slots.length||phase===3||typeof window.enhancementLevel!=="function"||typeof window.enhancementUpgradeCost!=="function")return {available:false,reason:"phase",steps:[]};
  if(typeof window.normalizeEnhancementState==="function")window.normalizeEnhancementState(s);
  const minFormal=typeof window.effectiveEnhancementMin==="function"?Math.max(0,Math.floor(Number(window.effectiveEnhancementMin(s))||0)):0;
  const cap=typeof window.effectiveEnhancementCap==="function"?Math.max(minFormal,Math.floor(Number(window.effectiveEnhancementCap(s))||0)):20;
  const levels=Object.fromEntries(slots.map(slot=>[slot,Math.max(0,Math.floor(Number(window.enhancementLevel(s,slot))||0))]));
  if(slots.some(slot=>levels[slot]<minFormal))return {available:false,reason:"formal-min",steps:[],levelsAfter:levels};
  let basic=Math.max(0,Math.floor(Number(s.enhancement?.basicStones)||0)),advanced=Math.max(0,Math.floor(Number(s.enhancement?.advancedStones)||0));
  let darkMatter=Math.max(0,Math.floor(Number(s.secondWorld?.darkMatter)||0)),darkEnergy=Math.max(0,Math.floor(Number(s.secondWorld?.darkEnergy)||0));
  const steps=[],spent={basic:0,advanced:0,darkMatter:0,darkEnergy:0};
  while(true){
   const min=Math.min(...slots.map(slot=>levels[slot]));
   if(min>=cap)break;
   const slot=slots.find(candidate=>levels[candidate]===min&&levels[candidate]<cap);if(!slot)break;
   const next=levels[slot]+1,cost=window.enhancementUpgradeCost(next,s);
   if(!cost?.available)break;
   const enough=cost.phase===2?darkMatter>=cost.darkMatter&&darkEnergy>=cost.darkEnergy:basic>=cost.basic&&advanced>=cost.advanced;
   if(!enough)break;
   if(cost.phase===2){darkMatter-=cost.darkMatter;darkEnergy-=cost.darkEnergy;spent.darkMatter+=cost.darkMatter;spent.darkEnergy+=cost.darkEnergy;}
   else{basic-=cost.basic;advanced-=cost.advanced;spent.basic+=cost.basic;spent.advanced+=cost.advanced;}
   steps.push({slot,from:levels[slot],to:next});levels[slot]=next;
  }
  return {available:true,phase,steps,spent,levelsAfter:levels,cap,complete:slots.every(slot=>levels[slot]>=cap)};
 }
 function enhancementButtonHtml(){
  const plan=enhancementBatchPlan();
  if(!plan.available)return "";
  const disabled=!plan.steps.length,label=plan.complete&&plan.steps.length===0?"已達最高強化":"平均最大強化";
  return `<button class="btn primary enhancement-batch-upgrade" onclick="batchUpgradeEnhancements()" ${disabled?"disabled":""}>${label}</button>`;
 }
 window.batchUpgradeEnhancements=function(){
  if(busy)return false;
  const plan=enhancementBatchPlan();if(!plan.available)return false;
  if(!plan.steps.length){alert(plan.complete?"五個裝備欄位皆已達目前紀元最高強化。":"目前資源不足，無法再維持平均提升。");return false;}
  const costText=plan.phase===2?`暗物質 ${plan.spent.darkMatter.toLocaleString()}、暗能量 ${plan.spent.darkEnergy.toLocaleString()}`:`基礎強化石 ${plan.spent.basic.toLocaleString()}、進階強化石 ${plan.spent.advanced.toLocaleString()}`;
  const minAfter=Math.min(...Object.values(plan.levelsAfter)),maxAfter=Math.max(...Object.values(plan.levelsAfter));
  if(!confirm(`確定要平均最大強化嗎？\n本次共提升 ${plan.steps.length} 次，消耗 ${costText}。\n完成後五部位為 +${minAfter}～+${maxAfter}。`))return false;
  if(typeof window.performEnhancementUpgrade!=="function"){alert("正式強化升級 owner 尚未載入。");return false;}
  busy=true;
  let completed=0;
  try{
   for(const step of plan.steps){
    const result=window.performEnhancementUpgrade(step.slot,step.from,step.to);
    if(!result?.ok){alert(`平均最大強化在完成 ${completed} 次後停止：${result?.reason||"強化失敗。"}`);if(typeof render==="function")render();return false;}
    completed++;
   }
   if(typeof render==="function")render();
   return true;
  }finally{busy=false;}
 };

 const firstSpecializationPage=typeof window.specializationPage==="function"?window.specializationPage:null;
 if(firstSpecializationPage)window.specializationPage=function(){
  const html=firstSpecializationPage();
  return currentPhase()===1?inject(html,".specialization-title-row",specializationButtonHtml()):html;
 };
 const firstEnhancementPage=typeof window.enhancementPage==="function"?window.enhancementPage:null;
 if(firstEnhancementPage)window.enhancementPage=function(){
  const html=firstEnhancementPage();
  return currentPhase()<=2?inject(html,".enhance-title",enhancementButtonHtml()):html;
 };

 window.specializationBatchPlan=specializationBatchPlan;
 window.enhancementBatchPlan=enhancementBatchPlan;
 window.GROWTH_BATCH_UI_VERSION=VERSION;
 window.GROWTH_BATCH_FIRST_RUN_SHARED_OWNER_VERSION=1;
})();
