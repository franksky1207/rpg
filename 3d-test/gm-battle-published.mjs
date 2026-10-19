/* Published GM-only 2.5D visual fallback.
 * Uses only approved published sprites and real published battle backgrounds.
 * This is NOT a combat calculator, enemy-art release, or game-state owner.
 */
import {WholeSuitActor} from './equipment-sprites-v1/actor.mjs?v=20261019-batch12-rising-cut1';
import {createSpritePool} from './equipment-sprites-v1/assets.mjs?v=20261019-batch12-rising-cut1';
import {release} from './era-player-sprites.mjs?v=20261019-batch12-rising-cut1';

export async function mount({host,signal,quality='medium'}={}){
 const own=new AbortController(),pool=createSpritePool();
 const pending=new Map();let closed=false,actor=null,frame=0,selected=null,catalog=release,actorSerial=0,authorized=false,guard=null;
 let playing=false,paused=false,step=0,elapsed=0,lastTime=0,speed=1,mode='formal',scene='normal-baseline';
 const cases=[['normal-baseline','普通怪'],['elite-baseline','菁英怪'],['boss-baseline','Boss'],['boss-player-defeat','Boss 擊敗玩家'],['elite-effects-owner-input','菁英效果']];
 const clips=['idle','attack','hit','dodge','attack','defeat'];
 const hpSamples={'normal-baseline':[100,80],'elite-baseline':[100,120],'boss-baseline':[100,170],'boss-player-defeat':[100,170],'elite-effects-owner-input':[100,120]};
 const doc=document.createElement('section');doc.className='gm-b-simulation gm-b-published';
 doc.innerHTML=`<div class="gm-b-controls">
  <label>角色來源<select data-b="source"><option value="formal">正式角色（唯讀）</option><option value="free">自由測試</option></select></label>
  <label data-b="suit-label" hidden>三紀元角色<select data-b="suit"><option value="era-galaxy">銀河</option><option value="era-universe">宇宙</option><option value="era-higher">高維</option></select></label>
  <button type="button" data-b="sync">重新同步角色</button>
  <label>速度<select data-b="speed"><option value="1">1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label>
  <label>敵方情境<select data-b="case">${cases.map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label>
  <label>預覽品質<select data-b="lod"><option value="low">省電</option><option value="medium" selected>平衡</option><option value="high">高畫質</option></select></label>
  <div class="gm-b-buttons">${[['play','播放'],['pause','暫停'],['resume','繼續'],['replay','重播'],['stop','停止']].map(([id,label])=>`<button type="button" data-b="${id}">${label}</button>`).join('')}</div>
 </div>
 <p class="gm-b-status" role="status" data-b="status">正在確認 GM 權限…</p>
 <p class="gm-b-warning">使用現有已發布的角色與戰場背景；敵方動畫素材目前未發布，因此只顯示敵方狀態，不冒充敵人圖像。以下 HP 為視覺測試示範，非正式戰鬥計算或收益。</p>
 <div class="gm-b-arena gm-b-published-arena" data-b="stage" aria-label="戰鬥動畫預覽">
  <div class="gm-b-scenery" aria-hidden="true"></div>
  <div class="gm-b-player" data-b="player-visual"><span>等待已核准的角色素材</span></div>
  <div class="gm-b-enemy" data-b="enemy-visual"><strong>敵方視覺素材尚未發布</strong><small>不以假圖代替正式怪物</small></div>
 </div>
 <div class="gm-b-hud">
  <div><b>玩家 · 示範</b><span data-b="player-hp">HP 100 / 100</span><progress data-b="player-bar" max="100" value="100"></progress><small>護盾依正式戰鬥狀態另行測試</small></div>
  <div><b data-b="enemy-name">普通怪 · 示範</b><span data-b="enemy-hp">HP 80 / 80</span><progress data-b="enemy-bar" max="80" value="80"></progress><small>沒有正式敵方圖集</small></div>
 </div>
 <p data-b="effect" aria-live="polite"></p>`;
 host.replaceChildren(doc);
 const $=name=>doc.querySelector('[data-b="'+name+'"]');
 const requests=new Set();
 const message=event=>{
  if(event.source!==window.parent||event.origin!==location.origin)return;
  const item=pending.get(event.data?.requestId);
  if(!item||event.data.type!==item.type+'-response')return;
  pending.delete(event.data.requestId);clearTimeout(item.timer);item.resolve(event.data);
 };
 window.addEventListener('message',message,{signal:own.signal});
 const request=type=>new Promise((resolve,reject)=>{
  if(closed||window.parent===window||new URLSearchParams(location.search).get('embedded')!=='1'){reject(Error('GM authorization required'));return;}
  const id=crypto.randomUUID(),timer=setTimeout(()=>{pending.delete(id);reject(Error('GM request timed out'));},5000);
  pending.set(id,{type,resolve,reject,timer});window.parent.postMessage({type,requestId:id},location.origin);
 });
 const setStatus=value=>{$('status').textContent=value;};
 const stopActor=()=>{actorSerial++;for(const a of requests)a.abort();actor?.dispose();actor=null;$('player-visual').replaceChildren();const notice=document.createElement('span');notice.textContent='無符合條件的已發布角色';$('player-visual').append(notice);};
 const reset=()=>{playing=false;paused=false;step=0;elapsed=0;lastTime=0;refreshHP();};
 const refreshHP=()=>{
  const [playerMax,enemyMax]=hpSamples[scene];const p=scene==='boss-player-defeat'?Math.max(0,playerMax-step*21):Math.max(0,playerMax-step*7),e=Math.max(0,enemyMax-step*23);
  $('player-hp').textContent=`HP ${p} / ${playerMax}（示範）`;$('player-bar').max=playerMax;$('player-bar').value=p;
  $('enemy-hp').textContent=`HP ${e} / ${enemyMax}（示範）`;$('enemy-bar').max=enemyMax;$('enemy-bar').value=e;
  $('enemy-name').textContent=cases.find(([id])=>id===scene)?.[1]+' · 示範';
  $('effect').textContent=step?['','攻擊動作','受擊動作','閃避動作','攻擊動作','播放完成'][Math.min(5,step)]:'選擇情境並按播放。';
 };
 const loadActor=async row=>{
  stopActor();selected=row||null;
  const ticket=actorSerial,id=row?.id;if(!authorized||!id){setStatus(authorized?'目前沒有符合的已發布角色。':'需要 GM 授權，預覽已停用。');return;}
  const entry=catalog?.entries?.find(e=>e.id===id&&e.gmPreviewAllowed===true);
  if(!entry){setStatus('尚未製作此角色，未展示替代人物。');return;}
  const load=new AbortController();requests.add(load);
  try{
   const a=await new WholeSuitActor(pool,entry,{signal:load.signal,tier:quality}).init();
   if(closed||!authorized||ticket!==actorSerial||selected?.id!==id){a.dispose();return;}
   actor=a;$('player-visual').replaceChildren(a.canvas);
   a.canvas.setAttribute('aria-label',id.toUpperCase()+' 現有測試角色');
   setStatus(id.toUpperCase()+' 角色已載入；沙盒只展示畫面，不寫入正式資料。');
  }catch{if(!closed&&ticket===actorSerial)setStatus('角色素材載入失敗，已安全回退。');}
  finally{requests.delete(load);}
 };
 let epoch=0;
 async function synchronize(){
  const ticket=++epoch;authorized=false;stopActor();reset();
  try{
   const permission=await request('civilization3d:sprite-auth');
   if(closed||ticket!==epoch)return;
   if(permission.authorized!==true)throw Error('denied');
   authorized=true;
   if(mode==='free'){
    $('suit-label').hidden=false;
    await loadActor(catalog.entries.find(row=>row.id===$('suit').value));return;
   }
   $('suit-label').hidden=true;
   const formal=await request('civilization3d:sprite-snapshot');
   if(closed||ticket!==epoch)return;
   if(formal.authorized!==true)throw Error('no formal authorization');
   const era=formal.eraVisualId||({1:'galaxy',2:'universe',3:'higher'})[formal.appearance?.world];
   const row=catalog.entries.find(e=>e.id==='era-'+era);
   await loadActor(row);
  }catch{if(!closed&&ticket===epoch){authorized=false;stopActor();setStatus('需要 GM 授權，或正式角色目前沒有可顯示素材。');}}
 }
 const handlers=[];
 const listen=(el,type,fn)=>{el.addEventListener(type,fn);handlers.push(()=>el.removeEventListener(type,fn));};
 listen($('source'),'change',()=>{mode=$('source').value;synchronize();});
 listen($('suit'),'change',()=>{if(mode==='free')synchronize();});
 listen($('sync'),'click',synchronize);
 listen($('case'),'change',()=>{scene=$('case').value;reset();});
 listen($('speed'),'change',()=>{speed=Number($('speed').value)||1;});
 listen($('play'),'click',()=>{reset();playing=true;setStatus('視覺示範播放中，沒有戰鬥計算。');});
 listen($('pause'),'click',()=>{if(playing){playing=false;paused=true;}});
 listen($('resume'),'click',()=>{if(paused){playing=true;paused=false;lastTime=0;}});
 listen($('replay'),'click',()=>{reset();playing=true;});
 listen($('stop'),'click',()=>{reset();setStatus('視覺示範已停止。');});
 function tick(now){
  if(closed)return;
  const dt=lastTime?Math.min(100,now-lastTime):0;lastTime=now;
  if(playing){elapsed+=dt*speed;while(elapsed>=850&&step<5){elapsed-=850;step++;refreshHP();}if(step>=5){playing=false;setStatus('示範播放完成，未發放任何收益。');}}
  actor?.draw({clip:clips[Math.min(step,5)],elapsedMs:Math.max(0,elapsed),rootMotion:true});
  frame=requestAnimationFrame(tick);
 }
 function dispose(){
  if(closed)return;closed=true;clearInterval(guard);cancelAnimationFrame(frame);++epoch;for(const a of requests)a.abort();
  for(const item of pending.values()){clearTimeout(item.timer);item.reject(Error('disposed'));}pending.clear();
  signal?.removeEventListener('abort',dispose);for(const f of handlers)f();own.abort();stopActor();pool.dispose();host.replaceChildren();
 }
 signal?.addEventListener('abort',dispose,{once:true});
 if(signal?.aborted){dispose();return {dispose};}
 // Heartbeat is an authorization check only; it never drives the battle animation.
 guard=setInterval(async()=>{if(closed||document.hidden||!authorized)return;try{const response=await request('civilization3d:sprite-auth');if(!response.authorized){authorized=false;stopActor();pool.clear();reset();setStatus('GM 授權已失效，預覽停止。');}}catch{if(!closed){authorized=false;stopActor();reset();}}},2500);
 refreshHP();frame=requestAnimationFrame(tick);
 await synchronize();
 return {dispose,resize(){},setQuality(value){quality=value;if(authorized)synchronize();},
  diagnostics:()=>({mode:'published-GM-visual',authorized,playing,paused,step,noRewards:true,noSave:true,enemyAtlasAvailable:false})};
}
