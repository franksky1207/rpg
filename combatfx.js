(function(){
 const FX_LABELS={
  initiative:{text:"先制！",className:"initiative"},
  combo:{text:"連擊！",className:"combo"},
  penetration:{text:"穿透！",className:"penetration"},
  counter:{text:"反擊！",className:"counter"},
  drain:{text:"汲取！",className:"drain"},
  berserk:{text:"狂暴！",className:"berserk"},
  heal:{text:"",className:"heal"}
 };
 let presentation=null;
 let floatSerial=0;
 let syncingPlayerHp=false;

 function combatScreen(){return document.querySelector("#main .combat-screen");}
 function combatCard(target){
  return document.getElementById(target==="player"?"combatPlayerCard":"combatEnemyCard")||document.getElementById(target==="player"?"voidPlayerCard":"voidEnemyCard");
 }
 function playerHpElements(){
  const text=document.getElementById("combatPlayerHp")||document.getElementById("voidPlayerHp");
  const bar=document.getElementById("combatPlayerBar")||document.getElementById("voidPlayerBar");
  return {text,bar};
 }
 function syncPlayerHpDom(){
  const p=presentation;if(!p||!combatScreen())return;
  const {text,bar}=playerHpElements();if(!text&&!bar)return;
  const hp=Math.max(0,Math.min(p.playerMaxHp,p.playerHp)),label=`${hp} / ${p.playerMaxHp}`,width=`${Math.max(0,Math.min(100,hp/p.playerMaxHp*100))}%`;
  syncingPlayerHp=true;
  try{
   if(text&&text.textContent!==label)text.textContent=label;
   if(bar&&bar.style.width!==width)bar.style.width=width;
  }finally{syncingPlayerHp=false;}
 }
 window.syncCombatPresentationPlayerHp=syncPlayerHpDom;
 window.getCombatPresentationPlayerHp=function(){return presentation?presentation.playerHp:null;};

 function installStyles(){
  if(document.getElementById("combatFxStyles"))return;
  const style=document.createElement("style");
  style.id="combatFxStyles";
  style.textContent=`
   .combat-fx-layer{position:absolute;inset:0;pointer-events:none;overflow:visible;z-index:6}
   .combat-fx-pop{position:absolute;top:18%;transform:translate(-50%,0);font-size:22px;font-weight:900;letter-spacing:.05em;white-space:nowrap;opacity:0;pointer-events:none;text-shadow:0 2px 7px #000,0 0 12px rgba(0,0,0,.8);animation:combatFxPop .72s ease-out forwards;z-index:7}
   .combat-fx-pop.initiative{color:#FFD54A}.combat-fx-pop.combo{color:#FF8A3D}.combat-fx-pop.penetration{color:#B56CFF}.combat-fx-pop.counter{color:#FF5252}.combat-fx-pop.drain{color:#4CD964}.combat-fx-pop.berserk{color:#FF7043}.combat-fx-pop.heal{color:#7CFF8E;font-size:18px}
   .combat-damage.dodge-text{color:#B8F4FF}
   @keyframes combatFxPop{0%{opacity:0;transform:translate(-50%,10px) scale(.82)}18%{opacity:1;transform:translate(-50%,-2px) scale(1.08)}72%{opacity:1}100%{opacity:0;transform:translate(-50%,-58px) scale(1)}}
   @media(max-width:760px){.combat-fx-pop{font-size:18px;top:14%}.combat-fx-pop.heal{font-size:16px}}
  `;
  document.head.appendChild(style);
 }

 function ensureCombatExtras(){
  installStyles();
  const screen=combatScreen();if(!screen)return false;
  ["player","enemy"].forEach(target=>{
   const card=combatCard(target);if(card&&!card.querySelector(".combat-fx-layer")){const layer=document.createElement("div");layer.className="combat-fx-layer";card.appendChild(layer);}
  });
  syncPlayerHpDom();
  return true;
 }
 window.ensureCombatExtras=ensureCombatExtras;

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
  if(match.type==="dodge"){syncPlayerHpDom();return;}
  if(target==="player"&&match.actor==="enemy")p.playerHp=Math.max(0,p.playerHp-Math.max(0,Math.floor(Number(match.actualDamage)||0)));
  if(match.initiative){spawnFx(target,"initiative",null,delay);delay+=85;}
  if(match.penetration){spawnFx(target,"penetration",null,delay);delay+=85;}
  const next=p.events[p.index];
  if(next?.type==="drain"){
   p.index++;
   const healed=Math.max(0,Math.floor(Number(next.healed)||0));
   if(healed>0)p.playerHp=Math.min(p.playerMaxHp,p.playerHp+healed);
   spawnFx("player","drain",null,delay);
   if(healed>0)spawnFx("player","heal",`+${healed} HP`,delay+85);
  }
  syncPlayerHpDom();
 }

 window.prepareCombatPresentation=function(result,options={}){
  if(options.logs===false){presentation=null;return;}
  const maxHp=Math.max(1,Math.floor(Number(result?.playerMaxHp)||1));
  const startHp=Math.max(0,Math.min(maxHp,Math.floor(Number(result?.playerStartHp)||maxHp)));
  presentation={events:Array.isArray(result?.events)?result.events.slice():[],index:0,playerHp:startHp,playerMaxHp:maxHp};
  if(combatScreen())ensureCombatExtras();
 };

 document.addEventListener("animationstart",event=>{
  const el=event.target;
  if(!(el instanceof Element)||!el.classList.contains("combat-damage"))return;
  if(event.animationName!=="damagePop")return;
  el.classList.toggle("dodge-text",String(el.textContent||"").includes("閃避"));
  const target=(el.id==="combatPlayerDamage"||el.id==="voidPlayerDamage")?"player":(el.id==="combatEnemyDamage"||el.id==="voidEnemyDamage")?"enemy":null;
  if(target)consumeForPulse(target,el.textContent||"");
 },true);
 document.addEventListener("animationend",event=>{
  const el=event.target;
  if(el instanceof Element&&el.classList.contains("combat-damage")&&event.animationName==="damagePop")el.classList.remove("dodge-text");
 },true);

 const hpObserver=new MutationObserver(mutations=>{
  if(syncingPlayerHp||!presentation||!combatScreen())return;
  const ids=new Set(["combatPlayerHp","voidPlayerHp","combatPlayerBar","voidPlayerBar"]);
  if(mutations.some(m=>ids.has(m.target?.id)))queueMicrotask(syncPlayerHpDom);
 });
 hpObserver.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["style"]});

 installStyles();
})();