'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function harness(){
 const events={},document={visibilityState:'visible',hasFocus:()=>true,addEventListener(n,fn){events[n]=fn;}};
 let gm=false,clock=0,p={token:1},clears=0;
 const win={document,performance:{now:()=>clock},setTimeout,clearTimeout,console,gmBackgroundBattleEnabled:()=>gm,
  getCombatPresentationSnapshot:()=>p,clearCombatPresentation(){clears++;p=null;},addEventListener(n,fn){events[n]=fn;}};
 win.window=win;vm.runInNewContext(fs.readFileSync('combatlifecycle.js','utf8'),win);
 return {api:win.CivilizationCombatLifecycle,events,document,gm:v=>gm=v,tick:v=>clock+=v,p:v=>p=v,clears:()=>clears};
}
test('cancel wakes an in-flight hit and only submits applied HP, never the look-ahead index',async()=>{
 const h=harness(),result={events:[]},saved=[];h.api.checkpoint(result,(hp,index)=>{saved.push({hp,index});return {ok:true};});
 const battle=h.api.begin(result);battle.applied({index:2,enemyHp:80});
 const sleeping=battle.sleep(70,()=>new Promise(()=>{}));
 h.document.visibilityState='hidden';h.events.visibilitychange();
 await assert.rejects(sleeping,e=>e.code==='COMBAT_INTERRUPTED');
 assert.deepEqual(saved,[{hp:80,index:2}]);assert.equal(h.clears(),1);
 h.api.cancel();assert.equal(saved.length,1,'duplicate lifecycle signals cannot checkpoint twice');battle.finish();
});
test('5-second checkpoints, lethal tail, failed save, and no full event/index copy',()=>{
 const h=harness(),result={events:new Array(100000)},saved=[];h.api.checkpoint(result,(hp,index)=>{saved.push({hp,index});return {ok:true};});
 const b=h.api.begin(result);b.applied({index:1,enemyHp:80});h.tick(4999);b.applied({index:2,enemyHp:60});assert.equal(saved.length,0);
 h.tick(1);b.applied({index:3,enemyHp:70});assert.deepEqual(saved,[{hp:70,index:3}],'healing is real HP, not a historical damage minimum');
 b.applied({index:4,enemyHp:0});h.api.cancel();assert.equal(saved[1].hp,70,'unfinished lethal outcome is not an HP=0 checkpoint');b.finish();
 const r={events:[]};h.api.checkpoint(r,()=>({ok:false,reason:'storage denied'}));h.p({token:2});const failed=h.api.begin(r);failed.applied({index:1,enemyHp:50});h.api.cancel();assert.throws(()=>failed.check(),/storage denied/);failed.finish();
});
test('GM actual background switch, completed-before-hide, and bfcache cannot revive cancelled battle',async()=>{
 const h=harness();h.gm(true);const gm=h.api.begin({events:[]});h.document.visibilityState='hidden';h.events.visibilitychange();assert.equal(gm.cancelled,false);gm.complete();gm.finish();
 h.document.visibilityState='visible';h.gm(false);h.p({token:2});const battle=h.api.begin({events:[]});h.events.pagehide({persisted:true});assert.equal(battle.cancelled,true);
 h.events.pageshow({persisted:true});assert.throws(()=>battle.complete(),e=>e.code==='COMBAT_INTERRUPTED');battle.finish();
 h.p({token:3});const completed=h.api.begin({events:[]});completed.complete();h.document.visibilityState='hidden';h.events.visibilitychange();assert.equal(completed.cancelled,false);completed.finish();
});
test('superseded owner may not clear the new mode presentation or commit late',()=>{
 const h=harness(),old=h.api.begin({events:[]});h.p({token:2});const next=h.api.begin({events:[]});
 assert.equal(h.clears(),0);assert.throws(()=>old.check(),e=>e.code==='COMBAT_INTERRUPTED');old.finish();next.complete();next.finish();assert.equal(h.api.snapshot(),null);
});
test('leaving during an inter-battle gap invalidates that run after focus returns',()=>{
 const h=harness(),epoch=h.api.epoch();h.document.visibilityState='hidden';h.events.visibilitychange();
 h.document.visibilityState='visible';h.events.visibilitychange();h.events.focus();
 assert.throws(()=>h.api.foreground(epoch),e=>e.code==='COMBAT_INTERRUPTED');h.api.foreground(h.api.epoch());
});
test('blur uses a sustained focus recheck and respects the actual GM background switch',async()=>{
 const h=harness(),b=h.api.begin({events:[]});h.events.blur();await new Promise(r=>setTimeout(r,220));assert.equal(b.cancelled,false,'blur with document focus retained is not departure');
 h.document.hasFocus=()=>false;h.events.blur();h.events.focus();await new Promise(r=>setTimeout(r,220));assert.equal(b.cancelled,false,'short dialog focus return cancels deferred blur');
 h.events.blur();await new Promise(r=>setTimeout(r,220));assert.equal(b.cancelled,true);b.finish();h.events.focus();h.gm(true);
 const gm=h.api.begin({events:[]});h.events.blur();await new Promise(r=>setTimeout(r,220));assert.equal(gm.cancelled,false);h.gm(false);h.events.blur();await new Promise(r=>setTimeout(r,220));assert.equal(gm.cancelled,true);gm.finish();
});
test('visible app return with focus restored but no window focus event releases the stale blur flag',async()=>{
 const h=harness();h.document.hasFocus=()=>false;const oldEpoch=h.api.epoch();h.events.blur();await new Promise(r=>setTimeout(r,220));
 h.document.visibilityState='hidden';h.events.visibilitychange();h.document.hasFocus=()=>true;h.document.visibilityState='visible';h.events.visibilitychange();
 assert.throws(()=>h.api.foreground(oldEpoch),e=>e.code==='COMBAT_INTERRUPTED','the interrupted run still cannot revive');
 h.api.foreground(h.api.epoch());const b=h.api.begin({events:[]});b.complete();b.finish();
});
