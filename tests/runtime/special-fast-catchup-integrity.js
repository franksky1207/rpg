const {chromium}=require("playwright");
const assert=require("assert");
const fs=require("fs");

(async()=>{
 const source=fs.readFileSync("specialencounter.js","utf8");
 assert(/SPECIAL_ENCOUNTER_FAST_CATCH_UP_PRESENTATION_VERSION=1/.test(source),"Special fast catch-up presentation contract missing.");
 assert(/if\(!suppressPresentation\)await showSpecialEncounterAlert/.test(source),"Fast catch-up must suppress the special encounter alert.");
 assert(/if\(!suppressPresentation\)await animateSpecialFight/.test(source),"Fast catch-up must suppress the special combat animation.");
 assert(/suppressPresentation\}\);/.test(source),"Frozen presentation policy must be passed into formal special combat.");
 assert(/forcedByBlackMarket\?\["bandit_king"\]/.test(source)&&/consumePendingBlackMarket/.test(source),"Black-market forced special routing must remain intact.");

 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on("pageerror",error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const url=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 try{
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>window.SPECIAL_ENCOUNTER_FAST_CATCH_UP_PRESENTATION_VERSION===1&&typeof window.specialEncounterFastCatchUpActive==="function"&&typeof window.specialEncounterPresentationSuppressed==="function"&&typeof window.specialEncounterWorldForState==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const clone=v=>JSON.parse(JSON.stringify(v));
   const originalState=clone(state),originalCredit=window.backgroundProgressHasCatchUpCredit;
   const make=(count,world)=>{
    const s=newState();
    s.reincarnation.count=count;
    if(world===2){s.secondWorld=createBlankSecondWorldState();s.secondWorld.entered=true;s.level=600;}
    else s.level=100;
    return s;
   };
   const rows=[];
   try{
    window.backgroundProgressHasCatchUpCredit=kind=>kind==="main";
    for(const [label,count,world] of [["w1-first",0,1],["w1-rerun",1,1],["w2-first",0,2],["w2-rerun",1,2]]){
     state=make(count,world);
     rows.push({label,count,world:window.specialEncounterWorldForState(state),catchUp:window.specialEncounterFastCatchUpActive(),suppressed:window.specialEncounterPresentationSuppressed(),forcedSuppressed:window.specialEncounterPresentationSuppressed({suppressPresentation:true})});
    }
    window.backgroundProgressHasCatchUpCredit=()=>false;
    const live={catchUp:window.specialEncounterFastCatchUpActive(),suppressed:window.specialEncounterPresentationSuppressed(),explicit:window.specialEncounterPresentationSuppressed({suppressPresentation:true})};
    return {rows,live};
   }finally{window.backgroundProgressHasCatchUpCredit=originalCredit;state=originalState;}
  });
  assert.deepEqual(report.rows.map(r=>[r.label,r.count,r.world,r.catchUp,r.suppressed,r.forcedSuppressed]),[
   ["w1-first",0,1,true,true,true],
   ["w1-rerun",1,1,true,true,true],
   ["w2-first",0,2,true,true,true],
   ["w2-rerun",1,2,true,true,true]
  ]);
  assert.deepEqual(report.live,{catchUp:false,suppressed:false,explicit:true},"Live special encounters must retain normal presentation unless explicitly suppressed by the frozen catch-up decision.");
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Special encounter fast catch-up integrity passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
