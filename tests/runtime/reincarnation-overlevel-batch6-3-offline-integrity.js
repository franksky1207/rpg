const {chromium}=require('playwright');
const assert=require('assert');

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on('pageerror',error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const url=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.OFFLINE_REINCARNATION_OVERLEVEL_VERSION===1&&typeof window.grantFirstWorldOfflineRewards==='function'&&typeof window.grantSecondWorldOfflineRewards==='function'&&typeof window.offlineOverlevelRewardContext==='function',{timeout:30000});
  const report=await page.evaluate(async()=>{
   const milestones=()=>Object.fromEntries([100,200,300,400,500,600,700,800,900,1000].map(level=>[String(level),false]));
   const reincarnation=count=>({count,breakthrough:{permanent:0,milestoneLifeId:count,milestones:milestones()},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}});
   const makeW1=count=>{const s=newState();s.saveVersion=17;s.reincarnation=reincarnation(count);s.secondWorld=createBlankSecondWorldState();s.thirdWorld=createBlankThirdWorldState();s.level=100;s.exp=0;s.gold=0;return s;};
   const makeW2=count=>{const s=makeW1(count);s.level=500;s.secondWorld=createBlankSecondWorldState();s.secondWorld.entered=true;s.secondWorld.darkMatter=0;s.secondWorld.darkEnergy=0;SPECIALIZATION_KEYS.forEach(key=>s.specializations[key]=60);return s;};
   const originalState=state,originalRandom=Math.random,originalGainEffective=window.gainEffectiveExp;
   const out={};
   try{
    Math.random=()=>1;
    const enemy={name:'離線測試敵人',level:500,kind:'normal',hp:1,atk:1,def:0,exp:100,gold:100};
    const pendingW1={world:1,targetType:'mapEnemy',map:0,enemy:0,battles:20,playerLevel:100,enemyLevel:500,overlevelContextRecorded:true};

    state=makeW1(0);
    const firstBaseGold=goldReward(enemy),firstBaseXp=expReward(enemy),firstExpectedStones=expectedMainlineEnhancementStoneReward(enemy,state.level);
    out.w1First=await grantFirstWorldOfflineRewards(pendingW1,enemy);
    out.w1FirstExpected={directGold:Math.floor(firstBaseGold*20*0.10),battleBasic:Math.floor((Number(firstExpectedStones.basic)||0)*20*0.05),battleAdvanced:Math.floor((Number(firstExpectedStones.advanced)||0)*20*0.05)};

    state=makeW1(1);
    const rerunBaseGold=goldReward(enemy),rerunBaseXp=expReward(enemy),m1=reincarnationOverlevelRewardMultiplier(100,500,state),formalGold=applyReincarnationOverlevelIntegerReward(rerunBaseGold,100,500,state),formalXp=applyReincarnationOverlevelIntegerReward(rerunBaseXp,100,500,state);
    out.w1Rerun=await grantFirstWorldOfflineRewards(pendingW1,enemy);
    out.w1RerunExpected={multiplier:m1,directGold:Math.floor(formalGold*20*0.10),formalXp};

    const oldContextState=makeW1(1);state=oldContextState;
    out.oldContext=offlineOverlevelRewardContext({playerLevel:100,enemyLevel:500,overlevelContextRecorded:false},500);

    const boss=secondWorldBoss(99),pendingW2={world:2,targetType:'boss',bossIndex:99,bossId:boss.id,battles:20,playerLevel:500,enemyLevel:boss.level,overlevelContextRecorded:true};
    window.gainEffectiveExp=()=>{};try{gainEffectiveExp=window.gainEffectiveExp;}catch(_){}

    state=makeW2(0);
    const firstDarkMatter=secondWorldBossDarkMatterReward(99,false),firstXp=secondWorldBossExpReward(99,false,state);
    out.w2First=await grantSecondWorldOfflineRewards(pendingW2,boss);
    out.w2FirstExpected={directDarkMatter:Math.floor(firstDarkMatter*20*0.10),directDarkEnergy:Math.floor(20*1*0.05),formalXp:firstXp};

    state=makeW2(1);
    const m2=reincarnationOverlevelRewardMultiplier(500,boss.level,state),rerunDarkMatter=applyReincarnationOverlevelIntegerReward(secondWorldBossDarkMatterReward(99,false),500,boss.level,state),rerunDarkEnergy=applyReincarnationOverlevelIntegerReward(1,500,boss.level,state);
    out.w2Rerun=await grantSecondWorldOfflineRewards(pendingW2,boss);
    out.w2RerunExpected={multiplier:m2,directDarkMatter:Math.floor(rerunDarkMatter*20*0.10),directDarkEnergy:Math.floor(20*rerunDarkEnergy*0.05)};

    out.versions={offline:window.OFFLINE_REINCARNATION_OVERLEVEL_VERSION,secondSettlement:window.SECOND_WORLD_OFFLINE_SETTLEMENT_VERSION,pipeline:window.OFFLINE_ENHANCEMENT_PIPELINE_VERSION,online:window.REINCARNATION_OVERLEVEL_REWARD_VERSION};
   }finally{
    Math.random=originalRandom;window.gainEffectiveExp=originalGainEffective;try{gainEffectiveExp=originalGainEffective;}catch(_){}state=originalState;if(typeof render==='function')render();
   }
   return out;
  });

  assert.deepEqual(pageErrors,[],'Browser pageerror:\n'+pageErrors.join('\n\n'));
  assert.equal(report.w1First.overlevelRewardMultiplier,1,'首輪 W1 Offline multiplier 必須固定 1');
  assert.equal(report.w1First.directGold,report.w1FirstExpected.directGold,'首輪 W1 金幣必須維持既有 Offline 10% 計算');
  assert.equal(report.w1First.enhancement.battleBasic,report.w1FirstExpected.battleBasic,'首輪 W1 基礎強化石不得被越級倍率污染');
  assert.equal(report.w1First.enhancement.battleAdvanced,report.w1FirstExpected.battleAdvanced,'首輪 W1 進階強化石不得被越級倍率污染');
  assert.equal(report.w1Rerun.overlevelRewardMultiplier,13,'轉生 W1 Lv100→500 必須沿用 13× 共用 owner');
  assert.equal(report.w1Rerun.directGold,report.w1RerunExpected.directGold,'轉生 W1 Offline 金幣必須使用正式越級 owner 後再套 Offline rate');
  assert.equal(report.oldContext.multiplier,1,'沒有安全記錄敵我等級的舊 Offline pending 不得猜測套越級倍率');
  assert.equal(report.oldContext.recorded,false,'舊 Offline pending 必須標記為未記錄越級 context');

  assert.equal(report.w2First.overlevelRewardMultiplier,1,'首輪 W2 Offline multiplier 必須固定 1');
  assert.equal(report.w2First.directDarkMatter,report.w2FirstExpected.directDarkMatter,'首輪 W2 暗物質必須維持既有 Offline 10%');
  assert.equal(report.w2First.directDarkEnergy,report.w2FirstExpected.directDarkEnergy,'首輪 W2 暗能量必須維持既有 Offline 5%');
  assert.equal(report.w2Rerun.overlevelRewardMultiplier,16,'轉生 W2 Lv500→1000 必須沿用 16× 共用 owner');
  assert.equal(report.w2Rerun.directDarkMatter,report.w2RerunExpected.directDarkMatter,'轉生 W2 Offline 暗物質計算錯誤');
  assert.equal(report.w2Rerun.directDarkEnergy,report.w2RerunExpected.directDarkEnergy,'轉生 W2 Offline 暗能量計算錯誤');
  assert.deepEqual(report.versions,{offline:1,secondSettlement:2,pipeline:4,online:1});
  console.log('Reincarnation Batch6-3 offline overlevel integrity passed:',JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
