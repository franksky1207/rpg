(function(){
 const VERSION=1;
 const STAGE_NAMES=["第一戰","第二戰","第三戰"];
 const baseOpenArenaDungeon=window.openArenaDungeon;
 const baseRenderArenaDungeon=window.renderArenaDungeon;
 const baseGetArenaCoreState=window.getArenaCoreState;
 let uiState={running:false,selectedMode:null,requestedRuns:0,lastMessage:""};
 function world3(){try{return typeof window.currentWorldPhase==="function"?window.currentWorldPhase(state)===3:state?.thirdWorld?.entered===true;}catch(e){return false;}}
 function esc(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
 function daily(){return typeof window.getThirdWorldArenaDailyStatus==="function"?window.getThirdWorldArenaDailyStatus():typeof window.dailyDungeonStatus==="function"?window.dailyDungeonStatus("arena"):{used:0,remaining:0,limit:20};}
 function runtime(){return typeof window.getThirdWorldArenaRuntimeState==="function"?window.getThirdWorldArenaRuntimeState():{status:"idle",requestedRuns:0,startedRuns:0,finishedRuns:0,fullClears:0,failedRuns:0,totalAwardedPoints:0,round:null,lastResult:null,daily:daily()};}
 function rewardPreview(){return typeof window.getThirdWorldArenaRewardPreview==="function"?window.getThirdWorldArenaRewardPreview():{actualPoints:0,scaledPoints:0};}
 function installStyles(){
  if(typeof document==="undefined"||document.getElementById("thirdWorldArenaUiStyles"))return;
  const style=document.createElement("style");style.id="thirdWorldArenaUiStyles";style.textContent=`
   .w3-arena-shell{max-width:900px;margin:0 auto}.w3-arena-panel{background:linear-gradient(180deg,#171b2a,#10131d);border:1px solid #57627f;border-radius:16px;padding:18px;box-shadow:0 16px 42px rgba(0,0,0,.28)}
   .w3-arena-title{text-align:center;font-size:25px;font-weight:850;color:#dce8ff;letter-spacing:.08em}.w3-arena-attempts{text-align:center;color:#b7c4df;margin-top:7px}.w3-arena-note{text-align:center;color:#a8b5cc;margin:10px 0 0;line-height:1.55}
   .w3-arena-modes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:16px}.w3-arena-mode{background:linear-gradient(180deg,#1a2031,#121724);border:1px solid #596b91;border-radius:14px;padding:16px;min-width:0}.w3-arena-mode h2{margin:0;color:#e5edff;font-size:20px}.w3-arena-mode p{color:#bdc9dc;line-height:1.6;min-height:52px}.w3-arena-reward{margin-top:10px;padding:10px 12px;border:1px solid #6f79a0;border-radius:10px;background:#101522;color:#dce7ff;font-weight:800}.w3-arena-reward small{display:block;margin-top:5px;color:#99a7bf;font-weight:500}.w3-arena-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:12px}.w3-arena-actions .btn{width:100%;min-width:0;padding:10px 6px}.w3-arena-actions .btn:disabled{opacity:.45;cursor:not-allowed}
   .w3-arena-lineup{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}.w3-arena-lineup>div{border:1px solid #45516f;border-radius:10px;padding:9px;background:#111723;min-width:0}.w3-arena-lineup span{display:block;color:#8fa0be;font-size:11px}.w3-arena-lineup b{display:block;color:#e0e8f7;margin-top:3px;overflow-wrap:anywhere}.w3-arena-lineup small{display:block;color:#a7b6d0;margin-top:3px}
   .w3-arena-progress{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px auto 14px;max-width:620px}.w3-arena-step{border:1px solid #3e4963;border-radius:8px;padding:7px;text-align:center;color:#7f8ca5;background:#11151f}.w3-arena-step.current{border-color:#8aa8e8;color:#eef4ff;background:#1b2943}.w3-arena-step.done{border-color:#557d72;color:#bce7d9;background:#14231f}
   .w3-arena-result-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:14px 0}.w3-arena-result-grid>div{border:1px solid #46516c;border-radius:10px;padding:10px;background:#111722;text-align:center}.w3-arena-result-grid span{display:block;color:#93a2bd;font-size:12px}.w3-arena-result-grid b{display:block;color:#e5edff;font-size:19px;margin-top:4px}.w3-arena-last{margin:12px 0;border:1px solid #45516f;border-radius:10px;padding:10px 12px;background:#10151f;color:#c2cee1;line-height:1.55}.w3-arena-result-actions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
   @media(max-width:760px){.w3-arena-panel{padding:13px}.w3-arena-modes{grid-template-columns:1fr}.w3-arena-mode p{min-height:0}.w3-arena-actions{grid-template-columns:repeat(2,1fr)}.w3-arena-lineup{grid-template-columns:1fr}.w3-arena-result-grid{grid-template-columns:repeat(2,1fr)}}
  `;document.head.appendChild(style);
 }
 function attemptsHtml(){const d=daily();return `今日競技場：<strong>${d.used} / ${d.limit}</strong>・剩餘 ${d.remaining} 輪`;}
 function buttonLabel(count){return count===1?"單場":`${count}場`;}
 function modeCard(id,title,description){
  const preview=rewardPreview(),choices=Array.isArray(window.THIRD_WORLD_ARENA_RUN_CHOICES)?window.THIRD_WORLD_ARENA_RUN_CHOICES:[1,5,10,20];
  const buttons=choices.map(count=>{const s=typeof window.getThirdWorldArenaRunChoiceStatus==="function"?window.getThirdWorldArenaRunChoiceStatus(count):{enabled:daily().remaining>=count};return `<button class="btn${count===1?"":" primary"}" ${s.enabled?"":"disabled"} onclick="startThirdWorldArenaUi('${id}',${count})">${buttonLabel(count)}</button>`;}).join("");
  return `<section class="w3-arena-mode"><h2>${title}</h2><p>${description}</p><div class="w3-arena-reward">三戰全勝可得：${Number(preview.actualPoints||0).toLocaleString()} VIP積分<small>未全勝時，依已通過戰數結算。</small></div><div class="w3-arena-actions">${buttons}</div></section>`;
 }
 function selectHtml(){
  return `<div class="function-page dungeon-page-shell w3-arena-shell"><div class="back-home"><button class="btn back-btn" onclick="go('dungeon')">← 返回副本列表</button></div><section class="w3-arena-panel"><div class="w3-arena-title">高維競技場</div><div class="w3-arena-attempts">${attemptsHtml()}</div><div class="w3-arena-note">每輪包含三次連續戰鬥，戰鬥間不會恢復生命。</div><div class="w3-arena-modes">${modeCard("fixed","定相競技場","三戰挑戰同一名高維存在。每一輪開始時將隨機決定對手。")}${modeCard("varied","異相競技場","三戰分別挑戰三名不同的高維存在。每輪都會重新組合對手。")}</div></section></div>`;
 }
 function progressHtml(rt){const stage=Math.max(0,Math.min(2,Number(rt?.round?.stageIndex)||0));return `<div class="w3-arena-progress">${STAGE_NAMES.map((name,i)=>`<div class="w3-arena-step ${i<stage?"done":i===stage?"current":""}">${name}</div>`).join("")}</div>`;}
 function lineupHtml(rt){const rows=rt?.round?.lineup||[];return `<div class="w3-arena-lineup">${rows.map((row,i)=>`<div><span>${STAGE_NAMES[i]}</span><b>${esc(row.name||"")}</b><small>${esc(row.typeLabel||"高維存在")}</small></div>`).join("")}</div>`;}
 function combatHtml(){
  const rt=runtime(),round=rt.round,e=round?.enemy||{},stats=round?.player||{hp:1},hp=Math.max(0,Number(state?.hp)||0),maxHp=Math.max(1,Number(stats.hp)||1),mode=typeof window.getThirdWorldArenaMode==="function"?window.getThirdWorldArenaMode(rt.mode):null,stage=Math.max(0,Math.min(2,Number(round?.stageIndex)||0)),stop=rt.requestedRuns>1?`<div class="controls arena-actions"><button id="w3ArenaStopBtn" class="btn" onclick="requestThirdWorldArenaUiStop()">${rt.stopRequested?"本輪結束後停止":"停止後續場次"}</button></div>`:"";
  return `<section class="combat-screen arena-combat"><div class="combat-head arena-combat-head">【高維競技場・${esc(mode?.name||"")}】${STAGE_NAMES[stage]}・第 ${rt.startedRuns} / ${rt.requestedRuns} 輪</div>${progressHtml(rt)}${lineupHtml(rt)}<div class="combat-arena"><div class="combatant player arena-player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${typeof window.playerIdentityNameHtml==="function"?window.playerIdentityNameHtml({compact:true}):esc(typeof currentPlayerName==="function"?currentPlayerName():"玩家")} Lv.${state.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${Math.round(hp)} / ${Math.round(maxHp)}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${Math.max(0,Math.min(100,hp/maxHp*100))}%"></span></div></div></div><div class="combat-vs arena-vs">VS</div><div class="combatant enemy arena-enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><div class="arena-combat-tier">${esc(e.typeLabel||"高維存在")}</div><h2 id="combatEnemyName">${esc(e.name||"高維投影")}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${Math.round(Number(e.hp)||0)} / ${Math.round(Number(e.hp)||0)}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message arena-message" id="combatMessage">準備戰鬥</div>${stop}</section>`;
 }
 function resultHtml(){
  const rt=runtime(),last=rt.lastResult,d=daily(),mode=typeof window.getThirdWorldArenaMode==="function"?window.getThirdWorldArenaMode(rt.mode):null;
  const lastRows=Array.isArray(last?.history)?last.history.map(row=>`${STAGE_NAMES[row.stageIndex]||"戰鬥"}：${row.win?`勝利　+${Number(row.scaledPoints||0).toLocaleString()}`:"敗北"}`).join("<br>"):"";
  return `<div class="function-page dungeon-page-shell w3-arena-shell"><div class="back-home"><button class="btn back-btn" onclick="go('dungeon')">← 返回副本列表</button></div><section class="w3-arena-panel"><div class="w3-arena-title">${esc(mode?.name||"高維競技場")}・挑戰結算</div><div class="w3-arena-attempts">今日競技場：<strong>${d.used} / ${d.limit}</strong>・剩餘 ${d.remaining} 輪</div><div class="w3-arena-result-grid"><div><span>完成</span><b>${rt.finishedRuns} 輪</b></div><div><span>三戰全勝</span><b>${rt.fullClears} 輪</b></div><div><span>未全勝</span><b>${rt.failedRuns} 輪</b></div><div><span>總獲得</span><b>${Number(rt.totalAwardedPoints||0).toLocaleString()}</b></div></div>${lastRows?`<div class="w3-arena-last"><b>最後一輪</b><br>${lastRows}<br>本輪實得：${Number(last?.awardedPoints||0).toLocaleString()} VIP積分</div>`:""}<div class="w3-arena-result-actions"><button class="btn primary" ${d.remaining>0?"":"disabled"} onclick="openArenaDungeon()">${d.remaining>0?"重新選擇":"今日競技場次數已用完"}</button><button class="btn" onclick="go('dungeon')">返回副本列表</button></div></section></div>`;
 }
 function renderW3(){const rt=runtime();if(rt.status==="combat"&&rt.round)return combatHtml();if(rt.status==="complete"||rt.status==="stopped")return resultHtml();return selectHtml();}
 function sleep(ms){if(typeof window.backgroundProgressSleep==="function")return window.backgroundProgressSleep(ms,"arena");return new Promise(resolve=>setTimeout(resolve,ms));}
 function gap(){try{return typeof window.combatOuterGapMs==="function"?window.combatOuterGapMs("arena"):140;}catch(e){return 140;}}
 async function playSelected(){
  if(uiState.running||!world3())return false;uiState.running=true;
  const startedBackground=uiState.requestedRuns>1&&typeof window.backgroundProgressStart==="function";
  if(startedBackground)window.backgroundProgressStart("arena",{mode:"third-world",runs:uiState.requestedRuns});
  try{
   while(world3()){
    let rt=runtime();
    if(rt.status==="ready"||rt.status==="between"){
     const begin=typeof window.beginThirdWorldArenaRound==="function"?window.beginThirdWorldArenaRound():{ok:false};
     if(!begin.ok)break;
     rt=runtime();if(typeof render==="function")render();await sleep(Math.min(80,gap()));
    }
    rt=runtime();
    if(rt.status!=="combat"||!rt.round)break;
    while(rt.status==="combat"&&rt.round){
     const before=rt,enemy=before.round.enemy?{...before.round.enemy}:null,startHp=Math.max(0,Number(state?.hp)||0);
     if(typeof battleBusy!=="undefined"&&battleBusy){await sleep(30);rt=runtime();continue;}
     if(typeof battleBusy!=="undefined")battleBusy=true;
     let out=null;
     try{out=typeof window.fightThirdWorldArenaCurrentStage==="function"?window.fightThirdWorldArenaCurrentStage():null;
      if(out?.combat&&typeof window.animateStructuredCombatPresentation==="function")await window.animateStructuredCombatPresentation({...out.combat,e:enemy,combatEndHp:out.combat.hp??out.combat.combatEndHp},{mode:"arena",clearAfter:true,clearReason:"w3-arena-stage-end",startHp});
     }finally{if(typeof battleBusy!=="undefined")battleBusy=false;}
     rt=runtime();if(typeof render==="function")render();
     if(rt.status==="combat")await sleep(gap());
    }
    rt=runtime();
    if(rt.status==="between"){await sleep(gap());continue;}
    if(rt.status==="complete"||rt.status==="stopped")break;
   }
  }catch(error){console.error("World 3 Arena UI run failed",error);uiState.lastMessage="競技場挑戰發生錯誤，請重新整理後再試。";if(typeof alert==="function")alert(uiState.lastMessage);}
  finally{uiState.running=false;if(startedBackground&&typeof window.backgroundProgressStop==="function")window.backgroundProgressStop("arena");if(typeof render==="function")render();}
  return true;
 }
 window.openArenaDungeon=function(...args){
  if(!world3())return typeof baseOpenArenaDungeon==="function"?baseOpenArenaDungeon.apply(this,args):false;
  if(typeof window.resetThirdWorldArenaRuntime==="function")window.resetThirdWorldArenaRuntime();
  uiState={running:false,selectedMode:null,requestedRuns:0,lastMessage:""};view="dungeon-arena";if(typeof render==="function")render();return true;
 };
 window.renderArenaDungeon=function(){if(world3())return renderW3();return typeof baseRenderArenaDungeon==="function"?baseRenderArenaDungeon():"";};
 window.getArenaCoreState=function(){if(world3()){const rt=runtime();return {phase:rt.status==="combat"?"combat":rt.status==="complete"||rt.status==="stopped"?"result":"select",world:3,thirdWorld:true,runtime:rt,daily:daily()};}return typeof baseGetArenaCoreState==="function"?baseGetArenaCoreState():null;};
 window.startThirdWorldArenaUi=function(mode,count){
  if(!world3())return false;const start=typeof window.startThirdWorldArenaSession==="function"?window.startThirdWorldArenaSession(mode,count):{ok:false,reason:"core-missing"};
  if(!start.ok){if(typeof alert==="function")alert(start.reason==="insufficient-daily"?"今日剩餘競技場次數不足。":"無法開始高維競技場挑戰。");return false;}
  uiState.selectedMode=String(mode||"");uiState.requestedRuns=Math.max(1,Number(count)||1);view="dungeon-arena";if(typeof render==="function")render();setTimeout(playSelected,0);return true;
 };
 window.requestThirdWorldArenaUiStop=function(){const out=typeof window.requestThirdWorldArenaStop==="function"?window.requestThirdWorldArenaStop():{ok:false};if(typeof render==="function")render();return out;};
 window.THIRD_WORLD_ARENA_UI_VERSION=VERSION;
 window.THIRD_WORLD_ARENA_PLAYER_FLOW_VERSION=1;
 window.THIRD_WORLD_ARENA_BATCH_BUTTON_VERSION=1;
 window.THIRD_WORLD_ARENA_RELOAD_SAFE_PRESENTATION_VERSION=1;
 installStyles();
})();
