/* Mobile presentation only. Never moves controls or owns a combat clock. */
(function(g,d){"use strict";
if(g.CivilizationCombatViewport)return;
let root,observer,lastStage=null,lastScreen=null,manual=false,focused=false,queued=false,token=0,lastWidth=0,lastRoute=null;
const mobile=()=>!!g.matchMedia?.("(max-width:820px), (max-height:500px) and (pointer:coarse)")?.matches;
const animationExpected=()=>g.CivilizationPresentationMode?.combatAnimationEnabled?.()!==false;
// Background battle preference is a user setting, not proof that the foreground combat UI is hidden.
// Suppress only when the actual minimal/background-only presentation is visible.
const live=()=>mobile()&&animationExpected()&&d.visibilityState!=="hidden"&&!d.body?.classList.contains("main-minimal-mode-open");
const stageOf=s=>s?.querySelector(".formal-b-shared-stage:not([hidden]),.formal-b-battle-stage:not([hidden])");
const raf=f=>(g.requestAnimationFrame||((cb)=>setTimeout(cb,16)))(f);
function cancel(){token++;queued=false;}
function geometry(screen,stage){
 const stageRect=stage.getBoundingClientRect(),rects=[stageRect];
 // Lightweight Runtime fixtures omit querySelectorAll; browsers supply it.
 const cards=typeof screen.querySelectorAll==="function"?screen.querySelectorAll(".combat-arena .combatant.player,.combat-arena .combatant.enemy"):[];
 for(const card of cards){
  const title=card.querySelector("h2"),hp=card.querySelector(".big-hp,.hp-bar,.hp-fill,[class*=hp]");
  for(const el of [title,hp])if(el){const r=el.getBoundingClientRect();if(r.height>0&&r.width>0)rects.push(r);}
 }
 const owner=screen.closest?.(".calamity-battle-shell,.void-shell,.arena-shell,.dungeon-page-shell")||screen;
 const stop=cards.length?(screen.querySelector?.(".combat-viewport-stop")||owner.querySelector?.(".combat-viewport-stop")):null;
 if(stop&&!stop.hidden){const r=stop.getBoundingClientRect();if(r.height>0)rects.push(r);}
 return {stage:stageRect,top:Math.min(...rects.map(r=>r.top)),bottom:Math.max(...rects.map(r=>r.bottom)),signature:rects.flatMap(r=>[r.top,r.bottom,r.width])};
}
function center(screen,stage,ticket,prior=null,stable=0,tries=0){
 if(ticket!==token||!live()||manual||!stage?.isConnected||stage.hidden){if(ticket===token)queued=false;return;}
 const info=geometry(screen,stage),r=info.stage,measure=info.signature;
 if(r.width<1||r.height<1){queued=false;return;}
 stable=prior&&prior.length===measure.length&&measure.every((v,i)=>Math.abs(v-prior[i])<1)?stable+1:0;
 if(stable<3){if(tries<30)raf(()=>center(screen,stage,ticket,measure,stable,tries+1));else queued=false;return;}
 queued=false;focused=true;
 const vp=g.visualViewport,height=Number(vp?.height)||g.innerHeight||1,offset=Number(vp?.offsetTop)||0;
 const usable=Math.max(1,height-24),span=info.bottom-info.top;
 // If everything fits, center the complete essential region; otherwise
 // preserve the whole stage and bias toward nearby HUD without resizing actors.
 const top=span<=usable?info.top:Math.max(info.top,Math.min(r.top-12,info.bottom-usable));
 const bottom=span<=usable?info.bottom:top+usable;
 const delta=(top+bottom)/2-(offset+height/2);
 const max=Math.max(0,Math.max(d.scrollingElement?.scrollHeight||0,d.documentElement?.scrollHeight||0)-(g.innerHeight||height));
 const now=Number(g.scrollY)||0,target=Math.max(0,Math.min(max,now+delta));
 if(Math.abs(target-now)>2)g.scrollTo({top:target,behavior:"instant"});
}
function inspect(){
 if(!root?.isConnected)return;
 const route=typeof view!=="undefined"?view:null;
 if(route!==lastRoute){cancel();manual=false;focused=false;lastStage=null;lastScreen=null;lastRoute=route;}
 // The page may retain earlier combat cards; choose the active visible stage, not the first stale screen.
 const screens=typeof root.querySelectorAll==="function"?Array.from(root.querySelectorAll(".combat-screen")):[];
 const screen=screens.find(s=>stageOf(s))||root.querySelector(".combat-screen");
 if(!screen){if(lastScreen){cancel();lastStage=null;lastScreen=null;manual=false;focused=false;}return;}
 const stage=stageOf(screen);
 if(stage!==lastStage||screen!==lastScreen){cancel();lastStage=stage;lastScreen=screen;}
 if(!stage||!live()||manual||focused||queued)return;
 queued=true;const ticket=++token;raf(()=>center(screen,stage,ticket));
}
function setup(){
 root=d.getElementById("main");if(!root||typeof MutationObserver==="undefined")return;
 root.addEventListener?.("click",()=>{if(!root.querySelector(".combat-screen")){cancel();manual=false;focused=false;}} ,{capture:true});
 observer=new MutationObserver(inspect);
 observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:["hidden"]});
 const gesture=()=>{if(!root.querySelector(".combat-screen"))return;manual=true;cancel();};
 d.addEventListener("touchmove",gesture,{passive:true});g.addEventListener("wheel",gesture,{passive:true});
 d.addEventListener("keydown",e=>{if(["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"," "].includes(e.key)&&! /INPUT|TEXTAREA|SELECT/.test(e.target?.tagName||""))gesture();});
 lastWidth=Number(g.visualViewport?.width)||g.innerWidth||0;
 const resized=()=>{const width=Number(g.visualViewport?.width)||g.innerWidth||0;if(Math.abs(width-lastWidth)>55){lastWidth=width;cancel();focused=false;inspect();}};
 g.addEventListener("resize",resized,{passive:true});g.visualViewport?.addEventListener?.("resize",resized,{passive:true});
 d.addEventListener("visibilitychange",()=>{cancel();if(!d.hidden)inspect();});inspect();
}
g.CivilizationCombatViewport=Object.freeze({version:4,animationExpected,sync:inspect,snapshot:()=>({mobile:mobile(),manual,focused,stageActive:!!stageOf(root?.querySelector(".combat-screen")),observerCount:observer?1:0})});
if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
})(window,document);
