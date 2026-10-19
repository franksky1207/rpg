/* Unified mobile combat focus. Presentation only: never owns battle state, events, timing or saves. */
(function(global,doc){
"use strict";
if(global.CivilizationCombatViewport)return;
let root=null,observer=null,queued=false,manual=false,lastScreen=null,lastStage=null,lastStop=null,layoutSerial=0;
const mobile=()=>!!global.matchMedia?.("(max-width:820px), (max-height:500px) and (pointer:coarse)")?.matches;
const animationExpected=()=>global.CivilizationPresentationMode?.combatAnimationEnabled?.()!==false;
const live=()=>mobile()&&animationExpected()&&doc.visibilityState!=="hidden"&&!doc.body?.classList.contains("main-minimal-mode-open")&&global.gmBackgroundBattleEnabled?.()!==true;
const usableStage=screen=>{
 const stage=screen?.querySelector(".formal-b-shared-stage:not([hidden]),.formal-b-battle-stage:not([hidden])");
 return stage||null; // no layout read during HUD mutation observation
};
const stopControl=screen=>{
 const scope=screen.closest(".calamity-battle-shell")||screen;
 const button=[...scope.querySelectorAll("button")].find(b=>{
  const action=b.getAttribute("onclick")||"",label=b.textContent?.trim()||"";
  return /^(停止連續|停止後續|本場結束後停止|本輪結束後停止|停止中)/.test(label)&&
   /(?:Stop|stop|requestContinuousBattleStop)/.test(action);
 });
 if(!button)return null;
 const wrap=button.closest(".continuous-stop-wrap,.calamity-stop-wrap,.arena-actions,.controls");
 return wrap&&scope.contains(wrap)?wrap:null;
};
const moveStop=(screen,stage)=>{
 const wrap=stopControl(screen);
 if(!wrap)return null;
 if(wrap.parentElement!==screen||wrap.nextElementSibling!==stage)screen.insertBefore(wrap,stage);
 wrap.classList.add("combat-viewport-stop");
 return wrap;
};
function position(){
 queued=false;
 if(!root?.isConnected||!live())return;
 const screen=root.querySelector(".combat-screen");
 if(!screen){lastScreen=null;lastStage=null;lastStop=null;manual=false;return;}
 const stage=usableStage(screen);
 if(!stage)return;
 const stop=moveStop(screen,stage);
 if(manual||!stage.isConnected)return;
 const area=stage.getBoundingClientRect();if(area.height<=0)return;
 const control=stop?.getBoundingClientRect();
 const top=control?Math.min(control.top,area.top):area.top;
 const bottom=control?Math.max(control.bottom,area.bottom):area.bottom;
 const vp=global.visualViewport,offset=Number(vp?.offsetTop)||0;
 const height=Math.max(1,Number(vp?.height)||global.innerHeight||1);
 const safeTop=offset+12,safeBottom=offset+height-18;
 if(top>=safeTop&&bottom<=safeBottom)return;
 const startY=Number(global.scrollY)||0;
 const desired=bottom-top<=safeBottom-safeTop
  ?startY+(top+bottom-safeTop-safeBottom)/2
  :startY+top-safeTop;
 const pageHeight=Math.max(doc.scrollingElement?.scrollHeight||0,doc.documentElement?.scrollHeight||0);
 const maxScroll=Math.max(0,pageHeight-(global.innerHeight||height));
 const target=Math.max(0,Math.min(maxScroll,desired));
 if(Math.abs(target-startY)>12)global.scrollTo({top:target,behavior:"instant"});
}
function schedule(){
 if(queued)return;
 queued=true;
 const serial=layoutSerial;
 const raf=global.requestAnimationFrame||((fn)=>setTimeout(fn,0));
 raf(()=>raf(()=>{if(serial===layoutSerial)position();else queued=false;}));
}
function inspect(force=false){
 if(!root?.isConnected)return;
 const screen=root.querySelector(".combat-screen");
 if(!screen){
  if(lastScreen){lastScreen=null;lastStage=null;lastStop=null;manual=false;}
  return;
 }
 const stage=usableStage(screen);
 if(!stage)return;
 const stop=stopControl(screen);
 if(!force&&screen===lastScreen&&stage===lastStage&&stop===lastStop)return;
 lastScreen=screen;lastStage=stage;lastStop=stop;
 schedule();
}
function setup(){
 root=doc.getElementById("main");
 if(!root||typeof MutationObserver==="undefined")return;
 observer=new MutationObserver(()=>inspect());
 observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden"]});
 doc.addEventListener("touchmove",()=>{manual=true;},{passive:true});
 global.addEventListener("wheel",()=>{manual=true;},{passive:true});
 global.addEventListener("resize",()=>{layoutSerial++;queued=false;inspect(true);},{passive:true});
 global.visualViewport?.addEventListener?.("resize",()=>{layoutSerial++;queued=false;inspect(true);},{passive:true});
 doc.addEventListener("visibilitychange",()=>{if(!doc.hidden)inspect(true);});
 inspect(true);
}
global.CivilizationCombatViewport=Object.freeze({
 version:1,
 animationExpected,
 sync:()=>inspect(true),
 snapshot:()=>Object.freeze({mobile:mobile(),manual,stageActive:!!usableStage(root?.querySelector(".combat-screen")),observerCount:observer?1:0})
});
if(doc.readyState==="loading")doc.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
})(window,document);
