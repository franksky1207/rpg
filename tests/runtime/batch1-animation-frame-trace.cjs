"use strict";
const {chromium}=require("playwright"),fs=require("node:fs"),assert=require("node:assert/strict");
const percent=(xs,p)=>xs.length?xs[Math.min(xs.length-1,Math.ceil(xs.length*p)-1)]:null;
const summary=xs=>{const a=xs.filter(Number.isFinite).sort((x,y)=>x-y);return {count:a.length,p50:percent(a,.5),p95:percent(a,.95),p99:percent(a,.99),max:a.at(-1)??null};};
async function readTrace(session,handle){let text="";for(;;){const out=await session.send("IO.read",{handle,size:1048576});text+=out.data||"";if(out.eof)break;}await session.send("IO.close",{handle});return JSON.parse(text).traceEvents||[];}
(async()=>{
const browser=await chromium.launch({headless:true});const entries=[];
try{
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:"no-preference"});await page.setContent('<!doctype html><html><head></head><body><div id="main"><div class="combat-screen"><div id="combatPlayerCard" class="combatant"><div class="big-hp"><div class="bar"><span id="combatPlayerBar"></span></div></div><span id="combatPlayerHp"></span><span id="combatPlayerDamage"></span></div><div id="combatEnemyCard" class="combatant"><div class="big-hp"><div class="bar"><span id="combatEnemyBar"></span></div></div><span id="combatEnemyHp"></span><span id="combatEnemyDamage"></span></div></div></div></body></html>');
await page.addStyleTag({content:'.combat-screen{position:relative;width:370px;height:460px;display:flex;gap:8px}.combatant{position:relative;width:180px;height:260px;background:#151c2e}.bar{height:16px;background:#30486b}.attacking{animation:Attack .19s}.hit{animation:hitShake .19s}.show{animation:hitShake .19s}@keyframes Attack{to{transform:translateX(8px)}}@keyframes hitShake{to{transform:translateX(3px)}}'});
await page.addScriptTag({path:"combatfx.js"});
for(const mode of ["main-common-presentation","alternate-common-presentation","main-common-presentation-repeat"]){
 await page.evaluate(()=>{window.clearCombatPresentation?.("audit-start");document.querySelectorAll(".combat-fx-pop").forEach(e=>e.remove());});
 const session=await page.context().newCDPSession(page);
 await session.send("Tracing.start",{categories:"devtools.timeline,blink.user_timing",transferMode:"ReturnAsStream"});
 const result=await page.evaluate(async mode=>{
  const events=Array.from({length:12},(_,i)=>({type:"attack",actor:i%2?"enemy":"player",target:i%2?"player":"enemy",damage:9,actualDamage:9,crit:false}));
  const input={events,playerMaxHp:1000,playerStartHp:1000,enemyStartHp:1000,e:{hp:1000}};
  let frames=[],longTasks=[],mutations=0,active=true,last=null,rafId=0;
  const observer=new PerformanceObserver(list=>{longTasks.push(...list.getEntries().map(e=>e.duration));});
  try{observer.observe({entryTypes:["longtask"]});}catch{}
  const mo=new MutationObserver(list=>{mutations+=list.length;});mo.observe(document.querySelector(".combat-screen"),{subtree:true,childList:true,attributes:true,characterData:true});
  function tick(t){if(last!==null)frames.push(t-last);last=t;if(active)rafId=requestAnimationFrame(tick);}
  rafId=requestAnimationFrame(tick);
  const begin=performance.now(),snap=window.prepareCombatPresentation(input);
  await window.animateStructuredCombatPresentation(input,{sleep:()=>new Promise(resolve=>setTimeout(resolve,24)),clearAfter:true});
  await new Promise(resolve=>setTimeout(resolve,800));
  const elapsed=performance.now()-begin;active=false;cancelAnimationFrame(rafId);observer.disconnect();mo.disconnect();
  return {mode,events:events.length,initialToken:snap?.token,elapsedMs:elapsed,frameIntervalsMs:frames,longTasksMs:longTasks,mutationRecords:mutations,finalPresentationActive:window.isCombatPresentationActive(),remainingFloaters:document.querySelectorAll(".combat-fx-pop").length};
 },mode);
 const completed=new Promise(resolve=>session.once("Tracing.tracingComplete",resolve));await session.send("Tracing.end");const handle=(await completed).stream;
 const trace=await readTrace(session,handle);
 const totals={},durations={};
 for(const evt of trace){if(evt.ph!=="X"||!Number.isFinite(evt.dur))continue;if(["Layout","UpdateLayoutTree","RecalculateStyles","Paint","CompositeLayers","FunctionCall"].includes(evt.name)){totals[evt.name]=(totals[evt.name]||0)+1;(durations[evt.name]??=[]).push(evt.dur/1000);}}
 entries.push({mode,events:result.events,elapsedMs:result.elapsedMs,frameInterval:summary(result.frameIntervalsMs),longTask:summary(result.longTasksMs),mutationRecords:result.mutationRecords,traceCounts:totals,traceDurationMs:Object.fromEntries(Object.entries(durations).map(([k,v])=>[k,summary(v)])),finalPresentationActive:result.finalPresentationActive,remainingFloaters:result.remainingFloaters});
 await session.detach();
}
assert.equal(entries.length,3);assert(entries.every(x=>x.events===12&&!x.finalPresentationActive&&x.remainingFloaters===0));assert(entries.every(x=>x.frameInterval.count>15));assert(entries.every(x=>x.traceCounts.Layout!==undefined||x.traceCounts.UpdateLayoutTree!==undefined));
const report={schema:"cw.batch1.animation-frame-trace.v1",method:"isolated identical synthetic twelve-event common combatfx.js presenter; Chromium CDP trace; 390x844 viewport; 24ms injected pacing; NOT full official mode lifecycle or iPhone",sha:process.env.GITHUB_SHA||"local",environment:{browser:"Playwright Chromium",viewport:"390x844"},entries};fs.writeFileSync("batch1-animation-frame-trace.json",JSON.stringify(report,null,2)+"\n");
for(const row of entries)console.log("TRACE",row.mode,"frames",row.frameInterval.count,"p95",row.frameInterval.p95?.toFixed(2),"layout",row.traceCounts.Layout||0,"style",row.traceCounts.UpdateLayoutTree||row.traceCounts.RecalculateStyles||0,"longTasks",row.longTask.count);
}finally{await browser.close();}
})().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
