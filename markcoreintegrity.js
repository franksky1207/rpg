(function(){
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const expectedKeys=["ward","suppression","composure","indomitable","resilience","battleSpirit","absorption","revenge","backlash","ignore"];
 const expectedNames=["護界印記","壓制印記","鎮心印記","不屈印記","韌性印記","戰意印記","吸收印記","復仇印記","反噬印記","無視印記"];
 const expectedLevels=[50,100,150,200,250,300,350,400,450,500];
 const expectedRegions=(Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[]).map(x=>String(x?.id||""));
 const expectedUpgrade=[1,1,2,2,3,3,4,4,5,5];

 if(Number(window.MARK_CORE_VERSION)!==1)fail("MARK_CORE_VERSION","Mark Core version 應為 1",window.MARK_CORE_VERSION);
 if(Number(window.MARK_COMBAT_RULE_VERSION)!==1)fail("MARK_COMBAT_RULE_VERSION","印記戰鬥規則版本應為 1",window.MARK_COMBAT_RULE_VERSION);
 if(Number(window.MARK_MAX_LEVEL)!==10)fail("MARK_MAX_LEVEL","印記最高等級應為 10",window.MARK_MAX_LEVEL);
 if(JSON.stringify(Array.from(window.MARK_KEYS||[]))!==JSON.stringify(expectedKeys))fail("MARK_KEYS","印記順序與正式取得順序不一致",window.MARK_KEYS);
 if(JSON.stringify(Array.from(window.MARK_UPGRADE_KILLS||[]))!==JSON.stringify(expectedUpgrade))fail("MARK_UPGRADE_KILLS","印記升級擊殺需求異常",window.MARK_UPGRADE_KILLS);

 expectedKeys.forEach((key,index)=>{
  const def=window.MARK_DEFS?.[key];
  if(def?.name!==expectedNames[index]||Number(def?.unlockLevel)!==expectedLevels[index]||def?.regionId!==expectedRegions[index])fail("MARK_DEF",`${key} 定義異常`,def);
 });
 const required=["markClampLevel","markActivationChance","markRequiredKillsForNextLevel","markCumulativeKillsForLevel","markLevel","markAcquired","markProgress","markEffectSnapshot","markLevelsSnapshot","markFormalSnapshot","markEffectsSnapshot","createBlankTestMarkLevels","gmSetTestMarkLevel","gmUseCurrentMarkTestStatus"];
 required.forEach(name=>{if(typeof window[name]!=="function")fail("MARK_API",`缺少 Mark Core API：${name}`);});

 if(typeof window.markActivationChance==="function"){
  const expected=[0,30,35,40,45,50,55,60,65,70,75];
  expected.forEach((value,lv)=>{if(window.markActivationChance(lv)!==value)fail("MARK_ACTIVATION",`Lv.${lv} 啟動率應為 ${value}%`,window.markActivationChance(lv));});
 }
 if(typeof window.markCumulativeKillsForLevel==="function"){
  const expected=[0,1,2,4,6,9,12,16,20,25,30];
  expected.forEach((value,lv)=>{if(window.markCumulativeKillsForLevel(lv)!==value)fail("MARK_CUMULATIVE",`Lv.${lv} 累積重複擊殺應為 ${value}`,window.markCumulativeKillsForLevel(lv));});
 }
 if(typeof window.markRequiredKillsForNextLevel==="function"){
  expectedUpgrade.forEach((value,lv)=>{if(window.markRequiredKillsForNextLevel(lv)!==value)fail("MARK_NEXT_REQUIREMENT",`Lv.${lv} 升下一級需求應為 ${value}`,window.markRequiredKillsForNextLevel(lv));});
  if(window.markRequiredKillsForNextLevel(10)!==0)fail("MARK_MAX_REQUIREMENT","Lv.10 不應再有升級需求",window.markRequiredKillsForNextLevel(10));
 }
 if(typeof window.markEffectSnapshot==="function"){
  const checks=[
   ["ward",10,{activationChance:75,shieldMaxHpPercent:20}],
   ["suppression",10,{enemyDodgeReductionPoints:5}],
   ["composure",10,{enemyCritReductionPoints:5}],
   ["indomitable",10,{activationChance:75,surviveHp:1,usesPerBattle:1}],
   ["resilience",10,{enemyCritBonusDamageReductionPercent:30}],
   ["battleSpirit",10,{activationChance:75,atkPercentPerLayer:2,maxLayers:10}],
   ["absorption",10,{triggerChance:5,healOriginalDamagePercent:25}],
   ["revenge",10,{triggerChance:50}],
   ["backlash",10,{triggerChance:15,reflectActualHpLossPercent:30}],
   ["ignore",10,{triggerChance:5,enemyDefMultiplierOnTrigger:0}]
  ];
  checks.forEach(([key,lv,expected])=>{
   const actual=window.markEffectSnapshot(key,lv);
   Object.entries(expected).forEach(([field,value])=>{if(Number(actual?.[field])!==Number(value))fail("MARK_EFFECT",`${key} Lv.${lv} ${field} 應為 ${value}`,actual);});
  });
  expectedKeys.forEach(key=>{
   const zero=window.markEffectSnapshot(key,0);
   if(zero?.active!==false)fail("MARK_ZERO_ACTIVE",`${key} Lv.0 不應有有效效果`,zero);
  });
 }
 if(typeof window.createBlankTestMarkLevels==="function"){
  const blank=window.createBlankTestMarkLevels();
  if(Object.keys(blank).length!==10||expectedKeys.some(key=>blank[key]!==0))fail("MARK_TEST_BLANK","GM 印記測試初始值應全為 Lv.0",blank);
 }
 if(typeof window.gmSetTestMarkLevel==="function"&&typeof window.markLevelsSnapshot==="function"){
  const previous={...window.gmTestMarkLevels};
  try{
   window.gmSetTestMarkLevel("ward",99);
   window.gmSetTestMarkLevel("ignore",-5);
   const snap=window.markLevelsSnapshot(true);
   if(snap.ward!==10||snap.ignore!==0)fail("MARK_TEST_CLAMP","GM 印記測試等級 clamp 異常",snap);
  }finally{window.gmTestMarkLevels=previous;}
 }

 const report={passed:errors.length===0,errors,checkedAt:Date.now()};
 window.MARK_CORE_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Mark Core integrity error",errors);
})();