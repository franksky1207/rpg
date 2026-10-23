"use strict";
// Real index and formal lexical state. All accounts/cloud responses are local fixtures.
const {chromium}=require("playwright"),assert=require("node:assert/strict"),fs=require("node:fs");
const {sdk,finishIntro}=require("../equipment-formal/helpers.cjs");
const base=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined)}),reports=[];
 try{for(const viewport of [{width:1365,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport}),errors=[];page.on("pageerror",e=>errors.push(String(e)));
  await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js",r=>r.fulfill({contentType:"text/javascript",body:sdk}));
  await page.goto(base,{waitUntil:"load"});await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==="ready",null,{timeout:60000});await finishIntro(page);
  const report=await page.evaluate(()=>{
   const c=CivilizationEraAppearanceContract,mode=CivilizationPresentationMode,key="civilization-war-era-appearance-v1:",owner="civilization_frontline_local_owner_v1";
   const id=c.accountId(),result={lexicalStateOnly:window.state===undefined};
   state=newState();state.introSeen=true;localStorage.setItem(owner,id);
   state.reincarnation.count=0;
   result.locked=c.canChoose()===false&&c.select("higher").ok===false;
   result.worlds=[];
   for(const world of [1,2,3]){
    state.secondWorld.entered=world>=2;state.thirdWorld.entered=world===3;
    result.worlds.push({world,id:c.resolve({world:currentWorldPhase()}).visualId,html:mode.settingsHtml()});
   }
   state.reincarnation.count=1;result.firstDefault=c.choice();
   const before=JSON.stringify(state),saved=localStorage.getItem("frank_text_rpg_save");
   result.selected=c.select("universe");
   result.noStateWrites=before===JSON.stringify(state)&&saved===localStorage.getItem("frank_text_rpg_save");
   result.gear=[];
   for(const world of [1,2,3]){state.equipment.armor={name:"mixed",world,q:5};state.equipment.weapon={name:"mixed",world:4-world,q:0};result.gear.push(c.resolve({world:1}).visualId);}
   state.reincarnation.count=7;result.repeat=c.choice();
   window.civilizationAuthSession={user:{id:"batch7-other"}};window.dispatchEvent(new Event("civilization-auth-ready"));
   result.mismatch={locked:!c.canChoose(),selected:c.select("galaxy").ok,choice:c.choice()};
   // The same handoff as the cloud owner: only after the local owner is bound
   // to the downloaded account may its normalized reincarnation count unlock.
   localStorage.setItem(owner,"batch7-other");result.otherDefault=c.choice();c.select("galaxy");
   result.otherChoice=c.choice();
   window.dispatchEvent(new Event("civilization-auth-signed-out"));result.signoutLocked=!c.canChoose();
   window.civilizationAuthSession={user:{id}};localStorage.setItem(owner,id);window.dispatchEvent(new Event("civilization-auth-ready"));
   result.restored=c.choice();
   const imported=newState();imported.saveVersion=17;imported.reincarnation.count=4;
   state=migrateSave(JSON.parse(JSON.stringify(imported)),17,null,imported);result.imported={count:c.reincarnationCount(),choice:c.choice(),version:state.saveVersion};
   const legacy=newState();legacy.saveVersion=16;legacy.reincarnation.count=9;
   state=migrateSave(JSON.parse(JSON.stringify(legacy)),16,null,legacy);result.legacyLocked=!c.canChoose();
   state=newState();state.reincarnation.count=3;
   result.noPreferenceInSave=!JSON.stringify(state).includes(key)&&!Object.keys(state).some(k=>/appearance/i.test(k));
   document.getElementById("main").innerHTML='<div id="batch7-settings">'+mode.settingsHtml()+'</div>';
   const select=document.getElementById("civilizationEraAppearanceChoice"),rect=select.getBoundingClientRect();
   result.selectorFits=rect.left>=0&&rect.right<=innerWidth;result.releasedArt=mode.settingsHtml().includes("三套角色外觀只影響戰鬥動畫");
   return result;
  });
  assert.equal(report.lexicalStateOnly,true,"Regression must use engine's lexical state, not window.state");assert.ok(report.locked);
  for(const [i,id,label] of [[0,"galaxy","銀河戰甲"],[1,"universe","宇宙戰甲"],[2,"higher","高維戰甲"]]){assert.equal(report.worlds[i].id,id);assert.ok(report.worlds[i].html.includes("目前依所在紀元顯示："+label));}
  assert.equal(report.firstDefault,"higher");assert.equal(report.selected.ok,true);assert.ok(report.noStateWrites);assert.deepEqual(report.gear,["universe","universe","universe"]);assert.equal(report.repeat,"universe");
  assert.deepEqual(report.mismatch,{locked:true,selected:false,choice:null});assert.equal(report.otherDefault,"higher");assert.equal(report.otherChoice,"galaxy");assert.ok(report.signoutLocked);assert.equal(report.restored,"universe");
  assert.deepEqual(report.imported,{count:4,choice:"universe",version:18});assert.ok(report.legacyLocked&&report.noPreferenceInSave&&report.selectorFits&&report.releasedArt);
  await page.selectOption("#civilizationEraAppearanceChoice","galaxy");assert.equal(await page.evaluate(()=>CivilizationEraAppearanceContract.choice()),"galaxy");
  const cloudUpload=await page.evaluate(async()=>{
   const before=CivilizationEraAppearanceContract.choice();let payload=null;
   const oldClient=civilizationAuth.getClient,oldConfirm=window.confirm;
   const client={from:()=>({select(){return this;},eq(){return this;},async maybeSingle(){return {data:null,error:null};},upsert(row){payload=row;return this;},async single(){return {data:{updated_at:payload.updatedAt,level:state.level,exp:state.exp,revision:1},error:null};}})};
   civilizationAuth.getClient=()=>client;window.confirm=()=>true;
   try{await civilizationCloudSave.upload();}finally{civilizationAuth.getClient=oldClient;window.confirm=oldConfirm;}
   return {called:!!payload,version:payload?.save_data?.saveVersion,preferenceUnchanged:before===CivilizationEraAppearanceContract.choice(),containsAppearance:JSON.stringify(payload).includes("civilization-war-era-appearance")};
  });
  assert.deepEqual(cloudUpload,{called:true,version:18,preferenceUnchanged:true,containsAppearance:false});
  await page.reload({waitUntil:"load"});await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==="ready");
  assert.equal(await page.evaluate(()=>{state.reincarnation.count=2;return CivilizationEraAppearanceContract.choice();}),"galaxy");
  // Execute the actual download/migrate/save/reload owner with a local service
  // fixture. This proves compatibility, not a real Supabase credential/write.
  const reloaded=page.waitForNavigation({waitUntil:"load"});
  await page.evaluate(async()=>{
   const downloaded=newState();downloaded.saveVersion=17;downloaded.introSeen=true;downloaded.reincarnation.count=5;
   civilizationAuth.getClient=()=>({from:()=>({select(){return this;},eq(){return this;},async maybeSingle(){return {data:{save_data:downloaded,updated_at:new Date().toISOString(),level:1,exp:0,revision:1},error:null};}})});
   window.confirm=()=>true;await civilizationCloudSave.download();
  });
  await reloaded;await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==="ready");
  const cloudDownload=await page.evaluate(()=>({count:CivilizationEraAppearanceContract.reincarnationCount(),choice:CivilizationEraAppearanceContract.choice(),version:state.saveVersion}));
  assert.deepEqual(cloudDownload,{count:5,choice:"galaxy",version:18});
  assert.deepEqual(errors,[]);reports.push({viewport,...report,cloudUpload,cloudDownload,errors});await page.close();
 }}finally{await browser.close();}
 fs.writeFileSync("/tmp/batch7-appearance-browser.json",JSON.stringify({realDevice:false,realCloudAccount:false,reports},null,2)+"\n");console.log("PASS Batch7 real-page lexical state, epochs, historical/current import, account owner isolation, signout, reload and mobile settings");
})().catch(e=>{console.error(e);process.exitCode=1;});
