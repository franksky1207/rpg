(function(){
 const SLOT_LABELS={weapon:"武器",helmet:"頭盔",armor:"鎧甲",shoes:"鞋子",accessory:"飾品"};
 function slots(){return Array.isArray(window.ENHANCEMENT_SLOTS)?window.ENHANCEMENT_SLOTS:["weapon","helmet","armor","shoes","accessory"];}
 function clampLevel(value){return Math.max(0,Math.min(Number(window.ENHANCEMENT_MAX_LEVEL)||20,Math.floor(Number(value)||0)));}
 function blankLevels(){return Object.fromEntries(slots().map(type=>[type,0]));}
 function levelOptions(value){const max=Number(window.ENHANCEMENT_MAX_LEVEL)||20;return Array.from({length:max+1},(_,i)=>`<option value="${i}" ${i===value?"selected":""}>+${i}</option>`).join("");}
 function ensure(){if(typeof window.normalizeEnhancementState==="function")window.normalizeEnhancementState(state);}
 function section(title,body){return `<details class="gm-hub-section"><summary>${title}</summary><div class="gm-hub-body">${body}</div></details>`;}
 function testLevel(type){return clampLevel(window.gmTestEnhancementLevels?.[type]);}
 function grid(mode){const test=mode==="test";return `<div class="gm-enhancement-grid">${slots().map(type=>{const lv=test?testLevel(type):(typeof window.enhancementLevel==="function"?window.enhancementLevel(state,type):clampLevel(state?.enhancement?.levels?.[type]));return `<label><span>${SLOT_LABELS[type]||type}</span><select class="btn" id="gmEnhance-${mode}-${type}" ${test?`onchange="gmSetTestEnhancement('${type}',this.value)"`:""}>${levelOptions(lv)}</select></label>`;}).join("")}</div>`;}
 function testSummary(){return `測試強化｜${slots().map(type=>`${SLOT_LABELS[type]||type} +${testLevel(type)}`).join("｜")}`;}

 window.gmTestEnhancementLevels=blankLevels();
 window.gmEnhancementManagementHtml=function(){ensure();return `<div class="muted gm-hub-note">直接修改玩家正式裝備欄位強化等級，套用後會寫入正式存檔；不影響目前持有的基礎／進階強化石。</div>${grid("manage")}<div class="controls"><button class="btn blue" onclick="gmApplyEnhancementLevels()">套用強化等級</button></div>`;};
 window.gmApplyEnhancementLevels=function(){ensure();const next={};slots().forEach(type=>{const el=document.getElementById(`gmEnhance-manage-${type}`);next[type]=clampLevel(el?el.value:state.enhancement.levels[type]);});slots().forEach(type=>{state.enhancement.levels[type]=next[type];});if(typeof window.normalizeEnhancementState==="function")window.normalizeEnhancementState(state);if(typeof save==="function")save();if(typeof render==="function")render();alert("強化等級已更新。");};

 window.gmSetTestEnhancement=function(type,value){if(!slots().includes(type))return;window.gmTestEnhancementLevels[type]=clampLevel(value);const info=document.getElementById("gmEnhancementTestInfo");if(info)info.textContent=testSummary();};
 window.gmUseCurrentEnhancementTestStatus=function(){ensure();slots().forEach(type=>{const lv=typeof window.enhancementLevel==="function"?window.enhancementLevel(state,type):clampLevel(state?.enhancement?.levels?.[type]);window.gmTestEnhancementLevels[type]=lv;const el=document.getElementById(`gmEnhance-test-${type}`);if(el)el.value=String(lv);});const info=document.getElementById("gmEnhancementTestInfo");if(info)info.textContent=testSummary();};
 window.gmEnhancementTestHtml=function(){return `<div class="muted gm-hub-note">選擇本次工作階段的五個裝備欄位強化測試等級；只改測試快照，不消耗強化石、不修改正式角色資料，重新整理後回到 +0。</div>${grid("test")}<div id="gmEnhancementTestInfo" class="muted" style="margin-top:10px">${testSummary()}</div>`;};
 window.gmTestEnhancementLevel=function(type){return testLevel(type);};
 window.gmTestEnhancedEquippedStats=function(){
  const levels=Object.fromEntries(slots().map(type=>[type,testLevel(type)]));
  return typeof window.equippedStatsWithEnhancementLevels==="function"?window.equippedStatsWithEnhancementLevels(levels):(typeof window.rawEquippedStats==="function"?window.rawEquippedStats():equippedStats());
 };
 window.gmTestPlayerStatsWithEnhancement=function(){const vip=Math.max(0,Math.min(Number(window.VIP_MAX_LEVEL)||20,Math.floor(Number(window.gmTestVipLevel)||0)));const base=window.gmTestEnhancedEquippedStats();return createSpecialPlayerSnapshot(playerCombatStats(base,vip));};

 // 單一「目前狀態」同步 VIP、專精、強化；沿用 VIP GM 原按鈕，不新增第二顆。
 const baseUseCurrentTestStatus=window.gmUseCurrentTestStatus;
 window.gmUseCurrentTestStatus=function(){if(typeof baseUseCurrentTestStatus==="function")baseUseCurrentTestStatus();window.gmUseCurrentEnhancementTestStatus();};

 // 所有既有 GM 戰鬥測試都經 gmTestPlayerStats 取得玩家快照；在此統一接入測試強化。
 window.gmTestPlayerStats=function(){return window.gmTestPlayerStatsWithEnhancement();};
 window.gmTestEnhancementLabel=function(){return testSummary();};

 function installStyles(){if(document.getElementById("enhancementGmStyles"))return;const style=document.createElement("style");style.id="enhancementGmStyles";style.textContent=`.gm-enhancement-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px;margin-bottom:10px}.gm-enhancement-grid label{display:flex;flex-direction:column;gap:5px;color:#d8c49a;font-size:13px}.gm-enhancement-grid select{width:100%}@media(max-width:760px){.gm-enhancement-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}}`;document.head.appendChild(style);}

 const baseGmHtml=window.gmHtml;
 if(typeof baseGmHtml==="function")window.gmHtml=function(){
  let html=baseGmHtml();
  const manageActive=`class="gm-hub-tab active" onclick="gmHubSwitch('manage')"`;
  if(html.includes(manageActive)){
   const marker='<details class="gm-hub-section"><summary>副本管理</summary>';
   const block=section("強化管理",window.gmEnhancementManagementHtml());
   return html.includes(marker)?html.replace(marker,block+marker):html.replace('<div class="controls gm-hub-close">',block+'<div class="controls gm-hub-close">');
  }
  const testMarker='<details class="gm-hub-section"><summary>特殊怪測試</summary>';
  const testBlock=section("強化測試",window.gmEnhancementTestHtml());
  return html.includes(testMarker)?html.replace(testMarker,testBlock+testMarker):html.replace('<div class="controls gm-hub-close">',testBlock+'<div class="controls gm-hub-close">');
 };
 installStyles();
})();
