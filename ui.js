let selectedBattleCount=1;
let adventureScreen="maps";
let combatRound=1;
let combatTotal=1;
let gmTapCount=0;
let gmTapTimer=null;
let inventoryFilter="all";
let inventoryReturnContext=null;
let galaxyReviewCombatPlayerHp=null;

const CONTINUOUS_BATTLE_COUNT="continuous";
window.CONTINUOUS_BATTLE_COUNT=CONTINUOUS_BATTLE_COUNT;
window.MAIN_BOSS_CONTINUOUS_VERSION=1;
function resetBattleEntryViewport(){
 if(typeof window==="undefined"||typeof document==="undefined")return false;
 const apply=()=>{
  try{window.scrollTo(0,0);}catch(_){}
  const root=document.scrollingElement||document.documentElement;
  if(root)root.scrollTop=0;
  if(document.body)document.body.scrollTop=0;
 };
 apply();
 if(typeof window.requestAnimationFrame==="function")window.requestAnimationFrame(apply);
 setTimeout(apply,0);
 return true;
}
window.resetBattleEntryViewport=resetBattleEntryViewport;
window.BATTLE_ENTRY_VIEWPORT_RESET_VERSION=1;
function battleModesForEnemy(enemy){return [1,CONTINUOUS_BATTLE_COUNT]}
function battleModeLabel(mode){return mode===CONTINUOUS_BATTLE_COUNT?"連續戰鬥":"單場"}
function setBattleMode(mode,el){
 selectedBattleCount=mode===CONTINUOUS_BATTLE_COUNT?CONTINUOUS_BATTLE_COUNT:1;
 document.querySelectorAll(".count-card").forEach(b=>b.classList.remove("active"));
 if(el)el.classList.add("active");
}
function currentPlayerName(){
 const name=typeof state?.playerName==="string"?state.playerName.trim():"";
 return name||"玩家";
}
function escapePlayerName(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function playerNameHtml(){return typeof window.playerIdentityNameHtml==="function"?window.playerIdentityNameHtml():escapePlayerName(currentPlayerName())}
function currentWorldResource(){
 const snap=typeof window.primaryWorldResourceSnapshot==="function"?window.primaryWorldResourceSnapshot():{label:"金幣",amount:Math.max(0,Math.floor(Number(state?.gold)||0)),secondaryLabel:null,secondaryAmount:0};
 return {label:String(snap.label||"金幣"),amount:Math.max(0,Math.floor(Number(snap.amount)||0)),secondaryLabel:snap.secondaryLabel?String(snap.secondaryLabel):null,secondaryAmount:Math.max(0,Math.floor(Number(snap.secondaryAmount)||0))};
}
function secondWorldActive(){return typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered();}
function characterWorldSnapshot(target=state){
 const universe=typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered(target);
 const progress=typeof window.levelProgressSnapshot==="function"?window.levelProgressSnapshot(target):{level:Math.max(1,Math.floor(Number(target?.level)||1)),cap:universe?1000:MAX_LEVEL,atCap:Number(target?.level)>= (universe?1000:MAX_LEVEL),exp:Math.max(0,Math.floor(Number(target?.exp)||0)),need:0,percent:100,world:universe?2:1};
 const sw=target?.secondWorld||{};
 return {
  world:universe?2:1,
  worldLabel:universe?"宇宙紀元":"銀河紀元",
  level:Math.max(1,Math.floor(Number(target?.level)||1)),
  cap:Math.max(1,Math.floor(Number(progress.cap)|| (universe?1000:MAX_LEVEL))),
  atCap:progress.atCap===true,
  exp:Math.max(0,Math.floor(Number(progress.exp)||0)),
  need:Math.max(0,Math.floor(Number(progress.need)||0)),
  percent:Math.max(0,Math.min(100,Number(progress.percent)||0)),
  gold:Math.max(0,Math.floor(Number(target?.gold)||0)),
  darkMatter:Math.max(0,Math.floor(Number(sw.darkMatter)||0)),
  darkEnergy:Math.max(0,Math.floor(Number(sw.darkEnergy)||0)),
  civilizationLevel:universe&&typeof window.civilizationLevel==="function"?window.civilizationLevel(target):0,
  civilizationMax:Math.max(0,Math.floor(Number(window.CIVILIZATION_LEVEL_MAX)||10)),
  civilizationDamageBonusPercent:universe&&typeof window.civilizationDamageBonusPercent==="function"?window.civilizationDamageBonusPercent(target):0,
  civilizationDamageMultiplier:universe&&typeof window.civilizationDamageMultiplier==="function"?window.civilizationDamageMultiplier(target):1,
  equippedWorlds:Object.fromEntries(EQUIPMENT_TYPES.map(type=>{const item=target?.equipment?.[type];return [type,item?(typeof window.sharedEquipmentWorld==="function"?window.sharedEquipmentWorld(item):(Number(item.world)===3?3:Number(item.world)===2?2:1)):null]}))
 };
}
window.characterWorldSnapshot=characterWorldSnapshot;
window.CHARACTER_WORLD_UI_VERSION=1;
window.CHARACTER_CIVILIZATION_UI_VERSION=1;
window.PLAYER_EQUIPMENT_WORLD_SOURCE_UI_HIDDEN_VERSION=1;
function savePlayerName(){
 const input=document.getElementById("playerNameInput");
 let name=(input?.value||"").trim();
 if(!name)name="玩家";
 state.playerName=name;
 save();render();
}

function compactMobileDom(){
 const mobile=window.matchMedia&&window.matchMedia("(max-width:760px)").matches;
 if(mobile){
  document.querySelectorAll(".enemy-meta").forEach(el=>{
   const m=el.textContent.match(/HP\s*(\d+).*攻擊\s*(\d+).*防禦\s*(\d+)/s);
   if(m)el.textContent=`HP ${m[1]}　ATK ${m[2]}　DEF ${m[3]}`;
  });
 }
}

function renderNav(){
 const top=document.getElementById("topNav"),bottom=document.getElementById("bottomNav");
 if(top)top.innerHTML="";
 if(bottom)bottom.innerHTML="";
}
function go(v){inventoryReturnContext=null;if(v==="adventure"){adventureScreen="maps";if(secondWorldActive()&&typeof window.requestSecondWorldAdventureProgressFocus==="function")window.requestSecondWorldAdventureProgressFocus();}if(v==="storyrecord"&&typeof window.prepareStoryRecordEntry==="function")window.prepareStoryRecordEntry();if(v==="calamity"){if(secondWorldActive()){if(typeof window.prepareSecondWorldCivilizationCalamityEntry==="function")window.prepareSecondWorldCivilizationCalamityEntry();}else if(typeof window.prepareCivilizationCalamityEntry==="function")window.prepareCivilizationCalamityEntry();}if(v==="inventory"&&typeof window.requestInventoryEntryFocus==="function")window.requestInventoryEntryFocus();view=v;render();if(v==="inventory"&&typeof window.applyInventoryFocus==="function")window.applyInventoryFocus()}
function storyRecordPage(){return typeof window.storyRecordPageHtml==="function"?window.storyRecordPageHtml():wrapFunctionPage(`<div class="card"><h2>戰線紀錄</h2><div class="muted">劇情資料尚未載入。</div></div>`)}
function render(){
 renderNav();normalizeHP();ensureSpecializationState();if(typeof normalizeEnhancementState==="function")normalizeEnhancementState(state);
 const fn={home:homePage,adventure:()=>adventureScreen==="review-prepare"?galaxyReviewPreparePage():adventureScreen==="review-combat"?galaxyReviewCombatPage():adventurePage(),storyrecord:storyRecordPage,character:characterPage,enhancement:enhancementPage,specialization:specializationPage,inventory:inventoryPage,calamity:()=>secondWorldActive()?(typeof window.secondWorldCivilizationCalamityPageHtml==="function"?window.secondWorldCivilizationCalamityPageHtml():wrapFunctionPage(`<div class="card"><h2>宇宙紀元・文明災厄</h2><div class="muted">宇宙紀元文明災厄介面尚未載入。</div></div>`)):(typeof window.civilizationCalamityPageHtml==="function"?window.civilizationCalamityPageHtml():wrapFunctionPage(`<div class="card"><h2>文明災厄</h2><div class="muted">文明災厄介面尚未載入。</div></div>`)),guide:gameGuidePage,settings:settingsPage}[view]||homePage;
 document.getElementById("main").innerHTML=fn();window.CivilizationAudioScenes?.syncView?.(view,typeof adventureScreen==="string"?adventureScreen:"");wireSettings();if(typeof window.civilization3dHomeRouteRendered==="function")window.civilization3dHomeRouteRendered(view==="adventure"&&adventureScreen==="combat"?"combat":view);setTimeout(compactMobileDom,0);
}
function qualityLegend(){return `<div class="muted quality-legend" style="margin:6px 0 12px">品質：<span class="q-common">普通</span>／<span class="q-uncommon">優良</span>／<span class="q-rare">稀有</span>／<span class="q-epic">史詩</span>／<span class="q-legendary">傳說</span>／<span class="q-mythic">神話</span></div>`}
function homeBackHtml(){return `<div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div>`}
function wrapFunctionPage(html){return `<div class="function-page">${homeBackHtml()}${html}</div>`}
function gearAbilityHtml(it,withScore=false){
 if(!it)return `<span class="muted">無</span>`;
 const rows=itemAbilityLines(it),body=rows.map(r=>`<div>${r.kind==="main"?`<span class="muted">主能力</span> `:r.kind==="affix"?`<span class="muted">詞條</span> `:""}${r.text}</div>`).join("");
 return `<div class="gear-stat-list">${body}${withScore?`<div class="muted" style="margin-top:5px">評分 ${equipmentScore(it)}</div>`:""}</div>`;
}

function homePage(){
 const secondWorldEntry=typeof window.secondWorldHomeEntryHtml==="function"?window.secondWorldHomeEntryHtml():"";
 const third=typeof window.isThirdWorldEntered==="function"&&window.isThirdWorldEntered()===true;
 return `<section class="home-screen">
  <div class="controls" style="justify-content:flex-end;margin-bottom:10px"><button id="civilization3dHomeToggle" class="btn" type="button" aria-pressed="false" onclick="window.civilization3dToggleHome?.()">預覽 3D 艦橋</button></div>
  <div class="home-title"><h2>文明戰線</h2><div class="muted">打怪、升級、換裝，前往更強的地圖。</div></div>
  ${secondWorldEntry}
  <div class="menu-grid">
   <button class="menu-card" onclick="go('adventure')"><b>冒險</b><span>${secondWorldActive()?"進入宇宙主線並挑戰 Boss":"選擇地圖並挑戰怪物"}</span></button>
   <button class="menu-card" onclick="go('storyrecord')"><b>戰線紀錄</b><span>回顧已完成的正式劇情</span></button>
   <button class="menu-card" onclick="go('character')"><b>角色</b><span>查看能力與目前裝備</span></button>
   <button class="menu-card" onclick="go('inventory')"><b>背包</b><span>整理、裝備、出售與贖回遺失裝備</span></button>
   <button class="menu-card" onclick="go('enhancement')"><b>強化</b><span>永久提升裝備欄位主能力</span></button>
   <button class="menu-card" onclick="go('specialization')"><b>專精</b><span>${secondWorldActive()?"查看已完成並持續生效的永久專精":"消耗金幣提升永久能力"}</span></button>
   <button class="menu-card" onclick="go('dungeon')"><b>副本</b><span>挑戰懸賞、競技場與虛空幻境</span></button>
   <button class="menu-card" onclick="go('calamity')"><b>文明災厄</b><span>${secondWorldActive()?"討伐宇宙文明級威脅並提升文明等級":"討伐文明級威脅並培養永久印記"}</span></button>
   <button class="menu-card" onclick="go('guide')"><b>遊戲說明</b><span>查看玩法與規則</span></button>
   <button class="menu-card" onclick="go('settings')"><b>設定</b><span>${third?"自動處理":"自動出售"}、存檔與遊戲設定</span></button>
  </div>
 </section>`;
}

function playerStatusHtml(){
 const progress=typeof window.levelProgressSnapshot==="function"?window.levelProgressSnapshot(state):{atCap:state.level>=MAX_LEVEL,need:state.level<MAX_LEVEL?expNeed(state.level):0,percent:state.level<MAX_LEVEL?Math.min(100,state.exp/expNeed(state.level)*100):100,exp:state.exp};
 const s=playerCombatStats(),need=progress.need,hpPct=s.hp?state.hp/s.hp*100:0,expPct=progress.percent,low=hpPct<50;
 const resource=currentWorldResource(),resourceStats=resource.secondaryLabel?`<div class="stat">${resource.label}<b>${resource.amount.toLocaleString()}</b></div><div class="stat">${resource.secondaryLabel}<b>${resource.secondaryAmount.toLocaleString()}</b></div>`:`<div class="stat">${resource.label}<b>${resource.amount.toLocaleString()}</b></div>`;
 return `<div class="card player-status-card"><div style="font-size:18px;font-weight:700;color:#f0d494;margin-bottom:9px">${playerNameHtml()}</div><div class="stats"><div class="stat">等級<b>Lv.${state.level}</b></div>${resourceStats}</div><div class="status-line ${low?"q-mythic":""}"><div class="status-label"><span>HP${low?"　⚠ 低血量":""}</span><span>${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" style="width:${hpPct}%"></span></div></div><div class="status-line"><div class="status-label"><span>EXP</span><span>${progress.atCap?"MAX":progress.exp+" / "+need}</span></div><div class="bar"><span class="xp" style="width:${expPct}%"></span></div></div></div>`;
}
function mapStatusText(i){
 if(i>state.unlockedMap)return "未解鎖";
 if(state.bossKilled[i])return "已通關";
 const h=highestUnlockedEnemy(i);
 if(h===0)return "攻略中・第 1 隻怪";
 if(h===1)return "攻略中・第 2 隻怪";
 if(h===2)return "攻略中・第 3 隻怪";
 if(h===3)return "攻略中・菁英";
 return state.level>=MAPS[i].max?"Boss 可挑戰":"等待達到 Boss 等級";
}
function galaxy3dPreviewControl(){return `<div class="galaxy-3d-controls"><button id="civilization3dGalaxyToggle" class="btn" type="button" aria-pressed="false" onclick="window.civilization3dToggleGalaxy?.()">預覽 3D 銀河星圖</button><span class="muted">僅為立體展示；正式地圖、怪物與戰鬥請使用下方原有按鈕。</span></div>`;}
function adventureMapPage(){
 return `<section class="map-screen"><div class="page-top"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button><h2 class="page-title">冒險地圖</h2><span></span></div>${galaxy3dPreviewControl()}<div class="map-grid">${MAPS.map((m,i)=>{const locked=i>state.unlockedMap,status=mapStatusText(i),cleared=state.bossKilled[i];return `<button class="map-card ${locked?"locked":""} ${cleared?"cleared":""}" ${locked?"disabled":""} onclick="enterMap(${i})"><b>${i+1}. ${m.name}</b><div class="muted">Lv.${m.min}～${m.max}</div><div class="map-status">${status}</div></button>`;}).join("")}</div></section>`;
}
function enterMap(i){
 if(i>state.unlockedMap)return;
 if(typeof resetMonsterPreviewCache==="function")resetMonsterPreviewCache();
 selectedMap=i;selectedEnemy=0;selectedBattleCount=1;adventureScreen="prepare";render();
}
function backToMaps(){adventureScreen="maps";render()}
function selectEnemy(i){if(!enemyUnlocked(selectedMap,i))return;selectedEnemy=i;render()}
function enemyProgressValue(mapIdx,enemyIdx){
 const p=state.mapProgress?.[mapIdx]||[0,0,0,0];
 if(enemyIdx<3)return Math.min(10,Math.max(0,Math.floor(Number(p[enemyIdx])||0)));
 if(enemyIdx===3){
  if(state.bossLocked?.[mapIdx])return Math.min(10,Math.max(0,Math.floor(Number(state.bossProgress?.[mapIdx])||0)));
  return Math.min(10,Math.max(0,Math.floor(Number(p[3])||0)));
 }
 return 0;
}
function enemyProgressHtml(mapIdx,enemyIdx){
 if(enemyIdx<4){const n=enemyProgressValue(mapIdx,enemyIdx);return `<div class="enemy-card-progress ${n>=10?"complete":"in-progress"}">${n}/10</div>`;}
 return `<div class="enemy-card-progress boss-ready">${state.bossKilled?.[mapIdx]?"已擊敗・可再次挑戰":"可挑戰首領"}</div>`;
}
function enemyNoteHtml(mapIdx,enemyIdx){
 if(enemyIdx===3){
  const map=MAPS[mapIdx],p=state.mapProgress?.[mapIdx]||[0,0,0,0],done=(Number(p[3])||0)>=10,levelNeeded=Number(map?.max)||Number(map?.enemies?.[4]?.[1])||1;
  const bossVisible=enemyUnlocked(mapIdx,4);
  if(done&&!state.bossLocked?.[mapIdx]&&!state.bossKilled?.[mapIdx]&&!bossVisible&&Number(state.level)<levelNeeded)return `<div class="enemy-card-note level-note">菁英進度完成・角色達 Lv.${levelNeeded} 後首領出現。</div>`;
 }
 if(enemyIdx===4)return `<div class="enemy-card-note boss-note">${state.bossKilled?.[mapIdx]?"可再次挑戰首領；若戰敗，需重新擊敗菁英 10 次後才能再次挑戰。":"勝利後可繼續挑戰首領；若戰敗，需重新擊敗菁英 10 次後才能再次挑戰。"}</div>`;
 return "";
}
function adventureInventoryReturnContext(){
 if(secondWorldActive()){
  if(adventureScreen==="review-prepare")return {mode:"galaxy-review",screen:"review-prepare"};
  return {mode:"universe-main",screen:"maps"};
 }
 return {mode:"galaxy-main",screen:adventureScreen==="prepare"?"prepare":"maps"};
}
function openAdventureInventory(){inventoryReturnContext=adventureInventoryReturnContext();if(typeof window.requestInventoryEntryFocus==="function")window.requestInventoryEntryFocus();view="inventory";render();if(typeof window.applyInventoryFocus==="function")window.applyInventoryFocus()}
function backToAdventureFromInventory(){
 const ctx=inventoryReturnContext;
 inventoryReturnContext=null;
 view="adventure";
 if(ctx?.mode==="galaxy-review")adventureScreen="review-prepare";
 else if(ctx?.mode==="galaxy-main")adventureScreen=ctx.screen==="prepare"?"prepare":"maps";
 else{
  adventureScreen="maps";
  if(ctx?.mode==="universe-main"&&typeof window.requestSecondWorldAdventureProgressFocus==="function")window.requestSecondWorldAdventureProgressFocus();
 }
 render();
}
window.ADVENTURE_INVENTORY_RETURN_CONTEXT_VERSION=1;
function adventurePreparePage(){
 selectedMap=Math.min(selectedMap,state.unlockedMap);
 const highest=highestUnlockedEnemy(selectedMap);if(selectedEnemy>highest)selectedEnemy=highest;
 const map=MAPS[selectedMap],e=monsterObj(selectedMap,selectedEnemy);
 const modes=battleModesForEnemy(e);
 if(!modes.includes(selectedBattleCount))selectedBattleCount=1;
 const enemies=map.enemies.map((x,i)=>{
  if(!enemyUnlocked(selectedMap,i))return "";
  const mo=monsterObj(selectedMap,i),badge=mo.kind==="elite"?`<span class="badge elite">菁英</span>`:mo.kind==="boss"?`<span class="badge boss">Boss</span>`:"";
  const traits=typeof traitDetailsHtml==="function"?traitDetailsHtml(mo.traits):"";
  return `<button class="enemy-card ${i===selectedEnemy?"active":""}" onclick="selectEnemy(${i})"><div class="enemy-card-top"><div class="enemy-card-title"><b>${mo.name} Lv.${mo.level}</b>${badge}</div>${enemyProgressHtml(selectedMap,i)}</div>${traits}<div class="enemy-meta">HP ${mo.hp}　ATK ${mo.atk}　DEF ${mo.def}</div>${enemyNoteHtml(selectedMap,i)}</button>`;
 }).join("");
 const modeButtons=modes.map(mode=>`<button class="count-card ${mode===selectedBattleCount?"active":""}" onclick="setBattleMode(${mode===CONTINUOUS_BATTLE_COUNT?`'${CONTINUOUS_BATTLE_COUNT}'`:1},this)">${battleModeLabel(mode)}</button>`).join("");
 return `<section class="prepare-screen"><div class="page-top"><button class="btn back-btn" onclick="backToMaps()">← 返回冒險地圖</button><h2 class="page-title">${map.name}</h2><span></span></div>${galaxy3dPreviewControl()}<div class="prepare-layout">${playerStatusHtml()}<div class="card prepare-main"><h3>選擇怪物</h3><div class="enemy-grid">${enemies}</div><h3 class="battle-count-title">戰鬥模式</h3><div class="battle-count-panel" data-mobile-battle-panel="1"><div class="count-grid" style="--battle-count-columns:${modes.length}">${modeButtons}</div></div><div class="prepare-actions" data-mobile-prepare-actions="1"><button class="btn primary" onclick="startBattles()">${e.kind==="boss"?"挑戰 Boss":"開始戰鬥"}</button><button class="btn blue" onclick="openAdventureInventory()">背包</button></div></div></div></section>`;
}
function adventureCombatPage(){
 const activeEncounter=typeof currentCombatEncounter!=="undefined"&&currentCombatEncounter?currentCombatEncounter:null;
 const e=activeEncounter||(typeof getPreviewEncounter==="function"?getPreviewEncounter(selectedMap,selectedEnemy):monsterObj(selectedMap,selectedEnemy));
 const traits=typeof combatTraitBadgesHtml==="function"?combatTraitBadgesHtml(e?.traits):"";
 const progress=typeof window.levelProgressSnapshot==="function"?window.levelProgressSnapshot(state):{atCap:state.level>=MAX_LEVEL,need:state.level<MAX_LEVEL?expNeed(state.level):0,percent:state.level<MAX_LEVEL?Math.min(100,state.exp/expNeed(state.level)*100):100,exp:state.exp};
 const s=playerCombatStats(),need=progress.need,hpPct=s.hp?state.hp/s.hp*100:0,expPct=progress.percent;
 const continuous=window.activeMainBattleContext?.continuous===true||combatTotal===0||combatTotal===CONTINUOUS_BATTLE_COUNT;
 const requested=window.activeMainBattleContext?.exitRequested===true;
 const speedOptions=typeof window.playerCombatSpeedOptions==="function"?window.playerCombatSpeedOptions(state).map(Number):[1];
 const effectiveSpeed=typeof window.effectiveCombatSpeed==="function"?Number(window.effectiveCombatSpeed()):1;
 const displaySpeed=[1,1.5,2].includes(effectiveSpeed)?effectiveSpeed:1;
 const speedText=speedOptions.includes(1.5)||displaySpeed!==1?`｜${displaySpeed}×`:"";
 const head=(continuous?`連續戰鬥・第 ${Math.max(1,Number(combatRound)||1)} 場`:`單場戰鬥`)+speedText;
 const stop=continuous?`<div class="continuous-stop-wrap"><button id="continuousBattleStopBtn" class="btn danger" onclick="requestContinuousBattleStop()" ${requested?"disabled":""}>${requested?"本場結束後停止":"停止連續戰鬥"}</button></div>`:"";
 return `<section class="combat-screen"><div class="combat-head">${head}</div><div class="combat-arena"><div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${playerNameHtml()} Lv.${state.level}</h2><div class="muted">${currentWorldResource().label} ${currentWorldResource().amount.toLocaleString()}${currentWorldResource().secondaryLabel?`　${currentWorldResource().secondaryLabel} ${currentWorldResource().secondaryAmount.toLocaleString()}`:""}</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${hpPct}%"></span></div></div><div class="xp-block"><div class="status-label"><span>EXP</span><span>${progress.atCap?"MAX":progress.exp+" / "+need}</span></div><div class="bar"><span class="xp" style="width:${expPct}%"></span></div></div></div><div class="combat-vs">VS</div><div class="combatant enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><h2 id="combatEnemyName">${e.name} Lv.${e.level}</h2>${traits}<div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${e.hp} / ${e.hp}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message" id="combatMessage">準備戰鬥</div>${stop}</section>`;
}
function galaxyReviewMapIndex(){return Math.max(0,Math.min(MAPS.length-1,Math.floor(Number(window.getGalaxyReviewSelectedMap?.())||0)))}
function galaxyReviewEnemyIndex(){return Math.max(0,Math.min(4,Math.floor(Number(window.getGalaxyReviewSelectedEnemy?.())||0)))}
function galaxyReviewPreparePage(){
 const mapIdx=galaxyReviewMapIndex(),reviewEnemy=galaxyReviewEnemyIndex(),map=MAPS[mapIdx];
 const enemies=map.enemies.map((x,enemyIdx)=>{const mo=monsterObj(mapIdx,enemyIdx),badge=mo.kind==="elite"?`<span class="badge elite">菁英</span>`:mo.kind==="boss"?`<span class="badge boss">Boss</span>`:"",traits=typeof traitDetailsHtml==="function"?traitDetailsHtml(mo.traits):"";return `<button class="enemy-card ${enemyIdx===reviewEnemy?"active":""}" onclick="selectGalaxyReviewEnemy(${enemyIdx})"><div class="enemy-card-top"><div class="enemy-card-title"><b>${mo.name} Lv.${mo.level}</b>${badge}</div><div class="enemy-card-progress complete">回顧</div></div>${traits}<div class="enemy-meta">HP ${mo.hp}　ATK ${mo.atk}　DEF ${mo.def}</div></button>`}).join("");
 return `<section class="prepare-screen galaxy-review-prepare"><div class="page-top"><button class="btn back-btn" onclick="backToGalaxyReviewMaps()">← 返回銀河回顧</button><h2 class="page-title">${map.name}</h2><span></span></div><div class="notice"><b>銀河紀元・回顧戰</b><div class="muted" style="margin-top:6px">單場純挑戰・無收益・無損失・不影響正式進度。</div></div><div class="prepare-layout">${playerStatusHtml()}<div class="card prepare-main"><h3>選擇怪物</h3><div class="enemy-grid">${enemies}</div><div class="prepare-actions" data-mobile-prepare-actions="1"><button class="btn primary" onclick="startGalaxyReviewBattle()">開始回顧戰</button><button class="btn blue" onclick="openAdventureInventory()">背包</button></div></div></div></section>`;
}
function galaxyReviewCombatPage(){
 const mapIdx=galaxyReviewMapIndex(),reviewEnemy=galaxyReviewEnemyIndex(),e=currentCombatEncounter||monsterObj(mapIdx,reviewEnemy),s=playerCombatStats(),reviewHp=Math.max(0,Math.min(s.hp,Number(galaxyReviewCombatPlayerHp??s.hp)||0)),hpPct=s.hp?reviewHp/s.hp*100:0,traits=typeof combatTraitBadgesHtml==="function"?combatTraitBadgesHtml(e?.traits):"";
 return `<section class="combat-screen galaxy-review-combat"><div class="combat-head">銀河紀元・回顧戰</div><div class="muted" style="text-align:center;margin-bottom:10px">無收益・無損失・不影響正式進度</div><div class="combat-arena"><div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${playerNameHtml()} Lv.${state.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${reviewHp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${hpPct}%"></span></div></div></div><div class="combat-vs">VS</div><div class="combatant enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><h2 id="combatEnemyName">${e.name} Lv.${e.level}</h2>${traits}<div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${e.hp} / ${e.hp}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message" id="combatMessage">準備回顧戰</div></section>`;
}
window.enterGalaxyReviewMap=function(){selectedBattleCount=1;adventureScreen="review-prepare";render()};
window.selectGalaxyReviewEnemy=function(enemyIdx){window.setGalaxyReviewSelectedEnemy?.(enemyIdx);render()};
window.backToGalaxyReviewMaps=function(){currentCombatEncounter=null;window.setGalaxyReviewBattleActive?.(false);adventureScreen="maps";render()};
function reviewResultPresentationHtml(options={}){
 const heading=String(options.heading||"回顧挑戰結束"),extra=String(options.extra||"");
 return `<div class="notice review-result-notice"><b>${heading}</b><div class="muted" style="margin-top:6px">本場為單場純回顧挑戰，不影響目前正式進度。${extra?`<br>${extra}`:""}</div></div>`;
}
window.REVIEW_RESULT_PRESENTATION_VERSION=1;
window.reviewResultPresentationHtml=reviewResultPresentationHtml;
window.startGalaxyReviewBattle=async function(){
 if(battleBusy){alert("目前仍有其他戰鬥進行中，請先結束後再開始回顧戰。");return false;}
 const mapIdx=galaxyReviewMapIndex(),reviewEnemy=galaxyReviewEnemyIndex();
 const makeEncounter=typeof monsterObj==="function"?monsterObj:(typeof window.monsterObj==="function"?window.monsterObj:null);
 const combatOwner=typeof window.runCombatCore==="function"?window.runCombatCore:null;
 if(!makeEncounter||!combatOwner){alert("銀河紀元回顧戰鬥模組尚未載入，請重新整理後再試。");return false;}
 const preview=makeEncounter(mapIdx,reviewEnemy);
 if(!preview){alert("無法建立回顧戰敵人。");return false;}
 const e={...preview,traits:Array.isArray(preview.traits)?preview.traits.slice():[]};
 const ps=playerCombatStats(),startHp=ps.hp,before=JSON.stringify(state);
 battleBusy=true;window.setGalaxyReviewBattleActive?.(true);currentCombatEncounter=e;galaxyReviewCombatPlayerHp=startHp;adventureScreen="review-combat";window.CivilizationAudioScenes?.notify?.("combat-start",{mode:e?.kind==="boss"?"boss":"battle"});render();
 try{
  const result=combatOwner(ps,e,startHp,{mainlineLogs:true});
  if(!result||typeof result.win!=="boolean")throw new Error("銀河回顧戰鬥結果無效。");
  if(JSON.stringify(state)!==before)throw new Error("銀河紀元回顧戰不應修改正式 state。");
  const presentation={ok:true,win:result.win,logs:result.logs,events:result.events,e,combatEndHp:result.hp,turns:result.turns};
  await animateFight(presentation,startHp,ps.hp,e.hp,"銀河紀元・回顧戰");
  galaxyReviewCombatPlayerHp=null;currentCombatEncounter=null;battleBusy=false;adventureScreen="review-prepare";window.CivilizationAudioScenes?.notify?.("combat-exit");render();
  const title=document.getElementById("battleResultTitle"),detail=document.getElementById("battleResultDetail"),modal=document.getElementById("battleResultModal");
  if(title&&detail&&modal){title.textContent=result.win?"回顧戰勝利":"回顧戰戰敗";detail.innerHTML=reviewResultPresentationHtml({heading:"銀河紀元・回顧戰結束",extra:"不獲得 EXP、資源、裝備或任何正式進度；戰敗也不產生任何損失。"});modal.classList.add("show");if(result.win)window.CivilizationAudio?.settlementVictory?.("galaxy-review:"+String(Date.now()),{success:true});}
  else window.setGalaxyReviewBattleActive?.(false);
  return true;
 }catch(err){
  galaxyReviewCombatPlayerHp=null;currentCombatEncounter=null;window.setGalaxyReviewBattleActive?.(false);battleBusy=false;adventureScreen="review-prepare";window.CivilizationAudioScenes?.notify?.("combat-exit");render();
  console.error("[文明戰線] 銀河紀元回顧戰失敗",err);
  alert("銀河紀元回顧戰啟動失敗，請重新整理後再試。");
  return false;
 }
};
window.GALAXY_REVIEW_BATTLE_RUNTIME_VERSION=8;
window.GALAXY_REVIEW_SELECTION_ISOLATION_VERSION=1;
window.GALAXY_REVIEW_SHARED_RUNTIME_LOCK_VERSION=1;
window.GALAXY_REVIEW_LOCAL_HP_ISOLATION_VERSION=1;
window.GALAXY_REVIEW_SYNC_STATE_VALIDATION_VERSION=1;
function adventurePage(){
 if(adventureScreen==="review-prepare")return galaxyReviewPreparePage();
 if(adventureScreen==="review-combat")return galaxyReviewCombatPage();
 if(secondWorldActive()){return typeof window.secondWorldAdventurePageHtml==="function"?window.secondWorldAdventurePageHtml():wrapFunctionPage('<div class="card"><h2>宇宙紀元主線</h2><div class="notice"><b>宇宙紀元主線介面尚未載入。</b></div></div>');}
 if(adventureScreen==="maps")return adventureMapPage();if(adventureScreen==="combat")return adventureCombatPage();return adventurePreparePage()
}

function healBeforeBattle(){state.hp=playerCombatStats().hp;save(false)}
function startBattles(){
 if(secondWorldActive())return alert("宇宙紀元主線尚未開放。");
 if(battleBusy)return;
 const count=selectedBattleCount;
 healBeforeBattle();beginCombat(count);
}
function beginCombat(count){
 combatRound=1;combatTotal=count;
 if(typeof getPreviewEncounter==="function")currentCombatEncounter=getPreviewEncounter(selectedMap,selectedEnemy);
 adventureScreen="combat";window.CivilizationAudioScenes?.notify?.("combat-start",{mode:currentCombatEncounter?.kind==="boss"?"boss":"battle"});render();runBattles(count);
}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function animateFight(r,startPlayerHp,playerMax,enemyMax,roundText=""){
 if(typeof window.animateStructuredCombatPresentation!=="function")throw new Error("Structured Combat Presentation 未載入。");
 const presentationSleep=typeof window.mainBattlePresentationSleep==="function"?window.mainBattlePresentationSleep:undefined;
 await window.animateStructuredCombatPresentation(r,{mode:"main",sleep:presentationSleep,clearAfter:true,clearReason:"main-battle-end"});
}

window.MAIN_COMBAT_MARK_PRESENTATION_VERSION=1;
function dropListHtml(items){
 if(!items.length)return `<div class="muted">裝備：無</div>`;
 return `<div style="margin-top:10px"><b>裝備</b>${items.map(x=>`<div class="item">${itemHtml(x.item,true)}${gearAbilityHtml(x.item,true)}${x.sold?`<div class="muted">自動出售 +${x.sold} 金幣</div>`:""}</div>`).join("")}</div>`;
}
function showBattleResult(ctx,defeat=null){
 const title=document.getElementById("battleResultTitle"),detail=document.getElementById("battleResultDetail"),modal=document.getElementById("battleResultModal");
 if(!title||!detail||!modal)return;
 const continuous=ctx?.continuous===true;
 if(defeat){
  title.textContent="戰鬥失敗";
  const lost=defeat.penalty?.dropped;
  detail.innerHTML=`${continuous?`<div class="notice"><b>已完成 ${Math.max(0,Math.floor(Number(ctx?.wins)||0))} 場，連續戰鬥已結束；已取得的獎勵均保留。</b></div>`:""}<div class="item"><b>EXP 損失：${defeat.penalty?.expLost||0}</b></div>${lost?`<div style="margin-top:10px"><b>遺失裝備</b><div class="item">${itemHtml(lost,true)}${gearAbilityHtml(lost,true)}</div><div class="muted">已移至背包的「遺失裝備贖回」。</div></div>`:`<div class="muted" style="margin-top:10px">本次沒有遺失裝備。</div>`}`;
 }else{
  title.textContent=continuous?"連續戰鬥結算":"戰鬥勝利";
  detail.innerHTML=`${continuous?`<div class="item"><b>完成 ${Math.max(0,Math.floor(Number(ctx?.wins)||0))} 場</b></div>`:""}<div class="stats" style="margin-top:10px"><div class="stat">EXP<b>+${ctx.totalXp}</b></div><div class="stat">金幣<b>+${ctx.totalGold}</b></div></div>${dropListHtml(ctx.items)}`;
 }
 modal.classList.add("show");
 if(!defeat)window.CivilizationAudio?.settlementVictory?.("main:"+String(ctx?.runId??ctx?.startedAt??Date.now()),{success:true});
 window.CivilizationAudioScenes?.notify?.("combat-exit");
}
function closeBattleResultModal(){
 const modal=document.getElementById("battleResultModal");if(modal)modal.classList.remove("show");
 const reviewSource=typeof window.getAdventureReviewBattleSource==="function"?window.getAdventureReviewBattleSource():null;
 adventureScreen=reviewSource==="galaxy"?"review-prepare":"prepare";
 if(reviewSource==="galaxy"&&typeof window.setGalaxyReviewBattleActive==="function")window.setGalaxyReviewBattleActive(false);
 else if(reviewSource&&typeof window.setAdventureReviewBattleActive==="function")window.setAdventureReviewBattleActive(false);
 const era=typeof window.getAdventureEraView==="function"?window.getAdventureEraView():null;
 if(!reviewSource&&secondWorldActive()&&era==="universe"&&typeof window.requestSecondWorldAdventureProgressFocus==="function")window.requestSecondWorldAdventureProgressFocus();
 render();
 if(reviewSource)return;
 const pendingStory=window.civilizationStoryProgress?.get?.().pendingStory;
 if(pendingStory)window.civilizationStoryProgress.resume();
 else if(typeof window.flushSecondWorldCalamityAppearanceNotice==="function")setTimeout(()=>window.flushSecondWorldCalamityAppearanceNotice(),0);
}

function characterPage(){
 const snap=characterWorldSnapshot(state),progress=typeof window.levelProgressSnapshot==="function"?window.levelProgressSnapshot(state):snap;
 const s=playerCombatStats(),need=progress.need,hpPct=s.hp?state.hp/s.hp*100:0,expPct=progress.percent;
 const titleEntry=typeof window.getUnlockedPlayerTitleDefinitions==="function"&&window.getUnlockedPlayerTitleDefinitions().length?`<div class="character-title-row"><span class="muted">稱號</span><button class="btn character-title-button" onclick="openPlayerTitlePicker()">${typeof window.getEquippedPlayerTitleDefinition==="function"&&window.getEquippedPlayerTitleDefinition()?window.playerTitleHtml(window.getEquippedPlayerTitleDefinition().id):"不裝備稱號"}</button></div>`:"";
 const resourceStats=snap.world===2?`<div class="stat">暗物質<b>${snap.darkMatter.toLocaleString()}</b></div><div class="stat">暗能量<b>${snap.darkEnergy.toLocaleString()}</b></div>`:`<div class="stat">金幣<b>${snap.gold.toLocaleString()}</b></div>`;
 const civilizationStats=snap.world===2?`<div class="stat">文明等級<b>Lv.${snap.civilizationLevel} / ${snap.civilizationMax}</b></div><div class="stat">最終傷害<b>+${snap.civilizationDamageBonusPercent}%</b></div>`:"";
 const civilizationInfo=snap.world===2?`<div class="notice" style="margin-top:12px"><b>文明力量</b><div class="muted" style="margin-top:5px">每 1 級文明等級提高玩家宇宙戰鬥最終傷害 5%；目前倍率 ×${Number(snap.civilizationDamageMultiplier).toFixed(2)}。文明等級將由宇宙紀元文明災厄推進。</div></div>`:"";
 const worldInfo=`<div class="notice" style="margin-bottom:12px"><b>${snap.worldLabel}</b><div class="muted" style="margin-top:5px">目前角色等級上限 Lv.${snap.cap}</div></div>`;
 const stats=`<div class="card character-stats-card"><h2>角色｜${playerNameHtml()}</h2>${worldInfo}${titleEntry}<div class="grid3 character-stats-grid"><div class="stat">等級<b>Lv.${state.level}</b></div>${resourceStats}${civilizationStats}<div class="stat">總攻擊<b>${s.atk}</b></div><div class="stat">總防禦<b>${s.def}</b></div><div class="stat">暴擊率<b>${s.crit||0}%</b></div><div class="stat">閃避率<b>${s.dodge||0}%</b></div></div>${civilizationInfo}<div style="margin-top:14px"><div style="display:flex;justify-content:space-between;gap:10px"><span>HP</span><span>${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" style="width:${hpPct}%"></span></div></div><div style="margin-top:10px"><div style="display:flex;justify-content:space-between;gap:10px"><span>EXP</span><span>${progress.atCap?"MAX":progress.exp+" / "+need}</span></div><div class="bar"><span class="xp" style="width:${expPct}%"></span></div></div></div>`;
 const equips=`<div class="card character-equipment-card"><h3>目前裝備</h3>${qualityLegend()}${EQUIPMENT_TYPES.map(t=>{const it=state.equipment[t];return `<div class="item"><b>${equipmentTypeLabel(t)}</b><br>${itemHtml(it,true)}${it?gearAbilityHtml(it,true):""}</div>`;}).join("")}</div>`;
 return wrapFunctionPage(`<div class="character-layout">${stats}${equips}</div>`);
}
function setInventoryFilter(v){inventoryFilter=v;selectedItem=null;render()}
function lostGearCompareHtml(it){
 const current=state.equipment[it.type],itemScore=equipmentScore(it),currentScore=current?equipmentScore(current):null,diff=current?round1(itemScore-currentScore):itemScore;
 const diffText=current?`${diff>0?"+":""}${diff}`:"目前無裝備",diffColor=!current?"#e5cf9a":diff>0?"#76d587":diff<0?"#e27474":"#ccc";
 const currentHtml=current?`${itemHtml(current,true)}<div class="muted" style="margin-top:4px">評分 ${currentScore}</div>`:`<span class="muted">無</span>`;
 return `<div class="muted">目前</div>${currentHtml}<div style="margin-top:6px"><span class="muted">遺失裝備評分 ${itemScore}</span>　<b style="color:${diffColor}">${diffText}</b></div>`;
}
function lostGearSectionHtml(){
 if(typeof window.isThirdWorldEntered==="function"&&window.isThirdWorldEntered()===true)return "";
 const lost=Array.isArray(state.lostGear)?state.lostGear:[];
 if(!lost.length)return `<div class="card lost-gear-card"><h2>遺失裝備贖回</h2><div class="muted">目前沒有遺失裝備。</div></div>`;
 const rows=lost.map((x,i)=>{
  const universe=secondWorldActive(),free=universe&&Number(x.item?.world)!==2;
  const price=free?"免費":universe&&x.currency==="darkMatter"?`${Math.max(0,Math.floor(Number(x.cost)||0)).toLocaleString()} 暗物質`:`${Math.max(0,Math.floor(Number(x.cost)||0)).toLocaleString()} 金幣`;
  return `<tr><td data-label="裝備" class="lost-gear-item-cell">${itemHtml(x.item,true)}</td><td data-label="能力" class="lost-gear-stats-cell">${gearAbilityHtml(x.item,false)}</td><td data-label="比較" class="lost-gear-compare-cell">${lostGearCompareHtml(x.item)}</td><td data-label="贖回價格" class="lost-gear-price-cell">${price}</td><td class="lost-gear-action-cell"><div class="controls lost-gear-row-actions"><button class="btn" onclick="redeemGear(${i})">${free?"免費贖回":"贖回"}</button><button class="btn danger" onclick="discardLostGear(${i})">放棄</button></div></td></tr>`;
 }).join("");
 return `<div class="card lost-gear-card"><h2>遺失裝備贖回</h2><div class="notice">可先和目前裝備比較；不值得贖回的裝備可直接放棄，放棄後永久刪除。</div><div class="lost-gear-table-wrap"><table class="lost-gear-table"><thead><tr><th>裝備</th><th>主能力／詞條</th><th>與目前裝備比較</th><th>贖回價格</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}
function inventoryContent(){
 const items=state.inventory.filter(it=>inventoryFilter==="all"||it.type===inventoryFilter).slice().sort((a,b)=>equipmentScore(b)-equipmentScore(a)||b.q-a.q||b.level-a.level);
 const sel=items.find(x=>x.id===selectedItem)||items[0];selectedItem=sel?.id||null;
 const filterOptions=`<option value="all" ${inventoryFilter==="all"?"selected":""}>全部</option>${EQUIPMENT_TYPES.map(t=>`<option value="${t}" ${inventoryFilter===t?"selected":""}>${equipmentTypeLabel(t)}</option>`).join("")}`;
 const third=typeof window.isThirdWorldEntered==="function"&&window.isThirdWorldEntered()===true;
 const lowerAction=third?"一鍵處理較低裝備":"一鍵賣出較低裝備",valueLabel=third?"處理結果":"售價";
 const main=`<div class="grid"><div class="card"><h3>目前裝備</h3>${qualityLegend()}${EQUIPMENT_TYPES.map(t=>`<div class="item"><b>${equipmentTypeLabel(t)}</b><br>${itemHtml(state.equipment[t],true)}${state.equipment[t]?gearAbilityHtml(state.equipment[t],true):""}</div>`).join("")}</div>
 <div class="card"><h2>背包（${state.inventory.length} 件）</h2><div class="controls"><select class="btn" onchange="setInventoryFilter(this.value)">${filterOptions}</select><span class="muted" style="align-self:center">排序：評分高→低</span></div><div class="controls"><button class="btn blue" onclick="equipBestAll()">一鍵裝備較強裝備</button><button class="btn" onclick="sellLowerAll()">${lowerAction}</button></div>${items.length?`<div style="overflow:auto"><table><thead><tr><th>裝備</th><th>類型</th><th>能力／詞條</th><th>評分</th><th>${valueLabel}</th></tr></thead><tbody>${items.map(it=>{const quote=typeof window.equipmentSaleQuote==="function"?window.equipmentSaleQuote(it):null;const price=third?"不產生資源":quote&&typeof window.equipmentSaleText==="function"?window.equipmentSaleText(quote):secondWorldActive()?"出售系統未載入":specializationSellValue(it).toLocaleString()+" 金幣";return `<tr onclick="selectItem('${it.id}')" style="cursor:pointer;background:${it.id===selectedItem?"#211d16":"transparent"}"><td>${itemHtml(it,true)}</td><td>${equipmentTypeLabel(it.type)}</td><td>${gearAbilityHtml(it,false)}</td><td>${equipmentScore(it)}</td><td>${price}</td></tr>`;}).join("")}</tbody></table></div>${sel?compareHtml(sel):""}`:`<div class="muted" style="margin-top:12px">${state.inventory.length?"目前篩選沒有裝備。":"背包是空的。"}</div>`}</div></div>`;
 return `${main}${lostGearSectionHtml()}`;
}
function inventoryPage(){
 const back=inventoryReturnContext?`<div class="back-home"><button class="btn back-btn" onclick="backToAdventureFromInventory()">← 返回冒險</button></div>`:homeBackHtml();
 return `<div class="function-page inventory-page">${back}${inventoryContent()}</div>`;
}
// Inventory equipment mutation/actions are owned by equipmentlock.js.
// ui.js intentionally keeps rendering only; runtime onclick handlers resolve after the full script stack loads.
function redeemGear(i){const r=redeemLostGear(i);if(!r.ok)return alert(r.reason);save();if(typeof window.requestInventoryPostRedeemFocus==="function")window.requestInventoryPostRedeemFocus();render();if(typeof window.applyInventoryFocus==="function")window.applyInventoryFocus()}

function settingsPage(){
 const s=state.settings,name=escapePlayerName(currentPlayerName());
 const speed=typeof window.playerCombatSpeed==="function"?window.playerCombatSpeed():1;
 const speedOptions=typeof window.playerCombatSpeedOptions==="function"?window.playerCombatSpeedOptions(state).map(Number):[1];
 const speedHtml=speedOptions.includes(1.5)?`<div class="setting-row combat-speed-setting"><div><div style="margin-bottom:6px">戰鬥速度</div><div class="muted">已解鎖 1.5×；可隨時切回標準速度。</div></div><div class="combat-speed-options"><label class="btn ${Number(speed)===1?"blue":""}"><input type="radio" name="playerCombatSpeed" data-player-combat-speed="1" ${Number(speed)===1?"checked":""}> 1×　標準速度</label><label class="btn ${Number(speed)===1.5?"blue":""}"><input type="radio" name="playerCombatSpeed" data-player-combat-speed="1.5" ${Number(speed)===1.5?"checked":""}> 1.5×　加速戰鬥</label></div></div>`:"";
 const third=typeof window.isThirdWorldEntered==="function"&&window.isThirdWorldEntered()===true;
 const autoTitle=third?"自動處理":"自動出售";
 const body=`<div class="card"><h2 id="settingsTitle">設定</h2><div class="muted">連續點擊「設定」3 下可開啟管理功能。</div>
 <h3 style="margin-top:22px">${autoTitle}</h3>${QUALITY.slice(0,6).map((q,i)=>`<div class="setting-row"><label><input type="checkbox" data-autosell="${i}" ${s.autoSell[i]?"checked":""}> <span class="${qClass(i)}">${q.n}</span></label></div>`).join("")}<div class="muted" style="margin-top:6px">${third?"勾選的品質會自動處理；高維紀元處理裝備不產生資源。":"勾選的品質會依目前紀元規則自動出售。"}鎖定裝備不受影響；若開啟較強裝備自動保留，較強掉落仍會優先保留。</div>
 <h3 style="margin-top:22px">遊戲設定</h3><div class="setting-row" style="align-items:flex-end"><div style="flex:1"><div style="margin-bottom:6px">角色名稱</div><input id="playerNameInput" type="text" maxlength="12" value="${name}" placeholder="玩家" style="width:100%;padding:10px 11px;border-radius:8px;border:1px solid #424850;background:#0e1217;color:#fff"></div><button class="btn blue" onclick="savePlayerName()">儲存名稱</button></div><div class="muted" style="margin-top:6px">最多 12 個字；空白名稱儲存時會自動恢復成「玩家」。</div>${speedHtml}<div class="setting-row"><label><input id="keepUpgrade" type="checkbox" ${s.keepUpgrade?"checked":""}> 若新裝備比目前裝備強，自動保留</label></div>
 <h4 style="margin:20px 0 10px">音樂與音效</h4>
 ${(()=>{const a=window.CivilizationAudio?.settings?.()||{};return '<div class="setting-row" style="display:flex;gap:12px;flex-wrap:wrap"><label><input type="checkbox" data-audio-toggle="musicEnabled" '+(a.musicEnabled!==false?'checked':'')+'> 開啟音樂</label><label><input type="checkbox" data-audio-toggle="effectsEnabled" '+(a.effectsEnabled!==false?'checked':'')+'> 開啟音效</label></div><div class="setting-row" style="display:flex;gap:14px;flex-wrap:wrap"><label style="flex:1;min-width:150px">音樂音量 <input type="range" data-audio-volume="music" min="0" max="100" step="5" value="'+Math.round((a.music??.45)*100)+'" style="width:100%"><span data-audio-volume-label="music">'+Math.round((a.music??.45)*100)+'%</span></label><label style="flex:1;min-width:150px">音效音量 <input type="range" data-audio-volume="effects" min="0" max="100" step="5" value="'+Math.round((a.battle??.65)*100)+'" style="width:100%"><span data-audio-volume-label="effects">'+Math.round((a.battle??.65)*100)+'%</span></label></div><div class="muted">音樂與音效可各自開關、調整音量；設定會保存在目前裝置，不影響 GM 獨立試聽音量。</div>';})()}
 ${window.CivilizationPresentationMode?.settingsHtml?.()||""}
 <h3 style="margin-top:22px">遊戲資料</h3><div class="setting-row"><span>本機自動存檔</span><span style="color:#72c982">已啟用</span></div>
 ${state.gm?`<div id="gmStartupSlot">${typeof gmHtml==="function"?gmHtml():`<div class="gm-hub"><h3>管理／GM 模式</h3><div class="muted" role="status">正在準備 GM 管理功能…</div><div class="controls"><button class="btn blue" type="button" onclick="window.ensureCivilizationScriptGroup?.(\u0027gm\u0027).catch(()=>{})">重新載入 GM 管理</button></div></div>`}</div>`:""}<div class="danger-zone"><b>危險操作</b><p class="muted">會清除目前全部遊戲進度。</p><button class="btn danger" onclick="resetGame()">重置遊戲</button></div></div>`;
 return wrapFunctionPage(body);
}
function wireSettings(){
 const title=document.getElementById("settingsTitle");
 if(title){
  title.onclick=()=>{gmTapCount++;clearTimeout(gmTapTimer);if(gmTapCount>=3){gmTapCount=0;openGMModal();return}gmTapTimer=setTimeout(()=>{gmTapCount=0},1000)};
  title.style.touchAction="manipulation";title.style.userSelect="none";title.style.webkitUserSelect="none";
 }
 document.querySelectorAll("[data-autosell]").forEach(el=>el.onchange=()=>{state.settings.autoSell[+el.dataset.autosell]=el.checked;save()});
 document.querySelectorAll("[data-player-combat-speed]").forEach(el=>el.onchange=()=>{if(!el.checked)return;const ok=typeof window.setPlayerCombatSpeed==="function"&&window.setPlayerCombatSpeed(Number(el.dataset.playerCombatSpeed));if(!ok)return alert("戰鬥速度設定失敗。");render();});
 document.querySelectorAll("[data-audio-toggle]").forEach(el=>el.onchange=()=>window.CivilizationAudio?.setLevel?.(el.dataset.audioToggle,el.checked));
 document.querySelectorAll("[data-audio-volume]").forEach(el=>el.oninput=()=>{const v=Number(el.value)/100;const a=window.CivilizationAudio;if(el.dataset.audioVolume==="music"){a?.setLevel?.("music",v);a?.setLevel?.("ambient",v);}else{for(const channel of ["battle","ui","notice"])a?.setLevel?.(channel,v);}const out=document.querySelector('[data-audio-volume-label="'+el.dataset.audioVolume+'"]');if(out)out.textContent=Math.round(v*100)+"%";});
 const keep=document.getElementById("keepUpgrade");if(keep)keep.onchange=()=>{state.settings.keepUpgrade=keep.checked;save()};
}
function openGMModal(){document.getElementById("passwordModal").classList.add("show");document.getElementById("gmPassword").focus()}
function closeGMModal(){document.getElementById("passwordModal").classList.remove("show")}
function unlockGM(){if(document.getElementById("gmPassword").value===GM_PASSWORD){state.gm=true;save();closeGMModal();render()}else alert("密碼錯誤。")}
function normalizeSaveItem(it,forcedType=null,target=null){
 if(!it||typeof it!=="object"||Array.isArray(it))return null;
 const type=forcedType||it.type;if(!EQUIPMENT_TYPES.includes(type))return null;
 const q=Math.max(0,Math.min(QUALITY.length-1,Math.floor(Number(it.q)||0)));
 const itemWorld=typeof window.sharedEquipmentWorld==="function"?window.sharedEquipmentWorld(it):(Number(it.world)===3?3:Number(it.world)===2?2:1);
 const level=typeof window.sharedNormalizeEquipmentLevelForWorld==="function"?window.sharedNormalizeEquipmentLevelForWorld({...it,world:itemWorld},it.level):Math.max(1,Math.min(itemWorld===3?2000:itemWorld===2?1000:500,Math.floor(Number(it.level)||1)));
 const out={...it,type,q,world:itemWorld,level};
 out.id=typeof it.id==="string"&&it.id?it.id:Date.now().toString(36)+Math.random().toString(36).slice(2);
 out.name=typeof it.name==="string"&&it.name.trim()?it.name.trim().slice(0,80):"未知裝備";
 ["hp","atk","def","crit","dodge"].forEach(k=>{const n=Number(it[k]);out[k]=Number.isFinite(n)&&n>0?round1(n):0});
 const mainStat=(it.mainStat&&STAT_LABELS[it.mainStat.stat])?it.mainStat.stat:mainStatForType(type);
 const mainValue=Number(it.mainStat?.value);
 out.mainStat={stat:mainStat,value:Number.isFinite(mainValue)&&mainValue>=0?round1(mainValue):round1(out[mainStat]||0)};
 out.affixes=Array.isArray(it.affixes)?it.affixes.filter(a=>a&&STAT_LABELS[a.stat]&&Number.isFinite(Number(a.value))&&Number(a.value)>=0).map(a=>({stat:a.stat,value:round1(Number(a.value))})):[];
 const sell=Number(it.sell),buy=Number(it.buy);
 out.sell=Number.isFinite(sell)&&sell>=0?Math.floor(sell):ceil(sellBase(level)*QUALITY[q].sm);
 out.buy=Number.isFinite(buy)&&buy>=0?Math.floor(buy):ceil(out.sell*3.5);
 return out;
}
function normalizeSaveState(target){
 if(!target||typeof target!=="object"||Array.isArray(target))target=newState();
 if(typeof normalizeSecondWorldState==="function")normalizeSecondWorldState(target);
 if(typeof normalizeWorldSaveState==="function")normalizeWorldSaveState(target);
 if(typeof window.normalizeLevelProgressionState==="function")window.normalizeLevelProgressionState(target);
 target.level=typeof window.clampEffectiveGameLevel==="function"?window.clampEffectiveGameLevel(target.level,target):Math.max(1,Math.min(target?.secondWorld?.entered===true?1000:MAX_LEVEL,Math.floor(Number(target.level)||1)));
 const exp=Number(target.exp),gold=Number(target.gold),hp=Number(target.hp);
 const effectiveCap=typeof window.effectiveLevelCap==="function"?window.effectiveLevelCap(target):(target?.secondWorld?.entered===true?1000:MAX_LEVEL);
 target.exp=target.level>=effectiveCap?0:(Number.isFinite(exp)&&exp>=0?Math.floor(exp):0);
 target.gold=Number.isFinite(gold)&&gold>=0?Math.floor(gold):0;
 target.hp=Number.isFinite(hp)&&hp>=0?Math.floor(hp):baseHP(target.level);
 const name=typeof target.playerName==="string"?target.playerName.trim():"";target.playerName=name||"玩家";
 if(!target.equipment||typeof target.equipment!=="object"||Array.isArray(target.equipment))target.equipment={};
 EQUIPMENT_TYPES.forEach(type=>{target.equipment[type]=normalizeSaveItem(target.equipment[type],type,target)});
 target.inventory=(Array.isArray(target.inventory)?target.inventory:[]).map(it=>normalizeSaveItem(it,null,target)).filter(Boolean);
 target.lostGear=(Array.isArray(target.lostGear)?target.lostGear:[]).map(x=>{
  if(!x||typeof x!=="object")return null;
  const item=normalizeSaveItem(x.item,null,target);if(!item)return null;
  const rawCost=Number(x.cost),lostAt=Number(x.lostAt),world=typeof window.sharedEquipmentWorld==="function"?window.sharedEquipmentWorld(item):(Number(item.world)===3?3:Number(item.world)===2?2:1);
  const universe=target?.secondWorld?.entered===true;
  const currency=world===2?"darkMatter":universe?"free":"gold";
  const officialDarkMatterCost=typeof window.secondWorldEquipmentRedemptionCost==="function"?window.secondWorldEquipmentRedemptionCost(item,false):null;
  const fallback=currency==="darkMatter"&&officialDarkMatterCost!=null&&Number.isFinite(Number(officialDarkMatterCost))?Math.max(0,Math.floor(Number(officialDarkMatterCost))):currency==="free"?0:(Number.isFinite(rawCost)&&rawCost>=0?Math.floor(rawCost):ceil(item.buy*2));
  const cost=currency==="free"?0:currency==="darkMatter"?fallback:(Number.isFinite(rawCost)&&rawCost>=0?Math.floor(rawCost):fallback);
  return {id:typeof x.id==="string"&&x.id?x.id:Date.now().toString(36)+Math.random().toString(36).slice(2),item,cost,currency,redemptionPending:false,lostAt:Number.isFinite(lostAt)&&lostAt>=0?lostAt:Date.now()};
 }).filter(Boolean);
 if(Object.prototype.hasOwnProperty.call(target,"shop"))delete target.shop;
 if(typeof normalizePersistentFlags==="function")normalizePersistentFlags(target);else target.pendingBlackMarketEncounter=target.pendingBlackMarketEncounter===true;
 normalizeAutoSellQualitySettings(target);
 target.settings.keepUpgrade=typeof target.settings.keepUpgrade==="boolean"?target.settings.keepUpgrade:true;
 target.settings.dark=typeof target.settings.dark==="boolean"?target.settings.dark:true;
 const combatSpeed=Number(target.settings.combatSpeed);target.settings.combatSpeed=combatSpeed===1.5?1.5:1;
 target.gm=target.gm===true;
 if(typeof normalizeEnhancementState==="function")normalizeEnhancementState(target);
 if(typeof normalizeVipState==="function")normalizeVipState(target);
 if(typeof normalizeCivilizationCalamityState==="function")normalizeCivilizationCalamityState(target);
 if(typeof normalizePlayerTitleState==="function")normalizePlayerTitleState(target);
 target.saveVersion=typeof currentSaveVersion==="function"?currentSaveVersion():SAVE_VERSION;
 return target;
}
window.SAVE_NORMALIZATION_WORLD_AWARE_VERSION=2;
window.SAVE_ROOT_NORMALIZATION_ORDER_VERSION=1;
window.LOST_GEAR_WORLD_AWARE_NORMALIZATION_VERSION=2;
window.EQUIPMENT_SAVE_LEVEL_WORLD_OWNER_VERSION=1;
window.INVENTORY_SALE_DISPLAY_FAIL_CLOSED_VERSION=2;
window.THIRD_WORLD_INVENTORY_PROCESSING_UI_VERSION=1;
window.THIRD_WORLD_LOST_GEAR_UI_POLICY_VERSION=1;
window.UI_LEGACY_INVENTORY_MUTATION_RETIRED_VERSION=1;
window.UI_AUTO_SELL_QUALITY_COUNT=6;
window.UI_MYTHIC_AUTO_SELL_SETTING_VERSION=1;
window.normalizeSaveItem=normalizeSaveItem;
window.normalizeSaveState=normalizeSaveState;
function normalizeCurrentSaveState(){
 const sourceVersion=Math.max(1,Math.floor(Number(state?.saveVersion)||1));
 let sourceRaw=null;
 try{sourceRaw=JSON.parse(JSON.stringify(state));}catch(e){sourceRaw=state;}
 const schemaVersion=typeof currentSaveVersion==="function"?currentSaveVersion():SAVE_VERSION;
 if(typeof migrateSave==="function"&&sourceVersion<schemaVersion)state=migrateSave(state,sourceVersion,normalizeSaveState,sourceRaw);
 else state=normalizeSaveState(state);
 if(typeof ensureSpecializationState==="function")ensureSpecializationState();
 if(typeof ensureDungeonProgressState==="function")ensureDungeonProgressState();
 if(typeof ensureVoidMirageState==="function")ensureVoidMirageState();
 normalizeHP();
 return state;
}
function resetGame(){if(confirm("確定要清除全部遊戲進度嗎？此操作無法復原。")){state=newState();selectedMap=0;selectedEnemy=0;battleLogs=[];adventureScreen="maps";inventoryFilter="all";inventoryReturnContext=null;save();view="home";render()}}
document.getElementById("brandTitle").onclick=()=>go("home");
const initialLoadOk=load();if(initialLoadOk!==false){normalizeCurrentSaveState();if(typeof window.gmReconcileRuntimeAuthorizationAfterLoad==="function")window.gmReconcileRuntimeAuthorizationAfterLoad(state);save(false);}render();
// Late home-entry owners (world transition, reincarnation, alternate universe)
// register after ui.js. Reconcile only once after parser completion, and only
// if an entry expected by the authoritative HTML is absent from the first DOM.
function reconcileDeferredHomeEntries(){
 if(view!=="home")return;
 const main=document.getElementById("main");
 if(!main)return;
 const expected=homePage();
 const missing=[
  ['data-world-phase-target', '[data-world-phase-target]'],
  ['data-major-transition="reincarnation"', '[data-major-transition="reincarnation"]'],
  ['data-alternate-universe-home-entry', '[data-alternate-universe-home-entry]']
 ].some(([token,selector])=>expected.includes(token)&&!main.querySelector(selector));
 if(missing)render();
}
let deferredHomeReconcileQueued=false;
window.civilizationRequestHomeEntryReconcile=function(){
 if(deferredHomeReconcileQueued)return;
 deferredHomeReconcileQueued=true;
 queueMicrotask(()=>{deferredHomeReconcileQueued=false;reconcileDeferredHomeEntries();});
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",window.civilizationRequestHomeEntryReconcile,{once:true});
else window.civilizationRequestHomeEntryReconcile();
window.GALAXY_ADVENTURE_REVIEW_BATTLE_VERSION=2;