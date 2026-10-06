const {chromium}=require("playwright");
const assert=require("assert");

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on("pageerror",error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const url=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 try{
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>
   window.PLAYER_TITLE_INTEGRITY_VERSION===22&&
   window.PLAYER_TITLE_ALTERNATE_UNIVERSE_CLOSURE_VERSION===1&&
   window.PLAYER_TITLE_INTEGRITY?.passed===true&&
   window.GM_ALTERNATE_UNIVERSE_MANAGEMENT_VERSION===3&&
   window.GM_PLAYER_TITLE_PREVIEW_VERSION===11&&
   window.GM_PLAYER_TITLE_PREVIEW_REDUNDANT_AU_QUICK_RETIRED_VERSION===1&&
   window.GM_ALTERNATE_UNIVERSE_BENCHMARK_VERSION===2,
   {timeout:30000}
  );

  const report=await page.evaluate(()=>{
   const clone=value=>JSON.parse(JSON.stringify(value));
   const defs=Array.from(window.PLAYER_TITLE_DEFS||[]);
   const au=Array.from(window.ALTERNATE_UNIVERSE_PLAYER_TITLE_DEFS||[]);
   const mirror=Array.from(window.MIRROR_PLAYER_TITLE_DEFS||[]);
   const names=["異界凌越","萬界破境","異律掌御","諸宇錯序","萬律凌駕","諸界超脫","萬宇無疆","諸界歸一","宇外凌絕","宇外無極"];

   const baseTarget=()=>({
    saveVersion:17,playerName:"Closure",
    reincarnation:{count:2,breakthrough:{permanent:20,milestoneLifeId:2,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:680,activeAttempt:null,lifeFailures:{lifeId:2,failures:{}}}},
    marks:{entries:{}},secondWorld:{entered:false,calamities:[]},thirdWorld:{entered:false,bosses:[]},dungeon:{mirror:{history:{bestWins:0}}},
    titles:{version:1,unlocked:[],equipped:null,pendingNotice:null}
   });

   const normal=baseTarget();
   window.normalizePlayerTitleState(normal);
   const normalizedIds=normal.titles.unlocked.filter(id=>id.startsWith("alternate-universe-title-"));
   const equipOk=window.equipPlayerTitle(au[5].id,normal);
   const grant=window.grantPlayerTitlesForAlternateUniverseDepth(700,normal,{previousDepth:680});
   normal.reincarnation.alternateUniverse.deepestCleared=50;
   window.normalizePlayerTitleState(normal);
   const permanentHonor={ids:normal.titles.unlocked.filter(id=>id.startsWith("alternate-universe-title-")),equipped:normal.titles.equipped,pending:normal.titles.pendingNotice};

   const life=baseTarget();
   window.normalizePlayerTitleState(life);
   window.equipPlayerTitle(au[5].id,life);
   life.titles.pendingNotice=au[5].id;
   const beforeLifeTitles=clone(life.titles);
   life.reincarnation.count=3;
   const lifeReport=window.reconcileReincarnationLifeChange(life,2);
   window.normalizePlayerTitleState(life);
   const afterLifeTitles=clone(life.titles);

   const gm=baseTarget();
   gm.reincarnation.alternateUniverse.deepestCleared=50;
   gm.titles={version:1,unlocked:[],equipped:null,pendingNotice:null};
   const up=window.gmApplyFormalAlternateUniverseProgress({deepestCleared:850},gm);
   const upSnapshot=window.gmAlternateUniverseFormalSnapshot(gm);
   const down=window.gmApplyFormalAlternateUniverseProgress({deepestCleared:25},gm);
   const downSnapshot=window.gmAlternateUniverseFormalSnapshot(gm);

   const formalBefore=JSON.stringify(state);
   const saveBefore=typeof localStorage!=="undefined"?localStorage.getItem(SAVE_KEY):null;
   const dropdownSelections=au.map(def=>window.gmSetPlayerTitlePreviewTier(def.id));
   const previewHtml=window.gmPlayerTitlePreviewHtml();
   const formalAfter=JSON.stringify(state);
   const saveAfter=typeof localStorage!=="undefined"?localStorage.getItem(SAVE_KEY):null;

   const cssLink=document.querySelector('link[data-player-title-alternate-universe-owner="1"]');
   const cssReady=!!cssLink&&String(cssLink.getAttribute("href")||"").includes("playertitlesalternateuniverse.css");
   const rendered=au.map(def=>window.playerTitleHtml(def.id));

   const fpBefore=window.gmAlternateUniverseBenchmarkFormalStateFingerprint(state);
   const fpAfter=window.gmAlternateUniverseBenchmarkFormalStateFingerprint(state);

   return {
    versions:{
     title:window.PLAYER_TITLE_INTEGRITY_VERSION,
     closure:window.PLAYER_TITLE_ALTERNATE_UNIVERSE_CLOSURE_VERSION,
     gmManage:window.GM_ALTERNATE_UNIVERSE_MANAGEMENT_VERSION,
     gmPreview:window.GM_PLAYER_TITLE_PREVIEW_VERSION,
     benchmark:window.GM_ALTERNATE_UNIVERSE_BENCHMARK_VERSION
    },
    defs:defs.map(def=>({id:def.id,name:def.name,series:def.series,order:def.order,tier:def.tier,depthThreshold:def.depthThreshold,mirrorWins:def.mirrorWins})),
    au:au.map(def=>({id:def.id,name:def.name,tier:def.tier,depthThreshold:def.depthThreshold,order:def.order})),
    mirror:mirror.map(def=>({id:def.id,order:def.order,mirrorWins:def.mirrorWins})),
    names,normalizedIds,equipOk,grant,permanentHonor,
    life:{report:lifeReport,before:beforeLifeTitles,after:afterLifeTitles,deepest:life.reincarnation.alternateUniverse.deepestCleared},
    gm:{up,upSnapshot,down,downSnapshot},
    sandbox:{dropdownSelections,previewHtml,formalStable:formalBefore===formalAfter,saveStable:saveBefore===saveAfter},
    cssReady,rendered,
    benchmark:{guardVersion:window.GM_ALTERNATE_UNIVERSE_BENCHMARK_FORMAL_STATE_GUARD_VERSION,fingerprintStable:fpBefore.fingerprint===fpAfter.fingerprint}
   };
  });

  assert.deepEqual(report.versions,{title:22,closure:1,gmManage:3,gmPreview:11,benchmark:2});
  assert.equal(report.defs.length,46,"正式稱號 catalog 必須維持 46 個。");
  assert.ok(report.defs.slice(0,10).every(def=>def.series==="calamity"));
  assert.ok(report.defs.slice(10,20).every(def=>def.series==="universe-calamity"));
  assert.ok(report.defs.slice(20,30).every(def=>def.series==="higher-dimensional"));
  assert.ok(report.defs.slice(30,40).every(def=>def.series==="alternate-universe"));
  assert.ok(report.defs.slice(40).every(def=>def.series==="mirror"),"鏡像稱號必須永遠是最後一組。");
  assert.deepEqual(report.au.map(def=>def.name),report.names);
  report.au.forEach((def,index)=>{
   assert.equal(def.tier,index+1);
   assert.equal(def.depthThreshold,(index+1)*100);
   assert.equal(def.order,31+index);
   assert.equal(def.name.length,4);
  });
  report.mirror.forEach((def,index)=>assert.equal(def.order,41+index));

  assert.deepEqual(report.normalizedIds,report.au.slice(0,6).map(def=>def.id),"680 層 normalization 應靜默補齊前6階。");
  assert.equal(report.equipOk,true);
  assert.equal(report.grant.noticeTitle.id,report.au[6].id);
  assert.deepEqual(report.permanentHonor.ids,report.au.slice(0,7).map(def=>def.id),"降低 AU 進度不得回收已達成稱號。");
  assert.equal(report.permanentHonor.equipped,report.au[5].id);
  assert.equal(report.permanentHonor.pending,report.au[6].id);

  assert.equal(report.life.report.ok,true);
  assert.equal(report.life.report.changed,true);
  assert.equal(report.life.deepest,680,"轉生生命週期切換必須保留 AU 永久最深進度。");
  assert.deepEqual(report.life.after,report.life.before,"AU 稱號 unlocked/equipped/pendingNotice 必須跨轉生保留。");

  assert.equal(report.gm.up.ok,true);
  assert.equal(report.gm.upSnapshot.deepestCleared,850);
  assert.equal(report.gm.upSnapshot.title.acquiredCount,8,"GM 設 850 層應同步補齊前8階稱號。");
  assert.equal(report.gm.upSnapshot.title.current.name,"諸界歸一");
  assert.equal(report.gm.down.ok,true);
  assert.equal(report.gm.downSnapshot.deepestCleared,25);
  assert.equal(report.gm.downSnapshot.title.acquiredCount,8,"GM 降低進度不得回收正式異宇宙稱號。");
  assert.equal(report.gm.down.titleRetainedOnDecrease,true);

  assert.deepEqual(report.sandbox.dropdownSelections,report.au.map(def=>def.id),"GM 唯一稱號下拉選單應可逐階切換10個 AU 稱號。");
  assert.ok(!report.sandbox.previewHtml.includes("異宇宙 1～10 階快速視覺測試"),"GM 稱號預覽不得保留重複的異宇宙快速按鈕區。");
  assert.ok(!report.sandbox.previewHtml.includes("純沙盒預覽：直接切換正式異宇宙稱號 renderer"));
  assert.equal(report.sandbox.formalStable,true,"GM 視覺測試不得修改正式 state。");
  assert.equal(report.sandbox.saveStable,true,"GM 視覺測試不得寫入存檔。");

  assert.equal(report.cssReady,true);
  report.rendered.forEach((html,index)=>{
   assert.ok(html.includes("player-title--alternate-universe"));
   assert.ok(html.includes(`player-title--alternate-universe-${index+1}`));
   assert.ok(!html.includes("player-title--tier-"));
  });
  assert.equal(report.benchmark.guardVersion,1);
  assert.equal(report.benchmark.fingerprintStable,true);
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));

  console.log("Alternate Universe title Batch4 closure passed:",JSON.stringify({
   versions:report.versions,
   catalog:report.defs.length,
   auNames:report.au.map(def=>def.name),
   permanentHonor:report.permanentHonor,
   reincarnation:{deepest:report.life.deepest,titlesPreserved:JSON.stringify(report.life.after)===JSON.stringify(report.life.before)},
   gm:{up:report.gm.upSnapshot.title,down:report.gm.downSnapshot.title},
   sandbox:{formalStable:report.sandbox.formalStable,saveStable:report.sandbox.saveStable},
   benchmark:report.benchmark
  }));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
