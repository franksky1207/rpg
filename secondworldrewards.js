(function(){
 const VERSION=3;
 const QUALITY_MULTIPLIERS=[.10,.15,.25,.40,.70,1.00];
 const REDEMPTION_MULTIPLIER=10;

 function currentState(){
  try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(e){return null;}
 }
 function bossMeta(value){return typeof window.secondWorldBoss==="function"?window.secondWorldBoss(value):null;}
 function clampBossIndex(value){
  const n=Math.floor(Number(value));
  return Number.isFinite(n)&&n>=0&&n<Number(window.SECOND_WORLD_BOSS_COUNT||100)?n:-1;
 }
 function rewardPlayerLevel(target=null){
  const s=target&&typeof target==="object"?target:currentState();
  return Math.max(500,Math.min(1000,Math.floor(Number(s?.level)||500)));
 }
 function secondWorldBossExpReward(value,useTest=false,target=null){
  const index=clampBossIndex(value),boss=bossMeta(index),s=target&&typeof target==="object"?target:currentState();
  if(index<0||!boss||!s)return 0;
  const base=Math.ceil((typeof sameExp==="function"?sameExp(boss.level):25+4*boss.level)*(typeof expLevelFactor==="function"?expLevelFactor(boss.level,s.level):1));
  return typeof window.specializationAdjustedExp==="function"?window.specializationAdjustedExp(base,useTest):base;
 }
 function secondWorldBossDarkMatterBase(value){
  const index=clampBossIndex(value);
  return index<0?0:20+2*index;
 }
 function secondWorldBossDarkMatterReward(value,useTest=false){
  const base=secondWorldBossDarkMatterBase(value);
  const mul=typeof window.specializationMultiplier==="function"?window.specializationMultiplier("scavenge",useTest):1;
  return Math.max(0,Math.ceil(base*mul));
 }
 function secondWorldEquipmentQualityRoll(rng=Math.random){
  const random=typeof rng==="function"?rng:Math.random,r=random()*100;
  if(r<45)return 1;
  if(r<80)return 2;
  if(r<95)return 3;
  if(r<99.5)return 4;
  return 5;
 }
 function secondWorldEquipmentSaleDarkMatter(item,useTest=false){
  if(!item||Number(item.world)!==2)return 0;
  const level=Math.max(500,Math.min(1000,Math.floor(Number(item.level)||500)));
  const n=Math.max(0,Math.floor((level-500)/5));
  const base=20+2*n;
  const q=Math.max(0,Math.min(5,Math.floor(Number(item.q)||0)));
  const appraisal=typeof window.specializationMultiplier==="function"?window.specializationMultiplier("appraisal",useTest):1;
  return Math.max(0,Math.ceil(base*(QUALITY_MULTIPLIERS[q]||0)*appraisal));
 }
 function secondWorldEquipmentRedemptionCost(item,useTest=false){
  return Number(item?.world)===2?secondWorldEquipmentSaleDarkMatter(item,useTest)*REDEMPTION_MULTIPLIER:null;
 }
 function universePhase(target=null){
  const s=target&&typeof target==="object"?target:currentState();
  return s?.secondWorld?.entered===true;
 }
 function equipmentSaleQuote(item,options={}){
  const s=options.state&&typeof options.state==="object"?options.state:currentState();
  const useTest=options.useTestSpecializations===true;
  if(!item)return {currency:"none",amount:0,gold:0,darkMatter:0,darkEnergy:0,world:0,phase:universePhase(s)?2:1};
  const world=Number(item.world)===2?2:1;
  if(universePhase(s)){
   if(world!==2)return {currency:"none",amount:0,gold:0,darkMatter:0,darkEnergy:0,world,phase:2};
   const darkMatter=secondWorldEquipmentSaleDarkMatter(item,useTest);
   const darkEnergy=Number(item.q)===5?1:0;
   return {currency:"darkMatter",amount:darkMatter,gold:0,darkMatter,darkEnergy,world,phase:2};
  }
  const gold=typeof window.specializationSellValue==="function"?window.specializationSellValue(item,useTest):Math.max(0,Math.floor(Number(item.sell)||0));
  return {currency:"gold",amount:gold,gold,darkMatter:0,darkEnergy:0,world,phase:1};
 }
 function mergeEquipmentSaleQuotes(quotes=[]){
  const rows=Array.isArray(quotes)?quotes.filter(Boolean):[];
  const total={currency:"mixed",amount:0,gold:0,darkMatter:0,darkEnergy:0,count:rows.length,quotes:rows};
  rows.forEach(q=>{total.gold+=Math.max(0,Number(q.gold)||0);total.darkMatter+=Math.max(0,Number(q.darkMatter)||0);total.darkEnergy+=Math.max(0,Number(q.darkEnergy)||0);});
  if(total.darkMatter>0||total.darkEnergy>0){total.currency="darkMatter";total.amount=total.darkMatter;}
  else if(total.gold>0){total.currency="gold";total.amount=total.gold;}
  else{total.currency="none";total.amount=0;}
  return total;
 }
 function equipmentSaleBatchQuote(items,options={}){
  return mergeEquipmentSaleQuotes((Array.isArray(items)?items:[]).map(item=>equipmentSaleQuote(item,options)));
 }
 function applyEquipmentSaleQuote(quote,target=null){
  const s=target&&typeof target==="object"?target:currentState();
  if(!s||!quote)return false;
  if((Number(quote.gold)||0)>0)s.gold=Math.max(0,Math.floor(Number(s.gold)||0))+Math.floor(Number(quote.gold)||0);
  if((Number(quote.darkMatter)||0)>0){
   if(!s.secondWorld||typeof s.secondWorld!=="object")return false;
   s.secondWorld.darkMatter=Math.max(0,Math.floor(Number(s.secondWorld.darkMatter)||0))+Math.floor(Number(quote.darkMatter)||0);
  }
  if((Number(quote.darkEnergy)||0)>0){
   if(!s.secondWorld||typeof s.secondWorld!=="object")return false;
   s.secondWorld.darkEnergy=Math.max(0,Math.floor(Number(s.secondWorld.darkEnergy)||0))+Math.floor(Number(quote.darkEnergy)||0);
  }
  return true;
 }
 function settleEquipmentSale(item,options={}){
  const quote=equipmentSaleQuote(item,options);
  if(!applyEquipmentSaleQuote(quote,options.state||null))return {ok:false,reason:"sale-state",item,quote};
  return {ok:true,item,quote,sold:quote.amount,currency:quote.currency,darkMatter:quote.darkMatter,darkEnergy:quote.darkEnergy,gold:quote.gold};
 }
 function settleEquipmentSaleBatch(items,options={}){
  const rows=Array.isArray(items)?items:[];
  const quote=equipmentSaleBatchQuote(rows,options);
  if(!applyEquipmentSaleQuote(quote,options.state||null))return {ok:false,reason:"sale-state",items:rows,quote};
  return {ok:true,items:rows,quote,count:rows.length,total:quote.amount,currency:quote.currency,darkMatter:quote.darkMatter,darkEnergy:quote.darkEnergy,gold:quote.gold};
 }
 function equipmentSaleText(value){
  const q=value?.quote||value||{};
  const parts=[];
  if((Number(q.gold)||0)>0)parts.push(`${Math.floor(Number(q.gold)).toLocaleString()} 金幣`);
  if((Number(q.darkMatter)||0)>0)parts.push(`${Math.floor(Number(q.darkMatter)).toLocaleString()} 暗物質`);
  if((Number(q.darkEnergy)||0)>0)parts.push(`${Math.floor(Number(q.darkEnergy)).toLocaleString()} 暗能量`);
  return parts.length?parts.join("＋"):(Number(q.phase)===1?"0 金幣":"0 暗物質");
 }
 function makeSecondWorldEquipmentForBoss(value,options={}){
  const index=clampBossIndex(value),boss=bossMeta(index);
  if(index<0||!boss)return null;
  const types=Array.isArray(window.SECOND_WORLD_EQUIPMENT_SLOTS)&&window.SECOND_WORLD_EQUIPMENT_SLOTS.length?window.SECOND_WORLD_EQUIPMENT_SLOTS:(typeof EQUIPMENT_TYPES!=="undefined"?EQUIPMENT_TYPES:["weapon","helmet","armor","shoes","accessory"]);
  const forcedType=types.includes(options.forcedType)?options.forcedType:null;
  const type=forcedType||types[Math.floor((typeof options.rng==="function"?options.rng():Math.random())*types.length)]||types[0];
  const forcedQ=Number.isInteger(options.forcedQ)?Math.max(1,Math.min(5,options.forcedQ)):null;
  const q=forcedQ??secondWorldEquipmentQualityRoll(options.rng);
  const level=Math.max(500,Math.min(boss.level,Math.floor(Number(options.level)||rewardPlayerLevel(options.state))));
  const names=typeof window.secondWorldEquipmentNamesForBoss==="function"?window.secondWorldEquipmentNamesForBoss(index):boss.equipment;
  const name=String(names?.[type]||boss.name+"裝備");
  const m=QUALITY[q].m,mainStat=mainStatForType(type),mainValue=mainStatValue(type,level,m,q),affixes=rollAffixes(type,level,q,m);
  const item={id:Date.now().toString(36)+Math.random().toString(36).slice(2),name,level,q,type,world:2,sourceBossIndex:index,sourceBossId:boss.id,mainStat:{stat:mainStat,value:mainValue},affixes,sell:0,buy:0};
  addItemStat(item,mainStat,mainValue);
  affixes.forEach(a=>addItemStat(item,a.stat,a.value));
  return item;
 }
 function secondWorldMainlineRewardPreview(value,options={}){
  const index=clampBossIndex(value),boss=bossMeta(index),s=options.state||currentState();
  if(index<0||!boss||!s)return null;
  return {
   bossIndex:index,
   xp:secondWorldBossExpReward(index,options.useTestSpecializations===true,s),
   darkMatter:secondWorldBossDarkMatterReward(index,options.useTestSpecializations===true),
   darkEnergy:1,
   equipmentLevel:Math.min(rewardPlayerLevel(s),boss.level)
  };
 }
 function snapshotState(){try{return JSON.stringify(state);}catch(e){return null;}}
 function restoreState(json){if(!json)return false;try{state=JSON.parse(json);return true;}catch(e){return false;}}
 function saveAtomicOrRollback(before){
  let result;
  try{result=save(false);}catch(e){result=false;}
  if(result===false){restoreState(before);return false;}
  return true;
 }
 function settleSecondWorldBossVictory(value,options={}){
  const index=clampBossIndex(value),boss=bossMeta(index),s=currentState();
  if(index<0||!boss||!s||s?.secondWorld?.entered!==true)return {ok:false,reason:"宇宙紀元主線狀態無效。"};
  if(options.ignoreUnlock!==true&&!(typeof window.canChallengeSecondWorldBoss==="function"&&window.canChallengeSecondWorldBoss(index,s)))return {ok:false,reason:"此 Boss 尚未解鎖。"};
  const before=snapshotState();
  const reward=secondWorldMainlineRewardPreview(index,{state:s,useTestSpecializations:false});
  const item=makeSecondWorldEquipmentForBoss(index,{state:s});
  const firstKill=s.secondWorld.mainline.bossKilled[index]!==true;
  const logs=[];
  const levelBefore=s.level;
  if(typeof window.gainEffectiveExp==="function")window.gainEffectiveExp(reward.xp,logs);else gainExp(reward.xp,logs);
  s.secondWorld.darkMatter=Math.max(0,Math.floor(Number(s.secondWorld.darkMatter)||0))+reward.darkMatter;
  s.secondWorld.darkEnergy=Math.max(0,Math.floor(Number(s.secondWorld.darkEnergy)||0))+1;
  const itemResult=item?addItem(item):{kept:false,sold:0,sale:null};
  s.secondWorld.mainline.bossKilled[index]=true;
  if(!saveAtomicOrRollback(before))return {ok:false,reason:"存檔失敗，已回復戰鬥前狀態。"};
  return {ok:true,bossIndex:index,boss,firstKill,xp:reward.xp,darkMatter:reward.darkMatter,darkEnergy:1,item,itemResult,sale:itemResult?.sale||null,kept:itemResult?.kept===true,levelBefore,levelAfter:state.level,logs};
 }
 function applySecondWorldDeathPenalty(options={}){
  const s=currentState();
  if(!s||s?.secondWorld?.entered!==true)return {ok:false,reason:"不是宇宙紀元正式死亡流程。"};
  const before=snapshotState(),logs=[];
  const atCap=typeof window.atEffectiveLevelCap==="function"?window.atEffectiveLevelCap(s):s.level>=1000;
  const need=atCap?0:(typeof window.effectiveExpNeed==="function"?window.effectiveExpNeed(s.level,s):expNeed(s.level));
  const loss=atCap?0:Math.ceil(Math.max(0,Number(need)||0)*.10);
  const actual=Math.min(Math.max(0,Number(s.exp)||0),loss);
  s.exp=Math.max(0,(Number(s.exp)||0)-loss);
  let dropped=null,protectedByVip20=false,redemptionPending=false,cost=null,currency=null;
  const types=typeof EQUIPMENT_TYPES!=="undefined"?EQUIPMENT_TYPES:["weapon","helmet","armor","shoes","accessory"];
  const worn=types.map(slot=>[slot,s.equipment?.[slot]]).filter(([,it])=>!!it);
  if(worn.length&&Math.random()<.30){
   if((Number(s.vipLevel)||0)>=20)protectedByVip20=true;
   else{
    const [slot,item]=worn[Math.floor(Math.random()*worn.length)];
    s.equipment[slot]=null;dropped=item;
    if(Number(item.world)===2){cost=secondWorldEquipmentRedemptionCost(item,false);currency="darkMatter";}
    else{cost=0;currency="free";}
    if(!Array.isArray(s.lostGear))s.lostGear=[];
    s.lostGear.push({
     id:Date.now().toString(36)+Math.random().toString(36).slice(2),
     item,cost,currency,redemptionPending:false,lostAt:Date.now()
    });
   }
  }
  s.hp=playerCombatStats().hp;
  logs.push(`死亡懲罰：EXP -${actual}${loss>actual?"（目前 EXP 已扣至 0）":""}。`);
  if(dropped)logs.push(`裝備遺失：${itemHtmlPlain(dropped)}。`);
  else logs.push("本次沒有遺失裝備。");
  if(!saveAtomicOrRollback(before))return {ok:false,reason:"存檔失敗，已回復戰鬥前狀態。"};
  return {ok:true,expLost:actual,dropped,protectedByVip20,redemptionPending:false,cost,currency,logs};
 }
 function validate(){
  const errors=[];
  if(secondWorldBossDarkMatterBase(0)!==20||secondWorldBossDarkMatterBase(99)!==218)errors.push({code:"DARK_MATTER_BASE"});
  const probe={world:2,level:500,q:5};
  const raw=typeof window.specializationMultiplier==="function"?window.specializationMultiplier:null;
  if(!Number.isFinite(secondWorldEquipmentSaleDarkMatter(probe,true)))errors.push({code:"SALE_FORMULA"});
  const saleProbe=equipmentSaleQuote(probe,{state:{secondWorld:{entered:true,darkMatter:0,darkEnergy:0}},useTestSpecializations:true});
  if(saleProbe.currency!=="darkMatter"||saleProbe.darkMatter<=0||saleProbe.darkEnergy!==1)errors.push({code:"SALE_OWNER",saleProbe});
  const legacyFreeRedemption={world:1,level:500,q:5};
  if(Number(legacyFreeRedemption.world)!==1)errors.push({code:"LEGACY_FREE_REDEMPTION"});
  const legacyProbe=equipmentSaleQuote({world:1,level:500,q:5,sell:999},{state:{secondWorld:{entered:true,darkMatter:0,darkEnergy:0}}});
  if(legacyProbe.amount!==0||legacyProbe.gold!==0||legacyProbe.darkMatter!==0||legacyProbe.darkEnergy!==0)errors.push({code:"LEGACY_SALE_GATE",legacyProbe});
  const first=bossMeta(0),last=bossMeta(99);
  if(!first||!last||first.level!==505||last.level!==1000)errors.push({code:"BOSS_REGISTRY"});
  return {passed:errors.length===0,version:VERSION,redemptionMultiplier:REDEMPTION_MULTIPLIER,errors};
 }

 window.SECOND_WORLD_REWARD_VERSION=VERSION;
 window.SECOND_WORLD_REDEMPTION_MULTIPLIER=REDEMPTION_MULTIPLIER;
 window.SECOND_WORLD_QUALITY_MULTIPLIERS=QUALITY_MULTIPLIERS.slice();
 window.secondWorldBossExpReward=secondWorldBossExpReward;
 window.secondWorldBossDarkMatterBase=secondWorldBossDarkMatterBase;
 window.secondWorldBossDarkMatterReward=secondWorldBossDarkMatterReward;
 window.secondWorldEquipmentQualityRoll=secondWorldEquipmentQualityRoll;
 window.secondWorldEquipmentSaleDarkMatter=secondWorldEquipmentSaleDarkMatter;
 window.secondWorldEquipmentRedemptionCost=secondWorldEquipmentRedemptionCost;
 window.equipmentSaleQuote=equipmentSaleQuote;
 window.equipmentSaleBatchQuote=equipmentSaleBatchQuote;
 window.mergeEquipmentSaleQuotes=mergeEquipmentSaleQuotes;
 window.applyEquipmentSaleQuote=applyEquipmentSaleQuote;
 window.settleEquipmentSale=settleEquipmentSale;
 window.settleEquipmentSaleBatch=settleEquipmentSaleBatch;
 window.equipmentSaleText=equipmentSaleText;
 window.makeSecondWorldEquipmentForBoss=makeSecondWorldEquipmentForBoss;
 window.secondWorldMainlineRewardPreview=secondWorldMainlineRewardPreview;
 window.settleSecondWorldBossVictory=settleSecondWorldBossVictory;
 window.applySecondWorldDeathPenalty=applySecondWorldDeathPenalty;
 window.SECOND_WORLD_REWARD_INTEGRITY=validate();
 if(!window.SECOND_WORLD_REWARD_INTEGRITY.passed)console.error("[文明戰線] Second World reward integrity error",window.SECOND_WORLD_REWARD_INTEGRITY.errors);
})();
