(function(){
 const VERSION=1;
 const SETTLEMENT_VERSION=1;
 const REPLAY_GUARD_VERSION=1;
 const settledBasisObjects=new WeakSet();

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
 function settleThirdWorldCombatResult(result,options={}){
  const basis=basisFromResult(result);
  if(!basis)return reject("basis-ineligible","戰鬥結果不是可正式落帳的高維 settlement basis。");
  if(settledBasisObjects.has(basis))return reject("duplicate-result","同一場高維戰鬥結果已經完成正式結算。");
  const target=currentState();
  const precheck=validateBasisAgainstState(basis,target);
  if(!precheck.ok)return precheck;
  if(typeof window.runSettlementTransaction!=="function")return reject("transaction-owner-missing","共用正式結算 transaction owner 尚未載入。");
  const tx=window.runSettlementTransaction({
   label:"third-world-permanent-hp",
   saveFn:typeof options.saveFn==="function"?options.saveFn:undefined,
   mutate:liveState=>{
    const checked=validateBasisAgainstState(basis,liveState);
    if(!checked.ok)return checked;
    liveState.thirdWorld.bosses[checked.bossIndex].currentHp=checked.combatEndHp;
    return {
     ok:true,
     bossIndex:checked.bossIndex,
     bossId:String(checked.boss.id||""),
     formalStartHp:checked.formalStartHp,
     combatEndHp:checked.combatEndHp,
     effectivePermanentDamage:checked.effectivePermanentDamage,
     playerDied:basis.playerDied===true,
     bossDefeated:basis.bossDefeated===true,
     terminationReason:String(basis.terminationReason||"")
    };
   }
  });
  if(!tx.ok)return reject("transaction-failed","高維永久進度結算失敗，已回復結算前狀態。",{transaction:tx});
  settledBasisObjects.add(basis);
  const value=tx.value||{};
  return freeze({
   ok:true,
   world:3,
   settlementVersion:SETTLEMENT_VERSION,
   phase:"permanent-hp-only",
   bossIndex:value.bossIndex,
   bossId:value.bossId,
   formalStartHp:value.formalStartHp,
   combatEndHp:value.combatEndHp,
   effectivePermanentDamage:value.effectivePermanentDamage,
   formalProgressChanged:Number(value.effectivePermanentDamage)>0,
   playerDied:value.playerDied===true,
   bossDefeated:value.bossDefeated===true,
   terminationReason:value.terminationReason,
   xp:0,
   dimensionalStrings:0,
   items:freeze([]),
   rewardsPending:true,
   progressionPending:true,
   saved:true
  });
 }
 function validate(){
  const errors=[];
  const max=Math.max(1,finiteWhole(window.THIRD_WORLD_BOSS_MAX_HP,1));
  const boss=typeof window.thirdWorldBoss==="function"?window.thirdWorldBoss(0):null;
  const sample={secondWorld:{entered:true},thirdWorld:{entered:true,bosses:Array.from({length:10},()=>({currentHp:max}))}};
  const basis=freeze({authority:"third-world-settlement-basis",authorityVersion:1,version:2,world:3,bossIndex:0,bossId:String(boss?.id||""),formalStartHp:max,combatEndHp:max-100,effectivePermanentDamage:100,formalSettlementEligible:true});
  const valid=validateBasisAgainstState(basis,sample);
  if(!valid.ok||valid.effectivePermanentDamage!==100)errors.push({code:"VALID_BASIS",valid});
  sample.thirdWorld.bosses[0].currentHp=max-1;
  const stale=validateBasisAgainstState(basis,sample);
  if(stale.ok||stale.code!=="stale-settlement")errors.push({code:"STALE_GUARD",stale});
  if(typeof window.runSettlementTransaction!=="function")errors.push({code:"TRANSACTION_OWNER"});
  return freeze({version:VERSION,passed:errors.length===0,errors:freeze(errors.slice())});
 }

 window.THIRD_WORLD_PROGRESS_VERSION=VERSION;
 window.THIRD_WORLD_SETTLEMENT_VERSION=SETTLEMENT_VERSION;
 window.THIRD_WORLD_SETTLEMENT_REPLAY_GUARD_VERSION=REPLAY_GUARD_VERSION;
 window.settleThirdWorldCombatResult=settleThirdWorldCombatResult;
 window.THIRD_WORLD_PROGRESS_INTEGRITY=validate();
 if(!window.THIRD_WORLD_PROGRESS_INTEGRITY.passed)console.error("[文明戰線] Third-world progress integrity error",window.THIRD_WORLD_PROGRESS_INTEGRITY.errors);
})();