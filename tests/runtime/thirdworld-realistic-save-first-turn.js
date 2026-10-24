'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof window.runThirdWorldBossCombat==='function'&&typeof window.createBlankThirdWorldState==='function'&&typeof window.playerCombatStats==='function',null,{timeout:60000});
  const report=await page.evaluate(()=>{
   const original=state,outputs=[];
   try{
    const max=Number(window.THIRD_WORLD_BOSS_MAX_HP);
    const pieces={
     armor:{q:5,world:3,level:2000,hp:4328,def:4085,atk:0,crit:0,dodge:5,mainStat:{stat:'def',value:3123}},
     helmet:{q:5,world:3,level:2000,hp:16348,def:962,atk:0,crit:0,dodge:5,mainStat:{stat:'hp',value:12020}},
     shoes:{q:5,world:3,level:2000,hp:16348,def:962,atk:0,crit:0,dodge:5,mainStat:{stat:'hp',value:12020}},
     weapon:{q:5,world:3,level:2000,hp:4328,def:0,atk:9611,crit:5,dodge:0,mainStat:{stat:'atk',value:7448}},
     accessory:{q:5,world:3,level:2000,hp:0,def:0,atk:2163,crit:15,dodge:5,mainStat:{stat:'crit',value:10}}
    };
    for(const reincarnation of [0,8]){
     const s=newState();
     s.level=2000;s.exp=0;s.vipLevel=45;s.vipPoints=2046799;
     s.equipment=JSON.parse(JSON.stringify(pieces));
     s.enhancement.levels={weapon:40,armor:40,helmet:40,shoes:40,accessory:40};
     s.specializations={combo:60,drain:60,counter:60,scavenge:60,training:60,appraisal:60,initiative:60,penetration:60};
     s.marks={version:1,entries:Object.fromEntries(['ward','suppression','composure','indomitable','resilience','battleSpirit','absorption','revenge','backlash','ignore'].map(id=>[id,{level:10,acquired:true,progress:0}]))};
     s.secondWorld.entered=true;s.secondWorld.civilizationLevel=10;
     s.thirdWorld=createBlankThirdWorldState();s.thirdWorld.entered=true;s.thirdWorld.coreLevel=10;
     s.thirdWorld.bosses[0].currentHp=0;
     s.reincarnation=typeof window.createBlankReincarnationState==='function'?window.createBlankReincarnationState():{count:0,breakthrough:{permanent:0,milestoneLifeId:0,milestones:{}}};
     s.reincarnation.count=reincarnation;s.reincarnation.breakthrough.permanent=80;s.reincarnation.breakthrough.milestoneLifeId=reincarnation;
     state=s;s.hp=playerCombatStats().hp;
     const player=playerCombatStats();
     for(let i=1;i<10;i++){
      const result=runThirdWorldBossCombat(i,{maxTurns:1,logs:false,rng:()=>.5});
      const attacks=(result?.events||[]).filter(x=>x.type==='attack'&&x.actor==='player');
      outputs.push({reincarnation,index:i,ok:result.ok,reason:result.reason||'',start:result.enemyStartHp,end:result.combatEndHp,turns:result.turns,win:result.win,attackCount:attacks.length,firstDamage:attacks[0]?.actualDamage||0,maxDamage:Math.max(0,...attacks.map(x=>Number(x.actualDamage)||0)),totalDamage:max-Number(result.combatEndHp||0),actionCount:result.combat?.actionCount,playerAtk:player.atk,playerHp:player.hp,playerAbility:result.combat?.playerAbilityProfile,playerFinalMultiplier:result.civilizationDamageMultiplier});
     }
    }
    return {max,outputs};
   }finally{state=original;}
  });
  if(errors.length)throw Error('pageerrors '+JSON.stringify(errors));
  console.log('REALISTIC_SAVE_DIAGNOSTIC '+JSON.stringify(report));
  const problems=report.outputs.filter(x=>x.ok!==true||x.start!==report.max||x.turns!==1||x.win===true);
  if(problems.length)throw Error('Abnormal first-round results '+JSON.stringify(problems));
  console.log('PASS realistic level-2000 reincarnation first-turn baseline: no full-health one-turn kill');
  await page.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
