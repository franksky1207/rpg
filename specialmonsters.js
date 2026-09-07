const SPECIAL_ENCOUNTER_RATE=0.08;

const SPECIAL_MONSTERS=[
 {
  id:"gold_slime",name:"黃金史萊姆",weight:18,
  hpMul:.55,atkMul:.45,defMul:.55,
  critMode:"scale",critScale:.25,critAdd:0,critCap:5,
  dodgeMode:"scale",dodgeScale:.30,dodgeAdd:0,dodgeCap:5,
  description:"全身散發金色光芒的罕見史萊姆。戰力很低，但體內累積了大量財寶。",
  effects:[
   {type:"expMultiplier",value:.5},
   {type:"goldMultiplier",value:6},
   {type:"dropChance",value:0}
  ]
 },
 {
  id:"mimic",name:"寶箱怪",weight:14,
  hpMul:1.15,atkMul:1.15,defMul:1.10,
  critMode:"scale",critScale:.60,critAdd:5,critCap:16,
  dodgeMode:"scale",dodgeScale:.30,dodgeAdd:2,dodgeCap:8,
  description:"偽裝成寶箱等待獵物靠近的魔物。擊敗後必定能取得一件至少稀有品質的裝備。",
  effects:[
   {type:"guaranteedDrop"},
   {type:"qualityTable",value:[0,0,65,27,7,1]}
  ]
 },
 {
  id:"reaper",name:"死神",weight:4,
  hpMul:1.05,atkMul:1.22,defMul:.90,
  critMode:"scale",critScale:1,critAdd:8,critCap:30,
  dodgeMode:"scale",dodgeScale:1,dodgeAdd:5,dodgeCap:25,
  description:"極少出現的死亡化身。擁有遠高於一般敵人的殺傷力，但擊敗它能獲得極為豐厚的報酬。",
  effects:[
   {type:"expMultiplier",value:4},
   {type:"goldMultiplier",value:4},
   {type:"guaranteedDrop"},
   {type:"qualityTable",value:[0,0,0,65,30,5]}
  ]
 },
 {
  id:"lucky_rabbit",name:"幸運兔",weight:16,
  hpMul:.50,atkMul:.40,defMul:.50,
  critMode:"fixed",critValue:0,
  dodgeMode:"scale",dodgeScale:.70,dodgeAdd:8,dodgeCap:20,
  description:"被冒險者視為幸運象徵的稀有生物。雖然不一定帶著珍品，但擊敗後一定能找到裝備。",
  effects:[
   {type:"expMultiplier",value:.8},
   {type:"goldMultiplier",value:.8},
   {type:"guaranteedDrop"},
   {type:"qualitySource",value:"normal"}
  ]
 },
 {
  id:"ancient_guardian",name:"古代守衛",weight:12,
  hpMul:1.24,atkMul:1.03,defMul:1.16,
  critMode:"scale",critScale:.30,critAdd:2,critCap:8,
  dodgeMode:"scale",dodgeScale:.10,dodgeAdd:0,dodgeCap:2,
  description:"從古老遺跡中甦醒的守衛。沒有多少財寶，但擊敗如此古老而強大的存在能帶來大量經驗。",
  effects:[
   {type:"expMultiplier",value:4},
   {type:"goldMultiplier",value:.5}
  ]
 },
 {
  id:"relic_guardian",name:"遺物守衛",weight:12,
  hpMul:1.16,atkMul:1.07,defMul:1.13,
  critMode:"scale",critScale:.40,critAdd:3,critCap:10,
  dodgeMode:"scale",dodgeScale:.30,dodgeAdd:0,dodgeCap:6,
  description:"守護古代裝備的特殊敵人。其攜帶的遺物往往會補足冒險者目前最薄弱的裝備部位。",
  effects:[
   {type:"guaranteedDrop"},
   {type:"weakSlotDrop",primary:70,secondary:30},
   {type:"qualityTable",value:[10,35,35,16,4,0]}
  ]
 },
 {
  id:"bandit_king",name:"盜賊王",weight:9,
  hpMul:1.00,atkMul:1.27,defMul:.82,
  critMode:"scale",critScale:.80,critAdd:7,critCap:22,
  dodgeMode:"scale",dodgeScale:.80,dodgeAdd:5,dodgeCap:18,
  description:"洗劫商隊與冒險者的頭目。擊敗他不只能奪回大量金幣，還能取得能降低商店刷新成本的資源。",
  effects:[
   {type:"goldMultiplier",value:2.5},
   {type:"shopRefreshDown",value:1}
  ]
 },
 {
  id:"collector",name:"收藏家",weight:9,
  hpMul:1.16,atkMul:1.12,defMul:1.08,
  critMode:"scale",critScale:.50,critAdd:3,critCap:12,
  dodgeMode:"scale",dodgeScale:.50,dodgeAdd:2,dodgeCap:10,
  description:"喜歡收集各式裝備的怪異存在。擊敗後可以一次取得兩件它收藏的裝備。",
  effects:[
   {type:"guaranteedDrop"},
   {type:"dropCount",value:2},
   {type:"qualitySource",value:"normal"}
  ]
 },
 {
  id:"mysterious_traveler",name:"神秘旅人",weight:6,
  hpMul:1.08,atkMul:1.05,defMul:1.03,
  critMode:"scale",critScale:.60,critAdd:4,critCap:15,
  dodgeMode:"scale",dodgeScale:.60,dodgeAdd:3,dodgeCap:13,
  description:"沒有人知道這名旅人究竟從哪裡來。擊敗他後，可能獲得財富、知識，或者珍貴遺物。",
  effects:[
   {type:"randomReward",options:[
    {id:"wealth",label:"財富",effects:[{type:"goldMultiplier",value:5}]},
    {id:"knowledge",label:"知識",effects:[{type:"expMultiplier",value:5}]},
    {id:"relic",label:"遺物",effects:[{type:"guaranteedDrop"},{type:"minQuality",value:2}]}
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

function specialRateFromPlayer(value,special,prefix,maxCap){
 if(special[`${prefix}Mode`]==="fixed")return Math.max(0,Math.min(maxCap,Number(special[`${prefix}Value`])||0));
 let scale=Number(special[`${prefix}Scale`]);if(!Number.isFinite(scale))scale=1;
 let add=Number(special[`${prefix}Add`]);if(!Number.isFinite(add))add=0;
 let cap=Number(special[`${prefix}Cap`]);if(!Number.isFinite(cap))cap=maxCap;
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
 const player=createSpecialPlayerSnapshot(playerStats),base=specialBaseEnemyFromPlayer(player);
 return {
  name:special.name,
  level:Math.max(1,Math.min(50,Math.floor(Number(level)||1))),
  kind:"special",
  style:"special",
  specialId:special.id,
  special:true,
  description:special.description,
  hp:Math.max(1,Math.ceil(base.hp*special.hpMul)),
  atk:Math.max(1,Math.ceil(base.damage*special.atkMul+player.def*.55)),
  def:Math.max(0,Math.ceil(base.def*special.defMul)),
  crit:specialRateFromPlayer(player.crit,special,"crit",MAX_CRIT_RATE),
  dodge:specialRateFromPlayer(player.dodge,special,"dodge",MAX_DODGE_RATE),
  playerSnapshot:player
 };
}

function buildSpecialMonster(baseEnemy,special){
 if(!baseEnemy||!special)return null;
 return {
  ...baseEnemy,
  name:special.name,
  specialId:special.id,
  special:true,
  description:special.description,
  hp:Math.max(1,Math.ceil(baseEnemy.hp*special.hpMul)),
  atk:Math.max(1,Math.ceil(baseEnemy.atk*special.atkMul)),
  def:Math.max(0,Math.ceil(baseEnemy.def*special.defMul))
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
