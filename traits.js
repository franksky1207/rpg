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

function traitCountForKind(kind){
 const r=Math.random()*100;
 if(kind==="boss")return r<15?0:r<70?1:2;
 if(kind==="elite")return r<35?0:r<85?1:2;
 return r<70?0:r<95?1:2;
}
function rollMonsterTraits(kind){
 const count=traitCountForKind(kind),pool=MONSTER_TRAIT_IDS.slice(),out=[];
 for(let i=0;i<count&&pool.length;i++)out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
 return out;
}
function applyMonsterTraits(enemy,traitIds=[]){
 const e={
  ...enemy,
  traits:traitIds.slice(),
  crit:round1(Math.max(0,Number(enemy?.crit)||0)),
  dodge:round1(Math.max(0,Number(enemy?.dodge)||0)),
  berserk:!!enemy?.berserk
 };
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
 const base=baseMonsterObj(mapIdx,eIdx);
 return applyMonsterTraits(base,rollMonsterTraits(base.kind));
}
function previewKey(mapIdx,eIdx){return `${mapIdx}:${eIdx}`}
function getPreviewEncounter(mapIdx,eIdx){
 const k=previewKey(mapIdx,eIdx);
 if(!monsterPreviewCache[k])monsterPreviewCache[k]=createMonsterEncounter(mapIdx,eIdx);
 return monsterPreviewCache[k];
}
function clearPreviewEncounter(mapIdx,eIdx){delete monsterPreviewCache[previewKey(mapIdx,eIdx)]}
function resetMonsterPreviewCache(){monsterPreviewCache={};currentCombatEncounter=null;}
function traitDetailsHtml(traits){
 if(!traits?.length)return "";
 return `<div class="trait-details">${traits.map(id=>{const t=MONSTER_TRAITS[id];return t?`<div class="trait-detail-row"><span class="trait-detail-name" style="border-color:${t.border};color:${t.color}">${t.name}</span><span class="trait-detail-desc">${t.desc}</span></div>`:"";}).join("")}</div>`;
}
function combatTraitBadgesHtml(traits){
 if(!traits?.length)return "";
 const badges=traits.map(id=>{const t=MONSTER_TRAITS[id];return t?`<span class="trait-detail-name" style="border-color:${t.border};color:${t.color};font-size:inherit;font-weight:700;padding:3px 10px;line-height:1.25">${t.name}</span>`:"";}).filter(Boolean).join("");
 return badges?`<div class="combat-trait-badges" style="display:flex;align-self:stretch;width:100%;justify-content:flex-start;align-items:center;gap:8px;flex-wrap:wrap;margin:8px 0 12px;text-align:left;font-size:1.5em;font-weight:700">${badges}</div>`:"";
}

window.applyMonsterTraits=applyMonsterTraits;
window.combatTraitBadgesHtml=combatTraitBadgesHtml;
window.monsterObj=function(mapIdx,eIdx){return getPreviewEncounter(mapIdx,eIdx)};
window.resetMonsterPreviewCache=resetMonsterPreviewCache;

render();