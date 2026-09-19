(function(){
 const COMBAT_PRESENTATION_VERSION=2;
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
 let presentationSerial=0;
 let floatSerial=0;
 let syncingHp=false;
 let structuredPlayback=false;
 const manualPulseSkips={player:0,enemy:0};


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
 function shieldBarElement(target="player",create=false){
  const hpBar=hpElements(target).bar,parent=hpBar?.parentElement;
  if(!parent)return null;
  let shield=parent.querySelector(".combat-shield-bar");
  if(!shield&&create){
   shield=document.createElement("span");
   shield.className="combat-shield-bar";
   parent.appendChild(shield);
  }
  return shield;
 }
 function syncCombatShieldTarget(target,current,max){
  const shield=shieldBarElement(target,!!presentation?.active);
  if(!shield)return;
  if(!presentation?.active||max<=0||current<=0){
   shield.style.width="0%";
   shield.classList.remove("active");
   return;
  }
  shield.style.width=`${Math.max(0,Math.min(100,current/max*100))}%`;
  shield.classList.add("active");
 }
 function syncCombatShieldDom(){
  const p=presentation;
  syncCombatShieldTarget("player",Math.max(0,Number(p?.playerShield)||0),Math.max(0,Number(p?.playerShieldMax)||0));
  syncCombatShieldTarget("enemy",Math.max(0,Number(p?.enemyShield)||0),Math.max(0,Number(p?.enemyShieldMax)||0));
 }
 function syncCombatHpDom(){
  const p=presentation,screen=combatScreen();if(!p||p.active!==true||!screen||(p.screen&&p.screen!==screen))return;
  syncingHp=true;
  try{
   [["player",p.playerHp,p.playerMaxHp],["enemy",p.enemyHp,p.enemyMaxHp]].forEach(([target,current,max])=>{
    const {text,bar}=hpElements(target);if(!text&&!bar)return;
    const hp=Math.max(0,Math.min(max,current)),label=`${hp} / ${max}`,width=`${Math.max(0,Math.min(100,hp/max*100))}%`;
    if(text&&text.textContent!==label)text.textContent=label;
    if(bar&&bar.style.width!==width)bar.style.width=width;
   });
  }finally{syncingHp=false;}
  syncCombatShieldDom();
 }
 window.syncCombatPresentationPlayerHp=syncCombatHpDom;
 window.syncCombatPresentationHp=syncCombatHpDom;
 window.getCombatPresentationPlayerHp=function(){return presentation?.active?presentation.playerHp:null;};
 window.getCombatPresentationEnemyHp=function(){return presentation?.active?presentation.enemyHp:null;};
 window.getCombatPresentationPlayerShield=function(){return presentation?.active?presentation.playerShield:null;};
 window.getCombatPresentationPlayerShieldMax=function(){return presentation?.active?presentation.playerShieldMax:null;};
 window.isCombatPresentationActive=function(){return presentation?.active===true;};
 window.getCombatPresentationSnapshot=function(){
  const p=presentation;if(!p?.active)return null;
  return {token:p.token,mode:p.mode||"standard",playerHp:p.playerHp,playerMaxHp:p.playerMaxHp,enemyHp:p.enemyHp,enemyMaxHp:p.enemyMaxHp,playerShield:p.playerShield,playerShieldMax:p.playerShieldMax,enemyShield:p.enemyShield||0,enemyShieldMax:p.enemyShieldMax||0,index:p.index,eventCount:p.events.length};
 };
 window.clearCombatPresentation=function(reason="clear"){
  if(!presentation){manualPulseSkips.player=0;manualPulseSkips.enemy=0;return null;}
  const cleared={token:presentation.token,reason};
  presentation.active=false;
  presentation=null;
  manualPulseSkips.player=0;
  manualPulseSkips.enemy=0;
  document.querySelectorAll(".combat-shield-bar").forEach(el=>el.remove());
  return cleared;
 };

 function installStyles(){
  if(document.getElementById("combatFxStyles"))return;
  const style=document.createElement("style");
  style.id="combatFxStyles";
  style.textContent=`
   .combat-fx-layer{position:absolute;inset:0;pointer-events:none;overflow:visible;z-index:6}\n   .combatant .big-hp .bar{position:relative;overflow:hidden}\n   .combat-shield-bar{position:absolute;left:0;top:0;bottom:0;width:0;z-index:3;pointer-events:none;background:rgba(250,252,255,.96);box-shadow:0 0 8px rgba(255,255,255,.92);opacity:0;transition:width .18s ease,opacity .12s ease}\n   .combat-shield-bar.active{opacity:1}
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
  const p=presentation;if(!p?.active||evt?.type!=="mark")return;
  if(evt.mark==="ward"&&evt.action==="activate"){
   const shield=Math.max(0,Math.floor(Number(evt.shield)||0));
   p.playerShield=shield;p.playerShieldMax=Math.max(p.playerShieldMax,shield);
  }else if(evt.mark==="ward"&&evt.action==="absorb"){
   const remaining=Number(evt.remainingShield);
   p.playerShield=Number.isFinite(remaining)?Math.max(0,Math.floor(remaining)):Math.max(0,p.playerShield-Math.max(0,Math.floor(Number(evt.amount)||0)));
  }else if(evt.mark==="absorption"&&evt.action==="trigger"){
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
 window.consumeCombatPresentationPulseManual=function(target,text){
  const match=consumeForPulse(target,text);
  if(match&&(target==="player"||target==="enemy"))manualPulseSkips[target]=(manualPulseSkips[target]||0)+1;
  return match;
 };

 function directMotion(attacker){
  const card=combatCard(attacker==="player"?"player":"enemy");
  if(!card)return;
  card.classList.remove("attacking");void card.offsetWidth;card.classList.add("attacking");
  setTimeout(()=>card.classList.remove("attacking"),340);
 }
 function directPulse(target,text){
  const card=combatCard(target),dmg=document.getElementById(target==="player"?"combatPlayerDamage":"combatEnemyDamage")||document.getElementById(target==="player"?"voidPlayerDamage":"voidEnemyDamage");
  if(card&&text!=="閃避"&&text!=="吸收"){card.classList.remove("hit");void card.offsetWidth;card.classList.add("hit");setTimeout(()=>card.classList.remove("hit"),260);}
  if(dmg){dmg.textContent=text;dmg.classList.remove("show");void dmg.offsetWidth;dmg.classList.add("show");}
 }
 const structuredSleep=ms=>new Promise(resolve=>setTimeout(resolve,Math.max(0,Number(ms)||0)));
 window.animateStructuredCombatPresentation=async function(result,options={}){
  const p=presentation;
  if(!p?.active||!Array.isArray(p.events))throw new Error("Combat Presentation 尚未初始化。");
  p.screen=combatScreen()||p.screen||null;
  const kind=String(result?.e?.kind||options.kind||"");
  const impactDelay=Math.max(0,Number(options.impactDelay??90)||0);
  const stepDelay=Math.max(0,Number(options.stepDelay??(kind==="boss"?210:150))||0);
  const openingDelay=Math.max(0,Number(options.openingDelay??140)||0);
  const endDelay=Math.max(0,Number(options.endDelay??220)||0);
  structuredPlayback=true;
  ensureCombatExtras();
  syncCombatHpDom();
  try{
   await structuredSleep(openingDelay);
   while(p.active&&p.index<p.events.length){
    const evt=p.events[p.index++];
    if(!evt)continue;
    if(evt.type==="mark"){
     const desc=markFxDescriptor(evt);
     applyMarkPresentation(evt);
     if(desc)spawnFx(desc.target,desc.kind,desc.text,0);
     syncCombatHpDom();
     if(desc)await structuredSleep(Math.min(stepDelay,85));
     continue;
    }
    if(evt.type==="combo"){spawnFx("enemy","combo");await structuredSleep(Math.min(stepDelay,70));continue;}
    if(evt.type==="counter"){spawnFx("enemy","counter");await structuredSleep(Math.min(stepDelay,70));continue;}
    if(evt.type==="berserk"){spawnFx("enemy","berserk");await structuredSleep(Math.min(stepDelay,70));continue;}
    if(evt.type==="drain"){
     const healed=Math.max(0,Math.floor(Number(evt.healed)||0));
     if(healed>0)p.playerHp=Math.min(p.playerMaxHp,p.playerHp+healed);
     spawnFx("player","drain");
     if(healed>0)spawnFx("player","heal",`+${healed} HP`,70);
     syncCombatHpDom();
     await structuredSleep(stepDelay);
     continue;
    }
    if(evt.type==="dodge"){
     const target=evt.target==="player"?"player":"enemy",attacker=target==="player"?"enemy":"player";
     directMotion(attacker);await structuredSleep(impactDelay);
     directPulse(target,"閃避");
     syncCombatHpDom();
     await structuredSleep(stepDelay);
     continue;
    }
    if(evt.type==="attack"){
     const actor=evt.actor==="enemy"?"enemy":"player",target=actor==="player"?"enemy":"player";
     directMotion(actor);await structuredSleep(impactDelay);
     if(actor==="player"){
      p.enemyHp=Math.max(0,p.enemyHp-Math.max(0,Math.floor(Number(evt.actualDamage)||0)));
      if(evt.initiative)spawnFx("enemy","initiative");
      if(evt.penetration)spawnFx("enemy","penetration",null,70);
     }else{
      const shieldAbsorbed=Math.max(0,Math.floor(Number(evt.shieldAbsorbed)||0));
      if(shieldAbsorbed>0)p.playerShield=Math.max(0,p.playerShield-shieldAbsorbed);
      p.playerHp=Math.max(0,p.playerHp-Math.max(0,Math.floor(Number(evt.actualDamage)||0)));
     }
     if(evt.absorbed)directPulse(target,"吸收");
     else{
      const shown=Math.max(0,Math.floor(Number(evt.damage)||0));
      directPulse(target,evt.crit?`暴擊 -${shown}`:`-${shown}`);
     }
     syncCombatHpDom();
     await structuredSleep(stepDelay);
     continue;
    }
   }
   syncCombatHpDom();
   await structuredSleep(endDelay);
   return window.getCombatPresentationSnapshot();
  }finally{
   structuredPlayback=false;
   if(options.clearAfter===true)window.clearCombatPresentation(options.clearReason||"structured-end");
  }
 };
 window.COMBAT_STRUCTURED_PRESENTATION_VERSION=1;

 function mirrorUiTarget(key){return key==="player"?"player":"enemy";}
 function mirrorMarkUiTarget(evt){
  if(evt?.type!=="mark")return null;
  if(evt.mark==="suppression"||evt.mark==="ignore"||evt.mark==="backlash")return mirrorUiTarget(evt.target);
  return mirrorUiTarget(evt.owner);
 }
 function applyMirrorMarkPresentation(evt){
  const p=presentation;if(!p?.active||p.mode!=="mirror"||evt?.type!=="mark")return;
  const owner=mirrorUiTarget(evt.owner),target=mirrorUiTarget(evt.target);
  if(evt.mark==="ward"&&evt.action==="activate"){
   const shield=Math.max(0,Math.floor(Number(evt.shield)||0));
   if(owner==="player"){p.playerShield=shield;p.playerShieldMax=Math.max(p.playerShieldMax,shield);}
   else {p.enemyShield=shield;p.enemyShieldMax=Math.max(p.enemyShieldMax,shield);}
  }else if(evt.mark==="ward"&&evt.action==="absorb"){
   const remaining=Math.max(0,Math.floor(Number(evt.remainingShield)||0));
   if(owner==="player")p.playerShield=remaining;else p.enemyShield=remaining;
  }else if(evt.mark==="absorption"&&evt.action==="trigger"){
   const healed=Math.max(0,Math.floor(Number(evt.healed)||0));
   if(owner==="player")p.playerHp=Math.min(p.playerMaxHp,p.playerHp+healed);else p.enemyHp=Math.min(p.enemyMaxHp,p.enemyHp+healed);
  }else if(evt.mark==="backlash"&&evt.action==="trigger"){
   const damage=Math.max(0,Math.floor(Number(evt.actualDamage??evt.damage)||0));
   if(target==="player")p.playerHp=Math.max(0,p.playerHp-damage);else p.enemyHp=Math.max(0,p.enemyHp-damage);
  }
 }
 window.prepareMirrorCombatPresentation=function(result){
  window.clearCombatPresentation("mirror-replace");
  if(!result)return null;
  const maxHp=Math.max(1,Math.floor(Number(result.maxHp)||1)),events=Array.isArray(result.events)?result.events.slice():[];
  const playerWard=events.find(evt=>evt?.type==="mark"&&evt.owner==="player"&&evt.mark==="ward"&&evt.action==="activate");
  const mirrorWard=events.find(evt=>evt?.type==="mark"&&evt.owner==="mirror"&&evt.mark==="ward"&&evt.action==="activate");
  const playerShield=Math.max(0,Math.floor(Number(playerWard?.shield)||0)),enemyShield=Math.max(0,Math.floor(Number(mirrorWard?.shield)||0));
  presentation={active:true,token:++presentationSerial,mode:"mirror",screen:combatScreen()||null,events,index:0,playerHp:maxHp,playerMaxHp:maxHp,enemyHp:maxHp,enemyMaxHp:maxHp,playerShield,playerShieldMax:playerShield,enemyShield,enemyShieldMax:enemyShield};
  if(combatScreen())ensureCombatExtras();
  return window.getCombatPresentationSnapshot();
 };
 window.animateMirrorStructuredCombatPresentation=async function(result,options={}){
  if(!presentation?.active||presentation.mode!=="mirror")window.prepareMirrorCombatPresentation(result);
  const p=presentation;if(!p?.active)throw new Error("Mirror Combat Presentation 尚未初始化。");
  p.screen=combatScreen()||p.screen||null;
  const impactDelay=Math.max(0,Number(options.impactDelay??70)||0),stepDelay=Math.max(0,Number(options.stepDelay??75)||0),openingDelay=Math.max(0,Number(options.openingDelay??120)||0),endDelay=Math.max(0,Number(options.endDelay??180)||0);
  structuredPlayback=true;ensureCombatExtras();syncCombatHpDom();
  try{
   await structuredSleep(openingDelay);
   while(p.active&&p.index<p.events.length){
    const evt=p.events[p.index++];if(!evt)continue;
    if(evt.type==="firstActor"){await structuredSleep(Math.min(stepDelay,55));continue;}
    if(evt.type==="mark"){
     const desc=markFxDescriptor(evt),target=mirrorMarkUiTarget(evt);
     applyMirrorMarkPresentation(evt);
     if(desc&&target)spawnFx(target,desc.kind,desc.text,0);
     syncCombatHpDom();
     if(desc)await structuredSleep(Math.min(stepDelay,70));
     continue;
    }
    if(evt.type==="combo"){spawnFx(mirrorUiTarget(evt.actor==="player"?"mirror":"player"),"combo");await structuredSleep(Math.min(stepDelay,60));continue;}
    if(evt.type==="counter"){spawnFx(mirrorUiTarget(evt.actor==="player"?"mirror":"player"),"counter");await structuredSleep(Math.min(stepDelay,60));continue;}
    if(evt.type==="drain"){
     const actor=mirrorUiTarget(evt.actor),healed=Math.max(0,Math.floor(Number(evt.healed)||0));
     if(actor==="player")p.playerHp=Math.min(p.playerMaxHp,p.playerHp+healed);else p.enemyHp=Math.min(p.enemyMaxHp,p.enemyHp+healed);
     spawnFx(actor,"drain");if(healed>0)spawnFx(actor,"heal",`+${healed} HP`,60);
     syncCombatHpDom();await structuredSleep(stepDelay);continue;
    }
    if(evt.type==="dodge"){
     const actor=mirrorUiTarget(evt.actor),target=mirrorUiTarget(evt.target);
     directMotion(actor);await structuredSleep(impactDelay);directPulse(target,"閃避");syncCombatHpDom();await structuredSleep(stepDelay);continue;
    }
    if(evt.type==="attack"){
     const actor=mirrorUiTarget(evt.actor),target=mirrorUiTarget(evt.target);
     directMotion(actor);await structuredSleep(impactDelay);
     const shieldAbsorbed=Math.max(0,Math.floor(Number(evt.shieldAbsorbed)||0)),actualDamage=Math.max(0,Math.floor(Number(evt.actualDamage)||0));
     if(target==="player"){p.playerShield=Math.max(0,p.playerShield-shieldAbsorbed);p.playerHp=Math.max(0,p.playerHp-actualDamage);}
     else {p.enemyShield=Math.max(0,p.enemyShield-shieldAbsorbed);p.enemyHp=Math.max(0,p.enemyHp-actualDamage);}
     if(evt.initiative)spawnFx(target,"initiative");
     if(evt.penetration)spawnFx(target,"penetration",null,60);
     if(evt.absorbed)directPulse(target,"吸收");else directPulse(target,evt.crit?`暴擊 -${Math.max(0,Math.floor(Number(evt.damage)||0))}`:`-${Math.max(0,Math.floor(Number(evt.damage)||0))}`);
     syncCombatHpDom();await structuredSleep(stepDelay);continue;
    }
    if(evt.type==="battleEnd")break;
   }
   syncCombatHpDom();await structuredSleep(endDelay);return window.getCombatPresentationSnapshot();
  }finally{
   structuredPlayback=false;
   if(options.clearAfter===true)window.clearCombatPresentation(options.clearReason||"mirror-structured-end");
  }
 };
 window.MIRROR_STRUCTURED_PRESENTATION_VERSION=1;

 window.prepareCombatPresentation=function(result,options={}){
  window.clearCombatPresentation("replace");
  if(options.logs===false||!result)return null;
  const playerMaxHp=Math.max(1,Math.floor(Number(result?.playerMaxHp)||1));
  const playerStartHp=Math.max(0,Math.min(playerMaxHp,Math.floor(Number(result?.playerStartHp)||playerMaxHp)));
  const enemyMaxHp=Math.max(1,Math.floor(Number(result?.e?.hp)||1));
  const enemyStartHp=Math.max(0,Math.min(enemyMaxHp,Math.floor(Number(result?.enemyStartHp??enemyMaxHp)||enemyMaxHp)));
  const events=Array.isArray(result?.events)?result.events.slice():[];
  const wardActivate=events.find(evt=>evt?.type==="mark"&&evt.mark==="ward"&&evt.action==="activate");
  const openingShield=Math.max(0,Math.floor(Number(wardActivate?.shield)||0));
  presentation={active:true,token:++presentationSerial,mode:"standard",screen:combatScreen()||null,events,index:0,playerHp:playerStartHp,playerMaxHp,enemyHp:enemyStartHp,enemyMaxHp,playerShield:openingShield,playerShieldMax:openingShield,enemyShield:0,enemyShieldMax:0};
  if(combatScreen())ensureCombatExtras();
  return window.getCombatPresentationSnapshot();
 };

 document.addEventListener("animationstart",event=>{
  const el=event.target;
  if(!(el instanceof Element)||!el.classList.contains("combat-damage"))return;
  if(event.animationName!=="damagePop"||structuredPlayback)return;
  el.classList.toggle("dodge-text",String(el.textContent||"").includes("閃避"));
  const target=(el.id==="combatPlayerDamage"||el.id==="voidPlayerDamage")?"player":(el.id==="combatEnemyDamage"||el.id==="voidEnemyDamage")?"enemy":null;
  if(target){if((manualPulseSkips[target]||0)>0)manualPulseSkips[target]--;else consumeForPulse(target,el.textContent||"");}
 },true);
 document.addEventListener("animationend",event=>{
  const el=event.target;
  if(el instanceof Element&&el.classList.contains("combat-damage")&&event.animationName==="damagePop")el.classList.remove("dodge-text");
 },true);

 const hpObserver=new MutationObserver(mutations=>{
  if(syncingHp||!presentation?.active||!combatScreen())return;
  const ids=new Set(["combatPlayerHp","voidPlayerHp","combatPlayerBar","voidPlayerBar","combatEnemyHp","voidEnemyHp","combatEnemyBar","voidEnemyBar"]);
  if(mutations.some(m=>ids.has(m.target?.id)))queueMicrotask(syncCombatHpDom);
 });
 hpObserver.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["style"]});

 window.COMBAT_PRESENTATION_VERSION=COMBAT_PRESENTATION_VERSION;

 window.COMBAT_MARK_FX_VERSION=1;
 installStyles();
})();