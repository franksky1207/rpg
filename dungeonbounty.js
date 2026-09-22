(function(){
 const BOUNTY_TIER_META=[
  {id:"normal",name:"普通懸賞",difficulty:0,weight:45,expMult:5,goldMult:5,gearCount:2},
  {id:"high",name:"高級懸賞",difficulty:1,weight:35,expMult:8,goldMult:8,gearCount:3},
  {id:"danger",name:"危險懸賞",difficulty:2,weight:20,expMult:12,goldMult:12,gearCount:5}
 ];
 const BOUNTY_DIFFICULTY_CURVE=Object.freeze({
  hp:Object.freeze({linear:.67,quadratic:-.19}),
  damage:Object.freeze({linear:.57,quadratic:-.13}),
  def:Object.freeze({base:.88,linear:.15,quadratic:-.04}),
  rateScale:Object.freeze({base:.50,linear:.225,quadratic:-.025}),
  critAdd:Object.freeze({linear:2.5,quadratic:-.5}),
  critCap:Object.freeze({base:10,linear:11,quadratic:-1}),
  dodgeAdd:Object.freeze({linear:1}),
  dodgeCap:Object.freeze({base:8,linear:13,quadratic:-3}),
  extraTraitChance:Object.freeze({startDifficulty:2,chancePerStep:.50})
 });
 const BOUNTY_QUALITY_WEIGHTS=[0,0,60,35,4.5,.5];
 const BOUNTY_NAMES={
  normal:["武裝逃逸者","非法改裝兵","黑市護衛","走私突擊手","失控安保機"],
  high:["裝甲追緝犯","戰區破壞手","非法火力平台","禁區滲透指揮","深空走私艦長"],
  danger:["都市級威脅體","殲滅協議載體","戰爭失控核心","軌道破壞平台","深空封鎖母艦"]
 };

 function universePhase(){return typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered()===true;}
 function dailyStatus(){return typeof dailyDungeonStatus==="function"?dailyDungeonStatus("bounty"):{used:0,remaining:0,limit:20};}
 function newContinuousSummary(){return {runs:0,wins:0,totalExp:0,totalGold:0,totalDarkMatter:0,convertedGold:0,soldGold:0,soldDarkMatter:0,soldDarkEnergy:0,gearCount:0,keptCount:0,soldCount:0,stopReason:null};}
 let bountyState={phase:"idle",tier:null,enemy:null,result:null,startHp:0,playerMaxHp:0,rewardWorld:1,rewardLevel:0,rewardBossIndex:null,continuous:false,stopRequested:false,summary:newContinuousSummary()};

 function curveValue(curve,d){return (Number(curve?.base)||0)+(Number(curve?.linear)||0)*d+(Number(curve?.quadratic)||0)*d*d;}
 function bountyDifficultyProfile(tierOrId){
  const tier=typeof tierOrId==="object"&&tierOrId?tierOrId:BOUNTY_TIER_META.find(x=>x.id===tierOrId)||BOUNTY_TIER_META[0];
  const d=Math.max(0,Math.min(2,Math.floor(Number(tier?.difficulty)||0)));
  return {
   difficulty:d,
   hpMul:1+curveValue(BOUNTY_DIFFICULTY_CURVE.hp,d),
   damageMul:1+curveValue(BOUNTY_DIFFICULTY_CURVE.damage,d),
   defMul:curveValue(BOUNTY_DIFFICULTY_CURVE.def,d),
   critScale:curveValue(BOUNTY_DIFFICULTY_CURVE.rateScale,d),
   critAdd:curveValue(BOUNTY_DIFFICULTY_CURVE.critAdd,d),
   critCap:curveValue(BOUNTY_DIFFICULTY_CURVE.critCap,d),
   dodgeScale:curveValue(BOUNTY_DIFFICULTY_CURVE.rateScale,d),
   dodgeAdd:curveValue(BOUNTY_DIFFICULTY_CURVE.dodgeAdd,d),
   dodgeCap:curveValue(BOUNTY_DIFFICULTY_CURVE.dodgeCap,d),
   extraTraitChance:Math.max(0,Math.min(1,(d-BOUNTY_DIFFICULTY_CURVE.extraTraitChance.startDifficulty+1)*BOUNTY_DIFFICULTY_CURVE.extraTraitChance.chancePerStep))
  };
 }
 function rollTier(){let r=Math.random()*100;for(const t of BOUNTY_TIER_META){r-=t.weight;if(r<0)return t;}return BOUNTY_TIER_META[0];}
 function bountyTraitCount(tier){const p=bountyDifficultyProfile(tier);return 1+(Math.random()<p.extraTraitChance?1:0);}
 function rollBountyTraits(tier){return rollUniqueMonsterTraits(bountyTraitCount(tier));}
 function buildBountyEnemy(tier,playerStats=null,level=null,options={}){
  const p=createSpecialPlayerSnapshot(playerStats||equippedStats()),base=specialBaseEnemyFromPlayer(p),profile=bountyDifficultyProfile(tier),names=BOUNTY_NAMES[tier.id]||BOUNTY_NAMES.normal;
  const name=typeof options.name==="string"&&options.name?options.name:names[Math.floor(Math.random()*names.length)];
  const traits=Array.isArray(options.traits)?options.traits.slice():rollBountyTraits(tier);
  const world=options.world==null?(universePhase()?2:1):(Number(options.world)===2?2:1),rawLevel=Math.floor(Number(level??state.level)||1),enemyLevel=world===2?Math.max(500,Math.min(1000,rawLevel)):clampGameLevel(rawLevel);
  const civilizationScale=typeof window.civilizationCombatDamageMultiplier==="function"?window.civilizationCombatDamageMultiplier({world,state:options.state&&typeof options.state==="object"?options.state:state,civilizationLevel:options.civilizationLevel}):1;
  return applyMonsterTraits({name,level:enemyLevel,kind:"dungeon-bounty",bountyTier:tier.id,hp:Math.max(1,ceil(base.hp*profile.hpMul*civilizationScale)),atk:Math.max(1,ceil(base.damage*profile.damageMul+p.def*.55)),def:Math.max(0,ceil(base.def*profile.defMul)),crit:specialRateFromPlayer(p.crit,profile,"crit",MONSTER_MAX_CRIT_RATE),dodge:specialRateFromPlayer(p.dodge,profile,"dodge",MONSTER_MAX_DODGE_RATE),playerSnapshot:p,civilizationScale},traits);
 }
 function tierClass(id){return id==="danger"?"dungeon-bounty-tag-danger":id==="high"?"dungeon-bounty-tag-high":"dungeon-bounty-tag-normal";}
 function traitNames(enemy){return !enemy?.traits?.length?"無":enemy.traits.map(id=>MONSTER_TRAITS?.[id]?.name||id).join("、");}
 function bountyMapIndex(level){const lv=clampGameLevel(level),exact=MAPS.findIndex(m=>lv>=m.min&&lv<=m.max);if(exact>=0)return exact;for(let i=MAPS.length-1;i>=0;i--)if(lv>=MAPS[i].min)return i;return 0;}
 function bountyBaseExp(level=state.level){const lv=clampGameLevel(level);return expReward({kind:"normal",level:lv});}
 function bountyExpReward(tier,level=state.level){return Math.max(0,Math.floor(bountyBaseExp(level)*Math.max(1,Number(tier?.expMult)||1)));}
 function bountyGoldReward(tier,level=state.level){const lv=clampGameLevel(level),normalGold=goldReward({kind:"normal",level:lv});return Math.max(0,Math.floor(normalGold*Math.max(1,Number(tier?.goldMult)||1)));}
 function universeBountyContext(level=state.level){
  if(typeof window.secondWorldBossIndexForPlayerLevel!=="function"||typeof window.secondWorldBossForPlayerLevel!=="function")return null;
  const rewardLevel=Math.max(500,Math.min(1000,Math.floor(Number(level)||500)));
  const bossIndex=window.secondWorldBossIndexForPlayerLevel(rewardLevel),boss=window.secondWorldBossForPlayerLevel(rewardLevel);
  return Number.isInteger(bossIndex)&&boss?{rewardLevel,bossIndex,boss}:null;
 }
 function universeBountyExpReward(tier,level=state.level,useTestSpecializations=false,targetState=null){
  const ctx=universeBountyContext(level);if(!ctx||typeof window.secondWorldBossExpReward!=="function")return 0;
  const target={...(targetState&&typeof targetState==="object"?targetState:state),level:ctx.rewardLevel};
  const base=window.secondWorldBossExpReward(ctx.bossIndex,useTestSpecializations===true,target);
  return Math.max(0,Math.floor(base*Math.max(1,Number(tier?.expMult)||1)));
 }
 function universeBountyDarkMatterReward(tier,level=state.level,useTestSpecializations=false){
  const ctx=universeBountyContext(level);if(!ctx||typeof window.secondWorldBossDarkMatterReward!=="function")return 0;
  const base=window.secondWorldBossDarkMatterReward(ctx.bossIndex,useTestSpecializations===true);
  return Math.max(0,Math.floor(base*Math.max(1,Number(tier?.goldMult)||1)));
 }
 function rollBountyQuality(){let r=Math.random()*100,c=0;for(let i=0;i<BOUNTY_QUALITY_WEIGHTS.length;i++){c+=BOUNTY_QUALITY_WEIGHTS[i];if(r<c)return i;}return 2;}
 function bountyQualityForEnemy(enemy){
  let q=rollBountyQuality();
  const traitCount=Array.isArray(enemy?.traits)?Math.min(2,enemy.traits.length):0,traitChance=traitCount===2?.30:traitCount===1?.15:0;
  if(traitChance>0&&Math.random()<traitChance&&q<5)q++;
  if((state.vipLevel||0)>=14&&Math.random()<.05&&q<5)q++;
  return q;
 }
 function bountyForcedType(){
  if((state.vipLevel||0)>=8&&Math.random()<.15&&typeof weakEquipmentTypes==="function"){const order=weakEquipmentTypes();return order[0]||null;}
  return null;
 }
 function bountyItem(enemy,mapIdx){
  const level=clampGameLevel(enemy?.level??state.level),offset=[-2,-1,0,0,1],lv=Math.max(1,Math.min(MAX_LEVEL,level+offset[Math.floor(Math.random()*offset.length)]));
  return makeItem(lv,mapIdx,"normal",bountyQualityForEnemy(enemy),bountyForcedType());
 }
 function universeBountyItem(enemy,level,bossIndex){
  if(typeof window.makeSecondWorldEquipmentForBoss!=="function")return null;
  const q=bountyQualityForEnemy(enemy),forcedType=bountyForcedType();
  return window.makeSecondWorldEquipmentForBoss(bossIndex,{state,level,forcedQ:q,forcedType});
 }
 function bountySaleText(row){if(!row?.sold)return "保留";if(row.sale&&typeof window.equipmentSaleText==="function")return "自動出售 +"+window.equipmentSaleText(row.sale);return `自動出售 +${Math.max(0,Number(row.sold)||0).toLocaleString()} 金幣`;}
 function bountyLootHtml(items){if(!Array.isArray(items)||!items.length)return "";return `<div class="dungeon-bounty-loot-list">${items.map(row=>`<div class="dungeon-bounty-loot-row"><span>${itemHtml(row.item,true)}</span><span class="${row.sold?"muted":"dungeon-bounty-reward"}">${bountySaleText(row)}</span></div>`).join("")}</div>`;}
 function applyBountyExp(rawExp){const amount=Math.max(0,Math.floor(Number(rawExp)||0)),beforeLevel=state.level,beforeExp=state.exp||0;const payout=typeof window.specialExpPayout==="function"?window.specialExpPayout(amount,[]):null;if(!payout){if(state.level>=MAX_LEVEL)state.gold+=amount;else gainExp(amount);}return {raw:amount,beforeLevel,beforeExp,afterLevel:state.level,afterExp:state.exp||0,convertedGold:Math.max(0,Math.floor(Number(payout?.convertedGold)||0))};}
 function atBountyLevelCap(){const cap=typeof window.effectiveLevelCap==="function"?window.effectiveLevelCap(state):MAX_LEVEL;return Number(state.level)>=Number(cap);}
 function currentExpText(){return atBountyLevelCap()?"MAX":`${Math.floor(Number(state.exp)||0).toLocaleString()} / ${expNeed(state.level).toLocaleString()}`;}
 function stopReasonText(reason){return reason==="death"?"玩家死亡":reason==="daily-limit"?"今日懸賞次數已用完":reason==="manual"?"玩家手動停止":"挑戰結束";}
 function updateSummary(result){const s=bountyState.summary,r=result||{},items=Array.isArray(r.rewardItems)?r.rewardItems:[];s.runs++;if(r.win)s.wins++;s.totalExp+=Math.max(0,Math.floor(Number(r.rewardExp)||0));s.totalGold+=Math.max(0,Math.floor(Number(r.rewardGold)||0));s.totalDarkMatter+=Math.max(0,Math.floor(Number(r.rewardDarkMatter)||0));s.convertedGold+=Math.max(0,Math.floor(Number(r.expResult?.convertedGold)||0));s.soldGold+=Math.max(0,Math.floor(Number(r.soldGold)||0));s.soldDarkMatter+=Math.max(0,Math.floor(Number(r.soldDarkMatter)||0));s.soldDarkEnergy+=Math.max(0,Math.floor(Number(r.soldDarkEnergy)||0));s.gearCount+=items.length;s.keptCount+=items.filter(x=>!x.sold).length;s.soldCount+=items.filter(x=>!!x.sold).length;}
 function prepareNextBounty(){const tier=rollTier();bountyState.tier=tier;bountyState.enemy=buildBountyEnemy(tier);bountyState.result=null;bountyState.phase="transition";}
 const sleep=ms=>bountyState.continuous&&typeof window.backgroundProgressSleep==="function"?window.backgroundProgressSleep(ms,"bounty"):new Promise(r=>setTimeout(r,ms));
 function battleGapMs(){if(typeof window.combatOuterGapMs!=="function")throw new Error("Combat Outer Pacing 未載入。");return window.combatOuterGapMs("bounty");}
 function stopBountyBackground(){if(typeof window.backgroundProgressStop==="function")window.backgroundProgressStop("bounty");}
 function healAfterRound(){if(typeof restorePlayerHp==="function")restorePlayerHp({save:false});else state.hp=playerCombatStats().hp;save(false);}
 function beginBountyRound(){
  if(!bountyState.enemy||!bountyState.tier||battleBusy)return false;
  const rewardLevel=clampGameLevel(state.level),world=universePhase()?2:1,universeCtx=world===2?universeBountyContext(rewardLevel):null;
  if(world===2&&!universeCtx)return false;
  const use=typeof consumeDailyDungeonUse==="function"?consumeDailyDungeonUse("bounty",1):{ok:false,reason:"daily_core_missing"};
  if(!use.ok)return false;
  save(false);
  const previewName=bountyState.enemy.name,previewTraits=Array.isArray(bountyState.enemy.traits)?bountyState.enemy.traits.slice():[];
  const enemyScalingStats=equippedStats(),combatStats=playerCombatStats(enemyScalingStats);
  bountyState.rewardWorld=world;bountyState.rewardLevel=rewardLevel;bountyState.rewardBossIndex=universeCtx?.bossIndex??null;
  bountyState.enemy=buildBountyEnemy(bountyState.tier,enemyScalingStats,rewardLevel,{name:previewName,traits:previewTraits});
  bountyState.phase="combat";bountyState.startHp=state.hp;bountyState.playerMaxHp=combatStats.hp;render();Promise.resolve().then(runBountyFight);return true;
 }

 window.BOUNTY_BALANCE_VERSION=2;
 window.BOUNTY_TIER_META_VERSION=1;
 window.BOUNTY_DIFFICULTY_FORMULA_VERSION=2;
 window.BOUNTY_CIVILIZATION_SCALING_VERSION=1;
 window.BOUNTY_DIFFICULTY_CURVE=BOUNTY_DIFFICULTY_CURVE;
 window.getBountyTierMeta=function(id){const t=BOUNTY_TIER_META.find(x=>x.id===id);return t?{...t}:null;};
 window.getBountyTierMetadata=function(){return BOUNTY_TIER_META.map(x=>({...x}));};
 window.getBountyDifficultyProfile=function(id){const t=BOUNTY_TIER_META.find(x=>x.id===id);return t?{...bountyDifficultyProfile(t)}:null;};
 window.buildBountyEnemyForTest=function(tierId,playerStats=null,level=null,world=null,civilizationLevel=null){const t=BOUNTY_TIER_META.find(x=>x.id===tierId);const w=world==null?(universePhase()?2:1):(Number(world)===2?2:1);return t?buildBountyEnemy(t,playerStats,level,{world:w,civilizationLevel}):null;};
 window.bountyTraitNames=function(enemy){return traitNames(enemy);};
 window.enterBountyDungeon=function(){
  if(state.level<5)return;
  if(dailyStatus().remaining<=0){view="dungeon";render();return;}
  const tier=rollTier();
  bountyState={phase:"ready",tier,enemy:buildBountyEnemy(tier),result:null,startHp:0,playerMaxHp:0,rewardWorld:universePhase()?2:1,rewardLevel:0,rewardBossIndex:null,continuous:false,stopRequested:false,summary:newContinuousSummary()};
  view="dungeon-bounty";render();
 };
 function bountyReadyHtml(){
  const b=bountyState,ds=dailyStatus();
  return `<section class="dungeon-bounty-shell dungeon-page-shell"><div class="dungeon-bounty-card card dungeon-bounty-ready-card"><div class="dungeon-bounty-title">【懸賞戰】</div><div class="dungeon-bounty-result-line">今日懸賞：${ds.used} / ${ds.limit}　・　剩餘 ${ds.remaining} 次</div><div class="${tierClass(b.tier.id)} dungeon-bounty-tier">${b.tier.name}</div><h2>${b.enemy.name}</h2><div class="dungeon-bounty-traits">特性：${traitNames(b.enemy)}</div><div class="dungeon-bounty-positioning"><strong>${universePhase()?"高 EXP・高暗物質・多裝備":"高 EXP・高金幣・多裝備"}</strong><span>每次懸賞隨機產生強敵與獎勵等級，實際獎勵於戰後結算。</span></div><div class="dungeon-mode-help"><div><b>單次挑戰</b><span>正式開戰時使用 1 次今日額度，完成本場後結算</span></div><div><b>連續挑戰</b><span>每場正式開戰時使用 1 次；死亡、今日額度用完或手動停止時總結算</span></div></div><div class="controls dungeon-bounty-ready-actions"><button class="btn dungeon-bounty-start-btn" ${ds.remaining>0?"":"disabled"} onclick="startBountyFight(false)">單次挑戰</button><button class="btn primary dungeon-bounty-start-btn" ${ds.remaining>0?"":"disabled"} onclick="startBountyFight(true)">連續挑戰</button></div></div></section>`;
 }
 function bountyTransitionHtml(){const s=bountyState.summary,ds=dailyStatus();return `<section class="dungeon-bounty-shell dungeon-page-shell"><div class="dungeon-bounty-card card"><div class="dungeon-bounty-title">【懸賞戰・連續挑戰】</div><div class="dungeon-continuous-status">已完成 ${s.runs} 場・勝利 ${s.wins} 場・今日剩餘 ${ds.remaining} 次</div><div class="muted">準備下一場…</div></div></section>`;}
 window.renderBountyDungeon=function(){const b=bountyState;if(!b.enemy||!b.tier)return `<div class="function-page dungeon-page-shell"><div class="card dungeon-summary-panel"><h2>懸賞戰</h2><div class="muted">本次懸賞已結束。</div><div class="controls"><button class="btn" onclick="go('dungeon')">返回副本</button></div></div></div>`;if(b.phase==="combat")return bountyCombatHtml();if(b.phase==="result")return bountyResultHtml();if(b.phase==="transition")return bountyTransitionHtml();return bountyReadyHtml();};
 function bountyCombatHtml(){
  const e=bountyState.enemy,s=playerCombatStats(),traits=typeof combatTraitBadgesHtml==="function"?combatTraitBadgesHtml(e?.traits):"",summary=bountyState.summary,ds=dailyStatus();
  const continuousStatus=bountyState.continuous?`<div class="dungeon-continuous-status">連續挑戰中・已完成 ${summary.runs} 場・勝利 ${summary.wins} 場・今日剩餘 ${ds.remaining} 次${bountyState.stopRequested?"・本場結束後停止":""}</div>`:"";
  const stop=bountyState.continuous?`<div class="controls"><button id="bountyContinuousStop" class="btn" onclick="requestBountyContinuousStop()">${bountyState.stopRequested?"本場結束後停止":"停止連續挑戰"}</button></div>`:"";
  return `<section class="combat-screen dungeon-bounty-combat"><div class="combat-head dungeon-bounty-title">【懸賞戰】 ${bountyState.tier.name}${bountyState.continuous?"・連續挑戰":""}</div>${continuousStatus}<div class="combat-arena"><div class="combatant player dungeon-bounty-player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${typeof window.playerIdentityNameHtml==="function"?window.playerIdentityNameHtml({compact:true}):escapePlayerName(currentPlayerName())} Lv.${state.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${Math.max(0,Math.min(100,state.hp/s.hp*100))}%"></span></div></div></div><div class="combat-vs dungeon-bounty-vs">VS</div><div class="combatant enemy dungeon-bounty-enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><h2 id="combatEnemyName">${e.name}</h2>${traits}<div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${e.hp} / ${e.hp}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message dungeon-bounty-message" id="combatMessage">準備戰鬥</div>${stop}</section>`;
 }
 window.startBountyFight=function(continuous=false){if(bountyState.phase!=="ready"||!bountyState.enemy||!bountyState.tier||battleBusy)return;bountyState.continuous=continuous===true;bountyState.stopRequested=false;bountyState.summary=newContinuousSummary();if(bountyState.continuous&&typeof window.backgroundProgressStart==="function")window.backgroundProgressStart("bounty",{mode:"continuous"});if(!beginBountyRound()){stopBountyBackground();view="dungeon";render();}};
 window.requestBountyContinuousStop=function(){if(!bountyState.continuous||bountyState.phase!=="combat")return;bountyState.stopRequested=true;const btn=document.getElementById("bountyContinuousStop");if(btn){btn.textContent="本場結束後停止";btn.disabled=true;}};
 async function animateBounty(result,startHp,playerMax){
  if(typeof window.animateStructuredCombatPresentation!=="function")throw new Error("Structured Combat Presentation 未載入。");
  await window.animateStructuredCombatPresentation(result,{mode:"bounty",clearAfter:true,clearReason:"bounty-battle-end"});
 }

 window.BOUNTY_COMBAT_MARK_PRESENTATION_VERSION=1;
 window.BOUNTY_UNIVERSE_CORE_VERSION=1;
 window.BOUNTY_UNIVERSE_REWARD_OWNER_VERSION=1;
 window.BOUNTY_UNIVERSE_UI_VERSION=1;
 window.BOUNTY_CIVILIZATION_DAMAGE_VERSION=1;
 window.BOUNTY_TEST_CONTEXT_VERSION=1;
 window.getUniverseBountyRewardPreview=function(tierId,level=state.level,options={}){
  const tier=BOUNTY_TIER_META.find(x=>x.id===tierId);if(!tier)return null;
  const ctx=universeBountyContext(level);if(!ctx)return null;
  const useTest=options.useTestSpecializations===true,target=options.state&&typeof options.state==="object"?options.state:null;
  return {tier:{...tier},rewardLevel:ctx.rewardLevel,bossIndex:ctx.bossIndex,bossLevel:ctx.boss.level,bossName:ctx.boss.name,exp:universeBountyExpReward(tier,ctx.rewardLevel,useTest,target),darkMatter:universeBountyDarkMatterReward(tier,ctx.rewardLevel,useTest),gearCount:tier.gearCount,directDarkEnergy:0};
 };
 window.makeUniverseBountyItemForTest=function(tierId,level=state.level,options={}){
  const tier=BOUNTY_TIER_META.find(x=>x.id===tierId),ctx=universeBountyContext(level);if(!tier||!ctx||typeof window.makeSecondWorldEquipmentForBoss!=="function")return null;
  const q=Number.isInteger(options.forcedQ)?Math.max(2,Math.min(5,options.forcedQ)):2;
  const forcedType=options.forcedType||null;
  return window.makeSecondWorldEquipmentForBoss(ctx.bossIndex,{state,level:ctx.rewardLevel,forcedQ:q,forcedType});
 };
 async function runBountyFight(){
  battleBusy=true;
  const startHp=bountyState.startHp,playerMax=bountyState.playerMaxHp,result=dungeonFightCore(bountyState.enemy,{world:bountyState.rewardWorld});
  await animateBounty(result,startHp,playerMax);
  let rewardExp=0,expResult=null,rewardGold=0,rewardDarkMatter=0,soldGold=0,soldDarkMatter=0,soldDarkEnergy=0,rewardItems=[];
  if(result.win){
   const tier=bountyState.tier,rewardLevel=bountyState.rewardLevel||clampGameLevel(bountyState.enemy?.level??state.level),isUniverse=bountyState.rewardWorld===2;
   if(isUniverse){
    const bossIndex=Number.isInteger(bountyState.rewardBossIndex)?bountyState.rewardBossIndex:universeBountyContext(rewardLevel)?.bossIndex;
    rewardExp=universeBountyExpReward(tier,rewardLevel);rewardDarkMatter=universeBountyDarkMatterReward(tier,rewardLevel);expResult=applyBountyExp(rewardExp);
    if(!state.secondWorld||typeof state.secondWorld!=="object")state.secondWorld={entered:true,darkMatter:0,darkEnergy:0};
    state.secondWorld.darkMatter=Math.max(0,Math.floor(Number(state.secondWorld.darkMatter)||0))+rewardDarkMatter;
    for(let i=0;i<tier.gearCount;i++){
     const item=universeBountyItem(bountyState.enemy,rewardLevel,bossIndex),handled=item?addItem(item):{kept:false,sold:0,sale:null},quote=handled?.sale?.quote||{};
     const sold=Math.max(0,Number(handled?.sold)||0);soldDarkMatter+=Math.max(0,Math.floor(Number(quote.darkMatter)||0));soldDarkEnergy+=Math.max(0,Math.floor(Number(quote.darkEnergy)||0));
     rewardItems.push({item,sold,kept:handled?.kept===true,sale:handled?.sale||null});
    }
   }else{
    const mapIdx=bountyMapIndex(rewardLevel);rewardExp=bountyExpReward(tier,rewardLevel);rewardGold=bountyGoldReward(tier,rewardLevel);expResult=applyBountyExp(rewardExp);state.gold+=rewardGold;
    for(let i=0;i<tier.gearCount;i++){const item=bountyItem(bountyState.enemy,mapIdx),handled=addItem(item),sold=Math.max(0,Number(handled?.sold)||0);soldGold+=sold;rewardItems.push({item,sold,kept:handled?.kept===true,sale:handled?.sale||null});}
   }
  }
  const combatEndHp=result.combatEndHp;healAfterRound();
  const roundResult={win:result.win,rewardWorld:bountyState.rewardWorld,rewardLevel:bountyState.rewardLevel,rewardBossIndex:bountyState.rewardBossIndex,rewardExp,expResult,rewardGold,rewardDarkMatter,directDarkEnergy:0,soldGold,soldDarkMatter,soldDarkEnergy,rewardItems,turns:result.turns,combatEndHp};bountyState.result=roundResult;updateSummary(roundResult);battleBusy=false;
  if(!bountyState.continuous){bountyState.phase="result";render();return;}
  const ds=dailyStatus();
  if(!result.win)bountyState.summary.stopReason="death";else if(bountyState.stopRequested)bountyState.summary.stopReason="manual";else if(ds.remaining<=0)bountyState.summary.stopReason="daily-limit";
  if(bountyState.summary.stopReason){stopBountyBackground();bountyState.phase="result";render();return;}
  prepareNextBounty();await sleep(battleGapMs());
  if(!beginBountyRound()){stopBountyBackground();bountyState.summary.stopReason="daily-limit";bountyState.phase="result";render();}
 }
 function continuousResultHtml(){
  const ds=dailyStatus(),s=bountyState.summary,isUniverse=bountyState.rewardWorld===2||universePhase();
  const resourceLabel=isUniverse?"懸賞暗物質":"懸賞金幣",resourceTotal=isUniverse?s.totalDarkMatter:s.totalGold;
  const saleParts=[];
  if(isUniverse){if(s.soldDarkMatter)saleParts.push(`+${s.soldDarkMatter.toLocaleString()} 暗物質`);if(s.soldDarkEnergy)saleParts.push(`+${s.soldDarkEnergy.toLocaleString()} 暗能量`);}else if(s.soldGold)saleParts.push(`+${s.soldGold.toLocaleString()} 金幣`);
  const saleLine=saleParts.length?`<div class="dungeon-bounty-result-line">自動出售所得：${saleParts.join("＋")}</div>`:"";
  const currentResource=isUniverse?`暗物質 ${Math.floor(Number(state?.secondWorld?.darkMatter)||0).toLocaleString()}`:`金幣 ${Math.floor(Number(state.gold)||0).toLocaleString()}`;
  return `<section class="dungeon-bounty-shell dungeon-page-shell"><div class="dungeon-bounty-card card dungeon-bounty-result-card dungeon-continuous-result"><div class="dungeon-bounty-title">懸賞連續挑戰結算</div><div class="dungeon-bounty-result-line">共挑戰：${s.runs} 次・勝利 ${s.wins} 次</div><div class="dungeon-bounty-reward-grid"><div><span>總 EXP</span><strong>+${s.totalExp.toLocaleString()}</strong></div><div><span>${resourceLabel}</span><strong>+${resourceTotal.toLocaleString()}</strong></div><div><span>裝備</span><strong>${s.gearCount} 件</strong><small>保留 ${s.keptCount}・出售 ${s.soldCount}</small></div></div>${!isUniverse&&s.convertedGold?`<div class="dungeon-bounty-result-line">滿等 EXP 轉金幣：+${s.convertedGold.toLocaleString()}</div>`:""}${saleLine}<div class="dungeon-bounty-result-line">停止原因：${stopReasonText(s.stopReason)}</div><div class="dungeon-bounty-result-line">目前狀態：Lv.${state.level}・${atBountyLevelCap()?"EXP MAX":`EXP ${currentExpText()}`}・${currentResource}</div><div class="dungeon-bounty-result-line">今日懸賞：${ds.used} / ${ds.limit}　・　剩餘 ${ds.remaining} 次</div><div class="controls dungeon-bounty-result-actions"><button class="btn" onclick="go('dungeon')">返回副本</button></div></div></section>`;
}
 function bountyResultHtml(){
  if(bountyState.continuous)return continuousResultHtml();
  const ds=dailyStatus(),r=bountyState.result||{},isUniverse=r.rewardWorld===2||bountyState.rewardWorld===2,title=r.win?"懸賞完成":"懸賞失敗",items=Array.isArray(r.rewardItems)?r.rewardItems:[],kept=items.filter(x=>!x.sold).length,sold=items.filter(x=>!!x.sold).length,er=r.expResult||{},levelLine=er.afterLevel>er.beforeLevel?`Lv.${er.beforeLevel} → Lv.${er.afterLevel}`:`Lv.${state.level}`,expLine=atBountyLevelCap()?"EXP MAX":`EXP ${currentExpText()}`;
  const rewardLabel=isUniverse?"懸賞暗物質":"懸賞金幣",rewardAmount=isUniverse?Number(r.rewardDarkMatter||0):Number(r.rewardGold||0);
  const saleParts=[];
  if(isUniverse){if(r.soldDarkMatter)saleParts.push(`+${Number(r.soldDarkMatter).toLocaleString()} 暗物質`);if(r.soldDarkEnergy)saleParts.push(`+${Number(r.soldDarkEnergy).toLocaleString()} 暗能量`);}else if(r.soldGold)saleParts.push(`+${Number(r.soldGold).toLocaleString()} 金幣`);
  const saleLine=saleParts.length?`<div class="dungeon-bounty-result-line">自動出售所得：${saleParts.join("＋")}</div>`:"";
  const currentResource=isUniverse?`暗物質 ${Math.floor(Number(state?.secondWorld?.darkMatter)||0).toLocaleString()}`:`金幣 ${Math.floor(Number(state.gold)||0).toLocaleString()}`;
  return `<section class="dungeon-bounty-shell dungeon-page-shell"><div class="dungeon-bounty-card card dungeon-bounty-result-card"><div class="dungeon-bounty-title">${title}</div><div class="${tierClass(bountyState.tier.id)} dungeon-bounty-tier">${bountyState.tier.name}</div><h2>${bountyState.enemy.name}</h2>${r.win?`<div class="dungeon-bounty-reward-grid"><div><span>懸賞 EXP</span><strong>+${Number(r.rewardExp||0).toLocaleString()}</strong></div><div><span>${rewardLabel}</span><strong>+${rewardAmount.toLocaleString()}</strong></div><div><span>裝備</span><strong>${items.length} 件</strong><small>保留 ${kept}・出售 ${sold}</small></div></div>${!isUniverse&&Number(er.convertedGold||0)>0?`<div class="dungeon-bounty-result-line">滿等 EXP 轉金幣：+${Number(er.convertedGold).toLocaleString()}</div>`:""}${saleLine}${bountyLootHtml(items)}`:`<div class="dungeon-bounty-result-line">本次沒有獲得獎勵。</div>`}<div class="dungeon-bounty-result-line">目前狀態：${levelLine}・${expLine}・${currentResource}</div><div class="dungeon-bounty-result-line">今日懸賞：${ds.used} / ${ds.limit}　・　剩餘 ${ds.remaining} 次</div><div class="controls dungeon-bounty-result-actions"><button class="btn dungeon-bounty-start-btn" ${ds.remaining>0?"":"disabled"} onclick="${ds.remaining>0?"enterBountyDungeon()":"void(0)"}">${ds.remaining>0?"再次進入懸賞戰":"今日懸賞次數已用完"}</button><button class="btn" onclick="go('dungeon')">返回副本</button></div></div></section>`;
}
 window.getBountyTestSnapshot=function(){return bountyState.enemy?{phase:bountyState.phase,tier:{...bountyState.tier},enemy:{...bountyState.enemy},rewardWorld:bountyState.rewardWorld,rewardLevel:bountyState.rewardLevel,rewardBossIndex:bountyState.rewardBossIndex,continuous:bountyState.continuous,stopRequested:bountyState.stopRequested,summary:{...bountyState.summary},daily:dailyStatus()}:null;};
})();