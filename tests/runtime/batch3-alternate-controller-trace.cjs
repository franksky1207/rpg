"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),{chromium}=require("playwright");
const input=()=>({events:Array.from({length:24},(_,i)=>({type:"attack",actor:i%2?"enemy":"player",target:i%2?"player":"enemy",damage:1,actualDamage:1})),playerMaxHp:1000,playerStartHp:1000,e:{hp:1000},enemyStartHp:1000});
function makeMarkup(extra=""){return '<div class="combat-screen '+extra+'"><div class="combat-head">戰鬥</div><div class="combat-arena"><div id="combatPlayerCard" class="combatant player"><div class="combat-damage" id="combatPlayerDamage"></div><h2>角色</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp"></span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:100%"></span></div></div></div><div class="combat-vs">VS</div><div id="combatEnemyCard" class="combatant enemy"><div class="combat-damage" id="combatEnemyDamage"></div><h2>敵人</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp"></span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div id="combatMessage"></div></div>';}
(async()=>{
const browser=await chromium.launch({headless:true});let rows=[];
try{
 for(const mode of ["main","alternate"]){
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:"no-preference"});
  await page.setContent('<!doctype html><html lang="zh-Hant"><body><div id="main"></div></body></html>');
  for(const path of ["style.css","battleflow.css","alternateuniverse.css"])await page.addStyleTag({path});
  await page.addScriptTag({path:"combatfx.js"});
  if(mode==="alternate"){
   await page.evaluate(()=>{
    window.state={level:1000,playerName:"測試角色",attempt:{depth:1,attemptId:"test",traits:["strong","ferocious","hard","swift","deadly","berserk","giant"]}};
    window.alternateUniverseProgressionSnapshot=()=>({unlocked:true,nextDepth:1,maxDepth:1000,deepestCleared:0});
    window.alternateUniverseDepthInfo=()=>({depth:1,universeName:"測試異宇宙",stageName:"測試層域",universeNumber:1});
    window.alternateUniverseEnemyStats=()=>({hp:1000,atk:100,def:100});
    window.alternateUniverseFailureStatus=()=>({failures:0,failuresRemainingBeforeLock:10,limit:10});
    window.alternateUniverseActiveAttempt=()=>window.state.attempt;
    window.alternateUniverseCurrentAttemptEncounter=()=>({hp:1000});
    window.playerCombatStats=()=>({hp:1000});
    window.MONSTER_TRAITS=Object.fromEntries(["strong","ferocious","hard","swift","deadly","berserk","giant"].map(k=>[k,{name:k,desc:"測試"}]));
    window.mainBattlePresentationSleep=()=>Promise.resolve();
   });
   await page.addScriptTag({path:"alternateuniverseui.js"});
  }else{
   await page.evaluate(html=>{document.querySelector("#main").innerHTML=html;},makeMarkup());
  }
  const session=await page.context().newCDPSession(page);
  await session.send("Tracing.start",{categories:"devtools.timeline,blink.user_timing",transferMode:"ReturnAsStream"});
  const metrics=await page.evaluate(async ({mode,input})=>{
   let tasks=[],mutations=0,frames=[],prev=null,active=true;
   const perf=new PerformanceObserver(l=>tasks.push(...l.getEntries().map(x=>x.duration)));
   try{perf.observe({entryTypes:["longtask"]});}catch{}
   const observer=new MutationObserver(l=>mutations+=l.length);
   observer.observe(document.querySelector("#main"),{subtree:true,childList:true,attributes:true,characterData:true});
   function tick(t){if(prev!==null)frames.push(t-prev);prev=t;if(active)requestAnimationFrame(tick);}
   requestAnimationFrame(tick);
   let hadBattle=false;
   let ok=true;
   if(mode==="alternate"){
    window.runAlternateUniverseCombat=()=>{
     const owner=JSON.parse(JSON.stringify(input));
     window.prepareCombatPresentation(owner);
     hadBattle=!!document.querySelector(".au-combat-screen");
     return {ok:true,combat:owner,settlementReady:false};
    };
    ok=await window.challengeAlternateUniverseFormal();
   }else{
    window.prepareCombatPresentation(input);
    hadBattle=!!document.querySelector(".combat-screen");
    await window.animateStructuredCombatPresentation(input,{sleep:()=>Promise.resolve(),clearAfter:true});
   }
   await new Promise(r=>setTimeout(r,800));active=false;observer.disconnect();perf.disconnect();
   return {mode,ok,hadBattle,frames,mutations,tasks,activePresentation:window.isCombatPresentationActive(),remainingFloaters:document.querySelectorAll(".combat-fx-pop").length,returnedToSelection:mode!=="alternate"||!!document.querySelector(".alternate-universe-page")};
  },{mode,input:input()});
  const done=new Promise(resolve=>session.once("Tracing.tracingComplete",resolve));await session.send("Tracing.end");let {stream}=await done;let trace="";for(;;){const x=await session.send("IO.read",{handle:stream,size:1048576});trace+=x.data||"";if(x.eof)break;}await session.send("IO.close",{handle:stream});
  const counts={};for(const e of JSON.parse(trace).traceEvents||[]){if(e.ph==="X"&&["Layout","UpdateLayoutTree","Paint","RecalculateStyles"].includes(e.name))counts[e.name]=(counts[e.name]||0)+1;}
  const percentile=(arr,p)=>{if(!arr.length)return null;const a=arr.slice().sort((x,y)=>x-y);return a[Math.min(a.length-1,Math.ceil(a.length*p)-1)];};
  rows.push({mode,ok:metrics.ok,hadBattle:metrics.hadBattle,returnedToSelection:metrics.returnedToSelection,remainingFloaters:metrics.remainingFloaters,activePresentation:metrics.activePresentation,frameCount:metrics.frames.length,p95FrameMs:percentile(metrics.frames,.95),p99FrameMs:percentile(metrics.frames,.99),longTaskCount:metrics.tasks.length,longTaskMaxMs:metrics.tasks.length?Math.max(...metrics.tasks):0,mutations:metrics.mutations,traceCounts:counts});
  await session.detach();await page.close();
 }
 assert(rows.every(x=>x.ok&&x.hadBattle&&x.returnedToSelection&&!x.activePresentation&&x.remainingFloaters===0),JSON.stringify(rows));
 assert(rows.every(x=>x.frameCount>15),JSON.stringify(rows));
 fs.writeFileSync("batch3-alternate-ui-controller-trace.json",JSON.stringify({schema:"cw.batch3.alternate-controller-trace.v1",method:"Real alternateuniverseui.js controller and combatPageHtml + common combatfx.js, BUT owner input/data/settlement mocked, identical synthetic events; 390x844 Chromium; not the end-to-end official combat owner or iPhone.",sha:process.env.GITHUB_SHA||"local",rows},null,2)+"\n");
 console.log("BATCH3_ALTERNATE_CONTROLLER_TRACE_PASS",JSON.stringify(rows));
}finally{await browser.close();}
})().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
