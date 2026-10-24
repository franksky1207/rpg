import {resolveFormalMirror} from './monster-formal-resolver.mjs?v=20261024-au-ten-stages1';
import {registry,mappings,identitiesForAsset,findMapping} from './monster-sprites.mjs?v=20261024-au-ten-stages1';
import {MonsterActor,visualPlacement,applyBattleSpriteLayout,applyDungeonEffects,visibleFootprint,releaseMonsterAppearanceViewport} from './monster-actor.mjs?v=20261024-approved1';
import {createMonsterPool} from './monster-sprite-pool.mjs?v=20261024-au-ten-stages1';
// Isolated GM inspection. Shares the formal Actor/Pool, never reads or writes player state.
import {WholeSuitActor} from './equipment-sprites-v1/actor.mjs?v=20261021-batch16-dungeons1';
import {createSpritePool} from './equipment-sprites-v1/assets.mjs?v=20261019-batch12-rising-cut1';
import {release} from './era-player-sprites.mjs?v=20261019-batch12-rising-cut1';
import {animationController} from './equipment-sprites-v1/animation.mjs?v=20261019-batch12-rising-cut1';
export async function mount({host,signal,quality='medium'}={}){
 const own=new AbortController(),pool=createSpritePool({limit:4*1024*1024}),animation=animationController(),pending=new Map();
 const monsterPool=createMonsterPool(),monsterAnimation=animationController();
 let monster=null,monsterLoading=null,monsterSerial=0,monsterClip='idle',lastFrame=-1;
 let visualNow=0,lastTick=null,lastClip="idle",mirrorPlayerName='預覽角色';
 let closed=false,authorized=false,actor=null,loading=null,serial=0,raf=0,lastAuth=-Infinity,authPending=false;
 host.innerHTML='<section class="gm-suit"><div class="gm-suit-selects"><label>模式<select data-preview-mode><option value="player">玩家</option><option value="monster">怪物</option><option value="duel">對戰</option></select></label><label>紀元<select data-era><option value="era-galaxy">銀河</option><option value="era-universe">宇宙</option><option value="era-higher">高維</option></select></label><label data-source-label hidden>來源<select data-source></select></label><label data-identity-label hidden>怪物<select data-identity></select></label></div><span data-alternate hidden><label>文明 <select data-culture></select></label> <label>宇宙 <select data-universe></select></label> <label>階段 <select data-stage></select></label></span><label>速度 <select data-speed><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option></select></label> <button type="button" data-replay>重播動作</button><div class="gm-suit-preview" style="position:relative;height:240px;overflow:hidden;margin-inline:auto;max-width:100%"><span data-target role="img" aria-label="攻擊距離參考目標" style="position:absolute;top:96px;width:24px;height:40px;border:2px solid #9cb8cc;display:flex;align-items:center;font-size:11px;pointer-events:none">目標</span><span data-placeholder>確認 GM 權限中</span></div><div class="gm-b-hud" data-monster-hud hidden><div><span>玩家</span><progress max="100" value="100" aria-label="玩家測試血條"></progress></div><div><span data-monster-name>怪物</span><progress max="100" value="100" aria-label="怪物測試血條"></progress></div></div><div class="gm-monster-actions" hidden><button data-duel>怪物攻擊玩家</button> <button data-player-duel>玩家攻擊怪物</button></div><p data-monster-status role="status"></p><button type="button" data-reload hidden>重新載入</button><p class="gm-suit-status" role="status" data-status></p><div class="gm-suit-actions"></div><details data-advanced><summary>更多預覽選項</summary><label>副本預覽 <select data-dungeon><option value="">地圖／原型</option><option value="galaxy/calamity">銀河災厄</option><option value="universe/calamity">宇宙災厄</option><option value="higher/main">高維十王</option><option value="both/alternate">異宇宙</option><option value="galaxy/bounty">銀河懸賞</option><option value="universe/bounty">宇宙懸賞</option><option value="galaxy/arena">銀河競技場</option><option value="universe/arena">宇宙競技場</option><option value="both/void">虛空幻境</option><option value="galaxy/mirror">銀河鏡像</option><option value="universe/mirror">宇宙鏡像</option></select></label>  <button type="button" data-boss-compare>原型快照比較</button><div data-boss-gallery hidden style="display:none;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:6px"></div> <label>怪物原型 <select data-monster><option value="">關閉（角色測試）</option></select></label> <label>使用此原型的怪物 <select data-monster-identity><option value="">選擇怪物身份</option></select></label> <p data-monster-description role="status">選擇原型後，再選擇怪物身份，檢視其正式顏色、大小與動作。</p></details></section>';
 const ui=host.firstElementChild,$=s=>ui.querySelector(s==='[data-monster]'?'select[data-monster]':s),preview=$('.gm-suit-preview'),placeholder=$('[data-placeholder]'),status=$('[data-status]'),era=$('[data-era]');
 for(const a of registry.assets){const option=document.createElement('option');option.value=a.assetId;option.textContent=a.name+'（原型示例；請選身份）';$('[data-monster]').append(option);}
 function selectedMapping(){
  if($('[data-monster]').value==='mirror')return resolveFormalMirror({mode:'mirror',world:era.value==='era-universe'?2:1,name:'鏡像・'+mirrorPlayerName,playerName:mirrorPlayerName},release.entries.find(e=>e.id===era.value));
  return findMapping($('[data-monster-identity]').value);
 }
 $('[data-monster]').append(new Option('鏡像角色（正式玩家外觀）','mirror'));

 let previewMode='player',lastDirection=null;
 const worlds={ 'era-galaxy':'galaxy','era-universe':'universe','era-higher':'higher' };
 const sourceNames={main:'主線',calamity:'文明災厄',bounty:'懸賞',arena:'競技場',void:'虛空幻境',mirror:'鏡像',special:'特殊怪物',alternate:'異宇宙'};
 const sourceOf=r=>r.mode||(r.world==='both'?'special':'main');
 function sourceRows(){return Object.values(mappings).filter(r=>(r.world===worlds[era.value]||r.world==='both')&&(sourceOf(r)===$('[data-source]').value||(era.value==='era-higher'&&$('[data-source]').value==='arena'&&r.world==='higher'&&r.mode==='main')));}
 function updateSources(){
  const previous=$('[data-source]').value;
  const sources=[...new Set(Object.values(mappings).filter(r=>r.world===worlds[era.value]||r.world==='both').map(sourceOf))];
  if(era.value!=='era-higher')sources.push('mirror');else sources.push('arena');
  $('[data-source]').replaceChildren(...sources.map(k=>new Option(sourceNames[k]||k,k)));
  if(sources.includes(previous))$('[data-source]').value=previous;
 }
 async function selectSource(){
  const source=$('[data-source]').value;
  $('[data-alternate]').hidden=source!=='alternate'||previewMode==='player';
  $('[data-identity-label]').hidden=previewMode==='player'||source==='alternate';
  if(source==='alternate'){await selectAlternate(true);return;}
  const rows=sourceRows();
  $('[data-identity]').replaceChildren(...(source==='mirror'?[new Option('鏡像・'+mirrorPlayerName,'mirror')]:rows.map(r=>new Option(era.value==='era-higher'&&source==='arena'?'高維投影·'+r.name:r.name,r.id))));
  await selectIdentity();
 }
 async function selectIdentity(){
  const id=$('[data-identity]').value,row=findMapping(id);
  $('[data-monster]').value=id==='mirror'?'mirror':row?.assetId||'';
  $('[data-monster-identity]').replaceChildren(new Option(row?.name||'鏡像',row?.id||''));
  describeMonster();await showMonster();
 }
 async function changeMode(){
  previewMode=$('[data-preview-mode]').value;lastDirection=null;lastClip=monsterClip='idle';animation.play('idle',visualNow);monsterAnimation.play('idle',visualNow);
  ui.dataset.view=previewMode;
  $('[data-source-label]').hidden=previewMode==='player';
  if(previewMode==='player'){$('[data-alternate]').hidden=true;$('[data-identity-label]').hidden=true;$('[data-monster]').value='';await showMonster();}
  else{updateSources();await selectSource();}
  duelLayout();
 }
 $('[data-preview-mode]').addEventListener('change',()=>void changeMode(),{signal:own.signal});
 $('[data-source]').addEventListener('change',()=>void selectSource(),{signal:own.signal});
 $('[data-identity]').addEventListener('change',()=>void selectIdentity(),{signal:own.signal});
 let gallerySerial=0;
 $('[data-boss-compare]').addEventListener('click',async()=>{
  const gallery=$('[data-boss-gallery]'),ticket=++gallerySerial;
  gallery.hidden=!gallery.hidden;gallery.style.display=gallery.hidden?'none':'grid';
  if(gallery.hidden){gallery.replaceChildren();return;}
  gallery.replaceChildren();
  // Sequential one-shot snapshots: no gallery RAF, no persistent battle Actors.
  for(const row of Object.values(mappings).filter(r=>r.status==='batch17-formal-enabled')){
   if(closed||!authorized||ticket!==gallerySerial)break;
   const thumb=new MonsterActor(monsterPool,row.assetId,{identity:row.id,signal:own.signal,tier:'low'});
   try{await thumb.init();thumb.draw({clip:'idle',elapsedMs:0});
    if(closed||!authorized||ticket!==gallerySerial)break;
    const fig=document.createElement('figure'),img=document.createElement('img'),label=document.createElement('figcaption');
    img.src=thumb.canvas.toDataURL();img.width=img.height=112;img.alt=row.name;img.style.filter=thumb.canvas.style.filter;
    label.textContent=row.name+'｜大小：玩家的 '+Math.round(row.visual.visibleRatio*100)+'%';
    fig.style.margin='0';fig.append(img,label);gallery.append(fig);
   }catch{if(!closed)gallery.append(document.createTextNode(row.name+'：載入失敗，可重試'));}finally{thumb.dispose();}
  }
 },{signal:own.signal});
 $('[data-dungeon]').addEventListener('change',async()=>{
  const value=$('[data-dungeon]').value;
  $('[data-alternate]').hidden=value!=='both/alternate';
  if(value==='both/alternate'){era.value='era-higher';await show();await selectAlternate(true);return;}
  if(!value){$('[data-monster]').value='';sharedIdentities();await showMonster();return;}
  const [world,mode]=value.split('/');era.value='era-'+(world==='both'?'galaxy':world);await show();
  if(mode==='mirror'){$('[data-monster]').value='mirror';sharedIdentities();await showMonster();return;}
  const rows=Object.values(mappings).filter(r=>r.mode===mode&&r.world===world),select=$('[data-monster-identity]');
  select.replaceChildren(...rows.map(r=>new Option(r.name,r.id)));
  $('[data-monster]').value=rows[0].assetId;describeMonster();await showMonster();
 },{signal:own.signal});
 // Only options are materialized. One selected Actor, never 1000 live Actors.
 const alternateRows=Object.values(mappings).filter(r=>r.status==='batch18-formal-enabled');
 const cultures=[...new Set(alternateRows.map(r=>r.culture))];
 $('[data-culture]').replaceChildren(...cultures.map(c=>new Option(c,c)));
 for(const stage of alternateRows.slice(0,5))$('[data-stage]').append(new Option(stage.stageName,String(stage.stageIndex)));
 async function selectAlternate(reset=false){
  const culture=$('[data-culture]').value,rows=alternateRows.filter(r=>r.culture===culture);
  if(reset)$('[data-universe]').replaceChildren(...rows.filter(r=>r.stageIndex===0).map(r=>new Option(r.universeNumber+' · '+r.universeName,String(r.universeIndex))));
  const row=rows.find(r=>String(r.universeIndex)===$('[data-universe]').value&&String(r.stageIndex)===$('[data-stage]').value);
  if(!row)return;
  $('[data-monster]').value=row.assetId;
  $('[data-monster-identity]').replaceChildren(new Option(row.name,row.id));
  describeMonster();await showMonster();
 }
 $('[data-culture]').addEventListener('change',()=>void selectAlternate(true),{signal:own.signal});
 for(const key of ['universe','stage'])$('[data-'+key+']').addEventListener('change',()=>void selectAlternate(),{signal:own.signal});
 function sharedIdentities(){const rows=identitiesForAsset($('[data-monster]').value),select=$('[data-monster-identity]');select.replaceChildren(new Option('選擇怪物身份',''));for(const row of rows)select.append(new Option(row.name,row.id));describeMonster();}
 function describeMonster(){const id=$('[data-monster]').value,row=selectedMapping(),asset=registry.assets.find(a=>a.assetId===id);$('[data-monster-description]').textContent=id==='mirror'?'鏡像｜大小：玩家的 106%':asset?(asset.name+(row?'｜大小：玩家的 '+Math.round((row.visual.visibleRatio||row.visual.scale)*100)+'%':'｜請選擇怪物')):'';}
 
 const setEnabled=ok=>{ui.querySelectorAll('select,button').forEach(b=>b.disabled=!ok);};
 function clear(){serial++;loading?.abort();loading=null;actor?.canvas.remove();actor?.dispose();actor=null;animation.cancel();placeholder.hidden=false;}
 function diagnostics(){return {...pool.stats(),canvases:actor?1:0,rafs:raf?1:0,canCommit:false,monster:{...monsterPool.stats(),id:$('[data-monster]').value,canvases:monster?1:0,animation:monsterAnimation.snapshot()}};}
 function transform(){if($('[data-monster]').value){duelLayout();return;}if(actor)actor.canvas.style.transform='none';preview.style.width='100%';$('[data-target]').style.left=(preview.clientWidth/2+78)+'px';}
 function request(){return new Promise((resolve,reject)=>{
  if(closed||window.parent===window||new URLSearchParams(location.search).get('embedded')!=='1'){reject(Error('unauthorized'));return;}
  const requestId=crypto.randomUUID(),timer=setTimeout(()=>{pending.delete(requestId);reject(Error('authorization-timeout'));},5000);
  pending.set(requestId,{resolve,reject,timer});window.parent.postMessage({type:'civilization3d:sprite-auth',requestId},location.origin);
 });}
 window.addEventListener('message',event=>{if(event.source!==window.parent||event.origin!==location.origin||event.data?.type!=='civilization3d:sprite-auth-response')return;const p=pending.get(event.data.requestId);if(!p)return;clearTimeout(p.timer);pending.delete(event.data.requestId);if(event.data.authorized===true&&typeof event.data.playerName==='string')mirrorPlayerName=event.data.playerName;p.resolve(event.data.authorized===true);},{signal:own.signal});
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
   actor=next;actor.draw({clip:'idle',elapsedMs:0});actor.canvas.dataset.suit=row.id;actor.canvas.style.cssText='position:absolute;left:calc(50% - 90px);top:20px;height:180px;width:180px;max-width:100%;object-fit:contain';preview.append(actor.canvas);placeholder.hidden=true;transform();animation.play('idle',visualNow);status.textContent='';$('[data-reload]').hidden=true;
  }catch{if(!closed&&ticket===serial){status.textContent='缺圖或驗證失敗，已安全回退；請重新載入。';$('[data-reload]').hidden=false;placeholder.textContent='角色暫時無法顯示';}}
  diagnostics();
 }
 for(const [clip,label] of [['idle','待機'],['attack','攻擊'],['hit','受擊'],['dodge','閃避'],['return','回位'],['defeat','死亡']]){const b=document.createElement('button');b.type='button';b.dataset.action=clip;b.textContent=label;b.title=clip==='attack'?'攻擊（短距離上挑斬）':label;b.addEventListener('click',()=>{if(authorized&&actor){lastDirection=null;lastClip=clip;if(previewMode==='monster'&&monster){monsterClip=clip;monsterAnimation.play(clip,visualNow);}else animation.play(clip,visualNow);}},{signal:own.signal});$('.gm-suit-actions').append(b);}
  $('[data-replay]').addEventListener('click',()=>{if(authorized&&actor){if(lastDirection&&previewMode==='duel'&&monster){animation.play(lastDirection==='player'?'attack':'hit',visualNow);monsterAnimation.play(lastDirection==='player'?'hit':'attack',visualNow);}else if(previewMode==='monster'&&monster)monsterAnimation.play(monsterClip,visualNow);else animation.play(lastClip,visualNow);}},{signal:own.signal});
 era.addEventListener('change',async()=>{await show();if(previewMode!=='player'){updateSources();await selectSource();}else if($('[data-monster]').value==='mirror')await showMonster();},{signal:own.signal});
 $('[data-reload]').addEventListener('click',async()=>{if(await authorize()){void show();void showMonster();}},{signal:own.signal});
 function tick(now){raf=0;if(closed||document.hidden)return;if(lastTick!==null)visualNow+=Math.max(0,now-lastTick)*Number($('[data-speed]').value);lastTick=now;if(now-lastAuth>2000)void authorize();if(actor&&authorized&&Math.floor(visualNow/33)!==lastFrame){lastFrame=Math.floor(visualNow/33);const s=animation.sample(visualNow);actor.canvas.dataset.clip=s.clip;actor.draw({clip:s.clip,elapsedMs:s.elapsedMs,rootMotion:true});if(monster){const m=monsterAnimation.sample(visualNow);monster.canvas.dataset.clip=m.clip;monster.draw({...m,palette:selectedMapping()?.visual.palette||'original'});if(monster.mirrored)applyDungeonEffects(monster.canvas,selectedMapping()?.visual);}}raf=requestAnimationFrame(tick);}
 function clearMonster(){releaseMonsterAppearanceViewport(preview);monsterSerial++;monsterLoading?.abort();monsterLoading=null;monster?.canvas.remove();monster?.dispose();monster=null;monsterAnimation.cancel();}
 function duelLayout(){
  const active=!!$('[data-monster]').value;
  $('.gm-monster-actions').hidden=!active||previewMode!=='duel';$('[data-monster-hud]').hidden=!active||previewMode!=='duel';if(actor)actor.canvas.style.visibility=previewMode==='monster'?'hidden':'visible';$('[data-target]').hidden=active;
  preview.style.width='100%';
  if(!active){if(actor){actor.canvas.style.cssText='position:absolute;left:calc(50% - 90px);top:20px;height:180px;width:180px;max-width:100%;object-fit:contain';}transform();return;}
  const w=preview.clientWidth,h=preview.clientHeight,half=w/2;
  // Reserve both positions before an image loads. HUD/actions sit outside this stage.
  if(actor){const a=release.entries.find(e=>e.id===era.value),b=a.asset.alphaBounds;
   const p=visualPlacement(b,half,h,1);
   actor.canvas.style.cssText=`position:absolute;left:${p.x}px;top:${p.y}px;width:${p.size}px;height:${p.size}px;max-width:none;transform:none`;
  }
  if(actor&&monster){const layout=applyBattleSpriteLayout(actor,monster,w,h,selectedMapping()?.visual||{});$('[data-monster-description]').dataset.actualRatio=String(layout.ratio);}
 }
 async function showMonster(){
  $('[data-monster-status]').dataset.ready='false';clearMonster();duelLayout();const id=$('[data-monster]').value,ticket=monsterSerial;
  if(!id){$('[data-monster-status]').textContent='';diagnostics();return;}
  if(!authorized||closed)return;const entry=id==='mirror'?{name:'鏡像・'+mirrorPlayerName}:registry.assets.find(a=>a.assetId===id);
  $('[data-monster-status]').textContent='怪物載入中…';
  $('[data-monster-name]').textContent=(selectedMapping()?.name||entry.name);
  monsterLoading=new AbortController();
  try{const next=await (id==='mirror'?new WholeSuitActor(pool,release.entries.find(e=>e.id===era.value),{signal:monsterLoading.signal,tier:quality}):new MonsterActor(monsterPool,id,{signal:monsterLoading.signal,tier:quality,identity:$('[data-monster-identity]').value||null})).init();if(id==='mirror'){next.mirrored=true;next.canvas.dataset.mirror=era.value;}
   if(closed||!authorized||ticket!==monsterSerial){next.dispose();return;}
   monster=next;preview.append(next.canvas);monsterAnimation.play('idle',visualNow);duelLayout();next.draw({clip:'idle',elapsedMs:0});if(next.mirrored)applyDungeonEffects(next.canvas,selectedMapping()?.visual);
   $('[data-monster-status]').textContent='';$('[data-monster-status]').dataset.ready='true';
  }catch(e){if(!closed&&ticket===monsterSerial){$('[data-reload]').hidden=false;$('[data-monster-status]').textContent=`${entry.name}：圖片載入失敗，請重新載入。`;}}
  diagnostics();
 }
 $('[data-monster]').addEventListener('change',()=>{$('[data-dungeon]').value='';sharedIdentities();void showMonster();},{signal:own.signal});
 $('[data-monster-identity]').addEventListener('change',()=>{const row=selectedMapping();if(row)$('[data-monster]').value=row.assetId;describeMonster();void showMonster();},{signal:own.signal});
 for(const clip of ['idle','attack','hit','dodge','return','defeat']){const b=document.createElement('button');b.dataset.monsterAction=clip;b.textContent=clip;b.hidden=true;$('[data-advanced]').append(b);}
 for(const b of ui.querySelectorAll('[data-monster-action]'))b.addEventListener('click',()=>{if(authorized&&monster){monsterClip=b.dataset.monsterAction;monsterAnimation.play(monsterClip,visualNow);}},{signal:own.signal});
 $('[data-duel]').addEventListener('click',()=>{if(authorized&&actor&&monster){lastDirection='monster';animation.play('hit',visualNow);monsterAnimation.play('attack',visualNow);}},{signal:own.signal});
  $('[data-player-duel]').addEventListener('click',()=>{if(authorized&&actor&&monster){lastDirection='player';animation.play('attack',visualNow);monsterAnimation.play('hit',visualNow);}},{signal:own.signal});
 const observer=new ResizeObserver(()=>{if($('[data-monster]').value)duelLayout();});observer.observe(preview);own.signal.addEventListener('abort',()=>observer.disconnect(),{once:true});
 const start=()=>{if(!closed&&!document.hidden&&!raf)raf=requestAnimationFrame(tick);};
 const dispose=()=>{if(closed)return;closed=true;clearMonster();monsterAnimation.dispose();monsterPool.dispose();cancelAnimationFrame(raf);raf=0;clear();animation.dispose();pool.dispose();own.abort();for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('disposed'));}pending.clear();signal?.removeEventListener('abort',dispose);ui.remove();};
 signal?.addEventListener('abort',dispose,{once:true});if(signal?.aborted){dispose();return {dispose};}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;lastTick=null;animation.cancel();monsterAnimation.cancel();clearMonster();monsterPool.clear();}else{void authorize().then(ok=>{if(ok&&$('[data-monster]').value)void showMonster();});start();}},{signal:own.signal});
 ui.dataset.view='player';updateSources();setEnabled(false);if(await authorize())await show();start();
 const api=Object.freeze({dispose,resize:transform,stats:()=>pool.stats(),diagnostics,
  testMissing:async()=>{if(await authorize())await show(true);},
  clearPreviewCache:async()=>{if(!await authorize())return;clear();clearMonster();pool.clear();monsterPool.clear();await show();await showMonster();}
 });
 ui.__previewTestApi=api;return api;
}
