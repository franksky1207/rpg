(function(){
 const VERSION=1;

 function clone(value){try{return JSON.parse(JSON.stringify(value));}catch(e){return null;}}
 function run(){
  const errors=[];
  const fail=(code,message,detail=null)=>errors.push({code,message,detail});
  try{
   if(Number(window.CIVILIZATION_CORE_VERSION)!==1||Number(window.CIVILIZATION_LEVEL_MAX)!==10||Number(window.CIVILIZATION_FINAL_DAMAGE_PERCENT_PER_LEVEL)!==5)fail("CORE_OWNER","文明等級 Core owner 異常");
   const expected={0:1,1:1.05,5:1.25,10:1.5};
   Object.entries(expected).forEach(([level,multi])=>{
    const actual=typeof window.civilizationDamageMultiplierForLevel==="function"?window.civilizationDamageMultiplierForLevel(Number(level)):NaN;
    const bonus=typeof window.civilizationDamageBonusPercentForLevel==="function"?window.civilizationDamageBonusPercentForLevel(Number(level)):NaN;
    if(Math.abs(actual-multi)>1e-9)fail("MULTIPLIER","文明等級倍率異常",{level:Number(level),expected:multi,actual});
    if(bonus!==Number(level)*5)fail("BONUS","文明等級百分比異常",{level:Number(level),expected:Number(level)*5,actual:bonus});
   });
   if(window.clampCivilizationLevel?.(-1)!==0||window.clampCivilizationLevel?.(11)!==10||window.clampCivilizationLevel?.(5)!==5)fail("CLAMP","文明等級 0～10 clamp 異常");
   const galaxy={secondWorld:{entered:false,civilizationLevel:10}};
   const universe={secondWorld:{entered:true,civilizationLevel:10}};
   if(window.civilizationLevel?.(galaxy)!==0||window.civilizationDamageMultiplier?.(galaxy)!==1)fail("GALAXY_ISOLATION","銀河紀元不得套文明等級");
   if(window.civilizationLevel?.(universe)!==10||window.civilizationDamageMultiplier?.(universe)!==1.5)fail("UNIVERSE_LEVEL10","宇宙文明 Lv10 應為 1.50×");

   if(typeof window.normalizeSecondWorldState==="function"){
    const legacy={secondWorld:{entered:true,darkMatter:0,darkEnergy:0,mainline:{bossKilled:[]},calamities:[]}};
    const high={secondWorld:{entered:true,civilizationLevel:99,darkMatter:0,darkEnergy:0,mainline:{bossKilled:[]},calamities:[]}};
    const preserve={secondWorld:{entered:true,civilizationLevel:0,darkMatter:1,darkEnergy:2,futureDungeon:{rank:7},mainline:{bossKilled:[],futureFlag:"keep"},calamities:[{currentHp:123,trueKills:0,futureTag:"keep"}]}};
    const reconcile={secondWorld:{entered:true,civilizationLevel:0,darkMatter:0,darkEnergy:0,mainline:{bossKilled:[]},calamities:Array.from({length:10},(_,i)=>({currentHp:null,trueKills:i<2?30:0}))}};
    const gap={secondWorld:{entered:true,civilizationLevel:0,darkMatter:0,darkEnergy:0,mainline:{bossKilled:[]},calamities:Array.from({length:10},(_,i)=>({currentHp:null,trueKills:i===0||i===2?30:0}))}};
    window.normalizeSecondWorldState(legacy);window.normalizeSecondWorldState(high);window.normalizeSecondWorldState(preserve);window.normalizeSecondWorldState(reconcile);window.normalizeSecondWorldState(gap);
    if(legacy.secondWorld.civilizationLevel!==0)fail("LEGACY_DEFAULT","舊 secondWorld 缺文明等級應補 0",legacy.secondWorld);
    if(high.secondWorld.civilizationLevel!==10)fail("NORMALIZE_CAP","文明等級 >10 應 clamp 10",high.secondWorld);
    if(preserve.secondWorld.futureDungeon?.rank!==7||preserve.secondWorld.mainline?.futureFlag!=="keep"||preserve.secondWorld.calamities?.[0]?.futureTag!=="keep")fail("PRESERVE_UNKNOWN","secondWorld normalization 不得刪除未知未來欄位",preserve.secondWorld);
    if(reconcile.secondWorld.civilizationLevel!==2)fail("RECONCILE_CONTIGUOUS","連續完成前兩隻災厄時文明等級最低應補至 Lv2",reconcile.secondWorld);
    if(gap.secondWorld.civilizationLevel!==1)fail("RECONCILE_GAP","災厄完成有斷層時只能推導連續完成的最低文明等級",gap.secondWorld);
    if(typeof window.secondWorldCivilizationFloorFromCalamities!=="function"||window.secondWorldCivilizationFloorFromCalamities(reconcile.secondWorld.calamities)!==2)fail("RECONCILE_API","文明等級災厄推導 API 異常");
   }else fail("STATE_API","normalizeSecondWorldState 未載入");

   if(Number(window.SECOND_WORLD_STATE_PRESERVE_UNKNOWN_VERSION)!==1||Number(window.SECOND_WORLD_ENTRY_PURE_READ_VERSION)!==1||Number(window.SECOND_WORLD_CIVILIZATION_RECONCILIATION_VERSION)!==1)fail("WORLD_STATE_SAFETY_VERSION","第二世界 state preservation／純讀取／文明 reconciliation 版本未完整載入");
   if(typeof window.isSecondWorldEntered==="function"){
    const pureProbe={secondWorld:{entered:true,future:{x:1}}};
    const before=JSON.stringify(pureProbe);
    if(window.isSecondWorldEntered(pureProbe)!==true||JSON.stringify(pureProbe)!==before)fail("PURE_ENTRY_READ","isSecondWorldEntered 必須為無 mutation 的純讀取",pureProbe);
   }else fail("PURE_ENTRY_API","isSecondWorldEntered 未載入");

   if(typeof window.migrateSave==="function"&&typeof state!=="undefined"&&state&&typeof state==="object"){
    const probe=clone(state),source=clone(state),previousReport=window.LAST_SAVE_MIGRATION_REPORT;
    if(probe&&source){
     try{
      if(!probe.secondWorld)probe.secondWorld={};
      if(!source.secondWorld)source.secondWorld={};
      probe.secondWorld.entered=true;source.secondWorld.entered=true;
      delete probe.secondWorld.civilizationLevel;delete source.secondWorld.civilizationLevel;
      const migrated=window.migrateSave(probe,Number(window.SAVE_SCHEMA_VERSION)||14,null,source);
      if(migrated?.secondWorld?.civilizationLevel!==0)fail("MIGRATION_DEFAULT","舊存檔 migration 應補文明 Lv0",migrated?.secondWorld);
      if(window.LAST_SAVE_MIGRATION_REPORT?.civilizationLevelInitialized!==true)fail("MIGRATION_REPORT","migration report 未標示文明等級初始化",window.LAST_SAVE_MIGRATION_REPORT);
     }finally{window.LAST_SAVE_MIGRATION_REPORT=previousReport;}
    }else fail("MIGRATION_CLONE","無法建立 migration probe clone");
   }else fail("MIGRATION_API","migrateSave／state 未載入");

   if(typeof window.runCombatCore==="function"){
    const player={hp:1000,atk:100,def:0,crit:0,dodge:0},enemy={name:"文明倍率測試",hp:999999,atk:0,def:0,crit:0,dodge:0};
    const options={rng:()=>0.5,maxTurns:1,skipEnemyAction:true,logs:false,preparePresentation:false};
    const base=window.runCombatCore(player,enemy,player.hp,{...options,playerFinalDamageMultiplier:1});
    const boosted=window.runCombatCore(player,enemy,player.hp,{...options,playerFinalDamageMultiplier:1.5});
    const a=base?.events?.find(e=>e?.type==="attack"&&e?.actor==="player");
    const b=boosted?.events?.find(e=>e?.type==="attack"&&e?.actor==="player");
    if(!a||!b||b.damage!==Math.ceil(a.damage*1.5))fail("FINAL_DAMAGE_LAYER","Combat Core 文明 final damage 1.50× probe 異常",{base:a?.damage,boosted:b?.damage});
    if(Number(b?.playerFinalDamageMultiplier)!==1.5)fail("FINAL_DAMAGE_EVENT","combat event 未保存文明 final multiplier",b);
   }else fail("COMBAT_API","runCombatCore 未載入");

   if(Number(window.CHARACTER_CIVILIZATION_UI_VERSION)!==1)fail("PLAYER_UI","角色頁文明等級 UI owner 未載入");
   if(Number(window.GM_CIVILIZATION_VERSION)!==1||Number(window.GM_CIVILIZATION_FORMAL_RANGE_VERSION)!==1||Number(window.GM_CIVILIZATION_TEST_RANGE_VERSION)!==1)fail("GM_OWNER","GM 文明等級 owner 未完整載入");
   if(Number(window.GM_POWER_BENCHMARK_VERSION)!==18||Number(window.GM_POWER_BENCHMARK_CIVILIZATION_VERSION)!==1)fail("BENCHMARK_OWNER","GM 戰力基準文明等級 owner 異常",{version:window.GM_POWER_BENCHMARK_VERSION,civilization:window.GM_POWER_BENCHMARK_CIVILIZATION_VERSION});
  }catch(error){fail("EXCEPTION","文明等級 integrity 執行失敗",String(error?.message||error));}
  const report={version:VERSION,passed:errors.length===0,errors,checkedAt:Date.now()};
  window.CIVILIZATION_LEVEL_INTEGRITY_REPORT=report;
  return report;
 }
 window.CIVILIZATION_LEVEL_INTEGRITY_VERSION=VERSION;
 window.runCivilizationLevelIntegrity=run;
 setTimeout(run,0);
})();