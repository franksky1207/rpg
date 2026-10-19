/* Mobile presentation only. Never moves controls or owns a combat clock. */
(function(g,d){"use strict";
if(g.CivilizationCombatViewport)return;
let root,observer,lastStage=null,manual=false,focused=false,queued=false,token=0,lastWidth=0,lastRoute=null;
const mobile=()=>!!g.matchMedia?.("(max-width:820px), (max-height:500px) and (pointer:coarse)")?.matches;
const animationExpected=()=>g.CivilizationPresentationMode?.combatAnimationEnabled?.()!==false;
const live=()=>mobile()&&animationExpected()&&d.visibilityState!=="hidden"&&!d.body?.classList.contains("main-minimal-mode-open")&&g.gmBackgroundBattleEnabled?.()!==true;
const stageOf=s=>s?.querySelector(".formal-b-shared-stage:not([hidden]),.formal-b-battle-stage:not([hidden])");
const raf=f=>(g.requestAnimationFrame||((cb)=>setTimeout(cb,16)))(f);
function cancel(){token++;queued=false;}
function center(stage,ticket,prior=null,stable=0,tries=0){
 if(ticket!==token||!live()||manual||!stage?.isConnected||stage.hidden){if(ticket===token)queued=false;return;}
 const r=stage.getBoundingClientRect(),measure=[r.top,r.width,r.height];
 if(r.width<1||r.height<1){queued=false;return;}
 stable=prior&&measure.every((v,i)=>Math.abs(v-prior[i])<1)?stable+1:0;
 if(stable<3){if(tries<30)raf(()=>center(stage,ticket,measure,stable,tries+1));else queued=false;return;}
 queued=false;focused=true;
 const vp=g.visualViewport,height=Number(vp?.height)||g.innerHeight||1,offset=Number(vp?.offsetTop)||0;
 const delta=r.top+r.height/2-(offset+height/2);
 const max=Math.max(0,Math.max(d.scrollingElement?.scrollHeight||0,d.documentElement?.scrollHeight||0)-(g.innerHeight||height));
 const now=Number(g.scrollY)||0,target=Math.max(0,Math.min(max,now+delta));
 if(Math.abs(target-now)>2)g.scrollTo({top:target,behavior:"instant"});
}
function inspect(){
 if(!root?.isConnected)return;
 const route=typeof view!=="undefined"?view:null;
 if(route!==lastRoute){cancel();manual=false;focused=false;lastStage=null;lastRoute=route;}
 const screen=root.querySelector(".combat-screen");
 if(!screen){cancel();lastStage=null;if(route===null){manual=false;focused=false;}return;}
 const stage=stageOf(screen);
 if(stage!==lastStage){cancel();lastStage=stage;}
 if(!stage||!live()||manual||focused||queued)return;
 queued=true;const ticket=++token;raf(()=>center(stage,ticket));
}
function setup(){
 root=d.getElementById("main");if(!root||typeof MutationObserver==="undefined")return;
 root.addEventListener?.("click",()=>{if(!root.querySelector(".combat-screen")){cancel();manual=false;focused=false;}} ,{capture:true});
 observer=new MutationObserver(inspect);
 observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:["hidden"]});
 const gesture=()=>{manual=true;cancel();};
 d.addEventListener("touchmove",gesture,{passive:true});g.addEventListener("wheel",gesture,{passive:true});
 d.addEventListener("keydown",e=>{if(["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"," "].includes(e.key)&&! /INPUT|TEXTAREA|SELECT/.test(e.target?.tagName||""))gesture();});
 lastWidth=Number(g.visualViewport?.width)||g.innerWidth||0;
 const resized=()=>{const width=Number(g.visualViewport?.width)||g.innerWidth||0;if(Math.abs(width-lastWidth)>55){lastWidth=width;cancel();focused=false;inspect();}};
 g.addEventListener("resize",resized,{passive:true});g.visualViewport?.addEventListener?.("resize",resized,{passive:true});
 d.addEventListener("visibilitychange",()=>{cancel();if(!d.hidden)inspect();});inspect();
}
g.CivilizationCombatViewport=Object.freeze({version:3,animationExpected,sync:inspect,snapshot:()=>({mobile:mobile(),manual,focused,stageActive:!!stageOf(root?.querySelector(".combat-screen")),observerCount:observer?1:0})});
if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
})(window,document);
