const navs=[["adventure","冒險"],["character","角色"],["inventory","背包"],["shop","商店"],["settings","設定"]];
let state, view="home", selectedMap=0, selectedEnemy=0, selectedItem=null, battleLogs=[], battleBusy=false, shopItems=[];

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
function newState(){return {saveVersion:SAVE_VERSION,level:1,exp:0,hp:baseHP(1),gold:0,unlockedMap:0,equipment:{weapon:null,armor:null,accessory:null},inventory:[],bossProgress:Array(10).fill(8),bossKilled:Array(10).fill(false),settings:{autoSell:[false,false,false,false,false],keepUpgrade:true,fastBattle:false,fullLog:true,dark:true},gm:false}}
function load(){
 try{let raw=localStorage.getItem(SAVE_KEY);state=raw?JSON.parse(raw):newState()}catch(e){state=newState()}
 if(!state.saveVersion)state.saveVersion=SAVE_VERSION;
 if(!state.bossProgress)state.bossProgress=Array(10).fill(8);
 if(!state.bossKilled)state.bossKilled=Array(10).fill(false);
 if(!state.settings)state.settings=newState().settings;
 selectedMap=Math.min(state.unlockedMap,9);
 normalizeHP();save(false);
}
function save(show=true){localStorage.setItem(SAVE_KEY,JSON.stringify(state));if(show){let e=document.getElementById("saveStatus");if(e){e.textContent="已自動存檔";setTimeout(()=>e.textContent="本機自動存檔",900)}}}
function equippedStats(){
 let x={hp:baseHP(state.level),atk:baseATK(state.level),def:baseDEF(state.level)};
 Object.values(state.equipment).filter(Boolean).forEach(it=>{x.hp+=it.hp||0;x.atk+=it.atk||0;x.def+=it.def||0}); return x;
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
 let baseNames=MAPS[mapIdx].gear,name=baseNames[type==="weapon"?0:type==="armor"?1:2],m=QUALITY[q].m,it={id:Date.now().toString(36)+Math.random().toString(36).slice(2),name,level,q,type,locked:false};
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
 if(kind==="elite"){b.hp=ceil(b.hp*1.45);b.atk=ceil(b.atk*1.15);b.def=ceil(b.def*1.1)}
 if(kind==="boss"){b.hp=ceil(b.hp*1.85);b.atk=ceil(b.atk*1.16);b.def=ceil(b.def*1.15)}
 return {name:d[0],level:d[1],kind,style,...b};
}
function calcDamage(atk,def){return Math.max(1,ceil((atk-def*.55)*(.95+Math.random()*.1)))}
function expReward(e){let mul=e.kind==="boss"?8:e.kind==="elite"?3:1;return ceil(sameExp(e.level)*mul*expLevelFactor(e.level,state.level))}
function goldReward(e){let mul=e.kind==="boss"?6:e.kind==="elite"?2.5:1;return ceil(goldBase(e.level)*mul)}
function canBoss(mapIdx){let bossLv=MAPS[mapIdx].max;if(state.level<bossLv)return false;return !state.bossKilled[mapIdx]||state.bossProgress[mapIdx]>=8}
function addProgress(mapIdx,enemyKind){if(state.bossKilled[mapIdx]&&enemyKind==="elite")state.bossProgress[mapIdx]=Math.min(8,state.bossProgress[mapIdx]+1)}
function addItem(it){
 if(!it)return {kept:false,sold:0};
 let slot=state.equipment[it.type],upgrade=equipmentScore(it)>equipmentScore(slot);
 if(it.q===5||it.locked||(state.settings.keepUpgrade&&upgrade)){state.inventory.push(it);return {kept:true,sold:0}}
 if(it.q<=4&&state.settings.autoSell[it.q]){state.gold+=it.sell;return {kept:false,sold:it.sell}}
 state.inventory.push(it);return {kept:true,sold:0};
}
function gainExp(n,logs){
 state.exp+=n;let ups=0;
 while(state.level<50&&state.exp>=expNeed(state.level)){state.exp-=expNeed(state.level);state.level++;ups++;state.hp=equippedStats().hp;logs.push(`升級！你到達 Lv.${state.level}，HP 已完全恢復。`)}
 if(state.level>=50)state.exp=0;return ups;
}
function fightOnce(mapIdx,eIdx){
 let e=monsterObj(mapIdx,eIdx);
 if(e.kind==="boss"&&!canBoss(mapIdx)){let bossLv=MAPS[mapIdx].max;return {ok:false,reason:state.level<bossLv?`需要 Lv.${bossLv} 才能挑戰 Boss。`:`Boss 尚未重生，目前菁英進度 ${state.bossProgress[mapIdx]}/8。`};}
 let ps=equippedStats(),ehp=e.hp,php=state.hp,logs=[],turn=0;
 while(php>0&&ehp>0&&turn<200){
   turn++;let pd=calcDamage(ps.atk,e.def);ehp-=pd;logs.push(`你攻擊${e.name}，造成 ${pd} 點傷害。`);
   if(ehp<=0)break;
   let ed=calcDamage(e.atk,ps.def);php-=ed;logs.push(`${e.name}攻擊你，造成 ${ed} 點傷害。`);
 }
 state.hp=Math.max(0,php);
 if(php<=0){logs.push(`你被${e.name}擊敗。`);state.hp=equippedStats().hp;save(false);return {ok:true,win:false,logs,e}}
 let xp=expReward(e),gold=goldReward(e);state.gold+=gold;gainExp(xp,logs);
 if(e.kind==="boss"){
   state.bossKilled[mapIdx]=true;state.bossProgress[mapIdx]=0;
   if(mapIdx<9&&!state.bossKilled[mapIdx+1])state.unlockedMap=Math.max(state.unlockedMap,mapIdx+1);
 }else addProgress(mapIdx,e.kind);
 let it=dropItem(e,mapIdx),ir=addItem(it);
 logs.push(`${e.name}被擊敗。獲得 EXP +${xp}、金幣 +${gold}。`);
 if(e.kind==="elite"&&state.bossKilled[mapIdx]&&state.bossProgress[mapIdx]<8)logs.push(`Boss 重生進度：${state.bossProgress[mapIdx]}/8 菁英。`);
 if(e.kind==="elite"&&state.bossKilled[mapIdx]&&state.bossProgress[mapIdx]>=8)logs.push(`Boss 已重新出現，可以再次挑戰。`);
 if(it)logs.push(`${ir.sold?`自動出售 ${itemHtmlPlain(it)}，金幣 +${ir.sold}`:`獲得裝備 ${itemHtmlPlain(it)}`}`);
 save(false);return {ok:true,win:true,logs,e,xp,gold,item:it,sold:ir.sold};
}
function itemHtmlPlain(it){return `【${QUALITY[it.q].n}】${it.name} Lv.${it.level}`}
