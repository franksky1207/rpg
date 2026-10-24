import {artSamplesV2 as artSamples} from './monster-art-samples-v2.mjs';
import {MonsterActor} from './monster-actor.mjs?v=20261024-identity-v1';
import {createMonsterPool} from './monster-sprite-pool.mjs?v=20261024-repair2';
const pool=createMonsterPool({usage:'formal'}),snapshots=[];
window.reviewReady=false;
try{
 for(const s of artSamples){
  const article=document.createElement('article'),title=document.createElement('h2'),id=document.createElement('p'),note=document.createElement('p'),columns=document.createElement('div');
  title.textContent=s.category+' · '+s.name;id.className='identity';id.textContent=s.id+' / '+s.assetId;note.textContent=s.note;columns.className='columns';article.append(title,id,note,columns);document.querySelector('#samples').append(article);
  for(const [label,options] of [['A · 原始原型',{}],['B · 第一輪固定版',{identity:s.id,appearanceRoute:'art-samples-12'}],['C · 第二輪優化',{identity:s.id,appearanceRoute:'art-samples-12-v2'}]]){
   const actor=await new MonsterActor(pool,s.assetId,{...options,usage:'formal'}).init();
   // A uses exactly the same placement/animation, without identity palette.
   actor.draw({palette:'original'});const canvas=document.createElement('canvas');canvas.width=canvas.height=256;canvas.getContext('2d').drawImage(actor.canvas,0,0);snapshots.push({canvas,s,options});actor.dispose();const f=document.createElement('figure'),caption=document.createElement('figcaption');caption.textContent=label;f.append(canvas,caption);columns.append(f);
  }
 }
 document.querySelector('#status').textContent='12 / 12 已載入 · A 原型／B 第一輪固定版／C 第二輪 · 僅供樣本驗收 · 尚待人工確認';window.reviewReady=true;
}catch(e){document.querySelector('#status').textContent='載入失敗：'+e.message;throw e;}
let rendering=false;
async function renderSnapshots(){
 if(rendering)return;rendering=true;window.reviewReady=false;
 const clip=document.querySelector('#clip').value,bodyOnly=document.querySelector('#bodyOnly').checked;
 document.querySelector('#clip').disabled=document.querySelector('#bodyOnly').disabled=true;
 try{for(const {canvas,s,options} of snapshots){const a=await new MonsterActor(pool,s.assetId,{...options,appearanceBodyOnly:bodyOnly,usage:'formal'}).init();try{a.draw({clip,elapsedMs:clip==='idle'?0:336,palette:'original'});const c=canvas.getContext('2d');c.clearRect(0,0,256,256);c.drawImage(a.canvas,0,0);}finally{a.dispose();}}}
 catch(e){document.querySelector('#status').textContent='載入失敗：'+e.message;throw e;}
 finally{document.querySelector('#clip').disabled=document.querySelector('#bodyOnly').disabled=false;rendering=false;window.reviewReady=true;}
}
document.querySelector('#clip').onchange=renderSnapshots;
document.querySelector('#bodyOnly').onchange=renderSnapshots;
document.querySelector('#background').onchange=e=>document.body.className=e.target.value;
document.querySelector('#zoom').onclick=()=>document.querySelector('main').classList.toggle('zoom');
window.addEventListener('pagehide',()=>{snapshots.forEach(s=>s.canvas.width=s.canvas.height=1);pool.dispose();},{once:true});
