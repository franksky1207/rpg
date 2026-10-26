'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('mainminimalmode.js','utf8');
const specs=[
 ['main','battlepipeline.js','activeMainBattleContext','requestContinuousBattleStop','exitRequested'],
 ['second-world-mainline','secondworldmainline.js','activeContext','requestSecondWorldContinuousStop','stopRequested'],
 ['calamity','calamityrun.js','activeRun','requestCivilizationCalamityContinuousStop','stopRequested'],
 ['second-world-calamity','secondworldcalamityrun.js','activeRun','requestSecondWorldCalamityStop','stopRequested'],
 ['higher-stage','thirdworldrun.js','runtime','stopThirdWorldContinuousRun','stopRequested'],
 ['bounty','dungeonbounty.js','bountyState','requestBountyContinuousStop','stopRequested'],
 ['arena','dungeonarena.js','arenaState','requestArenaContinuousStop','stopRequested'],
 ['higher-arena','thirdworldarena.js','arenaRuntime','requestThirdWorldArenaStop','stopRequested'],
 ['void','dungeonvoid.js','voidMirageRun','requestVoidMirageExit','exitRequested']
];
function environment(){
 const controls=[],window={CivilizationCombatLifecycle:{epoch:()=>window.epoch},epoch:0},document={body:{},addEventListener(){},querySelectorAll:selector=>selector.includes("-slot]")?[]:controls};
 const ctx=vm.createContext({window,document,console,setTimeout,clearTimeout,setInterval,clearInterval});vm.runInContext(source,ctx);
 return {window,ctx,controls};
}
for(const [mode,path,variable,capability,flag] of specs)test('registered real-owner adapter dispatch and idempotence: '+mode,()=>{
 const {window:w,ctx}=environment();const owner={active:true,continuous:true,phase:['bounty','arena'].includes(mode)?'combat':'fighting',mode:'continuous',status:'combat',requestedRuns:5,presentingBattle:true};
 ctx[variable]=owner;if(variable==='activeMainBattleContext')w[variable]=owner;ctx.battleBusy=true;ctx.busy=true;
 const code=fs.readFileSync(path,'utf8'),start=code.indexOf('window.registerFormalContinuousStopAdapter?.("'+mode+'"'),end=code.indexOf('\n });',start);
 assert(start>=0&&end>start,'real registration exists');vm.runInContext(code.slice(start,end+5),ctx);
 let calls=0;w[capability]=()=>{calls++;assert.equal(w.requestFormalContinuousStop(mode).reason,'already-requested','reentrant request rejected');owner[flag]=true;return {ok:true};};
 if(!['higher-stage','void'].includes(mode)){
  owner.continuous=false;owner.mode='single';owner.requestedRuns=1;
  assert.equal(w.getFormalContinuousStopState(mode).available,false,'actual adapter rejects single fight');assert.equal(w.renderContinuousStopControl({mode}),'');
  owner.continuous=true;owner.mode='continuous';owner.requestedRuns=5;
 }
 const state=w.getFormalContinuousStopState(mode);assert.equal(state.available,true);assert.equal(state.requested,false);
 const html=w.renderContinuousStopControl({mode});assert.equal((html.match(/data-combat-action=/g)||[]).length,1);assert.match(html,/requestFormalContinuousStopFromControl\(this\)/);
 assert.equal(w.requestFormalContinuousStop(mode).ok,true);assert.equal(calls,1);assert.equal(owner[flag],true);assert.equal(w.getFormalContinuousStopState(mode).requested,true);
 assert.equal(w.requestFormalContinuousStop(mode).reason,'already-requested');assert.equal(calls,1);
});
test('missing/invalid mode, owner failures and single combat fail closed',()=>{
 const {window:w}=environment();assert.equal(w.requestFormalContinuousStop('mirror').ok,false);assert.equal(w.renderContinuousStopControl({mode:'mirror'}),'');
 assert.equal(w.registerFormalContinuousStopAdapter('bad mode',{}),false);
 const owner={};w.registerFormalContinuousStopAdapter('single',{read:()=>({owner,active:true,continuous:false}),request:()=>assert.fail('single must not dispatch')});
 assert.equal(w.renderContinuousStopControl({mode:'single'}),'');assert.equal(w.requestFormalContinuousStop('single').ok,false);
 w.registerFormalContinuousStopAdapter('throws',{read:()=>{throw Error('owner');},request:()=>assert.fail()});assert.equal(w.requestFormalContinuousStop('throws').ok,false);
 w.registerFormalContinuousStopAdapter('rejects',{read:()=>({owner,active:true,continuous:true}),request:()=>{throw Error('stop');}});assert.equal(w.requestFormalContinuousStop('rejects').reason,'owner-failed');
 assert.equal(w.registerFormalContinuousStopAdapter('single',{read(){},request(){}}),false,'duplicate registration rejected');
});
test('old run, old epoch, disconnected controls cannot call a new owner; duplicate controls reconciled',()=>{
 const {window:w,controls}=environment();let owner={},calls=0;
 w.registerFormalContinuousStopAdapter('live',{read:()=>({owner,active:true,continuous:true,requested:owner.stop}),request:()=>{owner.stop=true;calls++;return true;}});
 function control(){return {dataset:{combatMode:'live',combatRun:w.getFormalContinuousStopState('live').run},isConnected:true,textContent:'',disabled:false,setAttribute(){},closest(){return {remove:()=>{this.removed=true;}};}};}
 const old=control();owner={};assert.equal(w.requestFormalContinuousStopFromControl(old).reason,'stale-control');assert.equal(calls,0);
 const epochControl=control();w.epoch++;assert.equal(w.requestFormalContinuousStopFromControl(epochControl).reason,'stale-control');assert.equal(calls,0);
 const detached=control();detached.isConnected=false;assert.equal(w.requestFormalContinuousStopFromControl(detached).reason,'stale-control');
 const current=control(),duplicate=control();controls.push(current,duplicate);w.syncFormalContinuousStopControls();assert.equal(duplicate.removed,true);assert(!current.removed);
 assert.equal(w.requestFormalContinuousStopFromControl(current).ok,true);assert.equal(calls,1);assert.equal(current.disabled,true);assert.equal(current.dataset.stopState,'requested');
});
test('exact named source approval rejects unrelated bytes in every changed file',()=>{
 const approval=require('./formal-stop-approved.cjs'),record=require('./formal-stop-approved.json');
 for(const path of Object.keys(record.files)){
  const bytes=fs.readFileSync(path);assert.doesNotThrow(()=>approval.historicalBytes(path,bytes));
  assert.throws(()=>approval.historicalBytes(path,Buffer.concat([bytes,Buffer.from('\n/* unauthorized drift */')])),'unregistered change: '+path);
 }
});
test('special authored order and retired structural CSS, no duplicate native button generators',()=>{
 const special=fs.readFileSync('specialencounter.js','utf8'),css=fs.readFileSync('mainminimalmode.css','utf8');
 assert.match(special,/特殊遭遇<\/div>\$\{stop\}<div class="combat-arena">/);assert.doesNotMatch(special,/特殊戰鬥開始<\/div>\$\{stop\}/);
 assert.doesNotMatch(css,/:has\(> \.combat-head \+ \.combat-arena/);
 assert.doesNotMatch(fs.readFileSync('battle-mobile-viewport.css','utf8'),/:has\(/,'viewport reserve uses an explicit render marker');
 for(const path of ['ui.js','worldmapui.js','specialencounter.js','thirdworldui.js','dungeonbounty.js','dungeonarena.js','thirdworldarenaui.js','calamityui.js','secondworldcalamityui.js','dungeonvoidui.js']){
  const s=fs.readFileSync(path,'utf8');assert.match(s,/window\.renderContinuousStopControl\(/,path);assert.doesNotMatch(s,/<button data-combat-action="stop-continuous"/,path);
 }
 assert.doesNotMatch(fs.readFileSync('dungeonvoidui.js','utf8'),/exitAfterFloor/,'no duplicate Void stop flag');
});
test('Void minimal four-field display/order/status and numerical/save owners remain byte exact',()=>{
 const cp=require('node:child_process'),at=path=>cp.execFileSync('git',['show','215cb89207363b0ed16e08fae9b8532ee67390a3:'+path],{encoding:'utf8',maxBuffer:16*1024*1024});
 const path='dungeonvoidui.js',marker=' function stopVoidMinimalModeIfOpen';
 const before=at(path),live=fs.readFileSync(path,'utf8');assert.equal(live.slice(live.indexOf(marker)),before.slice(before.indexOf(marker)),'Void minimal display adapter tail is unchanged');
 for(const p of ['combatcore.js','combatmath.js','engine.js','specialcore.js','calamitycore.js','secondworldcalamity.js','thirdworldcombat.js','thirdworldloot.js','thirdworldprogress.js','thirdworldplayerflow.js','alternateuniversecombat.js','savemigration.js','offlinestatecore.js','reincarnationstate.js','breakthroughcore.js'])assert.equal(fs.readFileSync(p,'utf8'),at(p),'unchanged formal math/reward/save owner '+p);
});
test('landscape viewport keeps authored stop and animation visible, including a tall arena lineup',()=>{
 for(const [tall,headerHeight] of [[false,0],[true,0],[false,68]]){
  let y=0;const queue=[],rect=(top,height)=>({top:top-y,bottom:top+height-y,width:350,height});
  const stage={isConnected:true,hidden:false,getBoundingClientRect:()=>rect(tall?706:406,203)},button={hidden:false,getBoundingClientRect:()=>rect(tall?650:352,44)},heading={getBoundingClientRect:()=>rect(300,32)};
  const cards=[640,780].map(top=>({querySelector:selector=>({getBoundingClientRect:()=>rect(top+(tall?350:0)+(selector==='h2'?0:40),20)})}));
  const screen={classList:{contains:()=>true},closest:()=>null,querySelectorAll:()=>cards,querySelector:s=>s.includes('formal-b-')?stage:s==='.combat-viewport-stop'?button:s==='.combat-head'?heading:null};
  const root={isConnected:true,querySelectorAll:()=>[screen],querySelector:()=>screen,addEventListener(){}};
  const d={body:{classList:{contains:()=>false}},readyState:'complete',visibilityState:'visible',getElementById:()=>root,addEventListener(){},scrollingElement:{scrollHeight:2200},documentElement:{scrollHeight:2200}};
  if(headerHeight)d.querySelector=()=>({getBoundingClientRect:()=>({top:0,bottom:headerHeight,height:headerHeight})});
  const w={getComputedStyle:()=>({position:'sticky'}),innerHeight:390,innerWidth:844,visualViewport:{height:390,width:844,offsetTop:0,addEventListener(){}},get scrollY(){return y;},matchMedia:()=>({matches:true}),requestAnimationFrame:f=>queue.push(f),addEventListener(){},scrollTo:options=>{y=options.top;}};
  vm.runInNewContext(fs.readFileSync('combat-viewport-coordinator.js','utf8'),{window:w,document:d,MutationObserver:class{observe(){}}});
  for(let i=0;i<20&&queue.length;i++)queue.splice(0).forEach(f=>f());
  const b=button.getBoundingClientRect(),s=stage.getBoundingClientRect();assert(b.top>=headerHeight&&b.bottom<=s.top&&s.bottom<=390,'button and animation visible '+JSON.stringify({tall,b,s}));
 }
});
test('shared controls cannot become a reward, save, combat-clock or cancellation owner',()=>{
 const start=source.indexOf(' const stopAdapters='),end=source.indexOf(' function isMainContinuousCombat',start),shared=source.slice(start,end);
 assert.doesNotMatch(shared,/\b(?:runCombatCore|settleMainBattleResult|gainExp|save)\s*\(|localStorage|CivilizationCombatLifecycle\??\.cancel|\bstate\.[a-zA-Z_$][\w$]*\s*=/);
 assert.match(shared,/state\.adapter\.request\(\)/,'request delegates to the registered capability');
});
