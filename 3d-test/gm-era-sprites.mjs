// Isolated GM inspection. Shares the formal Actor/Pool, never reads or writes player state.
import {WholeSuitActor} from './equipment-sprites-v1/actor.mjs?v=20261018-lightweight1';
import {createSpritePool} from './equipment-sprites-v1/assets.mjs?v=20261018-lightweight1';
import {release} from './era-player-sprites.mjs?v=20261018-lightweight1';
import {animationController} from './equipment-sprites-v1/animation.mjs?v=20261018-lightweight1';
export async function mount({host,signal,quality='medium'}={}){
 const own=new AbortController(),pool=createSpritePool({limit:4*1024*1024}),animation=animationController(),pending=new Map();
 let closed=false,authorized=false,actor=null,loading=null,serial=0,raf=0,lastAuth=-Infinity,authPending=false,lastStats=0;
 host.innerHTML='<section class="gm-suit"><p>三紀元完整角色 · 隔離預覽，不修改角色、裝備或存檔。</p><label>紀元 <select data-era><option value="era-galaxy">銀河</option><option value="era-universe">宇宙</option><option value="era-higher">高維</option></select></label> <label>方向 <select data-direction><option value="1">右向</option><option value="-1">左向</option></select></label> <label>縮放 <select data-scale><option value="1">100%</option><option value="0.8">80%</option><option value="1.2">120%</option></select></label> <label>顯示範圍 <select data-viewport><option value="desktop">桌機</option><option value="mobile">手機</option></select></label><div class="gm-suit-preview" style="height:240px;overflow:hidden;margin-inline:auto;max-width:100%"><span data-placeholder>確認 GM 權限中</span></div><p class="gm-suit-status" role="status" data-status></p><div class="gm-suit-actions"></div><button type="button" data-missing>測試缺圖回退</button> <button type="button" data-reload>重新載入</button><pre data-diagnostics style="white-space:pre-wrap"></pre></section>';
 const ui=host.firstElementChild,$=s=>ui.querySelector(s),preview=$('.gm-suit-preview'),placeholder=$('[data-placeholder]'),status=$('[data-status]'),era=$('[data-era]');
 const controls=[...ui.querySelectorAll('select,button')];
 const setEnabled=ok=>ui.querySelectorAll('select,button').forEach(b=>b.disabled=!ok);
 function clear(){serial++;loading?.abort();loading=null;actor?.canvas.remove();actor?.dispose();actor=null;animation.cancel();placeholder.hidden=false;}
 function diagnostics(){const s=pool.stats();$('[data-diagnostics]').textContent=JSON.stringify({...s,canvases:actor?1:0,rafs:raf?1:0,canCommit:false},null,2);}
 function transform(){if(actor)actor.canvas.style.transform=`scale(${$('[data-direction]').value*Number($('[data-scale]').value)},${$('[data-scale]').value})`;preview.style.width=$('[data-viewport]').value==='mobile'?'240px':'100%';}
 function request(){return new Promise((resolve,reject)=>{
  if(closed||window.parent===window||new URLSearchParams(location.search).get('embedded')!=='1'){reject(Error('unauthorized'));return;}
  const requestId=crypto.randomUUID(),timer=setTimeout(()=>{pending.delete(requestId);reject(Error('authorization-timeout'));},5000);
  pending.set(requestId,{resolve,reject,timer});window.parent.postMessage({type:'civilization3d:sprite-auth',requestId},location.origin);
 });}
 window.addEventListener('message',event=>{if(event.source!==window.parent||event.origin!==location.origin||event.data?.type!=='civilization3d:sprite-auth-response')return;const p=pending.get(event.data.requestId);if(!p)return;clearTimeout(p.timer);pending.delete(event.data.requestId);p.resolve(event.data.authorized===true);},{signal:own.signal});
 async function authorize(){if(closed||authPending)return authorized;authPending=true;try{authorized=await request();}catch{authorized=false;}finally{authPending=false;lastAuth=performance.now();}
  if(closed)return false;setEnabled(authorized);if(!authorized){clear();pool.clear();status.textContent='需要 GM 授權，請返回遊戲重新開啟。';diagnostics();}return authorized;
 }
 async function show(missing=false){
  clear();const ticket=serial;if(!authorized||closed)return;
  status.textContent='角色載入中…';const row=release.entries.find(e=>e.id===era.value);loading=new AbortController();
  // Fail the real integrity-checked pool path without touching the release catalog.
  const entry=missing?{...row,asset:{...row.asset,sha256:'0'.repeat(64)}}:row;
  try{const next=await new WholeSuitActor(pool,entry,{tier:quality,signal:loading.signal}).init();
   if(closed||!authorized||ticket!==serial){next.dispose();return;}
   actor=next;actor.canvas.dataset.suit=row.id;actor.canvas.style.cssText='height:180px;width:180px;max-width:100%;object-fit:contain';preview.append(actor.canvas);placeholder.hidden=true;transform();animation.play('idle',performance.now());status.textContent='已載入，可檢查六種動作。';
  }catch{if(!closed&&ticket===serial){status.textContent='缺圖或驗證失敗：已安全回退文字，未修改正式資料。';placeholder.textContent='角色暫時無法顯示';}}
  diagnostics();
 }
 for(const [clip,label] of [['idle','待機'],['attack','攻擊'],['hit','受擊'],['dodge','閃避'],['return','回位'],['defeat','死亡']]){const b=document.createElement('button');b.type='button';b.dataset.action=clip;b.textContent=label;b.addEventListener('click',()=>{if(authorized&&actor)animation.play(clip,performance.now());},{signal:own.signal});$('.gm-suit-actions').append(b);}
 era.addEventListener('change',()=>show(),{signal:own.signal});for(const key of ['direction','scale','viewport'])$(`[data-${key}]`).addEventListener('change',transform,{signal:own.signal});
 $('[data-missing]').addEventListener('click',()=>show(true),{signal:own.signal});$('[data-reload]').addEventListener('click',async()=>{if(await authorize())show();},{signal:own.signal});
 function tick(now){raf=0;if(closed||document.hidden)return;if(now-lastAuth>2000)void authorize();if(actor&&authorized){const s=animation.sample(now);actor.canvas.dataset.clip=s.clip;actor.draw({clip:s.clip,elapsedMs:s.elapsedMs,rootMotion:true});}raf=requestAnimationFrame(tick);if(now-lastStats>250){lastStats=now;diagnostics();}}
 const start=()=>{if(!closed&&!document.hidden&&!raf)raf=requestAnimationFrame(tick);};
 const dispose=()=>{if(closed)return;closed=true;cancelAnimationFrame(raf);raf=0;clear();animation.dispose();pool.dispose();own.abort();for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('disposed'));}pending.clear();signal?.removeEventListener('abort',dispose);ui.remove();};
 signal?.addEventListener('abort',dispose,{once:true});if(signal?.aborted){dispose();return {dispose};}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;animation.cancel();}else{void authorize();start();}},{signal:own.signal});
 setEnabled(false);if(await authorize())await show();start();
 return {dispose,resize:transform,stats:()=>pool.stats()};
}
