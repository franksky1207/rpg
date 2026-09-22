(function(){
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const config=Array.from(window.CIVILIZATION_CALAMITY_CONFIG||[]);
 const defs=typeof window.getCivilizationCalamityDefinitions==="function"?window.getCivilizationCalamityDefinitions():[];
 if(Number(window.CALAMITY_CORE_VERSION)!==1)fail("CALAMITY_CORE_VERSION","文明災厄 Core 應為 V1",window.CALAMITY_CORE_VERSION);
 if(Number(window.CALAMITY_COMBAT_RULE_VERSION)!==3||Number(window.CALAMITY_MAXED_REPLAY_HP_VERSION)!==1)fail("CALAMITY_COMBAT_RULE_VERSION","文明災厄戰鬥規則應為 V3，滿印記重打每場滿 HP",{rules:window.CALAMITY_COMBAT_RULE_VERSION,replayHp:window.CALAMITY_MAXED_REPLAY_HP_VERSION});
 if(Number(window.COMBAT_PERSISTENT_ENEMY_HP_VERSION)!==1)fail("PERSISTENT_ENEMY_HP_VERSION","Combat Core 持久敵方 HP 支援未載入",window.COMBAT_PERSISTENT_ENEMY_HP_VERSION);
 if(Number(window.CALAMITY_HP_PER_LEVEL)!==500000||typeof window.getCivilizationCalamityConfiguredMaxHp!=="function"||Number(window.CALAMITY_ATK_MULTIPLIER)!==1.1||Number(window.CALAMITY_DEF_MULTIPLIER)!==1.05)fail("CALAMITY_BALANCE","文明災厄分級 HP／攻防倍率異常",{hpPerLevel:window.CALAMITY_HP_PER_LEVEL,hpApi:typeof window.getCivilizationCalamityConfiguredMaxHp,atk:window.CALAMITY_ATK_MULTIPLIER,def:window.CALAMITY_DEF_MULTIPLIER});
 if(Number(window.CALAMITY_FIXED_CRIT)!==10||Number(window.CALAMITY_FIXED_DODGE)!==10)fail("CALAMITY_RATES","文明災厄固定暴擊／閃避應為 10% / 10%",{crit:window.CALAMITY_FIXED_CRIT,dodge:window.CALAMITY_FIXED_DODGE});
 if(defs.length!==10)fail("CALAMITY_DEF_COUNT","文明災厄應有 10 隻",defs);
 try{
  const def=defs[0],region=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS[0]:null;
  if(def&&region){
   const probe={
    bossKilled:Array.from({length:Math.max(100,Number(region.mapEnd)+1)},()=>false),
    calamities:{entries:{[def.id]:{currentHp:2500000}}},
    marks:{entries:{[def.markId]:{acquired:false,level:99,progress:777}}}
   };
   probe.bossKilled[def.mapIndex]=true;
   const before=JSON.stringify(probe);
   const hp=window.getCivilizationCalamityCurrentHp?.(def.id,probe);
   const st=window.getCivilizationCalamityStatus?.(def.id,probe);
   const after=JSON.stringify(probe);
   if(before!==after)fail("CALAMITY_GETTER_MUTATION","災厄 currentHp/status getter 不得修改傳入 state",{before,after});
   if(hp!==500000||st?.currentHp!==500000)fail("CALAMITY_GETTER_HP_READ","災厄 pure getter 應只在回傳值依災厄等級 clamp HP，不修改來源",{hp,status:st});
   if(st?.mark?.acquired!==true||st?.mark?.level!==10||st?.mark?.progress!==0)fail("CALAMITY_GETTER_MARK_READ","災厄 pure getter 應回傳正規化印記快照但不修改來源",st?.mark);
   const maxedReplay={bossKilled:probe.bossKilled.slice(),calamities:{entries:{[def.id]:{currentHp:123456}}},marks:{entries:{[def.markId]:{acquired:true,level:10,progress:0}}}};
   const replayHp=window.getCivilizationCalamityCurrentHp?.(def.id,maxedReplay);
   if(replayHp!==500000)fail("CALAMITY_MAXED_REPLAY_FULL_HP","印記 Lv10 後重打災厄必須從滿 HP 開始",{stored:123456,replayHp});
  }
 }catch(error){fail("CALAMITY_GETTER_PURITY_PROBE","災厄 pure getter 檢查失敗",String(error?.message||error));}

 defs.forEach((def,index)=>{
  const region=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS[index]:null;
  const source=config[index];
  if(!region||!source||def.id!==source.id||def.name!==source.calamityName||def.mapIndex!==source.mapIndex||def.unlockLevel!==source.unlockLevel||def.markId!==source.markId||def.regionId!==source.regionId)fail("CALAMITY_DEF",`第 ${index+1} 隻文明災厄未直接對齊統一設定`,{def,source,region});
  try{
   const base=window.getCivilizationCalamityBaseBoss(def.id),enemy=window.buildCivilizationCalamityEnemy(def.id),formalBoss=typeof monsterObj==="function"?monsterObj(region.mapEnd,4):null;
   if(!base||!formalBoss||base.name!==formalBoss.name||base.level!==formalBoss.level||base.hp!==formalBoss.hp||base.atk!==formalBoss.atk||base.def!==formalBoss.def)fail("CALAMITY_BASE_BOSS",`${def.id} 未直接對齊正式區域最終 Boss`,{base,formalBoss});
   const expectedHp=(index+1)*500000;
   if(!enemy||enemy.hp!==expectedHp||enemy.atk!==Math.ceil(base.atk*1.10)||enemy.def!==Math.ceil(base.def*1.05)||enemy.crit!==10||enemy.dodge!==10||enemy.kind!=="civilization-calamity")fail("CALAMITY_ENEMY_FORMULA",`${def.id} 災厄戰鬥數值異常`,{base,enemy,expectedHp});
   if(Object.prototype.hasOwnProperty.call(enemy,"traits"))fail("CALAMITY_TRAITS",`${def.id} 不應攜帶普通怪物 traits`,enemy);
  }catch(error){fail("CALAMITY_BOSS_PROBE",`${def.id} Boss 母體檢查失敗`,String(error?.message||error));}
 });
 if(Number(window.MARK_PROGRESSION_OWNER_VERSION)!==1||typeof window.advanceMarkProgressEntry!=="function"||typeof window.settleFormalMarkKill!=="function")fail("MARK_PROGRESSION_OWNER","災厄 Core 必須委派 Mark Core progression owner",{version:window.MARK_PROGRESSION_OWNER_VERSION,advance:typeof window.advanceMarkProgressEntry,settle:typeof window.settleFormalMarkKill});
 const report={passed:errors.length===0,errors,checkedAt:Date.now()};
 window.CALAMITY_CORE_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Civilization Calamity Core integrity error",errors);
})();