(function(){
 const CONFIG=window.MIRROR_DUNGEON_CONFIG;if(!CONFIG)throw new Error("Mirror dungeon config missing.");
 const MIRROR_RUN_VERSION=3;
 const MIRROR_TITLE_CLONE_PERFORMANCE_VERSION=1;
 const BATTLE_TOTAL=CONFIG.runBattles;
 const clampWins=window.mirrorDungeonClampWins;
 const rewardForWins=window.mirrorDungeonRewardForWins;
 const titleForWins=window.mirrorDungeonRecordTitle;
 const commentForWins=window.mirrorDungeonResultComment;
 let run=null;
 function sleep(ms){return new Promise(resolve=>setTimeout(resolve,Math.max(0,Math.floor(Number(ms)||0))));}
 function battleGapMs(){if(typeof window.combatOuterGapMs!=="function")throw new Error("Combat Outer Pacing 未載入。");return window.combatOuterGapMs("mirror");}
 function playerName(){return String(state?.playerName||"玩家");}
 function mirrorName(){return `鏡像・${playerName()}`;}
 function escapeHtml(text){return String(text??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));}
 function fmt(n){return Math.max(0,Math.floor(Number(n)||0)).toLocaleString();}
 function scoreHtml(wins,losses){return `目前 <span class="mirror-run-wins">${wins} 勝</span> <span class="mirror-run-losses">${losses} 敗</span>`;}
 function installStyles(){if(document.getElementById("mirror-run-styles"))return;const style=document.createElement("style");style.id="mirror-run-styles";style.textContent=`
   .mirror-combat-shell{background:linear-gradient(180deg,#20212a,#15161d);border:1px solid #8580a4;border-radius:16px;padding:16px;width:100%}
   .mirror-run-head{text-align:center;margin-bottom:12px}.mirror-run-head h2{margin:0;color:#efedf7;font-family:Georgia,"Noto Serif TC",serif}.mirror-run-progress{margin-top:7px;color:#EDE7FF;font-weight:800;text-shadow:0 2px 8px rgba(0,0,0,.75)}.mirror-run-score{margin-top:4px;color:#F5EEDC;font-size:14px;font-weight:800;text-shadow:0 2px 8px rgba(0,0,0,.75)}.mirror-run-wins{color:#7CFF9A}.mirror-run-losses{color:#FF8A8A}
   .mirror-combat-shell .combatant{border-color:#81799d!important}.mirror-combat-shell .combatant.enemy{background:linear-gradient(180deg,#262331,#171720)!important}.mirror-combat-shell .combatant.player{background:linear-gradient(180deg,#202330,#15171f)!important}.mirror-combat-shell .combat-vs{color:#cbc5e3}.mirror-combat-shell #combatMessage{color:#d8d2e5}
   .mirror-result-page{max-width:720px;margin:0 auto}.mirror-result-panel{background:linear-gradient(180deg,#24242f,#171720);border:1px solid #8b84aa;text-align:center}.mirror-result-panel h2{color:#f2eff9}.mirror-result-score{font-size:30px;font-weight:900;color:#f0edf8;margin:14px 0}.mirror-result-reward{font-size:20px;font-weight:800;color:#d4c1f2;margin:10px 0}.mirror-result-comment{margin:16px auto;padding:13px 15px;max-width:560px;border:1px solid #514b65;border-radius:10px;background:#15151d;color:#ddd8e8;line-height:1.7}.mirror-new-record{margin:13px auto;padding:11px;border:1px solid #9b84c3;border-radius:10px;background:#211b2d;color:#eadcff;font-weight:900}.mirror-miracle{font-size:22px;color:#f2e5ff;letter-spacing:.08em}
   @media(max-width:760px){.mirror-combat-shell{padding:10px}.mirror-result-panel{padding:16px 12px}.mirror-result-score{font-size:25px}}
  `;document.head.appendChild(style);}
 function combatHtml(){installStyles();const r=run;if(!r)return "";const result=r.currentResult,snap=r.snapshot,stats=snap.stats,index=Math.max(1,Math.min(BATTLE_TOTAL,r.currentBattle||1));const playerHp=result?result.maxHp:stats.hp,mirrorHp=result?result.maxHp:stats.hp;return `<section class="combat-screen mirror-combat-shell"><div class="mirror-run-head"><h2>【鏡像戰】</h2><div class="mirror-run-progress">第 ${index} / ${BATTLE_TOTAL} 戰</div><div class="mirror-run-score">${scoreHtml(r.wins,r.losses)}</div></div><div class="combat-arena"><div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${typeof window.playerIdentityNameHtml==="function"?window.playerIdentityNameHtml({name:playerName(),titleId:state?.titles?.equipped,compact:true}):escapeHtml(playerName())} Lv.${snap.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${playerHp} / ${stats.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:100%"></span></div></div></div><div class="combat-vs">VS</div><div class="combatant enemy mirror-title-clone-host" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><h2>${typeof window.playerIdentityNameHtml==="function"?window.playerIdentityNameHtml({name:playerName(),titleId:state?.titles?.equipped,prefix:"鏡像・",compact:true}):escapeHtml(mirrorName())} Lv.${snap.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${mirrorHp} / ${stats.hp}</span></div><div class="bar"><span class="hp enemy" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message" id="combatMessage">準備戰鬥…</div></section>`;}
 function resultHtml(){installStyles();const s=run?.settlement;if(!s)return `<div class="function-page mirror-result-page"><div class="card mirror-result-panel"><h2>鏡像戰</h2><div class="muted">結算資料不存在。</div><div class="controls"><button class="btn" onclick="go('dungeon')">返回副本列表</button></div></div></div>`;const title=titleForWins(s.wins),record=s.newRecord?`<div class="mirror-new-record">NEW RECORD！<br>歷史最高：${s.wins} 勝${title?`・${title}`:""}</div>`:"",miracle=s.wins===BATTLE_TOTAL?`<div class="mirror-new-record mirror-miracle">神蹟</div>`:"";return `<div class="function-page mirror-result-page"><div class="card mirror-result-panel"><h2>鏡像戰完成</h2><div class="mirror-result-score">${s.wins} 勝 ${s.losses} 敗</div><div class="mirror-result-reward">獲得 ${fmt(s.awarded)} VIP 積分</div><div class="mirror-result-comment">${escapeHtml(commentForWins(s.wins))}</div>${record}${miracle}<div class="controls" style="justify-content:center"><button class="btn primary" onclick="go('dungeon')">返回副本列表</button></div></div></div>`;}
 function setHpUi(playerHp,mirrorHp,maxHp,message){const ph=document.getElementById("combatPlayerHp"),pb=document.getElementById("combatPlayerBar"),eh=document.getElementById("combatEnemyHp"),eb=document.getElementById("combatEnemyBar"),msg=document.getElementById("combatMessage");const p=Math.max(0,Math.floor(Number(playerHp)||0)),m=Math.max(0,Math.floor(Number(mirrorHp)||0)),max=Math.max(1,Math.floor(Number(maxHp)||1));if(ph)ph.textContent=`${p} / ${max}`;if(pb)pb.style.width=`${Math.max(0,Math.min(100,p/max*100))}%`;if(eh)eh.textContent=`${m} / ${max}`;if(eb)eb.style.width=`${Math.max(0,Math.min(100,m/max*100))}%`;if(msg)msg.textContent=message||"";}
 function pulse(target,text){const id=target==="player"?"combatPlayer":"combatEnemy",card=document.getElementById(`${id}Card`),dmg=document.getElementById(`${id}Damage`);if(card&&text!=="閃避"&&text!=="吸收"){card.classList.remove("hit");void card.offsetWidth;card.classList.add("hit");setTimeout(()=>card.classList.remove("hit"),260);}if(dmg){dmg.textContent=text;dmg.classList.remove("show");void dmg.offsetWidth;dmg.classList.add("show");}}
 function fx(target,kind,text=null){if(typeof window.spawnCombatFx==="function")window.spawnCombatFx(target,kind,text,0);}
 function mirrorMarkTarget(evt){
  if(evt?.type!=="mark")return null;
  if(evt.mark==="suppression"||evt.mark==="ignore"||evt.mark==="backlash")return evt.target==="player"?"player":"enemy";
  return evt.owner==="player"?"player":"enemy";
 }
 function showMirrorMarkFx(evt){
  if(typeof window.combatMarkFxDescriptor!=="function")return null;
  const desc=window.combatMarkFxDescriptor(evt);if(!desc)return null;
  const target=mirrorMarkTarget(evt);if(target)fx(target,desc.kind,desc.text);
  return desc;
 }
 function eventMessage(evt,names){
  if(evt.type==="firstActor")return `${names[evt.actor]}取得先攻。`;
  if(evt.type==="dodge")return `${names[evt.actor]}攻擊${names[evt.target]}，${names[evt.target]}閃避了攻擊。`;
  if(evt.type==="attack")return evt.absorbed?`${names[evt.actor]}的攻擊被${names[evt.target]}吸收。`:`${names[evt.actor]}攻擊${names[evt.target]}${evt.crit?"，暴擊":""}造成 ${evt.damage} 點傷害。`;
  if(evt.type==="combo")return `${names[evt.actor]}發動連擊。`;
  if(evt.type==="counter")return `${names[evt.actor]}發動反擊。`;
  if(evt.type==="drain")return `${names[evt.actor]}汲取生命${evt.healed>0?`，回復 ${evt.healed} HP`:""}。`;
  if(evt.type==="mark"){const desc=typeof window.combatMarkFxDescriptor==="function"?window.combatMarkFxDescriptor(evt):null;return desc?`${names[evt.owner]}：${desc.text}`:"";}
  if(evt.type==="battleEnd")return `${names[evt.winner]}獲勝。`;
  return "";
 }
 async function animateBattle(result){
  if(typeof window.prepareMirrorCombatPresentation!=="function"||typeof window.animateMirrorStructuredCombatPresentation!=="function")throw new Error("Mirror Structured Combat Presentation 未載入。");
  window.prepareMirrorCombatPresentation(result);
  await window.animateMirrorStructuredCombatPresentation(result,{clearAfter:true,clearReason:"mirror-battle-end"});
 }
 function settlementFor(wins,awarded,oldHistory,recordResult){const w=clampWins(wins),previousHad=!!oldHistory?.bestDate,previousBest=previousHad?clampWins(oldHistory.bestWins):-1;return {wins:w,losses:BATTLE_TOTAL-w,awarded:Math.max(0,Math.floor(Number(awarded)||0)),newRecord:!previousHad||w>previousBest,miracle:w===BATTLE_TOTAL,titleSettlement:recordResult?.titleSettlement||null,history:recordResult?.history||null};}
 async function finishRun(){const r=run;if(!r?.active)return;const status=typeof mirrorDungeonStatus==="function"?mirrorDungeonStatus():null;if(status?.status!=="running")throw new Error("Mirror dungeon state is not running at settlement.");if(typeof addVipPoints!=="function")throw new Error("VIP point system missing.");if(typeof recordMirrorDungeonCompletion!=="function")throw new Error("Mirror completion system missing.");const oldHistory=status.history?JSON.parse(JSON.stringify(status.history)):null,reward=rewardForWins(r.wins),rollback={mirror:JSON.parse(JSON.stringify(state?.dungeon?.mirror||null)),titles:JSON.parse(JSON.stringify(state?.titles||null)),vipPoints:state.vipPoints,vipLevel:state.vipLevel,hp:state.hp};try{const record=recordMirrorDungeonCompletion(r.wins,Date.now(),{save:false});if(!record?.ok)throw new Error(`Mirror completion failed: ${record?.reason||"unknown"}`);const payout=addVipPoints(reward);if(!payout)throw new Error("VIP point payout failed.");if(typeof save==="function"&&save(false)===false)throw new Error("Mirror settlement save failed.");r.settlement=settlementFor(r.wins,payout.added,oldHistory,record);r.active=false;battleBusy=false;view="dungeon-mirror-result";render();if(record?.titleSettlement?.noticeTitle&&typeof window.showPendingPlayerTitleNotice==="function")setTimeout(()=>window.showPendingPlayerTitleNotice(),0);}catch(err){if(state?.dungeon)state.dungeon.mirror=rollback.mirror;state.titles=rollback.titles;state.vipPoints=rollback.vipPoints;state.vipLevel=rollback.vipLevel;state.hp=rollback.hp;throw err;}}
 async function executeRun(){try{for(let i=1;i<=BATTLE_TOTAL;i++){if(!run?.active)return;run.currentBattle=i;const result=runMirrorCombatCore(run.snapshot,{logs:true,playerName:playerName(),mirrorName:mirrorName()});run.currentResult=result;view="dungeon-mirror-combat";render();await animateBattle(result);if(result.win)run.wins++;else run.losses++;const msg=document.getElementById("combatMessage");if(msg)msg.textContent=`第 ${i} 戰${result.win?"勝利":"敗北"}`;const score=document.querySelector(".mirror-run-score");if(score)score.innerHTML=scoreHtml(run.wins,run.losses);await sleep(battleGapMs());}await finishRun();}catch(err){console.error("Mirror dungeon run failed",err);if(typeof failMirrorDungeonState==="function")failMirrorDungeonState();if(run)run.active=false;battleBusy=false;view="dungeon-mirror";render();}}
 window.startMirrorCombatRun=function(){if(run?.active||battleBusy)return false;if(typeof createMirrorCombatSnapshot!=="function"||typeof runMirrorCombatCore!=="function"||typeof beginMirrorDungeonState!=="function")return false;const info=typeof mirrorDungeonStatus==="function"?mirrorDungeonStatus():null;if(!info?.canStart)return false;const snapshot=createMirrorCombatSnapshot();if(!snapshot?.stats?.hp)return false;const begun=beginMirrorDungeonState();if(!begun?.ok)return false;run={version:MIRROR_RUN_VERSION,active:true,snapshot,wins:0,losses:0,currentBattle:1,currentResult:null,settlement:null};battleBusy=true;view="dungeon-mirror-combat";render();Promise.resolve().then(executeRun);return true;};
 window.getMirrorDungeonActiveRun=function(){return run?{active:!!run.active,wins:run.wins,losses:run.losses,currentBattle:run.currentBattle,snapshot:run.snapshot,settlement:run.settlement}:null;};
 window.MIRROR_RUN_VERSION=MIRROR_RUN_VERSION;
 window.MIRROR_TITLE_CLONE_PERFORMANCE_VERSION=MIRROR_TITLE_CLONE_PERFORMANCE_VERSION;
 window.MIRROR_MARK_PRESENTATION_VERSION=1;
 window.mirrorMarkPresentationTarget=mirrorMarkTarget;
 installStyles();
 if(typeof window.registerDungeonViewRenderer==="function"){window.registerDungeonViewRenderer("dungeon-mirror-combat",combatHtml);window.registerDungeonViewRenderer("dungeon-mirror-result",resultHtml);}
 if(typeof window.registerDungeonNavigationGuard==="function")window.registerDungeonNavigationGuard(()=>run?.active?false:true);
 if(typeof render==="function")render();
})();