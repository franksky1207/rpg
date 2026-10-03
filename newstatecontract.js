(function(){
 const VERSION=1;
 const REQUIRED_ROOT_KEYS=Object.freeze(["settings","equipment","inventory","mapProgress","bossProgress","bossKilled","level"]);
 const baseRegister=window.registerNewStateNormalizer;
 const registrations=[];
 let violations=0,lastViolation=null;
 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function rootLike(value){return isObject(value)&&isObject(value.settings)&&isObject(value.equipment)&&Array.isArray(value.inventory)&&Array.isArray(value.mapProgress)&&Array.isArray(value.bossProgress)&&Array.isArray(value.bossKilled)&&Number.isFinite(Number(value.level));}
 function normalizerName(fn){return typeof fn?.name==="string"&&fn.name?fn.name:"anonymous";}
 function registerNewStateNormalizerContract(fn){
  if(typeof fn!=="function"||typeof baseRegister!=="function")return false;
  const name=normalizerName(fn);
  const wrapped=function(target){
   const result=fn(target);
   if(result==null||typeof result!=="object")return target;
   if(result===target)return target;
   if(rootLike(result))return result;
   violations+=1;
   lastViolation={version:VERSION,normalizer:name,returnedType:Array.isArray(result)?"array":"object",returnedKeys:isObject(result)?Object.keys(result).slice(0,20):[],requiredRootKeys:Array.from(REQUIRED_ROOT_KEYS),at:Date.now()};
   window.LAST_NEW_STATE_NORMALIZER_CONTRACT_VIOLATION=lastViolation;
   console.error(`[文明戰線] New-state normalizer ${name} returned a subsystem object; root replacement was rejected.`);
   return target;
  };
  registrations.push(name);
  return baseRegister(wrapped);
 }
 function snapshot(){return {version:VERSION,registrations:registrations.slice(),registeredAfterContract:registrations.length,violations,lastViolation:lastViolation?{...lastViolation}:null,requiredRootKeys:Array.from(REQUIRED_ROOT_KEYS)};}
 if(typeof baseRegister!=="function")throw new Error("New-state normalizer base owner unavailable.");
 window.registerNewStateNormalizer=registerNewStateNormalizerContract;
 try{registerNewStateNormalizer=registerNewStateNormalizerContract;}catch(_){}
 window.NEW_STATE_NORMALIZER_CONTRACT_VERSION=VERSION;
 window.NEW_STATE_NORMALIZER_REQUIRED_ROOT_KEYS=Array.from(REQUIRED_ROOT_KEYS);
 window.newStateNormalizerContractSnapshot=snapshot;
})();