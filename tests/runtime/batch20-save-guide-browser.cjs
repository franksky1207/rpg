'use strict';
const{chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true}),p=await b.newPage();await p.goto(process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html');await p.waitForFunction(()=>typeof window.gameGuideCategoriesForState==='function'&&typeof window.applyReincarnationResetState==='function');
const result=await p.evaluate(()=>{
 const failures=[],checks=[];const check=(name,ok,data)=>{checks.push(name);if(!ok)failures.push({name,data});};
 state=newState();const context={mode:'main',world:1,owner:'combatcore.js',location:'0:0'},enemy=monsterObj(0,0);recordMonsterCodexEncounter(context,enemy);
 check('local save',save(false)!==false);const saved=JSON.parse(localStorage.getItem(SAVE_KEY));check('persisted catalogue',saved.monsterCodex.encountered.includes('galaxy-map-001'));
 const migrated=migrateSave(JSON.parse(JSON.stringify(saved)),SAVE_SCHEMA_VERSION,normalizeSaveState,saved);check('canonical migration preserves catalogue',migrated.monsterCodex.encountered.includes('galaxy-map-001'));
 const after=applyReincarnationResetState(state,{requireEligible:false,currentTime:Date.now()});check('formal reincarnation mutation succeeds',after.ok,after);check('reincarnation retains catalogue',state.monsterCodex.encountered.includes('galaxy-map-001'));check('reincarnation clears actual marks',Object.values(markFormalSnapshot()).every(m=>m.level===0&&!m.acquired));
 check('optional extension supported by schema owner',saveSchemaChangeRequiresBump('additive-optional-field')===false);
 const future=JSON.parse(JSON.stringify(saved));future.saveVersion=SAVE_SCHEMA_VERSION+1;let rejected=false;try{migrateSave(future,future.saveVersion,normalizeSaveState,future);}catch(_){rejected=true;}check('future schema remains rejected',rejected);
 for(const world of [1,2,3]){state=newState();if(world>1)state.secondWorld.entered=true;if(world===3)state.thirdWorld.entered=true;const final=JSON.stringify(gameGuideCategoriesForState(state));check('final guide no combat reviews '+world,!final.includes('回顧戰')&&!final.includes('回顧純挑戰'),final);if(world===1)check('Lv0 guide',final.includes('Lv.0'));if(world===2)check('universe marks guide',final.includes('銀河十種印記'));if(world===3)check('heritage final extension',final.includes('文明傳承')&&final.includes('實際有效'));}
 for(const civilization of [0,1,10]){
  state=newState();state.secondWorld.entered=true;state.secondWorld.civilizationLevel=civilization;state.secondWorld.mainline.bossKilled[9]=true;const d=getSecondWorldCalamityDefinitions()[0];
  queueSecondWorldCalamityAppearanceNotice(d);flushSecondWorldCalamityAppearanceNotice();
  check('original appearance eligibility preserved civilization '+civilization,document.getElementById('secondWorldCalamityAppearanceRequirement').textContent.includes('目前已符合挑戰條件，可立即前往挑戰。'));
  closeSecondWorldCalamityAppearanceNotice();check('appearance confirmation closes civilization '+civilization,!document.getElementById('secondWorldCalamityAppearanceModal').classList.contains('show'));
 }
 state=newState();const def=getCivilizationCalamityDefinitions()[0];state.bossKilled[def.mapIndex]=true;
 const first=advanceMarkProgressEntry({acquired:false,level:0,progress:0});check('first acquisition Lv0',first.entry.acquired&&first.entry.level===0);
 const next=advanceMarkProgressEntry(first.entry);check('subsequent kill raises Lv1',next.entry.level===1);
 return {checks:checks.length,failures};
});console.log(JSON.stringify(result,null,2));await b.close();assert.deepEqual(result.failures,[]);})();
