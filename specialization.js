(function(){
 const SPECIALIZATION_MAX_LEVEL=30;
 const SPECIALIZATION_KEYS=["training","scavenge","appraisal","initiative","combo","penetration","counter","drain"];
 const SPECIALIZATION_DEFS={
  training:{name:"實戰訓練",perLevel:"每級 EXP +5%",desc:"提升擊敗怪物取得的經驗值。"},
  scavenge:{name:"搜刮技巧",perLevel:"每級怪物金幣 +5%",desc:"提升怪物直接掉落的金幣。"},
  appraisal:{name:"鑑價技巧",perLevel:"每級裝備售價 +5%",desc:"提升出售裝備取得的金幣。"},
  initiative:{name:"先制技巧",perLevel:"每級第一擊傷害 +2%",desc:"提升每場戰鬥第一次主動攻擊的傷害。"},
  combo:{name:"連擊技巧",perLevel:"每級連擊率 +1%",desc:"攻擊時有機率追加一次 50% 傷害的攻擊，追加攻擊可再次觸發連擊。"},
  penetration:{name:"穿透技巧",perLevel:"每級穿透率 +1%",desc:"攻擊時有機率忽略敵人 25% 防禦。"},
  counter:{name:"反擊技巧",perLevel:"每級反擊率 +1%",desc:"受到敵人有效攻擊後有機率立即反擊，反擊造成 40% 傷害。"},
  drain:{name:"汲取技巧",perLevel:"每級汲取率 +1%",desc:"造成傷害時有機率回復生命，觸發時回復本次實際傷害的 10%。"}
 };
 let upgradeActionBusy=false;

 function blankSpecializations(){return Object.fromEntries(SPECIALIZATION_KEYS.map(key=>[key,0]));}
 function clampSpecializationLevel(value){return Math.max(0,Math.min(SPECIALIZATION_MAX_LEVEL,Math.floor(Number(value)||0)));}
 function normalizeSpecializationState(target){
  if(!target||typeof target!=="object")return false;
  if(!target.specializations||typeof target.specializations!=="object")target.specializations={};
  let changed=false;
  SPECIALIZATION_KEYS.forEach(key=>{const value=clampSpecializationLevel(target.specializations[key]);if(target.specializations[key]!==value){target.specializations[key]=value;changed=true;}});
  return changed;
 }
 function ensureSpecializationState(){return normalizeSpecializationState(state);}
 function specializationUpgradeCost(targetLevel){const lv=Math.max(1,Math.min(SPECIALIZATION_MAX_LEVEL,Math.floor(Number(targetLevel)||1)));return 1000*lv*lv;}
 function formalLevel(key){ensureSpecializationState();return clampSpecializationLevel(state.specializations[key]);}

 window.SPECIALIZATION_MAX_LEVEL=SPECIALIZATION_MAX_LEVEL;
 window.SPECIALIZATION_KEYS=SPECIALIZATION_KEYS.slice();
 window.SPECIALIZATION_DEFS=SPECIALIZATION_DEFS;
 window.createBlankSpecializations=blankSpecializations;
 window.normalizeSpecializationState=normalizeSpecializationState;
 window.ensureSpecializationState=ensureSpecializationState;
 window.specializationUpgradeCost=specializationUpgradeCost;
 window.gmTestSpecializations=blankSpecializations();
 window.specializationLevel=function(key,useTest=false){if(!SPECIALIZATION_DEFS[key])return 0;return useTest?clampSpecializationLevel(window.gmTestSpecializations?.[key]):formalLevel(key);};
 window.specializationLevelsSnapshot=function(useTest=false){return Object.fromEntries(SPECIALIZATION_KEYS.map(key=>[key,window.specializationLevel(key,useTest)]));};
 window.specializationPercentBonus=function(key,useTest=false){const lv=window.specializationLevel(key,useTest);if(key==="training"||key==="scavenge"||key==="appraisal")return lv*5;if(key==="initiative")return lv*2;if(key==="combo"||key==="penetration"||key==="counter"||key==="drain")return lv;return 0;};
 window.specializationMultiplier=function(key,useTest=false){return 1+window.specializationPercentBonus(key,useTest)/100;};
 window.specializationAdjustedExp=function(base,useTest=false){return Math.max(0,Math.ceil((Number(base)||0)*window.specializationMultiplier("training",useTest)));};
 window.specializationAdjustedGold=function(base,useTest=false){return Math.max(0,Math.ceil((Number(base)||0)*window.specializationMultiplier("scavenge",useTest)));};
 window.specializationSellValue=function(item,useTest=false){const base=Math.max(0,Math.floor(Number(item?.sell)||0));return Math.max(0,Math.ceil(base*window.specializationMultiplier("appraisal",useTest)));};

 function effectLines(key,lv){if(key==="training")return [`EXP +${lv*5}%`];if(key==="scavenge")return [`怪物金幣 +${lv*5}%`];if(key==="appraisal")return [`裝備售價 +${lv*5}%`];if(key==="initiative")return [`第一擊傷害 +${lv*2}%`];if(key==="combo")return [`連擊率 ${lv}%`,`追加傷害 50%`];if(key==="penetration")return [`穿透率 ${lv}%`,`忽略防禦 25%`];if(key==="counter")return [`反擊率 ${lv}%`,`反擊傷害 40%`];if(key==="drain")return [`汲取率 ${lv}%`,`回復傷害 10%`];return [];}
 function specializationCard(key){const def=SPECIALIZATION_DEFS[key],lv=formalLevel(key),maxed=lv>=SPECIALIZATION_MAX_LEVEL,cost=maxed?0:specializationUpgradeCost(lv+1),enough=maxed||state.gold>=cost;return `<section class="specialization-card"><div class="specialization-card-head"><b>${def.name}</b><span>Lv.${lv} / ${SPECIALIZATION_MAX_LEVEL}</span></div><div class="specialization-effect">${effectLines(key,lv).map(x=>`<div>${x}</div>`).join("")}</div><div class="specialization-cost">${maxed?"已達最高等級":`${cost.toLocaleString()} 金幣`}</div><button class="btn specialization-upgrade" ${maxed||!enough?"disabled":""} onclick="upgradeSpecialization('${key}')">${maxed?"已滿級":"升級"}</button></section>`;}
 function specializationGuideHtml(){return `<details class="specialization-guide"><summary>專精說明</summary><div class="specialization-guide-body"><div class="muted">每項專精最高 Lv.${SPECIALIZATION_MAX_LEVEL}。使用金幣升級，升級後永久保留。</div>${SPECIALIZATION_KEYS.map(key=>{const d=SPECIALIZATION_DEFS[key];return `<div class="specialization-guide-row"><b>${d.name}</b><div>${d.desc}</div><div class="muted">${d.perLevel}</div></div>`;}).join("")}</div></details>`;}
 function specializationPage(){ensureSpecializationState();return `<div class="function-page specialization-page"><div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div><div class="card specialization-panel"><div class="specialization-title-row"><h2>專精</h2><div class="specialization-gold">金幣 <b>${state.gold.toLocaleString()}</b></div></div>${specializationGuideHtml()}<div class="specialization-grid">${SPECIALIZATION_KEYS.map(specializationCard).join("")}</div></div></div>`;}
 window.specializationPage=specializationPage;
 window.upgradeSpecialization=function(key){
  if(upgradeActionBusy||!SPECIALIZATION_DEFS[key])return;
  ensureSpecializationState();
  const lv=formalLevel(key);if(lv>=SPECIALIZATION_MAX_LEVEL)return;
  const next=lv+1,cost=specializationUpgradeCost(next),def=SPECIALIZATION_DEFS[key];
  if(state.gold<cost)return alert("金幣不足。");
  if(!confirm(`是否將「${def.name}」提升至 Lv.${next}？\n消耗金幣：${cost.toLocaleString()}`))return;
  upgradeActionBusy=true;
  try{
   const current=formalLevel(key);
   if(current!==lv)return;
   if(state.gold<cost)return alert("金幣不足。");
   state.gold-=cost;state.specializations[key]=next;save();render();
  }finally{setTimeout(()=>{upgradeActionBusy=false},300);}
 };

 function levelOptions(value){return Array.from({length:SPECIALIZATION_MAX_LEVEL+1},(_,i)=>`<option value="${i}" ${i===value?"selected":""}>Lv.${i}</option>`).join("");}
 function gmGrid(mode){const test=mode==="test";return `<div class="gm-specialization-grid">${SPECIALIZATION_KEYS.map(key=>{const value=test?window.specializationLevel(key,true):formalLevel(key);return `<label><span>${SPECIALIZATION_DEFS[key].name}</span><select class="btn" id="gmSpec-${mode}-${key}" ${test?`onchange="gmSetTestSpecialization('${key}',this.value)"`:""}>${levelOptions(value)}</select></label>`;}).join("")}</div>`;}
 function gmTestEconomyLabel(){const exp=window.specializationPercentBonus("training",true),gold=window.specializationPercentBonus("scavenge",true),sell=window.specializationPercentBonus("appraisal",true);return `測試效果：EXP +${exp}%　／　怪物金幣 +${gold}%　／　裝備售價 +${sell}%`;}
 window.gmSpecializationManagementHtml=function(){ensureSpecializationState();return `<div class="muted gm-hub-note">直接修改玩家正式專精等級，套用後會寫入正式存檔。</div>${gmGrid("manage")}<div class="controls"><button class="btn blue" onclick="gmApplySpecializations()">套用專精等級</button></div>`;};
 window.gmApplySpecializations=function(){ensureSpecializationState();SPECIALIZATION_KEYS.forEach(key=>{const el=document.getElementById(`gmSpec-manage-${key}`);if(el)state.specializations[key]=clampSpecializationLevel(el.value);});save();render();alert("專精等級已更新。");};
 window.gmSetTestSpecialization=function(key,value){if(!SPECIALIZATION_DEFS[key])return;window.gmTestSpecializations[key]=clampSpecializationLevel(value);const info=document.getElementById("gmSpecEconomyInfo");if(info)info.textContent=gmTestEconomyLabel();};
 window.gmSpecializationTestHtml=function(){return `<div class="muted gm-hub-note">選擇本次工作階段的專精測試等級；不修改正式角色資料，重新整理後回到 Lv.0。</div>${gmGrid("test")}<div id="gmSpecEconomyInfo" class="muted" style="margin-top:10px">${gmTestEconomyLabel()}</div>`;};

 function installStyles(){
  if(document.getElementById("specializationStyles"))return;
  const style=document.createElement("style");style.id="specializationStyles";style.textContent=`
   .specialization-panel{max-width:1100px;margin:0 auto}.specialization-title-row{display:flex;align-items:center;justify-content:space-between;gap:12px}.specialization-title-row h2{margin:0}.specialization-gold{color:#cdbb90}.specialization-gold b{color:#f0d494;font-size:18px;margin-left:5px}
   .specialization-guide{margin:14px 0 16px;border:1px solid #4a4232;border-radius:10px;background:#12161c;overflow:hidden}.specialization-guide>summary{cursor:pointer;list-style:none;padding:11px 13px;color:#ebcb84;font-weight:700}.specialization-guide>summary::-webkit-details-marker{display:none}.specialization-guide>summary::after{content:" ▼";font-size:11px}.specialization-guide[open]>summary::after{content:" ▲"}.specialization-guide-body{padding:0 13px 13px}.specialization-guide-row{padding:9px 0;border-top:1px solid #2a2f36;line-height:1.5}.specialization-guide-row b{color:#e9d4a4}
   .specialization-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.specialization-card{background:linear-gradient(180deg,#181d25,#10141a);border:1px solid #4a4232;border-radius:12px;padding:14px;min-width:0;display:flex;flex-direction:column}.specialization-card-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px}.specialization-card-head b{color:#f0d494;font-size:17px}.specialization-card-head span{color:#aaa69d;font-size:12px;white-space:nowrap}.specialization-effect{margin:12px 0;min-height:46px;line-height:1.55;color:#ece6d9}.specialization-cost{margin-top:auto;color:#cdbb90;font-size:13px;padding-bottom:9px}.specialization-upgrade{width:100%}.specialization-upgrade:disabled{opacity:.48;cursor:not-allowed;filter:none}
   .gm-specialization-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.gm-specialization-grid label{display:flex;flex-direction:column;gap:5px;color:#d8c49a;font-size:13px}.gm-specialization-grid select{width:100%}
   @media(max-width:760px){.specialization-panel{padding:12px}.specialization-title-row{align-items:baseline}.specialization-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.specialization-card{padding:10px;border-radius:10px}.specialization-card-head{display:block}.specialization-card-head b{display:block;font-size:15px}.specialization-card-head span{display:block;margin-top:2px}.specialization-effect{font-size:13px;min-height:42px;margin:9px 0}.specialization-cost{font-size:12px}.specialization-upgrade{padding:9px 6px}.specialization-guide{margin:10px 0 12px}.specialization-guide>summary{padding:9px 10px}.specialization-guide-body{padding:0 10px 10px}.gm-specialization-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}}
  `;document.head.appendChild(style);
 }
 installStyles();
})();