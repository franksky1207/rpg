(function(){
 const BOUNTY_TIERS=[
  {id:"normal",name:"普通懸賞",weight:45,points:80,hpMul:1.00,damageMul:1.00,defMul:.88,critScale:.5,critAdd:0,critCap:10,dodgeScale:.5,dodgeAdd:0,dodgeCap:8},
  {id:"high",name:"高級懸賞",weight:35,points:120,hpMul:1.03,damageMul:1.06,defMul:.90,critScale:.8,critAdd:3,critCap:20,dodgeScale:.8,dodgeAdd:2,dodgeCap:18},
  {id:"danger",name:"危險懸賞",weight:20,points:180,hpMul:1.08,damageMul:1.10,defMul:.92,critScale:1,critAdd:5,critCap:28,dodgeScale:1,dodgeAdd:3,dodgeCap:22}
 ];
 const BOUNTY_NAMES={
  normal:["武裝逃逸者","非法改裝兵","黑市護衛","走私突擊手","失控安保機"],
  high:["裝甲追緝犯","戰區破壞手","非法火力平台","禁區滲透指揮","深空走私艦長"],
  danger:["都市級威脅體","殲滅協議載體","戰爭失控核心","軌道破壞平台","深空封鎖母艦"]
 };
 let bountyState={phase:"idle",tier:null,enemy:null,result:null,startHp:0,playerMaxHp:0};

 function rateFromPlayer(value,scale,add,cap,maxCap){
  return round1(Math.max(0,Math.min(maxCap,cap,(Number(value)||0)*scale+add)));
 }
 function rollTier(){
  let r=Math.random()*100;
  for(const t of BOUNTY_TIERS){r-=t.weight;if(r<0)return t;}
  return BOUNTY_TIERS[0];
 }
 function bountyTraitCount(tierId){
  if(tierId==="danger")return Math.random()<.5?1:2;
  return 1;
 }
 function rollBountyTraits(tierId){
  const pool=(typeof MONSTER_TRAIT_IDS!=="undefined"?MONSTER_TRAIT_IDS:Object.keys(MONSTER_TRAITS||{})).slice();
  const count=bountyTraitCount(tierId),out=[];
  for(let i=0;i<count&&pool.length;i++)out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  return out;
 }
 function applyBountyTraits(enemy,traitIds){
  const e={...enemy,traits:traitIds.slice(),berserk:false};
  traitIds.forEach(id=>{
   if(id==="strong")e.hp=ceil(e.hp*1.20);
   if(id==="ferocious")e.atk=ceil(e.atk*1.15);
   if(id==="hard")e.def=ceil(e.def*1.20);
   if(id==="swift")e.dodge=round1((e.dodge||0)+8);
   if(id==="deadly")e.crit=round1((e.crit||0)+8);
   if(id==="berserk")e.berserk=true;
   if(id==="giant"){e.hp=ceil(e.hp*1.30);e.atk=ceil(e.atk*1.05);e.dodge=round1((e.dodge||0)-5);}
  });
  e.crit=round1(Math.max(0,Math.min(MONSTER_MAX_CRIT_RATE,e.crit||0)));
  e.dodge=round1(Math.max(0,Math.min(MONSTER_MAX_DODGE_RATE,e.dodge||0)));
  return e;
 }
 function buildBountyEnemy(tier,playerStats=null,level=null){
  const p=createSpecialPlayerSnapshot(playerStats||equippedStats());
  const base=specialBaseEnemyFromPlayer(p);
  const names=BOUNTY_NAMES[tier.id]||BOUNTY_NAMES.normal;
  let enemy={
   name:names[Math.floor(Math.random()*names.length)],
   level:Math.max(1,Math.min(50,Math.floor(Number(level)||state.level||1))),
   kind:"dungeon-bounty",
   bountyTier:tier.id,
   hp:Math.max(1,ceil(base.hp*tier.hpMul)),
   atk:Math.max(1,ceil(base.damage*tier.damageMul+p.def*.55)),
   def:Math.max(0,ceil(base.def*tier.defMul)),
   crit:rateFromPlayer(p.crit,tier.critScale,tier.critAdd,tier.critCap,MONSTER_MAX_CRIT_RATE),
   dodge:rateFromPlayer(p.dodge,tier.dodgeScale,tier.dodgeAdd,tier.dodgeCap,MONSTER_MAX_DODGE_RATE),
   playerSnapshot:p
  };
  enemy=applyBountyTraits(enemy,rollBountyTraits(tier.id));
  return enemy;
 }
 function tierClass(id){return id==="danger"?"dungeon-bounty-tag-danger":id==="high"?"dungeon-bounty-tag-high":"dungeon-bounty-tag-normal";}
 function traitNames(enemy){
  if(!enemy?.traits?.length)return "無";
  return enemy.traits.map(id=>MONSTER_TRAITS?.[id]?.name||id).join("、");
 }

 window.getBountyTierConfig=function(id){const t=BOUNTY_TIERS.find(x=>x.id===id);return t?{...t}:null;};
 window.getBountyTierConfigs=function(){return BOUNTY_TIERS.map(x=>({...x}));};
 window.buildBountyEnemyForTest=function(tierId,playerStats=null,level=null){const t=BOUNTY_TIERS.find(x=>x.id===tierId);return t?buildBountyEnemy(t,playerStats,level):null;};
 window.bountyTraitNames=function(enemy){return traitNames(enemy);};

 window.enterBountyDungeon=function(){
  if(state.level<5)return;
  const started=beginDungeonRun({mode:"bounty",cost:1});
  if(!started.ok){view="dungeon";render();return;}
  const tier=rollTier();
  bountyState={phase:"ready",tier,enemy:buildBountyEnemy(tier),result:null,startHp:state.hp,playerMaxHp:equippedStats().hp};
  view="dungeon-bounty";
  render();
 };

 window.renderBountyDungeon=function(){
  const b=bountyState;
  if(!b.enemy||!b.tier)return `<div class="function-page dungeon-page-shell"><div class="card dungeon-summary-panel"><h2>懸賞戰</h2><div class="muted">本次懸賞已結束。</div><div class="controls"><button class="btn" onclick="go('dungeon')">返回副本</button></div></div></div>`;
  if(b.phase==="combat")return bountyCombatHtml();
  if(b.phase==="result")return bountyResultHtml();
  return `<section class="dungeon-bounty-shell dungeon-page-shell">
    <div class="dungeon-bounty-card card dungeon-bounty-ready-card">
      <div class="dungeon-bounty-title">【懸賞戰】</div>
      <div class="${tierClass(b.tier.id)} dungeon-bounty-tier">${b.tier.name}</div>
      <h2>${b.enemy.name}</h2>
      <div class="dungeon-bounty-traits">特性：${traitNames(b.enemy)}</div>
      <div class="dungeon-bounty-reward">獎勵：${b.tier.points} 副本積分</div>
      <div class="controls dungeon-bounty-ready-actions"><button class="btn dungeon-bounty-start-btn" onclick="startBountyFight()">開始挑戰</button></div>
    </div>
  </section>`;
 };

 function bountyCombatHtml(){
  const e=bountyState.enemy,s=equippedStats();
  return `<section class="combat-screen dungeon-bounty-combat">
   <div class="combat-head dungeon-bounty-title">【懸賞戰】 ${bountyState.tier.name}</div>
   <div class="combat-arena">
    <div class="combatant player dungeon-bounty-player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>玩家 Lv.${state.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${Math.max(0,Math.min(100,state.hp/s.hp*100))}%"></span></div></div></div>
    <div class="combat-vs dungeon-bounty-vs">VS</div>
    <div class="combatant enemy dungeon-bounty-enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><div class="${tierClass(bountyState.tier.id)} dungeon-bounty-tier">${bountyState.tier.name}</div><h2 id="combatEnemyName">${e.name}</h2><div class="dungeon-bounty-traits">特性：${traitNames(e)}</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${e.hp} / ${e.hp}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div>
   </div>
   <div class="combat-message dungeon-bounty-message" id="combatMessage">準備戰鬥</div>
  </section>`;
 }

 window.startBountyFight=function(){
  if(bountyState.phase!=="ready"||!bountyState.enemy||battleBusy)return;
  bountyState.phase="combat";
  bountyState.startHp=state.hp;
  bountyState.playerMaxHp=equippedStats().hp;
  render();
  setTimeout(runBountyFight,80);
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
  if(card&&text!=="閃避"){card.classList.remove("hit");void card.offsetWidth;card.classList.add("hit");setTimeout(()=>card.classList.remove("hit"),260)}
  if(dmg){dmg.textContent=text;dmg.classList.remove("show");void dmg.offsetWidth;dmg.classList.add("show")}
 }
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 async function animateBounty(result,startHp,playerMax){
  let ehp=result.e.hp,php=startHp;
  const delay=result.logs.length>80?25:result.logs.length>40?45:90;
  setHpUi(ehp,result.e.hp,php,playerMax,"開始戰鬥");
  await sleep(150);
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
  const startHp=bountyState.startHp,playerMax=bountyState.playerMaxHp;
  const result=dungeonFightCore(bountyState.enemy);
  await animateBounty(result,startHp,playerMax);
  let gained=0;
  if(result.win){gained=bountyState.tier.points;addDungeonPoints(gained);}
  const combatEndHp=result.combatEndHp;
  finishDungeonRun();
  bountyState.result={win:result.win,turnLimit:result.turnLimit,gained,turns:result.turns,combatEndHp};
  bountyState.phase="result";
  battleBusy=false;
  render();
 }

 function bountyResultHtml(){
  const d=ensureDungeonProgressState(),r=bountyState.result||{};
  const title=r.win?"懸賞完成":r.turnLimit?"懸賞未完成":"懸賞失敗";
  return `<section class="dungeon-bounty-shell dungeon-page-shell">
   <div class="dungeon-bounty-card card dungeon-bounty-result-card">
    <div class="dungeon-bounty-title">${title}</div>
    <div class="${tierClass(bountyState.tier.id)} dungeon-bounty-tier">${bountyState.tier.name}</div>
    <h2>${bountyState.enemy.name}</h2>
    <div class="dungeon-bounty-result-line">本次獲得副本積分：<strong class="dungeon-bounty-reward">${r.gained||0}</strong></div>
    <div class="dungeon-bounty-result-line">目前副本積分：${d.points}</div>
    <div class="dungeon-bounty-result-line">剩餘可挑戰次數：${d.attempts} 次</div>
    <div class="controls dungeon-bounty-result-actions"><button class="btn dungeon-bounty-start-btn" ${d.attempts>0?"":"disabled"} onclick="${d.attempts>0?"enterBountyDungeon()":"void(0)"}">${d.attempts>0?"再次進入懸賞戰":"挑戰次數不足"}</button><button class="btn" onclick="go('dungeon')">返回副本</button></div>
   </div>
  </section>`;
 }

 window.getBountyTestSnapshot=function(){return bountyState.enemy?{tier:{...bountyState.tier},enemy:{...bountyState.enemy}}:null;};
})();