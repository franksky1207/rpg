"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),{chromium}=require("playwright");
(async()=>{
 const source=fs.readFileSync("dungeonui.js","utf8");
 const begin=source.indexOf(" let battleViewportLastView="),end=source.indexOf(" function finishDungeonRender()",begin);
 assert(begin>=0&&end>begin,"viewport coordinator and dungeon render hook exist");
 assert(source.slice(end,end+240).includes("positionActiveDungeonCombat(main)"),"actual dungeon render calls viewport coordinator");
 assert(source.includes('area.querySelector(".combat-head")'),"target stable battle heading before async stage insertion");
 const snippet=source.slice(begin,end)+"\nwindow.testDungeonBattleViewport=positionActiveDungeonCombat;";
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await page.setContent('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><div style="height:1020px"></div><main id="main"></main><div style="height:1300px"></div>');
  await page.addScriptTag({content:snippet});
  const data=await page.evaluate(async()=>{
   // Wait for the owner-scheduled RAF and its committed scroll, not 80ms of wall time.
   const sleep=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   const main=document.querySelector("#main");
   window.view="dungeon-arena";
   main.innerHTML='<section class="combat-screen"><div class="combat-head">高維異相競技場 第一戰</div><div class="lineup" style="height:470px"></div><div class="combat-arena" style="height:680px"></div></section>';
   window.testDungeonBattleViewport(main);await sleep();
   const initial=window.scrollY;
   main.innerHTML='<section class="combat-screen"><div class="combat-head">高維異相競技場 第二戰</div><div class="lineup" style="height:470px"></div><div class="combat-arena" style="height:680px"></div></section>';
   window.testDungeonBattleViewport(main);await sleep();
   const second=window.scrollY;
   window.scrollTo({top:0,behavior:"instant"});
   document.dispatchEvent(new Event("pointerdown",{bubbles:true}));
   main.innerHTML='<section class="combat-screen"><div class="combat-head">高維異相競技場 第三戰</div><div class="lineup" style="height:470px"></div><div class="combat-arena" style="height:680px"></div></section>';
   window.testDungeonBattleViewport(main);await sleep();
   const manual=window.scrollY;
   return {initial,second,manual};
  });
  assert(data.initial>600,"initial battle must be brought into mobile viewport: "+JSON.stringify(data));
  assert(Math.abs(data.second-data.initial)<25,"transition must not shake already visible viewport: "+JSON.stringify(data));
  assert(data.manual<20,"manual user gesture must prevent unexpected scroll: "+JSON.stringify(data));
  console.log("BATCH4_MOBILE_ARENA_VIEWPORT_PASS",JSON.stringify(data));
  await page.setViewportSize({width:1200,height:900});
  const desktop=await page.evaluate(async()=>{
    window.view="dungeon-bounty";
    window.scrollTo({top:0,behavior:"instant"});
    document.querySelector("#main").innerHTML='<section class="combat-screen"><div class="combat-head">懸賞戰</div></section>';
    window.testDungeonBattleViewport(document.querySelector("#main"));
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    return window.scrollY;
  });
  assert.equal(desktop,0,"desktop must not be auto-scrolled");
  console.log("BATCH4_DESKTOP_NO_HIJACK_PASS");
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
