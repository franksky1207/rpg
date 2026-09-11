(function(){
 let gmHubTab="manage";

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

 window.gmTestSpecializationLabel=function(){
  const get=key=>typeof specializationPercentBonus==="function"?specializationPercentBonus(key,true):0;
  return `專精｜先制傷害 +${get("initiative")}%｜連擊率 ${get("combo")}%｜穿透率 ${get("penetration")}%｜反擊率 ${get("counter")}%｜汲取率 ${get("drain")}%`;
 };
 window.gmTestSummaryHtml=function(title,runLabel,vipText,specText=null){
  return `<div class="gm-test-summary"><div class="gm-test-summary-title">${title}・${runLabel}</div><div class="gm-test-summary-line">${vipText}</div><div class="gm-test-summary-line">${specText||gmTestSpecializationLabel()}</div></div>`;
 };

 function specialOptions(){
  const tierLabel={low:"低",mid:"中",high:"高"};
  const selected=(typeof gmSpecialBatchSelectedId==="string"&&gmSpecialBatchSelectedId)?gmSpecialBatchSelectedId:(SPECIAL_MONSTERS[0]?.id||"");
  return SPECIAL_MONSTERS.map(x=>`<option value="${x.id}" ${x.id===selected?"selected":""}>${x.name}（${tierLabel[x.tier]||"低"}）</option>`).join("");
 }
 function gearOptions(){return {quality:QUALITY.map((q,i)=>`<option value="${i}" ${i===4?"selected":""}>${q.n}</option>`).join(""),level:Array.from({length:MAX_LEVEL},(_,i)=>{const lv=i+1;return `<option value="${lv}" ${lv===state.level?"selected":""}>Lv.${lv}</option>`;}).join(""),type:`<option value="all">全部</option>`+EQUIPMENT_TYPES.map(type=>`<option value="${type}">${equipmentTypeLabel(type)}</option>`).join("")};}
 function mapMonsterSelection(){return typeof getMapMonsterGmSelection==="function"?getMapMonsterGmSelection():{mapIdx:0,eIdx:0};}
 function mapMonsterMapOptions(){const s=mapMonsterSelection();return MAPS.map((map,i)=>`<option value="${i}" ${i===s.mapIdx?"selected":""}>${i+1}. ${map.chapter?map.chapter+"｜":""}${map.name}（Lv.${map.min}～${map.max}）</option>`).join("");}
 function mapMonsterEnemyOptions(mapIdx=0){const i=Math.max(0,Math.min(MAPS.length-1,Number(mapIdx)||0)),s=mapMonsterSelection();return MAPS[i].enemies.map((e,j)=>`<option value="${j}" ${i===s.mapIdx&&j===s.eIdx?"selected":""}>${e[2]==="boss"?"Boss":e[2]==="elite"?"菁英":"普通"}｜${e[0]} Lv.${e[1]}</option>`).join("");}
 function dungeonStateSafe(){return typeof ensureDungeonProgressState==="function"?ensureDungeonProgressState():(state.dungeon||{progress:0,attempts:0,points:0});}

 function generalManagementHtml(){
  const g=gearOptions();
  return `<div class="notice gm-hub-note">目前世界：Lv1～${MAX_LEVEL}　／　${MAPS.length} 張地圖</div><div class="controls"><button class="btn" onclick="gmLevel()">指定等級</button><button class="btn" onclick="gmGold()">指定金幣</button><button class="btn" onclick="gmSetWorldProgress()">指定解鎖到等級關卡</button><button class="btn" onclick="gmHeal()">補滿 HP</button><button class="btn danger" onclick="gmClearInventory()">清空背包</button></div>
  <div class="item" style="margin-top:12px"><b>商店管理</b><div class="controls"><button class="btn blue" onclick="gmRefreshShop()">刷新商店</button><button class="btn" onclick="gmResetShop()">重置商店（100 金幣）</button></div></div>
  <div class="item" style="margin-top:12px"><b>產生裝備</b><div class="controls" style="align-items:end"><label>品質<br><select id="gmGearQuality" class="btn">${g.quality}</select></label><label>等級<br><select id="gmGearLevel" class="btn">${g.level}</select></label><label>部位<br><select id="gmGearType" class="btn">${g.type}</select></label><button class="btn gm-create" onclick="gmCreateGear()">產生裝備</button></div></div>`;
 }
 function dungeonManagementHtml(){
  const d=dungeonStateSafe(),progress=Math.round((Number(d.progress)||0)*100)/100,attempts=Math.floor(Number(d.attempts)||0),vip=state.vipLevel||0,points=Math.floor(Number(state.vipPoints)||0);
  return `<div class="notice gm-hub-note gm-dungeon-summary"><div class="gm-dungeon-summary-item"><span class="gm-dungeon-summary-label">副本進度</span><span class="gm-dungeon-summary-value">${progress}%</span></div><span class="gm-dungeon-summary-sep">／</span><div class="gm-dungeon-summary-item"><span class="gm-dungeon-summary-label">可挑戰次數</span><span class="gm-dungeon-summary-value">${attempts} 次</span></div><span class="gm-dungeon-summary-sep">／</span><div class="gm-dungeon-summary-item"><span class="gm-dungeon-summary-label">VIP 等級</span><span class="gm-dungeon-summary-value">VIP${vip}</span></div><span class="gm-dungeon-summary-sep">／</span><div class="gm-dungeon-summary-item"><span class="gm-dungeon-summary-label">VIP 積分</span><span class="gm-dungeon-summary-value">${points}</span></div></div><div class="controls" style="align-items:end"><label>副本次數累積進度 %<br><input id="gmDungeonProgress" type="number" min="0" step="0.01" value="${d.progress}" style="width:170px"></label><label>副本可挑戰次數<br><input id="gmDungeonAttempts" type="number" min="0" step="1" value="${d.attempts}" style="width:150px"></label><label>VIP 積分<br><input id="gmDungeonPoints" type="number" min="0" step="1" value="${state.vipPoints||0}" style="width:150px"></label><button class="btn blue" onclick="gmApplyDungeonValues()">套用</button><button class="btn danger" onclick="gmResetVip()">重置 VIP（等級＋積分）</button></div><div class="muted" style="margin-top:7px">調低 VIP 積分不會降低已解鎖 VIP 等級；如需回到 VIP0，請使用「重置 VIP」。</div>`;
 }
 function specialTestHtml(){const result=(typeof gmSpecialBatchResultHtml==="function"&&typeof gmSpecialBatchResult!=="undefined"&&gmSpecialBatchResult)?gmSpecialBatchResultHtml(gmSpecialBatchResult.special,gmSpecialBatchResult.summary):"";return `<div class="muted gm-hub-note">依目前角色基礎能力，針對指定特殊怪模擬 ${GM_TEST_RUNS} 次。GM 測試為沙盒模式，不修改正式角色資料。</div><div class="controls" style="margin-top:10px;align-items:end"><label>特殊怪<br><select id="gmSpecialMonster" class="btn" onchange="gmSetSpecialBatchSelected(this.value)">${specialOptions()}</select></label><button id="gmSpecialBatchStartBtn" class="btn blue" onclick="gmStartSpecialBattle()">開始測試（${GM_TEST_RUNS} 次）</button></div><div id="gmSpecialBatchResult" style="margin-top:12px">${result}</div>`;}
 function mapMonsterTestHtml(){const s=mapMonsterSelection(),result=typeof getMapMonsterGmTestHtml==="function"?getMapMonsterGmTestHtml():"";return `<div class="muted gm-hub-note">依目前角色基礎能力，針對指定主線地圖怪模擬 ${GM_TEST_RUNS} 次。GM 測試為沙盒模式，不修改正式角色資料。</div><div class="controls" style="align-items:end"><label>地圖<br><select id="gmMapMonsterMap" class="btn" onchange="gmMapMonsterChangeMap()">${mapMonsterMapOptions()}</select></label><label>怪物<br><select id="gmMapMonsterEnemy" class="btn" onchange="gmMapMonsterChangeEnemy()">${mapMonsterEnemyOptions(s.mapIdx)}</select></label><button id="gmMapMonsterStartBtn" class="btn blue" onclick="gmStartMapMonsterTest()">開始測試（${GM_TEST_RUNS} 次）</button></div><div id="gmMapMonsterTestResult" style="margin-top:12px">${result}</div>`;}
 function bountyTestHtml(){const result=typeof getBountyGmTestHtml==="function"?getBountyGmTestHtml():"";return `<div class="muted gm-hub-note">敵人以不含 VIP 的目前角色能力生成；玩家戰鬥套用測試 VIP 與測試專精。GM 測試不扣副本次數、不修改正式角色資料。</div><div class="gm-test-button-grid"><button class="btn blue" onclick="gmSimulateBounty100('normal')">普通懸賞測試（${GM_TEST_RUNS} 次）</button><button class="btn blue" onclick="gmSimulateBounty100('high')">高級懸賞測試（${GM_TEST_RUNS} 次）</button><button class="btn blue" onclick="gmSimulateBounty100('danger')">危險懸賞測試（${GM_TEST_RUNS} 次）</button></div><div id="gmBountyTestResult" style="margin-top:12px">${result}</div>`;}
 function arenaTestHtml(){const result=typeof getArenaGmTestHtml==="function"?getArenaGmTestHtml():"";return `<div class="muted gm-hub-note">敵人以不含 VIP 的目前角色能力生成；玩家三連戰鎖定測試 VIP 並套用測試專精。GM 測試不修改正式角色資料。</div><div class="gm-test-button-grid"><button class="btn blue" onclick="gmSimulateArena100('normal')">普通競技場測試（${GM_TEST_RUNS} 次）</button><button class="btn blue" onclick="gmSimulateArena100('hard')">困難競技場測試（${GM_TEST_RUNS} 次）</button><button class="btn blue" onclick="gmSimulateArena100('extreme')">極限競技場測試（${GM_TEST_RUNS} 次）</button></div><div id="gmArenaTestResult" style="margin-top:12px">${result}</div>`;}
 function voidMirageTestHtml(){const result=typeof getVoidMirageGmTestHtml==="function"?getVoidMirageGmTestHtml():"",next=typeof getVoidMirageNextFloor==="function"?getVoidMirageNextFloor():1;return `<div class="muted gm-hub-note">虛空敵人維持固定樓層公式；玩家戰鬥套用測試 VIP 與測試專精。GM 測試不修改正式角色資料。</div><div class="controls" style="align-items:end"><label>指定樓層／起始樓層<br><input id="gmVoidMirageFloor" type="number" min="1" step="1" value="${next}" style="width:180px"></label><button class="btn gm-create" onclick="gmPreviewVoidMirageFloor()">查看單層能力</button><button class="btn blue" onclick="gmSimulateVoidMirageClimb()">從此層連續爬塔</button></div><div id="gmVoidMirageTestResult" style="margin-top:12px">${result}</div>`;}

 function section(title,body,open=false){return `<details class="gm-hub-section" ${open?"open":""}><summary>${title}</summary><div class="gm-hub-body">${body}</div></details>`;}
 function hubHtml(){
  const manage=gmHubTab==="manage";
  const testVip=manage?"":(typeof gmTestVipControlHtml==="function"?gmTestVipControlHtml():"");
  return `<div class="gm-hub"><h3>管理／GM 模式</h3><div class="gm-hub-tabs"><button class="gm-hub-tab ${manage?"active":""}" onclick="gmHubSwitch('manage')">管理</button><button class="gm-hub-tab ${manage?"":"active"}" onclick="gmHubSwitch('test')">測試</button></div>${testVip}${manage?`${section("一般管理",generalManagementHtml(),true)}${section("副本管理",dungeonManagementHtml(),false)}`:`${section("特殊怪測試",specialTestHtml(),true)}${section("地圖怪測試",mapMonsterTestHtml(),false)}${section("懸賞戰測試",bountyTestHtml(),false)}${section("競技場測試",arenaTestHtml(),false)}${section("虛空幻境測試",voidMirageTestHtml(),false)}`}<div class="controls gm-hub-close"><button class="btn" onclick="state.gm=false;save();render()">關閉管理模式</button></div></div>`;
 }

 window.gmResetVip=function(){
  if(!confirm("確定要將 VIP 等級與 VIP 積分全部重置為 0 嗎？"))return;
  const beforeMax=playerCombatStats().hp;
  const beforeHp=Math.max(0,Math.min(beforeMax,Number(state.hp)||0));
  const ratio=beforeMax>0?beforeHp/beforeMax:1;
  const wasFull=beforeHp>=beforeMax;
  state.vipLevel=0;
  state.vipPoints=0;
  const d=dungeonStateSafe();d.points=0;
  const afterMax=playerCombatStats().hp;
  state.hp=wasFull?afterMax:Math.max(0,Math.min(afterMax,Math.round(afterMax*ratio)));
  save();render();
 };
 window.gmHubSwitch=function(tab){gmHubTab=tab==="test"?"test":"manage";render();};
 gmHtml=function(){installGmHubStyles();return hubHtml();};
 installGmHubStyles();
})();