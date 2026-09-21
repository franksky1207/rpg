(function(){
 let gmHubTab="manage";
 const gmHubOpenSections=new Set();
 const ENHANCEMENT_SLOT_LABELS={weapon:"武器",helmet:"頭盔",armor:"鎧甲",shoes:"鞋子",accessory:"飾品"};

 function installGmHubStyles(){
  if(document.getElementById("gmHubStyles"))return;
  const style=document.createElement("style");
  style.id="gmHubStyles";
  style.textContent=`
   .gm-hub{margin-top:18px;border:1px solid #7c6844;background:#17140f;border-radius:14px;padding:16px}
   .gm-hub>h3{margin:0 0 12px;color:#f0d494}
   .gm-hub-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
   .gm-hub-tab{width:100%;padding:12px 14px;border-radius:10px;border:1px solid #5f543c;background:#242018;color:#d8c49a;cursor:pointer;font-weight:700}
   .gm-hub-tab.active{background:#5a4424;border-color:#b18a4b;color:#fff0c4}
   .gm-hub-section{border:1px solid #4a4232;border-radius:12px;background:#11151b;margin-top:10px;overflow:hidden}
   .gm-hub-section>summary{cursor:pointer;list-style:none;padding:13px 14px;color:#ebcb84;font-weight:700;background:#181b20}
   .gm-hub-section>summary::-webkit-details-marker{display:none}.gm-hub-section>summary::after{content:"＋";float:right;color:#a99b7f}.gm-hub-section[open]>summary::after{content:"－"}
   .gm-hub-body{padding:14px}.gm-hub-body .item{margin-top:0}.gm-hub-body input,.gm-hub-body select{max-width:100%}
   .gm-hub .btn.gm-create{background:#8a641f;border-color:#c99a43;color:#fff3cf}.gm-hub .btn.gm-create:hover{background:#9b7227;border-color:#ddb05b}
   .gm-hub-close{margin-top:14px}.gm-hub-note{margin-bottom:10px}
   .gm-dungeon-summary{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
   .gm-dungeon-summary-item{display:inline-flex;gap:5px;align-items:baseline}.gm-dungeon-summary-label{color:#b7ad99}.gm-dungeon-summary-value{color:#eee2c5;font-weight:700}
   .gm-dungeon-summary-sep{color:#8f846f}
   .gm-test-button-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}
   .gm-test-button-grid .btn{width:100%;white-space:normal}
   .gm-test-summary{display:grid;gap:5px}.gm-test-summary-title{font-weight:800;color:#e9d4a4;line-height:1.4}.gm-test-summary-line{color:#ded1b3;line-height:1.45;overflow-wrap:anywhere}.gm-test-context{margin-top:7px;line-height:1.45}
   @media(max-width:760px){.gm-hub{padding:12px}.gm-hub-tabs{position:sticky;top:58px;z-index:5;background:#17140f;padding:4px 0}.gm-hub-section>summary{padding:12px}.gm-hub-body{padding:11px}.gm-hub-body .controls{gap:7px}.gm-hub-body .controls>.btn,.gm-hub-body .controls>label{max-width:100%}.gm-test-button-grid{grid-template-columns:1fr}.gm-test-button-grid .btn{padding:10px 12px}.gm-dungeon-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.gm-dungeon-summary-item{display:flex;flex-direction:column;gap:2px;background:#12151a;border:1px solid #3f3a31;border-radius:8px;padding:9px 10px;min-width:0}.gm-dungeon-summary-label{font-size:12px}.gm-dungeon-summary-value{font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gm-dungeon-summary-sep{display:none}.gm-test-summary{gap:4px}.gm-test-summary-title{font-size:14px}.gm-test-summary-line{font-size:13px}}
  `;
  document.head.appendChild(style);
 }

 window.gmEnhancementSlotLabel=function(type){return ENHANCEMENT_SLOT_LABELS[type]||String(type);};
 function enhancementOptions(value){
  const max=Math.max(0,Math.floor(Number(window.ENHANCEMENT_MAX_LEVEL)||0));
  return Array.from({length:max+1},(_,i)=>`<option value="${i}" ${i===value?"selected":""}>+${i}</option>`).join("");
 }
 function enhancementGrid(mode){
  const test=mode==="test",slots=window.gmTestEnhancementSlots();
  return `<div class="gm-enhancement-grid">${slots.map(type=>{
   const lv=test?window.gmTestEnhancementLevel(type):(typeof enhancementLevel==="function"?enhancementLevel(state,type):window.gmClampTestEnhancementLevel(state?.enhancement?.levels?.[type]));
   return `<label><span>${window.gmEnhancementSlotLabel(type)}</span><select class="btn" id="gmEnhance-${mode}-${type}" ${test?`onchange="gmSetTestEnhancement('${type}',this.value)"`:""}>${enhancementOptions(lv)}</select></label>`;
  }).join("")}</div>`;
 }
 window.gmEnhancementManagementHtml=function(){
  if(typeof normalizeEnhancementState==="function")normalizeEnhancementState(state);
  return `<div class="muted gm-hub-note">直接修改玩家正式裝備欄位強化等級；套用後寫入正式存檔，不影響目前持有的強化石。</div>${enhancementGrid("manage")}<div class="controls"><button class="btn blue" onclick="gmApplyEnhancementLevels()">套用強化等級</button></div>`;
 };
 window.gmApplyEnhancementLevels=function(){
  if(typeof normalizeEnhancementState==="function")normalizeEnhancementState(state);
  window.gmTestEnhancementSlots().forEach(type=>{
   const el=document.getElementById(`gmEnhance-manage-${type}`);
   state.enhancement.levels[type]=window.gmClampTestEnhancementLevel(el?el.value:state.enhancement.levels[type]);
  });
  if(typeof normalizeEnhancementState==="function")normalizeEnhancementState(state);
  if(typeof save==="function")save();
  if(typeof render==="function")render();
  alert("強化等級已更新。");
 };
 window.gmEnhancementTestHtml=function(){return `<div class="muted gm-hub-note">選擇本次工作階段的裝備欄位強化測試等級；只影響 GM 測試快照，不消耗強化石、不修改正式角色資料。</div>${enhancementGrid("test")}<div id="gmEnhancementTestInfo" class="muted" style="margin-top:10px">${gmTestEnhancementLabel()}</div>`;};

 window.gmTestSpecializationLabel=function(){
  const get=key=>specializationPercentBonus(key,true);
  return `專精｜先制傷害 +${get("initiative")}%｜連擊率 ${get("combo")}%｜穿透率 ${get("penetration")}%｜反擊率 ${get("counter")}%｜汲取率 ${get("drain")}%`;
 };
 window.gmTestSummaryHtml=function(title,runLabel,vipText,specText=null){
  const enhancementText=typeof gmTestEnhancementLabel==="function"?gmTestEnhancementLabel():"";
  const markText=typeof gmTestMarkLabel==="function"?gmTestMarkLabel():"";
  return `<div class="gm-test-summary"><div class="gm-test-summary-title">${title}・${runLabel}</div><div class="gm-test-summary-line">${vipText}</div><div class="gm-test-summary-line">${specText||gmTestSpecializationLabel()}</div>${enhancementText?`<div class="gm-test-summary-line">${enhancementText}</div>`:""}${markText?`<div class="gm-test-summary-line">${markText}</div>`:""}</div>`;
 };

 function specialOptions(){
  const tierLabel={low:"低",mid:"中",high:"高"};
  const selected=(typeof gmSpecialBatchSelectedId==="string"&&gmSpecialBatchSelectedId)?gmSpecialBatchSelectedId:(SPECIAL_MONSTERS[0]?.id||"");
  return SPECIAL_MONSTERS.map(x=>`<option value="${x.id}" ${x.id===selected?"selected":""}>${x.name}（${tierLabel[x.tier]||"低"}）</option>`).join("");
 }
 function gearOptions(){return {quality:QUALITY.map((q,i)=>`<option value="${i}" ${i===4?"selected":""}>${q.n}</option>`).join(""),type:`<option value="all">全部</option>`+EQUIPMENT_TYPES.map(type=>`<option value="${type}">${equipmentTypeLabel(type)}</option>`).join("")};}
 function mapMonsterSelection(){return typeof getMapMonsterGmSelection==="function"?getMapMonsterGmSelection():{regionIdx:0,mapIdx:0,eIdx:0};}
 function mapMonsterRegionOptions(){const s=mapMonsterSelection();return WORLD_REGIONS.map((region,i)=>`<option value="${i}" ${i===s.regionIdx?"selected":""}>${region.name}（Lv.${region.min}～${region.max}）</option>`).join("");}
 function mapMonsterMapOptions(regionIdx=0){const s=mapMonsterSelection();if(typeof getMapMonsterGmMapOptions==="function")return getMapMonsterGmMapOptions(regionIdx,s.mapIdx);const region=WORLD_REGIONS[Math.max(0,Math.min(WORLD_REGIONS.length-1,Number(regionIdx)||0))]||WORLD_REGIONS[0];if(!region)return "";return MAPS.slice(region.mapStart,region.mapEnd+1).map((map,offset)=>{const i=region.mapStart+offset;return `<option value="${i}" ${i===s.mapIdx?"selected":""}>${i+1}. ${map.name}（Lv.${map.min}～${map.max}）</option>`;}).join("");}
 function mapMonsterEnemyOptions(mapIdx=0){const s=mapMonsterSelection();if(typeof getMapMonsterGmEnemyOptions==="function")return getMapMonsterGmEnemyOptions(mapIdx,s.eIdx);const i=Math.max(0,Math.min(MAPS.length-1,Number(mapIdx)||0));return MAPS[i].enemies.map((e,j)=>`<option value="${j}" ${i===s.mapIdx&&j===s.eIdx?"selected":""}>${e[2]==="boss"?"Boss":e[2]==="elite"?"菁英":"普通"}｜${e[0]} Lv.${e[1]}</option>`).join("");}

 function generalManagementHtml(){
  const g=gearOptions();
  const universe=typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered();
  const cap=typeof window.effectiveLevelCap==="function"?window.effectiveLevelCap(state):MAX_LEVEL;
  const worldLabel=universe?"宇宙紀元":"銀河紀元";
  const swSelection=typeof gmSecondWorldGearSelection==="function"?gmSecondWorldGearSelection():{regionIdx:0,bossIdx:0};
  const swRegionOptions=typeof gmSecondWorldGearRegionOptions==="function"?gmSecondWorldGearRegionOptions():"";
  const swBossOptions=typeof gmSecondWorldGearBossOptions==="function"?gmSecondWorldGearBossOptions():"";
  const swQuality=QUALITY.slice(1).map((q,i)=>`<option value="${i+1}" ${i+1===4?"selected":""}>${q.n}</option>`).join("");
  const swType=`<option value="all">全部 5 部位</option>`+EQUIPMENT_TYPES.map(type=>`<option value="${type}">${equipmentTypeLabel(type)}</option>`).join("");
  const swGear=universe?`<div class="item" style="margin-top:12px"><b>產生宇宙紀元裝備</b><div class="muted" style="margin-top:5px">依正式「區域 → Boss」命名與世界 2 屬性公式產生；裝備等級自動取 min(目前角色等級, Boss 等級)。</div><div class="controls" style="align-items:end;margin-top:8px"><label>區域<br><select id="gmSecondWorldGearRegion" class="btn" onchange="gmSecondWorldGearChangeRegion()">${swRegionOptions}</select></label><label>Boss<br><select id="gmSecondWorldGearBoss" class="btn" onchange="gmSecondWorldGearChangeBoss()">${swBossOptions}</select></label><label>品質<br><select id="gmSecondWorldGearQuality" class="btn">${swQuality}</select></label><label>部位<br><select id="gmSecondWorldGearType" class="btn">${swType}</select></label><button class="btn gm-create" onclick="gmCreateSecondWorldGear()">產生裝備</button></div></div>`:"";
  const resourceButtons=universe?`<button class="btn" onclick="gmDarkMatter()">指定暗物質</button><button class="btn" onclick="gmDarkEnergy()">指定暗能量</button>`:`<button class="btn" onclick="gmGold()">指定金幣</button>`;
  return `<div class="notice gm-hub-note">目前世界：${worldLabel}　／　角色有效等級上限 Lv.${cap}</div><div class="controls"><button class="btn" onclick="gmLevel()">指定等級</button>${resourceButtons}<button class="btn" onclick="gmSetWorldProgress()">指定銀河紀元解鎖進度</button><button class="btn danger" onclick="gmResetVip()">重置 VIP（等級＋積分）</button></div>
  <div class="item" style="margin-top:12px"><b>產生銀河紀元裝備</b><div class="controls" style="align-items:end;margin-top:8px"><label>品質<br><select id="gmGearQuality" class="btn">${g.quality}</select></label><label>等級<br><input id="gmGearLevel" class="btn" type="number" inputmode="numeric" min="1" max="${MAX_LEVEL}" step="1" value="${Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(state.level)||1)))}"></label><label>部位<br><select id="gmGearType" class="btn">${g.type}</select></label><button class="btn gm-create" onclick="gmCreateGear()">產生裝備</button></div></div>${swGear}`;
 }
 function specialTestHtml(){const result=(typeof gmSpecialBatchResultHtml==="function"&&typeof gmSpecialBatchResult!=="undefined"&&gmSpecialBatchResult)?gmSpecialBatchResultHtml(gmSpecialBatchResult.special,gmSpecialBatchResult.summary):"";return `<div class="muted gm-hub-note">依目前角色基礎能力，針對指定特殊怪模擬 ${GM_TEST_RUNS} 次。GM 測試為沙盒模式，不修改正式角色資料。</div><div class="controls" style="margin-top:10px;align-items:end"><label>特殊怪<br><select id="gmSpecialMonster" class="btn" onchange="gmSetSpecialBatchSelected(this.value)">${specialOptions()}</select></label><button id="gmSpecialBatchStartBtn" class="btn blue" onclick="gmStartSpecialBattle()">開始測試（${GM_TEST_RUNS} 次）</button></div><div id="gmSpecialBatchResult" style="margin-top:12px">${result}</div>`;}
 function mapMonsterTestHtml(){const s=mapMonsterSelection(),result=typeof getMapMonsterGmTestHtml==="function"?getMapMonsterGmTestHtml():"",secondSelection=typeof getSecondWorldBossGmSelection==="function"?getSecondWorldBossGmSelection():{regionIdx:0,bossIdx:0},secondRegionOptions=typeof getSecondWorldBossGmRegionOptions==="function"?getSecondWorldBossGmRegionOptions():"",secondBossOptions=typeof getSecondWorldBossGmOptions==="function"?getSecondWorldBossGmOptions(secondSelection.regionIdx):"",secondResult=typeof getSecondWorldBossGmTestHtml==="function"?getSecondWorldBossGmTestHtml():"";return `<div class="muted gm-hub-note">快速單怪功能測試：銀河紀元使用「區域 → 地圖 → 怪物」；宇宙紀元因每區直接配置 10 隻 Boss，使用「區域 → 怪物」。兩者皆為沙盒模式，不修改正式角色資料。</div><div class="item"><b>銀河紀元</b><div class="controls" style="align-items:end;margin-top:8px"><label>區域<br><select id="gmMapMonsterRegion" class="btn" onchange="gmMapMonsterChangeRegion()">${mapMonsterRegionOptions()}</select></label><label>地圖<br><select id="gmMapMonsterMap" class="btn" onchange="gmMapMonsterChangeMap()">${mapMonsterMapOptions(s.regionIdx)}</select></label><label>怪物<br><select id="gmMapMonsterEnemy" class="btn" onchange="gmMapMonsterChangeEnemy()">${mapMonsterEnemyOptions(s.mapIdx)}</select></label><button id="gmMapMonsterStartBtn" class="btn blue" onclick="gmStartMapMonsterTest()">開始測試（${GM_TEST_RUNS} 次）</button></div><div id="gmMapMonsterTestResult" style="margin-top:12px">${result}</div></div><div class="item" style="margin-top:10px"><b>宇宙紀元 Boss</b><div class="controls" style="align-items:end;margin-top:8px"><label>區域<br><select id="gmSecondWorldRegion" class="btn" onchange="gmSecondWorldRegionChange()">${secondRegionOptions}</select></label><label style="flex:1 1 320px">怪物<br><select id="gmSecondWorldBoss" class="btn" onchange="gmSecondWorldBossChange()">${secondBossOptions}</select></label><button id="gmSecondWorldBossStartBtn" class="btn blue" onclick="gmStartSecondWorldBossTest()">開始測試（${GM_TEST_RUNS} 次）</button></div><div class="muted" style="margin-top:7px">每個區域固定顯示該區 10 隻主線 Boss；使用正式宇宙 Boss 能力公式＋Boss 隨機特性，不結算 EXP、暗物質、暗能量、裝備或主線進度。</div><div id="gmSecondWorldBossTestResult" style="margin-top:12px">${secondResult}</div></div>`;}
 function bountyTestHtml(){const result=typeof getBountyGmTestHtml==="function"?getBountyGmTestHtml():"";return `<div class="muted gm-hub-note">敵人以不含 VIP 的目前角色能力生成；玩家戰鬥套用測試 VIP、測試專精、測試強化與測試印記。GM 測試不扣今日懸賞額度、不修改正式角色資料。</div><div class="gm-test-button-grid"><button class="btn blue" onclick="gmSimulateBounty('normal')">普通懸賞測試（${GM_TEST_RUNS} 次）</button><button class="btn blue" onclick="gmSimulateBounty('high')">高級懸賞測試（${GM_TEST_RUNS} 次）</button><button class="btn blue" onclick="gmSimulateBounty('danger')">危險懸賞測試（${GM_TEST_RUNS} 次）</button></div><div id="gmBountyTestResult" style="margin-top:12px">${result}</div>`;}
 function arenaTestHtml(){const result=typeof getArenaGmTestHtml==="function"?getArenaGmTestHtml():"";return `<div class="muted gm-hub-note">敵人以不含 VIP 的目前角色能力生成；玩家三連戰鎖定測試 VIP、測試專精、測試強化與測試印記。GM 測試不修改正式角色資料。</div><div class="gm-test-button-grid"><button class="btn blue" onclick="gmSimulateArena('normal')">普通競技場測試（${GM_TEST_RUNS} 次）</button><button class="btn blue" onclick="gmSimulateArena('hard')">困難競技場測試（${GM_TEST_RUNS} 次）</button><button class="btn blue" onclick="gmSimulateArena('extreme')">極限競技場測試（${GM_TEST_RUNS} 次）</button></div><div id="gmArenaTestResult" style="margin-top:12px">${result}</div>`;}
 function voidMirageTestHtml(){const result=typeof getVoidMirageGmTestHtml==="function"?getVoidMirageGmTestHtml():"",next=typeof getVoidMirageStartFloor==="function"?getVoidMirageStartFloor():1;return `<div class="muted gm-hub-note">虛空敵人維持固定樓層公式；玩家戰鬥套用測試 VIP、測試專精、測試強化與測試印記。GM 測試不修改正式角色資料。</div><div class="controls" style="align-items:end"><label>指定樓層／起始樓層<br><input id="gmVoidMirageFloor" type="number" min="1" step="1" value="${next}" style="width:180px"></label><button class="btn gm-create" onclick="gmPreviewVoidMirageFloor()">查看單層能力</button><button class="btn blue" onclick="gmSimulateVoidMirageClimb()">從此層連續爬塔</button></div><div id="gmVoidMirageTestResult" style="margin-top:12px">${result}</div>`;}

 function hubHtml(){
  const manage=gmHubTab==="manage";
  const testStatus=manage?"":(typeof gmTestCurrentStatusHtml==="function"?gmTestCurrentStatusHtml():"");
  const sections=typeof window.gmHubRegisteredSectionsHtml==="function"?window.gmHubRegisteredSectionsHtml(gmHubTab):"";
  return `<div class="gm-hub"><h3>管理／GM 模式</h3><div class="gm-hub-tabs"><button class="gm-hub-tab ${manage?"active":""}" onclick="gmHubSwitch('manage')">管理</button><button class="gm-hub-tab ${manage?"":"active"}" onclick="gmHubSwitch('test')">測試</button></div>${testStatus}${sections}<div class="controls gm-hub-close"><button class="btn" onclick="state.gm=false;save();render()">關閉管理模式</button></div></div>`;
 }

 window.gmGeneralManagementHtml=generalManagementHtml;
 window.gmSpecialTestHtml=specialTestHtml;
 window.gmMapMonsterTestHtml=mapMonsterTestHtml;
 window.gmBountyTestHtml=bountyTestHtml;
 window.gmArenaTestHtml=arenaTestHtml;
 window.gmVoidMirageTestHtml=voidMirageTestHtml;

 window.gmResetVip=function(){
  if(!confirm("確定要將 VIP 等級與 VIP 積分全部重置為 0 嗎？"))return;
  const beforeMax=playerCombatStats().hp;
  const beforeHp=Math.max(0,Math.min(beforeMax,Number(state.hp)||0));
  const ratio=beforeMax>0?beforeHp/beforeMax:1;
  const wasFull=beforeHp>=beforeMax;
  state.vipLevel=0;
  state.vipPoints=0;
  const afterMax=playerCombatStats().hp;
  state.hp=wasFull?afterMax:Math.max(0,Math.min(afterMax,Math.round(afterMax*ratio)));
  save();render();
 };
 window.gmHubSectionToggle=function(id,open){const key=String(id||"");if(!key)return;if(open)gmHubOpenSections.add(key);else gmHubOpenSections.delete(key);};
 window.gmHubSectionIsOpen=function(id){return gmHubOpenSections.has(String(id||""));};
 window.gmHubSwitch=function(tab){gmHubTab=tab==="test"?"test":"manage";render();};
 window.GM_HUB_SECTION_STATE_VERSION=1;
 window.GM_GEAR_LEVEL_INPUT_VERSION=1;
 window.GM_ENHANCEMENT_HUB_VERSION=5;
 gmHtml=function(){installGmHubStyles();return hubHtml();};
 installGmHubStyles();
})();
