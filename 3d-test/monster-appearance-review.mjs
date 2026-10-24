import {mappings,registry} from './monster-sprites.mjs?v=20261024-au-ten-stages1';
import {MonsterActor} from './monster-actor.mjs?v=20261024-identity-v1';
import {createMonsterPool} from './monster-sprite-pool.mjs?v=20261024-repair2';
const pool=createMonsterPool({usage:'formal'}),all=Object.values(mappings),$=s=>document.querySelector(s);
const modes={prototype:'同原型跨進度／跨模式',alternate:'異宇宙20×10完整版本',galaxy:'銀河同圖／相鄰身份',universe:'宇宙100王',calamity:'兩類文明災厄',higher:'高維十王及投影',special:'九個特殊身份',dungeon:'懸賞／競技／虛空',mirror:'鏡像玩家外觀對照'};
for(const [v,t] of Object.entries(modes))$('#group').add(new Option(t,v));
for(const a of registry.assets)$('#asset').add(new Option(a.name+' · '+a.assetId,a.assetId));
let index=0,rows=[],generation=0,focusController;
async function cell(row,parent,signal){
 const f=document.createElement('figure'),label=document.createElement('figcaption');parent.append(f);
 const actor=await new MonsterActor(pool,row.assetId,{identity:row.id,tier:'medium',usage:'formal',signal}).init();
 try{actor.draw();const c=document.createElement('canvas');c.width=c.height=256;c.getContext('2d').drawImage(actor.canvas,0,0);c.dataset.appearance=actor.canvas.dataset.appearance;f.append(c,label);label.textContent=row.name+' · '+row.id;}
 finally{actor.dispose();}
}
async function focus(){
 focusController?.abort();focusController=new AbortController();const own=focusController,g=++generation;
 $('#focus').replaceChildren();if(!rows.length)return;index=(index+rows.length)%rows.length;
 try{await cell(rows[index],$('#focus'),own.signal);if(g===generation)$('#status').textContent=`${index+1} / ${rows.length}`;}
 catch(error){if(!own.signal.aborted)$('#status').textContent='載入失敗，請重新選擇比較組。';}
}
async function render(){
 window.reviewReady=false;$('#group').disabled=$('#asset').disabled=$('#prev').disabled=$('#next').disabled=true;
 const mode=$('#group').value,asset=$('#asset').value;
 rows=all.filter(r=>mode==='prototype'?r.assetId===asset:mode==='alternate'?r.assetId===asset&&r.mode==='alternate'&&r.stageIndex===0:mode==='galaxy'?r.id.startsWith('galaxy-map'):mode==='universe'?r.id.startsWith('universe-boss'):mode==='calamity'?r.mode==='calamity':mode==='higher'?r.world==='higher':mode==='special'?r.kind==='special':['bounty','arena','void'].includes(r.mode));
 const gallery=$('#gallery');gallery.replaceChildren();index=0;
 if(mode==='mirror'){
  const [{WholeSuitActor},{createSpritePool},{release},{applyMirrorAppearance}]=await Promise.all([import('./equipment-sprites-v1/actor.mjs?v=20261021-batch16-dungeons1'),import('./equipment-sprites-v1/assets.mjs?v=20261019-batch12-rising-cut1'),import('./era-player-sprites.mjs?v=20261019-batch12-rising-cut1'),import('./monster-appearance.mjs?v=20261024-identity-v1')]);
  const players=createSpritePool({limit:4*1024*1024});$('#focus').replaceChildren();
  for(const entry of release.entries)for(const mirrored of [false,true]){
   const actor=await new WholeSuitActor(players,entry,{tier:'medium'}).init();actor.mirrored=mirrored;actor.draw({clip:'idle',elapsedMs:0});
   const f=document.createElement('figure'),c=document.createElement('canvas'),caption=document.createElement('figcaption');c.width=c.height=256;c.getContext('2d').drawImage(actor.canvas,0,0);if(mirrored)applyMirrorAppearance(c);caption.textContent=entry.id+(mirrored?' · 鏡面投影':' · 玩家來源');f.append(c,caption);gallery.append(f);actor.dispose();
  }players.dispose();$('#status').textContent='沿用正式玩家來源；冷色邊緣與碎鏡切角，裝備像素不改';$('#group').disabled=false;window.reviewReady=true;return;
 }
 await focus();
 // Sequential acquire/release respects the existing two-prototype decode budget.
 for(const r of rows)await cell(r,gallery);
 if(mode==='higher'){const p=document.createElement('p');p.textContent='正式競技投影沿用上列各王完全相同的外觀；此頁未建立額外投影配色。';gallery.append(p);}
 $('#group').disabled=$('#prev').disabled=$('#next').disabled=false;$('#asset').disabled=mode!=='prototype'&&mode!=='alternate';window.reviewReady=true;
}
$('#prev').onclick=()=>{index--;void focus();};$('#next').onclick=()=>{index++;void focus();};
for(const s of ['#group','#asset'])$(s).onchange=()=>void render();
await render();
