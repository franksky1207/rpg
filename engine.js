const navs=[["adventure","冒險"],["character","角色"],["inventory","背包"],["shop","商店"],["settings","設定"]];
const EQUIPMENT_TYPES=["weapon","helmet","armor","shoes","accessory"];
const EQUIPMENT_LABELS={weapon:"武器",helmet:"頭盔",armor:"鎧甲",shoes:"鞋子",accessory:"飾品"};
const STAT_LABELS={atk:"攻擊",def:"防禦",hp:"HP",crit:"暴擊",dodge:"閃避"};
const AFFIX_POOLS={weapon:["atk","crit","hp"],helmet:["hp","def","dodge"],armor:["def","hp","dodge"],shoes:["dodge","def","hp"],accessory:["crit","atk","hp","dodge"]};
const AFFIX_RATE_RANGES=[[0,0],[1,1],[1,2],[2,3],[3,4],[4,5]];
const ACCESSORY_CRIT_RANGES=[[1,2],[2,3],[3,5],[5,7],[7,9],[9,10]];
const MONSTER_MAX_CRIT_RATE=30;
const MONSTER_MAX_DODGE_RATE=30;
const CRIT_DAMAGE_MULTIPLIER=1.5;
const MAX_LEVEL=100;
const VIP_MAX_LEVEL=20;
const VIP_HP_ATK_PERCENT_PER_LEVEL=.5;
const VIP_DEF_PERCENT_PER_LEVEL=.25;
const VIP_RATE_STAT_PER_LEVEL=.25;
const EXP_CURVE=Object.freeze({killMin:5,killRange:495,scale:142});
window.MAX_LEVEL=MAX_LEVEL;window.VIP_MAX_LEVEL=VIP_MAX_LEVEL;window.EXP_CURVE=EXP_CURVE;
let state,view="home",selectedMap=0,selectedEnemy=0,selectedItem=null,battleLogs=[],battleBusy=false;
let upgradeDropNoticePending=false;
let shopMutationBusy=false;

function ceil(n){return Math.ceil(n)}
function round1(n){return Math.round(n*10)/10}
function randomInt(min,max){return min+Math.floor(Math.random()*(max-min+1))}
function currentSaveVersion(){return Math.max(1,Math.floor(Number(window.SAVE_SCHEMA_VERSION)||Number(SAVE_VERSION)||1))}
window.currentSaveVersion=currentSaveVersion;
function clampGameLevel(level){return Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(level)||1)))}
window.clampGameLevel=clampGameLevel;
function baseHP(l){return ceil(110+12*(l-1))}
function baseATK(l){return ceil(15+2.2*(l-1))}
function baseDEF(l){return ceil(7+1.2*(l-1))}
function sameExp(l){return ceil(25+4*l)}
function expProgressionFactor(level){const l=Math.max(1,Math.floor(Number(level)||1));return EXP_CURVE.killMin+EXP_CURVE.killRange*(1-Math.exp(-(l-1)/EXP_CURVE.scale))}
window.expProgressionFactor=expProgressionFactor;
function expNeed(l){return ceil(sameExp(l)*expProgressionFactor(l))}
function expLevelFactor(ml,pl){let d=ml-pl;if(d>=5)return 1.3;if(d>=3)return 1.2;if(d>=1)return 1.1;if(d===0)return 1;if(d>=-2)return .9;if(d>=-5)return .6;if(d>=-10)return .25;return .05}
function goldBase(l){return ceil(6+4*l)}
function sellBase(l){return ceil(12+8*l)}
function qClass(q){return "q-"+QUALITY[q].k}
function equipmentTypeLabel(type){return EQUIPMENT_LABELS[type]||type}
function formatStatValue(stat,value){return `${STAT_LABELS[stat]||stat} +${value}${stat==="crit"||stat==="dodge"?"%":""}`}
function vipThreshold(level){const lv=Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(level)||0)));return 1000*lv*lv}
function vipLevelFromPoints(points){const p=Math.max(0,Math.floor(Number(points)||0));return Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Math.sqrt(p/1000))))}
function vipBonusStats(level=null){const lv=Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(level??state?.vipLevel)||0)));return {level:lv,hp:lv*VIP_HP_ATK_PERCENT_PER_LEVEL,atk:lv*VIP_HP_ATK_PERCENT_PER_LEVEL,def:lv*VIP_DEF_PERCENT_PER_LEVEL,crit:lv*VIP_RATE_STAT_PER_LEVEL,dodge:lv*VIP_RATE_STAT_PER_LEVEL}}
function normalizeVipState(target){
 if(!target||typeof target!=="object")return target;
 const legacyPoints=Number(target?.dungeon?.points),ownPoints=Number(target.vipPoints),points=Number.isFinite(ownPoints)&&ownPoints>=0?Math.floor(ownPoints):(Number.isFinite(legacyPoints)&&legacyPoints>=0?Math.floor(legacyPoints):0),storedLevel=Number(target.vipLevel),unlocked=Number.isFinite(storedLevel)&&storedLevel>=0?Math.floor(storedLevel):0;
 target.vipPoints=points;target.vipLevel=Math.max(0,Math.min(VIP_MAX_LEVEL,Math.max(unlocked,vipLevelFromPoints(points))));return target;
}
window.vipThreshold=vipThreshold;window.vipLevelFromPoints=vipLevelFromPoints;window.vipBonusStats=vipBonusStats;window.normalizeVipState=normalizeVipState;
function blankMapProgress(){return Array.from({length:MAPS.length},()=>[0,0,0,0])}
function fitWorldArray(arr,fill){const out=Array.isArray(arr)?arr.slice(0,MAPS.length):[];while(out.length<MAPS.length)out.push(typeof fill==="function"?fill(out.length):fill);return out}
function normalizeWorldState(target){
 if(!target||typeof target!=="object")return target;
 target.mapProgress=fitWorldArray(target.mapProgress,()=>[0,0,0,0]).map(x=>Array.isArray(x)?[0,1,2,3].map(i=>Math.max(0,Math.min(999,Math.floor(Number(x[i])||0)))):[0,0,0,0]);
 target.bossProgress=fitWorldArray(target.bossProgress,0).map(x=>Math.max(0,Math.min(10,Math.floor(Number(x)||0))));
 target.bossLocked=fitWorldArray(target.bossLocked,false).map(Boolean);target.bossKilled=fitWorldArray(target.bossKilled,false).map(Boolean);target.unlockedMap=Math.max(0,Math.min(MAPS.length-1,Math.floor(Number(target.unlockedMap)||0)));
 for(let i=0;i<MAPS.length-1;i++)if(target.bossKilled[i])target.unlockedMap=Math.max(target.unlockedMap,i+1);return target;
}
window.normalizeWorldSaveState=normalizeWorldState;
function newShopState(){return {items:[],refreshIndex:0,resetAvailableAt:0,initialized:false}}
function starterEquipment(){return Object.fromEntries(EQUIPMENT_TYPES.map(type=>[type,makeItem(1,0,"normal",0,type)]))}
function newState(){
 const equipment=starterEquipment();
 const starterHp=baseHP(1)+EQUIPMENT_TYPES.reduce((sum,type)=>sum+(Number(equipment[type]?.hp)||0),0);
 return {saveVersion:currentSaveVersion(),introSeen:false,playerName:"玩家",level:1,exp:0,hp:starterHp,gold:0,unlockedMap:0,vipLevel:0,vipPoints:0,specializations:createBlankSpecializations(),equipment,inventory:[],mapProgress:blankMapProgress(),bossProgress:Array(MAPS.length).fill(0),bossLocked:Array(MAPS.length).fill(false),bossKilled:Array(MAPS.length).fill(false),lostGear:[],shop:newShopState(),settings:{autoSell:[false,false,false,false,false],keepUpgrade:true,dark:true},gm:false};
}

function load(){
 let hadRaw=false;
 try{let raw=localStorage.getItem(SAVE_KEY);hadRaw=!!raw;state=raw?JSON.parse(raw):newState()}catch(e){state=newState()}
 let loadedVersion=state.saveVersion||1;
 state.level=clampGameLevel(state.level);if(typeof state.playerName!=="string"||!state.playerName.trim())state.playerName="玩家";
 if(!state.equipment||typeof state.equipment!=="object")state.equipment={};EQUIPMENT_TYPES.forEach(type=>{if(!(type in state.equipment))state.equipment[type]=null});if(!Array.isArray(state.inventory))state.inventory=[];
 normalizeWorldState(state);normalizeVipState(state);ensureSpecializationState();if(!state.lostGear)state.lostGear=[];if(!state.shop)state.shop=newShopState();if(!Array.isArray(state.shop.items))state.shop.items=[];if(typeof state.shop.refreshIndex!=="number")state.shop.refreshIndex=0;if(typeof state.shop.resetAvailableAt!=="number")state.shop.resetAvailableAt=0;
 if(typeof state.shop.initialized!=="boolean")state.shop.initialized=hadRaw&&loadedVersion>=4;
 if(!state.settings)state.settings=newState().settings;if(!Array.isArray(state.settings.autoSell))state.settings.autoSell=[false,false,false,false,false];if(typeof state.settings.keepUpgrade!=="boolean")state.settings.keepUpgrade=true;
 if(loadedVersion<4){state.shop.items=[];state.shop.initialized=false}
 state.saveVersion=currentSaveVersion();selectedMap=Math.max(0,Math.min(state.unlockedMap,MAPS.length-1));normalizeHP();ensureShop();save(false);
}
function save(show=true){
 try{localStorage.setItem(SAVE_KEY,JSON.stringify(state))}catch(err){const e=document.getElementById("saveStatus");if(e)e.textContent="存檔失敗";console.error("Save failed",err);return false}
 if(show){let e=document.getElementById("saveStatus");if(e){e.textContent="已自動存檔";setTimeout(()=>e.textContent="本機自動存檔",900)}}return true;
}
function equippedStats(){let x={hp:baseHP(state.level),atk:baseATK(state.level),def:baseDEF(state.level),crit:0,dodge:0};EQUIPMENT_TYPES.map(type=>state.equipment[type]).filter(Boolean).forEach(it=>{x.hp+=it.hp||0;x.atk+=it.atk||0;x.def+=it.def||0;x.crit+=it.crit||0;x.dodge+=it.dodge||0});x.crit=round1(Math.max(0,Number(x.crit)||0));x.dodge=round1(Math.max(0,Number(x.dodge)||0));return x}
function playerCombatStats(baseStats=null,vipLevel=null){const base=baseStats&&typeof baseStats==="object"?baseStats:equippedStats(),bonus=vipBonusStats(vipLevel);return {hp:Math.max(1,ceil((Number(base.hp)||1)*(1+bonus.hp/100))),atk:Math.max(1,ceil((Number(base.atk)||1)*(1+bonus.atk/100))),def:Math.max(0,ceil((Number(base.def)||0)*(1+bonus.def/100))),crit:round1(Math.max(0,Number(base.crit)||0)+bonus.crit),dodge:round1(Math.max(0,Number(base.dodge)||0)+bonus.dodge)}}
window.playerCombatStats=playerCombatStats;
function addVipPoints(amount){normalizeVipState(state);const added=Math.max(0,Math.floor(Number(amount)||0)),beforeMax=playerCombatStats().hp,beforeHp=Math.max(0,Math.min(beforeMax,Number(state.hp)||0)),ratio=beforeMax>0?beforeHp/beforeMax:1,wasFull=beforeHp>=beforeMax;state.vipPoints+=added;const nextLevel=vipLevelFromPoints(state.vipPoints),levelBefore=state.vipLevel;if(nextLevel>state.vipLevel)state.vipLevel=nextLevel;const afterMax=playerCombatStats().hp;if(state.vipLevel>levelBefore&&afterMax!==beforeMax)state.hp=wasFull?afterMax:Math.max(0,Math.min(afterMax,Math.round(afterMax*ratio)));return {added,points:state.vipPoints,level:state.vipLevel,levelsGained:Math.max(0,state.vipLevel-levelBefore)}}
window.addVipPoints=addVipPoints;
function normalizeHP(){let m=playerCombatStats().hp;state.hp=Math.max(0,Math.min(Number.isFinite(Number(state.hp))?Number(state.hp):m,m))}
function equipmentScore(it){if(!it)return -1;const level=Math.max(1,Math.floor(Number(it.level)||1)),rateWeight=20+.5*level;return round1((it.atk||0)*5+(it.def||0)*5+(it.hp||0)+(it.crit||0)*rateWeight+(it.dodge||0)*rateWeight)}
function qualityRoll(kind){let r=Math.random()*100,c=0,arr;if(kind==="boss")arr=[0,45,35,15,4.5,.5];else if(kind==="elite")arr=[35,35,20,8,1.8,.2];else arr=[50,30,15,4,.9,.1];for(let i=0;i<arr.length;i++){c+=arr[i];if(r<c)return i}return 0}
function affixCount(q){if(q===0)return 0;if(q===1)return 1;if(q===2)return Math.random()<.5?1:2;if(q===3)return 2;if(q===4)return Math.random()<.5?2:3;return 3}
function mainStatForType(type){return type==="weapon"?"atk":type==="helmet"?"hp":type==="armor"?"def":type==="shoes"?"hp":"crit"}
function mainStatValue(type,level,m,q){if(type==="weapon")return ceil((3+1.55*level)*m);if(type==="helmet")return ceil((8+2.5*level)*m);if(type==="armor")return ceil((1+.65*level)*m);if(type==="shoes")return ceil((8+2.5*level)*m);const range=ACCESSORY_CRIT_RANGES[q]||ACCESSORY_CRIT_RANGES[0];return randomInt(range[0],range[1])}
function affixStatValue(stat,level,m,q){if(stat==="atk")return ceil((1+.45*level)*m);if(stat==="def")return ceil((.5+.20*level)*m);if(stat==="hp")return ceil((3+.9*level)*m);if(stat==="crit"||stat==="dodge"){const range=AFFIX_RATE_RANGES[q]||AFFIX_RATE_RANGES[0];return randomInt(range[0],range[1])}return 0}
function addItemStat(it,stat,value){it[stat]=round1((it[stat]||0)+value)}
function rollAffixes(type,level,q,m){let pool=(AFFIX_POOLS[type]||[]).slice(),count=Math.min(affixCount(q),pool.length),out=[];for(let i=0;i<count;i++){let n=Math.floor(Math.random()*pool.length),stat=pool.splice(n,1)[0],value=affixStatValue(stat,level,m,q);out.push({stat,value})}return out}
function makeItem(level,mapIdx,kind="normal",forcedQ=null,forcedType=null){let q=forcedQ??qualityRoll(kind),type=forcedType??EQUIPMENT_TYPES[Math.floor(Math.random()*EQUIPMENT_TYPES.length)];let baseNames=MAPS[mapIdx].gear,name=baseNames[Math.max(0,EQUIPMENT_TYPES.indexOf(type))]||baseNames[0],m=QUALITY[q].m;let mainStat=mainStatForType(type),mainValue=mainStatValue(type,level,m,q),affixes=rollAffixes(type,level,q,m);let it={id:Date.now().toString(36)+Math.random().toString(36).slice(2),name,level,q,type,mainStat:{stat:mainStat,value:mainValue},affixes};addItemStat(it,mainStat,mainValue);affixes.forEach(a=>addItemStat(it,a.stat,a.value));it.sell=ceil(sellBase(level)*QUALITY[q].sm);it.buy=ceil(it.sell*3.5);return it}
function dropItem(enemy,mapIdx){let chance=enemy.kind==="boss"?1:enemy.kind==="elite"?.6:.25;if(Math.random()>chance)return null;let offset=enemy.kind==="boss"?[-1,0,0,1,2]:enemy.kind==="elite"?[-1,0,0,1]:[-2,-1,0,0,1];let lv=Math.max(1,Math.min(MAX_LEVEL,enemy.level+offset[Math.floor(Math.random()*offset.length)]));return makeItem(lv,mapIdx,enemy.kind)}
function itemHtml(it,compact=false){if(!it)return `<span class="muted">無</span>`;return `<span class="${qClass(it.q)}">【${QUALITY[it.q].n}】${it.name} Lv.${it.level}</span>${compact?"":`<div class="muted">${statLine(it)}</div>`}`}
function statLine(it){return [it.atk?`攻擊 +${it.atk}`:"",it.def?`防禦 +${it.def}`:"",it.hp?`HP +${it.hp}`:"",it.crit?`暴擊 +${it.crit}%`:"",it.dodge?`閃避 +${it.dodge}%`:""].filter(Boolean).join("　")}
function itemAbilityLines(it){if(!it)return [];let rows=[{kind:"main",text:formatStatValue(it.mainStat.stat,it.mainStat.value)}];it.affixes.forEach(a=>rows.push({kind:"affix",text:formatStatValue(a.stat,a.value)}));return rows}

function calcDamage(atk,def){return Math.max(1,ceil((atk-def*.55)*(.95+Math.random()*.1)))}
function expReward(e,useTestSpecializations=false){const mul=e.kind==="boss"?5:e.kind==="elite"?2:1;const base=ceil(sameExp(e.level)*mul*expLevelFactor(e.level,state.level));return specializationAdjustedExp(base,useTestSpecializations)}
function goldReward(e,useTestSpecializations=false){const mul=e.kind==="boss"?6:e.kind==="elite"?2.5:1;const base=ceil(goldBase(e.level)*mul);return specializationAdjustedGold(base,useTestSpecializations)}
function enemyUnlocked(mapIdx,eIdx){if(eIdx===0)return true;let p=state.mapProgress[mapIdx]||[0,0,0,0];if(eIdx===1)return p[0]>=10;if(eIdx===2)return p[1]>=10;if(eIdx===3)return p[2]>=10;if(eIdx===4){if(state.bossLocked?.[mapIdx])return false;if(state.bossKilled[mapIdx])return true;return p[3]>=10&&state.level>=MAPS[mapIdx].max}return false}
function highestUnlockedEnemy(mapIdx){for(let i=4;i>=0;i--)if(enemyUnlocked(mapIdx,i))return i;return 0}
function progressEnemyKill(mapIdx,eIdx){if(eIdx<0||eIdx>3)return;let p=state.mapProgress[mapIdx];p[eIdx]=Math.min(999,p[eIdx]+1)}
function canBoss(mapIdx){return enemyUnlocked(mapIdx,4)&&!state.bossLocked?.[mapIdx]}
function addProgress(mapIdx,enemyKind){if(enemyKind!=="elite"||!state.bossLocked?.[mapIdx])return;state.bossProgress[mapIdx]=Math.min(10,(state.bossProgress[mapIdx]||0)+1);if(state.bossProgress[mapIdx]>=10)state.bossLocked[mapIdx]=false}
function addItem(it,options={}){if(!it)return {kept:false,sold:0};let slot=state.equipment[it.type],upgrade=equipmentScore(it)>equipmentScore(slot);if(it.q===5||(state.settings.keepUpgrade&&upgrade)){state.inventory.push(it);if(upgrade)upgradeDropNoticePending=true;return {kept:true,sold:0}}if(it.q<=4&&state.settings.autoSell[it.q]){const sold=specializationSellValue(it,options.useTestSpecializations===true);state.gold+=sold;return {kept:false,sold}}state.inventory.push(it);if(upgrade)upgradeDropNoticePending=true;return {kept:true,sold:0}}
function gainExp(n,logs=[]){state.exp+=Math.max(0,Number(n)||0);let ups=0;while(state.level<MAX_LEVEL&&state.exp>=expNeed(state.level)){state.exp-=expNeed(state.level);state.level++;ups++;state.hp=playerCombatStats().hp;logs.push(`升級！你到達 Lv.${state.level}，HP 已完全恢復。`)}if(state.level>=MAX_LEVEL)state.exp=0;return ups}
function applyDeathPenalty(logs=[]){let loss=state.level>=MAX_LEVEL?0:ceil(expNeed(state.level)*.10),actual=Math.min(state.exp,loss);state.exp=Math.max(0,state.exp-loss);let dropped=null,protectedByVip20=false;const worn=EQUIPMENT_TYPES.map(slot=>[slot,state.equipment[slot]]).filter(([,it])=>!!it),lossRoll=worn.length&&Math.random()<.30;if(lossRoll){if((state.vipLevel||0)>=20)protectedByVip20=true;else{const [slot,it]=worn[Math.floor(Math.random()*worn.length)];state.equipment[slot]=null;dropped=it;state.lostGear.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2),item:it,cost:ceil(it.buy*2),lostAt:Date.now()})}}state.hp=playerCombatStats().hp;logs.push(`死亡懲罰：EXP -${actual}${loss>actual?`（目前 EXP 已扣至 0）`:""}。`);if(dropped)logs.push(`裝備遺失：${itemHtmlPlain(dropped)}。可前往商店贖回。`);else logs.push(`本次沒有遺失裝備。`);return {expLost:actual,dropped,protectedByVip20}}
function itemHtmlPlain(it){return `【${QUALITY[it.q].n}】${it.name} Lv.${it.level}`}

const SHOP_REFRESH_COSTS=[100,200,400,800,1600,3200,6400,12800];
function currentShopMap(){return Math.max(0,Math.min(state.unlockedMap,Math.floor((state.level-1)/5),MAPS.length-1))}
function makeShopItems(mapIdx=currentShopMap()){let m=MAPS[mapIdx],arr=[];for(let i=0;i<3;i++){let lv=Math.max(m.min,Math.min(m.max,state.level+Math.floor(Math.random()*3)-1));let r=Math.random()*100,q=r<48?0:r<82?1:r<96?2:r<99.3?3:4;arr.push(makeItem(lv,mapIdx,"normal",q))}return arr}
function ensureShop(){if(state.shop.initialized!==true){state.shop.items=makeShopItems();state.shop.initialized=true}}
function shopRefreshCost(){return SHOP_REFRESH_COSTS[Math.min(7,state.shop.refreshIndex||0)]}
function claimShopMutation(){if(shopMutationBusy)return false;shopMutationBusy=true;setTimeout(()=>{shopMutationBusy=false},250);return true}
function paidShopRefresh(){let cost=shopRefreshCost();if(state.gold<cost)return {ok:false,reason:"金幣不足。"};if(!claimShopMutation())return {ok:true,ignored:true};state.gold-=cost;state.shop.items=makeShopItems();state.shop.initialized=true;state.shop.refreshIndex=Math.min(7,(state.shop.refreshIndex||0)+1);save(false);return {ok:true}}
function freeShopRefresh(mapIdx=currentShopMap()){state.shop.items=makeShopItems(mapIdx);state.shop.initialized=true;save(false)}
function shopPurchase(i){let it=state.shop.items[i];if(!it)return {ok:false,reason:"商品不存在。"};if(state.gold<it.buy)return {ok:false,reason:"金幣不足。"};if(!claimShopMutation())return {ok:true,ignored:true};state.gold-=it.buy;state.inventory.push(it);state.shop.items.splice(i,1);state.shop.refreshIndex=Math.max(0,(state.shop.refreshIndex||0)-1);save(false);return {ok:true,it}}
function canResetShopPrice(){return (state.shop.refreshIndex||0)>=7&&Date.now()>=(state.shop.resetAvailableAt||0)}
function resetShopPrice(){if((state.shop.refreshIndex||0)<7)return {ok:false,reason:"刷新價格尚未達 12,800。"};let now=Date.now(),at=state.shop.resetAvailableAt||0;if(now<at)return {ok:false,reason:"重置功能仍在冷卻中。"};if(!claimShopMutation())return {ok:true,ignored:true};state.shop.refreshIndex=0;state.shop.resetAvailableAt=now+60*60*1000;save(false);return {ok:true}}
function redeemLostGear(i){let lost=state.lostGear[i];if(!lost)return {ok:false,reason:"找不到這件遺失裝備。"};if(state.gold<lost.cost)return {ok:false,reason:"金幣不足。"};if(!claimShopMutation())return {ok:true,ignored:true};state.gold-=lost.cost;state.inventory.push(lost.item);state.lostGear.splice(i,1);save(false);return {ok:true,item:lost.item}}

function syncUpgradeDropNotice(){try{const modal=document.getElementById("battleResultModal"),detail=document.getElementById("battleResultDetail");if(!modal||!detail||!modal.classList.contains("show")||!upgradeDropNoticePending)return;if(!detail.querySelector(".upgrade-drop-notice"))detail.insertAdjacentHTML("beforeend",`<div class="notice upgrade-drop-notice" style="margin-top:12px"><b>有可提升目前裝備的掉落，可前往背包查看。</b></div>`);upgradeDropNoticePending=false}catch(e){}}
if(typeof MutationObserver!=="undefined"){const resultModal=document.getElementById("battleResultModal");if(resultModal){new MutationObserver(syncUpgradeDropNotice).observe(resultModal,{attributes:true,attributeFilter:["class"],childList:true,subtree:true})}}
