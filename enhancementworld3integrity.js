(function(){
 const errors=[];
 const fail=(code,message)=>errors.push({code,message});
 if(Number(window.ENHANCEMENT_THIRD_WORLD_FORMAL_LOCK_VERSION)!==1)fail("CORE_VERSION","第三紀元強化正式鎖定 owner 未載入");
 if(Number(window.GM_ENHANCEMENT_WORLD3_LOCK_VERSION)!==1)fail("GM_VERSION","第三紀元 GM 強化鎖定未載入");
 if(typeof window.effectiveEnhancementMin!=="function"||typeof window.effectiveEnhancementCap!=="function"||typeof window.formalEnhancementLevelValid!=="function"||typeof window.enhancementFormalStateIssues!=="function"){
  fail("CORE_API","強化正式範圍 API 未完整載入");
 }else{
  const galaxy={secondWorld:{entered:false},thirdWorld:{entered:false},enhancement:{levels:{weapon:0,helmet:0,armor:0,shoes:0,accessory:0}}};
  const universe={secondWorld:{entered:true},thirdWorld:{entered:false},enhancement:{levels:{weapon:20,helmet:21,armor:30,shoes:40,accessory:20}}};
  const higher={secondWorld:{entered:true},thirdWorld:{entered:true},enhancement:{levels:{weapon:40,helmet:40,armor:40,shoes:40,accessory:40}}};
  if(window.effectiveEnhancementMin(galaxy)!==0||window.effectiveEnhancementCap(galaxy)!==20)fail("GALAXY_RANGE","銀河紀元正式強化範圍不是 +0～+20");
  if(window.effectiveEnhancementMin(universe)!==20||window.effectiveEnhancementCap(universe)!==40)fail("UNIVERSE_RANGE","宇宙紀元正式強化範圍不是 +20～+40");
  if(window.effectiveEnhancementMin(higher)!==40||window.effectiveEnhancementCap(higher)!==40)fail("THIRD_WORLD_RANGE","高維紀元正式強化不是固定 +40");
  if(window.formalEnhancementLevelValid(40,higher)!==true||window.formalEnhancementLevelValid(39,higher)!==false||window.formalEnhancementLevelValid(41,higher)!==false)fail("THIRD_WORLD_VALIDITY","高維紀元正式強化邊界判定異常");
  const invalid={secondWorld:{entered:true},thirdWorld:{entered:true},enhancement:{levels:{weapon:39,helmet:40,armor:40,shoes:40,accessory:40}}};
  const issues=window.enhancementFormalStateIssues(invalid);
  if(!issues.some(row=>row?.code==="LEVEL_BELOW_FORMAL_MIN"&&row?.type==="weapon"))fail("THIRD_WORLD_LOW_DETECT","高維紀元低於 +40 的正式異常未被偵測");
  if(typeof window.enhancementUpgradeCost==="function"&&window.enhancementUpgradeCost(40,higher)?.available!==false)fail("THIRD_WORLD_UPGRADE_GATE","高維紀元不應再提供正式強化升級成本");
 }
 window.ENHANCEMENT_WORLD3_INTEGRITY_VERSION=1;
 window.ENHANCEMENT_WORLD3_INTEGRITY={version:1,passed:errors.length===0,errors,checkedAt:new Date().toISOString()};
 if(errors.length)console.error("[高維紀元強化鎖定完整性檢查失敗]",errors);
})();
