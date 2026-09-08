const SPECIAL_ENCOUNTER_RATE=0.08;

const SPECIAL_TIERS={
 low:{
  hpMul:.55,atkMul:.45,defMul:.55,
  critScale:.25,critAdd:0,critCap:5,
  dodgeScale:.30,dodgeAdd:0,dodgeCap:5
 },
 mid:{
  hpMul:1.00,atkMul:1.15,defMul:.86,
  critScale:.90,critAdd:7,critCap:27,
  dodgeScale:.90,dodgeAdd:4.5,dodgeCap:23
 },
 high:{
  hpMul:1.05,atkMul:1.22,defMul:.90,
  critScale:1,critAdd:8,critCap:30,
  dodgeScale:1,dodgeAdd:5,dodgeCap:25
 }
};

const SPECIAL_MONSTERS=[
 {
  id:"gold_slime",name:"稀有資源聚合體",tier:"low",weight:18,
  description:"由高價值能源與稀有材料異常聚合形成的特殊單位。戰力很低，但擊破後能回收大量金幣資源。",
  effects:[
   {type:"expMultiplier",value:.5},
   {type:"goldMultiplier",value:6},
   {type:"dropChance",value:0}
  ]
 },
 {
  id:"mimic",name:"誘餌補給艙",tier:"high",weight:14,
  description:"偽裝成無人補給艙的高危伏擊單元。擊破後必定能取得一件至少稀有品質的裝備。",
  effects:[
   {type:"guaranteedDrop"},
   {type:"qualityTable",value:[0,0,65,27,7,1]}
  ]
 },
 {
  id:"reaper",name:"終止協議單元",tier:"high",weight:4,
  description:"執行高優先級終止協議的極少見戰鬥單元。殺傷力遠高於一般敵人，但成功摧毀後能取得極為豐厚的報酬。",
  effects:[
   {type:"expMultiplier",value:4},
   {type:"goldMultiplier",value:4},
   {type:"guaranteedDrop"},
   {type:"qualityTable",value:[0,0,0,65,30,5]}
  ]
 },
 {
  id:"lucky_rabbit",name:"機率增幅信標",tier:"low",weight:16,
  description:"偶爾出現在戰區中的異常信標，會干擾周邊戰利品分布。戰力不高，擊破後必定能取得裝備。",
  effects:[
   {type:"expMultiplier",value:.8},
   {type:"goldMultiplier",value:.8},
   {type:"guaranteedDrop"},
   {type:"qualitySource",value:"normal"}
  ]
 },
 {
  id:"ancient_guardian",name:"封存警戒機",tier:"low",weight:12,
  description:"長期封存後重新啟動的警戒機。可回收資源不多，但其高密度戰鬥資料能帶來大量經驗。",
  effects:[
   {type:"expMultiplier",value:4},
   {type:"goldMultiplier",value:.5}
  ]
 },
 {
  id:"relic_guardian",name:"裝備保全單元",tier:"mid",weight:12,
  description:"專門保護高價值裝備的自律保全單元。其保管物資通常會優先補足目前最薄弱的裝備部位。",
  effects:[
   {type:"guaranteedDrop"},
   {type:"weakSlotDrop",primary:70,secondary:30},
   {type:"qualityTable",value:[10,35,35,16,4,0]}
  ]
 },
 {
  id:"bandit_king",name:"黑市武裝頭目",tier:"mid",weight:9,
  description:"控制非法物資流通與武裝掠奪行動的黑市頭目。擊敗後可回收大量金幣，並取得降低商店刷新成本的資源。",
  effects:[
   {type:"goldMultiplier",value:2.5},
   {type:"shopRefreshDown",value:1}
  ]
 },
 {
  id:"collector",name:"戰利品回收者",tier:"mid",weight:9,
  description:"專門回收各戰區裝備的特殊單位，隨身攜帶大量戰利品。擊敗後可以一次取得兩件裝備。",
  effects:[
   {type:"guaranteedDrop"},
   {type:"dropCount",value:2},
   {type:"qualitySource",value:"normal"}
  ]
 },
 {
  id:"mysterious_traveler",name:"流動交易代理人",tier:"high",weight:6,
  description:"行蹤與所屬勢力不明的流動交易代理人。擊敗後可能取得大量金幣、經驗資料，或高品質裝備。",
  effects:[
   {type:"randomReward",options:[
    {id:"wealth",label:"財富",effects:[{type:"goldMultiplier",value:5}]},
    {id:"knowledge",label:"知識",effects:[{type:"expMultiplier",value:5}]},
    {id:"relic",label:"裝備",effects:[{type:"guaranteedDrop"},{type:"minQuality",value:2}]}
   ]}
  ]
 }
];

const SPECIAL_EFFECT_HANDLERS={
 expMultiplier(ctx,effect){ctx.expMultiplier=(ctx.expMultiplier??1)*effect.value;},
 goldMultiplier(ctx,effect){ctx.goldMultiplier=(ctx.goldMultiplier??1)*effect.value;},
 dropChance(ctx,effect){ctx.dropChance=effect.value;},
 guaranteedDrop(ctx){ctx.dropChance=1;},
 minQuality(ctx,effect){ctx.minQuality=Math.max(ctx.minQuality??0,effect.value);},
 qualityTable(ctx,effect){ctx.qualityTable=Array.isArray(effect.value)?effect.value.slice():null;},
 qualitySource(ctx,effect){ctx.qualitySource=effect.value;},
 dropCount(ctx,effect){ctx.dropCount=Math.max(1,Math.floor(effect.value||1));},
 weakSlotDrop(ctx,effect){ctx.weakSlotDrop={primary:effect.primary??70,secondary:effect.secondary??30};},
 shopRefreshDown(ctx,effect){ctx.shopRefreshDown=(ctx.shopRefreshDown||0)+Math.max(0,Math.floor(effect.value||0));},
 randomReward(ctx,effect){
  let options=Array.isArray(effect.options)?effect.options:[];
  if(!options.length)return;
  let chosen=options[Math.floor(Math.random()*options.length)];
  ctx.randomReward={id:chosen.id,label:chosen.label};
  applySpecialEffectsToContext(ctx,chosen.effects||[]);
 }
};

function getSpecialMonsterById(id){return SPECIAL_MONSTERS.find(x=>x.id===id)||null;}

function rollSpecialMonster(){
 let total=SPECIAL_MONSTERS.reduce((sum,x)=>sum+Math.max(0,x.weight||0),0);
 if(total<=0)return null;
 let r=Math.random()*total;
 for(let x of SPECIAL_MONSTERS){r-=Math.max(0,x.weight||0);if(r<0)return x;}
 return SPECIAL_MONSTERS[SPECIAL_MONSTERS.length-1]||null;
}

function specialTierConfig(special){
 return SPECIAL_TIERS[special?.tier]||SPECIAL_TIERS.low;
}

function specialRateFromPlayer(value,config,prefix,maxCap){
 let scale=Number(config?.[`${prefix}Scale`]);if(!Number.isFinite(scale))scale=1;
 let add=Number(config?.[`${prefix}Add`]);if(!Number.isFinite(add))add=0;
 let cap=Number(config?.[`${prefix}Cap`]);if(!Number.isFinite(cap))cap=maxCap;
 return round1(Math.max(0,Math.min(maxCap,cap,(Number(value)||0)*scale+add)));
}

function createSpecialPlayerSnapshot(stats){
 const s=stats||{};
 return {
  hp:Math.max(1,Math.ceil(Number(s.hp)||1)),
  atk:Math.max(1,Math.ceil(Number(s.atk)||1)),
  def:Math.max(0,Math.ceil(Number(s.def)||0)),
  crit:Math.max(0,Math.min(MAX_CRIT_RATE,Number(s.crit)||0)),
  dodge:Math.max(0,Math.min(MAX_DODGE_RATE,Number(s.dodge)||0))
 };
}

function specialBaseEnemyFromPlayer(snapshot){
 const p=createSpecialPlayerSnapshot(snapshot);
 const def=Math.max(0,Math.ceil(p.atk*.45));
 const playerHit=Math.max(1,p.atk-def*.55);
 return {
  hp:Math.max(1,Math.ceil(playerHit*6)),
  damage:Math.max(1,p.hp/8),
  def
 };
}

function buildSpecialMonsterFromPlayer(playerStats,special,level=1){
 if(!special)return null;
 const player=createSpecialPlayerSnapshot(playerStats),base=specialBaseEnemyFromPlayer(player),tier=specialTierConfig(special);
 return {
  name:special.name,
  level:Math.max(1,Math.min(50,Math.floor(Number(level)||1))),
  kind:"special",
  style:"special",
  specialId:special.id,
  special:true,
  tier:special.tier||"low",
  description:special.description,
  hp:Math.max(1,Math.ceil(base.hp*tier.hpMul)),
  atk:Math.max(1,Math.ceil(base.damage*tier.atkMul+player.def*.55)),
  def:Math.max(0,Math.ceil(base.def*tier.defMul)),
  crit:specialRateFromPlayer(player.crit,tier,"crit",MAX_CRIT_RATE),
  dodge:specialRateFromPlayer(player.dodge,tier,"dodge",MAX_DODGE_RATE),
  playerSnapshot:player
 };
}

function buildSpecialMonster(baseEnemy,special){
 if(!baseEnemy||!special)return null;
 const tier=specialTierConfig(special);
 return {
  ...baseEnemy,
  name:special.name,
  specialId:special.id,
  special:true,
  tier:special.tier||"low",
  description:special.description,
  hp:Math.max(1,Math.ceil(baseEnemy.hp*tier.hpMul)),
  atk:Math.max(1,Math.ceil(baseEnemy.atk*tier.atkMul)),
  def:Math.max(0,Math.ceil(baseEnemy.def*tier.defMul))
 };
}

function createSpecialRewardContext(){
 return {
  expMultiplier:1,
  goldMultiplier:1,
  dropChance:null,
  dropCount:1,
  minQuality:0,
  qualityTable:null,
  qualitySource:null,
  weakSlotDrop:null,
  shopRefreshDown:0,
  randomReward:null
 };
}

function applySpecialEffectsToContext(ctx,effects){
 for(let effect of effects||[]){
  let handler=SPECIAL_EFFECT_HANDLERS[effect?.type];
  if(handler)handler(ctx,effect);
 }
 return ctx;
}

function getSpecialRewardContext(special){
 let ctx=createSpecialRewardContext();
 if(special)applySpecialEffectsToContext(ctx,special.effects||[]);
 return ctx;
}
