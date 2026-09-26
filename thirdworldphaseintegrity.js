(function(){
 const VERSION=1;
 const errors=[];
 const fail=(code,data=null)=>errors.push({code,data});
 function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
 try{
  if(Number(window.WORLD_PHASE_VERSION)!==4)fail("WORLD_PHASE_VERSION",window.WORLD_PHASE_VERSION);
  if(Number(window.THIRD_WORLD_PHASE_VERSION)!==1)fail("THIRD_WORLD_PHASE_VERSION",window.THIRD_WORLD_PHASE_VERSION);
  if(Number(window.THIRD_WORLD_STATE_MIGRATION_VERSION)!==1)fail("THIRD_WORLD_STATE_MIGRATION_VERSION",window.THIRD_WORLD_STATE_MIGRATION_VERSION);
  if(Number(window.SCRIPT_LOAD_POLICY_VERSION)!==2)fail("SCRIPT_LOAD_POLICY_VERSION",window.SCRIPT_LOAD_POLICY_VERSION);
  if(Number(window.WORLD_PHASE_PRIMARY_RESOURCE_VERSION)!==2)fail("WORLD_PHASE_PRIMARY_RESOURCE_VERSION",window.WORLD_PHASE_PRIMARY_RESOURCE_VERSION);
  const required=["createBlankThirdWorldState","normalizeThirdWorldState","thirdWorldState","currentWorldPhase","worldProgressionEnabled","worldPhaseSnapshot","primaryWorldResourceSnapshot","scriptLoadGroupFor"];
  required.forEach(name=>{if(typeof window[name]!=="function")fail("API_MISSING",name);});

  const blank=window.createBlankThirdWorldState?.();
  if(!blank||blank.entered!==false||blank.completed!==false||Number(blank.dimensionalStrings)!==0||Number(blank.coreLevel)!==0||!Array.isArray(blank.bosses)||blank.bosses.length!==10||blank.bosses.some(row=>Number(row?.currentHp)!==1100000000)||blank.story?.introSeen!==false||Number(blank.story?.unlockedStage)!==0||blank.story?.finalSeen!==false){
   fail("BLANK_STATE",blank||null);
  }

  const malformed={thirdWorld:{entered:false,completed:true,dimensionalStrings:-10,coreLevel:99,bosses:[{currentHp:-5},{currentHp:99999999999}],story:{introSeen:1,unlockedStage:99,finalSeen:"yes"}},secondWorld:{entered:false}};
  window.normalizeThirdWorldState?.(malformed);
  if(malformed.thirdWorld?.entered!==true||malformed.secondWorld?.entered!==true||Number(malformed.thirdWorld?.dimensionalStrings)!==0||Number(malformed.thirdWorld?.coreLevel)!==10||malformed.thirdWorld?.bosses?.length!==10||Number(malformed.thirdWorld?.bosses?.[0]?.currentHp)!==0||Number(malformed.thirdWorld?.bosses?.[1]?.currentHp)!==1100000000||malformed.thirdWorld?.story?.introSeen!==false||Number(malformed.thirdWorld?.story?.unlockedStage)!==10||malformed.thirdWorld?.story?.finalSeen!==false){
   fail("NORMALIZATION",malformed);
  }
  const normalizedSnapshot=JSON.parse(JSON.stringify(malformed));
  window.normalizeThirdWorldState?.(malformed);
  if(!same(malformed,normalizedSnapshot))fail("NORMALIZATION_NOT_IDEMPOTENT",malformed);

  const galaxy={gold:123,secondWorld:{entered:false,darkMatter:5,darkEnergy:2},thirdWorld:{entered:false,dimensionalStrings:9}};
  const universe={gold:123,secondWorld:{entered:true,darkMatter:456,darkEnergy:7},thirdWorld:{entered:false,dimensionalStrings:9}};
  const higher={gold:123,secondWorld:{entered:true,darkMatter:456,darkEnergy:7},thirdWorld:{entered:true,dimensionalStrings:789}};
  if(window.currentWorldPhase?.(galaxy)!==1||window.currentWorldPhase?.(universe)!==2||window.currentWorldPhase?.(higher)!==3)fail("CURRENT_PHASE",{galaxy:window.currentWorldPhase?.(galaxy),universe:window.currentWorldPhase?.(universe),higher:window.currentWorldPhase?.(higher)});
  const higherSnapshot=window.worldPhaseSnapshot?.(higher);
  if(higherSnapshot?.current!==3||higherSnapshot?.entered?.[2]!==true||higherSnapshot?.entered?.[3]!==true||higherSnapshot?.progression?.[1]!==false||higherSnapshot?.progression?.[2]!==false||higherSnapshot?.progression?.[3]!==true)fail("PHASE_SNAPSHOT",higherSnapshot||null);
  if(window.worldProgressionEnabled?.(2,higher)!==false||window.worldProgressionEnabled?.(3,higher)!==true)fail("PROGRESSION_OWNER",higherSnapshot||null);

  const gRes=window.primaryWorldResourceSnapshot?.(galaxy),uRes=window.primaryWorldResourceSnapshot?.(universe),hRes=window.primaryWorldResourceSnapshot?.(higher);
  if(gRes?.label!=="金幣"||Number(gRes?.amount)!==123)fail("GALAXY_RESOURCE",gRes||null);
  if(uRes?.label!=="暗物質"||Number(uRes?.amount)!==456||uRes?.secondaryLabel!=="暗能量"||Number(uRes?.secondaryAmount)!==7)fail("UNIVERSE_RESOURCE",uRes||null);
  if(hRes?.label!=="維度之弦"||Number(hRes?.amount)!==789||hRes?.secondaryLabel!==null)fail("THIRD_WORLD_RESOURCE",hRes||null);

  const groups={phase:window.scriptLoadGroupFor?.("thirdworldphase.js"),gm:window.scriptLoadGroupFor?.("thirdworldgm.js"),integrity:window.scriptLoadGroupFor?.("thirdworldphaseintegrity.js")};
  if(groups.phase!=="world"||groups.gm!=="gm"||groups.integrity!=="integrity")fail("SCRIPT_LOAD_POLICY",groups);

  if(typeof newState==="function"){
   const fresh=newState();
   if(!fresh?.thirdWorld||fresh.thirdWorld.entered!==false||fresh.thirdWorld.bosses?.length!==10)fail("NEW_STATE_THIRD_WORLD",fresh?.thirdWorld||null);
  }
  if(typeof state!=="undefined"&&state?.thirdWorld?.entered===true){
   if(state?.secondWorld?.entered!==true)fail("LIVE_STATE_HISTORY_INVARIANT",{secondWorld:state?.secondWorld?.entered,thirdWorld:state?.thirdWorld?.entered});
   if(window.currentWorldPhase?.(state)!==3)fail("LIVE_STATE_PHASE",window.currentWorldPhase?.(state));
  }
 }catch(error){fail("EXCEPTION",String(error?.message||error));}
 const report={version:VERSION,passed:errors.length===0,errors,checkedAt:Date.now()};
 window.THIRD_WORLD_PHASE_INTEGRITY_VERSION=VERSION;
 window.THIRD_WORLD_PHASE_INTEGRITY_REPORT=report;
 if(errors.length)console.error("[文明戰線] Third world phase integrity error",errors);else console.info("[文明戰線] Third world phase integrity passed");
})();
