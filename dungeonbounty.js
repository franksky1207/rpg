(function(){
 const BOUNTY_TIERS=[
  {id:"normal",name:"普通懸賞",weight:45,expMult:5,goldMult:5,gearCount:2,hpMul:1.00,damageMul:1.00,defMul:.88,critScale:.5,critAdd:0,critCap:10,dodgeScale:.5,dodgeAdd:0,dodgeCap:8},
  {id:"high",name:"高級懸賞",weight:35,expMult:8,goldMult:8,gearCount:3,hpMul:1.03,damageMul:1.03,defMul:.90,critScale:.7,critAdd:2,critCap:20,dodgeScale:.7,dodgeAdd:1,dodgeCap:18},
  {id:"danger",name:"危險懸賞",weight:20,expMult:12,goldMult:12,gearCount:5,hpMul:1.08,damageMul:1.06,defMul:.92,critScale:.85,critAdd:3,critCap:28,dodgeScale:.85,dodgeAdd:2,dodgeCap:22}
 ];
 const BOUNTY_QUALITY_WEIGHTS=[0,0,60,35,4.5,.5];
 const BOUNTY_NAMES={
  normal:["武裝逃逸者","非法改裝兵","黑市護衛","走私突擊手","失控安保機"],
  high:["裝甲追緝犯","戰區破壞手","非法火力平台","禁區滲透指揮","深空走私艦長"],
  danger:["都市級威脅體","殲滅協議載體","戰爭失控核心","軌道破壞平台","深空封鎖母艦"]
 };

 function newContinuousSummary(){
  return {runs:0,wins:0,totalExp:0,totalGold:0,convertedGold:0,soldGold:0,gearCount:0,keptCount:0,soldCount:0,stopReason:null};
 }
 let bountyState={phase:"idle",tier:null,enemy:null,result:null,startHp:0,playerMaxHp:0,continuous:false,stopRequested:false,summary:newContinuousSummary()};

 function rateFromPlayer(value,scale,add,cap,maxCap){return round1(Math.max(0,Math.min(maxCap,cap,(Number(value)||0)*scale+add)));}
 function rollTier(){let r=Math.random()*100;for(const t of BOUNTY_TIERS){r-=t.weight;if(r<0)return t;}return BOUNTY_TIERS[0];}
 function bountyTraitCount(tierId){return tierId==="danger"?(Math.random()<.5?1:2):1;}
 function rollBountyTraits(tierId){
  const pool=MONSTER_TRAIT_IDS.slice(),count=bountyTraitCount(tierId),out=[];
  for(let i=0;i<count&&pool.length;i++)out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  return out;
 }
 function buildBountyEnemy(tier,playerStats=null,level=null,options={}){
  const p=createSpecialPlayerSnapshot(playerStats||equippedStats()),base=specialBaseEnemyFromPlayer(p),names=BOUNTY_NAMES[tier.id]||BOUNTY_NAMES.normal;
  const name=typeof options.name==="string"&&options.name?options.name:names[Math.floor(Math.random()*names.length)];
  const traits=Array.isArray(options.traits)?options.traits.slice():rollBountyTraits(tier.id);
  return applyMonsterTraits({
   name,
   level:clampGameLevel(level??state.level),
   kind:"dungeon-bounty",
   bountyTier:tier.id,
   hp:Math.max(1,ceil(base.hp*tier.hpMul)),
   atk:Math.max(1,ceil(base.damage*tier.damageMul+p.def*.55)),
   def:Math.max(0,ceil(base.def*tier.defMul)),
   crit:rateFromPlayer(p.crit,tier.critScale,tier.critAdd,tier.critCap,MONSTER_MAX_CRIT_RATE),
   dodge:rateFromPlayer(p.dodge,tier.dodgeScale,tier.dodgeAdd,tier.dodgeCap,MONSTER_MAX_DODGE_RATE),
   playerSnapshot:p
  },traits);
 }
 function tierClass(id){return id==="danger"?"dungeon-bounty-tag-danger":id==="high"?"dungeon-bounty-tag-high":"dungeon-bounty-tag-normal";}
 function traitNames(enemy){return !enemy?.traits?.length?"無":enemy.traits.map(id=>MONSTER_TRAITS?.[id]?.name||id).join("、");}
 function bountyMapIndex(level){
  const lv=clampGameLevel(level),exact=MAPS.findIndex(m=>lv>=m.min&&lv<=m.max);
  if(exact>=0)return exact;
  for(let i=MAPS.length-1;i>=0;i--)if(lv>=MAPS[i].min)return i;
  return 0;
 }
 function bountyBaseExp(level=state.level){const lv=clampGameLevel(level);return expReward({kind:"normal",level:lv});}
 function bountyExpReward(tier,level=state.level){return Math.max(0,Math.floor(bountyBaseExp(level)*Math.max(1,Number(tier?.expMult)||1)));}
 function bountyGoldReward(tier,level=state.level){const lv=clampGameLevel(level),normalGold=goldReward({kind:"normal",level:lv});return Math.max(0,Math.floor(normalGold*Math.max(1,Number(tier?.goldMult)||1)));}
 function rollBountyQuality(){let r=Math.random()*100,c=0;for(let i=0;i<BOUNTY_QUALITY_WEIGHTS.length;i++){c+=BOUNTY_QUALITY_WEIGHTS[i];if(r<c)return i;}return 2;}
 function bountyItem(enemy,mapIdx){
  const level=clampGameLevel(enemy?.level??state.level),offset=[-2,-1,0,0,1],lv=Math.max(1,Math.min(MAX_LEVEL,level+offset[Math.floor(Math.random()*offset.length)]));
  let q=rollBountyQuality();
  const traitCount=Array.isArray(enemy?.traits)?Math.min(2,enemy.traits.length):0,traitChance=traitCount===2?.30:traitCount===1?.15:0;
  if(traitChance>0&&Math.random()<traitChance&&q<5)q++;
  if((state.vipLevel||0)>=14&&Math.random()<.05&&q<5)q++;
  let forcedType=null;
  if((state.vipLevel||0)>=8&&Math.random()<.15&&typeof weakEquipmentTypes==="function"){
   const order=weakEquipmentTypes();forcedType=order[0]||null;
  }
  return makeItem(lv,mapIdx,"normal",q,forcedType);
 }
 function bountyLootHtml(items){
  if(!Array.isArray(items)||!items.length)return "";
  return `<div class="dungeon-bounty-loot-list">${items.map(row=>`<div class="dungeon-bounty-loot-row"><span>${itemHtml(row.item,true)}</span><span class="${row.sold?"muted":"dungeon-bounty-reward"}">${row.sold?`自動出售 +${row.sold.toLocaleString()}`:"保留"}</span></div>`).join("")}</div>`;
 }
 function applyBountyExp(rawExp){
  const amount=Math.max(0,Math.floor(Number(rawExp)||0)),beforeLevel=state.level,beforeExp=state.exp||0;
  const payout=typeof window.specialExpPayout==="function"?window.specialExpPayout(amount,[]):null;
  if(!payout){if(state.level>=MAX_LEVEL)state.gold+=amount;else gainExp(amount);}
  return {raw:amount,beforeLevel,beforeExp,afterLevel:state.level,afterExp:state.exp||0,convertedGold:Math.max(0,Math.floor(Number(payout?.convertedGold)||0))};
 }
 function currentExpText(){return state.level>=MAX_LEVEL?"MAX":`${Math.floor(Number(state.exp)||0).toLocaleString()} / ${expNeed(state.level).toLocaleString()}`;}
 function stopReasonText(reason){return reason==="death"?"玩家死亡":reason==="attempts"?"挑戰次數不足":reason==="manual"?"玩家手動停止":"挑戰結束";}
 function updateSummary(result){
  const s=bountyState.summary,r=result||{},items=Array.isArray(r.rewardItems)?r.rewardItems:[];
  s.runs++;
  if(r.win)s.wins++;
  s.totalExp+=Math.max(0,Math.floor(Number(r.rewardExp)||0));
  s.totalGold+=Math.max(0,Math.floor(Number(r.rewardGold)||0));
  s.convertedGold+=Math.max(0,Math.floor(Number(r.expResult?.convertedGold)||0));
  s.soldGold+=Math.max(0,Math.floor(Number(r.soldGold)||0));
  s.gearCount+=items.length;
  s.keptCount+=items.filter(x=>!x.sold).length;
  s.soldCount+=items.filter(x=>!!x.sold).length;
 }
 function prepareNextBounty(){
  const tier=rollTier();
  bountyState.tier=tier;
  bountyState.enemy=buildBountyEnemy(tier);
  bountyState.result=null;
  bountyState.phase="transition";
 }
 function beginBountyRound(){
  if(!bountyState.enemy||!bountyState.tier||battleBusy)return false;
  const previewName=bountyState.enemy.name;
  const previewTraits=Array.isArray(bountyState.enemy.traits)?bountyState.enemy.traits.slice():[];
  const enemyScalingStats=equippedStats(),combatStats=playerCombatStats(enemyScalingStats);
  const started=beginDungeonRun({mode:"bounty",cost:1});
  if(!started.ok)return false;
  bountyState.enemy=buildBountyEnemy(bountyState.tier,enemyScalingStats,state.level,{name:previewName,traits:previewTraits});
  bountyState.phase="combat";
  bountyState.startHp=state.hp;
  bountyState.playerMaxHp=combatStats.hp;
  render();
  setTimeout(runBountyFight,80);
  return true;
 }

 window.getBountyTierConfig=function(id){const t=BOUNTY_TIERS.find(x=>x.id===id);return t?{...t}:null;};
 window.getBountyTierConfigs=function(){return BOUNTY_TIERS.map(x=>({...x}));};
 window.buildBountyEnemyForTest=function(tierId,playerStats=null,level=null){const t=BOUNTY_TIERS.find(x=>x.id===tierId);return t?buildBountyEnemy(t,playerStats,level):null;};
 window.bountyTraitNames=function(enemy){return traitNames(enemy);};

 window.enterBountyDungeon=function(){
  if(state.level<5)return;
  if(!canStartDungeonRun(1)){view="dungeon";render();return;}
  const tier=rollTier();
  bountyState={phase:"ready",tier,enemy:buildBountyEnemy(tier),result:null,startHp:0,playerMaxHp:0,continuous:false,stopRequested:false,summary:newContinuousSummary()};
  view="dungeon-bounty";
  render();
 };
 function bountyReadyHtml(){
  const b=bountyState;
  return `<section class="dungeon-bounty-shell dungeon-page-shell"><div class="dungeon-bounty-card card dungeon-bounty-ready-card"><div class="dungeon-bounty-title">【懸賞戰】</div><div class="${tierClass(b.tier.id)} dungeon-bounty-tier">${b.tier.name}</div><h2>${b.enemy.name}</h2><div class="dungeon-bounty-traits">特性：${traitNames(b.enemy)}</div><div class="dungeon-bounty-positioning"><strong>高 EXP・高金幣・多裝備</strong><span>每次懸賞隨機產生強敵與獎勵等級，實際獎勵於戰後結算。</span></div><div class="dungeon-mode-help"><div><b>單次挑戰</b><span>完成本場後結算</span></div><div><b>連續挑戰</b><span>每場開始前消耗 1 次；死亡、次數不足或手動停止時總結算</span></div></div><div class="controls dungeon-bounty-ready-actions"><button class="btn dungeon-bounty-start-btn" onclick="startBountyFight(false)">單次挑戰</button><button class="btn primary dungeon-bounty-start-btn" onclick="startBountyFight(true)">連續挑戰</button></div></div></section>`;
 }
 function bountyTransitionHtml(){
  const s=bountyState.summary;
  return `<section class="dungeon-bounty-shell dungeon-page-shell"><div class="dungeon-bounty-card card"><div class="dungeon-bounty-title">【懸賞戰・連續挑戰】</div><div class="dungeon-continuous-status">已完成 ${s.runs} 場・勝利 ${s.wins} 場</div><div class="muted">準備下一場…</div></div></section>`;
 }
 window.renderBountyDungeon=function(){
  const b=bountyState;
  if(!b.enemy||!b.tier)return `<div class="function-page dungeon-page-shell"><div class="card dungeon-summary-panel"><h2>懸賞戰</h2><div class="muted">本次懸賞已結束。</div><div class="controls"><button class="btn" onclick="go('dungeon')">返回副本</button></div></div></div>`;
  if(b.phase==="combat")return bountyCombatHtml();
  if(b.phase==="result")return bountyResultHtml();
  if(b.phase==="transition")return bountyTransitionHtml();
  return bountyReadyHtml();
 };
 function bountyCombatHtml(){
  const e=bountyState.enemy,s=playerCombatStats(),traits=typeof combatTraitBadgesHtml==="function"?combatTraitBadgesHtml(e?.traits):"";
  const summary=bountyState.summary;
  const continuousStatus=bountyState.continuous?`<div class="dungeon-continuous-status">連續挑戰中・已完成 ${summary.runs} 場・勝利 ${summary.wins} 場${bountyState.stopRequested?"・本場結束後停止":""}</div>`:"";
  const stop=bountyState.continuous?`<div class="controls"><button id="bountyContinuousStop" class="btn" onclick="requestBountyContinuousStop()">${bountyState.stopRequested?"本場結束後停止":"停止連續挑戰"}</button></div>`:"";
  return `<section class="combat-screen dungeon-bounty-combat"><div class="combat-head dungeon-bounty-title">【懸賞戰】 ${bountyState.tier.name}${bountyState.continuous?"・連續挑戰":""}</div>${continuousStatus}<div class="combat-arena"><div class="combatant player dungeon-bounty-player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${escapePlayerName(currentPlayerName())} Lv.${state.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${Math.max(0,Math.min(100,state.hp/s.hp*100))}%"></span></div></div></div><div class="combat-vs dungeon-bounty-vs">VS</div><div class="combatant enemy dungeon-bounty-enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><h2 id="combatEnemyName">${e.name}</h2>${traits}<div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${e.hp} / ${e.hp}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message dungeon-bounty-message" id="combatMessage">準備戰鬥</div>${stop}</section>`;
 }
 window.startBountyFight=function(continuous=false){
  if(bountyState.phase!=="ready"||!bountyState.enemy||!bountyState.tier||battleBusy)return;
  bountyState.continuous=continuous===true;
  bountyState.stopRequested=false;
  bountyState.summary=newContinuousSummary();
  if(!beginBountyRound()){view="dungeon";render();}
 };
 window.requestBountyContinuousStop=function(){
  if(!bountyState.continuous||bountyState.phase!=="combat")return;
  bountyState.stopRequested=true;
  const btn=document.getElementById("bountyContinuousStop");
  if(btn){btn.textContent="本場結束後停止";btn.disabled=true;}
 };
 function setHpUi(enemyHp,enemyMax,playerHp,playerMax,message){
  const eb=document.getElementById("combatEnemyBar"),eh=document.getElementById("combatEnemyHp"),pb=document.getElementById("combatPlayerBar"),ph=document.getElementById("combatPlayerHp"),msg=document.getElementById("combatMessage");
  if(eb)eb.style.width=`${Math.max(0,Math.min(100,enemyHp/enemyMax*100))}%`;
  if(eh)eh.textContent=`${Math.max(0,enemyHp)} / ${enemyMax}`;
  if(pb)pb.style.width=`${Math.max(0,Math.min(100,playerHp/playerMax*100))}%`;
  if(ph)ph.textContent=`${Math.max(0,playerHp)} / ${playerMax}`;
  if(msg)msg.textContent=message||"";
 }
 function pulse(target,text){
  const card=document.getElementById(target==="enemy"?"combatEnemyCard":"combatPlayerCard"),dmg=document.getElementById(target==="enemy"?"combatEnemyDamage":"combatPlayerDamage");
  if(card&&text!=="閃避"){card.classList.remove("hit");void card.offsetWidth;card.classList.add("hit");setTimeout(()=>card.classList.remove("hit"),260);}
  if(dmg){dmg.textContent=text;dmg.classList.remove("show");void dmg.offsetWidth;dmg.classList.add("show");}
 }
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 async function animateBounty(result,startHp,playerMax){
  let ehp=result.e.hp,php=startHp;
  const delay=result.logs.length>80?25:result.logs.length>40?45:90;
  setHpUi(ehp,result.e.hp,php,playerMax,"開始戰鬥");await sleep(150);
  for(const line of result.logs){
   let m=line.match(/^你攻擊.+，(?:暴擊)?造成 (\d+) 點傷害。$/);
   if(m){const d=Number(m[1]);ehp=Math.max(0,ehp-d);pulse("enemy",line.includes("暴擊")?`暴擊 ${d}`:`-${d}`);setHpUi(ehp,result.e.hp,php,playerMax,line);await sleep(delay);continue;}
   if(line.includes("閃避了你的攻擊")){pulse("enemy","閃避");setHpUi(ehp,result.e.hp,php,playerMax,line);await sleep(delay);continue;}
   m=line.match(/^.+攻擊你，(?:暴擊)?造成 (\d+) 點傷害。$/);
   if(m){const d=Number(m[1]);php=Math.max(0,php-d);pulse("player",line.includes("暴擊")?`暴擊 ${d}`:`-${d}`);setHpUi(ehp,result.e.hp,php,playerMax,line);await sleep(delay);continue;}
   if(line.includes("你閃避了攻擊")){pulse("player","閃避");setHpUi(ehp,result.e.hp,php,playerMax,line);await sleep(delay);continue;}
   setHpUi(ehp,result.e.hp,php,playerMax,line);await sleep(delay);
  }
 }
 async function runBountyFight(){
  battleBusy=true;
  const startHp=bountyState.startHp,playerMax=bountyState.playerMaxHp,result=dungeonFightCore(bountyState.enemy);
  await animateBounty(result,startHp,playerMax);
  let rewardExp=0,expResult=null,rewardGold=0,soldGold=0,rewardItems=[];
  if(result.win){
   const tier=bountyState.tier,rewardLevel=clampGameLevel(bountyState.enemy?.level??state.level),mapIdx=bountyMapIndex(rewardLevel);
   rewardExp=bountyExpReward(tier,rewardLevel);
   rewardGold=bountyGoldReward(tier,rewardLevel);
   expResult=applyBountyExp(rewardExp);
   state.gold+=rewardGold;
   for(let i=0;i<tier.gearCount;i++){
    const item=bountyItem(bountyState.enemy,mapIdx),handled=addItem(item),sold=Math.max(0,Number(handled?.sold)||0);
    soldGold+=sold;
    rewardItems.push({item,sold,kept:handled?.kept===true});
   }
  }
  const combatEndHp=result.combatEndHp;
  finishDungeonRun();
  const roundResult={win:result.win,rewardExp,expResult,rewardGold,soldGold,rewardItems,turns:result.turns,combatEndHp};
  bountyState.result=roundResult;
  updateSummary(roundResult);
  battleBusy=false;

  if(!bountyState.continuous){bountyState.phase="result";render();return;}
  const d=ensureDungeonProgressState();
  if(!result.win)bountyState.summary.stopReason="death";
  else if(bountyState.stopRequested)bountyState.summary.stopReason="manual";
  else if(d.attempts<=0)bountyState.summary.stopReason="attempts";
  if(bountyState.summary.stopReason){bountyState.phase="result";render();return;}

  prepareNextBounty();
  await sleep(300);
  if(!beginBountyRound()){
   bountyState.summary.stopReason="attempts";
   bountyState.phase="result";
   render();
  }
 }
 function continuousResultHtml(){
  const d=ensureDungeonProgressState(),s=bountyState.summary;
  return `<section class="dungeon-bounty-shell dungeon-page-shell"><div class="dungeon-bounty-card card dungeon-bounty-result-card dungeon-continuous-result"><div class="dungeon-bounty-title">懸賞連續挑戰結算</div><div class="dungeon-bounty-result-line">共挑戰：${s.runs} 次・勝利 ${s.wins} 次</div><div class="dungeon-bounty-reward-grid"><div><span>總 EXP</span><strong>+${s.totalExp.toLocaleString()}</strong></div><div><span>懸賞金幣</span><strong>+${s.totalGold.toLocaleString()}</strong></div><div><span>裝備</span><strong>${s.gearCount} 件</strong><small>保留 ${s.keptCount}・出售 ${s.soldCount}</small></div></div>${s.convertedGold?`<div class="dungeon-bounty-result-line">滿等 EXP 轉金幣：+${s.convertedGold.toLocaleString()}</div>`:""}${s.soldGold?`<div class="dungeon-bounty-result-line">自動出售所得：+${s.soldGold.toLocaleString()} 金幣</div>`:""}<div class="dungeon-bounty-result-line">停止原因：${stopReasonText(s.stopReason)}</div><div class="dungeon-bounty-result-line">目前狀態：Lv.${state.level}・${state.level>=MAX_LEVEL?"EXP MAX":`EXP ${currentExpText()}`}・金幣 ${Math.floor(Number(state.gold)||0).toLocaleString()}</div><div class="dungeon-bounty-result-line">剩餘可挑戰次數：${d.attempts} 次</div><div class="controls dungeon-bounty-result-actions"><button class="btn" onclick="go('dungeon')">返回副本</button></div></div></section>`;
 }
 function bountyResultHtml(){
  if(bountyState.continuous)return continuousResultHtml();
  const d=ensureDungeonProgressState(),r=bountyState.result||{},title=r.win?"懸賞完成":"懸賞失敗",items=Array.isArray(r.rewardItems)?r.rewardItems:[],kept=items.filter(x=>!x.sold).length,sold=items.filter(x=>!!x.sold).length,er=r.expResult||{},levelLine=er.afterLevel>er.beforeLevel?`Lv.${er.beforeLevel} → Lv.${er.afterLevel}`:`Lv.${state.level}`,expLine=state.level>=MAX_LEVEL?"EXP MAX":`EXP ${currentExpText()}`;
  return `<section class="dungeon-bounty-shell dungeon-page-shell"><div class="dungeon-bounty-card card dungeon-bounty-result-card"><div class="dungeon-bounty-title">${title}</div><div class="${tierClass(bountyState.tier.id)} dungeon-bounty-tier">${bountyState.tier.name}</div><h2>${bountyState.enemy.name}</h2>${r.win?`<div class="dungeon-bounty-reward-grid"><div><span>懸賞 EXP</span><strong>+${Number(r.rewardExp||0).toLocaleString()}</strong></div><div><span>懸賞金幣</span><strong>+${Number(r.rewardGold||0).toLocaleString()}</strong></div><div><span>裝備</span><strong>${items.length} 件</strong><small>保留 ${kept}・出售 ${sold}</small></div></div>${Number(er.convertedGold||0)>0?`<div class="dungeon-bounty-result-line">滿等 EXP 轉金幣：+${Number(er.convertedGold).toLocaleString()}</div>`:""}${r.soldGold?`<div class="dungeon-bounty-result-line">自動出售所得：+${Number(r.soldGold).toLocaleString()} 金幣</div>`:""}${bountyLootHtml(items)}`:`<div class="dungeon-bounty-result-line">本次沒有獲得獎勵。</div>`}<div class="dungeon-bounty-result-line">目前狀態：${levelLine}・${expLine}・金幣 ${Math.floor(Number(state.gold)||0).toLocaleString()}</div><div class="dungeon-bounty-result-line">剩餘可挑戰次數：${d.attempts} 次</div><div class="controls dungeon-bounty-result-actions"><button class="btn dungeon-bounty-start-btn" ${d.attempts>0?"":"disabled"} onclick="${d.attempts>0?"enterBountyDungeon()":"void(0)"}">${d.attempts>0?"再次進入懸賞戰":"挑戰次數不足"}</button><button class="btn" onclick="go('dungeon')">返回副本</button></div></div></section>`;
 }
 window.getBountyTestSnapshot=function(){
  return bountyState.enemy?{phase:bountyState.phase,tier:{...bountyState.tier},enemy:{...bountyState.enemy},continuous:bountyState.continuous,stopRequested:bountyState.stopRequested,summary:{...bountyState.summary}}:null;
 };
})();