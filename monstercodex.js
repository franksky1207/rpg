(function(){
 'use strict';
 const knownRoots=new WeakMap();
 const rows=window.MONSTER_CODEX_CATALOGUE,byId=new Map(rows.map(r=>[r.id,r]));
 const owners={main:['combatcore.js','secondworldcombat.js','thirdworldcombat.js'],calamity:['calamitycore.js','secondworldcalamityrun.js'],special:['specialcore.js'],bounty:['dungeoncore.js'],arena:['dungeonarena.js','thirdworldarena.js'],void:['dungeonvoid.js'],alternate:['alternateuniversecombat.js']};
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const categoryNames=[...new Set(rows.map(r=>r.category))];let category=categoryNames[0],page=0,selected=null,tab='story';
 // Conservative migration: no inferred historical unlocks. Unknown/malformed IDs are discarded.
 function normalize(target){
  if(!target||typeof target!=='object')return target;
  const raw=target.monsterCodex,ids=raw?.version===1&&Array.isArray(raw.encountered)?raw.encountered:[];
  target.monsterCodex={version:1,encountered:[...new Set(ids.filter(id=>typeof id==='string'&&byId.has(id)))].sort()};knownRoots.set(target.monsterCodex,new Set(target.monsterCodex.encountered));return target;
 }
 function resolve(c,e){
  if(!c||c.fixture===true||!owners[c.mode]?.includes(c.owner)||![1,2,3].includes(c.world)||!e)return null;
  const world={1:'galaxy',2:'universe',3:'higher'}[c.world],loc=String(c.location??'');let candidates;
  if(c.mode==='main'&&c.world===1){if(!/^(?:0|[1-9]\d*):[0-4]$/.test(loc))return null;const [m,s]=loc.split(':').map(Number);if(m>=100)return null;candidates=[byId.get('galaxy-map-'+String(m*5+s+1).padStart(3,'0'))];}
  else if(c.mode==='alternate'){if(!/^(?:[1-9]\d{0,2}|1000)$/.test(loc))return null;candidates=[byId.get('alternate-depth-'+loc.padStart(4,'0'))];}
  else candidates=rows.filter(r=>r.mode===c.mode&&(r.world===world||r.world==='both'));
  return candidates.find(r=>{
   if(!r||r.kind!==e.kind)return false;
   // Universe special names are official aliases, never fuzzy guesses.
   const universeNames={gold_slime:'星源聚合體',mimic:'虛空誘餌艙',reaper:'終焉協議體',lucky_rabbit:'星運增幅信標',ancient_guardian:'古域警戒機',relic_guardian:'星藏保全體',bandit_king:'暗域黑市王',collector:'星骸回收者',mysterious_traveler:'界域交易使'};
   if(e.name!==(c.mode==='special'&&c.world===2?universeNames[r.specialId]:r.name))return false;
   if(c.mode==='main'&&c.world===2)return e.id===r.id&&loc===String(Number(r.id.slice(-3))-1);
   if(c.mode==='main'&&c.world===3)return (e.id||e.bossId||e.higherDimensionalBossId)===r.id&&loc===String(r.bossIndex);
   if(c.mode==='calamity')return loc===r.bossId&&e.calamityId===r.bossId;
   if(c.mode==='special')return loc===r.specialId;
   if(c.mode==='arena')return c.world===3?['0','1','2'].includes(loc):loc===String(r.arenaStage);
   if(c.mode==='void'){const f=Number(loc);return Number.isSafeInteger(f)&&f>0&&r.isBossFloor===(f%10===0)&&(!r.isBossFloor||r.bossCycle===Math.floor(((f-1)%100)/10));}
   return true;
  })||null;
 }
 function encounter(c,e){
  const row=resolve(c,e);if(!row||typeof state==='undefined')return false;
  if(!state.monsterCodex||!knownRoots.has(state.monsterCodex))normalize(state);const known=knownRoots.get(state.monsterCodex);if(known.has(row.id))return false;known.add(row.id);state.monsterCodex.encountered.push(row.id);return true;
 }
 window.normalizeMonsterCodex=normalize;window.resolveMonsterCodexEncounter=resolve;window.recordMonsterCodexEncounter=encounter;
 if(typeof registerNewStateNormalizer==='function')registerNewStateNormalizer(normalize);
 window.frontlineRecordTabsHtml=()=>`<div class="story-record-tabs"><button class="btn" onclick="setFrontlineRecordTab('story')" aria-pressed="${tab==='story'}">劇情紀錄</button><button class="btn" onclick="setFrontlineRecordTab('codex')" aria-pressed="${tab==='codex'}">怪物圖鑑</button></div>`;
 window.setFrontlineRecordTab=function(value){tab=value==='codex'?'codex':'story';selected=null;render();};
 window.monsterCodexActive=()=>tab==='codex';
 window.selectMonsterCodexCategory=function(value){if(!categoryNames.includes(value))return false;category=value;page=0;selected=null;render();};
 window.monsterCodexPage=function(delta){page=Math.max(0,page+Number(delta||0));selected=null;render();};
 window.openMonsterCodexDetail=function(id){if(!byId.has(id)||!state.monsterCodex?.encountered?.includes(id))return false;selected=id;render();return true;};
 window.monsterCodexPageHtml=function(){
  const known=new Set(state.monsterCodex?.encountered||[]),list=rows.filter(r=>r.category===category);page=Math.min(page,Math.max(0,Math.ceil(list.length/20)-1));
  const r=byId.get(selected),detail=r&&known.has(r.id)?`<article class="card"><h3>${esc(r.name)}</h3><div>${esc(r.id)}</div><canvas id="monsterCodexImage" width="512" height="512" data-codex-id="${esc(r.id)}" style="width:100%;max-width:512px;height:auto" aria-label="${esc(r.name)}靜態圖片"></canvas><div id="monsterCodexImageStatus">圖片載入中…</div></article>`:'';
  return `<section class="function-page"><div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div><div class="card"><h2>戰線紀錄</h2>${window.frontlineRecordTabsHtml()}<p>怪物圖鑑・已遭遇 ${known.size} / ${rows.length}。正式遇敵即永久解鎖，無須勝利。</p><label>分類 <select onchange="selectMonsterCodexCategory(this.value)">${categoryNames.map(c=>`<option ${c===category?'selected':''}>${esc(c)}</option>`).join('')}</select></label></div>${detail}<div class="card">${list.slice(page*20,page*20+20).map(r=>`<article class="calamity-mark-card"><b>${esc(r.name)}</b><p>${esc(r.category)}｜${esc(r.world)}｜${esc(r.id)}</p><span>${known.has(r.id)?'已遭遇':'未遭遇・圖片未解鎖'}</span>${known.has(r.id)?` <button class="btn" onclick="openMonsterCodexDetail('${r.id}')">查看靜態圖片</button>`:''}</article>`).join('')}<button class="btn" onclick="monsterCodexPage(-1)" ${page===0?'disabled':''}>上一頁</button> ${page+1} / ${Math.ceil(list.length/20)} <button class="btn" onclick="monsterCodexPage(1)" ${(page+1)*20>=list.length?'disabled':''}>下一頁</button></div></section>`;
 };
 // One observed detail at a time. The existing SHA-verified bounded pool owns all decoding.
 let imageEpoch=0;
 const observer=new MutationObserver(async()=>{
  const canvas=document.getElementById('monsterCodexImage');if(!canvas||canvas.dataset.loading)return;canvas.dataset.loading='1';const epoch=++imageEpoch,id=canvas.dataset.codexId;
  if(!state.monsterCodex?.encountered?.includes(id))return;
  try{const {drawCodexMonster}=await import('./monstercodeximage.mjs?v=20261024-batch20');if(canvas.isConnected&&epoch===imageEpoch)await drawCodexMonster(canvas,byId.get(id));}
  catch(_){if(canvas.isConnected)document.getElementById('monsterCodexImageStatus').textContent='圖片暫時無法載入，請重新開啟查看。';}
 });
 if(document.documentElement)observer.observe(document.documentElement,{childList:true,subtree:true});
})();
