(function(){
 const VERSION=3;
 const errors=[];
 const fail=(code,data=null)=>errors.push({code,data});
 const w1={level:100,gold:77,secondWorld:{entered:false,darkMatter:0,darkEnergy:0},thirdWorld:{entered:false,dimensionalStrings:0}};
 const w2={level:800,gold:77,secondWorld:{entered:true,darkMatter:88,darkEnergy:9},thirdWorld:{entered:false,dimensionalStrings:0}};
 const w3={level:1200,gold:77,secondWorld:{entered:true,darkMatter:88,darkEnergy:9},thirdWorld:{entered:true,dimensionalStrings:123456789},dungeon:{}};

 if(Number(window.THIRD_WORLD_DUNGEON_UI_VERSION)!==5)fail("ui-version",window.THIRD_WORLD_DUNGEON_UI_VERSION);
 if(Number(window.DUNGEON_MODE_AVAILABILITY_POLICY_VERSION)!==5)fail("availability-policy-version",window.DUNGEON_MODE_AVAILABILITY_POLICY_VERSION);
 if(Number(window.DUNGEON_MODE_PRESENTATION_POLICY_VERSION)!==4)fail("presentation-policy-version",window.DUNGEON_MODE_PRESENTATION_POLICY_VERSION);
 if(Number(window.THIRD_WORLD_ARENA_LIVE_VERSION)!==1)fail("arena-live-version",window.THIRD_WORLD_ARENA_LIVE_VERSION);
 const expectedVersions={THIRD_WORLD_DUNGEON_HOME_POLICY_VERSION:2,THIRD_WORLD_DUNGEON_RESOURCE_BAR_VERSION:1,THIRD_WORLD_DUNGEON_RETURN_NAV_VERSION:1,THIRD_WORLD_DUNGEON_BOUNTY_HIDDEN_VERSION:2,THIRD_WORLD_DUNGEON_CALAMITY_REVIEW_VERSION:1,THIRD_WORLD_DUNGEON_ARENA_COPY_VERSION:2,THIRD_WORLD_DUNGEON_INITIAL_SYNC_VERSION:1};
 Object.entries(expectedVersions).forEach(([name,expected])=>{if(Number(window[name])!==expected)fail(`missing-version:${name}`,window[name]);});
 if(typeof window.THIRD_WORLD_ARENA_PROVISIONAL_GATE_VERSION!=="undefined")fail("retired-arena-provisional-gate",window.THIRD_WORLD_ARENA_PROVISIONAL_GATE_VERSION);
 if(typeof window.THIRD_WORLD_DUNGEON_CALAMITY_GATE_VERSION!=="undefined")fail("retired-w3-calamity-gate",window.THIRD_WORLD_DUNGEON_CALAMITY_GATE_VERSION);
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
  if(w3Arena?.visible!==true||w3Arena?.enabled!==true||w3Arena?.titleText!=="高維競技場"||w3Arena?.rewardText!=="VIP 積分"||w3Arena?.buttonLabel!=="進入高維競技場")fail("w3-arena-live",w3Arena);
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
  if(calamity3?.allowed!==true||calamity3?.redirect!==null)fail("w3-calamity-review-access",calamity3);
  if(calamity2?.allowed!==true)fail("w2-calamity-regression",calamity2);
  if(bounty3?.allowed!==false||bounty3?.redirect!=="dungeon")fail("w3-bounty-navigation",bounty3);
  if(arena3?.allowed!==true||arena3?.redirect!==null)fail("w3-arena-navigation",arena3);
  if(void3?.allowed!==true)fail("w3-void-navigation",void3);
 }
 if(Number(window.SECOND_WORLD_CALAMITY_REVIEW_VERSION)!==1||Number(window.SECOND_WORLD_CALAMITY_LEGACY_REVIEW_VERSION)!==1)fail("w3-calamity-review-owner",{universe:window.SECOND_WORLD_CALAMITY_REVIEW_VERSION,galaxy:window.SECOND_WORLD_CALAMITY_LEGACY_REVIEW_VERSION});

 const mirrorPolicy=window.MIRROR_W3_RESOURCE_POLICY,voidPolicy=window.VOID_MIRAGE_W3_RESOURCE_POLICY;
 if(Number(window.MIRROR_W3_INTEGRATION_VERSION)!==1||mirrorPolicy?.reward!=="vip"||mirrorPolicy?.sharedProgress!=="mirror-history"||mirrorPolicy?.dimensionalStrings!==false||mirrorPolicy?.thirdWorldCore!==false)fail("mirror-w3-policy",mirrorPolicy||null);
 if(Number(window.VOID_MIRAGE_W3_INTEGRATION_VERSION)!==1||voidPolicy?.reward!=="vip"||voidPolicy?.sharedProgress!=="void-highest-floor"||voidPolicy?.dimensionalStrings!==false||voidPolicy?.thirdWorldCore!==false)fail("void-w3-policy",voidPolicy||null);

 const arenaVersions={core:window.THIRD_WORLD_ARENA_CORE_VERSION,flow:window.THIRD_WORLD_ARENA_FLOW_VERSION,reward:window.THIRD_WORLD_ARENA_REWARD_VERSION,daily:window.THIRD_WORLD_ARENA_DAILY_VERSION,ui:window.THIRD_WORLD_ARENA_UI_VERSION,gm:window.GM_THIRD_WORLD_ARENA_TEST_VERSION,manage:window.GM_ARENA_SHARED_DAILY_MANAGEMENT_VERSION};
 if(Number(arenaVersions.core)!==2||Number(arenaVersions.flow)!==2||Number(arenaVersions.reward)!==1||Number(arenaVersions.daily)!==1||Number(arenaVersions.ui)!==1||Number(arenaVersions.gm)!==1||Number(arenaVersions.manage)!==1)fail("w3-arena-versions",arenaVersions);
 if(!Array.isArray(window.THIRD_WORLD_ARENA_RUN_CHOICES)||window.THIRD_WORLD_ARENA_RUN_CHOICES.join(",")!=="1,5,10,20")fail("w3-arena-run-choices",window.THIRD_WORLD_ARENA_RUN_CHOICES);
 if(typeof window.getThirdWorldArenaRoundReward==="function"){
  const a=window.getThirdWorldArenaRoundReward(1000),b=window.getThirdWorldArenaRoundReward(1100),c=window.getThirdWorldArenaRoundReward(2000);
  if(a?.scaledPoints!==1500||b?.scaledPoints!==1575||c?.scaledPoints!==2250)fail("w3-arena-reward-curve",{a,b,c});
 }
 if(typeof window.getArenaProgressForWorld==="function"&&window.getArenaProgressForWorld(3,w3)!==null)fail("w3-arena-rank-state",window.getArenaProgressForWorld(3,w3));

 const report=Object.freeze({version:VERSION,passed:errors.length===0,errors:Object.freeze(errors.slice()),checkedAt:Date.now()});
 window.THIRD_WORLD_DUNGEON_INTEGRITY_VERSION=VERSION;
 window.THIRD_WORLD_DUNGEON_INTEGRITY=report;
 if(errors.length)console.error("[Third World Dungeon Integrity]",errors);else console.info("[Third World Dungeon Integrity] passed");
})();