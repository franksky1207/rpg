(function(){
 const VERSION=1;
 function clone(value){try{return JSON.parse(JSON.stringify(value));}catch(e){return null;}}
 function baseSave(bosses){return {saveVersion:16,level:1000,exp:0,secondWorld:{entered:true},thirdWorld:{entered:true,entryVersion:1,bosses},offline:{}};}
 function runThirdWorldBossMigrationRegression(){
  const errors=[],cases=[],max=Number(window.THIRD_WORLD_BOSS_MAX_HP),count=Number(window.THIRD_WORLD_BOSS_COUNT),previousReport=window.LAST_SAVE_MIGRATION_REPORT;
  const fail=(id,data=null)=>errors.push({code:id,data});
  const runCase=(id,source,check)=>{
   try{
    const original=clone(source),seed=clone(source),migrated=window.migrateSave(seed,16,null,original),ok=check(migrated)===true;
    cases.push({id,ok,bosses:clone(migrated?.thirdWorld?.bosses)||null});
    if(!ok)fail(id,migrated?.thirdWorld||migrated);
   }catch(error){cases.push({id,ok:false,error:String(error?.message||error)});fail(id,String(error?.message||error));}
  };
  try{
   if(typeof window.migrateSave!=="function"||!Number.isInteger(max)||max<=0||count!==10){fail("OWNER_MISSING",{migrateSave:typeof window.migrateSave,max,count});}
   else{
    const distinct=Array.from({length:count},(_,index)=>({currentHp:max-index*1234567}));
    runCase("SCHEMA16_DISTINCT_HP_PRESERVED",baseSave(distinct),m=>Array.isArray(m?.thirdWorld?.bosses)&&m.thirdWorld.bosses.length===count&&m.thirdWorld.bosses.every((row,index)=>row.currentHp===distinct[index].currentHp));
    runCase("SCHEMA16_MISSING_BOSS_FILLED",baseSave(Array.from({length:count-1},()=>({currentHp:max-1}))),m=>m?.thirdWorld?.bosses?.length===count&&m.thirdWorld.bosses[count-1]?.currentHp===max);
    const malformed=Array.from({length:count+1},(_,index)=>({currentHp:index===0?-5:index===1?max+999:index===2?"123456789":max-index,tempShield:99}));
    runCase("SCHEMA16_HP_NORMALIZED_AND_TRANSIENT_DROPPED",baseSave(malformed),m=>{
     const rows=m?.thirdWorld?.bosses;
     return Array.isArray(rows)&&rows.length===count&&rows[0]?.currentHp===0&&rows[1]?.currentHp===max&&rows[2]?.currentHp===123456789&&rows.every(row=>Object.keys(row||{}).length===1&&Object.prototype.hasOwnProperty.call(row,"currentHp"));
    });
   }
  }finally{
   if(typeof previousReport==="undefined")delete window.LAST_SAVE_MIGRATION_REPORT;else window.LAST_SAVE_MIGRATION_REPORT=previousReport;
  }
  const report=Object.freeze({version:VERSION,passed:errors.length===0,errors:Object.freeze(errors.slice()),cases:Object.freeze(cases.slice()),checkedAt:Date.now()});
  window.SAVE_THIRD_WORLD_BOSS_MIGRATION_REGRESSION_REPORT=report;
  return report;
 }
 window.SAVE_THIRD_WORLD_BOSS_MIGRATION_REGRESSION_VERSION=VERSION;
 window.runThirdWorldBossMigrationRegression=runThirdWorldBossMigrationRegression;
 window.SAVE_THIRD_WORLD_BOSS_MIGRATION_REGRESSION_REPORT=runThirdWorldBossMigrationRegression();
})();