"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs");
const {chromium}=require("playwright");
const source="combat-viewport-coordinator.js";
const css=fs.readFileSync("battle-mobile-viewport.css","utf8")+"\n"+fs.readFileSync("3d-test/formal-player-sprites.css","utf8");
const modes=[
 {name:"galaxy-calamity",button:"停止連續討伐",fn:"stopCivilizationCalamityContinuousUI()"},
 {name:"universe-calamity",button:"停止連續討伐",fn:"stopSecondWorldCalamityContinuousUI()"},
 {name:"galaxy-main",button:"停止連續戰鬥",fn:"requestContinuousBattleStop()"},
 {name:"higher-main",button:"停止連續戰鬥",fn:"stopThirdWorldRunFromPlayerUi()"},
 {name:"bounty",button:"停止連續挑戰",fn:"requestBountyContinuousStop()"},
 {name:"higher-arena",button:"停止後續場次",fn:"requestThirdWorldArenaUiStop()"}
];
function fixture(item){
 const stop='<div class="calamity-stop-wrap"><button style="padding:10px 20px" onclick="'+item.fn+'">'+item.button+'</button></div>';
 return '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>html{scroll-behavior:auto}body{margin:0;background:#141821;color:white} .demo-spacer{height:1000px}#main{padding:0 12px}.calamity-battle-shell{background:#1c2630;padding:12px}.combat-screen{display:flex;flex-direction:column;gap:10px}.combat-head{order:-4;text-align:center}.formal-b-shared-stage{order:-2;display:block;height:240px;min-height:240px;background:#304962}.combat-arena{min-height:120px}.stage-actor{display:inline-block;width:42%;height:85%;margin:10px 3%;background:#91aecf}</style><div class="demo-spacer"></div><main id="main"><section class="calamity-battle-shell"><div style="height:280px">場次與敵方統計</div>'+stop+'<section class="combat-screen formal-b-shared-layout"><div class="combat-head">戰鬥</div><div class="formal-b-shared-stage"><div class="stage-actor"></div><div class="stage-actor"></div></div><div class="combat-arena"><div>玩家 HP</div><div>怪物 HP</div></div></section></section></main><div class="demo-spacer"></div>';
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});
 try{
  const dimensions=[{width:390,height:844,mobile:true},{width:844,height:390,mobile:true},{width:1200,height:900,mobile:false}];
  for(const size of dimensions){
   for(const item of modes){
    const page=await browser.newPage({viewport:{width:size.width,height:size.height},isMobile:size.mobile,hasTouch:size.mobile});
    try{
     await page.setContent(fixture(item));
     await page.addStyleTag({content:css});
     await page.addScriptTag({path:source});
     if(size.mobile){
      await page.waitForFunction(()=>{const stage=document.querySelector(".formal-b-shared-stage"),btn=document.querySelector(".combat-viewport-stop button");if(!btn)return false;const r=stage.getBoundingClientRect(),b=btn.getBoundingClientRect();return b.top>=-1&&b.bottom<=window.innerHeight+1&&r.top>=-1&&r.bottom<=window.innerHeight+1;},{timeout:6000});
      const result=await page.evaluate(()=>{const stage=document.querySelector(".formal-b-shared-stage"),btn=document.querySelector(".combat-viewport-stop button");return {scrollY:scrollY,stopParent:btn.parentElement.parentElement.className,stageTop:stage.getBoundingClientRect().top,stageBottom:stage.getBoundingClientRect().bottom,buttonTop:btn.getBoundingClientRect().top,buttonBottom:btn.getBoundingClientRect().bottom,stopCount:document.querySelectorAll(".combat-viewport-stop").length};});
      assert(result.scrollY>0,item.name+": expected reposition: "+JSON.stringify(result));
      assert.equal(result.stopCount,1,item.name+": should reuse one stop control");
      await page.evaluate(()=>{window.dispatchEvent(new WheelEvent("wheel"));scrollTo({top:0,behavior:"instant"});window.CivilizationCombatViewport.sync();});
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const manual=await page.evaluate(()=>scrollY);
      assert(manual<10,item.name+": manual user scroll stolen: "+manual);
     }else{
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const desktop=await page.evaluate(()=>({scrollY,stops:document.querySelectorAll(".combat-viewport-stop").length}));
      assert.equal(desktop.scrollY,0,"desktop must not auto-scroll");
      assert.equal(desktop.stops,0,"desktop stop placement must not change");
     }
    }finally{await page.close();}
   }
  }
  console.log("UNIFIED_MOBILE_COMBAT_VISUAL_PASS",dimensions.length*modes.length,"viewport/mode fixtures");
 }finally{await browser.close();}
})().catch(error=>{console.error(error.stack||String(error));process.exitCode=1;});
