(function(){
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const names=["灰潮母巢","日蝕王座","星骸迴廊","黑域牧者","滅世天環","寂滅方舟","萬域蝕潮","深核奇點","無聲裁決","終末之眼"];
 const markIds=["ward","suppression","composure","indomitable","resilience","battleSpirit","absorption","revenge","backlash","ignore"];
 const defs=typeof window.getCivilizationCalamityDefinitions==="function"?window.getCivilizationCalamityDefinitions():[];
 if(Number(window.CALAMITY_CORE_VERSION)!==1)fail("CALAMITY_CORE_VERSION","文明災厄 Core 應為 V1",window.CALAMITY_CORE_VERSION);
 if(Number(window.CALAMITY_COMBAT_RULE_VERSION)!==2)fail("CALAMITY_COMBAT_RULE_VERSION","文明災厄戰鬥規則版本應為 2",window.CALAMITY_COMBAT_RULE_VERSION);
 if(Number(window.COMBAT_PERSISTENT_ENEMY_HP_VERSION)!==1)fail("PERSISTENT_ENEMY_HP_VERSION","Combat Core 持久敵方 HP 支援未載入",window.COMBAT_PERSISTENT_ENEMY_HP_VERSION);
 if(Number(window.CALAMITY_FIXED_HP)!==1000000||Number(window.CALAMITY_ATK_MULTIPLIER)!==1.1||Number(window.CALAMITY_DEF_MULTIPLIER)!==1.05)fail("CALAMITY_BALANCE","文明災厄固定 HP／攻防倍率異常",{hp:window.CALAMITY_FIXED_HP,atk:window.CALAMITY_ATK_MULTIPLIER,def:window.CALAMITY_DEF_MULTIPLIER});
 if(Number(window.CALAMITY_FIXED_CRIT)!==10||Number(window.CALAMITY_FIXED_DODGE)!==10)fail("CALAMITY_RATES","文明災厄固定暴擊／閃避應為 10% / 10%",{crit:window.CALAMITY_FIXED_CRIT,dodge:window.CALAMITY_FIXED_DODGE});
 if(defs.length!==10)fail("CALAMITY_DEF_COUNT","文明災厄應有 10 隻",defs);
 defs.forEach((def,index)=>{
  const region=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS[index]:null;
  if(!region||def.id!==region.id||def.name!==names[index]||def.mapIndex!==region.mapEnd||def.unlockLevel!==region.max||def.markId!==markIds[index])fail("CALAMITY_DEF",`第 ${index+1} 隻文明災厄定義異常`,{def,region});
  try{
   const base=window.getCivilizationCalamityBaseBoss(def.id),enemy=window.buildCivilizationCalamityEnemy(def.id),formalBoss=typeof monsterObj==="function"?monsterObj(region.mapEnd,4):null;
   if(!base||!formalBoss||base.name!==formalBoss.name||base.level!==formalBoss.level||base.hp!==formalBoss.hp||base.atk!==formalBoss.atk||base.def!==formalBoss.def)fail("CALAMITY_BASE_BOSS",`${def.id} 未直接對齊正式區域最終 Boss`,{base,formalBoss});
   if(!enemy||enemy.hp!==1000000||enemy.atk!==Math.ceil(base.atk*1.10)||enemy.def!==Math.ceil(base.def*1.05)||enemy.crit!==10||enemy.dodge!==10||enemy.kind!=="civilization-calamity")fail("CALAMITY_ENEMY_FORMULA",`${def.id} 災厄戰鬥數值異常`,{base,enemy});
   if(Object.prototype.hasOwnProperty.call(enemy,"traits"))fail("CALAMITY_TRAITS",`${def.id} 不應攜帶普通怪物 traits`,enemy);
  }catch(error){fail("CALAMITY_BOSS_PROBE",`${def.id} Boss 母體檢查失敗`,String(error?.message||error));}
 });
 if(typeof window.advanceCivilizationCalamityMarkEntry==="function"){
  let entry={acquired:false,level:0,progress:0};
  const milestones={};
  for(let kill=1;kill<=31;kill++){
   const out=window.advanceCivilizationCalamityMarkEntry(entry);entry=out.entry;
   if([1,2,3,5,7,10,13,17,21,26,31].includes(kill))milestones[kill]={...entry};
  }
  const expected={1:0,2:1,3:2,5:3,7:4,10:5,13:6,17:7,21:8,26:9,31:10};
  Object.entries(expected).forEach(([kill,level])=>{if(milestones[kill]?.level!==level||milestones[kill]?.progress!==0)fail("MARK_KILL_CURVE",`第 ${kill} 殺印記應為 Lv.${level}、進度 0`,milestones[kill]);});
  const extra=window.advanceCivilizationCalamityMarkEntry(entry);
  if(extra.entry.level!==10||extra.entry.progress!==0||extra.settlement.changed!==false)fail("MARK_MAX_LOCK","印記 Lv.10 後不應再累積進度",extra);
 }else fail("MARK_ADVANCE_API","缺少純印記擊殺進度 helper");
 const report={passed:errors.length===0,errors,checkedAt:Date.now()};
 window.CALAMITY_CORE_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Civilization Calamity Core integrity error",errors);
})();