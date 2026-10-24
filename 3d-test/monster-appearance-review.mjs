import {mappings,registry} from './monster-sprites.mjs?v=20261024-au-ten-stages1';
import {MonsterActor} from './monster-actor.mjs?v=20261024-identity-v1';
import {createMonsterPool} from './monster-sprite-pool.mjs?v=20261024-repair2';
const pool=createMonsterPool({usage:'formal'}),all=Object.values(mappings),$=s=>document.querySelector(s);
const modes={prototype:'同原型跨進度／跨模式',alternate:'異宇宙20×10完整版本',galaxy:'銀河同圖／相鄰身份',universe:'宇宙100王',calamity:'兩類文明災厄',higher:'高維十王及投影',special:'九個特殊身份',dungeon:'懸賞／競技／虛空',mirror:'鏡像玩家外觀對照'};
for(const [v,t] of Object.entries(modes))$('#group').add(new Option(t,v));
for(const a of registry.assets)$('#asset').add(new Option(a.name+' · '+a.assetId,a.assetId));
let index=0,rows=[],generation=0,focusController,offset=0;
const PAGE_SIZE=40;
function clearSnapshots(parent){for(const c of parent.querySelectorAll('canvas'))c.width=c.height=1;parent.replaceChildren();}
async function cell(row,parent,signal){
 const f=document.createElement('figure'),label=document.createElement('figcaption');parent.append(f);
 const actor=await new MonsterActor(pool,row.assetId,{identity:row.id,tier:'medium',usage:'formal',signal}).init();
 try{actor.draw();const c=document.createElement('canvas');c.width=c.height=256;c.getContext('2d').drawImage(actor.canvas,0,0);c.dataset.appearance=actor.canvas.dataset.appearance;f.append(c,label);label.textContent=row.name+' · '+row.id;}
 finally{actor.dispose();}
}
async function focus(){
 focusController?.abort();focusController=new AbortController();const own=focusController,g=++generation;
 clearSnapshots($('#focus'));if(!rows.length)return;index=(index+rows.length)%rows.length;
 try{await cell(rows[index],$('#focus'),own.signal);if(g===generation)$('#status').textContent=`${index+1} / ${rows.length}`;}
 catch(error){if(!own.signal.aborted)$('#status').textContent='載入失敗，請重新選擇比較組。';}
}
function controls(busy){
 const mode=$('#group').value;
 $('#group').disabled=busy;$('#asset').disabled=busy||!['prototype','alternate'].includes(mode);
 $('#prev').disabled=$('#next').disabled=busy||mode==='mirror'||!rows.length;
 $('#previousPage').disabled=busy||mode==='mirror'||offset===0;
 $('#nextPage').disabled=busy||mode==='mirror'||offset+PAGE_SIZE>=rows.length;
}
async function showPage(){
 const gallery=$('#gallery');clearSnapshots(gallery);
 // At most 40 retained 256px snapshots (~10MiB); never 500 phone canvases at once.
 for(const row of rows.slice(offset,offset+PAGE_SIZE))await cell(row,gallery);
 $('#pageRange').textContent=rows.length?`${offset+1}–${Math.min(offset+PAGE_SIZE,rows.length)} / ${rows.length}`:'沒有此原型的版本';
 if($('#group').value==='higher'){const p=document.createElement('p');p.textContent='正式競技投影沿用上列各王完全相同的外觀；此頁未建立額外投影配色。';gallery.append(p);}
}
async function run(task){
 window.reviewReady=false;controls(true);
 try{await task();}catch(error){$('#status').textContent='載入失敗，請重新選擇比較組。';}
 finally{controls(false);window.reviewReady=true;}
}
async function render(){
 const mode=$('#group').value,asset=$('#asset').value;
 rows=all.filter(r=>mode==='prototype'?r.assetId===asset:mode==='alternate'?r.assetId===asset&&r.mode==='alternate'&&r.stageIndex===0:mode==='galaxy'?r.id.startsWith('galaxy-map'):mode==='universe'?r.id.startsWith('universe-boss'):mode==='calamity'?r.mode==='calamity':mode==='higher'?r.world==='higher':mode==='special'?r.kind==='special':['bounty','arena','void'].includes(r.mode));
 const gallery=$('#gallery');clearSnapshots(gallery);index=offset=0;$('#pageRange').textContent='';
 if(mode==='mirror'){
  const [{WholeSuitActor},{createSpritePool},{release},{applyMirrorAppearance}]=await Promise.all([import('./equipment-sprites-v1/actor.mjs?v=20261021-batch16-dungeons1'),import('./equipment-sprites-v1/assets.mjs?v=20261019-batch12-rising-cut1'),import('./era-player-sprites.mjs?v=20261019-batch12-rising-cut1'),import('./monster-appearance.mjs?v=20261024-identity-v1')]);
  const players=createSpritePool({limit:4*1024*1024});clearSnapshots($('#focus'));
  for(const entry of release.entries)for(const mirrored of [false,true]){
   const actor=await new WholeSuitActor(players,entry,{tier:'medium'}).init();actor.mirrored=mirrored;actor.draw({clip:'idle',elapsedMs:0});
   const f=document.createElement('figure'),c=document.createElement('canvas'),caption=document.createElement('figcaption');c.width=c.height=256;c.getContext('2d').drawImage(actor.canvas,0,0);if(mirrored)applyMirrorAppearance(c);caption.textContent=entry.id+(mirrored?' · 鏡面投影':' · 玩家來源');f.append(c,caption);gallery.append(f);actor.dispose();
  }players.dispose();$('#status').textContent='沿用正式玩家來源；冷色邊緣與背景碎鏡光紋，裝備像素不改';return;
 }
 await focus();
 await showPage();
}
async function step(delta){index+=delta;await focus();const page=Math.floor(index/PAGE_SIZE)*PAGE_SIZE;if(page!==offset){offset=page;await showPage();}}
$('#prev').onclick=()=>void run(()=>step(-1));$('#next').onclick=()=>void run(()=>step(1));
$('#previousPage').onclick=()=>void run(async()=>{offset-=PAGE_SIZE;index=offset;await focus();await showPage();});
$('#nextPage').onclick=()=>void run(async()=>{offset+=PAGE_SIZE;index=offset;await focus();await showPage();});
for(const s of ['#group','#asset'])$(s).onchange=()=>void run(render);
await run(render);
