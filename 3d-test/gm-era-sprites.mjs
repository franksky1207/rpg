import {PHASES} from './equipment-sprites-v1/contract.mjs';
import {fitPreview} from './gm-preview-layout.mjs?v=20261025-center1';
import {resolveFormalMirror} from './monster-formal-resolver.mjs?v=20261024-au-ten-stages1';
import {registry,mappings,identitiesForAsset,findMapping} from './monster-sprites.mjs?v=20261024-au-ten-stages1';
import {MonsterActor,applyDungeonEffects,releaseMonsterAppearanceViewport} from './monster-actor.mjs?v=20261024-approved1';
import {createMonsterPool} from './monster-sprite-pool.mjs?v=20261024-au-ten-stages1';
// Isolated GM inspection. Shares the formal Actor/Pool, never reads or writes player state.
import {WholeSuitActor} from './equipment-sprites-v1/actor.mjs?v=20261021-batch16-dungeons1';
import {createSpritePool} from './equipment-sprites-v1/assets.mjs?v=20261019-batch12-rising-cut1';
import {release} from './era-player-sprites.mjs?v=20261019-batch12-rising-cut1';
import {animationController} from './equipment-sprites-v1/animation.mjs?v=20261019-batch12-rising-cut1';
export async function mount({host,signal,quality='medium'}={}){
 const own=new AbortController(),pool=createSpritePool({limit:4*1024*1024}),animation=animationController(),pending=new Map();
 const monsterPool=createMonsterPool(),monsterAnimation=animationController();
 let monster=null,monsterLoading=null,monsterSerial=0,lastFrame=-1;
 let clockRate=1,visualNow=0,lastTick=null,mirrorPlayerName='預覽角色';
 let presenting=false,playing=false,sequence=0,phaseAt=0,phaseDuration=PHASES.defeat[1],layout=null;
 let closed=false,authorized=false,actor=null,loading=null,serial=0,raf=0,lastAuth=-Infinity,authPending=null;
 host.innerHTML='<section class="gm-suit"><div class="gm-suit-selects"><label>模式<select data-preview-mode><option value="player">玩家</option><option value="monster">怪物</option><option value="duel">對戰</option></select></label><label>紀元<select data-era><option value="era-galaxy">銀河</option><option value="era-universe">宇宙</option><option value="era-higher">高維</option></select></label><label data-source-label hidden>來源<select data-source></select></label><label data-identity-label hidden>怪物<select data-identity></select></label></div><span data-alternate hidden><label>文明 <select data-culture></select></label> <label>宇宙 <select data-universe></select></label> <label>階段 <select data-stage></select></label></span><label>速度 <select data-speed><option value="1" selected>1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label> <div class="gm-suit-preview" style="position:relative;height:240px;overflow:hidden;margin-inline:auto;max-width:100%"><span data-placeholder>確認 GM 權限中</span></div><p data-monster-status role="status"></p><button type="button" data-reload hidden>重新載入</button><p class="gm-suit-status" role="status" data-status></p><details data-advanced><summary>更多預覽選項</summary><label>副本預覽 <select data-dungeon><option value="">地圖／原型</option><option value="galaxy/calamity">銀河災厄</option><option value="universe/calamity">宇宙災厄</option><option value="higher/main">高維十王</option><option value="both/alternate">異宇宙</option><option value="galaxy/bounty">銀河懸賞</option><option value="universe/bounty">宇宙懸賞</option><option value="galaxy/arena">銀河競技場</option><option value="universe/arena">宇宙競技場</option><option value="both/void">虛空幻境</option><option value="galaxy/mirror">銀河鏡像</option><option value="universe/mirror">宇宙鏡像</option></select></label>  <button type="button" data-boss-compare>原型快照比較</button><div data-boss-gallery hidden style="display:none;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:6px"></div> <label>怪物原型 <select data-monster><option value="">關閉（角色測試）</option></select></label> <label>使用此原型的怪物 <select data-monster-identity><option value="">選擇怪物身份</option></select></label> <p data-monster-description role="status">選擇原型後，再選擇怪物身份，檢視其正式顏色、大小與動作。</p></details></section>';
 const ui=host.firstElementChild,$=s=>ui.querySelector(s==='[data-monster]'?'select[data-monster]':s),preview=$('.gm-suit-preview'),placeholder=$('[data-placeholder]'),status=$('[data-status]'),era=$('[data-era]');
 for(const a of registry.assets){const option=document.createElement('option');option.value=a.assetId;option.textContent=a.name+'（原型示例；請選身份）';$('[data-monster]').append(option);}
 function selectedMapping(){
  if($('[data-monster]').value==='mirror')return resolveFormalMirror({mode:'mirror',world:era.value==='era-universe'?2:1,name:'鏡像・'+mirrorPlayerName,playerName:mirrorPlayerName},release.entries.find(e=>e.id===era.value));
  return findMapping($('[data-monster-identity]').value);
 }
 $('[data-monster]').append(new Option('鏡像角色（正式玩家外觀）','mirror'));

 let previewMode='player';
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
  previewMode=$('[data-preview-mode]').value;animation.play('idle',visualNow);monsterAnimation.play('idle',visualNow);
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
  if(!await authorize())return;
  const gallery=$('[data-boss-gallery]'),ticket=++gallerySerial;
  gallery.hidden=!gallery.hidden;gallery.style.display=gallery.hidden?'none':'grid';
  if(gallery.hidden){gallery.replaceChildren();return;}
  gallery.replaceChildren();
  // Sequential one-shot snapshots: no gallery RAF, no persistent battle Actors.
  for(const row of Object.values(mappings).filter(r=>r.status==='batch17-formal-enabled')){
   if(closed||!authorized||ticket!==gallerySerial)break;
   if(performance.now()-lastAuth>2000&&!await authorize())break;
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
 function describeMonster(){const row=selectedMapping();$('[data-monster-description]').textContent=row?row.name+'｜大小：玩家的 '+Math.round((row.visual.visibleRatio||row.visual.scale)*100)+'%':'請選擇怪物身份';}
 
 const setEnabled=ok=>{ui.querySelectorAll('select,button').forEach(b=>b.disabled=b.hasAttribute('data-back')?false:!ok);};
 function clear(){serial++;loading?.abort();loading=null;actor?.canvas.remove();actor?.dispose();actor=null;animation.cancel();placeholder.hidden=false;}
 function diagnostics(){return {presenting,playing,sequence,layout,animation:animation.snapshot(),speed:Number($('[data-speed]').value),...pool.stats(),canvases:actor?1:0,rafs:raf?1:0,canCommit:false,monster:{...monsterPool.stats(),id:$('[data-monster]').value,canvases:monster?1:0,animation:monsterAnimation.snapshot()}};}
 function transform(){duelLayout();}
 function request(){return new Promise((resolve,reject)=>{
  if(closed||window.parent===window||new URLSearchParams(location.search).get('embedded')!=='1'){reject(Error('unauthorized'));return;}
  const requestId=crypto.randomUUID(),timer=setTimeout(()=>{pending.delete(requestId);reject(Error('authorization-timeout'));},5000);
  pending.set(requestId,{resolve,reject,timer});window.parent.postMessage({type:'civilization3d:sprite-auth',requestId},location.origin);
 });}
 window.addEventListener('message',event=>{if(event.source!==window.parent||event.origin!==location.origin||event.data?.type!=='civilization3d:sprite-auth-response')return;const p=pending.get(event.data.requestId);if(!p)return;clearTimeout(p.timer);pending.delete(event.data.requestId);if(event.data.authorized===true&&typeof event.data.playerName==='string')mirrorPlayerName=event.data.playerName;p.resolve(event.data.authorized===true);},{signal:own.signal});
 function authorize(){
  if(closed)return Promise.resolve(false);if(authPending)return authPending;
  authPending=(async()=>{
   try{authorized=await request();}catch{authorized=false;}finally{lastAuth=performance.now();}
   if(closed)return false;setEnabled(authorized);
   if(!authorized){playing=false;cancelAnimationFrame(raf);raf=0;clear();clearMonster();monsterPool.clear();pool.clear();status.textContent='需要 GM 授權，請返回遊戲重新開啟。';}
   return authorized;
  })();
  return authPending.finally(()=>{authPending=null;});
 }
 async function show(missing=false){
  if(!presenting)return;clear();const ticket=serial;if(!authorized||closed)return;
  status.textContent='角色載入中…';const row=release.entries.find(e=>e.id===era.value);loading=new AbortController();
  // Fail the real integrity-checked pool path without touching the release catalog.
  const entry=missing?{...row,asset:{...row.asset,sha256:'0'.repeat(64)},weaponAnimation:{...row.weaponAnimation,body:{...row.weaponAnimation.body,sha256:'0'.repeat(64)}}}:row;
  try{const next=await new WholeSuitActor(pool,entry,{tier:quality,signal:loading.signal}).init();
   if(closed||!presenting||!authorized||ticket!==serial){next.dispose();return;}
   actor=next;actor.draw({clip:'idle',elapsedMs:0});actor.canvas.dataset.suit=row.id;actor.canvas.style.cssText='position:absolute;left:calc(50% - 90px);top:20px;height:180px;width:180px;max-width:100%;object-fit:contain';preview.append(actor.canvas);placeholder.hidden=true;transform();animation.play('idle',visualNow);status.textContent='';$('[data-reload]').hidden=true;
  }catch{if(!closed&&ticket===serial){status.textContent='缺圖或驗證失敗，已安全回退；請重新載入。';$('[data-reload]').hidden=false;placeholder.textContent='角色暫時無法顯示';}}
  diagnostics();
 }
 era.addEventListener('change',async()=>{await show();if(previewMode!=='player'){updateSources();await selectSource();}else if($('[data-monster]').value==='mirror')await showMonster();},{signal:own.signal});
 $('[data-reload]').addEventListener('click',async()=>{if(await authorize()){void show();void showMonster();}},{signal:own.signal});
 const clips=['idle','attack','hit','dodge','return','defeat'],labels=['待機','攻擊','受擊','閃避','回位','死亡'];
 const enter=document.createElement('button');enter.type='button';enter.dataset.enter='';enter.textContent='進入預覽';
 const panel=document.createElement('section');panel.className='gm-preview-panel';panel.hidden=true;panel.setAttribute('aria-label','最大化動畫預覽');
 panel.innerHTML='<div class="gm-preview-top"><button type="button" data-back>返回選擇</button><span data-caption><small data-origin></small><span data-formal-name></span></span></div><div class="gm-preview-stage"></div><div class="gm-preview-controls"><select data-content aria-label="播放內容"></select><span data-speed-slot></span><button type="button" data-play>開始</button></div>';
 ui.append(enter,panel);panel.querySelector('.gm-preview-stage').append(preview);
 const speed=$('[data-speed]'),speedLabel=speed.parentElement;panel.querySelector('[data-speed-slot]').append(speed);speed.setAttribute('aria-label','速度');if(speedLabel.tagName==='LABEL')speedLabel.remove();
 const content=$('[data-content]');
 speed.addEventListener('change',()=>{const now=performance.now();if(lastTick!==null){visualNow+=Math.max(0,now-lastTick)*clockRate;lastTick=now;}clockRate=Number(speed.value);},{signal:own.signal});
 function configureContent(){
  content.replaceChildren();
  if(previewMode==='duel')content.append(new Option('自動連續戰鬥','auto'));
  else content.append(new Option('全部六動作循環','all'));
  for(const role of previewMode==='duel'?['player','monster']:[previewMode])clips.forEach((clip,i)=>{const option=new Option((previewMode==='duel'?(role==='player'?'玩家・':'怪物・'):'')+labels[i],role+':'+clip);option.title=clip==='attack'?'攻擊（短距離上挑斬）':labels[i];content.append(option);});
 }
 function caption(){
  const row=selectedMapping(),world=era.options[era.selectedIndex].text,projection=era.value==='era-higher'&&$('[data-source]').value==='arena';
  const name=previewMode==='player'?mirrorPlayerName:projection?'高維投影·'+row.name:row.name;
  const origin=previewMode==='player'?[world]:[world,sourceNames[projection?'arena':row.mode||$('[data-source]').value],row.culture,row.regionName||(row.region?'第'+row.region+'區':null)];
  $('[data-origin]').textContent=origin.filter(Boolean).join(' · ')+' · ';
  $('[data-origin]').title=origin.filter(Boolean).join(' · ');
  $('[data-formal-name]').textContent=name;
 }
 function drawIdle(){for(const a of [actor,monster])if(a&&!a.closed)a.draw({clip:'idle',elapsedMs:0});if(monster?.mirrored)applyDungeonEffects(monster.canvas,selectedMapping()?.visual);}
 function stop(){playing=false;sequence=0;phaseAt=visualNow;animation.cancel();monsterAnimation.cancel();$('[data-play]').textContent='開始';drawIdle();}
 function playPhase(){
  const value=content.value;let pc='idle',mc='idle';
  if(value==='auto'){
   const turn=Math.floor(sequence/2),attacker=turn%2===0?'player':'monster';
   const reaction=turn%3===2?'dodge':'hit';
   if(sequence%2===0){pc=attacker==='player'?'attack':reaction;mc=attacker==='monster'?'attack':reaction;}
   else {pc=attacker==='player'?'return':'idle';mc=attacker==='monster'?'return':'idle';}
  }else {const [role,clip]=value==='all'?[previewMode,clips[sequence%clips.length]]:value.split(':');if(role==='player')pc=clip;else mc=clip;}
  phaseDuration=pc==='idle'&&mc==='idle'?1600:PHASES.defeat[1];
  animation.play(pc,visualNow);monsterAnimation.play(mc,visualNow);phaseAt=visualNow;
 }
 function begin(){if(!presenting||!actor||(previewMode!=='player'&&!monster))return;stop();playing=true;playPhase();$('[data-play]').textContent='停止';start();}
 function previewState(active){if(window.parent!==window)window.parent.postMessage({type:'civilization3d:preview-state',active},location.origin);}
 function leave(){previewState(false);presenting=false;for(const p of pending.values()){clearTimeout(p.timer);p.resolve(authorized);}pending.clear();stop();cancelAnimationFrame(raf);raf=0;lastTick=null;clear();clearMonster();panel.hidden=true;ui.classList.remove('is-previewing');document.body.classList.remove('gm-preview-open');enter.focus();}
 $('[data-back]').addEventListener('click',leave,{signal:own.signal});
 $('[data-play]').addEventListener('click',()=>playing?stop():begin(),{signal:own.signal});
 content.addEventListener('change',()=>{stop();begin();},{signal:own.signal});
 enter.addEventListener('click',async()=>{
  if(!await authorize()||closed)return;if(previewMode!=='player'&&!selectedMapping()){status.textContent='請先選擇正式怪物身份。';return;}presenting=true;previewState(true);panel.hidden=false;ui.classList.add('is-previewing');document.body.classList.add('gm-preview-open');preview.style.visibility='hidden';enter.disabled=true;
  configureContent();caption();
  try{await show();if(previewMode!=='player')await showMonster();if(!presenting||closed)return;if(!actor||(previewMode!=='player'&&!monster))throw Error('preview-not-ready');duelLayout();drawIdle();preview.style.visibility='visible';$('[data-back]').focus();begin();}
  catch(error){if(presenting){leave();status.textContent='預覽載入失敗，請重新進入。';}}
  finally{if(!closed)enter.disabled=!authorized;}
 },{signal:own.signal});
 window.addEventListener('keydown',event=>{if(event.key==='Escape'&&presenting){event.preventDefault();event.stopImmediatePropagation();leave();}},{signal:own.signal,capture:true});
 function tick(now){
  raf=0;if(closed||document.hidden||!presenting)return;
  if(lastTick!==null)visualNow+=Math.max(0,now-lastTick)*clockRate;lastTick=now;
  if(now-lastAuth>2000)void authorize();
  // Finite owner clips use their contract endpoint; idle completes its breath cycle.
  // Keep the endpoint through the 500ms pause,
  // avoiding animationController's auto-idle transition before the final frame.
  if(playing&&visualNow-phaseAt>=phaseDuration+500){sequence++;playPhase();}
  if(actor&&authorized&&Math.floor(visualNow/33)!==lastFrame){
   lastFrame=Math.floor(visualNow/33);const elapsed=playing?Math.min(phaseDuration,visualNow-phaseAt):0;
   const ps=animation.snapshot().state,ms=monsterAnimation.snapshot().state;
   actor.canvas.dataset.clip=ps;actor.draw({clip:ps,elapsedMs:elapsed,rootMotion:true});
   if(monster){monster.draw({clip:ms,elapsedMs:elapsed,palette:selectedMapping()?.visual.palette||'original'});if(monster.mirrored)applyDungeonEffects(monster.canvas,selectedMapping()?.visual);}
  }
  raf=requestAnimationFrame(tick);
 }
 function clearMonster(){releaseMonsterAppearanceViewport(preview);monsterSerial++;monsterLoading?.abort();monsterLoading=null;monster?.canvas.remove();monster?.dispose();monster=null;monsterAnimation.cancel();}
 function duelLayout(){
  if(!presenting||!actor||(previewMode!=='player'&&!monster))return;
  layout=fitPreview(actor,monster,preview.clientWidth,preview.clientHeight,previewMode,selectedMapping()?.visual||{});
 }
 async function showMonster(){
  if(!presenting)return;$('[data-monster-status]').dataset.ready='false';clearMonster();duelLayout();const id=$('[data-monster]').value,ticket=monsterSerial;
  if(!id){$('[data-monster-status]').textContent='';diagnostics();return;}
  if(!authorized||closed)return;const entry=id==='mirror'?{name:'鏡像・'+mirrorPlayerName}:registry.assets.find(a=>a.assetId===id);
  $('[data-monster-status]').textContent='怪物載入中…';
  monsterLoading=new AbortController();
  try{const next=await (id==='mirror'?new WholeSuitActor(pool,release.entries.find(e=>e.id===era.value),{signal:monsterLoading.signal,tier:quality}):new MonsterActor(monsterPool,id,{signal:monsterLoading.signal,tier:quality,identity:$('[data-monster-identity]').value||null})).init();if(id==='mirror'){next.mirrored=true;next.canvas.dataset.mirror=era.value;}
   if(closed||!presenting||!authorized||ticket!==monsterSerial){next.dispose();return;}
   monster=next;preview.append(next.canvas);monsterAnimation.play('idle',visualNow);duelLayout();next.draw({clip:'idle',elapsedMs:0});if(next.mirrored)applyDungeonEffects(next.canvas,selectedMapping()?.visual);
   $('[data-monster-status]').textContent='';$('[data-monster-status]').dataset.ready='true';
  }catch(e){if(!closed&&ticket===monsterSerial){$('[data-reload]').hidden=false;$('[data-monster-status]').textContent=`${selectedMapping()?.name||'怪物'}：圖片載入失敗，請重新載入。`;}}
  diagnostics();
 }
 $('[data-monster]').addEventListener('change',()=>{$('[data-dungeon]').value='';sharedIdentities();void showMonster();},{signal:own.signal});
 $('[data-monster-identity]').addEventListener('change',()=>{const row=selectedMapping();if(row)$('[data-monster]').value=row.assetId;describeMonster();void showMonster();},{signal:own.signal});
 let measuredWidth=0,measuredHeight=0;const observer=new ResizeObserver(()=>{const w=preview.clientWidth,h=preview.clientHeight;if(w===measuredWidth&&h===measuredHeight)return;measuredWidth=w;measuredHeight=h;duelLayout();});observer.observe(preview);own.signal.addEventListener('abort',()=>observer.disconnect(),{once:true});
 const start=()=>{if(presenting&&!closed&&!document.hidden&&!raf)raf=requestAnimationFrame(tick);};
 const dispose=()=>{if(closed)return;closed=true;previewState(false);presenting=false;playing=false;document.body.classList.remove('gm-preview-open');clearMonster();monsterAnimation.dispose();monsterPool.dispose();cancelAnimationFrame(raf);raf=0;clear();animation.dispose();pool.dispose();own.abort();for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('disposed'));}pending.clear();signal?.removeEventListener('abort',dispose);ui.remove();};
 signal?.addEventListener('abort',dispose,{once:true});if(signal?.aborted){dispose();return {dispose};}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();cancelAnimationFrame(raf);raf=0;lastTick=null;}else if(presenting)void authorize().then(ok=>{if(ok)start();});},{signal:own.signal});
 ui.dataset.view='player';updateSources();setEnabled(false);await authorize();
 const api=Object.freeze({dispose,resize:transform,stats:()=>pool.stats(),diagnostics,
  testMissing:async()=>{if(await authorize())await show(true);},
  clearPreviewCache:async()=>{if(!await authorize())return;clear();clearMonster();pool.clear();monsterPool.clear();await show();await showMonster();}
 });
 ui.__previewTestApi=api;return api;
}
