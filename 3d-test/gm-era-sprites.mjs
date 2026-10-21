import {registry,identitiesForAsset,findMapping} from './monster-sprites.mjs?v=20261020-twenty-gm1';
import {MonsterActor,visualPlacement} from './monster-actor.mjs?v=20261020-twenty-gm1';
import {monsterVisibleSize} from './monster-visible-size.mjs?v=20261021-gm-formal-size1';
import {createMonsterPool} from './monster-sprite-pool.mjs?v=20261020-twenty-gm1';
// Isolated GM inspection. Shares the formal Actor/Pool, never reads or writes player state.
import {WholeSuitActor} from './equipment-sprites-v1/actor.mjs?v=20261019-batch12-rising-cut1';
import {createSpritePool} from './equipment-sprites-v1/assets.mjs?v=20261019-batch12-rising-cut1';
import {release} from './era-player-sprites.mjs?v=20261019-batch12-rising-cut1';
import {animationController} from './equipment-sprites-v1/animation.mjs?v=20261019-batch12-rising-cut1';
export async function mount({host,signal,quality='medium'}={}){
 const own=new AbortController(),pool=createSpritePool({limit:4*1024*1024}),animation=animationController(),pending=new Map();
 const monsterPool=createMonsterPool(),monsterAnimation=animationController();
 let monster=null,monsterLoading=null,monsterSerial=0,monsterClip='idle',lastFrame=-1;
 let visualNow=0,lastTick=null,lastClip="idle";
 let closed=false,authorized=false,actor=null,loading=null,serial=0,raf=0,lastAuth=-Infinity,authPending=false,lastStats=0;
 host.innerHTML='<section class="gm-suit"><p>三紀元完整角色 · 隔離預覽，不修改角色、裝備或存檔。</p><label>怪物原型 <select data-monster><option value="">關閉（角色測試）</option></select></label> <label>使用此原型的怪物 <select data-monster-identity><option value="">選擇怪物身份</option></select></label> <label>紀元 <select data-era><option value="era-galaxy">銀河</option><option value="era-universe">宇宙</option><option value="era-higher">高維</option></select></label><label>速度 <select data-speed><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option></select></label> <button type="button" data-replay>重播動作</button><p>正式攻擊：短距離上挑斬。沿用原身體、獨立武器與肘甲遮擋；蓄力、上挑、命中停頓、收回。</p><p data-monster-description role="status">選擇原型後，再選擇怪物身份，檢視其正式顏色、大小與動作。</p><div class="gm-suit-preview" style="position:relative;height:240px;overflow:hidden;margin-inline:auto;max-width:100%"><span data-target role="img" aria-label="攻擊距離參考目標" style="position:absolute;top:96px;width:24px;height:40px;border:2px solid #9cb8cc;display:flex;align-items:center;font-size:11px;pointer-events:none">目標</span><span data-placeholder>確認 GM 權限中</span></div><div class="gm-b-hud" data-monster-hud hidden><div><span>玩家</span><progress max="100" value="100" aria-label="玩家測試血條"></progress></div><div><span data-monster-name>怪物</span><progress max="100" value="100" aria-label="怪物測試血條"></progress></div></div><div class="gm-monster-actions" hidden>怪物：<button data-monster-action="idle">待機</button> <button data-monster-action="attack">攻擊</button> <button data-monster-action="hit">受擊</button> <button data-monster-action="defeat">死亡</button> <button data-duel>怪物攻擊玩家</button> <button data-player-duel>玩家攻擊怪物</button></div><p data-monster-status role="status"></p><details data-monster-shared hidden><summary>共用身份與外觀參數</summary><pre data-monster-identities style="white-space:pre-wrap;overflow-wrap:anywhere;max-height:180px;overflow:auto"></pre></details><p class="gm-suit-status" role="status" data-status></p><div class="gm-suit-actions"></div><button type="button" data-missing>測試缺圖回退</button> <button type="button" data-reload>重新載入</button><pre data-diagnostics style="white-space:pre-wrap"></pre></section>';
 const ui=host.firstElementChild,$=s=>ui.querySelector(s),preview=$('.gm-suit-preview'),placeholder=$('[data-placeholder]'),status=$('[data-status]'),era=$('[data-era]');
 for(const a of registry.assets){const option=document.createElement('option');option.value=a.assetId;option.textContent=a.name+' · '+a.assetId;$('[data-monster]').append(option);}
 function selectedMapping(){return findMapping($('[data-monster-identity]').value);}
 function sharedIdentities(){const rows=identitiesForAsset($('[data-monster]').value),select=$('[data-monster-identity]');select.replaceChildren(new Option('選擇怪物身份',''));for(const row of rows)select.append(new Option(row.name+' · '+row.id,row.id));$('[data-monster-shared]').hidden=!rows.length;$('[data-monster-shared] summary').textContent='此原型的怪物（'+rows.length+'）';$('[data-monster-identities]').textContent=rows.map(row=>row.id+' · '+row.name+' · '+row.visual.palette+' · '+Math.round(row.visual.scale*100)+'%').join('\n');describeMonster();}
 function describeMonster(){const asset=registry.assets.find(a=>a.assetId===$('[data-monster]').value),row=selectedMapping();$('[data-monster-description]').textContent=asset?(asset.name+' · '+asset.assetId+'｜使用身份 '+identitiesForAsset(asset.assetId).length+' 種｜'+(row?'選取：'+row.name+' · 配色 '+row.visual.palette+' · 尺寸 '+Math.round(row.visual.scale*100)+'% · 動作 '+row.visual.animationType:'請選擇使用此原型的怪物，查看正式配色、大小與動作')):'選擇原型後，再選擇怪物身份，檢視其正式顏色、大小與動作。';}
 
 const setEnabled=ok=>{ui.querySelectorAll('select,button').forEach(b=>b.disabled=!ok);};
 function clear(){serial++;loading?.abort();loading=null;actor?.canvas.remove();actor?.dispose();actor=null;animation.cancel();placeholder.hidden=false;}
 function diagnostics(){const s=pool.stats();$('[data-diagnostics]').textContent=JSON.stringify({...s,canvases:actor?1:0,rafs:raf?1:0,canCommit:false,monster:{...monsterPool.stats(),id:$('[data-monster]').value,canvases:monster?1:0,animation:monsterAnimation.snapshot(),cache:'SHA-256 / 智慧磁碟快取；解碼上限 2 張'}},null,2);}
 function transform(){if($('[data-monster]').value){duelLayout();return;}if(actor)actor.canvas.style.transform='none';preview.style.width='100%';$('[data-target]').style.left=(preview.clientWidth/2+78)+'px';}
 function request(){return new Promise((resolve,reject)=>{
  if(closed||window.parent===window||new URLSearchParams(location.search).get('embedded')!=='1'){reject(Error('unauthorized'));return;}
  const requestId=crypto.randomUUID(),timer=setTimeout(()=>{pending.delete(requestId);reject(Error('authorization-timeout'));},5000);
  pending.set(requestId,{resolve,reject,timer});window.parent.postMessage({type:'civilization3d:sprite-auth',requestId},location.origin);
 });}
 window.addEventListener('message',event=>{if(event.source!==window.parent||event.origin!==location.origin||event.data?.type!=='civilization3d:sprite-auth-response')return;const p=pending.get(event.data.requestId);if(!p)return;clearTimeout(p.timer);pending.delete(event.data.requestId);p.resolve(event.data.authorized===true);},{signal:own.signal});
 async function authorize(){if(closed||authPending)return authorized;authPending=true;try{authorized=await request();}catch{authorized=false;}finally{authPending=false;lastAuth=performance.now();}
  if(closed)return false;setEnabled(authorized);if(!authorized){clear();clearMonster();monsterPool.clear();pool.clear();status.textContent='需要 GM 授權，請返回遊戲重新開啟。';diagnostics();}return authorized;
 }
 async function show(missing=false){
  clear();const ticket=serial;if(!authorized||closed)return;
  status.textContent='角色載入中…';const row=release.entries.find(e=>e.id===era.value);loading=new AbortController();
  // Fail the real integrity-checked pool path without touching the release catalog.
  const entry=missing?{...row,asset:{...row.asset,sha256:'0'.repeat(64)},weaponAnimation:{...row.weaponAnimation,body:{...row.weaponAnimation.body,sha256:'0'.repeat(64)}}}:row;
  try{const next=await new WholeSuitActor(pool,entry,{tier:quality,signal:loading.signal}).init();
   if(closed||!authorized||ticket!==serial){next.dispose();return;}
   actor=next;actor.canvas.dataset.suit=row.id;actor.canvas.style.cssText='position:absolute;left:calc(50% - 90px);top:20px;height:180px;width:180px;max-width:100%;object-fit:contain';preview.append(actor.canvas);placeholder.hidden=true;transform();animation.play('idle',visualNow);status.textContent='已載入，可檢查六種動作。';
  }catch{if(!closed&&ticket===serial){status.textContent='缺圖或驗證失敗：已安全回退文字，未修改正式資料。';placeholder.textContent='角色暫時無法顯示';}}
  diagnostics();
 }
 for(const [clip,label] of [['idle','待機'],['attack','攻擊（短距離上挑斬）'],['hit','受擊'],['dodge','閃避'],['return','回位'],['defeat','死亡']]){const b=document.createElement('button');b.type='button';b.dataset.action=clip;b.textContent=label;b.addEventListener('click',()=>{if(authorized&&actor){lastClip=clip;animation.play(clip,visualNow);}},{signal:own.signal});$('.gm-suit-actions').append(b);}
  $('[data-replay]').addEventListener('click',()=>{if(authorized&&actor)animation.play(lastClip,visualNow);},{signal:own.signal});
 era.addEventListener('change',()=>show(),{signal:own.signal});
 $('[data-missing]').addEventListener('click',()=>show(true),{signal:own.signal});$('[data-reload]').addEventListener('click',async()=>{if(await authorize()){void show();void showMonster();}},{signal:own.signal});
 function tick(now){raf=0;if(closed||document.hidden)return;if(lastTick!==null)visualNow+=Math.max(0,now-lastTick)*Number($('[data-speed]').value);lastTick=now;if(now-lastAuth>2000)void authorize();if(actor&&authorized&&Math.floor(visualNow/33)!==lastFrame){lastFrame=Math.floor(visualNow/33);const s=animation.sample(visualNow);actor.canvas.dataset.clip=s.clip;actor.draw({clip:s.clip,elapsedMs:s.elapsedMs,rootMotion:true});if(monster){const m=monsterAnimation.sample(visualNow);monster.draw({...m,palette:selectedMapping()?.visual.palette||'original'});}}raf=requestAnimationFrame(tick);if(now-lastStats>250){lastStats=now;diagnostics();}}
 function clearMonster(){monsterSerial++;monsterLoading?.abort();monsterLoading=null;monster?.dispose();monster=null;monsterAnimation.cancel();}
 function duelLayout(){
  const active=!!$('[data-monster]').value;
  $('.gm-monster-actions').hidden=!active;$('[data-monster-hud]').hidden=!active;$('[data-target]').hidden=active;
  preview.style.width='100%';
  if(!active){if(actor){actor.canvas.style.cssText='position:absolute;left:calc(50% - 90px);top:20px;height:180px;width:180px;max-width:100%;object-fit:contain';}transform();return;}
  const w=preview.clientWidth,h=preview.clientHeight,half=w/2;
  // Reserve both positions before an image loads. HUD/actions sit outside this stage.
  if(actor){const a=release.entries.find(e=>e.id===era.value),b=a.asset.alphaBounds;
   const p=visualPlacement(b,half,h,1);
   actor.canvas.style.cssText=`position:absolute;left:${p.x}px;top:${p.y}px;width:${p.size}px;height:${p.size}px;max-width:none;transform:none`;
  }
  if(monster){
   const visual=selectedMapping()?.visual||{},entry=monster.entry;
   const playerBounds=release.entries.find(e=>e.id===era.value)?.asset.alphaBounds;
   const playerCanvas=actor?.canvas;
   // visualPlacement has already sized the player CSS box. Compare actual alpha pixels.
   const playerVisibleHeight=(playerCanvas?.getBoundingClientRect().height||Math.min(h*.87,w*.44))*(playerBounds[3]-playerBounds[1])/512;
   const {size,actualRatio}=monsterVisibleSize({assetId:entry.assetId,bounds:entry.visualBounds,visual,playerVisibleHeight,stageWidth:w,stageHeight:h});
   const x=half+(half-size)/2+(visual.offsetX||0),y=(h-size)/2+(visual.offsetY||0);
   monster.canvas.style.cssText=`position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;max-width:none`;
   monster.canvas.dataset.actualRatio=actualRatio.toFixed(3);
  }
 }
 async function showMonster(){
  clearMonster();duelLayout();const id=$('[data-monster]').value,ticket=monsterSerial;
  if(!id){$('[data-monster-status]').textContent='';diagnostics();return;}
  if(!authorized||closed)return;const entry=registry.assets.find(a=>a.assetId===id);
  $('[data-monster-status]').textContent=`${entry.name} · ${id}：載入及 SHA-256 驗證中…`;
  $('[data-monster-name]').textContent=entry.name+' · '+id;
  monsterLoading=new AbortController();
  try{const next=await new MonsterActor(monsterPool,id,{signal:monsterLoading.signal,tier:quality,identity:$('[data-monster-identity]').value||null}).init();
   if(closed||!authorized||ticket!==monsterSerial){next.dispose();return;}
   monster=next;preview.append(next.canvas);monsterAnimation.play('idle',visualNow);duelLayout();next.draw();
   $('[data-monster-status]').textContent=`${entry.name} · ${id} · 512×512 · 左向 · SHA-256 已驗證`;
  }catch(e){if(!closed&&ticket===monsterSerial)$('[data-monster-status]').textContent=`${entry.name} · ${id}：圖片載入失敗，可重新載入（${e.message}）`;}
  diagnostics();
 }
 $('[data-monster]').addEventListener('change',()=>{sharedIdentities();void showMonster();},{signal:own.signal});
 $('[data-monster-identity]').addEventListener('change',()=>{describeMonster();void showMonster();},{signal:own.signal});
 for(const b of ui.querySelectorAll('[data-monster-action]'))b.addEventListener('click',()=>{if(authorized&&monster){monsterClip=b.dataset.monsterAction;monsterAnimation.play(monsterClip,visualNow);}},{signal:own.signal});
 $('[data-duel]').addEventListener('click',()=>{if(authorized&&actor&&monster){animation.play('hit',visualNow);monsterAnimation.play('attack',visualNow);}},{signal:own.signal});
  $('[data-player-duel]').addEventListener('click',()=>{if(authorized&&actor&&monster){animation.play('attack',visualNow);monsterAnimation.play('hit',visualNow);}},{signal:own.signal});
 const observer=new ResizeObserver(()=>{if($('[data-monster]').value)duelLayout();});observer.observe(preview);own.signal.addEventListener('abort',()=>observer.disconnect(),{once:true});
 const start=()=>{if(!closed&&!document.hidden&&!raf)raf=requestAnimationFrame(tick);};
 const dispose=()=>{if(closed)return;closed=true;clearMonster();monsterAnimation.dispose();monsterPool.dispose();cancelAnimationFrame(raf);raf=0;clear();animation.dispose();pool.dispose();own.abort();for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('disposed'));}pending.clear();signal?.removeEventListener('abort',dispose);ui.remove();};
 signal?.addEventListener('abort',dispose,{once:true});if(signal?.aborted){dispose();return {dispose};}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;lastTick=null;animation.cancel();monsterAnimation.cancel();clearMonster();monsterPool.clear();}else{void authorize().then(ok=>{if(ok&&$('[data-monster]').value)void showMonster();});start();}},{signal:own.signal});
 setEnabled(false);if(await authorize())await show();start();
 return {dispose,resize:transform,stats:()=>pool.stats()};
}
