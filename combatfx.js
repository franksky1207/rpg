(function(){
 const FX_LABELS={
  initiative:{text:"先制！",className:"initiative"},
  combo:{text:"連擊！",className:"combo"},
  penetration:{text:"穿透！",className:"penetration"},
  counter:{text:"反擊！",className:"counter"},
  drain:{text:"汲取！",className:"drain"},
  berserk:{text:"狂暴！",className:"berserk"},
  heal:{text:"",className:"heal"},
  markDefense:{text:"",className:"mark mark-defense"},
  markOffense:{text:"",className:"mark mark-offense"},
  markPower:{text:"",className:"mark mark-power"}
 };
 let presentation=null;
 let floatSerial=0;
 let syncingHp=false;

 function combatScreen(){return document.querySelector("#main .combat-screen");}
 function combatCard(target){
  return document.getElementById(target==="player"?"combatPlayerCard":"combatEnemyCard")||document.getElementById(target==="player"?"voidPlayerCard":"voidEnemyCard");
 }
 function hpElements(target){
  const prefix=target==="player"?"Player":"Enemy";
  const text=document.getElementById(`combat${prefix}Hp`)||document.getElementById(`void${prefix}Hp`);
  const bar=document.getElementById(`combat${prefix}Bar`)||document.getElementById(`void${prefix}Bar`);
  return {text,bar};
 }
 function syncCombatHpDom(){
  const p=presentation;if(!p||!combatScreen())return;
  syncingHp=true;
  try{
   [["player",p.playerHp,p.playerMaxHp],["enemy",p.enemyHp,p.enemyMaxHp]].forEach(([target,current,max])=>{
    const {text,bar}=hpElements(target);if(!text&&!bar)return;
    const hp=Math.max(0,Math.min(max,current)),label=`${hp} / ${max}`,width=`${Math.max(0,Math.min(100,hp/max*100))}%`;
    if(text&&text.textContent!==label)text.textContent=label;
    if(bar&&bar.style.width!==width)bar.style.width=width;
   });
  }finally{syncingHp=false;}
 }
 window.syncCombatPresentationPlayerHp=syncCombatHpDom;
 window.syncCombatPresentationHp=syncCombatHpDom;
 window.getCombatPresentationPlayerHp=function(){return presentation?presentation.playerHp:null;};
 window.getCombatPresentationEnemyHp=function(){return presentation?presentation.enemyHp:null;};

 function installStyles(){
  if(document.getElementById("combatFxStyles"))return;
  const style=document.createElement("style");
  style.id="combatFxStyles";
  style.textContent=`
   .combat-fx-layer{position:absolute;inset:0;pointer-events:none;overflow:visible;z-index:6}
   .combat-fx-pop{position:absolute;top:18%;transform:translate(-50%,0);font-size:22px;font-weight:900;letter-spacing:.05em;white-space:nowrap;opacity:0;pointer-events:none;text-shadow:0 2px 7px #000,0 0 12px rgba(0,0,0,.8);animation:combatFxPop .72s ease-out forwards;z-index:7}
   .combat-fx-pop.initiative{color:#FFD54A}.combat-fx-pop.combo{color:#FF8A3D}.combat-fx-pop.penetration{color:#B56CFF}.combat-fx-pop.counter{color:#FF5252}.combat-fx-pop.drain{color:#4CD964}.combat-fx-pop.berserk{color:#FF7043}.combat-fx-pop.heal{color:#7CFF8E;font-size:18px}
   .combat-fx-pop.mark{font-size:19px}.combat-fx-pop.mark-defense{color:#86F0FF}.combat-fx-pop.mark-offense{color:#D7A8FF}.combat-fx-pop.mark-power{color:#FFD978}
   .combat-damage.dodge-text{color:#B8F4FF}
   @keyframes combatFxPop{0%{opacity:0;transform:translate(-50%,10px) scale(.82)}18%{opacity:1;transform:translate(-50%,-2px) scale(1.08)}72%{opacity:1}100%{opacity:0;transform:translate(-50%,-58px) scale(1)}}
   @media(max-width:760px){.combat-fx-pop{font-size:18px;top:14%}.combat-fx-pop.heal{font-size:16px}.combat-fx-pop.mark{font-size:16px}}
  `;
  document.head.appendChild(style);
 }

 function ensureCombatExtras(){
  installStyles();
  const screen=combatScreen();if(!screen)return false;
  ["player","enemy"].forEach(target=>{
   const card=combatCard(target);if(card&&!card.querySelector(".combat-fx-layer")){const layer=document.createElement("div");layer.className="combat-fx-layer";card.appendChild(layer);}
  });
  syncCombatHpDom();
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

 function markFxDescriptor(evt){
  if(evt?.type!=="mark")return null;
  const mark=evt.mark,action=evt.action;
  if(mark==="ward"){
   if(action==="activate")return {target:"player",kind:"markDefense",text:"護界！"};
   if(action==="absorb")return {target:"player",kind:"markDefense",text:`護界 -${Math.max(0,Math.floor(Number(evt.amount)||0))}`};
  }
  if(mark==="suppression"&&action==="preventDodge")return {target:"enemy",kind:"markOffense",text:"壓制！"};
  if(mark==="composure"&&action==="preventCrit")return {target:"player",kind:"markDefense",text:"鎮心！"};
  if(mark==="indomitable"){
   if(action==="activate")return {target:"player",kind:"markDefense",text:"不屈！"};
   if(action==="survive")return {target:"player",kind:"markDefense",text:"不屈・存活！"};
  }
  if(mark==="resilience"&&action==="reduceCritDamage")return {target:"player",kind:"markDefense",text:"韌性！"};
  if(mark==="battleSpirit"){
   if(action==="activate")return {target:"player",kind:"markPower",text:"戰意！"};
   if(action==="layer")return {target:"player",kind:"markPower",text:`戰意 ×${Math.max(0,Math.floor(Number(evt.layer)||0))}`};
  }
  if(mark==="absorption"&&action==="trigger"){
   const healed=Math.max(0,Math.floor(Number(evt.healed)||0));
   return {target:"player",kind:"markDefense",text:healed>0?`吸收！ +${healed} HP`:"吸收！"};
  }
  if(mark==="revenge"){
   if(action==="ready")return {target:"player",kind:"markPower",text:"復仇！"};
   if(action==="consume")return {target:"player",kind:"markPower",text:"復仇暴擊！"};
  }
  if(mark==="backlash"&&action==="trigger")return {target:"enemy",kind:"markOffense",text:`反噬 -${Math.max(0,Math.floor(Number(evt.actualDamage??evt.damage)||0))}`};
  if(mark==="ignore"&&action==="trigger")return {target:"enemy",kind:"markOffense",text:"無視防禦！"};
  return null;
 }
 window.combatMarkFxDescriptor=markFxDescriptor;

 function applyMarkPresentation(evt){
  const p=presentation;if(!p||evt?.type!=="mark")return;
  if(evt.mark==="absorption"&&evt.action==="trigger"){
   const healed=Math.max(0,Math.floor(Number(evt.healed)||0));
   p.playerHp=Math.min(p.playerMaxHp,p.playerHp+healed);
  }else if(evt.mark==="backlash"&&evt.action==="trigger"){
   const damage=Math.max(0,Math.floor(Number(evt.actualDamage??evt.damage)||0));
   p.enemyHp=Math.max(0,p.enemyHp-damage);
  }
 }
 function emitMark(evt,delay=0){
  const desc=markFxDescriptor(evt);
  applyMarkPresentation(evt);
  if(desc)spawnFx(desc.target,desc.kind,desc.text,delay);
  return desc?85:0;
 }
 function isPostMark(evt){
  if(evt?.type!=="mark")return false;
  return (evt.mark==="ward"&&evt.action==="absorb")
   ||(evt.mark==="indomitable"&&evt.action==="survive")
   ||(evt.mark==="absorption"&&evt.action==="trigger")
   ||(evt.mark==="revenge"&&evt.action==="ready")
   ||(evt.mark==="backlash"&&evt.action==="trigger");
 }

 function emitPrelude(events,target){
  let delay=0;
  for(const evt of events){
   if(evt.type==="combo"){spawnFx(target,"combo",null,delay);delay+=85;}
   else if(evt.type==="counter"){spawnFx(target,"counter",null,delay);delay+=85;}
   else if(evt.type==="berserk"){spawnFx("enemy","berserk",null,delay);delay+=85;}
   else if(evt.type==="mark")delay+=emitMark(evt,delay);
  }
  return delay;
 }
 function consumePostEvents(delay=0){
  const p=presentation;if(!p||!Array.isArray(p.events))return delay;
  while(p.index<p.events.length){
   const evt=p.events[p.index];
   if(evt?.type==="drain"){
    p.index++;
    const healed=Math.max(0,Math.floor(Number(evt.healed)||0));
    if(healed>0)p.playerHp=Math.min(p.playerMaxHp,p.playerHp+healed);
    spawnFx("player","drain",null,delay);delay+=85;
    if(healed>0){spawnFx("player","heal",`+${healed} HP`,delay);delay+=85;}
    continue;
   }
   if(isPostMark(evt)){
    p.index++;
    delay+=emitMark(evt,delay);
    continue;
   }
   break;
  }
  return delay;
 }

 function consumeForPulse(target,text){
  const p=presentation;if(!p||!Array.isArray(p.events))return null;
  const dodge=String(text||"").includes("閃避");
  const want=evt=>dodge?(evt.type==="dodge"&&evt.target===target):(evt.type==="attack"&&((target==="enemy"&&evt.actor==="player")||(target==="player"&&evt.actor==="enemy")));
  const pre=[];let match=null;
  while(p.index<p.events.length){
   const evt=p.events[p.index++];
   if(want(evt)){match=evt;break;}
   if(evt.type==="combo"||evt.type==="counter"||evt.type==="berserk"||evt.type==="mark")pre.push(evt);
  }
  if(!match)return null;
  let delay=emitPrelude(pre,target);
  if(match.type==="dodge"){syncCombatHpDom();return match;}
  if(match.actor==="enemy")p.playerHp=Math.max(0,p.playerHp-Math.max(0,Math.floor(Number(match.actualDamage)||0)));
  if(match.actor==="player")p.enemyHp=Math.max(0,p.enemyHp-Math.max(0,Math.floor(Number(match.actualDamage)||0)));
  if(match.initiative){spawnFx(target,"initiative",null,delay);delay+=85;}
  if(match.penetration){spawnFx(target,"penetration",null,delay);delay+=85;}
  consumePostEvents(delay);
  syncCombatHpDom();
  return match;
 }
 window.consumeCombatPresentationPulse=consumeForPulse;

 window.prepareCombatPresentation=function(result,options={}){
  if(options.logs===false){presentation=null;return;}
  const playerMaxHp=Math.max(1,Math.floor(Number(result?.playerMaxHp)||1));
  const playerStartHp=Math.max(0,Math.min(playerMaxHp,Math.floor(Number(result?.playerStartHp)||playerMaxHp)));
  const enemyMaxHp=Math.max(1,Math.floor(Number(result?.e?.hp)||1));
  const enemyStartHp=Math.max(0,Math.min(enemyMaxHp,Math.floor(Number(result?.enemyStartHp??enemyMaxHp)||enemyMaxHp)));
  presentation={events:Array.isArray(result?.events)?result.events.slice():[],index:0,playerHp:playerStartHp,playerMaxHp,enemyHp:enemyStartHp,enemyMaxHp};
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
  if(syncingHp||!presentation||!combatScreen())return;
  const ids=new Set(["combatPlayerHp","voidPlayerHp","combatPlayerBar","voidPlayerBar","combatEnemyHp","voidEnemyHp","combatEnemyBar","voidEnemyBar"]);
  if(mutations.some(m=>ids.has(m.target?.id)))queueMicrotask(syncCombatHpDom);
 });
 hpObserver.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["style"]});

 window.COMBAT_MARK_FX_VERSION=1;
 installStyles();
})();