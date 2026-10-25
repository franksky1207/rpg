/* GM-only adapter for the existing B comparison Renderer/Fixture/Playback.
 * No formal combat, audio, storage or cloud owner is imported or called. */
// GM-only visual estimate from recorded owner-fixture damage; never an authoritative per-hit HP snapshot.
function displayHp(frame){
 const start=frame.input?.computed?.start;
 if(!start)return frame.knownState;
 if(frame.phase==='outcome'||frame.phase==='closed'||frame.mode==='completed'||frame.mode==='background')return frame.input.computed.final;
 const state={player:{...start.player},enemy:{...start.enemy}};
 // Timeline is one initial idle row, then six phases per combat-action.
 // Use cursor instead of sourceRef: idle frames have no ref but must retain previous damage.
 let row=1;
 for(const event of frame.input.events){
  if(event.type!=='combat-action'||event.data.sourceType==='combatSafety'){row++;continue;}
  const appliedAt=row+4;row+=6;
  if(frame.cursor<appliedAt)break;
  const d=event.data,who=d.target;
  if(!['player','enemy'].includes(who))continue;
  const damage=d.actualDamage;
  if(Number.isFinite(damage)&&damage>=0)state[who].hp=Math.max(0,state[who].hp-damage);
  if(Number.isFinite(d.shieldAbsorbed)&&d.shieldAbsorbed>0&&Number.isFinite(state[who].shield))
   state[who].shield=Math.max(0,state[who].shield-d.shieldAbsorbed);
  if(['player','enemy'].includes(d.actor)&&Number.isFinite(d.healed)&&d.healed>0)
   state[d.actor].hp=Math.min(state[d.actor].maxHp,state[d.actor].hp+d.healed);
 }
 return state;
}

import {WholeSuitActor} from './equipment-sprites-v1/actor.mjs?v=20261019-batch12-rising-cut1';
import {createSpritePool} from './equipment-sprites-v1/assets.mjs?v=20261015-thrust1';
import './armor-selection.js?v=20261015-phase5';
export async function mount({host,signal,quality='medium'}){
 const root=new URL('../development/hybrid-comparison/',import.meta.url);
 let parts;
 try{
  parts=await Promise.all([
  import(new URL('fixture-input.mjs?v=20261015-phase5&issue106=20261025-rewards',root)),import(new URL('playback.mjs?v=20261015-phase5&issue106=20261025-rewards',root)),
  import(new URL('t2b3-v1/renderer.mjs?v=20261015-thrust1&issue106=20261025-rewards',root)),import(new URL('t2b3-v1/contract.mjs?v=20261015-thrust1',root))]);
 }catch(error){
  if(signal.aborted)throw error;
  // Published Pages explicitly excludes development fixture sources.
  // Use an authorized, truthful 2.5D viewer based only on shipped assets;
  // never publish raw dev originals, owner fixtures or unapproved enemies.
  const published=await import('./gm-battle-published.mjs?v=20261019-batch12-rising-cut1&vbatch7sprite=20261018-lightweight1');
  return published.mount({host,signal,quality});
 }
 const [{loadData,selectInput},{Playback,bindRenderer},{createRenderer,diagnostics},{elapsedClock}]=parts;
 signal.throwIfAborted();
 host.innerHTML=`<div class="gm-b-simulation"><div class="gm-b-controls">
 <label>角色來源<select data-b="source"><option value="formal">正式角色</option><option value="free">自由測試</option></select></label><label data-b="suit-label" hidden>套裝選擇<select data-b="suit"><option value="g005">G005 · 生化隔離甲</option><option value="g007">G007 · 自律護衛甲</option><option value="g018">G018 · 環軌防護甲</option></select></label><button type="button" data-b="sync">重新同步角色</button><span data-b="appearance" role="status"></span>
 <label>速度<select data-b="speed"><option value="1">1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label><label>基準戰<select data-b="case"><option value="normal-baseline">普通怪基準戰</option><option value="elite-baseline">菁英怪基準戰</option><option value="boss-baseline">Boss 基準戰</option><option value="boss-player-defeat">Boss 擊敗玩家</option><option value="elite-effects-owner-input">菁英特殊效果測試</option></select></label>
 <label>五槽裝備<select data-b="equipment"></select></label><label>預覽品質<select data-b="lod"><option value="low">省電</option><option value="medium">平衡</option><option value="high">高畫質</option></select></label>
 <label>動作<select data-b="clip"><option value="source">跟隨戰鬥</option>${['idle','attack','hit','dodge','return','defeat'].map(x=>`<option value="${x}">${({idle:'待機',attack:'攻擊',hit:'受擊',dodge:'閃避',return:'回位',defeat:'倒地'})[x]}</option>`).join('')}</select></label><label>畫格<input data-b="time" type="range" min="0" max="700" step="33.333" value="0" disabled></label>
 <div class="gm-b-buttons">${[['play','播放'],['pause','暫停'],['resume','繼續'],['replay','重播'],['stop','停止']].map(([x,n])=>`<button type="button" data-b="${x}">${n}</button>`).join('')}</div></div>
 <p class="gm-b-status" data-b="status" role="status">正在驗證沙盒素材…</p><div class="gm-b-arena" data-b="stage"></div>
 <div class="gm-b-hud">${['player','enemy'].map(x=>`<div><b data-b="${x}-name">${x==='player'?'測試玩家':'測試敵人'}</b><span data-b="${x}-hp"></span><progress data-b="${x}-bar" max="1" value="1"></progress><small data-b="${x}-shield"></small></div>`).join('')}</div>
 <p data-b="effect"></p><details><summary>裝備來源與效果檢視</summary><ul data-b="slots"></ul><p>GM 沙盒；使用目前已有的戰鬥素材。逐擊 HP 未收錄，過程血量由記錄傷害推算，僅供視覺檢查；結束值採樣本快照，不代表正式戰鬥結算。</p></details></div>`;
 const $=name=>host.querySelector(`[data-b="${name}"]`),cleanups=[];
 const spritePool=createSpritePool(),pending=new Map();let catalog=null,spriteEntry=null,appearanceSerial=0,authorized=false;
 let closed=false,pack=null,renderer=null,binding=null,bound=null,failed=false,lastFrame=null;
 const listen=(target,event,fn)=>{target.addEventListener(event,fn);cleanups.push(()=>target.removeEventListener(event,fn));};
 const status=text=>{$('status').textContent=text;};
 const slots=['武器','頭盔','鎧甲','鞋子','飾品'];
 for(let mask=0;mask<32;mask++)$('equipment').add(new Option(mask===0?'全空槽':mask===31?'G007 五槽全穿':slots.filter((_,i)=>mask&(1<<i)).join('＋'),'g007-subset-'+mask));
 $('equipment').add(new Option('G006／G007 混穿＋空槽（缺材明示）','mixed-g006-g007-empty-accessory'));
 $('equipment').value='g007-subset-31';$('lod').value=quality;
 const selection=()=>({scheme:'B',caseId:$('case').value,variantId:$('equipment').value,lod:$('lod').value});
 const controls=()=>{for(const name of ['play','pause','resume','replay','stop']){const disabled=closed||!pack||!!binding||playback.hidden||(name==='pause'&&playback.mode!=='playing')||(name==='resume'&&playback.mode!=='paused');if($(name).disabled!==disabled)$(name).disabled=disabled;}};
 const readClock=()=>elapsedClock({phase:playback.phase,mode:playback.mode,due:playback.due,remaining:playback.remaining,now:playback.clock.now(),eventId:playback.sourceRef?.eventId,generation:playback.generation});
 const inspection=()=>({clip:$('clip').value,timeMs:$('clip').value==='source'?null:Number($('time').value)});
 let rate=1,realAt=performance.now(),virtualAt=realAt;
 const clock={now:()=>virtualAt+(performance.now()-realAt)*rate,set:(fn,ms)=>setTimeout(fn,ms/rate),clear:id=>clearTimeout(id)};
 const playback=new Playback({clock,onFrame:frame=>{
  if(closed)return;lastFrame=frame;
  if(frame.input){$('player-name').textContent=frame.input.playerName+'（沙盒）';$('enemy-name').textContent=frame.input.representative.name;
   for(const role of ['player','enemy']){const s=displayHp(frame)[role];$(role+'-hp').textContent=`HP ${s.hp.toLocaleString()} / ${s.maxHp.toLocaleString()}${frame.phase==='outcome'||frame.mode==='completed'?'':'（模擬）'}`;$(role+'-bar').max=s.maxHp;$(role+'-bar').value=s.hp;$(role+'-shield').textContent=s.shield===null?'護盾來源未收錄':`護盾 ${s.shield}`;}
   const d=frame.sourceEvent?.data;const names={attack:'攻擊',dodge:'閃避',combo:'連擊',counter:'反擊',drain:'汲取',mark:'印記'};
   $('effect').textContent=d?`${d.actor==='player'?'玩家':'敵人'} ${names[d.sourceType]||''}${d.actualDamage===undefined?'':` 傷害 ${d.actualDamage}`}${d.healed===undefined?'':` 回復 ${d.healed}`}`:frame.mode==='completed'?'播放完成；未發放收益':'';
  }controls();
 }});
 async function playerFactory(tier,signal){
  const entry=spriteEntry;if(!entry)return null;
  const load=new AbortController(),cancel=()=>load.abort();signal.addEventListener('abort',cancel,{once:true});if(signal.aborted)cancel();
  const timer=setTimeout(cancel,5000);
  try{return await new WholeSuitActor(spritePool,entry,{tier,signal:load.signal}).init();}
  catch(error){if(signal.aborted)throw error;$('appearance').textContent='角色載入失敗，改用既有戰鬥外觀';return null;}
  finally{clearTimeout(timer);signal.removeEventListener('abort',cancel);}
 }
 async function ready(){
  if(closed||playback.hidden||!pack)return false;
  if(bound===playback.id&&renderer&&!failed)return true;
  if(binding){await binding;return closed?false:ready();}
  if(closed)return false;
  if(bound===playback.id&&renderer&&!failed)return true;
  const id=playback.id;let candidate=null;failed=false;status('正在載入 B 戰鬥畫面…');
  binding=bindRenderer(playback,async context=>{candidate=await createRenderer(context,{stage:$('stage'),readClock,inspection,playerFactory,onError:error=>{failed=true;status('視覺暫不可用：'+error.message+'；可按播放重試。');}});return candidate;});controls();
  try{const result=await binding;if(closed||playback.id!==id)return false;if(!result.ok){failed=true;status('B 畫面載入失敗；可按播放重試。');return false;}renderer=candidate;bound=id;$('stage').querySelector('canvas')?.setAttribute('aria-label','戰鬥動畫模擬');status('戰鬥動畫測試｜靜音、不寫入正式角色或存檔');return true;}
  finally{binding=null;if(!closed)controls();}
 }
 function choose(){if(!pack||closed)return;renderer=null;bound=null;failed=false;const selected=selection(),input=selectInput(pack,selected);playback.select(input,selected);$('slots').replaceChildren(...input.equipment.map((d,i)=>{const li=document.createElement('li');li.textContent=`${slots[i]}：${!d.present?'空槽':d.name+(d.assetKind==='equipment-glb'?'':'（素材 unavailable）')}`;return li;}));ready().catch(error=>{if(!closed)status(error.message);});}
 async function play(replay=false){if(!pack||closed)return;if(replay||failed||['completed','cancelled'].includes(playback.mode))choose();const id=playback.id;if(await ready()&&!closed&&playback.id===id)playback.play();}
 for(const name of ['case','equipment','lod'])listen($(name),'change',choose);
 for(const name of ['play','replay'])listen($(name),'click',()=>play(name==='replay').catch(error=>{if(!closed)status(error.message);}));
 listen($('pause'),'click',()=>playback.pause());listen($('resume'),'click',()=>playback.play());listen($('stop'),'click',()=>{playback.stop();renderer=null;bound=null;status('已停止，動畫及 GPU 資源已釋放');});
 listen($('clip'),'change',()=>{$('time').disabled=$('clip').value==='source';});
 listen($('speed'),'change',()=>{const playing=playback.mode==='playing';if(playing)playback.pause();virtualAt=clock.now();realAt=performance.now();rate=Number($('speed').value);if(playing)playback.play();});
 const request=type=>new Promise((resolve,reject)=>{if(window.parent===window||new URLSearchParams(location.search).get('embedded')!=='1'){reject(Error('unauthorized'));return;}const requestId=crypto.randomUUID(),timer=setTimeout(()=>{pending.delete(requestId);reject(Error('timeout'));},5000);pending.set(requestId,{type,resolve,reject,timer});window.parent.postMessage({type,requestId},location.origin);});
 listen(window,'message',event=>{if(event.source!==window.parent||event.origin!==location.origin)return;const p=pending.get(event.data?.requestId);if(!p||event.data.type!==p.type+'-response')return;pending.delete(event.data.requestId);clearTimeout(p.timer);p.resolve(event.data);});
 async function appearance(){
  const ticket=++appearanceSerial,mode=$('source').value,id=$('suit').value;
  spriteEntry=null;$('suit-label').hidden=mode!=='free';$('appearance').textContent='正在同步角色…';
  // Retire old resources synchronously; delayed replies must not preserve free actor.
  if(pack){choose();$('stage').replaceChildren();}
  if(mode==='legacy'){$('appearance').textContent='既有五槽技術測試（不改正式裝備）';return;}
  try{
   const auth=await request('civilization3d:sprite-auth');if(closed||ticket!==appearanceSerial)return;authorized=auth.authorized===true;if(!authorized)throw Error('authorization');
   if(!catalog){const response=await fetch(new URL('../assets/gm-equipment-2_5d/v1/catalog.json',import.meta.url),{signal});if(!response.ok)throw Error('catalog');catalog=await response.json();if(catalog.schema!=='cw.gm.whole-suit.v1'||catalog.sets.length!==210)throw Error('catalog');}
   let selected=id;
   if(mode==='formal'){const response=await request('civilization3d:sprite-snapshot');if(closed||ticket!==appearanceSerial)return;if(!response.authorized)throw Error('authorization');selected=globalThis.CivilizationArmorSelection.select(response.appearance,catalog.sets)?.id;}
   if(closed||ticket!==appearanceSerial||$('source').value!==mode)return;
   spriteEntry=catalog.entries.find(e=>e.id===selected&&e.gmPreviewAllowed===true)||null;
   $('appearance').textContent=spriteEntry?`${spriteEntry.id.toUpperCase()} · ${spriteEntry.formalIdentity.equipmentNames.armor}（${mode==='formal'?'唯讀快照':'自由測試'}）`:'無對應角色素材，改用既有戰鬥外觀';
   if(pack){choose();$('stage').replaceChildren();}
  }catch{if(!closed&&ticket===appearanceSerial){spriteEntry=null;authorized=false;$('appearance').textContent='無可用正式角色或GM授權，改用既有戰鬥外觀';if(pack){choose();$('stage').replaceChildren();}}}
 }
 listen($('source'),'change',appearance);listen($('suit'),'change',()=>{if($('source').value==='free')appearance();});listen($('sync'),'click',appearance);
 // Authorization heartbeat only; never advances animation, playback or combat.
 let authAt=0,checking=false;
 const authTimer=setInterval(async()=>{if(closed||document.hidden||checking||!spriteEntry||performance.now()-authAt<2000)return;checking=true;authAt=performance.now();const ticket=appearanceSerial;try{const result=await request('civilization3d:sprite-auth');if(!result.authorized&&!closed&&ticket===appearanceSerial){++appearanceSerial;spriteEntry=null;authorized=false;$('appearance').textContent='GM授權已失效，角色已釋放';choose();$('stage').replaceChildren();}}catch{if(!closed&&ticket===appearanceSerial){++appearanceSerial;spriteEntry=null;authorized=false;choose();$('stage').replaceChildren();}}finally{checking=false;}},2000);
 listen(document,'visibilitychange' ,()=>{playback.visibility(document.hidden);if(!document.hidden){renderer=null;bound=null;status('已返回；不重播過期動作，按重播重新開始。');}});
 function dispose(){if(closed)return;closed=true;++appearanceSerial;clearInterval(authTimer);for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('disposed'));}pending.clear();playback.dispose();spritePool.dispose();pack=null;renderer=null;lastFrame=null;for(const cleanup of cleanups.splice(0))cleanup();signal.removeEventListener('abort',dispose);if(host.__gmBattleSimulation===api)delete host.__gmBattleSimulation;host.replaceChildren();}
 signal.addEventListener('abort',dispose,{once:true});
 const api=Object.freeze({dispose,setQuality:value=>{if(closed)return;$('lod').value=value;choose();},diagnostics:()=>({scheme:'B',closed,failed,rendererLoading:!!binding,playback:playback.diagnostics(),renderer:diagnostics(),current:renderer?.diagnostics(),sprites:spritePool.stats(),selectedSuit:spriteEntry?.id||null,source:$('source').value,speed:rate,frame:lastFrame,canCommit:false,canWriteCloud:false})});
 host.__gmBattleSimulation=api;
 try{pack=await loadData({signal,base:root});signal.throwIfAborted();choose();await appearance();}catch(error){if(!closed)status('素材驗證失敗：'+error.message);}
 return api;
}
