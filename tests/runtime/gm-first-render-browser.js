const {chromium}=require("playwright");
const assert=require("assert");

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on("pageerror",error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const url=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 try{
  await page.addInitScript(()=>{
   localStorage.setItem("civilization-war-gm-authorized-v1","1");
   const descriptor=Object.getOwnPropertyDescriptor(Element.prototype,"innerHTML");
   if(!descriptor?.get||!descriptor?.set)return;
   Object.defineProperty(Element.prototype,"innerHTML",{
    configurable:descriptor.configurable,
    enumerable:descriptor.enumerable,
    get:descriptor.get,
    set(value){
     if(this.id==="main"&&window.__gmFirstMainRender===undefined){
      const snap=typeof window.gmRuntimeAuthorizationSnapshot==="function"?window.gmRuntimeAuthorizationSnapshot():null;
      window.__gmFirstMainRender={
       authorized:snap?.authorized===true,
       runtimeFlag:snap?.runtimeFlag===true,
       coreVersion:window.GM_RUNTIME_AUTHORIZATION_CORE_VERSION||null,
       earlyRestoreVersion:window.GM_RUNTIME_EARLY_RESTORE_VERSION||null,
       htmlLength:String(value??"").length
      };
     }
     return descriptor.set.call(this,value);
    }
   });
  });
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>window.__gmFirstMainRender!==undefined,{timeout:30000});
  const first=await page.evaluate(()=>window.__gmFirstMainRender);
  assert.equal(first?.authorized,true,"第一次 main render 前 browser-local GM 授權尚未恢復。");
  assert.equal(first?.runtimeFlag,true,"第一次 main render 時 runtime GM flag 必須已為 true。");
  assert.equal(first?.coreVersion,1,"GM runtime authorization startup core V1 未載入。");
  assert.equal(first?.earlyRestoreVersion,2,"GM first-render early restore 必須為 V2。");
  assert.ok(Number(first?.htmlLength)>0,"第一次 main render 不應為空內容。");
  assert.deepEqual(pageErrors,[],"GM first-render browser pageerror：\n"+pageErrors.join("\n\n"));
  console.log("GM first-render browser integrity passed:",JSON.stringify(first));
 }finally{
  await page.evaluate(()=>{try{localStorage.removeItem("civilization-war-gm-authorized-v1");}catch(_){};}).catch(()=>{});
  await browser.close();
 }
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
