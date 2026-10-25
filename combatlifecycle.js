/* Single-battle presentation authority. No combat calculation or event copies. */
(function(){
 "use strict";
 let serial=0,active=null,blurTimer=null,lostFocus=false,departed=false,departureEpoch=0,away=false;
 const checkpoints=new WeakMap();
 const backgroundAllowed=()=>window.gmBackgroundBattleEnabled?.()===true;
 const interrupted=()=>Object.assign(new Error("戰鬥已中止，可重新挑戰。"),{code:"COMBAT_INTERRUPTED"});
 function invalidate(battle,reason){
  if(!battle||battle.done||battle.cancelled)return false;
  // Invalidate first. Neither a save callback nor an expired sleep may revive this battle.
  battle.cancelled=true;battle.reason=reason;
  try{battle.flush(true);}catch(error){battle.saveError=error;}
  finally{for(const wake of battle.waiters)wake();battle.waiters.clear();if(window.getCombatPresentationSnapshot?.()?.token===battle.presentationToken)window.clearCombatPresentation?.("foreground-interrupted");}
  return true;
 }
 function cancel(reason="interrupted"){return backgroundAllowed()?false:invalidate(active,reason);}
 function depart(reason){if(backgroundAllowed())return;if(!away){away=true;departureEpoch++;}cancel(reason);}
 function begin(result){
  if((document.visibilityState==="hidden"||lostFocus||departed)&&!backgroundAllowed()){depart("hidden-start");throw interrupted();}
  if(active&&!active.done)invalidate(active,"superseded");
  const checkpoint=checkpoints.get(result)||checkpoints.get(result?.events);
  let lastSave=performance.now(),positiveHp=null,applied=0;
  const battle={id:++serial,presentationToken:window.getCombatPresentationSnapshot?.()?.token,cancelled:false,done:false,waiters:new Set(),
   check(){if(this.saveError)throw this.saveError;if(this.cancelled||active!==this)throw interrupted();},
   applied(p){this.check();if(p.enemyHp>0){positiveHp=p.enemyHp;applied=p.index;}this.flush(false);},
   flush(force){if(!checkpoint||positiveHp==null||!force&&performance.now()-lastSave<5000)return;const saved=checkpoint(positiveHp,applied);if(saved?.ok===false)throw Object.assign(new Error(saved.reason||"戰鬥進度保存失敗。"),{code:"COMBAT_CHECKPOINT_FAILED"});lastSave=performance.now();},
   async sleep(ms,sleeper){
    this.check();let wake;const cancelled=new Promise(resolve=>{wake=resolve;this.waiters.add(wake);});
    try{await Promise.race([sleeper(ms),cancelled]);this.check();}finally{this.waiters.delete(wake);}
   },
   complete(){this.check();this.done=true;},
   finish(){this.waiters.clear();if(active===this)active=null;}
  };
  active=battle;
  return battle;
 }
 window.CivilizationCombatLifecycle=Object.freeze({begin,cancel,interrupted,isInterrupted:error=>error?.code==="COMBAT_INTERRUPTED",
  checkpoint(result,fn){if(result&&typeof fn==="function"){checkpoints.set(result,fn);if(result.events)checkpoints.set(result.events,fn);}},
  calamityCheckpoint(result,world){
   const id=result.definition?.id||result.calamityId,def=result.definition;
   const getter=world===1?()=>window.getCivilizationCalamityCurrentHp(id):()=>window.getSecondWorldCalamityCurrentHp(id);
   const persistent=world===1?window.getCivilizationCalamityStatus(id)?.mark?.level<10:!window.isSecondWorldCalamityCompleted(id,state);
   if(!persistent)return;
   let expected=getter(),lastIndex=-1;
   this.checkpoint(result.combat,(hp,index)=>{
    if(index<lastIndex||hp<=0||hp>result.enemy.hp)return {ok:false,reason:"checkpoint-range"};
    if(hp===expected)return {ok:true};
    const tx=window.runSettlementTransaction({label:"calamity-played-hp",mutate:live=>{
     if(getter()!==expected)return {ok:false,reason:"stale-checkpoint"};
     const row=world===1?live.calamities?.entries?.[id]:live.secondWorld?.calamities?.[def.index];
     if(!row)return {ok:false,reason:"checkpoint-row-missing"};row.currentHp=hp;return {ok:true};
    }});
    if(tx.ok){expected=hp;lastIndex=index;}return tx;
   });
  },
  epoch:()=>departureEpoch,
  snapshot:()=>active?{id:active.id,cancelled:active.cancelled,done:active.done,reason:active.reason||""}:null,
  foreground(expectedEpoch=departureEpoch){if(expectedEpoch!==departureEpoch)throw interrupted();if((document.visibilityState==="hidden"||lostFocus||departed)&&!backgroundAllowed())throw interrupted();}
 });
 document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")depart("visibility-hidden");else{away=false;if(document.hasFocus?.()===true){lostFocus=false;clearTimeout(blurTimer);}}});
 window.addEventListener("pagehide",()=>{departed=true;depart("pagehide");});
 // Recheck sustained focus loss; a same-page synthetic blur with focus retained
 // is ignored. Short modal focus returns cancel this timer. Hidden/pagehide never wait.
 window.addEventListener("blur",()=>{clearTimeout(blurTimer);blurTimer=setTimeout(()=>{
  const focused=document.hasFocus?.()===true;
  if(!focused){lostFocus=true;depart("window-blur");}
 },200);});
 window.addEventListener("focus",()=>{lostFocus=false;away=false;clearTimeout(blurTimer);});
 window.addEventListener("pageshow",()=>{departed=false;lostFocus=false;away=false;clearTimeout(blurTimer);});
})();
