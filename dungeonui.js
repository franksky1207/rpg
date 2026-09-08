(function(){
 function dungeonState(){
  if(typeof ensureDungeonProgressState==="function")return ensureDungeonProgressState()||{progress:0,attempts:0};
  return state?.dungeon||{progress:0,attempts:0};
 }
 function formatDungeonProgress(n){
  const x=Math.round((Number(n)||0)*100)/100;
  return Number.isInteger(x)?String(x):x.toFixed(2).replace(/0+$/,"" ).replace(/\.$/,"");
 }
 function dungeonStatusHtml(){
  const d=dungeonState();
  return `<div class="notice" style="margin-top:10px"><div><b>副本次數累積進度</b>　${formatDungeonProgress(d.progress)}%</div><div style="margin-top:5px"><b>副本可挑戰次數</b>　${Math.floor(Number(d.attempts)||0)} 次</div></div>`;
 }
 window.dungeonBattleResultHtml=function(ctx){
  const added=Number(ctx?.totalDungeonProgress)||0;
  const gained=Math.floor(Number(ctx?.gainedDungeonAttempts)||0);
  const d=dungeonState();
  return `<div class="notice" style="margin-top:10px"><b>副本次數累積</b><div style="margin-top:5px">本次戰鬥進度 +${formatDungeonProgress(added)}%${gained?`　／　副本可挑戰次數 +${gained}`:""}</div><div class="muted" style="margin-top:5px">目前累積 ${formatDungeonProgress(d.progress)}%　／　可挑戰 ${Math.floor(Number(d.attempts)||0)} 次</div></div>`;
 };

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
 window.gmDungeonDebug=function(){
  const d=dungeonState();
  const level=Math.max(1,Math.floor(Number(state.level)||1));
  const playerBaseHp=baseHP(level);
  const ps=equippedStats();
  let enemy=null;
  try{
   enemy=typeof getPreviewEncounter==="function"?getPreviewEncounter(selectedMap,selectedEnemy):null;
   if(!enemy)enemy=monsterObj(selectedMap,selectedEnemy);
  }catch(e){}
  if(!enemy)return alert(`副本 Debug\n目前累積：${formatDungeonProgress(d.progress)}%\n可挑戰次數：${d.attempts}\n目前沒有可計算的怪物。`);
  const enemyPart=(enemy.hp/playerBaseHp)*1.5;
  const minProgress=typeof calculateDungeonBattleProgress==="function"?calculateDungeonBattleProgress({source:"main",win:true,enemyMaxHp:enemy.hp,playerLevel:level,playerMaxHp:ps.hp,startHp:ps.hp,endHp:ps.hp}):enemyPart;
  const nearDeathEnd=Math.max(1,Math.floor(ps.hp*.01));
  const nearDeathProgress=typeof calculateDungeonBattleProgress==="function"?calculateDungeonBattleProgress({source:"main",win:true,enemyMaxHp:enemy.hp,playerLevel:level,playerMaxHp:ps.hp,startHp:ps.hp,endHp:nearDeathEnd}):enemyPart+3.96;
  alert(`副本 Debug\n怪物：${enemy.name} Lv.${enemy.level}\n敵人最大 HP：${enemy.hp}\n玩家基礎 HP：${playerBaseHp}\n玩家實際最大 HP：${ps.hp}\n\nHP 負擔部分：${formatDungeonProgress(enemyPart)}%\n無損勝利：約 ${formatDungeonProgress(minProgress)}%\n接近殘血勝：約 ${formatDungeonProgress(nearDeathProgress)}%\n\n目前累積：${formatDungeonProgress(d.progress)}%\n可挑戰次數：${Math.floor(Number(d.attempts)||0)} 次`);
 };

 if(typeof gmHtml==="function"){
  const baseGmHtmlForDungeon=gmHtml;
  gmHtml=function(){
   const base=baseGmHtmlForDungeon();
   const d=dungeonState();
   return `${base}<div class="gm" style="margin-top:14px"><h3>副本進度測試</h3><div class="muted">只測試副本次數累積核心；不會進入真正副本。</div><div class="notice" style="margin-top:10px">目前：${formatDungeonProgress(d.progress)}%　／　可挑戰 ${Math.floor(Number(d.attempts)||0)} 次</div><div class="controls" style="margin-top:10px"><button class="btn" onclick="gmDungeonAddProgress(10)">進度 +10%</button><button class="btn" onclick="gmDungeonAddProgress(100)">進度 +100%</button><button class="btn" onclick="gmDungeonAddProgress(250)">進度 +250%</button><button class="btn" onclick="gmDungeonAddAttempt()">次數 +1</button><button class="btn" onclick="gmDungeonClearProgress()">進度歸零</button><button class="btn danger" onclick="gmDungeonResetAll()">副本資料全重置</button><button class="btn blue" onclick="gmDungeonDebug()">副本 Debug</button></div></div>`;
  };
 }
})();
