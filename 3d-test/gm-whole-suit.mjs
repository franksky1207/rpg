// Authorized presentation only. Uses B's visual samples and WholeSuitActor draw(plan).
import {WholeSuitActor} from './equipment-sprites-v1/actor.mjs';
import {createSpritePool} from './equipment-sprites-v1/assets.mjs';
import {animationController} from './equipment-sprites-v1/animation.mjs';
const EPOCH={galaxy:'銀河紀元',universe:'宇宙紀元',higher:'高維紀元'};
const WORLD={galaxy:1,universe:2,higher:3};
const SLOTS=['weapon','helmet','armor','shoes','accessory'];
export function formalSuit(snapshot,sets){
 if(snapshot?.source!=='formal'||snapshot.version!==2)return null;
 // An entire suit must actually be equipped. A mixed loadout never borrows a full suit.
 const found=sets.filter(row=>SLOTS.every(slot=>{const item=snapshot.equipment?.[slot];return item?.present===true&&item.world===WORLD[row.epoch]&&item.name===row.equipmentNames[slot];}));
 return found.length===1?found[0]:null;
}
export async function mount({host,signal,quality='medium'}={}){
 const own=new AbortController(),pool=createSpritePool(),animation=animationController();
 let closed=false,actor=null,loadAbort=null,serial=0,frame=0,started=0,lastClip='idle',lastAction='idle',authorized=false,mode='formal',catalog=null,selected=null,lastAuth=0,authPending=false;
 const pending=new Map();
 host.innerHTML='<section class="gm-suit"><div class="gm-suit-modes"><button type="button" data-mode="formal">正式角色</button><button type="button" data-mode="free">自由展示</button></div><p class="gm-suit-help">展示不會變更裝備、能力或存檔。</p><div class="gm-suit-selects"><label>紀元<select data-pick="epoch"></select></label><label>區域<select data-pick="region"></select></label><label>正式套裝<select data-pick="suit"></select></label></div><p class="gm-suit-name"></p><p class="gm-suit-status" role="status">正在確認 GM 權限…</p><div class="gm-suit-preview" aria-label="2.5D 角色預覽"><p class="gm-suit-placeholder">等待角色</p></div><div class="gm-suit-actions"></div></section>';
 const ui=host.firstElementChild,$=s=>ui.querySelector(s),preview=$('.gm-suit-preview'),status=$('.gm-suit-status'),name=$('.gm-suit-name'),placeholder=$('.gm-suit-placeholder'),selects=$('.gm-suit-selects'),actions=$('.gm-suit-actions');
 const buttons=[];
 for(const [clip,label] of [['idle','待機'],['attack','攻擊'],['hit','受擊'],['dodge','閃避'],['defeat','死亡'],['replay','重新播放'],['reset','重置']]){
  const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.action=clip;b.disabled=true;b.addEventListener('click',()=>{if(!authorized||!actor)return;if(clip==='reset'){lastAction='idle';animation.cancel();}else if(clip!=='replay')lastAction=clip;started=performance.now();animation.play(lastAction,started);lastClip=lastAction;}, {signal:own.signal});actions.append(b);buttons.push(b);
 }
 const enable=value=>buttons.forEach(b=>b.disabled=!value);
 const clear=()=>{serial++;loadAbort?.abort();loadAbort=null;actor?.dispose();actor=null;animation.cancel();enable(false);preview.querySelector('canvas')?.remove();placeholder.hidden=false;};
 const request=type=>new Promise((resolve,reject)=>{
  if(closed||window.parent===window||new URLSearchParams(location.search).get('embedded')!=='1'){reject(Error('unauthorized'));return;}
  const requestId=crypto.randomUUID(),timer=setTimeout(()=>{pending.delete(requestId);reject(Error('authorization-timeout'));},5000);
  pending.set(requestId,{resolve,reject,timer,type});window.parent.postMessage({type,requestId},location.origin);
 });
 const listener=event=>{
  if(event.source!==window.parent||event.origin!==location.origin)return;
  const p=pending.get(event.data?.requestId);if(!p||event.data.type!==p.type+'-response')return;
  clearTimeout(p.timer);pending.delete(event.data.requestId);p.resolve(event.data);
 };
 window.addEventListener('message',listener,{signal:own.signal});
 const revoke=()=>{authorized=false;clear();status.textContent='需要 GM 授權，請返回遊戲重新開啟。';name.textContent='';selects.hidden=true;for(const b of ui.querySelectorAll('[data-mode]'))b.disabled=true;};
 async function authorize(){
  if(authPending||closed)return authorized;authPending=true;
  try{const r=await request('civilization3d:sprite-auth');if(closed)return false;authorized=r.authorized===true;if(!authorized)revoke();else for(const b of ui.querySelectorAll('[data-mode]'))b.disabled=false;return authorized;}
  catch{if(!closed)revoke();return false;}finally{authPending=false;lastAuth=performance.now();}
 }
 async function show(row){
  if(!authorized||closed){if(!closed)revoke();return;}
  clear();selected=row;const ticket=serial;name.textContent=row?`${row.id.toUpperCase()}｜${row.equipmentNames.armor}整套 · ${EPOCH[row.epoch]} · ${row.regionOrBoss}`:'正式角色尚未穿齊同一套裝';
  const e=catalog?.entries.find(e=>e.id===row?.id);
  if(!row||!e||e.gmPreviewAllowed!==true){status.textContent=row?'待製作：目前沒有可用角色素材。':'回退：保留目前實穿外觀，請穿齊同一套裝後重新同步。';placeholder.textContent='尚無可展示的角色';return;}
  status.textContent='角色載入中…';placeholder.textContent='正在載入';loadAbort=new AbortController();
  try{
   const next=await new WholeSuitActor(pool,e,{tier:quality,signal:loadAbort.signal}).init();
   if(closed||ticket!==serial||!authorized){next.dispose();return;}
   actor=next;actor.canvas.setAttribute('aria-label',row.id.toUpperCase()+' 透明整套角色');preview.append(actor.canvas);placeholder.hidden=true;status.textContent='已完成：可操作五種動畫。';enable(true);started=performance.now();lastAction=lastClip='idle';animation.play('idle',started);
  }catch{if(!closed&&ticket===serial){status.textContent='載入失敗，已安全回退。可按重新載入再試一次。';placeholder.textContent='角色暫時無法顯示';}}
 }
 const picks={epoch:$('[data-pick="epoch"]'),region:$('[data-pick="region"]'),suit:$('[data-pick="suit"]')};
 const options=(select,rows)=>{select.replaceChildren(...rows.map(([value,label])=>{const o=document.createElement('option');o.value=value;o.textContent=label;return o;}));};
 function regions(){if(mode!=='free'||!authorized)return;const rows=catalog.sets.filter(r=>r.epoch===picks.epoch.value);options(picks.region,[...new Set(rows.map(r=>r.regionOrBoss.split(' → ')[0]))].map(s=>[s,s]));suits();}
 function suits(){if(mode!=='free'||!authorized)return;const rows=catalog.sets.filter(r=>r.epoch===picks.epoch.value&&r.regionOrBoss.split(' → ')[0]===picks.region.value);options(picks.suit,rows.map(r=>[r.id,`${r.id.toUpperCase()} · ${r.equipmentNames.armor}整套${catalog.entries.some(e=>e.id===r.id)?'':'（待製作）'}`]));show(rows[0]);}
 async function synchronize(){
  clear();name.textContent='';selects.hidden=mode!=='free';
  for(const b of ui.querySelectorAll('[data-mode]'))b.setAttribute('aria-pressed',String(b.dataset.mode===mode));
  const intent=serial;if(!await authorize()||closed||intent!==serial)return;
  if(!catalog){status.textContent='角色資料無法載入，請返回後重試。';return;}
  if(mode==='free'){options(picks.epoch,Object.entries(EPOCH));regions();return;}
  status.textContent='正在同步正式角色…';const ticket=serial;
  try{const r=await request('civilization3d:sprite-snapshot');if(closed||ticket!==serial||mode!=='formal')return;if(!r.authorized){revoke();return;}await show(formalSuit(r.appearance,catalog.sets));}
  catch{if(!closed&&ticket===serial){clear();status.textContent='正式角色同步失敗，已回退；請重新同步。';}}
 }
 for(const b of ui.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>{mode=b.dataset.mode;synchronize();},{signal:own.signal});
 const retry=document.createElement('button');retry.type='button';retry.textContent='重新載入／同步';retry.addEventListener('click',()=>{if(mode==='formal')synchronize();else {const ticket=serial,row=selected;authorize().then(ok=>{if(ok&&!closed&&mode==='free'&&serial===ticket)show(row);});}},{signal:own.signal});actions.append(retry);
 picks.epoch.addEventListener('change',regions,{signal:own.signal});picks.region.addEventListener('change',suits,{signal:own.signal});picks.suit.addEventListener('change',()=>{if(mode==='free'&&authorized)show(catalog.sets.find(r=>r.id===picks.suit.value));},{signal:own.signal});
 function tick(now){
  if(closed)return;
  if(now-lastAuth>2000)authorize();
  if(actor&&authorized){const s=animation.sample(now);if(s.clip!==lastClip){started=now;lastClip=s.clip;}actor.draw({clip:s.clip,elapsedMs:Math.max(0,now-started),rootMotion:true});}
  frame=requestAnimationFrame(tick);
 }
 const dispose=()=>{if(closed)return;closed=true;cancelAnimationFrame(frame);clear();animation.dispose();pool.dispose();own.abort();for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('disposed'));}pending.clear();signal?.removeEventListener('abort',dispose);ui.remove();};
 signal?.addEventListener('abort',dispose,{once:true});if(signal?.aborted){dispose();return {dispose};}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);animation.cancel();}else if(!closed){started=performance.now();lastClip='idle';authorize();frame=requestAnimationFrame(tick);}},{signal:own.signal});
 try{if(await authorize()){const response=await fetch(new URL('../assets/gm-equipment-2_5d/v1/catalog.json',import.meta.url),{signal:own.signal,cache:'no-store'});if(!response.ok)throw Error();catalog=await response.json();if(catalog.schema!=='cw.gm.whole-suit.v1'||catalog.formalBattleEnabled!==false||catalog.sets.length!==210)throw Error();await synchronize();}}
 catch{if(!closed){clear();status.textContent='角色資料載入失敗，已安全回退。請返回後重試。';}}
 if(!closed)frame=requestAnimationFrame(tick);
 return {dispose,resize(){},setQuality(){},stats:()=>pool.stats()};
}
