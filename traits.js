const MONSTER_TRAITS={
 strong:{name:"強壯",desc:"HP +20%",color:"#79c982",border:"#4d8455"},
 ferocious:{name:"兇猛",desc:"攻擊 +15%",color:"#ff7d73",border:"#9c4c46"},
 hard:{name:"堅硬",desc:"防禦 +20%",color:"#8fb3d9",border:"#536e89"},
 swift:{name:"迅捷",desc:"閃避 +8%",color:"#69d9d0",border:"#3e8984"},
 deadly:{name:"致命",desc:"暴擊 +8%",color:"#c58aff",border:"#76529b"},
 berserk:{name:"狂暴",desc:"HP 低於 50% 時攻擊 +20%",color:"#ff9d5c",border:"#9d6038"},
 giant:{name:"巨體",desc:"HP +30%、攻擊 +5%、閃避 -5%",color:"#d9c36b",border:"#88793f"}
};
const MONSTER_TRAIT_IDS=Object.keys(MONSTER_TRAITS);
const baseMonsterObj=monsterObj;
let monsterPreviewCache={};
let currentCombatEncounter=null;
let inventoryFromAdventure=false;

function traitCountForKind(kind){
 let r=Math.random()*100;
 if(kind==="boss")return r<15?0:r<70?1:2;
 if(kind==="elite")return r<35?0:r<85?1:2;
 return r<70?0:r<95?1:2;
}
function rollMonsterTraits(kind){
 let count=traitCountForKind(kind),pool=MONSTER_TRAIT_IDS.slice(),out=[];
 for(let i=0;i<count&&pool.length;i++){
  let n=Math.floor(Math.random()*pool.length);out.push(pool.splice(n,1)[0]);
 }
 return out;
}
function applyMonsterTraits(enemy,traitIds){
 let e={...enemy,traits:traitIds.slice(),crit:0,dodge:0,berserk:false};
 traitIds.forEach(id=>{
  if(id==="strong")e.hp=ceil(e.hp*1.20);
  if(id==="ferocious")e.atk=ceil(e.atk*1.15);
  if(id==="hard")e.def=ceil(e.def*1.20);
  if(id==="swift")e.dodge+=8;
  if(id==="deadly")e.crit+=8;
  if(id==="berserk")e.berserk=true;
  if(id==="giant"){e.hp=ceil(e.hp*1.30);e.atk=ceil(e.atk*1.05);e.dodge-=5;}
 });
 e.crit=round1(Math.max(0,Math.min(MONSTER_MAX_CRIT_RATE,e.crit)));
 e.dodge=round1(Math.max(0,Math.min(MONSTER_MAX_DODGE_RATE,e.dodge)));
 return e;
}
function createMonsterEncounter(mapIdx,eIdx){
 let base=baseMonsterObj(mapIdx,eIdx);
 return applyMonsterTraits(base,rollMonsterTraits(base.kind));
}
function previewKey(mapIdx,eIdx){return `${mapIdx}:${eIdx}`}
function getPreviewEncounter(mapIdx,eIdx){
 let k=previewKey(mapIdx,eIdx);if(!monsterPreviewCache[k])monsterPreviewCache[k]=createMonsterEncounter(mapIdx,eIdx);return monsterPreviewCache[k];
}
function clearPreviewEncounter(mapIdx,eIdx){delete monsterPreviewCache[previewKey(mapIdx,eIdx)]}
function traitDetailsHtml(traits){
 if(!traits?.length)return "";
 return `<div class="trait-details">${traits.map(id=>{let t=MONSTER_TRAITS[id];return `<div class="trait-detail-row"><span class="trait-detail-name" style="border-color:${t.border};color:${t.color}">${t.name}</span><span class="trait-detail-desc">${t.desc}</span></div>`}).join("")}</div>`;
}

window.monsterObj=function(mapIdx,eIdx){return getPreviewEncounter(mapIdx,eIdx)};

const baseGoForAdventureInventory=go;
go=function(v){inventoryFromAdventure=false;return baseGoForAdventureInventory(v)};
function openAdventureInventory(){inventoryFromAdventure=true;view="inventory";render()}
function backToAdventureFromInventory(){inventoryFromAdventure=false;view="adventure";adventureScreen="prepare";render()}
const baseInventoryPageForAdventure=inventoryPage;
inventoryPage=function(){
 let html=baseInventoryPageForAdventure();
 if(!inventoryFromAdventure)return html;
 return html.replace(`onclick="go('home')"`,`onclick="backToAdventureFromInventory()"`).replace("← 返回主頁","← 返回冒險");
};

function enterMap(i){
 if(i>state.unlockedMap)return;
 monsterPreviewCache={};currentCombatEncounter=null;selectedMap=i;selectedEnemy=0;selectedBattleCount=1;adventureScreen="prepare";render();
}
function selectEnemy(i){
 if(!enemyUnlocked(selectedMap,i))return;
 selectedEnemy=i;let e=getPreviewEncounter(selectedMap,selectedEnemy);if(e.kind==="boss")selectedBattleCount=1;render();
}

const baseAdventurePreparePageForTraits=adventurePreparePage;
adventurePreparePage=function(){
 const html=baseAdventurePreparePageForTraits();
 const template=document.createElement("template");
 template.innerHTML=html.trim();
 const root=template.content;
 root.querySelectorAll(".enemy-grid .enemy-card").forEach(card=>{
  const match=(card.getAttribute("onclick")||"").match(/selectEnemy\((\d+)\)/);
  if(!match)return;
  const encounter=getPreviewEncounter(selectedMap,Number(match[1]));
  if(!encounter?.traits?.length)return;
  const meta=card.querySelector(".enemy-meta");
  if(meta)meta.insertAdjacentHTML("beforebegin",traitDetailsHtml(encounter.traits));
 });
 const actions=root.querySelector(".prepare-actions");
 if(actions&&!actions.querySelector("[data-adventure-inventory]")){
  const btn=document.createElement("button");
  btn.className="btn blue";
  btn.type="button";
  btn.dataset.adventureInventory="1";
  btn.setAttribute("onclick","openAdventureInventory()");
  btn.textContent="背包";
  actions.insertBefore(btn,actions.children[1]||null);
 }
 return template.innerHTML;
};

function flashCombatText(target,text){
 let card=document.getElementById(target==="enemy"?"combatEnemyCard":"combatPlayerCard"),dmg=document.getElementById(target==="enemy"?"combatEnemyDamage":"combatPlayerDamage");
 if(card&&text!=="閃避"){card.classList.remove("hit");void card.offsetWidth;card.classList.add("hit");setTimeout(()=>card.classList.remove("hit"),260)}
 if(dmg){dmg.textContent=text;dmg.classList.remove("show");void dmg.offsetWidth;dmg.classList.add("show")}
}
async function animateFight(r,startPlayerHp,playerMax,enemyMax,roundText=""){
 let ehp=enemyMax,php=startPlayerHp;
 setCombatHp(ehp,enemyMax,php,playerMax,roundText?`${roundText}・開始戰鬥`:"開始戰鬥");await sleep(180);
 for(let line of r.logs){
  let m=line.match(/^你攻擊.+，暴擊造成 (\d+) 點傷害。$/);
  if(m){attackMotion("player");await sleep(120);ehp=Math.max(0,ehp-(+m[1]));flashCombatText("enemy",`暴擊 -${m[1]}`);setCombatHp(ehp,enemyMax,php,playerMax,`暴擊！你造成 ${m[1]} 點傷害`);await sleep(r.e.kind==="boss"?260:190);continue}
  m=line.match(/^你攻擊.+，造成 (\d+) 點傷害。$/);
  if(m){attackMotion("player");await sleep(120);ehp=Math.max(0,ehp-(+m[1]));flashCombatText("enemy",`-${m[1]}`);setCombatHp(ehp,enemyMax,php,playerMax,`你造成 ${m[1]} 點傷害`);await sleep(r.e.kind==="boss"?260:190);continue}
  m=line.match(/^你攻擊.+，.+閃避了攻擊。$/);
  if(m){attackMotion("player");await sleep(120);flashCombatText("enemy","閃避");setCombatHp(ehp,enemyMax,php,playerMax,`${r.e.name}閃避了你的攻擊`);await sleep(190);continue}
  m=line.match(/^.+攻擊你，暴擊造成 (\d+) 點傷害。$/);
  if(m){attackMotion("enemy");await sleep(120);php=Math.max(0,php-(+m[1]));flashCombatText("player",`暴擊 -${m[1]}`);setCombatHp(ehp,enemyMax,php,playerMax,`${r.e.name}暴擊造成 ${m[1]} 點傷害`);await sleep(r.e.kind==="boss"?260:190);continue}
  m=line.match(/^.+攻擊你，造成 (\d+) 點傷害。$/);
  if(m){attackMotion("enemy");await sleep(120);php=Math.max(0,php-(+m[1]));flashCombatText("player",`-${m[1]}`);setCombatHp(ehp,enemyMax,php,playerMax,`${r.e.name}造成 ${m[1]} 點傷害`);await sleep(r.e.kind==="boss"?260:190);continue}
  m=line.match(/^.+攻擊你，你閃避了攻擊。$/);
  if(m){attackMotion("enemy");await sleep(120);flashCombatText("player","閃避");setCombatHp(ehp,enemyMax,php,playerMax,`你閃避了${r.e.name}的攻擊`);await sleep(190)}
 }
 setCombatHp(ehp,enemyMax,php,playerMax,r.win?"戰鬥勝利！":"戰敗！");await sleep(250);
}

function beginCombat(count){
 combatRound=1;combatTotal=count;currentCombatEncounter=getPreviewEncounter(selectedMap,selectedEnemy);adventureScreen="combat";render();setTimeout(()=>runBattles(count),60);
}

render();