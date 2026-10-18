// Visual samples only. Reuses B's clip names/grid and 700ms sampling, owns no clock.
import {CLIPS,GRID,sampleTime} from './contract.mjs';
export {GRID};
export const ACTIONS=Object.freeze(['idle','attack','hit','dodge','return','defeat']);
export function pose(clip,ms,{rootMotion=true}={}){
 if(!CLIPS.includes(clip)||!Number.isFinite(ms)||ms<0)throw Error('invalid-animation-sample');
 const time=sampleTime(ms),t=time.elapsedMs/700,s=(t===0||t===1)?0:Math.sin(Math.PI*t),p={x:0,y:0,rotation:0,scaleX:1,scaleY:1,alpha:1,flash:0,slash:0,trail:0,tick:time.tick};
 if(clip==='idle'){const breath=Math.sin(ms/1600*Math.PI*2);p.scaleY=1+breath*.008;p.y=-breath*.003;}
 if(clip==='attack'){p.x=rootMotion?.10*s:0;p.rotation=(t===0||t===1)?0:-.15*Math.sin(t*Math.PI*2);p.scaleX=1+.03*s;p.slash=Math.max(0,1-Math.abs(t-.46)/.18);}
 if(clip==='return'){const q=t*t*(3-2*t);p.x=rootMotion?.10*(1-q):0;p.rotation=-.025*(1-q);}
 if(clip==='hit'){p.x=rootMotion?-.025*s:0;p.rotation=.10*s;p.x+=.006*Math.sin(t*Math.PI*12)*(1-t);p.flash=.65*s;}
 if(clip==='dodge'){p.x=rootMotion?-.10*s:0;p.y=-.018*s;p.rotation=.07*s;p.alpha=1-.30*s;p.trail=.25*s;}
 if(clip==='defeat'){p.rotation=1.35*t;p.y=.04*t;p.alpha=1-t;p.scaleY=1-.10*t;}
 return Object.freeze(p);
}
export function animationController(){
 let state='idle',start=0,closed=false,generation=0,eventId=null;
 return Object.freeze({
  play(clip,now,id=null){if(closed||!ACTIONS.includes(clip)||!Number.isFinite(now))return false;if(id!==null&&id===eventId)return false;state=clip;start=now;eventId=id;generation++;return true;},
  sample(now,options){if(closed||!Number.isFinite(now))return null;let elapsed=Math.max(0,now-start);if(state!=='idle'&&state!=='defeat'&&elapsed>=700){state='idle';start=now;elapsed=0;}return {clip:state,generation,elapsedMs:elapsed,pose:pose(state,elapsed,options)};},
  cancel(){if(closed)return;generation++;state='idle';start=0;eventId=null;},
  dispose(){if(closed)return;closed=true;generation++;eventId=null;},
  snapshot(){return {state,closed,generation,canCommit:false,timers:0};}
 });
}

// Normalized pose coordinates, never milliseconds to wait. Both owners map their
// actual impact timestamp to 336 and recovery endpoint to 700 at every speed.
export function weaponPose(ms,config){
 const t=Math.max(0,Math.min(700,ms))/700;
 const ease=x=>x*x*(3-2*x);
 // Existing art points down/back at rest. Set the attack grip towards the enemy
 // once; only a small wrist adjustment is animated, never a full rotating swing.
 const base=config.strike-Math.PI*2;
 let stage,reach,tilt;
 if(t<.28){stage='windup';reach=-.018*ease(t/.28);tilt=-.08*ease(t/.28);}
 else if(t<.48){stage='thrust';const q=ease((t-.28)/.20);reach=-.018+.098*q;tilt=-.08+.10*q;}
 else if(t<.60){stage='impact';reach=.08;tilt=.02;}
 else{stage='recover';const q=1-ease((t-.60)/.40);reach=.08*q;tilt=.02*q;}
 return Object.freeze({stage,angle:base+tilt,approach:reach,slash:Math.max(0,1-Math.abs(t-.48)/.10)});
}
