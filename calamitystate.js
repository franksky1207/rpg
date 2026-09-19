(function(){
 const CALAMITY_STATE_VERSION=1;
 const CALAMITY_BALANCE_VERSION=3;
 const CALAMITY_HP_PER_LEVEL=500000;
 const MARK_STATE_VERSION=1;
 const MARK_MAX_LEVEL=10;

 const CALAMITY_IDS=Array.from(window.CIVILIZATION_CALAMITY_IDS||[]);
 const MARK_IDS=Array.from(window.CIVILIZATION_MARK_IDS||[]);

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function clampInt(value,min,max){const n=Math.floor(Number(value));return Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;}
 function blankCalamityEntries(){return Object.fromEntries(CALAMITY_IDS.map(id=>[id,{currentHp:null}]));}
 function blankMarkEntries(){return Object.fromEntries(MARK_IDS.map(id=>[id,{acquired:false,level:0,progress:0}]));}
 function createBlankCalamityState(){return {version:CALAMITY_STATE_VERSION,balanceVersion:CALAMITY_BALANCE_VERSION,entries:blankCalamityEntries()};}
 function createBlankMarkState(){return {version:MARK_STATE_VERSION,entries:blankMarkEntries()};}

 function calamityLevelForId(id){
  const index=CALAMITY_IDS.indexOf(String(id||""));
  return index>=0?index+1:1;
 }
 function calamityMaxHpForId(id){return CALAMITY_HP_PER_LEVEL*calamityLevelForId(id);}
 function normalizeCalamityEntry(value,id){
  const entry=isObject(value)?value:{};
  const hp=Number(entry.currentHp),maxHp=calamityMaxHpForId(id);
  entry.currentHp=Number.isFinite(hp)&&hp>0?Math.max(1,Math.min(maxHp,Math.floor(hp))):null;
  return entry;
 }
 function normalizeMarkEntry(value){
  const entry=isObject(value)?value:{};
  let level=clampInt(entry.level,0,MARK_MAX_LEVEL);
  let acquired=entry.acquired===true||level>0;
  let progress=Math.max(0,Math.floor(Number(entry.progress)||0));
  if(!acquired){level=0;progress=0;}
  if(level>=MARK_MAX_LEVEL)progress=0;
  entry.acquired=acquired;
  entry.level=level;
  entry.progress=progress;
  return entry;
 }

 function normalizeCivilizationCalamityState(target){
  if(!isObject(target))return target;

  if(!isObject(target.calamities))target.calamities=createBlankCalamityState();
  const calamities=target.calamities;
  if(!isObject(calamities.entries))calamities.entries={};
  const calamityEntries={};
  CALAMITY_IDS.forEach(id=>{calamityEntries[id]=normalizeCalamityEntry(calamities.entries[id],id);});
  calamities.version=CALAMITY_STATE_VERSION;
  calamities.balanceVersion=CALAMITY_BALANCE_VERSION;
  calamities.entries=calamityEntries;

  if(!isObject(target.marks))target.marks=createBlankMarkState();
  const marks=target.marks;
  if(!isObject(marks.entries))marks.entries={};
  const markEntries={};
  MARK_IDS.forEach(id=>{markEntries[id]=normalizeMarkEntry(marks.entries[id]);});
  marks.version=MARK_STATE_VERSION;
  marks.entries=markEntries;
  return target;
 }

 function ensureCivilizationCalamityState(){
  normalizeCivilizationCalamityState(state);
  return {calamities:state.calamities,marks:state.marks};
 }

 window.CALAMITY_STATE_VERSION=CALAMITY_STATE_VERSION;
 window.CALAMITY_HP_PER_LEVEL=CALAMITY_HP_PER_LEVEL;
 window.getCivilizationCalamityConfiguredMaxHp=calamityMaxHpForId;
 window.CALAMITY_BALANCE_VERSION=CALAMITY_BALANCE_VERSION;
 window.MARK_STATE_VERSION=MARK_STATE_VERSION;
 window.MARK_MAX_LEVEL=MARK_MAX_LEVEL;
 window.createBlankCalamityState=createBlankCalamityState;
 window.createBlankMarkState=createBlankMarkState;
 window.normalizeCivilizationCalamityState=normalizeCivilizationCalamityState;
 window.ensureCivilizationCalamityState=ensureCivilizationCalamityState;
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizeCivilizationCalamityState);
})();