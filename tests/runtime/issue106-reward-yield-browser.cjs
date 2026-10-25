'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE});
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 try{
  await page.goto(process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html?production=1');
  await page.waitForFunction(()=>typeof grantFirstWorldOfflineRewards==='function'&&typeof fightOnce==='function');
  const report=await page.evaluate(async()=>{
   const check=(ok,msg)=>{if(!ok)throw Error(msg);},near=(a,b)=>Math.abs(a-b)<1e-7,clone=x=>JSON.parse(JSON.stringify(x));
   const original=state,rng=Math.random,selected={map:selectedMap,enemy:selectedEnemy};
   let battles=0,sales=0,offline=0,previews=0;
   const make=(b,s,w=1)=>{
    const target=newState();target.introSeen=true;target.level=w===1?100:600;target.exp=0;
    target.reincarnation.count=50;target.reincarnation.breakthrough.permanent=b;
    Object.keys(target.reincarnation.breakthrough.milestones).forEach(k=>target.reincarnation.breakthrough.milestones[k]=true);
    for(const k of ['training','scavenge','appraisal'])target.specializations[k]=s;
    target.secondWorld.entered=w>=2;target.thirdWorld.entered=w>=3;
    target.settings.keepUpgrade=false;target.settings.autoSell.fill(true);
    Object.values(target.equipment).filter(Boolean).forEach(it=>{it.hp=1e10;it.atk=1e10;it.def=1e10;});
    return target;
   };
   // Independent arithmetic oracle; never delegates expected values to the owner under test.
   const expected=(raw,b,s,over=1,resource=false,integer=true)=>{
    const value=raw*(1+s*.025+b*.01)*over;
    if(!integer)return value;
    const legacy=Math.ceil(Math.ceil(raw*(1+s*.025))*over);
    return resource?Math.max(legacy,Math.floor(value+1e-10)):Math.max(legacy,Math.ceil(value-1e-10));
   };
   try{
    Math.random=()=>.99;
    for(const b of [0,1,10,130,500])for(const spec of [0,60]){
     for(const over of [false,true])for(const ei of [0,3,4]){
      state=make(b,spec);state.hp=playerCombatStats().hp;
      const mi=over?20:19,e=createMonsterEncounter(mi,ei),level=state.level;
      const mult=over?1+.03*(e.level-level):1;
      const rawXp=Math.ceil(sameExp(e.level)*(ei===4?5:ei===3?2:1)*expLevelFactor(e.level,level));
      const rawGold=Math.ceil(goldBase(e.level)*(ei===4?6:ei===3?2.5:1));
      const basic=ei===4?0:ei===3?2:1,advanced=ei===4?1:0;
      const r=fightOnce(mi,ei,e);
      check(r.ok&&r.win,'W1 formal victory');
      check(r.xp===expected(rawXp,b,spec,mult)&&r.gold===expected(rawGold,b,spec,mult),'W1 raw/spec/overlevel arithmetic');
      check(r.enhancementStones.basic===expected(basic,b,0,mult,true)&&r.enhancementStones.advanced===expected(advanced,b,0,mult,true),'W1 material grant');
      const xp=r.xp,gold=r.gold,inventory=state.inventory.length;
      applyWorld1OnlineOverlevelReward(r,level,state);
      check(r.xp===xp&&r.gold===gold&&state.inventory.length===inventory,'retired top-up alias');
      check(state.bossKilled[mi]===true||ei!==4,'boss progression');
      battles++;
     }
     for(const over of [false,true]){
      state=make(b,spec,2);const bi=over?25:19,boss=secondWorldBoss(bi),level=state.level,mult=over?1+.03*(boss.level-level):1;
      const rawXp=Math.ceil(sameExp(boss.level)*expLevelFactor(boss.level,level)),rawMatter=20+2*bi;
      const r=secondWorldMainlineRewardPreview(bi,{state});
      check(r.xp===expected(rawXp,b,spec,mult)&&r.darkMatter===expected(rawMatter,b,spec,mult)&&r.darkEnergy===expected(1,b,0,mult,true),'W2 preview oracle');
      const dm=state.secondWorld.darkMatter,de=state.secondWorld.darkEnergy;
      state.settings.autoSell.fill(false);
      const settlement=settleSecondWorldBossVictory(bi,{ignoreUnlock:true,rng:()=>.99});
      check(settlement.ok&&settlement.xp===r.xp&&state.secondWorld.darkMatter-dm===r.darkMatter&&state.secondWorld.darkEnergy-de===r.darkEnergy,'W2 atomic payout');
      battles++;previews++;
     }
     for(const world of [1,2])for(const q of [3,4,5]){
      const fresh=()=>{state=make(b,spec,world);return {id:'sale-'+world+'-'+q,world,level:world===1?100:600,q,type:'weapon',sell:101,buy:100,hp:1,atk:1,def:1,crit:0,dodge:0,traits:[]};};
      const item=fresh(),quote=equipmentSaleQuote(item),raw=world===1?101:(20+2*20)*SECOND_WORLD_QUALITY_MULTIPLIERS[q];
      check(quote.amount===expected(raw,b,spec),'sale price oracle');
      check(quote.darkEnergy===(world===2&&q===5?expected(1,b,0,1,true):0),'sale dark energy exactly once');
      const baseline=clone(state),currency=world===1?'gold':'darkMatter',amount=()=>world===1?state.gold:state.secondWorld.darkMatter;
      const initial=amount();state.inventory=[item];selectedItem=item.id;
      const manual=equipmentSellSelected();check(manual.ok&&amount()-initial===quote.amount&&state.inventory.length===0,'manual owner');
      const manualStones=clone(state.enhancement);
      state=clone(baseline);const auto=addItem(clone(item));check(!auto.kept&&auto.sale.quote.amount===quote.amount&&amount()-initial===quote.amount,'battle autosale owner');
      check(JSON.stringify(state.enhancement)===JSON.stringify(manualStones),'sale materials manual/auto parity');
      state=clone(baseline);state.inventory=[clone(item),{...clone(item),id:'second-sale'}];
      const batch=equipmentSellLowerAll();check(batch.ok&&batch.count===2&&amount()-initial===quote.amount*2&&state.inventory.length===0,'batch sale owner');
      sales+=3;
     }
     // Decimal accumulation is checked against raw formula * 10% * battle count.
     for(const world of [1,2]){
      state=make(b,spec,world);state.settings.autoSell.fill(false);
      const count=37,target=world===1?monsterObj(19,3):secondWorldBoss(19),level=state.level;
      const rawXp=Math.ceil(sameExp(target.level)*(world===1?2:1)*expLevelFactor(target.level,level));
      const rawCurrency=world===1?Math.ceil(goldBase(target.level)*2.5):58;
      const context={battles:count,map:19,enemy:3,bossIndex:19,playerLevel:level,enemyLevel:target.level,overlevelContextRecorded:true};
      const r=world===1?await grantFirstWorldOfflineRewards(context,target):await grantSecondWorldOfflineRewards(context,target);
      check(r.totalXp===Math.floor(expected(rawXp,b,spec,1,false,false)*.1*count+1e-9),'offline decimal EXP');
      check((world===1?r.directGold:r.directDarkMatter)===Math.floor(expected(rawCurrency,b,spec,1,false,false)*.1*count+1e-9),'offline decimal currency');
      if(world===1)check(r.enhancement.battleBasic===Math.floor(1.3*(1+b*.01)*.1*count+1e-9),'offline elite expectation');
      else check(r.directDarkEnergy===Math.floor((1+b*.01)*.1*count+1e-9),'offline dark energy expectation');
      offline++;
     }
    }
    // Offline drops retain their original sampling/processing owner. Sampled
    // equipment is sold at the same full quote; its proceeds are never discounted twice.
    const oldDrop=dropItem,oldW2Drop=makeSecondWorldEquipmentForBoss;
    try{
     for(const world of [1,2])for(const q of [4,5]){
      state=make(130,60,world);let serial=0;
      const item={id:'offline-sale',world,level:world===1?100:600,q,type:'weapon',sell:101,buy:100,hp:1,atk:1,def:1,crit:0,dodge:0,traits:[]};
      const quote=equipmentSaleQuote(item),stoneQuote=world===1?enhancementStoneSaleReward(item):{basic:0,advanced:0};
      const makeDrop=()=>({...clone(item),id:'offline-sale-'+(++serial)});
      window.dropItem=makeDrop;window.makeSecondWorldEquipmentForBoss=makeDrop;Math.random=()=>0;
      const result=world===1?await grantFirstWorldOfflineRewards({battles:3,map:19,enemy:0},monsterObj(19,0)):await grantSecondWorldOfflineRewards({battles:3,bossIndex:19},secondWorldBoss(19));
      check(result.gear.eligibleRolls===3&&result.gear.soldCount===3&&state.inventory.length===0,'offline gear processing owner');
      if(world===1){check(result.gear.soldGold===quote.gold*3,'offline full sale currency');check(result.enhancement.saleBasic===stoneQuote.basic*3&&result.enhancement.saleAdvanced===stoneQuote.advanced*3,'offline full sale stones');}
      else check(result.saleDarkMatter===quote.darkMatter*3&&result.saleDarkEnergy===quote.darkEnergy*3,'offline full sale dark matter/energy');
     }
    }finally{window.dropItem=oldDrop;window.makeSecondWorldEquipmentForBoss=oldW2Drop;Math.random=()=>.99;}
    // EXP can cross a breakthrough milestone; the current battle's stones use
    // the pre-grant snapshot rather than the just-increased permanent level.
    state=make(99,0);state.level=99;state.exp=effectiveExpNeed(99,state)-1;
    state.reincarnation.breakthrough.milestoneLifeId=state.reincarnation.count;
    state.reincarnation.breakthrough.milestones['100']=false;state.hp=playerCombatStats().hp;
    const milestone=fightOnce(19,0,createMonsterEncounter(19,0));
    check(state.reincarnation.breakthrough.permanent===100&&milestone.enhancementStones.basic===1,'pre-grant breakthrough snapshot');
    // GM previews read only test specialization; formal state and target remain intact.
    state=make(130,60,2);const formal=JSON.stringify(state);
    for(const k of ['training','scavenge','appraisal'])gmTestSpecializations[k]=0;
    const test=secondWorldMainlineRewardPreview(19,{state,useTestSpecializations:true});
    const live=secondWorldMainlineRewardPreview(19,{state});
    check(test.darkMatter===Math.ceil(58*2.3)&&live.darkMatter===Math.ceil(58*3.8),'GM specialization isolation');
    check(JSON.stringify(state)===formal,'GM preview did not mutate formal state');
    // B0 nested rounding is intentionally different from a single ceil of raw*spec*overlevel.
    state=make(0,60);check(calculateReincarnationYield(1,{target:state,specialization:'training',overlevelMultiplier:1.15})===4,'B0 legacy integer rounding');
    // Stone eligibility is based on pre-reward level and remains a hard gate.
    state=make(500,60);const denied=await grantFirstWorldOfflineRewards({battles:100,map:0,enemy:0},monsterObj(0,0));
    check(denied.enhancement.battleBasic===0,'ineligible low-level stones');
    // Higher-dimensional rules do not read the new yield owner at all.
    const oldCalc=calculateReincarnationYield;
    try{
     window.calculateReincarnationYield=()=>{throw Error('W3 called W1/W2 economy');};
     state=make(500,60,3);const protectedBefore=JSON.stringify({...state,inventory:null,offline:null});
     const r=await grantThirdWorldOfflineRewards({battles:37});
     check(r.totalXp===0&&r.totalDimensionalStrings===0,'W3 offline remains gear only');
     check(JSON.stringify({...state,inventory:null,offline:null})===protectedBefore,'W3 protected roots unchanged');
     check(equipmentSaleQuote({world:3,q:5,sell:100}).amount===0,'W3 processing no currency');
    }finally{window.calculateReincarnationYield=oldCalc;}
    return {battles,sales,offline,previews,schema:SAVE_SCHEMA_VERSION};
   }finally{Math.random=rng;state=original;selectedMap=selected.map;selectedEnemy=selected.enemy;}
  });
  const integrity=await page.evaluate(async()=>{
   await ensureCivilizationScriptGroup('gm');
   await ensureCivilizationScriptGroup('integrity');
   return {minimal:runMainMinimalModeIntegrity(),enhancement:window.ENHANCEMENT_FINAL_INTEGRITY,offline:THIRD_WORLD_OFFLINE_SETTLEMENT_INTEGRITY,adapter:window.THIRD_WORLD_OFFLINE_SAMPLE_INTEGRITY};
  });
  assert.equal(integrity.minimal.ok,true,JSON.stringify(integrity.minimal));
  assert.equal(integrity.offline.passed,true,JSON.stringify(integrity.offline));
  assert.equal(integrity.enhancement.passed,true,JSON.stringify(integrity.enhancement));
  assert.equal(integrity.adapter.passed,true,JSON.stringify(integrity.adapter));
  assert.deepEqual(errors,[]);
  assert.deepEqual(report,{battles:80,sales:180,offline:20,previews:20,schema:18});
  // Load-time pending settlement: failed persistence -> rollback -> reload retry -> no duplicate.
  for(const sampleVersion of [3,4])for(const world of [1,2]){
   const p=await browser.newPage();
   await p.goto(process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html?production=1');
   await p.waitForFunction(()=>typeof grantFirstWorldOfflineRewards==='function');
   const before=await p.evaluate(({sampleVersion,world})=>{
    const s=newState();s.introSeen=true;s.reincarnation.count=20;s.reincarnation.breakthrough.permanent=130;
    s.settings.autoSell.fill(false);s.level=100;s.unlockedMap=99;s.mapProgress.forEach(row=>row.fill(10));const now=Date.now(),enemy=monsterObj(19,0);
    s.offline={battleSampleVersion:sampleVersion,battleSamples:[],lastSettledAt:now-60000,maxObservedWallClock:now,timeLockUntil:0,pendingSettlement:{sampleVersion,world:1,targetType:'mapEnemy',map:19,enemy:0,combatSpeed:1,avgBattleMs:1000,elapsedRaw:60000,elapsedUsed:60000,battles:60,createdAt:now,playerLevel:100,enemyLevel:enemy.level,overlevelContextRecorded:true}};
    if(world===2){s.level=600;s.secondWorld.entered=true;const boss=secondWorldBoss(19);Object.assign(s.offline.pendingSettlement,{world:2,targetType:'boss',bossIndex:19,bossId:boss.id,playerLevel:600,enemyLevel:boss.level});}
    state=s;localStorage.setItem(SAVE_KEY,JSON.stringify(s));return {gold:s.gold,exp:s.exp,darkMatter:s.secondWorld.darkMatter,darkEnergy:s.secondWorld.darkEnergy};
   },{sampleVersion,world});
   // Install only on the next navigation so the seed remains durable.
   await p.addInitScript(()=>{
    const set=Storage.prototype.setItem;
    Storage.prototype.setItem=function(k,v){if(k==='frank_text_rpg_save'&&window.__failOfflineSave!==false)throw new DOMException('issue106 quota fault','QuotaExceededError');return set.call(this,k,v);};
    window.alert=()=>{};Math.random=()=>.99;
   });
   await p.reload();
   await p.waitForFunction(()=>typeof grantFirstWorldOfflineRewards==='function');
   await p.waitForTimeout(200);
   const rolled=await p.evaluate(()=>({gold:state.gold,exp:state.exp,darkMatter:state.secondWorld.darkMatter,darkEnergy:state.secondWorld.darkEnergy,pending:!!state.offline.pendingSettlement}));
   assert.deepEqual(rolled,{...before,pending:true},'failed offline final save must retain pending and roll back');
   // Remove the fault at init and reload with the durable pending from the old version.
   await p.addInitScript(()=>window.__failOfflineSave=false);
   await p.reload();await p.waitForFunction(()=>typeof grantFirstWorldOfflineRewards==='function'&&state.offline.pendingSettlement===null);
   const once=await p.evaluate(()=>({gold:state.gold,exp:state.exp,darkMatter:state.secondWorld.darkMatter,darkEnergy:state.secondWorld.darkEnergy,inventory:state.inventory.length,stones:JSON.stringify(state.enhancement),schema:state.saveVersion}));
   assert.ok((once.gold>before.gold||once.darkMatter>before.darkMatter)&&once.exp>before.exp);assert.equal(once.schema,18);
   await p.reload();await p.waitForFunction(()=>typeof grantFirstWorldOfflineRewards==='function');
   const twice=await p.evaluate(()=>({gold:state.gold,exp:state.exp,darkMatter:state.secondWorld.darkMatter,darkEnergy:state.secondWorld.darkEnergy,inventory:state.inventory.length,stones:JSON.stringify(state.enhancement),schema:state.saveVersion}));
   assert.deepEqual(twice,once,'successful retry must consume pending exactly once');await p.close();
  }
  console.log('PASS Issue106 browser matrix:',JSON.stringify({...report,pendingVersions:[3,4],rollback:true,retry:true,dedup:true,gmIsolation:true,highDimensionalUnchanged:true}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
