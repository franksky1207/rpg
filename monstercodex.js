(function(){
 'use strict';
 const knownRoots=new WeakMap();
 const style=document.createElement('style');style.textContent=`
 .codex-group{margin:8px 0;min-width:0}
 .codex-group>summary{padding:10px 4px;cursor:pointer;overflow-wrap:anywhere}
 .codex-branch{margin-left:14px;padding-left:0;border-left:1px solid #ffffff18;min-width:0}
 .codex-list{list-style:none;padding:0 8px;margin:0;min-width:0}
 .codex-list>li{padding:8px 0;border-bottom:1px solid #ffffff18;display:flex;gap:8px;align-items:center;justify-content:space-between}
 .codex-list>li>div{min-width:0;overflow-wrap:anywhere}
 .codex-list .btn{flex-shrink:0}
 @media(max-width:420px){.codex-branch{margin-left:12px}.codex-list{padding:0 4px}}
 `;document.head.appendChild(style);
 const rows=window.MONSTER_CODEX_CATALOGUE,byId=new Map(rows.map(r=>[r.id,r]));
 const owners={main:['combatcore.js','secondworldcombat.js','thirdworldcombat.js'],calamity:['calamitycore.js','secondworldcalamityrun.js'],special:['specialcore.js'],bounty:['dungeoncore.js'],arena:['dungeonarena.js','thirdworldarena.js'],void:['dungeonvoid.js'],alternate:['alternateuniversecombat.js']};
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const categoryNames=['主線','特殊遭遇','副本','文明災厄','異宇宙'];
 let category=categoryNames[0],selected=null,tab='story',detailWorld=1,returnScroll=0;
 const opened=new Set(),displayRows=rows.filter(r=>r.mode!=='alternate'||r.stageIndex===0);
 const universeMembers=new Map();
 for(const r of rows)if(r.mode==='alternate'){const members=universeMembers.get(r.universeNumber)||[];members.push(r.id);universeMembers.set(r.universeNumber,members);}
 const categoryOf=r=>({main:'主線',special:'特殊遭遇',bounty:'副本',arena:'副本',void:'副本',calamity:'文明災厄',alternate:'異宇宙'})[r.mode];
 const unlocked=(r,known)=>r.mode==='alternate'?(universeMembers.get(r.universeNumber)||[]).some(id=>known.has(id)):known.has(r.id);
 const displayRow=id=>{const r=byId.get(id);return r?.mode==='alternate'?byId.get((universeMembers.get(r.universeNumber)||[])[0]):r;};
 const epochNames={galaxy:'銀河紀元',universe:'宇宙紀元',higher:'高維紀元',both:'跨紀元'};
 const kindName=r=>({normal:'普通怪',elite:'菁英怪',boss:'Boss',special:'特殊怪','alternate-universe-boss':'異宇宙王','civilization-calamity':'文明災厄','dungeon-bounty':'懸賞目標','dungeon-arena':'競技場對手','dungeon-arena-third-world':'高維投影','dungeon-void-mirage':'虛空怪物'})[r.kind]||'怪物';
 function nameOf(r,world=1){return r.mode==='alternate'?r.universeName:r.mode==='special'&&world===2?(window.getSpecialMonsterById?.(r.specialId,2)?.name||r.name):r.name;}
 function locationOf(r,world=1){
  if(r.mode==='alternate')return r.universeName;
  if(r.mode==='main'&&r.world==='galaxy'){const index=(r.region-1)*10+r.mapIndex-1;return [WORLD_REGIONS.find(x=>index>=x.mapStart&&index<=x.mapEnd)?.name,MAPS[index]?.name].filter(Boolean).join('・');}
  if(r.mode==='main'&&r.world==='universe')return window.SECOND_WORLD_REGIONS?.find(x=>Number(r.id.slice(-3))-1>=x.firstBossIndex&&Number(r.id.slice(-3))-1<=x.lastBossIndex)?.name||'宇宙紀元';
  return r.mode==='special'?epochNames[world===2?'universe':'galaxy']+'・特殊遭遇':(epochNames[r.world]+'・'+({main:'高維十王',bounty:'懸賞',arena:'競技場',void:'虛空幻境',calamity:'文明災厄'})[r.mode]);
 }
 window.monsterCodexDisplayProgress=function(){const known=new Set(state.monsterCodex?.encountered||[]);return {encountered:displayRows.filter(r=>unlocked(r,known)).length,total:displayRows.length,identities:rows.length};};
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
 window.selectMonsterCodexCategory=function(value){if(!categoryNames.includes(value))return false;category=value;selected=null;render();};
 window.monsterCodexPage=function(){selected=null;render();};
 window.toggleMonsterCodexGroup=function(key,value){if(value)opened.add(key);else opened.delete(key);};
 window.openMonsterCodexDetail=function(id,world=1){const r=displayRow(id),known=new Set(state.monsterCodex?.encountered||[]);if(!r||!unlocked(r,known))return false;returnScroll=window.scrollY;selected=r.id;detailWorld=Number(world)===2?2:1;render();window.scrollTo(0,0);return true;};
 window.closeMonsterCodexDetail=function(){selected=null;render();requestAnimationFrame(()=>window.scrollTo(0,returnScroll));};
 function listHtml(list,known,world=1){return list.map(r=>`<li><div><b>${esc(nameOf(r,world))}</b><div class="muted">${esc(kindName(r))}・${unlocked(r,known)?'已遭遇':'未遭遇'}</div></div>${unlocked(r,known)?`<button class="btn" onclick="openMonsterCodexDetail('${r.id}',${world})">查看</button>`:''}</li>`).join('');}
 function group(key,label,body){return `<details data-codex-group="${esc(key)}" ${opened.has(key)?'open':''} ontoggle="toggleMonsterCodexGroup('${key}',this.open)" class="codex-group"><summary>${esc(label)}</summary><div class="codex-branch">${body}</div></details>`;}
 function groupsHtml(known){
  const members=displayRows.filter(r=>categoryOf(r)===category),list=(items,w=1)=>`<ul class="codex-list">${listHtml(items,known,w)}</ul>`;
  if(category==='主線')return group('main-g','銀河紀元',WORLD_REGIONS.map(region=>group('g-'+region.id,region.name,MAPS.slice(region.mapStart,region.mapEnd+1).map((map,i)=>{const index=region.mapStart+i;return group('map-'+index,map.name,list(members.filter(r=>r.world==='galaxy'&&(r.region-1)*10+r.mapIndex-1===index)));}).join(''))).join(''))+group('main-u','宇宙紀元',(window.SECOND_WORLD_REGIONS||[]).map(region=>group('u-'+region.id,region.name,list(members.filter(r=>r.world==='universe'&&Number(r.id.slice(-3))-1>=region.firstBossIndex&&Number(r.id.slice(-3))-1<=region.lastBossIndex),2))).join(''))+group('main-h','高維紀元・高維十王',list(members.filter(r=>r.world==='higher')));
  if(category==='特殊遭遇')return [1,2].map(w=>group('special-'+w,(w===1?'銀河':'宇宙')+'特殊怪',list(members.filter(r=>r.world==='both'||r.world===(w===1?'galaxy':'universe')),w))).join('');
  if(category==='副本')return ['bounty','arena','void'].map(mode=>group('dungeon-'+mode,{bounty:'懸賞',arena:'競技場',void:'虛空幻境'}[mode],mode==='void'?list(members.filter(r=>r.mode===mode)):['galaxy','universe',...(mode==='arena'?['higher']:[])].map(world=>group(mode+'-'+world,epochNames[world],list(members.filter(r=>r.mode===mode&&r.world===world),world==='universe'?2:1))).join(''))).join('');
  if(category==='文明災厄')return ['galaxy','universe'].map(world=>group('calamity-'+world,(world==='galaxy'?'銀河':'宇宙')+'文明災厄',list(members.filter(r=>r.world===world),world==='universe'?2:1))).join('');
  return Array.from({length:Math.ceil(members.length/20)},(_,i)=>group('alternate-'+i,`第 ${i+1} 群・宇宙 ${i*20+1}～${Math.min((i+1)*20,members.length)}`,list(members.filter(r=>r.universeNumber>=i*20+1&&r.universeNumber<=(i+1)*20)))).join('');
 }
 window.monsterCodexPageHtml=function(){
  const known=new Set(state.monsterCodex?.encountered||[]),progress=window.monsterCodexDisplayProgress(),r=byId.get(selected);
  const header=`<section class="function-page"><div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div><div class="card"><h2>戰線紀錄</h2>${window.frontlineRecordTabsHtml()}<p>怪物圖鑑・已遭遇 ${progress.encountered} / ${progress.total}。正式遇敵即永久解鎖，無須勝利。</p><label>分類 <select onchange="selectMonsterCodexCategory(this.value)">${categoryNames.map(c=>`<option ${c===category?'selected':''}>${esc(c)}</option>`).join('')}</select></label></div>`;
  if(r&&unlocked(r,known))return header+`<article class="card"><button class="btn" onclick="closeMonsterCodexDetail()">← 返回清單</button><h3>${esc(nameOf(r,detailWorld))}</h3><p>${esc(locationOf(r,detailWorld))}・${esc(kindName(r))}・已遭遇</p><div style="width:100%;max-width:512px;aspect-ratio:1;margin:auto"><canvas id="monsterCodexImage" width="512" height="512" data-codex-id="${esc(r.id)}" style="width:100%;height:100%;display:block" aria-label="${esc(nameOf(r,detailWorld))}靜態圖片"></canvas><div id="monsterCodexImageStatus">圖片載入中…</div></div></article></section>`;
  return header+`<div class="card">${groupsHtml(known)}</div></section>`;
 };
 // One observed detail at a time. The existing SHA-verified bounded pool owns all decoding.
 let imageEpoch=0,imageController=null,imageCanvas=null;
 const observer=new MutationObserver(async()=>{
  const canvas=document.getElementById('monsterCodexImage');if(canvas!==imageCanvas){imageController?.abort();imageCanvas=canvas;imageController=new AbortController();}if(!canvas||canvas.dataset.loading)return;canvas.dataset.loading='1';const epoch=++imageEpoch,id=canvas.dataset.codexId;
  if(!unlocked(byId.get(id),new Set(state.monsterCodex?.encountered||[])))return;
  try{const {drawCodexMonster}=await import('./monstercodeximage.mjs?v=20261024-repair2');if(canvas.isConnected&&epoch===imageEpoch)await drawCodexMonster(canvas,byId.get(id),{signal:imageController.signal});}
  catch(_){if(canvas.isConnected)document.getElementById('monsterCodexImageStatus').textContent='圖片暫時無法載入，請重新開啟查看。';}
 });
 if(document.documentElement)observer.observe(document.documentElement,{childList:true,subtree:true});
})();
