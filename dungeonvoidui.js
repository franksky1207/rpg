(function(){
 let voidUi={phase:"idle",running:false,exitAfterFloor:false,floorResult:null,finalRun:null,message:""};
 const sleep=ms=>typeof window.backgroundProgressSleep==="function"&&typeof window.backgroundProgressIsActive==="function"&&window.backgroundProgressIsActive("void")?window.backgroundProgressSleep(ms,"void"):new Promise(resolve=>setTimeout(resolve,ms));

 function injectStyles(){
  if(document.getElementById("void-mirage-ui-styles"))return;
  const style=document.createElement("style");
  style.id="void-mirage-ui-styles";
  style.textContent=`
  .dungeon-mode-tower{background:linear-gradient(180deg,#15232b,#11191f);border-color:#3f7787}.dungeon-mode-tower h3{color:#8fd5e3}.dungeon-mode-tower .dungeon-entry-btn{background:#245c6b;border-color:#3f8294;color:#effcff}.dungeon-mode-tower .dungeon-entry-btn:not(:disabled):hover{background:#2d7183}
  .void-shell{max-width:960px;margin:0 auto;padding-bottom:14px}.void-panel{background:linear-gradient(180deg,#13242d,#0d171d);border:1px solid #3d7788;color:#e8f8fb}.void-title{text-align:center;color:#90dce9;font-size:23px;font-weight:850;letter-spacing:.06em;margin-bottom:12px}
  .void-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:0 0 14px}.void-stat{background:#0c171c;border:1px solid #2c5560;border-radius:10px;padding:10px;text-align:center;min-width:0}.void-stat span{display:block;color:#8eabb2;font-size:12px}.void-stat strong{display:block;color:#e8fbff;font-size:19px;margin-top:3px;overflow-wrap:anywhere}
  .void-combat{background:linear-gradient(180deg,#102129,#0c151a);border:1px solid #356f80;border-radius:16px;padding:16px}.void-combat .combat-head{color:#90dce9}.void-player{background:linear-gradient(180deg,#18232b,#10161b)!important;border-color:#536f80!important}.void-enemy{background:linear-gradient(180deg,#16313a,#0f2027)!important;border-color:#4a93a5!important;box-shadow:0 18px 44px rgba(26,91,108,.27)}.void-enemy h2{color:#dffaff}.void-vs{color:#80cbd8}.void-message{color:#9dd8e2}
  .void-floor-badge{display:inline-block;border:1px solid #4d91a2;border-radius:999px;padding:4px 10px;color:#9ee5f0;background:#102a32;font-weight:800;margin-bottom:7px}.void-boss-badge{border-color:#c79d58;color:#f0cb84;background:#302412}.void-enemy-meta,.void-player-meta{color:#b9d4da;font-size:13px;line-height:1.6;margin:7px 0}.void-reward{color:#f0cd7d;font-weight:800}
  .void-actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:14px}.void-top-exit{margin:6px 0 10px}.void-top-exit .void-exit-btn{width:100%;max-width:520px}.void-exit-btn{background:#7b3438;border-color:#a24a50;color:#fff}.void-exit-btn:hover{background:#914047}.void-exit-btn:disabled{opacity:.62;cursor:not-allowed}.void-result{max-width:680px;margin:0 auto;text-align:center;padding:22px}.void-result h2{color:#dffaff;margin:6px 0 14px}.void-result-reason{font-size:18px;font-weight:800;color:#9ddbe5;margin-bottom:12px}.void-result-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;text-align:left;margin:14px 0}.void-result-grid>div{background:#0d191f;border:1px solid #2f5965;border-radius:10px;padding:11px}.void-result-grid span{display:block;color:#8faab1;font-size:12px}.void-result-grid strong{display:block;color:#edfaff;font-size:18px;margin-top:3px}.void-claim-line{color:#b9d4da;line-height:1.6;margin-top:10px}.void-claim-line strong{color:#f0cd7d}
  @media(max-width:760px){
   .void-shell{padding:0 4px 12px}.void-panel{padding:7px}.void-title{font-size:18px;margin-bottom:6px}.void-stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;margin-bottom:6px}.void-stat{padding:5px 3px;border-radius:7px}.void-stat span{font-size:10px;line-height:1.15}.void-stat strong{font-size:14px;margin-top:2px}
   .void-combat{padding:7px;border-radius:11px;min-height:0}.void-combat .combat-head{margin-bottom:5px;font-size:13px}.void-combat .combat-arena{gap:6px;min-height:0;flex:0 0 auto;grid-template-rows:auto 30px auto;align-items:stretch}.void-combat .combatant{padding:8px;min-height:0;border-radius:10px;justify-content:center}.void-combat .combatant h2{font-size:18px;margin:3px 0 6px}.void-vs{font-size:17px;margin:0;line-height:30px;align-self:center}
   .void-floor-badge{padding:2px 7px;margin-bottom:3px;font-size:11px}.void-enemy-meta,.void-player-meta{margin:2px 0;font-size:11px;line-height:1.35}.void-reward{font-size:13px;margin:2px 0}.void-combat .big-hp{margin-top:5px}.void-combat .status-label{font-size:12px;margin-bottom:3px}.void-combat .bar{height:10px}.void-message{font-size:12px;min-height:0;margin-top:5px;padding:5px}.void-top-exit{margin:4px 0 6px}.void-top-exit .void-exit-btn{padding:9px 10px;font-size:14px}.void-result{padding:17px 12px}
  }
  @media(max-width:430px){.void-result-grid{grid-template-columns:1fr}.void-actions .btn{width:100%}}
  `;
  document.head.appendChild(style);
 }

 function progressSafe(){
  if(typeof ensureVoidMirageState==="function")return ensureVoidMirageState()||{highestCleared:0};
  return state?.dungeon?.voidMirage||{highestCleared:0};
 }
 function dailySafe(){return typeof voidMirageDailyStatus==="function"?voidMirageDailyStatus():{highestFloor:0,claimed:false,baseReward:0,reward:0,canClaim:false};}
 function startFloor(){return typeof getVoidMirageStartFloor==="function"?getVoidMirageStartFloor():Math.max(1,(progressSafe().highestCleared||0)-100);}
 function reasonText(reason){if(reason==="defeat")return "挑戰失敗";if(reason==="exit")return "已強制退出";if(reason==="max-floor")return "已達虛空最高層";return "本次挑戰結束";}
 function rewardLabel(daily){
  if(daily.claimed)return "今日已領取";
  if(daily.highestFloor<=0)return "尚無可領獎勵";
  return `${Number(daily.reward||0).toLocaleString()} VIP`;
 }
 function claimButtonHtml(daily){
  const disabled=!daily.canClaim;
  const label=daily.claimed?"今日獎勵已領取":daily.highestFloor<=0?"今日尚無獎勵":"領取今日 VIP 獎勵";
  return `<button class="btn primary" ${disabled?"disabled":""} onclick="${disabled?"void(0)":"claimVoidMirageRewardUI()"}">${label}</button>`;
 }
 function claimLineHtml(daily){
  const bonus=daily.baseReward>0&&daily.reward!==daily.baseReward?`（基礎 ${daily.baseReward.toLocaleString()}）`:"";
  const stateText=daily.claimed?"已領取":daily.highestFloor>0?"尚未領取":"突破至少 1 層後可領";
  return `<div class="void-claim-line">今日獎勵：<strong>${rewardLabel(daily)}</strong>${bonus}　・　${stateText}</div>`;
 }
 function statsHtml(run,floorOverride=null){
  const progress=progressSafe(),daily=dailySafe(),floor=floorOverride||run?.currentFloor||startFloor();
  return `<div class="void-stats"><div class="void-stat"><span>目前樓層</span><strong>第 ${Number(floor).toLocaleString()} 層</strong></div><div class="void-stat"><span>本次突破</span><strong>${Number(run?.cleared||0).toLocaleString()} 層</strong></div><div class="void-stat"><span>歷史最高</span><strong>第 ${Number(progress.highestCleared||0).toLocaleString()} 層</strong></div><div class="void-stat"><span>當日最高</span><strong>第 ${Number(daily.highestFloor||0).toLocaleString()} 層</strong></div></div>`;
 }

 function idleHtml(){
  const p=progressSafe(),daily=dailySafe(),start=startFloor(),max=Math.max(1,Math.floor(Number(window.VOID_MIRAGE_MAX_FLOOR)||5000));
  return `<section class="void-shell"><div class="card void-panel void-result"><div class="void-title">【虛空幻境】</div><div class="void-stats"><div class="void-stat"><span>歷史最高</span><strong>第 ${Number(p.highestCleared||0).toLocaleString()} 層</strong></div><div class="void-stat"><span>挑戰起點</span><strong>第 ${Number(start).toLocaleString()} 層</strong></div><div class="void-stat"><span>當日最高</span><strong>第 ${Number(daily.highestFloor||0).toLocaleString()} 層</strong></div><div class="void-stat"><span>今日可領 VIP</span><strong>${daily.claimed?"已領取":Number(daily.reward||0).toLocaleString()}</strong></div></div><div class="muted">每次挑戰從歷史最高紀錄前 100 層開始，最低第 1 層；最高第 ${max.toLocaleString()} 層。每層戰後完全恢復 HP，可重複挑戰。</div>${claimLineHtml(daily)}${voidUi.message?`<div class="notice" style="margin-top:10px">${voidUi.message}</div>`:""}<div class="void-actions"><button class="btn dungeon-entry-btn" onclick="startVoidMirageChallengeUI()">開始挑戰</button>${claimButtonHtml(daily)}<button class="btn" onclick="returnFromVoidMirage()">返回副本</button></div></div></section>`;
 }

 function combatHtml(fr,run){
  const e=fr.enemy,s=run?.playerSnapshot||playerCombatStats(),floor=fr.floor,boss=e?.isBossFloor,daily=dailySafe();
  const traits=typeof combatTraitBadgesHtml==="function"?combatTraitBadgesHtml(e?.traits):"";
  const exitLabel=voidUi.exitAfterFloor?"本層結束後將退出":"強制退出虛空幻境";
  return `<section class="void-shell"><div class="card void-panel"><div class="void-title">【虛空幻境】</div>${statsHtml(run,floor)}${claimLineHtml(daily)}<div class="void-actions void-top-exit"><button class="btn void-exit-btn" ${voidUi.exitAfterFloor?"disabled":""} onclick="requestVoidMirageExitUI()">${exitLabel}</button></div><div class="combat-screen void-combat"><div class="combat-head">自動挑戰中</div><div class="combat-arena"><div class="combatant player void-player" id="voidPlayerCard"><div class="combat-damage" id="voidPlayerDamage"></div><h2>${escapePlayerName(currentPlayerName())} Lv.${state.level}</h2><div class="void-player-meta">ATK ${s.atk}　DEF ${s.def}<br>暴擊 ${s.crit}%　閃避 ${s.dodge}%</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="voidPlayerHp">${s.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="voidPlayerBar" style="width:100%"></span></div></div></div><div class="combat-vs void-vs">VS</div><div class="combatant enemy void-enemy" id="voidEnemyCard"><div class="combat-damage" id="voidEnemyDamage"></div><div class="void-floor-badge${boss?" void-boss-badge":""}">${boss?"雙特性關卡":"一般關卡"}</div><h2>${e.name}</h2>${traits}<div class="void-enemy-meta">ATK ${e.atk}　DEF ${e.def}<br>暴擊 ${e.crit}%　閃避 ${e.dodge}%</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="voidEnemyHp">${e.hp} / ${e.hp}</span></div><div class="bar"><span class="hp" id="voidEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message void-message" id="voidCombatMessage">準備戰鬥</div></div></div></section>`;
 }

 function resultHtml(run){
  const progress=progressSafe(),daily=dailySafe(),cleared=run?.cleared||0,isExit=run?.endedReason==="exit",isMax=run?.endedReason==="max-floor",endFloor=isExit?(run?.lastClearedFloor||run?.startFloor||0):isMax?(run?.lastClearedFloor||window.VOID_MIRAGE_MAX_FLOOR||5000):(run?.failedFloor||0),endLabel=isExit?"退出樓層":isMax?"最高到達":"失敗樓層",endText=endFloor?`第 ${Number(endFloor).toLocaleString()} 層`:"—",nextStart=startFloor();
  return `<section class="void-shell"><div class="card void-panel void-result"><div class="void-title">【虛空幻境】</div><div class="void-result-reason">${reasonText(run?.endedReason)}</div><h2>本次挑戰完成</h2><div class="void-result-grid"><div><span>本次突破</span><strong>${Number(cleared).toLocaleString()} 層</strong></div><div><span>${endLabel}</span><strong>${endText}</strong></div><div><span>歷史最高</span><strong>第 ${Number(progress.highestCleared||0).toLocaleString()} 層</strong></div><div><span>當日最高</span><strong>第 ${Number(daily.highestFloor||0).toLocaleString()} 層</strong></div><div><span>下次挑戰起點</span><strong>第 ${Number(nextStart).toLocaleString()} 層</strong></div><div><span>今日可領 VIP</span><strong>${daily.claimed?"已領取":Number(daily.reward||0).toLocaleString()}</strong></div></div>${claimLineHtml(daily)}${voidUi.message?`<div class="notice" style="margin-top:10px">${voidUi.message}</div>`:""}<div class="muted" style="margin-top:10px">目前 VIP 積分：${Math.floor(Number(state.vipPoints)||0).toLocaleString()}</div><div class="void-actions"><button class="btn dungeon-entry-btn" onclick="startVoidMirageChallengeUI()">再次挑戰</button>${claimButtonHtml(daily)}<button class="btn" onclick="returnFromVoidMirage()">返回副本</button></div></div></section>`;
 }

 window.renderVoidMirageDungeon=function(){
  injectStyles();
  if(voidUi.phase==="result"&&voidUi.finalRun)return resultHtml(voidUi.finalRun);
  const run=typeof getVoidMirageRunSnapshot==="function"?getVoidMirageRunSnapshot():null;
  if(voidUi.floorResult&&run)return combatHtml(voidUi.floorResult,run);
  return idleHtml();
 };

 function setHpUi(ehp,enemyMax,php,playerMax,message){
  const eb=document.getElementById("voidEnemyBar"),eh=document.getElementById("voidEnemyHp"),pb=document.getElementById("voidPlayerBar"),ph=document.getElementById("voidPlayerHp"),msg=document.getElementById("voidCombatMessage");
  if(eb)eb.style.width=`${Math.max(0,Math.min(100,ehp/enemyMax*100))}%`;
  if(eh)eh.textContent=`${Math.max(0,ehp)} / ${enemyMax}`;
  if(pb)pb.style.width=`${Math.max(0,Math.min(100,php/playerMax*100))}%`;
  if(ph)ph.textContent=`${Math.max(0,php)} / ${playerMax}`;
  if(msg)msg.textContent=message||"";
 }
 function pulse(target,text){
  const card=document.getElementById(target==="enemy"?"voidEnemyCard":"voidPlayerCard"),dmg=document.getElementById(target==="enemy"?"voidEnemyDamage":"voidPlayerDamage");
  if(card&&text!=="閃避"){card.classList.remove("hit");void card.offsetWidth;card.classList.add("hit");setTimeout(()=>card.classList.remove("hit"),250);}
  if(dmg){dmg.textContent=text;dmg.classList.remove("show");void dmg.offsetWidth;dmg.classList.add("show");}
 }
 async function animateFloor(fr){
  const result=fr.result,e=fr.enemy,playerMax=fr.playerMaxHp||playerCombatStats().hp;let ehp=e.hp,php=playerMax;
  const logs=result?.logs||[],delay=logs.length>90?14:logs.length>50?24:45;
  setHpUi(ehp,e.hp,php,playerMax,"開始戰鬥");await sleep(100);
  for(const line of logs){
   let m=line.match(/^你攻擊.+，(?:暴擊)?造成 (\d+) 點傷害。$/);
   if(m){const n=Number(m[1]);ehp=Math.max(0,ehp-n);pulse("enemy",line.includes("暴擊")?`暴擊 ${n}`:`-${n}`);setHpUi(ehp,e.hp,php,playerMax,line);await sleep(delay);continue;}
   if(line.includes("閃避了你的攻擊")){pulse("enemy","閃避");setHpUi(ehp,e.hp,php,playerMax,line);await sleep(delay);continue;}
   m=line.match(/^.+攻擊你，(?:暴擊)?造成 (\d+) 點傷害。$/);
   if(m){const n=Number(m[1]);php=Math.max(0,php-n);pulse("player",line.includes("暴擊")?`暴擊 ${n}`:`-${n}`);setHpUi(ehp,e.hp,php,playerMax,line);await sleep(delay);continue;}
   if(line.includes("你閃避了攻擊")){pulse("player","閃避");setHpUi(ehp,e.hp,php,playerMax,line);await sleep(delay);continue;}
   setHpUi(ehp,e.hp,php,playerMax,line);await sleep(delay);
  }
  if(result?.win)setHpUi(0,e.hp,Math.max(0,php),playerMax,`第 ${fr.floor} 層突破`);
 }

 async function autoClimb(){
  if(voidUi.running)return;voidUi.running=true;
  try{
   while(true){
    const run=typeof getVoidMirageRunSnapshot==="function"?getVoidMirageRunSnapshot():null;if(!run?.active)break;
    if(voidUi.exitAfterFloor){const exited=requestVoidMirageExit();voidUi.finalRun=exited.run||getVoidMirageRunSnapshot();voidUi.phase="result";voidUi.floorResult=null;render();break;}
    const fr=fightNextVoidMirageFloor();
    if(!fr?.ok){voidUi.finalRun=getVoidMirageRunSnapshot();voidUi.phase="result";voidUi.floorResult=null;render();break;}
    voidUi.floorResult=fr;voidUi.phase="combat";render();await animateFloor(fr);
    if(fr.ended){voidUi.finalRun=fr.run;voidUi.phase="result";voidUi.floorResult=null;render();break;}
    if(voidUi.exitAfterFloor){const exited=requestVoidMirageExit();voidUi.finalRun=exited.run||getVoidMirageRunSnapshot();voidUi.phase="result";voidUi.floorResult=null;render();break;}
    await sleep(350);
   }
  }finally{
   voidUi.running=false;
   if(typeof window.backgroundProgressStop==="function")window.backgroundProgressStop("void");
  }
 }

 window.enterVoidMirageDungeon=function(){
  if(Number(state?.level||0)<25)return;
  if(voidUi.running)return;
  voidUi={phase:"idle",running:false,exitAfterFloor:false,floorResult:null,finalRun:null,message:""};
  view="dungeon-void-mirage";render();
 };
 window.startVoidMirageChallengeUI=function(){
  if(voidUi.running)return;
  const started=typeof beginVoidMirageRun==="function"?beginVoidMirageRun():{ok:false};
  if(!started.ok){voidUi.message="目前無法開始虛空幻境。";render();return;}
  if(typeof window.backgroundProgressStart==="function")window.backgroundProgressStart("void");
  voidUi={phase:"combat",running:false,exitAfterFloor:false,floorResult:null,finalRun:null,message:""};render();
  if(typeof window.backgroundProgressSleep==="function")window.backgroundProgressSleep(100,"void").then(autoClimb);else setTimeout(autoClimb,100);
 };
 window.claimVoidMirageRewardUI=function(){
  if(voidUi.running)return;
  const result=typeof claimVoidMirageDailyReward==="function"?claimVoidMirageDailyReward():{ok:false,reason:"reward_system_missing"};
  if(result.ok)voidUi.message=`已領取今日虛空獎勵：+${Number(result.awarded||0).toLocaleString()} VIP 積分。`;
  else if(result.reason==="already_claimed")voidUi.message="今日虛空獎勵已領取。";
  else if(result.reason==="no_daily_record")voidUi.message="今天尚未突破任何樓層，暫無可領獎勵。";
  else voidUi.message="目前無法領取虛空獎勵。";
  render();
 };
 window.requestVoidMirageExitUI=function(){
  if(voidUi.phase==="result")return;voidUi.exitAfterFloor=true;
  const btn=document.querySelector(".void-exit-btn");if(btn){btn.disabled=true;btn.textContent="本層結束後將退出";}
  const msg=document.getElementById("voidCombatMessage");if(msg)msg.textContent="已要求退出：本層結束後離開虛空幻境。";
 };
 window.returnFromVoidMirage=function(){voidUi={phase:"idle",running:false,exitAfterFloor:false,floorResult:null,finalRun:null,message:""};view="dungeon";render();};

 injectStyles();
})();