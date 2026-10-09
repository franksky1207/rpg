const {chromium}=require("playwright");
const assert=require("assert");

async function productionUrl(base){return base+(base.includes("?")?"&":"?")+"production=1";}
async function waitStory(page){await page.waitForFunction(()=>window.CivilizationScriptLoader?.snapshot?.().groups?.story?.status==="ready",{timeout:30000});}
async function waitGm(page){await page.waitForFunction(()=>window.CivilizationScriptLoader?.snapshot?.().groups?.gm?.status==="ready"&&typeof window.gmLevel==="function"&&typeof window.gmBackgroundBattleEnabled==="function",{timeout:30000});}

(async()=>{
 const browser=await chromium.launch({headless:true});
 const base=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 const url=await productionUrl(base);
 try{
  {
   const context=await browser.newContext();const page=await context.newPage();const pageErrors=[];page.on("pageerror",error=>pageErrors.push(String(error?.stack||error?.message||error)));
   await page.goto(url,{waitUntil:"load",timeout:30000});await waitStory(page);
   const before=await page.evaluate(()=>({loader:window.CivilizationScriptLoader?.snapshot?.()||null,activation:window.CivilizationScriptLoader?.activationSnapshot?.()||null,auth:window.CivilizationScriptLoader?.gmAuthorizationSnapshot?.()||null,gmLevel:typeof window.gmLevel,gmBackground:typeof window.gmBackgroundBattleEnabled,finalIntegrity:!!window.CIVILIZATION_FINAL_INTEGRITY_REPORT,legacyEnsure:typeof window.ensureCivilizationScriptGroup,legacySnapshot:typeof window.civilizationScriptGroupSnapshot}));
   assert.equal(before.loader?.groups?.story?.status,"ready");assert.equal(before.loader?.groups?.gm?.status,"pending");assert.equal(before.loader?.groups?.integrity?.status,"pending");assert.equal(before.gmLevel,"undefined");assert.equal(before.gmBackground,"function");assert.equal(before.finalIntegrity,false);
   assert.equal(before.activation.version,3);assert.equal(before.activation.behaviorVersion,5);assert.equal(before.activation.gm,"account-local-authorization-or-password-modal-on-demand");assert.equal(before.auth.scope,"account-local-runtime");assert.equal(before.auth.authorized,false);assert.equal(before.auth.saveStateAuthoritative,false);assert.equal(before.legacyEnsure,"function");assert.equal(before.legacySnapshot,"function");
   await page.evaluate(()=>document.getElementById("passwordModal")?.classList.add("open"));await waitGm(page);
   const afterGm=await page.evaluate(()=>window.CivilizationScriptLoader.snapshot());assert.equal(afterGm.groups.gm.status,"ready");assert.equal(afterGm.groups.integrity.status,"pending");
   await page.evaluate(()=>window.CivilizationScriptLoader.ensure("integrity"));await page.waitForFunction(()=>window.CivilizationScriptLoader?.snapshot?.().groups?.integrity?.status==="ready"&&!!window.CIVILIZATION_FINAL_INTEGRITY_REPORT,{timeout:30000});
   const afterIntegrity=await page.evaluate(()=>({loader:window.CivilizationScriptLoader.snapshot(),final:window.CIVILIZATION_FINAL_INTEGRITY_REPORT||null}));assert.equal(afterIntegrity.loader.groups.integrity.status,"ready");assert.equal(afterIntegrity.final?.passed,true);assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));await context.close();
  }

  {
   const context=await browser.newContext();const page=await context.newPage();await page.goto(url,{waitUntil:"load",timeout:30000});await waitStory(page);
   const legacy=await page.evaluate(()=>{state.gm=true;const base=window.save?.__saveHookBase||null;if(typeof base==="function")base(false);return state.gm;});assert.equal(legacy,true);
   await page.reload({waitUntil:"load",timeout:30000});await waitStory(page);await page.waitForTimeout(250);
   const ignored=await page.evaluate(()=>({gm:state.gm,auth:window.CivilizationScriptLoader.gmAuthorizationSnapshot(),gmStatus:window.CivilizationScriptLoader.snapshot().groups.gm.status}));assert.equal(ignored.gm,false,"legacy save gm flag should be stripped");assert.equal(ignored.auth.authorized,false,"save gm flag must not authorize runtime");assert.equal(ignored.gmStatus,"pending","legacy save gm flag must not auto-load GM");
   // Browser fixture supplies a synthetic signed-in user; the GM grant remains scoped to it.
   await page.evaluate(()=>{window.civilizationAuthSession={user:{id:"test-gm-account"}};});
   await page.evaluate(()=>window.CivilizationScriptLoader.authorizeGmRuntime());await waitGm(page);
   const authorized=await page.evaluate(()=>({auth:window.CivilizationScriptLoader.gmAuthorizationSnapshot(),gm:state.gm,hook:window.GM_RUNTIME_SAVE_BOUNDARY_INSTALLED,before:window.getBeforeSaveHookIds?.(),settlement:window.getSaveSettlementHookIds?.()}));assert.equal(authorized.auth.authorized,true);assert.equal(authorized.auth.scope,"account-local-runtime");assert.equal(authorized.gm,true,"live runtime GM flag should drive existing UI");assert.equal(authorized.hook,true);assert.ok(authorized.before.includes("gm-runtime-authorization-v1"));assert.ok(authorized.settlement.includes("gm-runtime-authorization-v1"));
   const boundary=await page.evaluate(()=>{save(false);let persistedGm=null;for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i),raw=localStorage.getItem(key);try{const obj=JSON.parse(raw);if(obj&&typeof obj==="object"&&Number.isFinite(Number(obj.saveVersion))&&Object.prototype.hasOwnProperty.call(obj,"gm")){persistedGm=obj.gm;break;}}catch(_){}}return {live:state.gm,persistedGm};});assert.equal(boundary.live,true,"save settlement must restore live GM runtime flag");assert.equal(boundary.persistedGm,false,"formal save must not persist GM authorization");
   await page.addInitScript(()=>{try{Object.defineProperty(window,"civilizationAuthSession",{configurable:true,writable:true,value:{user:{id:"test-gm-account"}}});}catch(_){}});
   await page.reload({waitUntil:"load",timeout:30000});
   await page.evaluate(()=>{window.civilizationAuthSession={user:{id:"test-gm-account"}};window.dispatchEvent(new CustomEvent("civilization-auth-ready",{detail:{session:window.civilizationAuthSession}}));});
   await waitGm(page);
   const restored=await page.evaluate(()=>({gm:state.gm,auth:window.CivilizationScriptLoader.gmAuthorizationSnapshot(),backgroundOwner:typeof window.gmBackgroundBattleEnabled}));assert.equal(restored.gm,true,"browser-local authorization should restore live GM UI flag");assert.equal(restored.auth.authorized,true);assert.equal(restored.backgroundOwner,"function");await context.close();
  }

  {
   const context=await browser.newContext();const page=await context.newPage();await page.goto(url,{waitUntil:"load",timeout:30000});await waitStory(page);
   const retry=await page.evaluate(async()=>{const node=Array.from(document.querySelectorAll('script[type="application/x-civilization-deferred"][data-load-group="gm"][data-src]'))[0],original=node.dataset.src;node.dataset.src="__missing-gm-retry-probe__.js";let failed=false;try{await window.CivilizationScriptLoader.ensure("gm");}catch(_){failed=true;}const failedSnap=window.CivilizationScriptLoader.snapshot().groups.gm;node.dataset.src=original;const done=await window.CivilizationScriptLoader.ensure("gm");return {failed,failedSnap,done,status:window.CivilizationScriptLoader.snapshot().groups.gm.status,gmLevel:typeof window.gmLevel};});
   assert.equal(retry.failed,true,"first GM lazy load should fail with injected missing script");assert.equal(retry.failedSnap.status,"failed");assert.equal(retry.failedSnap.retryable,true);assert.equal(retry.status,"ready","second ensure must retry instead of reusing rejected promise");assert.equal(retry.gmLevel,"function");await context.close();
  }

  console.log("Code cleanup Batch7 lazy-loading + Batch3 runtime GM authorization/retry integrity passed.");
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});