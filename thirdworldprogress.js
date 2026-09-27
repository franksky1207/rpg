(function(){
 const VERSION=3;
 const SETTLEMENT_VERSION=3;
 const REPLAY_GUARD_VERSION=1;
 const ECONOMY_VERSION=1;
 const EQUIPMENT_VERSION=1;
 const settledBasisObjects=new WeakSet();
 const preparedLootByBasis=new WeakMap();

 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}}
 function finiteWhole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function freeze(value){return Object.freeze(value);}
 function reject(code,reason,data=null){return freeze({ok:false,world:3,code:String(code||"settlement-rejected"),reason:String(reason||"高維正式結算遭拒。"),data});}
 function basisFromResult(result){return typeof window.thirdWorldSettlementBasisFromResult==="function"?window.thirdWorldSettlementBasisFromResult(result,{requireEligible:true}):null;}
 function validateBasisAgainstState(basis,target){
  if(!basis||typeof basis!=="object")return reject("basis-invalid","正式高維結算資料無效。");
  if(!target||typeof target!=="object"||target?.thirdWorld?.entered!==true)return reject("state-invalid","目前不是有效的高維紀元正式狀態。");
  if(typeof window.worldProgressionEnabled==="function"&&window.worldProgressionEnabled(3,target)!==true)return reject("world-locked","高維紀元目前不是正式成長世界。");
  const index=finiteWhole(basis.bossIndex,-1),boss=typeof window.thirdWorldBoss==="function"?window.thirdWorldBoss(index):null;
  if(index<0||!boss)return reject("boss-invalid","找不到高維 Boss。",{bossIndex:index});
  if(String(basis.bossId||"")!==String(boss.id||""))return reject("boss-identity-mismatch","高維 Boss 身分與戰鬥結果不一致。",{bossIndex:index,basisBossId:basis.bossId,bossId:boss.id});
  const row=target?.thirdWorld?.bosses?.[index];
  if(!row||typeof row!=="object")return reject("boss-state-missing","高維 Boss 永久進度不存在。",{bossIndex:index});
  const currentHp=Math.max(0,finiteWhole(row.currentHp,boss.maxHp));
  const formalStartHp=Math.max(0,finiteWhole(basis.formalStartHp,0));
  const combatEndHp=Math.max(0,finiteWhole(basis.combatEndHp,formalStartHp));
  if(currentHp!==formalStartHp)return reject("stale-settlement","此戰鬥結果已過期或已經結算，Boss 永久 HP 與場初正式 HP 不一致。",{bossIndex:index,currentHp,formalStartHp});
  if(formalStartHp>finiteWhole(boss.maxHp,0)||combatEndHp>formalStartHp)return reject("hp-range-invalid","高維 Boss 結算 HP 範圍無效。",{bossIndex:index,formalStartHp,combatEndHp,bossMaxHp:boss.maxHp});
  const effectivePermanentDamage=Math.max(0,formalStartHp-combatEndHp);
  if(effectivePermanentDamage!==Math.max(0,finiteWhole(basis.effectivePermanentDamage,0)))return reject("damage-mismatch","永久淨削血與正式 settlement basis 不一致。",{bossIndex:index,effectivePermanentDamage,basisDamage:basis.effectivePermanentDamage});
  return freeze({ok:true,bossIndex:index,boss,bossRow:row,currentHp,formalStartHp,combatEndHp,effectivePermanentDamage});
 }
 function applyEconomyRewards(target,amount){
  if(!target||typeof target!=="object"||!target.thirdWorld||typeof target.thirdWorld!=="object")return {ok:false,reason:"高維經濟狀態無效。"};
  if(typeof window.gainEffectiveExpForState!=="function")return {ok:false,reason:"共用 EXP progression owner 尚未載入。"};
  const reward=Math.max(0,finiteWhole(amount,0));
  const logs=[];
  const levelBefore=Math.max(1,finiteWhole(target.level,1));
  const expBefore=Math.max(0,finiteWhole(target.exp,0));
  const cap=typeof window.effectiveLevelCap==="function"?Math.max(1,finiteWhole(window.effectiveLevelCap(target),2000)):2000;
  const atLevelCapBefore=levelBefore>=cap;
  const levelUps=window.gainEffectiveExpForState(reward,target,logs);
  const stringsBefore=Math.max(0,finiteWhole(target.thirdWorld.dimensionalStrings,0));
  target.thirdWorld.dimensionalStrings=stringsBefore+reward;
  return {
   ok:true,
   xp:reward,
   dimensionalStrings:reward,
   dimensionalStringsBefore:stringsBefore,
   dimensionalStringsAfter:target.thirdWorld.dimensionalStrings,
   levelBefore,
   levelAfter:Math.max(1,finiteWhole(target.level,levelBefore)),
   expBefore,
   expAfter:Math.max(0,finiteWhole(target.exp,0)),
   levelUps:Math.max(0,finiteWhole(levelUps,0)),
   levelCap:cap,
   atLevelCapBefore,
   atLevelCapAfter:Math.max(1,finiteWhole(target.level,levelBefore))>=cap,
   logs
  };
 }
 function preparedEquipmentDrops(basis,target,options={}){
  if(preparedLootByBasis.has(basis))return preparedLootByBasis.get(basis);
  if(typeof window.makeThirdWorldBossEquipmentDrops!=="function")return null;
  const drops=window.makeThirdWorldBossEquipmentDrops(basis.bossIndex,{state:target,level:target?.level,rng:options.rng,vipLevel:options.vipLevel,weakTypesResolver:options.weakTypesResolver});
  const rows=Array.isArray(drops)?drops.slice():[];
  if(!rows.length)return null;
  preparedLootByBasis.set(basis,rows);
  return rows;
 }
 function applyEquipmentRewards(basis,target,options={}){
  if(typeof addItem!=="function")return {ok:false,reason:"共用背包 addItem owner 尚未載入。"};
  if(typeof window.equipmentSaleQuote!=="function"||typeof window.settleEquipmentSale!=="function")return {ok:false,reason:"共用裝備出售 owner 尚未載入。"};
  const drops=preparedEquipmentDrops(basis,target,options);
  if(!Array.isArray(drops)||!drops.length)return {ok:false,reason:"高維正式裝備掉落建立失敗。"};
  const equipmentRewards=[];
  for(const drop of drops){
   const item=drop?.item;
   if(!item||Number(item.world)!==3)return {ok:false,reason:"高維裝備掉落資料無效。"};
   if(finiteWhole(item.level,0)!==finiteWhole(target.level,0))return {ok:false,reason:"高維裝備等級未跟隨玩家目前等級。"};
   if(![4,5].includes(finiteWhole(item.q,-1)))return {ok:false,reason:"高維裝備品質超出傳說／神話池。"};
   const itemResult=addItem(item,{state:target,useTestSpecializations:false});
   const sold=Math.max(0,Number(itemResult?.sold)||0),saleAmount=Math.max(0,Number(itemResult?.sale?.quote?.amount)||0);
   if(sold!==0||saleAmount!==0)return {ok:false,reason:"高維裝備出售不得產生任何資源。"};
   equipmentRewards.push({item,itemResult,sale:itemResult?.sale||null,kept:itemResult?.kept===true,vip16Extra:drop.vip16Extra===true,baseQuality:drop.baseQuality,qualityResult:drop.qualityResult||null,forcedType:drop.forcedType||null});
  }
  return {ok:true,equipmentRewards,items:equipmentRewards.map(row=>row.item),dropCount:equipmentRewards.length};
 }
 function settleThirdWorldCombatResult(result,options={}){
  const basis=basisFromResult(result);
  if(!basis)return reject("basis-ineligible","戰鬥結果不是可正式落帳的高維 settlement basis。");
  if(settledBasisObjects.has(basis))return reject("duplicate-result","同一場高維戰鬥結果已經完成正式結算。");
  const target=currentState();
  const precheck=validateBasisAgainstState(basis,target);
  if(!precheck.ok)return precheck;
  if(typeof window.runSettlementTransaction!=="function")return reject("transaction-owner-missing","共用正式結算 transaction owner 尚未載入。");
  if(typeof window.gainEffectiveExpForState!=="function")return reject("exp-owner-missing","共用 EXP progression owner 尚未載入。");
  if(typeof window.makeThirdWorldBossEquipmentDrops!=="function")return reject("equipment-owner-missing","高維裝備掉落 adapter 尚未載入。");
  if(typeof addItem!=="function"||typeof window.settleEquipmentSale!=="function")return reject("inventory-owner-missing","共用背包／出售 owner 尚未載入。");
  const tx=window.runSettlementTransaction({
   label:"third-world-permanent-economy-equipment",
   mutate:liveState=>{
    const checked=validateBasisAgainstState(basis,liveState);
    if(!checked.ok)return checked;
    liveState.thirdWorld.bosses[checked.bossIndex].currentHp=checked.combatEndHp;
    const economy=applyEconomyRewards(liveState,checked.effectivePermanentDamage);
    if(!economy.ok)return economy;
    const equipment=applyEquipmentRewards(basis,liveState,options);
    if(!equipment.ok)return equipment;
    return {
     ok:true,
     bossIndex:checked.bossIndex,
     bossId:String(checked.boss.id||""),
     formalStartHp:checked.formalStartHp,
     combatEndHp:checked.combatEndHp,
     effectivePermanentDamage:checked.effectivePermanentDamage,
     playerDied:basis.playerDied===true,
     bossDefeated:basis.bossDefeated===true,
     terminationReason:String(basis.terminationReason||""),
     economy,
     equipment
    };
   }
  });
  if(!tx.ok)return reject("transaction-failed","高維正式結算失敗，已回復結算前狀態。",{transaction:tx});
  settledBasisObjects.add(basis);
  preparedLootByBasis.delete(basis);
  const value=tx.value||{},economy=value.economy||{},equipment=value.equipment||{};
  const equipmentRewards=Array.isArray(equipment.equipmentRewards)?equipment.equipmentRewards.map(row=>freeze({...row})):[];
  const items=Array.isArray(equipment.items)?equipment.items.slice():[];
  return freeze({
   ok:true,
   world:3,
   settlementVersion:SETTLEMENT_VERSION,
   phase:"permanent-hp-exp-strings-equipment",
   bossIndex:value.bossIndex,
   bossId:value.bossId,
   formalStartHp:value.formalStartHp,
   combatEndHp:value.combatEndHp,
   effectivePermanentDamage:value.effectivePermanentDamage,
   formalProgressChanged:Number(value.effectivePermanentDamage)>0,
   playerDied:value.playerDied===true,
   bossDefeated:value.bossDefeated===true,
   terminationReason:value.terminationReason,
   xp:Math.max(0,finiteWhole(economy.xp,0)),
   dimensionalStrings:Math.max(0,finiteWhole(economy.dimensionalStrings,0)),
   dimensionalStringsBefore:Math.max(0,finiteWhole(economy.dimensionalStringsBefore,0)),
   dimensionalStringsAfter:Math.max(0,finiteWhole(economy.dimensionalStringsAfter,0)),
   levelBefore:Math.max(1,finiteWhole(economy.levelBefore,1)),
   levelAfter:Math.max(1,finiteWhole(economy.levelAfter,1)),
   expBefore:Math.max(0,finiteWhole(economy.expBefore,0)),
   expAfter:Math.max(0,finiteWhole(economy.expAfter,0)),
   levelUps:Math.max(0,finiteWhole(economy.levelUps,0)),
   atLevelCapBefore:economy.atLevelCapBefore===true,
   atLevelCapAfter:economy.atLevelCapAfter===true,
   logs:freeze(Array.isArray(economy.logs)?economy.logs.slice():[]),
   items:freeze(items),
   equipmentRewards:freeze(equipmentRewards),
   equipmentDropCount:Math.max(0,finiteWhole(equipment.dropCount,items.length)),
   rewardsPending:false,
   equipmentPending:false,
   progressionPending:true,
   saved:true
  });
 }
 function validate(){
  const errors=[];
  const max=Math.max(1,finiteWhole(window.THIRD_WORLD_BOSS_MAX_HP,1));
  const boss=typeof window.thirdWorldBoss==="function"?window.thirdWorldBoss(0):null;
  const sample={level:1000,exp:0,secondWorld:{entered:true},thirdWorld:{entered:true,dimensionalStrings:0,bosses:Array.from({length:10},()=>({currentHp:max}))}};
  const basis=freeze({authority:"third-world-settlement-basis",authorityVersion:1,version:2,world:3,bossIndex:0,bossId:String(boss?.id||""),formalStartHp:max,combatEndHp:max-100,effectivePermanentDamage:100,formalSettlementEligible:true});
  const valid=validateBasisAgainstState(basis,sample);
  if(!valid.ok||valid.effectivePermanentDamage!==100)errors.push({code:"VALID_BASIS",valid});
  sample.thirdWorld.bosses[0].currentHp=max-1;
  const stale=validateBasisAgainstState(basis,sample);
  if(stale.ok||stale.code!=="stale-settlement")errors.push({code:"STALE_GUARD",stale});
  if(typeof window.runSettlementTransaction!=="function")errors.push({code:"TRANSACTION_OWNER"});
  if(typeof window.gainEffectiveExpForState!=="function")errors.push({code:"EXP_OWNER"});
  if(typeof window.makeThirdWorldBossEquipmentDrops!=="function"||window.THIRD_WORLD_EQUIPMENT_REWARD_INTEGRITY?.passed!==true)errors.push({code:"THIRD_WORLD_EQUIPMENT_OWNER"});
  const economyProbe={level:1000,exp:0,secondWorld:{entered:true},thirdWorld:{entered:true,dimensionalStrings:7}};
  const economy=applyEconomyRewards(economyProbe,10000000);
  if(!economy.ok||economy.xp!==10000000||economy.dimensionalStrings!==10000000||economyProbe.level!==1001||economyProbe.exp!==0||economyProbe.thirdWorld.dimensionalStrings!==10000007)errors.push({code:"ECONOMY_MATCH_DAMAGE",economy,state:economyProbe});
  const capProbe={level:2000,exp:999,secondWorld:{entered:true},thirdWorld:{entered:true,dimensionalStrings:11}};
  const capEconomy=applyEconomyRewards(capProbe,500);
  if(!capEconomy.ok||capEconomy.xp!==500||capEconomy.dimensionalStrings!==500||capProbe.level!==2000||capProbe.exp!==0||capProbe.thirdWorld.dimensionalStrings!==511||capEconomy.levelUps!==0)errors.push({code:"LEVEL_CAP_STRINGS_CONTINUE",capEconomy,state:capProbe});
  const zeroProbe={level:1000,exp:123,secondWorld:{entered:true},thirdWorld:{entered:true,dimensionalStrings:9}};
  const zeroEconomy=applyEconomyRewards(zeroProbe,0);
  if(!zeroEconomy.ok||zeroEconomy.xp!==0||zeroEconomy.dimensionalStrings!==0||zeroProbe.exp!==123||zeroProbe.thirdWorld.dimensionalStrings!==9)errors.push({code:"ZERO_DAMAGE_ZERO_ECONOMY",zeroEconomy,state:zeroProbe});
  return freeze({version:VERSION,passed:errors.length===0,errors:freeze(errors.slice())});
 }

 window.THIRD_WORLD_PROGRESS_VERSION=VERSION;
 window.THIRD_WORLD_SETTLEMENT_VERSION=SETTLEMENT_VERSION;
 window.THIRD_WORLD_SETTLEMENT_REPLAY_GUARD_VERSION=REPLAY_GUARD_VERSION;
 window.THIRD_WORLD_SETTLEMENT_ECONOMY_VERSION=ECONOMY_VERSION;
 window.THIRD_WORLD_SETTLEMENT_EQUIPMENT_VERSION=EQUIPMENT_VERSION;
 window.settleThirdWorldCombatResult=settleThirdWorldCombatResult;
 window.THIRD_WORLD_PROGRESS_INTEGRITY=validate();
 if(!window.THIRD_WORLD_PROGRESS_INTEGRITY.passed)console.error("[文明戰線] Third-world progress integrity error",window.THIRD_WORLD_PROGRESS_INTEGRITY.errors);
})();
