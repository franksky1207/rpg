(function(){
 const FX_LABELS={
  initiative:{text:"先制！",className:"initiative"},
  combo:{text:"連擊！",className:"combo"},
  penetration:{text:"穿透！",className:"penetration"},
  counter:{text:"反擊！",className:"counter"},
  drain:{text:"汲取！",className:"drain"},
  crit:{text:"暴擊！",className:"crit"},
  dodge:{text:"閃避！",className:"dodge"},
  berserk:{text:"狂暴！",className:"berserk"},
  heal:{text:"",className:"heal"}
 };
 let presentation=null;
 let lastLogs=[];
 let floatSerial=0;
 let resultLogTimer=null;

 function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
 function combatScreen(){return document.querySelector("#main .combat-screen");}
 function combatCard(target){
  return document.getElementById(target==="player"?"combatPlayerCard":"combatEnemyCard")||document.getElementById(target==="player"?"voidPlayerCard":"voidEnemyCard");
 }
 function logRowsHtml(logs){const rows=Array.isArray(logs)?logs:[];return rows.length?rows.map(line=>`<div class="combat-log-line">${escapeHtml(line)}</div>`).join(""):`<div class="combat-log-empty">沒有戰鬥紀錄。</div>`;}

 function installStyles(){
  if(document.getElementById("combatFxStyles"))return;
  const style=document.createElement("style");
  style.id="combatFxStyles";
  style.textContent=`
   .combat-fx-layer{position:absolute;inset:0;pointer-events:none;overflow:visible;z-index:6}
   .combat-fx-pop{position:absolute;top:18%;transform:translate(-50%,0);font-size:22px;font-weight:900;letter-spacing:.05em;white-space:nowrap;opacity:0;pointer-events:none;text-shadow:0 2px 7px #000,0 0 12px rgba(0,0,0,.8);animation:combatFxPop .72s ease-out forwards;z-index:7}
   .combat-fx-pop.initiative{color:#FFD54A}.combat-fx-pop.combo{color:#FF8A3D}.combat-fx-pop.penetration{color:#B56CFF}.combat-fx-pop.counter{color:#FF5252}.combat-fx-pop.drain{color:#4CD964}.combat-fx-pop.crit{color:#4FD6FF}.combat-fx-pop.dodge{color:#B8F4FF}.combat-fx-pop.berserk{color:#FF7043}.combat-fx-pop.heal{color:#7CFF8E;font-size:18px}
   @keyframes combatFxPop{0%{opacity:0;transform:translate(-50%,10px) scale(.82)}18%{opacity:1;transform:translate(-50%,-2px) scale(1.08)}72%{opacity:1}100%{opacity:0;transform:translate(-50%,-58px) scale(1)}}
   .combat-log-panel{margin:10px auto 0;width:min(760px,100%);border:1px solid #393f49;border-radius:10px;background:#10141a;overflow:hidden;text-align:left}
   .combat-log-panel>summary{cursor:pointer;list-style:none;padding:9px 12px;color:#bdb7aa;font-size:13px;font-weight:700;background:#151a21;user-select:none}
   .combat-log-panel>summary::-webkit-details-marker{display:none}.combat-log-panel>summary::before{content:"▶";display:inline-block;margin-right:7px;font-size:10px;transition:transform .15s ease}.combat-log-panel[open]>summary::before{transform:rotate(90deg)}
   .combat-log-scroll{max-height:180px;overflow-y:auto;padding:8px 11px;border-top:1px solid #2b3038;font-size:12px;line-height:1.55;color:#aaa69d;overscroll-behavior:contain;scrollbar-gutter:stable}
   .combat-log-line{padding:2px 0;border-bottom:1px dotted rgba(255,255,255,.045)}.combat-log-line:last-child{border-bottom:0}.combat-log-empty{color:#777d86}.result-combat-log{margin-top:12px}
   @media(max-width:760px){.combat-fx-pop{font-size:18px;top:14%}.combat-fx-pop.heal{font-size:16px}.combat-log-panel{margin-top:7px}.combat-log-panel>summary{padding:8px 10px;font-size:12px}.combat-log-scroll{max-height:135px;padding:7px 9px;font-size:11px}}
  `;
  document.head.appendChild(style);
 }

 function ensureCombatExtras(){
  installStyles();
  const screen=combatScreen();if(!screen)return false;
  ["player","enemy"].forEach(target=>{
   const card=combatCard(target);if(card&&!card.querySelector(".combat-fx-layer")){const layer=document.createElement("div");layer.className="combat-fx-layer";card.appendChild(layer);}
  });
  if(!screen.querySelector(".combat-log-panel")){
   const details=document.createElement("details");details.className="combat-log-panel";details.innerHTML=`<summary>戰鬥紀錄</summary><div class="combat-log-scroll" id="combatLogContent"><div class="combat-log-empty">戰鬥開始後可在此查看詳細紀錄。</div></div>`;screen.appendChild(details);
  }
  return true;
 }
 window.ensureCombatExtras=ensureCombatExtras;

 window.setCombatLog=function(logs){
  lastLogs=Array.isArray(logs)?logs.slice():[];
  if(!ensureCombatExtras())return;
  const box=document.getElementById("combatLogContent");if(!box)return;
  box.innerHTML=logRowsHtml(lastLogs);box.scrollTop=box.scrollHeight;
 };

 function injectResultLog(){
  if(!lastLogs.length||combatScreen())return;
  let host=null;
  const modal=document.getElementById("battleResultModal");
  if(modal?.classList.contains("show"))host=document.getElementById("battleResultDetail");
  if(!host)host=document.querySelector(".dungeon-bounty-result-card,.arena-result-panel");
  if(!host){const reason=document.querySelector(".void-result .void-result-reason");if(reason)host=reason.closest(".void-result");}
  if(!host||host.querySelector(".result-combat-log"))return;
  const details=document.createElement("details");details.className="combat-log-panel result-combat-log";details.innerHTML=`<summary>戰鬥紀錄</summary><div class="combat-log-scroll">${logRowsHtml(lastLogs)}</div>`;host.appendChild(details);
  const box=details.querySelector(".combat-log-scroll");if(box)box.scrollTop=box.scrollHeight;
 }
 function queueResultLog(){clearTimeout(resultLogTimer);resultLogTimer=setTimeout(injectResultLog,0);}

 function spawnFx(target,kind,text=null,delay=0){
  const cfg=FX_LABELS[kind]||{text:String(text||""),className:kind||""};
  const label=text||cfg.text;if(!label)return;
  setTimeout(()=>{
   ensureCombatExtras();
   const card=combatCard(target),layer=card?.querySelector(".combat-fx-layer");if(!layer)return;
   const el=document.createElement("div"),lane=floatSerial++%3;
   el.className=`combat-fx-pop ${cfg.className||kind||""}`;
   el.textContent=label;
   el.style.left=`${lane===0?31:lane===1?50:69}%`;
   el.style.top=`${lane===1?15:22}%`;
   layer.appendChild(el);
   el.addEventListener("animationend",()=>el.remove(),{once:true});
  },Math.max(0,delay));
 }
 window.spawnCombatFx=spawnFx;

 function emitPrelude(events,target){
  let delay=0;
  for(const evt of events){
   if(evt.type==="combo"){spawnFx(target,"combo",null,delay);delay+=85;}
   else if(evt.type==="counter"){spawnFx(target,"counter",null,delay);delay+=85;}
   else if(evt.type==="berserk"){spawnFx("enemy","berserk",null,delay);delay+=85;}
  }
  return delay;
 }

 function consumeForPulse(target,text){
  const p=presentation;if(!p||!Array.isArray(p.events))return;
  const dodge=String(text||"").includes("閃避");
  const want=evt=>dodge?(evt.type==="dodge"&&evt.target===target):(evt.type==="attack"&&((target==="enemy"&&evt.actor==="player")||(target==="player"&&evt.actor==="enemy")));
  const pre=[];let match=null;
  while(p.index<p.events.length){
   const evt=p.events[p.index++];
   if(want(evt)){match=evt;break;}
   if(evt.type==="combo"||evt.type==="counter"||evt.type==="berserk")pre.push(evt);
  }
  if(!match)return;
  let delay=emitPrelude(pre,target);
  if(match.type==="dodge"){
   spawnFx(target,"dodge",null,delay);
   return;
  }
  if(match.initiative){spawnFx(target,"initiative",null,delay);delay+=85;}
  if(match.penetration){spawnFx(target,"penetration",null,delay);delay+=85;}
  if(match.crit){spawnFx(target,"crit",null,delay);delay+=85;}
  const next=p.events[p.index];
  if(next?.type==="drain"){
   p.index++;
   spawnFx("player","drain",null,delay);
   if(Number(next.healed)>0)spawnFx("player","heal",`+${next.healed} HP`,delay+85);
  }
 }

 window.prepareCombatPresentation=function(result,options={}){
  if(!combatScreen()||options.logs===false){if(!combatScreen())presentation=null;return;}
  ensureCombatExtras();
  presentation={events:Array.isArray(result?.events)?result.events.slice():[],index:0};
  window.setCombatLog(result?.logs||[]);
 };

 document.addEventListener("animationstart",event=>{
  const el=event.target;
  if(!(el instanceof Element)||!el.classList.contains("combat-damage"))return;
  if(event.animationName!=="damagePop")return;
  const target=(el.id==="combatPlayerDamage"||el.id==="voidPlayerDamage")?"player":(el.id==="combatEnemyDamage"||el.id==="voidEnemyDamage")?"enemy":null;
  if(target)consumeForPulse(target,el.textContent||"");
 },true);

 const modal=document.getElementById("battleResultModal");
 if(modal&&typeof MutationObserver!=="undefined")new MutationObserver(queueResultLog).observe(modal,{attributes:true,attributeFilter:["class"],childList:true,subtree:true});
 const main=document.getElementById("main");
 if(main&&typeof MutationObserver!=="undefined")new MutationObserver(queueResultLog).observe(main,{childList:true,subtree:true});

 installStyles();
})();
