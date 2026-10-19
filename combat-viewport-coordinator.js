/* Formal mobile stage focus; no text guesses, control moves or gameplay writes. */
(function(g,d){"use strict";
if(g.CivilizationCombatViewport)return;
let root,observer,lastScreen=null,lastStage=null,manual=false,scheduled=false,token=0,lastWidth=0;
const mobile=()=>!!g.matchMedia?.("(max-width:820px), (max-height:500px) and (pointer:coarse)")?.matches;
const animationExpected=()=>g.CivilizationPresentationMode?.combatAnimationEnabled?.()!==false;
const live=()=>mobile()&&animationExpected()&&d.visibilityState!=="hidden"&&!d.body?.classList.contains("main-minimal-mode-open")&&g.gmBackgroundBattleEnabled?.()!==true;
const stageOf=s=>s?.querySelector(".formal-b-shared-stage:not([hidden]),.formal-b-battle-stage:not([hidden])");
const raf=f=>(g.requestAnimationFrame||((cb)=>setTimeout(cb,16)))(f);
function center(stage,prior=null,tries=0){
 if(!live()||manual||!stage?.isConnected||stage.hidden)return;
 const r=stage.getBoundingClientRect();if(r.width<1||r.height<1)return;
 const measure=[r.top,r.width,r.height];
 if(!prior||measure.some((v,i)=>Math.abs(v-prior[i])>3)){
  if(tries<10)raf(()=>center(stage,measure,tries+1));return;
 }
 const vp=g.visualViewport,height=Number(vp?.height)||g.innerHeight||1,offset=Number(vp?.offsetTop)||0;
 const delta=r.top+r.height/2-(offset+height/2);
 if(Math.abs(delta)<18)return;
 const max=Math.max(0,Math.max(d.scrollingElement?.scrollHeight||0,d.documentElement?.scrollHeight||0)-(g.innerHeight||height));
 const now=Number(g.scrollY)||0,target=Math.max(0,Math.min(max,now+delta));
 if(Math.abs(target-now)>14)g.scrollTo({top:target,behavior:"instant"});
}
function schedule(stage){if(scheduled)return;scheduled=true;const ticket=++token;raf(()=>raf(()=>{scheduled=false;if(ticket===token)center(stage);}));}
function inspect(force=false){
 if(!root?.isConnected)return;
 const screen=root.querySelector(".combat-screen");
 if(!screen){if(lastScreen){lastScreen=null;lastStage=null;manual=false;}return;}
 const stage=stageOf(screen);if(!stage)return;
 if(!force&&screen===lastScreen&&stage===lastStage)return;
 lastScreen=screen;lastStage=stage;if(live())schedule(stage);
}
function setup(){
 root=d.getElementById("main");if(!root||typeof MutationObserver==="undefined")return;
 observer=new MutationObserver(()=>inspect());
 observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:["hidden"]});
 d.addEventListener("touchmove",()=>{manual=true;},{passive:true});
 g.addEventListener("wheel",()=>{manual=true;},{passive:true});
 lastWidth=Number(g.visualViewport?.width)||g.innerWidth||0;
 const resized=()=>{const width=Number(g.visualViewport?.width)||g.innerWidth||0;if(Math.abs(width-lastWidth)>55){lastWidth=width;token++;scheduled=false;inspect(true);}};
 g.addEventListener("resize",resized,{passive:true});g.visualViewport?.addEventListener?.("resize",resized,{passive:true});
 d.addEventListener("visibilitychange",()=>{if(!d.hidden)inspect(true);});inspect(true);
}
g.CivilizationCombatViewport=Object.freeze({version:2,animationExpected,sync:()=>inspect(true),snapshot:()=>({mobile:mobile(),manual,stageActive:!!stageOf(root?.querySelector(".combat-screen")),observerCount:observer?1:0})});
if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
})(window,document);
