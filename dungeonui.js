(function(){
 let dungeonDebugMap=0;
 let dungeonDebugEnemy=0;

 function installDungeonResponsiveStyles(){
  if(document.getElementById("dungeonResponsiveStyles"))return;
  const style=document.createElement("style");
  style.id="dungeonResponsiveStyles";
  style.textContent=`
   .dungeon-status,.dungeon-result,.dungeon-gm-status{overflow-wrap:anywhere;word-break:break-word}
   .dungeon-home-status{max-width:680px;margin:0 auto 18px}
   .dungeon-debug-controls{align-items:end}
   .dungeon-debug-controls label{min-width:0;max-width:100%}
   .dungeon-debug-select{display:block;max-width:min(100%,420px);min-width:220px;width:auto}
   .dungeon-gm-actions .btn{white-space:normal}
   #battleResultModal .modal-box,#riskModal .modal-box{max-height:calc(100dvh - 36px);overflow-y:auto;overscroll-behavior:contain}
   #battleResultDetail{overflow-wrap:anywhere;word-break:break-word}
   @media(max-width:760px){
    .dungeon-status,.dungeon-result{font-size:13px;line-height:1.55;padding:8px 10px}
    .dungeon-home-status{margin-bottom:12px}
    .dungeon-gm-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
    .dungeon-gm-actions .btn{width:100%;min-width:0;padding-left:9px;padding-right:9px}
    .dungeon-debug-controls{display:grid;grid-template-columns:minmax(0,1fr);gap:8px}
    .dungeon-debug-controls label,.dungeon-debug-select,.dungeon-debug-controls .btn{width:100%;min-width:0;max-width:100%}
    .dungeon-debug-select{overflow:hidden;text-overflow:ellipsis}
    #battleResultModal,#riskModal{align-items:flex-start;padding:10px;padding-top:max(10px,env(safe-area-inset-top));padding-bottom:max(10px,env(safe-area-inset-bottom))}
    #battleResultModal .modal-box,#riskModal .modal-box{width:100%;max-height:calc(100dvh - max(20px,env(safe-area-inset-top) + env(safe-area-inset-bottom)));padding:14px}
    #battleResultModal .stats{grid-template-columns:repeat(2,minmax(0,1fr))}
    #battleResultModal .stat{min-width:0;overflow-wrap:anywhere}
   }
   @media(max-width:380px){
    .dungeon-gm-actions{grid-template-columns:1fr}
    #battleResultModal .stats{grid-template-columns:1fr}
   }
  `;
  document.head.appendChild(style);
 }
 installDungeonResponsiveStyles();

 function dungeonState(){
  if(typeof ensureDungeonProgressState==="function")return ensureDungeonProgressState()||{progress:0,attempts:0};
  return state?.dungeon||{progress:0,attempts:0};
 }
 function formatDungeonProgress(n){
  const x=Math.round((Number(n)||0)*100)/100;
  return Number.isInteger(x)?String(x):x.toFixed(2).replace(/0+$/,"" ).replace(/\.$/,"");
 }
 function formatDungeonAttempts(n){return Math.floor(Number(n)||0).toLocaleString();}
 function dungeonStatusHtml(extraClass=""){
  const d=dungeonState();
  return `<div class="notice dungeon-status ${extraClass}" style="margin-top:10px"><div><b>副本次數累積進度</b>　${formatDungeonProgress(d.progress)}%</div><div style="margin-top:5px"><b>副本可挑戰次數</b>　${formatDungeonAttempts(d.attempts)} 次</div></div>`;
 }
 window.dungeonBattleResultHtml=function(ctx){
  const added=Number(ctx?.totalDungeonProgress)||0;
  const gained=Math.floor(Number(ctx?.gainedDungeonAttempts)||0);
  const d=dungeonState();
  return `<div class="notice dungeon-result" style="margin-top:10px"><b>副本次數累積</b><div style="margin-top:5px">本次戰鬥進度 +${formatDungeonProgress(added)}%${gained?`　／　副本可挑戰次數 +${formatDungeonAttempts(gained)}`:""}</div><div class="muted" style="margin-top:5px">目前累積 ${formatDungeonProgress(d.progress)}%　／　可挑戰 ${formatDungeonAttempts(d.attempts)} 次</div></div>`;
 };

 if(typeof homePage==="function"){
  const baseHomePage=homePage;
  homePage=function(){
   const html=baseHomePage();
   return html.replace('<div class="menu-grid">',`${dungeonStatusHtml("dungeon-home-status")}<div class="menu-grid">`);
  };
 }

 if(typeof playerStatusHtml==="function"){
  const basePlayerStatusHtml=playerStatusHtml;
  playerStatusHtml=function(){return basePlayerStatusHtml()+dungeonStatusHtml();};
 }

 if(typeof showBattleResult==="function"){
  const baseShowBattleResult=showBattleResult;
  showBattleResult=function(ctx,defeat){
   const result=baseShowBattleResult(ctx,defeat);
   const detail=document.getElementById("battleResultDetail");
   if(detail&&ctx)detail.insertAdjacentHTML("beforeend",dungeonBattleResultHtml(ctx));
   return result;
  };
 }

 function refreshAfterDungeonGm(message){save();render();if(message)alert(message);}
 window.gmDungeonAddProgress=function(amount){
  if(typeof addDungeonProgress!=="function")return alert("副本進度核心尚未載入。");
  const r=addDungeonProgress(amount);
  refreshAfterDungeonGm(`副本進度 +${formatDungeonProgress(r.added)}%\n轉換副本次數 +${r.gainedAttempts}\n目前 ${formatDungeonProgress(r.progress)}%／${r.attempts} 次`);
 };
 window.gmDungeonAddAttempt=function(){
  const d=dungeonState();d.attempts=Math.floor(Number(d.attempts)||0)+1;
  refreshAfterDungeonGm("副本可挑戰次數 +1");
 };
 window.gmDungeonClearProgress=function(){
  const d=dungeonState();d.progress=0;
  refreshAfterDungeonGm("副本次數累積進度已歸零；可挑戰次數保留。");
 };
 window.gmDungeonResetAll=function(){
  if(!confirm("確定要把副本累積進度與可挑戰次數全部歸零嗎？"))return;
  const d=dungeonState();d.progress=0;d.attempts=0;
  refreshAfterDungeonGm("副本測試資料已全部歸零。");
 };

 function gmDungeonMapOptions(){
  return MAPS.map((map,mapIdx)=>`<option value="${mapIdx}" ${mapIdx===dungeonDebugMap?"selected":""}>${mapIdx+1}. ${map.name}（Lv.${map.min}～${map.max}）</option>`).join("");
 }
 function gmDungeonEnemyOptions(mapIdx){
  const safeMap=Math.max(0,Math.min(MAPS.length-1,Number(mapIdx)||0));
  return MAPS[safeMap].enemies.map((e,eIdx)=>{
   const kind=e[2]==="boss"?"Boss":e[2]==="elite"?"菁英":"普通";
   return `<option value="${eIdx}" ${eIdx===dungeonDebugEnemy?"selected":""}>${kind}｜${e[0]} Lv.${e[1]}</option>`;
  }).join("");
 }
 window.gmDungeonChangeMap=function(){
  const mapSelect=document.getElementById("gmDungeonMap");
  const enemySelect=document.getElementById("gmDungeonMonster");
  if(!mapSelect||!enemySelect)return;
  dungeonDebugMap=Math.max(0,Math.min(MAPS.length-1,Number(mapSelect.value)||0));
  dungeonDebugEnemy=0;
  enemySelect.innerHTML=gmDungeonEnemyOptions(dungeonDebugMap);
  enemySelect.value="0";
 };
 window.gmDungeonChangeEnemy=function(){
  const enemySelect=document.getElementById("gmDungeonMonster");
  if(!enemySelect)return;
  const max=Math.max(0,(MAPS[dungeonDebugMap]?.enemies?.length||1)-1);
  dungeonDebugEnemy=Math.max(0,Math.min(max,Number(enemySelect.value)||0));
 };
 window.gmDungeonDebug=function(){
  const d=dungeonState();
  const level=Math.max(1,Math.floor(Number(state.level)||1));
  const playerBaseHp=baseHP(level);
  const ps=equippedStats();
  const mapIdx=Math.max(0,Math.min(MAPS.length-1,Number(document.getElementById("gmDungeonMap")?.value)||dungeonDebugMap||0));
  const maxEnemy=Math.max(0,MAPS[mapIdx].enemies.length-1);
  const eIdx=Math.max(0,Math.min(maxEnemy,Number(document.getElementById("gmDungeonMonster")?.value)||0));
  dungeonDebugMap=mapIdx;
  dungeonDebugEnemy=eIdx;
  let enemy=null;
  try{enemy=monsterObj(mapIdx,eIdx);}catch(e){}
  if(!enemy)return alert(`副本 Debug\n目前累積：${formatDungeonProgress(d.progress)}%\n可挑戰次數：${d.attempts}\n目前沒有可計算的怪物。`);
  const enemyPart=(enemy.hp/playerBaseHp)*1.5;
  const minProgress=typeof calculateDungeonBattleProgress==="function"?calculateDungeonBattleProgress({source:"main",win:true,enemyMaxHp:enemy.hp,playerLevel:level,playerMaxHp:ps.hp,startHp:ps.hp,endHp:ps.hp}):enemyPart;
  const nearDeathEnd=Math.max(1,Math.floor(ps.hp*.01));
  const nearDeathProgress=typeof calculateDungeonBattleProgress==="function"?calculateDungeonBattleProgress({source:"main",win:true,enemyMaxHp:enemy.hp,playerLevel:level,playerMaxHp:ps.hp,startHp:ps.hp,endHp:nearDeathEnd}):enemyPart+3.96;
  alert(`副本 Debug\n地圖：${MAPS[mapIdx].name}\n怪物：${enemy.name} Lv.${enemy.level}\n類型：${enemy.kind==="boss"?"Boss":enemy.kind==="elite"?"菁英":"普通"}\n敵人最大 HP：${enemy.hp}\n玩家等級：Lv.${level}\n玩家基礎 HP：${playerBaseHp}\n玩家實際最大 HP：${ps.hp}\n\nHP 負擔部分：${formatDungeonProgress(enemyPart)}%\n無損勝利：約 ${formatDungeonProgress(minProgress)}%\n接近殘血勝：約 ${formatDungeonProgress(nearDeathProgress)}%\n\n目前累積：${formatDungeonProgress(d.progress)}%\n可挑戰次數：${formatDungeonAttempts(d.attempts)} 次`);
 };

 if(typeof gmHtml==="function"){
  const baseGmHtmlForDungeon=gmHtml;
  gmHtml=function(){
   const base=baseGmHtmlForDungeon();
   const d=dungeonState();
   dungeonDebugMap=Math.max(0,Math.min(MAPS.length-1,dungeonDebugMap));
   const maxEnemy=Math.max(0,MAPS[dungeonDebugMap].enemies.length-1);
   dungeonDebugEnemy=Math.max(0,Math.min(maxEnemy,dungeonDebugEnemy));
   return `${base}<div class="gm dungeon-gm" style="margin-top:14px"><h3>副本進度測試</h3><div class="muted">只測試副本次數累積核心；不會進入真正副本。</div><div class="notice dungeon-gm-status" style="margin-top:10px">目前：${formatDungeonProgress(d.progress)}%　／　可挑戰 ${formatDungeonAttempts(d.attempts)} 次</div><div class="controls dungeon-gm-actions" style="margin-top:10px"><button class="btn" onclick="gmDungeonAddProgress(10)">進度 +10%</button><button class="btn" onclick="gmDungeonAddProgress(100)">進度 +100%</button><button class="btn" onclick="gmDungeonAddProgress(250)">進度 +250%</button><button class="btn" onclick="gmDungeonAddAttempt()">次數 +1</button><button class="btn" onclick="gmDungeonClearProgress()">進度歸零</button><button class="btn danger" onclick="gmDungeonResetAll()">副本資料全重置</button></div><div class="item dungeon-debug-box" style="margin-top:14px"><b>副本 Debug</b><div class="muted" style="margin-top:5px">先選地圖，再選該地圖的怪物；未來增加地圖時也不會讓怪物清單無限變長。</div><div class="controls dungeon-debug-controls" style="margin-top:10px"><label>地圖<br><select id="gmDungeonMap" class="btn dungeon-debug-select" onchange="gmDungeonChangeMap()">${gmDungeonMapOptions()}</select></label><label>怪物<br><select id="gmDungeonMonster" class="btn dungeon-debug-select" onchange="gmDungeonChangeEnemy()">${gmDungeonEnemyOptions(dungeonDebugMap)}</select></label><button class="btn blue" onclick="gmDungeonDebug()">查看 Debug</button></div></div></div>`;
  };
 }

 // ui.js 在本檔之前已經做過一次初始 render；所有副本 UI wrapper 安裝完成後補畫一次，
 // 確保首次進站與重新整理時，首頁就直接顯示副本進度／可挑戰次數。
 if(typeof render==="function")render();
})();
