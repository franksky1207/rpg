/* Offline visual clock. No formal engine, state, storage, audio or rendering. */
import {copyFrozen,isVerifiedInput} from './fixture-input.mjs?v=20261012-t2b1-v1';
const realm=globalThis.crypto.randomUUID?.()||[...globalThis.crypto.getRandomValues(new Uint32Array(4))].map(n=>n.toString(16)).join('-');
let instances=0;
const nativeClock={now:()=>performance.now(),set:(fn,ms)=>setTimeout(fn,ms),clear:id=>clearTimeout(id)};
export function outcomeText(input){const {final,result}=input.computed;if(final.player.hp===0)return '玩家 HP 歸零｜僅計算結果，未提交死亡懲罰或收益';if(final.enemy.hp===0)return '敵人 HP 歸零｜僅計算結果，沒有正式收益';if(result.actionBudgetReached)return '動作上限中止｜雙方存活，不是已結算敗北';return '僅有計算快照｜未提交結算';}
function timeline(input){
 const rows=[{phase:'idle',ms:0}];
 for(const e of input.events){
  if(e.type==='combat-action'&&e.data.sourceType!=='combatSafety'){
   const p=input.controls.presentationScript;
   rows.push({phase:'prepare',ms:p.prepareMs,ref:e},{phase:'approach',ms:p.impactAtMs-p.prepareMs,ref:e},{phase:'strike',ms:100,ref:e},{phase:'known-effect',ms:p.oneKnownActionMs-p.impactAtMs-100-p.returnMs,source:e,ref:e},{phase:'return',ms:p.returnMs,ref:e},{phase:'idle',ms:0});
  }else if(e.type==='actor-defeated')rows.push({phase:'defeat',ms:700,source:e,ref:e});
  else rows.push({phase:e.type==='outcome'?'outcome':'idle',ms:0,source:e,ref:e});
 }
 rows.push({phase:'closed',ms:0});if(rows.length>256||rows.some(r=>r.ms<0))throw Error('Invalid bounded offline timeline');return rows;
}
export class Playback{
 constructor({clock=nativeClock,onFrame=()=>{}}={}){this.clock=clock;this.onFrame=onFrame;this.instance=++instances;this.generation=0;this.timer=null;this.mode='empty';this.phase='ready';this.input=null;this.subs=new Map();this.errors=0;this.coalesced=0;this.maxPending=0;this.disposed=false;this.hidden=false;}
 clearTimer(){if(this.timer!==null)this.clock.clear(this.timer);this.timer=null;}
 invalidate(){this.clearTimer();this.abort?.abort();this.deliveryAbort?.abort();this.abort=new AbortController();this.deliveryAbort=new AbortController();for(const s of this.subs.values()){s.pending=null;if(s.sessionOwned)s.dispose();}this.generation++;}
 select(input,selection){if(this.disposed)throw Error('Playback disposed');if(!isVerifiedInput(input)||!['A','B','C'].includes(selection?.scheme)||selection.caseId!==input.caseId||selection.variantId!==input.variantId||selection.lod!==input.lod)throw Error('Invalid offline input');this.invalidate();this.input=input;this.selection=copyFrozen(selection);this.rows=timeline(this.input);this.cursor=0;this.mode='ready';this.phase='ready';this.state=this.input.computed.start;this.sourceRef=null;this.remaining=0;this.skipped=0;this.emit();}
 get id(){return 't2b1-playback-'+realm+'-'+this.instance+'-'+this.generation;}
 snapshot(){return copyFrozen({schema:'cw.t2b1.playback-frame',version:1,playbackId:this.id,generation:this.generation,selection:this.selection||null,mode:this.mode,phase:this.phase,knownState:this.state||null,sourceRef:this.sourceRef||null,cursor:this.cursor||0,steps:this.rows?.length||0,skipped:this.skipped||0,hidden:this.hidden,computedOnly:true,settlement:'unavailable',outcome:this.input?outcomeText(this.input):null,input:this.input});}
 diagnostics(){return Object.freeze({disposed:this.disposed,timers:this.timer===null?0:1,subscribers:this.subs.size,pending:[...this.subs.values()].filter(s=>s.pending).length,inFlight:[...this.subs.values()].filter(s=>s.busy).length,consumerErrors:this.errors,pendingFactory:this.pendingFactory===true?1:0,coalesced:this.coalesced,maxPending:this.maxPending,steps:this.rows?.length||0,generation:this.generation});}
 emit(source=null,checkpoint=false){
  const frame=copyFrozen({...this.snapshot(),sourceEvent:source,checkpoint,authority:source?'owner-fixture-event':'visual-step-or-checkpoint'});
  try{this.onFrame(frame);}catch(error){this.errors++;console.warn('Comparison UI failed',String(error.message||error));}
  for(const s of this.subs.values()){if(s.pending)this.coalesced++;s.pending=frame;this.deliver(s);}this.maxPending=Math.max(this.maxPending,this.diagnostics().pending);
 }
 deliver(s){
  if(!s.active||s.busy||!s.pending)return;
  const frame=s.pending;s.pending=null;s.busy=true;const ticket=++s.ticket,signal=this.deliveryAbort?.signal,id=this.id;
  const current=()=>s.active&&!this.disposed&&this.id===id&&!signal?.aborted;
  Promise.resolve().then(()=>{if(!current())return;return s.fn(frame,Object.freeze({signal,isCurrent:current}));}).then(()=>finish(),error=>{if(s.active){this.errors++;if(!s.errorReported){s.errorReported=true;console.warn('Comparison consumer failed',String(error?.message||error));}}finish();});
  const finish=()=>{if(s.ticket!==ticket)return;s.busy=false;if(s.active)this.deliver(s);};
 }
 subscribe(fn,{signal,dispose:cleanup,sessionOwned=false}={}){
  if(this.disposed)throw Error('Playback disposed');if(typeof fn!=='function')throw TypeError('Consumer must be a function');const prior=this.subs.get(fn);if(prior)return prior.dispose;if(this.subs.size>=16)throw Error('Consumer limit');
  const s={fn,active:true,busy:false,pending:null,ticket:0,sessionOwned};s.dispose=()=>{if(!s.active)return;s.active=false;s.pending=null;s.ticket++;signal?.removeEventListener('abort',s.dispose);this.subs.delete(fn);try{cleanup?.();}catch(error){this.errors++;console.warn("Comparison cleanup failed",String(error.message||error));}};if(signal?.aborted){s.active=false;return s.dispose;}this.subs.set(fn,s);signal?.addEventListener('abort',s.dispose,{once:true});if(this.input){s.pending=copyFrozen({...this.snapshot(),sourceEvent:null,checkpoint:true,authority:'visual-step-or-checkpoint'});this.deliver(s);}return s.dispose;
 }
 schedule(ms){this.clearTimer();if(this.mode!=='playing'||this.hidden)return;this.remaining=ms;this.due=this.clock.now()+ms;const generation=this.generation;this.timer=this.clock.set(()=>{this.timer=null;if(!this.disposed&&generation===this.generation&&this.mode==='playing'&&!this.hidden)this.tick();},ms);}
 tick(){
  if(this.mode!=='playing'||this.hidden||this.disposed)return;
  const step=this.rows[this.cursor++];if(!step){this.mode='completed';this.phase='closed';this.emit(null,true);return;}
  this.phase=step.phase;this.sourceRef=step.ref?{battleId:step.ref.battleId,seq:step.ref.seq,eventId:step.ref.eventId,source:step.ref.source,actor:step.ref.actor,target:step.ref.target,sourceType:step.ref.data.sourceType||step.ref.type}:null;
  if(step.phase==='outcome')this.state=this.input.computed.final;
  if(step.phase==='closed'){this.mode='completed';this.sourceRef=null;this.emit(null,true);return;}
  this.emit(step.source||null);this.schedule(step.ms);
 }
 play(){if(!this.input||this.disposed||this.hidden)return false;if(this.mode==='paused'){this.mode='playing';this.emit(null,true);this.schedule(this.remaining);return true;}if(this.mode==='playing')return false;if(['completed','cancelled'].includes(this.mode))this.select(this.input,this.selection);this.mode='playing';this.tick();return true;}
 pause(){if(this.mode!=='playing')return false;this.remaining=Math.max(0,(this.due??this.clock.now())-this.clock.now());this.clearTimer();this.deliveryAbort.abort();this.deliveryAbort=new AbortController();for(const s of this.subs.values()){s.pending=null;}this.mode='paused';this.emit(null,true);return true;}
 replay(){if(!this.input||this.disposed||this.hidden)return false;this.select(this.input,this.selection);return this.play();}
 reset(){if(this.disposed)return;this.invalidate();this.input=null;this.rows=[];this.state=null;this.sourceRef=null;this.selection=null;this.cursor=0;this.mode='empty';this.phase='ready';this.emit(null,true);}
 stop(reason='cancelled'){if(this.disposed)return;this.invalidate();this.mode='cancelled';this.phase='closed';this.sourceRef=null;this.reason=reason;this.emit(null,true);}
 visibility(hidden){if(this.disposed)return;this.hidden=hidden;if(!this.input)return;if(hidden&&['playing','paused'].includes(this.mode)){this.invalidate();this.skipped=this.rows.slice(this.cursor).filter(r=>r.source?.type==='combat-action').length;this.cursor=this.rows.length;this.state=this.input.computed.final;this.sourceRef=null;this.mode='background';this.phase='outcome';this.emit(null,true);}else if(!hidden&&this.mode==='background'){this.mode='completed';this.phase='closed';this.emit(null,true);}else{if(hidden)this.invalidate();this.emit(null,true);}}
 dispose(){if(this.disposed)return;this.invalidate();this.disposed=true;for(const s of [...this.subs.values()])s.dispose();this.mode='disposed';this.pendingFactory=false;this.input=null;this.rows=[];this.state=null;this.sourceRef=null;this.selection=null;this.onFrame=()=>{};}
}
// Future Renderer boundary; at most one unsettled factory per controller.
// Returned placeholder/scene resources are disposed if completion is stale.
export async function bindRenderer(playback,factory){
 if(playback.disposed||!playback.input)return {ok:false,reason:'no-session'};
 if(playback.pendingFactory)return {ok:false,reason:'factory-busy-playback-unblocked'};
 playback.pendingFactory=true;
 const id=playback.id,signal=playback.abort.signal,current=()=>!playback.disposed&&playback.id===id&&!signal.aborted;
 let resource,released=false;
 const release=()=>{if(released)return;released=true;try{resource?.dispose?.();}catch(error){playback.errors++;console.warn("Comparison resource cleanup failed",String(error.message||error));}};
 try{
  resource=await factory(Object.freeze({input:playback.input,selection:playback.selection,signal,isCurrent:current}));
  if(!current()){release();return {ok:false,reason:'stale-renderer'};}
  if(typeof resource?.onFrame!=='function'||typeof resource?.dispose!=='function')throw Error('Renderer needs onFrame/dispose');
  const dispose=playback.subscribe((frame,delivery)=>resource.onFrame(frame,delivery),{sessionOwned:true,dispose:release});
  return {ok:true,dispose};
 }catch(error){release();playback.errors++;console.warn('Comparison Renderer unavailable',String(error.message||error));return {ok:false,reason:'renderer-failed'};}
 finally{playback.pendingFactory=false;}
}
