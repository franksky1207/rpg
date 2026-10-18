const {chromium}=require("playwright");
const assert=require("node:assert/strict");
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const base=new URL("./",process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/").href;
  // Test the real mode script in a fresh browsing context, without game save owners.
  const isolated=await browser.newPage({viewport:{width:390,height:844}});
  await isolated.goto(base+"3d-test/",{waitUntil:"domcontentloaded",timeout:45000});
  await isolated.waitForFunction(()=>window.Civilization3DTestCenter?.version===6,null,{timeout:45000});
  await isolated.evaluate(()=>{
   document.body.replaceChildren();
   window.civilizationAuthSession={user:{id:"opt6-a"}};
   localStorage.setItem("civilization-war-presentation-mode-v1:opt6-a","3d");
   localStorage.setItem("civilization-war-presentation-mode-v1:opt6-b",JSON.stringify({mode:"text"}));
  });
  await isolated.addScriptTag({url:base+"3d-test/mode-foundation.js?opt6=1"});
  const result=await isolated.evaluate(()=>{
   const manager=window.CivilizationPresentationMode;
   const first={mode:manager.currentMode(),saved:manager.accountPreference(),dialogs:document.querySelectorAll("#civilizationModeSelector").length};
   window.civilizationAuthSession={user:{id:"opt6-b"}};
   window.dispatchEvent(new Event("civilization-auth-ready"));
   const second={mode:manager.currentMode(),saved:manager.accountPreference(),dialogs:document.querySelectorAll("#civilizationModeSelector").length};
   manager.registerSwitchBlocker("pending",()=>true);
   const blocked=manager.canSwitch()===false;
   manager.unregisterSwitchBlocker("pending");
   return {first,second,blocked,threeD:manager.selectMode("3d").reason};
  });
  assert.deepEqual(result.first,{mode:"text",saved:"3d",dialogs:0});
  assert.deepEqual(result.second,{mode:"text",saved:"text",dialogs:0});
  assert.equal(result.blocked,true);
  assert.equal(result.threeD,"3d-not-released");
  // The old full-3D chooser is retired, including on first login.
  await isolated.evaluate(()=>{
   window.civilizationAuthSession={user:{id:"opt6-new"}};
   window.dispatchEvent(new Event("civilization-auth-ready"));
   window.dispatchEvent(new Event("civilization-auth-ready"));
  });
  assert.equal(await isolated.locator("#civilizationModeSelector").count(),0);
  const prefs=await isolated.evaluate(()=>{
   const manager=window.CivilizationPresentationMode;
   const initial=manager.combatAnimationEnabled();
   const set=manager.setCombatAnimationEnabled(false);
   const disabled=manager.combatAnimationEnabled();
   window.civilizationAuthSession={user:{id:"opt6-b"}};
   window.dispatchEvent(new Event("civilization-auth-ready"));
   const independent=manager.combatAnimationEnabled();
   window.civilizationAuthSession={user:{id:"opt6-new"}};
   window.dispatchEvent(new Event("civilization-auth-ready"));
   return {initial,set,disabled,independent,restored:manager.combatAnimationEnabled(),html:manager.settingsHtml()};
  });
  assert.equal(prefs.initial,true);
  assert.deepEqual(prefs.set,{ok:true,enabled:false});
  assert.equal(prefs.disabled,false);
  assert.equal(prefs.independent,true);
  assert.equal(prefs.restored,false);
  assert.ok(prefs.html.includes("戰鬥動畫")&&!prefs.html.includes("3D 模式"));
  console.log("PASS presentation preference: legacy compatibility, account isolation, retired modal and persistent animation switch");
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
