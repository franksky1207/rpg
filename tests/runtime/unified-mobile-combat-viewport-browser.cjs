"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),{chromium}=require("playwright");
const css=fs.readFileSync("battle-mobile-viewport.css","utf8")+"\n"+fs.readFileSync("3d-test/formal-player-sprites.css","utf8");
const contexts=["galaxy-bounty","universe-bounty","higher-bounty","galaxy-arena","universe-arena","higher-arena","galaxy-main","universe-main","higher-main","galaxy-calamity","universe-calamity","void","mirror","alternate-universe"];
function fixture(name){const stop='<div class="combat-viewport-stop"><button data-combat-action="stop-continuous" style="padding:10px 20px;background:#a22" onclick="window.stops++">停止連續挑戰</button></div>',external=/calamity|void/.test(name),hasStop=!/mirror|alternate/.test(name);
return '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0;background:#141821;color:white}.spacer{height:1000px}#main{padding:0 12px}.combat-screen{display:flex;flex-direction:column;gap:10px}.combat-head{order:-4}.formal-b-shared-stage{min-height:135px}.combat-arena{min-height:120px}</style><div class="spacer"></div><main id="main">'+(external?'<div class="calamity-battle-shell">'+stop:'')+'<section class="combat-screen formal-b-shared-layout formal-b-stage-pending"><div class="combat-head">戰鬥</div>'+(external||!hasStop?'':stop)+'<div class="formal-b-shared-stage" hidden></div><div class="combat-arena">HP</div></section>'+(external?'</div>':'')+'</main><div class="spacer"></div>';}
const settle=p=>p.evaluate(()=>new Promise(r=>{let n=0;const tick=()=>++n<12?requestAnimationFrame(tick):r();requestAnimationFrame(tick);}));
async function measure(p){return p.evaluate(()=>{const r=document.querySelector('.formal-b-shared-stage').getBoundingClientRect(),b=document.querySelector('[data-combat-action="stop-continuous"]')?.getBoundingClientRect();return {y:scrollY,height:r.height,delta:r.top+r.height/2-(visualViewport?.offsetTop||0)-(visualViewport?.height||innerHeight)/2,above:!b||b.bottom<=r.top+2,count:document.querySelectorAll('[data-combat-action="stop-continuous"]').length};});}
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});try{const evidence=[];
for(const size of [{width:390,height:844,mobile:true},{width:844,height:390,mobile:true},{width:1200,height:900,mobile:false}])for(const name of contexts){
 const page=await browser.newPage({viewport:{width:size.width,height:size.height},isMobile:size.mobile,hasTouch:size.mobile});try{
 await page.setContent(fixture(name));await page.addStyleTag({content:css});await page.evaluate(()=>{window.stops=0;window.originalStop=document.querySelector('[data-combat-action="stop-continuous"]');window.originalStyle=originalStop?.getAttribute('style');});
 await page.addScriptTag({path:"combat-viewport-coordinator.js"});await settle(page);const loading=await measure(page);assert.equal(loading.y,0,'no loading jump '+name);assert(loading.height>=135,'stable pending space');
 await page.evaluate(()=>{document.querySelector('.formal-b-stage-pending').classList.remove('formal-b-stage-pending');document.querySelector('.formal-b-shared-stage').hidden=false;});await settle(page);
 const ready=await measure(page);assert.equal(ready.height,loading.height,'Ready preserves stage space');assert.equal(ready.count,/mirror|alternate/.test(name)?0:1);assert(ready.above,name+' stop above stage '+JSON.stringify(ready));
 assert(await page.evaluate(()=>!originalStop||originalStop===document.querySelector('[data-combat-action="stop-continuous"]')&&originalStyle===originalStop.getAttribute('style')),'no moved/replaced/restyled button');
 if(ready.count){await page.evaluate(()=>originalStop.click());assert.equal(await page.evaluate(()=>stops),1,'original handler');}
 if(size.mobile){assert(ready.y>0,name+' scroll expected');assert(Math.abs(ready.delta)<3,name+' stage center '+JSON.stringify(ready));}else assert.equal(ready.y,0);
 // Re-rendering for a continuous next stage must not request another focus.
 await page.evaluate(()=>{const s=document.querySelector('.formal-b-shared-stage');s.replaceWith(s.cloneNode(true));CivilizationCombatViewport.sync();});await settle(page);assert.equal((await measure(page)).y,ready.y,'next fight must not jump');
 // Manual input persists across screen replacement and orientation changes.
 await page.evaluate(()=>{document.dispatchEvent(new Event('touchmove'));scrollTo(0,0);document.querySelector('.combat-screen').replaceWith(document.querySelector('.combat-screen').cloneNode(true));});await settle(page);assert.equal((await measure(page)).y,0,'manual scroll retained across next fight');
 if(size.mobile){await page.setViewportSize({width:size.height,height:size.width});await settle(page);assert.equal((await measure(page)).y,0,'rotation must respect manual scrolling');}
 evidence.push({name,size,loading,ready});
 }finally{await page.close();}}
 // Batch19-3: real HUD geometry must change the chosen focus, while legacy stage-only fixtures stay precisely centered.
for(const external of [false,true]){
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{
  const html=fixture(external?"galaxy-calamity":"galaxy-bounty");
  await page.setContent(html);
  await page.addStyleTag({content:css});
  await page.evaluate(()=>{
   const arena=document.querySelector(".combat-arena");
   arena.innerHTML='<div class="combatant enemy"><h2>敵方</h2><div class="big-hp">HP 100</div></div><div class="combatant player"><h2>玩家</h2><div class="big-hp">HP 100</div></div>';
  });
  await page.addScriptTag({path:"combat-viewport-coordinator.js"});
  await settle(page);
  await page.evaluate(()=>{document.querySelector(".formal-b-stage-pending").classList.remove("formal-b-stage-pending");document.querySelector(".formal-b-shared-stage").hidden=false;});
  await settle(page);
  const visible=await page.evaluate(()=>{
   const vp=visualViewport?.height||innerHeight;
   const els=[document.querySelector(".formal-b-shared-stage"),...document.querySelectorAll(".combatant h2,.combatant .big-hp")];
   const rs=els.map(x=>x.getBoundingClientRect());
   return {top:Math.min(...rs.map(x=>x.top)),bottom:Math.max(...rs.map(x=>x.bottom)),viewport:vp,scrollY,stage:rs[0].top+rs[0].height/2-vp/2};
  });
  assert(visible.scrollY>0,"HUD fixture should automatically focus");
  if(visible.bottom-visible.top<=visible.viewport-24){
   assert(visible.top>=-13&&visible.bottom<=visible.viewport+13,"essential combat HUD should fit when physically possible "+JSON.stringify(visible));
  }else{
   assert(visible.stage<visible.viewport,"short viewport must still keep the stage reachable "+JSON.stringify(visible));
  }
  evidence.push({name:external?"batch19-3-external-stop-HUD":"batch19-3-inner-stop-HUD",visible});
 }finally{await page.close();}
}
 // iPhone regression: enabling background battle preference must not disable active foreground combat.
 // A stale combat card before the visible one must never steal the positioning target.
 {
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  try {
   await page.setContent(fixture('galaxy-main'));
   await page.addStyleTag({content:css});
   await page.evaluate(()=>{
    window.gmBackgroundBattleEnabled=()=>true;
    const stale=document.createElement('section');
    stale.className='combat-screen';
    stale.innerHTML='<div class="formal-b-shared-stage" hidden></div>';
    document.querySelector('#main').prepend(stale);
   });
   await page.addScriptTag({path:'combat-viewport-coordinator.js'});
   await page.evaluate(()=>{const active=document.querySelector('.formal-b-stage-pending');active.classList.remove('formal-b-stage-pending');active.querySelector('.formal-b-shared-stage').hidden=false;});
   // The stage belongs to the non-stale combat screen, even when preference is on.
   await settle(page);
   const state=await page.evaluate(()=>({...CivilizationCombatViewport.snapshot(),scrollY}));
   assert(state.focused&&state.scrollY>0,'visible foreground combat should focus with background battle preference enabled');
   evidence.push({name:'ios-background-preference-foreground-focus',state});
  }finally{await page.close();}
 }
 fs.writeFileSync('/tmp/pr48-viewport-browser.json',JSON.stringify({realDevice:false,cases:evidence},null,2));console.log('UNIFIED_MOBILE_COMBAT_VISUAL_PASS',evidence.length);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
