'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage();await page.goto((process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html')+'?production=1');
 await page.waitForFunction(()=>typeof runThirdWorldBossCombat==='function'&&typeof buildSecondWorldCalamityEnemy==='function');
 const report=await page.evaluate(()=>{
  state=newState();gmSetMainlineHpLockPreference(false);Math.random=()=>.5;
  const counts={galaxy:0,universe:0,higher:0,calamities:0,special:0},failures=[];
  const check=(group,id,run)=>{
   for(const outcome of ['win','loss']){
    const player=outcome==='win'?{hp:1e15,atk:1e15,def:1e15,crit:0,dodge:0}:{hp:1,atk:1,def:0,crit:0,dodge:0};
    const combat=run(player);
    if(!combat||!Number.isFinite(combat.hp)||!Number.isFinite(combat.enemyHp)||combat.hp<0||combat.enemyHp<0||combat.hp>0&&combat.enemyHp>0||combat.win!==(outcome==='win'))failures.push({group,id,outcome});
   }counts[group]++;
  };
  const direct=(enemy,world)=>player=>runWorldCombatCore(player,enemy,player.hp,{world,state,logs:false,rng:()=>.5,maxTurns:100,maxActions:2000,preparePresentation:false}).combat;
  for(let map=0;map<MAPS.length;map++)for(let enemy=0;enemy<5;enemy++)check('galaxy',map+':'+enemy,direct(monsterObj(map,enemy),1));
  state.secondWorld.entered=true;
  for(let boss=0;boss<SECOND_WORLD_BOSS_COUNT;boss++)check('universe',boss,player=>runSecondWorldBossCombat(boss,{player,state,ignoreUnlock:true,logs:false,rng:()=>.5,preparePresentation:false}));
  state.thirdWorld.entered=true;state.reincarnation.count=1;
  for(let boss=0;boss<THIRD_WORLD_BOSS_COUNT;boss++)check('higher',boss,player=>runThirdWorldBossCombat(boss,{player,state,ignoreUnlock:true,startHp:player.hp,logs:false,rng:()=>.5,preparePresentation:false}).combat);
  for(const def of getCivilizationCalamityDefinitions())check('calamities','galaxy:'+def.id,direct(buildCivilizationCalamityEnemy(def.id),1));
  for(const def of getSecondWorldCalamityDefinitions())check('calamities','universe:'+def.id,direct(buildSecondWorldCalamityEnemy(def.id),2));
  for(const world of [1,2])for(const special of SPECIAL_MONSTERS){const enemy=buildSpecialMonsterFromPlayer({hp:10000,atk:1000,def:100,crit:0,dodge:0},specialMonsterForWorld(special,world),world===1?500:1000);check('special',world+':'+special.id,direct(enemy,world));}
  return {counts,combatCases:Object.values(counts).reduce((a,b)=>a+b,0)*2,failures};
 });assert.deepEqual(report.failures,[]);assert.deepEqual(report.counts,{galaxy:500,universe:100,higher:10,calamities:20,special:18});console.log(JSON.stringify(report));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
