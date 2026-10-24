'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{
  const page=await browser.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof window.runThirdWorldBossCombat==='function'&&typeof window.createBlankThirdWorldState==='function'&&typeof window.playerCombatStats==='function'&&typeof window.thirdWorldBoss==='function',null,{timeout:60000});
  const report=await page.evaluate(()=>{
   const previous=state,rows=[];
   try{
    const max=Number(window.THIRD_WORLD_BOSS_MAX_HP);
    for(const reincarnation of [0,1]){
     const sample=newState();
     sample.saveVersion=17;sample.level=1000;sample.secondWorld.entered=true;sample.secondWorld.civilizationLevel=10;
     sample.thirdWorld=createBlankThirdWorldState();sample.thirdWorld.entered=true;
     sample.reincarnation=typeof window.createBlankReincarnationState==='function'?window.createBlankReincarnationState():{count:0,breakthrough:{permanent:0,milestoneLifeId:0,milestones:{}}};
     sample.reincarnation.count=reincarnation;sample.reincarnation.breakthrough.milestoneLifeId=reincarnation;
     state=sample;
     // Compare one round before and after awarding one boss's worth of EXP.
     // This is intentionally a probe of real damage calculation, not a fake settlement.
     for(const level of [1000,1110]){
      sample.level=level;sample.thirdWorld.bosses.forEach(row=>row.currentHp=max);
      const player=window.playerCombatStats();
      for(let bossIndex=0;bossIndex<10;bossIndex++){
       const result=window.runThirdWorldBossCombat(bossIndex,{ignoreUnlock:true,player,startHp:player.hp,maxTurns:1,logs:false,rng:()=>.5});
       const attacks=(result.events||[]).filter(row=>row.type==='attack'&&row.actor==='player');
       rows.push({reincarnation,level,bossIndex,ok:result.ok,turns:result.turns,startHp:result.enemyStartHp,endHp:result.combatEndHp,playerAtk:player.atk,firstRoundDamage:max-result.combatEndHp,playerAttackCount:attacks.length,maxAttack:Math.max(0,...attacks.map(row=>Number(row.actualDamage)||0)),multiplier:result.civilizationDamageMultiplier});
      }
     }
    }
    return {max,rows};
   }finally{state=previous;}
  });
  assert.deepEqual(errors,[],'browser errors');
  assert.equal(report.rows.length,40);
  for(const row of report.rows){
   assert.equal(row.ok,true,JSON.stringify(row));
   assert.equal(row.turns,1,JSON.stringify(row));
   assert.equal(row.startHp,report.max,JSON.stringify(row));
   assert.ok(row.endHp>0,'First-round one-hit kill in baseline: '+JSON.stringify(row));
   assert.ok(row.firstRoundDamage>=0&&row.firstRoundDamage<report.max,JSON.stringify(row));
  }
  console.log(JSON.stringify(report,null,2));
  console.log('PASS first-turn probe, 10 bosses × original/reincarnation × Lv1000/1110. This does NOT reproduce the user save.');
  await page.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
