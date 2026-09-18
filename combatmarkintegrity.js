(function(){
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const keys=Array.from(window.MARK_KEYS||[]);
 const zero=()=>Object.fromEntries(keys.map(key=>[key,0]));
 const one=(key,level=10)=>({...zero(),[key]:level});
 const priorTestSpecs=window.gmTestSpecializations&&typeof window.gmTestSpecializations==="object"?{...window.gmTestSpecializations}:null;

 function markEvents(result,mark=null,action=null){
  return (result?.events||[]).filter(event=>event?.type==="mark"&&(mark==null||event.mark===mark)&&(action==null||event.action===action));
 }
 function attacks(result,actor){
  return (result?.events||[]).filter(event=>event?.type==="attack"&&event.actor===actor);
 }
 function hasEvent(result,type){return (result?.events||[]).some(event=>event?.type===type);}
 function fight(player,enemy,marks,rng=()=>0,startHp=null){
  return window.runCombatCore(player,enemy,startHp==null?player.hp:startHp,{logs:false,useTestSpecializations:true,markLevels:marks,rng});
 }
 function resetSpecs(counter=0,penetration=0){
  const specKeys=Array.isArray(window.SPECIALIZATION_KEYS)?window.SPECIALIZATION_KEYS:[];
  window.gmTestSpecializations=Object.fromEntries(specKeys.map(key=>[key,0]));
  if("counter" in window.gmTestSpecializations)window.gmTestSpecializations.counter=counter;
  if("penetration" in window.gmTestSpecializations)window.gmTestSpecializations.penetration=penetration;
 }

 try{
  if(typeof window.runCombatCore!=="function")fail("COMBAT_CORE_MISSING","runCombatCore 未載入");
  if(Number(window.COMBAT_MARK_INTEGRATION_VERSION)!==1)fail("COMBAT_MARK_VERSION","共用戰鬥印記整合版本應為 1",window.COMBAT_MARK_INTEGRATION_VERSION);
  resetSpecs();

  const baseline=fight({hp:100,atk:20,def:5,crit:0,dodge:0},{name:"基準敵人",hp:50,atk:10,def:4,crit:0,dodge:0},zero(),()=>.5);
  if(!baseline.win||baseline.hp!==84||baseline.enemyHp!==0||baseline.turns!==3||markEvents(baseline).length!==0)fail("BASELINE_REGRESSION","Lv.0 印記不應改變既有基準戰鬥",{win:baseline.win,hp:baseline.hp,enemyHp:baseline.enemyHp,turns:baseline.turns,events:baseline.events});

  const ward=fight({hp:100,atk:100,def:0,crit:0,dodge:0},{name:"護界測試",hp:200,atk:10,def:0,crit:0,dodge:0},one("ward"));
  const wardActivate=markEvents(ward,"ward","activate")[0],wardAbsorb=markEvents(ward,"ward","absorb")[0],wardEnemy=attacks(ward,"enemy")[0];
  if(wardActivate?.shield!==20||wardAbsorb?.amount!==10||wardEnemy?.actualDamage!==0||wardEnemy?.shieldAbsorbed!==10)fail("WARD_RULE","護界 Lv.10 應以 75% 啟動後建立 20% 最大 HP 護盾並先吸收傷害",{wardActivate,wardAbsorb,wardEnemy});

  const indomitable=fight({hp:100,atk:10,def:0,crit:0,dodge:0},{name:"不屈測試",hp:200,atk:1000,def:0,crit:0,dodge:0},one("indomitable"));
  const indomitableHits=attacks(indomitable,"enemy"),survive=markEvents(indomitable,"indomitable","survive");
  if(survive.length!==1||indomitableHits[0]?.indomitable!==true||indomitableHits[0]?.actualDamage!==99||indomitableHits[1]?.indomitable!==false||indomitable.hp!==0)fail("INDOMITABLE_RULE","不屈只能在該場第一次致命傷留下 1 HP 一次",{survive,indomitableHits,hp:indomitable.hp});

  const suppression=fight({hp:100,atk:100,def:0,crit:0,dodge:0},{name:"壓制測試",hp:200,atk:1,def:0,crit:0,dodge:5},one("suppression"),()=>.01);
  if((suppression.events||[])[0]?.type!=="attack"||(suppression.events||[])[0]?.actor!=="player")fail("SUPPRESSION_RULE","壓制 Lv.10 應將敵方 5% 閃避降到 0%",suppression.events?.slice(0,2));

  const composure=fight({hp:100,atk:100,def:0,crit:0,dodge:0},{name:"鎮心測試",hp:200,atk:1,def:0,crit:5,dodge:0},one("composure"),()=>.01);
  const composureHit=attacks(composure,"enemy")[0];
  if(composureHit?.crit!==false||composureHit?.enemyCritRate!==0)fail("COMPOSURE_RULE","鎮心 Lv.10 應將敵方 5% 暴擊率降到 0%",composureHit);

  const resilience=fight({hp:200,atk:1,def:0,crit:0,dodge:0},{name:"韌性測試",hp:2,atk:100,def:0,crit:100,dodge:0},one("resilience"),()=>.5);
  const resilienceHit=attacks(resilience,"enemy")[0];
  if(resilienceHit?.crit!==true||resilienceHit?.damage!==135)fail("RESILIENCE_RULE","韌性 Lv.10 應只降低暴擊額外傷害 30%，100 基礎傷害應成為 135",resilienceHit);

  const spirit=fight({hp:100,atk:100,def:0,crit:0,dodge:0},{name:"戰意測試",hp:200,atk:1,def:0,crit:0,dodge:0},one("battleSpirit"));
  const spiritLayer=markEvents(spirit,"battleSpirit","layer")[0],spiritHit=attacks(spirit,"player")[0];
  if(spiritLayer?.layer!==1||spiritLayer?.atkPercent!==2||spiritHit?.battleSpiritLayer!==1||spiritHit?.battleSpiritAtkPercent!==2||spiritHit?.damage!==97)fail("BATTLE_SPIRIT_RULE","戰意 Lv.10 第 1 回合應立即為第 1 層、ATK +2%",{spiritLayer,spiritHit});

  const absorption=fight({hp:100,atk:1,def:0,crit:0,dodge:0},{name:"吸收測試",hp:2,atk:100,def:0,crit:0,dodge:0},one("absorption"),()=>0,50);
  const absorptionEvent=markEvents(absorption,"absorption","trigger")[0],absorptionHit=attacks(absorption,"enemy")[0];
  if(absorptionEvent?.damage!==95||absorptionEvent?.healed!==24||absorptionHit?.actualDamage!==0||absorptionHit?.absorbed!==true||absorption.hp!==74)fail("ABSORPTION_RULE","吸收 Lv.10 應取消有效命中並回復原計算傷害 25%",{absorptionEvent,absorptionHit,hp:absorption.hp});

  const revenge=fight({hp:200,atk:10,def:0,crit:0,dodge:0},{name:"復仇測試",hp:100,atk:1,def:0,crit:100,dodge:0},one("revenge"));
  const revengePlayerHits=attacks(revenge,"player");
  if(markEvents(revenge,"revenge","ready").length<1||markEvents(revenge,"revenge","consume").length<1||revengePlayerHits[1]?.revengeCrit!==true||revengePlayerHits[1]?.crit!==true)fail("REVENGE_RULE","復仇觸發後下一次成功命中應保證暴擊並消耗 ready",{events:revenge.events,playerHits:revengePlayerHits.slice(0,3)});

  resetSpecs(0,60);
  const ignore=fight({hp:100,atk:100,def:0,crit:0,dodge:0},{name:"無視測試",hp:200,atk:1,def:1000,crit:0,dodge:0},one("ignore"));
  const ignoreHit=attacks(ignore,"player")[0];
  if(ignoreHit?.ignoreDefense!==true||ignoreHit?.penetration!==false||ignoreHit?.damage!==95)fail("IGNORE_RULE","無視觸發時應令該擊 DEF=0 並跳過專精穿透判定",ignoreHit);

  resetSpecs();
  const backlash=fight({hp:100,atk:1,def:0,crit:0,dodge:0},{name:"反噬測試",hp:20,atk:10,def:0,crit:0,dodge:0},one("backlash"));
  const backlashEvent=markEvents(backlash,"backlash","trigger")[0];
  if(backlashEvent?.hpLoss!==10||backlashEvent?.damage!==3)fail("BACKLASH_RULE","反噬 Lv.10 應以實際 HP 損失 30% 反射",backlashEvent);

  resetSpecs(60,0);
  const backlashKill=fight({hp:100,atk:1,def:0,crit:0,dodge:0},{name:"反噬順序測試",hp:4,atk:10,def:0,crit:0,dodge:0},one("backlash"));
  if(!backlashKill.win||hasEvent(backlashKill,"counter"))fail("BACKLASH_COUNTER_ORDER","反噬先擊殺敵人後不得再發動專精反擊",backlashKill.events);

  const absorbNoCounter=fight({hp:100,atk:1,def:0,crit:0,dodge:0},{name:"吸收反擊測試",hp:2,atk:100,def:0,crit:0,dodge:0},one("absorption"));
  if(hasEvent(absorbNoCounter,"counter"))fail("ABSORPTION_COUNTER","吸收成功後不得發動專精反擊",absorbNoCounter.events);

  resetSpecs();
  const shieldRevenge={...zero(),ward:10,revenge:10};
  const shieldCrit=fight({hp:100,atk:1,def:0,crit:0,dodge:0},{name:"護界復仇測試",hp:2,atk:10,def:0,crit:100,dodge:0},shieldRevenge);
  const shieldCritHit=attacks(shieldCrit,"enemy")[0];
  if(shieldCritHit?.crit!==true||shieldCritHit?.actualDamage!==0||shieldCritHit?.shieldAbsorbed<=0||markEvents(shieldCrit,"revenge","ready").length<1)fail("SHIELD_REVENGE","暴擊即使完全被護界吸收，仍應視為成功暴擊並可觸發復仇",{hit:shieldCritHit,events:shieldCrit.events});

  const absorbRevenge={...zero(),absorption:10,revenge:10};
  const absorbedCrit=fight({hp:100,atk:1,def:0,crit:0,dodge:0},{name:"吸收復仇測試",hp:2,atk:10,def:0,crit:100,dodge:0},absorbRevenge);
  if(markEvents(absorbedCrit,"absorption","trigger").length<1||markEvents(absorbedCrit,"revenge","ready").length!==0)fail("ABSORPTION_REVENGE","暴擊若被吸收化解，不得觸發復仇",absorbedCrit.events);

 }catch(error){
  fail("COMBAT_MARK_PROBE","印記共用戰鬥核心回歸測試執行失敗",String(error));
 }finally{
  if(priorTestSpecs)window.gmTestSpecializations=priorTestSpecs;
 }

 const report={passed:errors.length===0,errors,checkedAt:Date.now()};
 window.COMBAT_MARK_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Combat mark integrity error",errors);
})();