(function(){
 const VERSION=1;
 const errors=[];
 const fail=(code,data=null)=>errors.push({code,data});
 const w1={level:100,gold:77,secondWorld:{entered:false,darkMatter:0,darkEnergy:0},thirdWorld:{entered:false,dimensionalStrings:0}};
 const w2={level:800,gold:77,secondWorld:{entered:true,darkMatter:88,darkEnergy:9},thirdWorld:{entered:false,dimensionalStrings:0}};
 const w3={level:1200,gold:77,secondWorld:{entered:true,darkMatter:88,darkEnergy:9},thirdWorld:{entered:true,dimensionalStrings:123456789}};

 if(Number(window.THIRD_WORLD_DUNGEON_UI_VERSION)!==3)fail("ui-version",window.THIRD_WORLD_DUNGEON_UI_VERSION);
 if(Number(window.DUNGEON_MODE_AVAILABILITY_POLICY_VERSION)!==3)fail("availability-policy-version",window.DUNGEON_MODE_AVAILABILITY_POLICY_VERSION);
 if(Number(window.DUNGEON_MODE_PRESENTATION_POLICY_VERSION)!==2)fail("presentation-policy-version",window.DUNGEON_MODE_PRESENTATION_POLICY_VERSION);
 if(Number(window.THIRD_WORLD_ARENA_PROVISIONAL_GATE_VERSION)!==3)fail("arena-gate-version",window.THIRD_WORLD_ARENA_PROVISIONAL_GATE_VERSION);
 ["THIRD_WORLD_DUNGEON_HOME_POLICY_VERSION","THIRD_WORLD_DUNGEON_RESOURCE_BAR_VERSION","THIRD_WORLD_DUNGEON_RETURN_NAV_VERSION","THIRD_WORLD_DUNGEON_BOUNTY_HIDDEN_VERSION","THIRD_WORLD_DUNGEON_CALAMITY_GATE_VERSION","THIRD_WORLD_DUNGEON_ARENA_COPY_VERSION","THIRD_WORLD_DUNGEON_INITIAL_SYNC_VERSION"].forEach(name=>{if(Number(window[name])!==1)fail(`missing-version:${name}`,window[name]);});
 ["dungeonModeAvailability","thirdWorldDungeonModeVisible","thirdWorldDungeonResourceSnapshot","thirdWorldDungeonNavigationPolicy","syncThirdWorldDungeonUi"].forEach(name=>{if(typeof window[name]!=="function")fail(`missing-api:${name}`,typeof window[name]);});
 if(Number(window.DUNGEON_UI_EXTENSION_VERSION)!==1)fail("dungeon-ui-extension",window.DUNGEON_UI_EXTENSION_VERSION);
 if(Number(window.DUNGEON_PREP_RETURN_UX_VERSION)<2)fail("dungeon-prep-return",window.DUNGEON_PREP_RETURN_UX_VERSION);
 if(Number(window.DUNGEON_RETURN_LABELS_VERSION)!==1)fail("return-label-owner",window.DUNGEON_RETURN_LABELS_VERSION);

 if(typeof window.dungeonModeAvailability==="function"){
  const w3Bounty=window.dungeonModeAvailability("bounty",w3);
  const w3Arena=window.dungeonModeAvailability("arena",w3);
  const w3Tower=window.dungeonModeAvailability("tower",w3);
  const w3Mirror=window.dungeonModeAvailability("mirror",w3);
  if(w3Bounty?.visible!==false||w3Bounty?.enabled!==false)fail("w3-bounty-hidden",w3Bounty);
  if(w3Arena?.visible!==true||w3Arena?.enabled!==false||w3Arena?.titleText!=="高維競技場"||!/尚未開放/.test(String(w3Arena?.buttonLabel||"")))fail("w3-arena-preopen",w3Arena);
  if(w3Tower?.visible!==true||w3Tower?.enabled!==true||w3Tower?.unlockText!=="高維紀元可挑戰")fail("w3-void-available",w3Tower);
  if(w3Mirror?.visible!==true||w3Mirror?.enabled!==true||w3Mirror?.unlockText!=="高維紀元可挑戰")fail("w3-mirror-available",w3Mirror);
  [["bounty",w1],["arena",w1],["bounty",w2],["arena",w2]].forEach(([mode,target])=>{const result=window.dungeonModeAvailability(mode,target);if(result?.visible!==true||result?.enabled!==true)fail(`legacy-mode-regression:${mode}:${target===w1?1:2}`,result);});
 }

 if(typeof window.thirdWorldDungeonResourceSnapshot==="function"){
  const r1=window.thirdWorldDungeonResourceSnapshot(w1),r2=window.thirdWorldDungeonResourceSnapshot(w2),r3=window.thirdWorldDungeonResourceSnapshot(w3);
  if(r1?.label!=="金幣"||Number(r1?.amount)!==77)fail("w1-resource",r1);
  if(r2?.label!=="暗物質"||Number(r2?.amount)!==88)fail("w2-resource",r2);
  if(r3?.label!=="維度之弦"||Number(r3?.amount)!==123456789||r3?.secondaryLabel!=null)fail("w3-resource",r3);
 }

 if(typeof window.thirdWorldDungeonNavigationPolicy==="function"){
  const calamity3=window.thirdWorldDungeonNavigationPolicy("calamity",w3),calamity2=window.thirdWorldDungeonNavigationPolicy("calamity",w2),bounty3=window.thirdWorldDungeonNavigationPolicy("dungeon-bounty",w3),arena3=window.thirdWorldDungeonNavigationPolicy("dungeon-arena",w3),void3=window.thirdWorldDungeonNavigationPolicy("dungeon-void-mirage",w3);
  if(calamity3?.allowed!==false||calamity3?.redirect!=="home"||!/高維紀元/.test(String(calamity3?.reason||"")))fail("w3-calamity-gate",calamity3);
  if(calamity2?.allowed!==true)fail("w2-calamity-regression",calamity2);
  if(bounty3?.allowed!==false||bounty3?.redirect!=="dungeon")fail("w3-bounty-navigation",bounty3);
  if(arena3?.allowed!==false||arena3?.redirect!=="dungeon")fail("w3-arena-navigation",arena3);
  if(void3?.allowed!==true)fail("w3-void-navigation",void3);
 }

 const mirrorPolicy=window.MIRROR_W3_RESOURCE_POLICY,voidPolicy=window.VOID_MIRAGE_W3_RESOURCE_POLICY;
 if(Number(window.MIRROR_W3_INTEGRATION_VERSION)!==1||mirrorPolicy?.reward!=="vip"||mirrorPolicy?.sharedProgress!=="mirror-history"||mirrorPolicy?.dimensionalStrings!==false||mirrorPolicy?.thirdWorldCore!==false)fail("mirror-w3-policy",mirrorPolicy||null);
 if(Number(window.VOID_MIRAGE_W3_INTEGRATION_VERSION)!==1||voidPolicy?.reward!=="vip"||voidPolicy?.sharedProgress!=="void-highest-floor"||voidPolicy?.dimensionalStrings!==false||voidPolicy?.thirdWorldCore!==false)fail("void-w3-policy",voidPolicy||null);

 const report=Object.freeze({version:VERSION,passed:errors.length===0,errors:Object.freeze(errors.slice()),checkedAt:Date.now()});
 window.THIRD_WORLD_DUNGEON_INTEGRITY_VERSION=VERSION;
 window.THIRD_WORLD_DUNGEON_INTEGRITY=report;
 if(errors.length)console.error("[Third World Dungeon Integrity]",errors);else console.info("[Third World Dungeon Integrity] passed");
})();