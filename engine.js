const navs=[["adventure","冒險"],["character","角色"],["inventory","背包"],["shop","商店"],["settings","設定"]];
let state, view="home", selectedMap=0, selectedEnemy=0, selectedItem=null, battleLogs=[], battleBusy=false;
let upgradeDropNoticePending=false;

function ceil(n){return Math.ceil(n)}
function baseHP(l){return ceil(110+12*(l-1))}
function baseATK(l){return ceil(15+2.2*(l-1))}
function baseDEF(l){return ceil(7+1.2*(l-1))}
function monsterBase(l){return {hp:ceil(60+16*l),atk:ceil(10+2.35*l),def:ceil(3+.9*l)}}
function sameExp(l){return ceil(25+4*l)}
function expNeed(l){return ceil(sameExp(l)*(4.5+.35*l+.023*l*l))}
function expLevelFactor(ml,pl){let d=ml-pl;if(d>=5)return 1.3;if(d>=3)return 1.2;if(d>=1)return 1.1;if(d===0)return 1;if(d>=-2)return .9;if(d>=-5)return .6;if(d>=-10)return .25;return .05}
function goldBase(l){return ceil(6+4*l)}
function sellBase(l){return ceil(12+8*l)}
function qClass(q){return "q-"+QUALITY[q].k}
function blankMapProgress(){return Array.from({length:10},()=>[0,0,0,0])}
function newShopState(){return {items:[],refreshIndex:0,resetAvailableAt:0}}
function newState(){return {
 saveVersion:SAVE_VERSION,level:1,exp:0,hp:baseHP(1),gold:0,unlockedMap:0,
 equipment:{weapon:null,armor:null,accessory:null},inventory:[],
 mapProgress:blankMapProgress(),bossProgress:Array(10).fill(0),bossLocked:Array(10).fill(false),bossKilled:Array(10).fill(false),
 lostGear:[],shop:newShopState(),
 settings:{autoSell:[false,false,false,false,false],keepUpgrade:true,dark:true},gm:false
}}

function load(){
 try{let raw=localStorage.getItem(SAVE_KEY);state=raw?JSON.parse(raw):newState()}catch(e){state=newState()}
 if(!state.saveVersion)state.saveVersion=SAVE_VERSION;
 if(!state.mapProgress)state.mapProgress=blankMapProgress();
 if(!state.bossProgress)state.bossProgress=Array(10).fill(0);
 if(!state.bossLocked)state.bossLocked=Array(10).fill(false);
 if(!state.bossKilled)state.bossKilled=Array(10).fill(false);
 if(!state.lostGear)state.lostGear=[];
 if(!state.shop)state.shop=newShopState();
 if(!Array.isArray(state.shop.items))state.shop.items=[];
 if(typeof state.shop.refreshIndex!=="number")state.shop.refreshIndex=0;
 if(typeof state.shop.resetAvailableAt!=="number")state.shop.resetAvailableAt=0;
 if(!state.settings)state.settings=newState().settings;
 if(!Array.isArray(state.settings.autoSell))state.settings.autoSell=[false,false,false,false,false];
 if(typeof state.settings.keepUpgrade!=="boolean")state.settings.keepUpgrade=true;
 state.saveVersion=SAVE_VERSION;
 selectedMap=Math.min(state.unlockedMap,9);
 normalizeHP();
 ensureShop();
 save(false);
}
function save(show=true){localStorage.setItem(SAVE_KEY,JSON.stringify(state));if(show){let e=document.getElementById("saveStatus");if(e){e.textContent="已自動存檔";setTimeout(()=>e.textContent="本機自動存檔",900)}}}
function equippedStats(){
 let x={hp:baseHP(state.level),atk:baseATK(state.level),def:baseDEF(state.level)};
 Object.values(state.equipment).filter(Boolean).forEach(it=>{x.hp+=it.hp||0;x.atk+=it.atk||0;x.def+=it.def||0});return x;
}
function normalizeHP(){let m=equippedStats().hp;state.hp=Math.min(state.hp??m,m)}
function equipmentScore(it){if(!it)return -1;if(it.type==="weapon")return it.atk||0;if(it.type==="armor")return (it.def||0)*5+(it.hp||0);return (it.atk||0)*5+(it.def||0)*5+(it.hp||0)}
function qualityRoll(kind){
 let r=Math.random()*100,c=0,arr;
 if(kind==="boss")arr=[0,45,35,15,4.5,.5];
 else if(kind==="elite")arr=[35,35,20,8,1.8,.2];
 else arr=[50,30,15,4,.9,.1];
 for(let i=0;i<arr.length;i++){c+=arr[i];if(r<c)return i}return 0;
}
function makeItem(level,mapIdx,kind="normal",forcedQ=null,forcedType=null){
 let q=forcedQ??qualityRoll(kind),type=forcedType??["weapon","armor","accessory"][Math.floor(Math.random()*3)];
 let baseNames=MAPS[mapIdx].gear,name=baseNames[type==="weapon"?0:type==="armor"?1:2],m=QUALITY[q].m;
 let it={id:Date.now().toString(36)+Math.random().toString(36).slice(2),name,level,q,type};
 if(type==="weapon")it.atk=ceil((3+1.55*level)*m);
 if(type==="armor"){it.def=ceil((1+.55*level)*m);it.hp=ceil((8+2.8*level)*m)}
 if(type==="accessory"){it.atk=ceil((.8+.32*level)*m);it.def=ceil((.4+.2*level)*m);it.hp=ceil((4+1.2*level)*m)}
 it.sell=ceil(sellBase(level)*QUALITY[q].sm);it.buy=ceil(it.sell*3.5);return it;
}
function dropItem(enemy,mapIdx){
 let chance=enemy.kind==="boss"?1:enemy.kind==="elite"?.6:.25;if(Math.random()>chance)return null;
 let offset=enemy.kind==="boss"?[-1,0,0,1,2]:enemy.kind==="elite"?[-1,0,0,1]:[-2,-1,0,0,1];
 let lv=Math.max(1,Math.min(50,enemy.level+offset[Math.floor(Math.random()*offset.length)]));
 return makeItem(lv,mapIdx,enemy.kind);
}
function itemHtml(it,compact=false){if(!it)return `<span class="muted">無</span>`;return `<span class="${qClass(it.q)}">【${QUALITY[it.q].n}】${it.name} Lv.${it.level}</span>${compact?"":`<div class="muted">${statLine(it)}</div>`}`}
function statLine(it){return [it.atk?`攻擊 +${it.atk}`:"",it.def?`防禦 +${it.def}`:"",it.hp?`HP +${it.hp}`:""].filter(Boolean).join("　")}

function monsterObj(mapIdx,eIdx){
 let d=MAPS[mapIdx].enemies[eIdx],b=monsterBase(d[1]),kind=d[2],style=d[3];
 if(style==="tank"){b.hp=ceil(b.hp*1.25);b.atk=ceil(b.atk*.9)}
 if(style==="attack"){b.hp=ceil(b.hp*.85);b.atk=ceil(b.atk*1.2)}
 const stage=[
  {hp:1,atk:1,def:1},
  {hp:1.12,atk:1.10,def:1.08},
  {hp:1.28,atk:1.20,def:1.15},
  {hp:1.60,atk:1.30,def:1.22},
  {hp:2.05,atk:1.35,def:1.28}
 ][eIdx]||{hp:1,atk:1,def:1};
 b.hp=ceil(b.hp*stage.hp);b.atk=ceil(b.atk*stage.atk);b.def=ceil(b.def*stage.def);
 return {name:d[0],level:d[1],kind,style,...b};
}
function calcDamage(atk,def){return Math.max(1,ceil((atk-def*.55)*(.95+Math.random()*.1)))}
function expReward(e){let mul=e.kind==="boss"?5:e.kind==="elite"?2:1;return ceil(sameExp(e.level)*mul*expLevelFactor(e.level,state.level))}
function goldReward(e){let mul=e.kind==="boss"?6:e.kind==="elite"?2.5:1;return ceil(goldBase(e.level)*mul)}

function enemyUnlocked(mapIdx,eIdx){
 if(eIdx===0)return true;
 let p=state.mapProgress[mapIdx]||[0,0,0,0];
 if(eIdx===1)return p[0]>=10;
 if(eIdx===2)return p[1]>=10;
 if(eIdx===3)return p[2]>=10;
 if(eIdx===4){
   if(state.bossLocked?.[mapIdx])return false;
   if(state.bossKilled[mapIdx])return true;
   return p[3]>=10&&state.level>=MAPS[mapIdx].max;
 }
 return false;
}
function highestUnlockedEnemy(mapIdx){for(let i=4;i>=0;i--)if(enemyUnlocked(mapIdx,i))return i;return 0}
function progressEnemyKill(mapIdx,eIdx){
 if(eIdx<0||eIdx>3)return;
 let p=state.mapProgress[mapIdx];
 p[eIdx]=Math.min(999,p[eIdx]+1);
}
function canBoss(mapIdx){return enemyUnlocked(mapIdx,4)&&!state.bossLocked?.[mapIdx]}
function addProgress(mapIdx,enemyKind){
 if(enemyKind!=="elite"||!state.bossLocked?.[mapIdx])return;
 state.bossProgress[mapIdx]=Math.min(10,(state.bossProgress[mapIdx]||0)+1);
 if(state.bossProgress[mapIdx]>=10)state.bossLocked[mapIdx]=false;
}

function addItem(it){
 if(!it)return {kept:false,sold:0};
 let slot=state.equipment[it.type],upgrade=equipmentScore(it)>equipmentScore(slot);
 if(it.q===5||(state.settings.keepUpgrade&&upgrade)){
   state.inventory.push(it);
   if(upgrade)upgradeDropNoticePending=true;
   return {kept:true,sold:0};
 }
 if(it.q<=4&&state.settings.autoSell[it.q]){state.gold+=it.sell;return {kept:false,sold:it.sell}}
 state.inventory.push(it);
 if(upgrade)upgradeDropNoticePending=true;
 return {kept:true,sold:0};
}
function gainExp(n,logs){
 state.exp+=n;let ups=0;
 while(state.level<50&&state.exp>=expNeed(state.level)){state.exp-=expNeed(state.level);state.level++;ups++;state.hp=equippedStats().hp;logs.push(`升級！你到達 Lv.${state.level}，HP 已完全恢復。`)}
 if(state.level>=50)state.exp=0;return ups;
}
function applyDeathPenalty(logs){
 let loss=state.level>=50?0:ceil(expNeed(state.level)*.10),actual=Math.min(state.exp,loss);
 state.exp=Math.max(0,state.exp-loss);
 let dropped=null;
 let worn=Object.entries(state.equipment).filter(([,it])=>!!it);
 if(worn.length&&Math.random()<.30){
   let [slot,it]=worn[Math.floor(Math.random()*worn.length)];
   state.equipment[slot]=null;
   dropped=it;
   state.lostGear.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2),item:it,cost:ceil(it.buy*2),lostAt:Date.now()});
 }
 state.hp=equippedStats().hp;
 logs.push(`死亡懲罰：EXP -${actual}${loss>actual?`（目前 EXP 已扣至 0）`:""}。`);
 if(dropped)logs.push(`裝備遺失：${itemHtmlPlain(dropped)}。可前往商店贖回。`);
 else logs.push(`本次沒有遺失裝備。`);
 return {expLost:actual,dropped};
}

function fightOnce(mapIdx,eIdx){
 if(!enemyUnlocked(mapIdx,eIdx)){
   if(eIdx===4&&state.bossLocked?.[mapIdx])return {ok:false,reason:`Boss 挑戰暫時鎖定，請先擊敗本地圖菁英怪 10 隻（${state.bossProgress[mapIdx]||0}/10）。`};
   return {ok:false,reason:"這隻怪物尚未解鎖。"};
 }
 let e=monsterObj(mapIdx,eIdx);
 if(e.kind==="boss"&&!canBoss(mapIdx))return {ok:false,reason:`Boss 挑戰暫時鎖定，請先擊敗本地圖菁英怪 10 隻（${state.bossProgress[mapIdx]||0}/10）。`};
 let ps=equippedStats(),ehp=e.hp,php=state.hp,logs=[],turn=0;
 while(php>0&&ehp>0&&turn<200){
   turn++;let pd=calcDamage(ps.atk,e.def);ehp-=pd;logs.push(`你攻擊${e.name}，造成 ${pd} 點傷害。`);
   if(ehp<=0)break;
   let ed=calcDamage(e.atk,ps.def);php-=ed;logs.push(`${e.name}攻擊你，造成 ${ed} 點傷害。`);
 }
 state.hp=Math.max(0,php);
 if(php<=0){
   logs.push(`你被${e.name}擊敗。`);
   if(e.kind==="boss"){
     state.bossLocked[mapIdx]=true;
     state.bossProgress[mapIdx]=0;
     logs.push(`Boss 再挑戰已鎖定：需再擊敗本地圖菁英怪 10 隻。`);
   }
   let penalty=applyDeathPenalty(logs);
   save(false);return {ok:true,win:false,logs,e,penalty};
 }
 let xp=expReward(e),gold=goldReward(e);state.gold+=gold;gainExp(xp,logs);
 if(e.kind==="boss"){
   let first=!state.bossKilled[mapIdx];
   state.bossKilled[mapIdx]=true;state.bossLocked[mapIdx]=false;state.bossProgress[mapIdx]=0;
   if(first&&mapIdx<9){
     state.unlockedMap=Math.max(state.unlockedMap,mapIdx+1);
     freeShopRefresh(mapIdx+1);
   }
 }else{
   progressEnemyKill(mapIdx,eIdx);
   addProgress(mapIdx,e.kind);
 }
 let it=dropItem(e,mapIdx),ir=addItem(it);
 logs.push(`${e.name}被擊敗。獲得 EXP +${xp}、金幣 +${gold}。`);
 if(e.kind==="normal"&&eIdx<2&&state.mapProgress[mapIdx][eIdx]===10)logs.push(`新敵人已出現：${MAPS[mapIdx].enemies[eIdx+1][0]}。`);
 if(e.kind==="normal"&&eIdx===2&&state.mapProgress[mapIdx][2]===10)logs.push(`菁英敵人已出現：${MAPS[mapIdx].enemies[3][0]}。`);
 if(e.kind==="elite"&&!state.bossKilled[mapIdx]&&!state.bossLocked[mapIdx]&&state.mapProgress[mapIdx][3]>=10){
   logs.push(state.level>=MAPS[mapIdx].max?`Boss 已出現：${MAPS[mapIdx].enemies[4][0]}。`:`菁英進度完成；達到 Lv.${MAPS[mapIdx].max} 後 Boss 才會出現。`);
 }
 if(e.kind==="elite"&&state.bossLocked[mapIdx])logs.push(`Boss 再挑戰進度：${state.bossProgress[mapIdx]}/10 菁英。`);
 if(e.kind==="elite"&&!state.bossLocked[mapIdx]&&state.bossProgress[mapIdx]>=10)logs.push(`Boss 已重新開放，可以再次挑戰。`);
 if(it)logs.push(`${ir.sold?`自動出售 ${itemHtmlPlain(it)}，金幣 +${ir.sold}`:`獲得裝備 ${itemHtmlPlain(it)}`}`);
 save(false);return {ok:true,win:true,logs,e,xp,gold,item:it,sold:ir.sold};
}
function itemHtmlPlain(it){return `【${QUALITY[it.q].n}】${it.name} Lv.${it.level}`}

const SHOP_REFRESH_COSTS=[100,200,400,800,1600,3200,6400,12800];
function currentShopMap(){return Math.min(state.unlockedMap,Math.floor((state.level-1)/5),9)}
function makeShopItems(mapIdx=currentShopMap()){
 let m=MAPS[mapIdx],arr=[];
 for(let i=0;i<6;i++){
   let lv=Math.max(m.min,Math.min(m.max,state.level+Math.floor(Math.random()*3)-1));
   let r=Math.random()*100,q=r<48?0:r<82?1:r<96?2:r<99.3?3:4;
   arr.push(makeItem(lv,mapIdx,"normal",q));
 }
 return arr;
}
function ensureShop(){if(!state.shop.items.length)state.shop.items=makeShopItems()}
function shopRefreshCost(){return SHOP_REFRESH_COSTS[Math.min(7,state.shop.refreshIndex||0)]}
function paidShopRefresh(){
 let cost=shopRefreshCost();if(state.gold<cost)return {ok:false,reason:"金幣不足。"};
 state.gold-=cost;state.shop.items=makeShopItems();state.shop.refreshIndex=Math.min(7,(state.shop.refreshIndex||0)+1);save(false);return {ok:true};
}
function freeShopRefresh(mapIdx=currentShopMap()){state.shop.items=makeShopItems(mapIdx);save(false)}
function shopPurchase(i){
 let it=state.shop.items[i];if(!it)return {ok:false,reason:"商品不存在。"};
 if(state.gold<it.buy)return {ok:false,reason:"金幣不足。"};
 state.gold-=it.buy;state.inventory.push(it);state.shop.items.splice(i,1);
 state.shop.refreshIndex=Math.max(0,(state.shop.refreshIndex||0)-1);save(false);return {ok:true,it};
}
function canResetShopPrice(){return (state.shop.refreshIndex||0)>=7&&Date.now()>=(state.shop.resetAvailableAt||0)}
function resetShopPrice(){
 if((state.shop.refreshIndex||0)<7)return {ok:false,reason:"刷新價格尚未達 12,800。"};
 let now=Date.now(),at=state.shop.resetAvailableAt||0;if(now<at)return {ok:false,reason:"重置功能仍在冷卻中。"};
 state.shop.refreshIndex=0;state.shop.resetAvailableAt=now+60*60*1000;save(false);return {ok:true};
}
function redeemLostGear(i){
 let lost=state.lostGear[i];if(!lost)return {ok:false,reason:"找不到這件遺失裝備。"};
 if(state.gold<lost.cost)return {ok:false,reason:"金幣不足。"};
 state.gold-=lost.cost;state.inventory.push(lost.item);state.lostGear.splice(i,1);save(false);return {ok:true,item:lost.item};
}

function syncProgressRuleUI(){
 try{
   const max=state.level<=5?1:state.level<=20?5:state.level<=35?10:15;
   document.querySelectorAll(".count-card").forEach(btn=>{
     const n=btn.textContent.includes("單場")?1:parseInt(btn.textContent,10)||1;
     btn.style.display=n<=max?"":"none";
   });
   if(typeof selectedBattleCount!=="undefined"&&selectedBattleCount>max)selectedBattleCount=max;
   const notice=document.querySelector(".prepare-main .notice");
   if(notice&&typeof selectedMap!=="undefined"){
     const p=state.mapProgress[selectedMap]||[0,0,0,0],map=MAPS[selectedMap];
     const bossText=state.bossLocked?.[selectedMap]?`需再擊敗菁英 ${state.bossProgress[selectedMap]||0}/10`:state.bossKilled[selectedMap]?"已擊敗・可再次挑戰":enemyUnlocked(selectedMap,4)?"可挑戰":"未出現";
     const html=`<b>地圖推進</b><br>${map.enemies[0][0]}：${Math.min(10,p[0])}/10　｜　${map.enemies[1][0]}：${enemyUnlocked(selectedMap,1)?Math.min(10,p[1])+"/10":"未出現"}　｜　${map.enemies[2][0]}：${enemyUnlocked(selectedMap,2)?Math.min(10,p[2])+"/10":"未出現"}　｜　${map.enemies[3][0]}：${enemyUnlocked(selectedMap,3)?Math.min(10,p[3])+"/10":"未出現"}　｜　${map.enemies[4][0]}：${bossText}`;
     if(notice.dataset.ruleHtml!==html){notice.dataset.ruleHtml=html;notice.innerHTML=html;}
   }
 }catch(e){}
}
function syncUpgradeDropNotice(){
 try{
   const modal=document.getElementById("battleResultModal"),detail=document.getElementById("battleResultDetail");
   if(!modal||!detail||!modal.classList.contains("show")||!upgradeDropNoticePending)return;
   if(!detail.querySelector(".upgrade-drop-notice"))detail.insertAdjacentHTML("beforeend",`<div class="notice upgrade-drop-notice" style="margin-top:12px"><b>有可提升目前裝備的掉落，可前往背包查看。</b></div>`);
   upgradeDropNoticePending=false;
 }catch(e){}
}
if(typeof MutationObserver!=="undefined"){
 const main=document.getElementById("main");
 if(main){new MutationObserver(syncProgressRuleUI).observe(main,{childList:true,subtree:true});setTimeout(syncProgressRuleUI,0);}
 const resultModal=document.getElementById("battleResultModal");
 if(resultModal){new MutationObserver(syncUpgradeDropNotice).observe(resultModal,{attributes:true,attributeFilter:["class"],childList:true,subtree:true});}
}