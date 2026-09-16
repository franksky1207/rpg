(function(){
 const COMBAT_DAMAGE_MODEL_VERSION=1;
 const DEF_WEIGHT=.55;
 const RANDOM_MIN=.95;
 const RANDOM_RANGE=.10;
 function numberOr(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback;}
 function combatDamageWithRng(atk,def,rng=Math.random){
  const random=typeof rng==="function"?rng:Math.random;
  const attack=Math.max(0,numberOr(atk,0)),defense=Math.max(0,numberOr(def,0));
  return Math.max(1,Math.ceil((attack-defense*DEF_WEIGHT)*(RANDOM_MIN+random()*RANDOM_RANGE)));
 }
 function calcDamageCompat(atk,def){return combatDamageWithRng(atk,def,Math.random);}
 window.COMBAT_DAMAGE_MODEL_VERSION=COMBAT_DAMAGE_MODEL_VERSION;
 window.COMBAT_DAMAGE_DEF_WEIGHT=DEF_WEIGHT;
 window.combatDamageWithRng=combatDamageWithRng;
 window.calcDamage=calcDamageCompat;
 try{calcDamage=calcDamageCompat;}catch(e){}
})();
