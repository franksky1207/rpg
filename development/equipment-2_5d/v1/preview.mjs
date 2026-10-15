import {createSpritePool} from './assets.mjs';
import {WholeSuitActor} from './actor.mjs';
import {animationController} from './animation.mjs';
const $=id=>document.getElementById(id),pool=createSpritePool(),animation=animationController();let actor=null,ticket=0,abort=null,raf=null,disposed=false;
const registry=await (await fetch('./registry.json',{cache:'no-store'})).json();
for(const e of registry.entries){const option=document.createElement('option');option.value=e.id;option.textContent=e.id.toUpperCase()+' · '+e.status;$('character').append(option);}
async function load(){const mine=++ticket;abort?.abort();actor?.dispose();actor=null;for(const name of ['mobile','desktop'])$(name).getContext('2d').clearRect(0,0,$(name).width,$(name).height);const entry=registry.entries.find(e=>e.id===$('character').value);$('status').textContent='驗證素材中…';abort=new AbortController();
 try{const next=await new WholeSuitActor(pool,entry,{tier:'high',signal:abort.signal}).init();if(disposed||mine!==ticket){next.dispose();return;}actor=next;$('status').textContent=entry.id+' 素材完成；GM未測／正式發布false';animation.play('idle',performance.now());}
 catch(error){if(!disposed&&mine===ticket)$('status').textContent=entry.id+' 尚無可用素材／安全回退：'+error.message;}
}
function frame(now){if(disposed)return;try{if(actor){const sample=animation.sample(now),image=actor.draw({clip:sample.clip,ms:sample.clip==='idle'?now:Math.min(700,now-start),rootMotion:true});for(const name of ['mobile','desktop']){const canvas=$(name),c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.drawImage(image,0,0,canvas.width,canvas.height);}}$('stats').textContent=JSON.stringify(pool.stats());}catch(e){$('status').textContent=e.message;}raf=requestAnimationFrame(frame);}
let start=performance.now();$('character').onchange=load;$('play').onclick=()=>{start=performance.now();animation.play($('clip').value,start);};$('cancel').onclick=()=>{animation.cancel();start=performance.now();};$('release').onclick=()=>{ticket++;abort?.abort();actor?.dispose();actor=null;pool.clear();for(const name of ['mobile','desktop'])$(name).getContext('2d').clearRect(0,0,$(name).width,$(name).height);$('status').textContent='素材已釋放，可重新選擇套裝';};
window.addEventListener('pagehide',()=>{disposed=true;ticket++;abort?.abort();actor?.dispose();animation.dispose();pool.dispose();cancelAnimationFrame(raf);},{once:true});
await load();raf=requestAnimationFrame(frame);
