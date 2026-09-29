(function(){
 const errors=[];
 const fail=(code,message,detail=null)=>errors.push({code,message,detail});
 const levels=value=>Object.fromEntries((window.SPECIALIZATION_KEYS||[]).map(key=>[key,value]));
 try{
  if(Number(window.GM_BATCH16_FORMAL_CONTROLS_VERSION)!==1)fail("FORMAL_UI_OWNER","第16批正式控制鎖定 owner 未載入");
  if(typeof window.gmBatch16FormalWorldPhase!=="function")fail("PHASE_API","第16批正式紀元判定 API 未載入");
  const galaxy={secondWorld:{entered:false},thirdWorld:{entered:false},specializations:levels(0),enhancement:{levels:{weapon:0,helmet:0,armor:0,shoes:0,accessory:0}}};
  const universe={secondWorld:{entered:true,civilizationLevel:5},thirdWorld:{entered:false},specializations:levels(60),enhancement:{levels:{weapon:20,helmet:25,armor:30,shoes:35,accessory:40}}};
  const higher={secondWorld:{entered:true,civilizationLevel:0},thirdWorld:{entered:true},specializations:levels(60),enhancement:{levels:{weapon:40,helmet:40,armor:40,shoes:40,accessory:40}}};

  if(window.gmBatch16FormalWorldPhase?.(galaxy)!==1||window.gmBatch16FormalWorldPhase?.(universe)!==2||window.gmBatch16FormalWorldPhase?.(higher)!==3)fail("PHASE_PROBE","第16批三紀元判定異常");

  if(typeof window.specializationFormalStateIssues!=="function")fail("SPEC_API","專精正式狀態 API 未載入");
  else{
   if(window.specializationFormalStateIssues(galaxy).length!==0)fail("SPEC_W1","銀河紀元專精 Lv0 應合法");
   if(window.specializationFormalStateIssues(universe).length!==0)fail("SPEC_W2","宇宙紀元專精全 Lv60 應合法");
   if(window.specializationFormalStateIssues(higher).length!==0)fail("SPEC_W3","高維紀元專精全 Lv60 應合法");
   const low={...higher,specializations:{...higher.specializations,training:59}};
   if(!window.specializationFormalStateIssues(low).some(row=>row?.code==="LEVEL_BELOW_FORMAL_MIN"&&row?.key==="training"))fail("SPEC_W3_LOW","高維紀元專精 Lv59 未被正式規則拒絕");
  }

  if(typeof window.effectiveEnhancementMin!=="function"||typeof window.effectiveEnhancementCap!=="function")fail("ENH_API","強化正式範圍 API 未載入");
  else{
   if(window.effectiveEnhancementMin(galaxy)!==0||window.effectiveEnhancementCap(galaxy)!==20)fail("ENH_W1","銀河強化正式範圍不是 +0～+20");
   if(window.effectiveEnhancementMin(universe)!==20||window.effectiveEnhancementCap(universe)!==40)fail("ENH_W2","宇宙強化正式範圍不是 +20～+40");
   if(window.effectiveEnhancementMin(higher)!==40||window.effectiveEnhancementCap(higher)!==40)fail("ENH_W3","高維強化正式範圍不是固定 +40");
  }

  if(typeof window.gmFormalMarkMinimum!=="function")fail("MARK_API","印記正式紀元鎖定 API 未載入");
  else{
   if(window.gmFormalMarkMinimum(galaxy)!==0)fail("MARK_W1","銀河正式印記最低值應為 0");
   if(window.gmFormalMarkMinimum(universe)!==10)fail("MARK_W2","宇宙正式印記應固定 Lv10");
   if(window.gmFormalMarkMinimum(higher)!==10)fail("MARK_W3","高維正式印記應固定 Lv10");
  }

  if(typeof window.formalCivilizationRange!=="function")fail("CIV_API","文明等級正式範圍 API 未載入");
  else{
   const w1=window.formalCivilizationRange(galaxy),w2=window.formalCivilizationRange(universe),w3=window.formalCivilizationRange(higher);
   if(w1?.enabled!==false)fail("CIV_W1","銀河紀元不應啟用文明等級管理",w1);
   if(w2?.enabled!==true||w2?.min!==0||w2?.max!==10||w2?.fixed!==false)fail("CIV_W2","宇宙文明等級正式範圍不是 Lv0～10",w2);
   if(w3?.enabled!==true||w3?.min!==10||w3?.max!==10||w3?.fixed!==true)fail("CIV_W3","高維文明等級不是固定 Lv10",w3);
  }

  const currentPhase=window.gmBatch16FormalWorldPhase?.();
  if(currentPhase>=2){
   const spec=String(window.gmSpecializationManagementHtml?.()||"");
   if(!spec.includes("disabled")||!spec.includes("Lv.60")||!spec.includes("套用專精等級"))fail("SPEC_UI_LOCK","宇宙／高維正式專精 UI 未完整鎖定");
   const mark=String(window.gmMarkManagementHtml?.()||"");
   if(!mark.includes("disabled")||!mark.includes("Lv.10")||!mark.includes("套用印記狀態"))fail("MARK_UI_LOCK","宇宙／高維正式印記 UI 未完整鎖定");
  }
  const specTest=String(window.gmSpecializationTestHtml?.()||"");
  if(!specTest.includes("Lv.0")||!specTest.includes("Lv.60"))fail("SPEC_SANDBOX","專精 GM 沙盒未保留 Lv0～60");
  const markTest=String(window.gmMarkTestHtml?.()||"");
  if(!markTest.includes("Lv.0")||!markTest.includes("Lv.10"))fail("MARK_SANDBOX","印記 GM 沙盒未保留 Lv0～10");
 }catch(error){fail("EXCEPTION","第16批整體完整性檢查執行失敗",String(error?.message||error));}
 const report={version:1,passed:errors.length===0,errors,checkedAt:Date.now()};
 window.GM_BATCH16_INTEGRITY_VERSION=1;
 window.GM_BATCH16_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] GM Batch16 integrity error",errors);
})();
