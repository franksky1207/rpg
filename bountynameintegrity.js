(function(){
 const VERSION=1;
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const expected={
  1:{
   normal:["武裝逃逸者","非法改裝兵","黑市護衛","走私突擊手","失控安保機"],
   high:["裝甲追緝犯","戰區破壞手","非法火力平台","禁區滲透指揮","深空走私艦長"],
   danger:["都市級威脅體","殲滅協議載體","戰爭失控核心","軌道破壞平台","深空封鎖母艦"]
  },
  2:{
   normal:["界航偷渡者","星群私兵","暗域護運隊","跨域劫運兵","漂流戰械"],
   high:["星路私掠者","界域破航兵","暗物質武裝艇","星群滲透官","跨域走私艦主"],
   danger:["萬域私戰艦","跨域劫掠主機","戰線叛離主機","星路封鎖要塞","跨域掠奪母艦"]
  }
 };
 const probeStats={hp:10000,atk:1200,def:600,crit:10,dodge:10};
 const originalRandom=Math.random;
 try{
  if(Number(window.BOUNTY_UNIVERSE_NAME_POOL_VERSION)!==1)fail("BOUNTY_NAME_POOL_VERSION","懸賞雙紀元名稱池版本異常",window.BOUNTY_UNIVERSE_NAME_POOL_VERSION);
  if(typeof window.buildBountyEnemyForTest!=="function")fail("BOUNTY_NAME_TEST_API","缺少懸賞敵人正式測試 API");
  else{
   [1,2].forEach(world=>{
    ["normal","high","danger"].forEach(tier=>{
     const actual=[];
     for(let i=0;i<5;i++){
      Math.random=()=>Math.min(.999999,(i+.01)/5);
      const enemy=window.buildBountyEnemyForTest(tier,probeStats,world===2?600:300,world,world===2?2:0);
      actual.push(String(enemy?.name||""));
     }
     if(JSON.stringify(actual)!==JSON.stringify(expected[world][tier]))fail("BOUNTY_NAME_POOL_CONTENT",`第 ${world} 世界 ${tier} 懸賞名稱池異常`,{expected:expected[world][tier],actual});
     if(new Set(actual).size!==5)fail("BOUNTY_NAME_POOL_DUPLICATE",`第 ${world} 世界 ${tier} 懸賞名稱池應有 5 個不同名稱`,actual);
    });
   });
   const galaxy=Object.values(expected[1]).flat(),universe=Object.values(expected[2]).flat();
   if(new Set(galaxy).size!==15||new Set(universe).size!==15)fail("BOUNTY_NAME_WORLD_UNIQUE","每個紀元的 15 個懸賞名稱必須互不重複",{galaxy,universe});
   const overlap=galaxy.filter(name=>universe.includes(name));
   if(overlap.length)fail("BOUNTY_NAME_WORLD_OVERLAP","銀河與宇宙懸賞名稱不得重複",overlap);
  }
 }catch(error){fail("BOUNTY_NAME_POOL_PROBE","懸賞名稱池完整性測試失敗",String(error?.message||error));}
 finally{Math.random=originalRandom;}
 const report={version:VERSION,passed:errors.length===0,errors,checkedAt:Date.now()};
 window.BOUNTY_NAME_POOL_INTEGRITY_VERSION=VERSION;
 window.BOUNTY_NAME_POOL_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Bounty name pool integrity error",errors);
})();
