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
   @media(max-width:760px){.gm-hub{padding:12px}.gm-hub-tabs{position:sticky;top:58px;z-index:5;background:#17140f;padding:4px 0}.gm-hub-section>summary{padding:12px}.gm-hub-body{padding:11px}.gm-hub-body .controls{gap:7px}.gm-hub-body .controls>.btn,.gm-hub-body .controls>label{max-width:100%}}
  `;
  document.head.appendChild(style);
 }

 function specialOptions(){
  const tierLabel={low:"低",mid:"中",high:"高"};
  const selected=(typeof gmSpecialBatchSelectedId==="string"&&gmSpecialBatchSelectedId)?gmSpecialBatchSelectedId:(SPECIAL_MONSTERS[0]?.id||"");
  return SPECIAL_MONSTERS.map(x=>`<option value="${x.id}" ${x.id===selected?"selected":""}>${x.name}（${tierLabel[x.tier]||"低"}）</option>`).join("");
 }
 function gearOptions(){return {quality:QUALITY.map((q,i)=>`<option value="${i}" ${i===3?"selected":""}>${q.n}</option>`).join(""),level:Array.from({length:MAX_LEVEL},(_,i)=>{const lv=i+1;return `<option value="${lv}" ${lv===state.level?"selected":""}>Lv.${lv}</option>`;}).join(""),type:EQUIPMENT_TYPES.map(type=>`<option value="${type}">${equipmentTypeLabel(type)}</option>`).join("")+`<option value="all">全部</option>`};}
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
 function dungeonManagementHtml(){const d=dungeonStateSafe();return `<div class="notice gm-hub-note">目前：${Math.round((Number(d.progress)||0)*100)/100}%　／　${Math.floor(Number(d.attempts)||0)} 次　／　${Math.floor(Number(d.points)||0)} 積分</div><div class="controls" style="align-items:end"><label>副本次數累積進度 %<br><input id="gmDungeonProgress" type="number" min="0" step="0.01" value="${d.progress}" style="width:170px"></label><label>副本可挑戰次數<br><input id="gmDungeonAttempts" type="number" min="0" step="1" value="${d.attempts}" style="width:150px"></label><label>副本積分<br><input id="gmDungeonPoints" type="number" min="0" step="1" value="${d.points}" style="width:150px"></label><button class="btn blue" onclick="gmApplyDungeonValues()">套用</button></div>`;}
 function specialTestHtml(){
  const result=(typeof gmSpecialBatchResultHtml==="function"&&typeof gmSpecialBatchResult!=="undefined"&&gmSpecialBatchResult)?gmSpecialBatchResultHtml(gmSpecialBatchResult.special,gmSpecialBatchResult.summary):"";
  return `<div class="muted gm-hub-note">依目前角色實際能力生成。GM 測試為沙盒模式，離開結算後會還原正式資料；目前角色 Lv.${state.level}。</div><div class="controls" style="margin-top:10px;align-items:end"><label>特殊怪<br><select id="gmSpecialMonster" class="btn" onchange="gmSetSpecialBatchSelected(this.value)">${specialOptions()}</select></label><button id="gmSpecialBatchStartBtn" class="btn blue" onclick="gmStartSpecialBattle()">開始測試（100 次）</button></div><div id="gmSpecialBatchResult" style="margin-top:12px">${result}</div>`;
 }
 function mapMonsterTestHtml(){
  const s=mapMonsterSelection();
  const result=typeof getMapMonsterGmTestHtml==="function"?getMapMonsterGmTestHtml():"";
  return `<div class="muted gm-hub-note">依目前角色實際能力，針對指定主線地圖怪模擬 100 次。GM 測試為沙盒模式，不修改正式角色資料。</div><div class="controls" style="align-items:end"><label>地圖<br><select id="gmMapMonsterMap" class="btn" onchange="gmMapMonsterChangeMap()">${mapMonsterMapOptions()}</select></label><label>怪物<br><select id="gmMapMonsterEnemy" class="btn" onchange="gmMapMonsterChangeEnemy()">${mapMonsterEnemyOptions(s.mapIdx)}</select></label><button id="gmMapMonsterStartBtn" class="btn blue" onclick="gmStartMapMonsterTest()">開始測試（100 次）</button></div><div id="gmMapMonsterTestResult" style="margin-top:12px">${result}</div>`;
 }
 function bountyTestHtml(){const result=typeof getBountyGmDebugHtml==="function"?getBountyGmDebugHtml():"";return `<div class="muted gm-hub-note">依目前 Lv.${state.level} 角色實際能力生成；不扣副本次數、不改正式角色資料。</div><div class="controls"><button class="btn gm-create" onclick="gmPreviewBounty('normal')">生成普通懸賞</button><button class="btn gm-create" onclick="gmPreviewBounty('high')">生成高級懸賞</button><button class="btn gm-create" onclick="gmPreviewBounty('danger')">生成危險懸賞</button></div><div class="controls" style="margin-top:10px"><button class="btn blue" onclick="gmSimulateBounty100('normal')">普通懸賞 ×100</button><button class="btn blue" onclick="gmSimulateBounty100('high')">高級懸賞 ×100</button><button class="btn blue" onclick="gmSimulateBounty100('danger')">危險懸賞 ×100</button></div><div id="gmBountyDebugResult" style="margin-top:12px">${result}</div>`;}
 function arenaTestHtml(){
  const result=typeof getArenaGmDebugHtml==="function"?getArenaGmDebugHtml():"";
  return `<div class="muted gm-hub-note">依目前 Lv.${state.level} 角色實際能力，模擬 100 次完整三連戰；不扣副本次數、不增加副本積分、不修改正式 HP 或其他資料。</div><div class="controls"><button class="btn blue" onclick="gmSimulateArena100('normal')">普通競技場 ×100</button><button class="btn blue" onclick="gmSimulateArena100('hard')">困難競技場 ×100</button><button class="btn blue" onclick="gmSimulateArena100('extreme')">極限競技場 ×100</button></div><div id="gmArenaDebugResult" style="margin-top:12px">${result}</div>`;
 }
 function voidMirageTestHtml(){
  const result=typeof getVoidMirageGmDebugHtml==="function"?getVoidMirageGmDebugHtml():"";
  const next=typeof getVoidMirageNextFloor==="function"?getVoidMirageNextFloor():1;
  return `<div class="muted gm-hub-note">依目前 Lv.${state.level} 角色實際能力測試，但虛空幻境敵人仍只依樓層生成。指定起始樓層後會每層滿血一路打到第一次失敗；不扣副本次數、不增加正式積分、不修改正式樓層進度。</div><div class="controls" style="align-items:end"><label>指定樓層／起始樓層<br><input id="gmVoidMirageFloor" type="number" min="1" step="1" value="${next}" style="width:180px"></label><button class="btn gm-create" onclick="gmPreviewVoidMirageFloor()">查看單層能力</button><button class="btn blue" onclick="gmSimulateVoidMirageClimb()">從此層連續爬塔</button></div><div id="gmVoidMirageDebugResult" style="margin-top:12px">${result}</div>`;
 }

 function section(title,body,open=false){return `<details class="gm-hub-section" ${open?"open":""}><summary>${title}</summary><div class="gm-hub-body">${body}</div></details>`;}
 function hubHtml(){
  const manage=gmHubTab==="manage";
  return `<div class="gm-hub"><h3>管理／GM 模式</h3><div class="gm-hub-tabs"><button class="gm-hub-tab ${manage?"active":""}" onclick="gmHubSwitch('manage')">管理</button><button class="gm-hub-tab ${manage?"":"active"}" onclick="gmHubSwitch('test')">測試</button></div>${manage?`${section("一般管理",generalManagementHtml(),true)}${section("副本管理",dungeonManagementHtml(),false)}`:`${section("特殊怪測試",specialTestHtml(),true)}${section("地圖怪測試",mapMonsterTestHtml(),false)}${section("懸賞戰測試",bountyTestHtml(),false)}${section("競技場測試",arenaTestHtml(),false)}${section("虛空幻境測試",voidMirageTestHtml(),false)}`}<div class="controls gm-hub-close"><button class="btn" onclick="state.gm=false;save();render()">關閉管理模式</button></div></div>`;
 }

 window.gmHubSwitch=function(tab){gmHubTab=tab==="test"?"test":"manage";render();};
 gmHtml=function(){installGmHubStyles();return hubHtml();};
 installGmHubStyles();
})();