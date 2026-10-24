const{chromium}=require('playwright');const assert=require('node:assert/strict');const {sdk,finishIntro}=require('../equipment-formal/helpers.cjs');
(async()=>{const b=await chromium.launch({headless:true});const p=await b.newPage({viewport:{width:390,height:844}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('**/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));await p.goto(process.env.BATCH20_URL||process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html');await p.waitForFunction(()=>typeof window.normalizeMonsterCodex==='function'&&typeof window.storyRecordPageHtml==='function');
await p.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==='ready');await finishIntro(p);
const result=await p.evaluate(()=>{
 const failures=[],checks=[];const check=(name,ok,data)=>{checks.push(name);if(!ok)failures.push({name,data});};
 state=newState();const clean=JSON.stringify(state),catalogue=MONSTER_CODEX_CATALOGUE;
 check('catalogue identities unique',new Set(catalogue.map(r=>r.id)).size===1705);
 const owners={main:{galaxy:'combatcore.js',universe:'secondworldcombat.js',higher:'thirdworldcombat.js'},calamity:{galaxy:'calamitycore.js',universe:'secondworldcalamityrun.js'},bounty:{galaxy:'dungeoncore.js',universe:'dungeoncore.js'},arena:{galaxy:'dungeonarena.js',universe:'dungeonarena.js',higher:'thirdworldarena.js'},void:{both:'dungeonvoid.js'},special:{both:'specialcore.js'},alternate:{both:'alternateuniversecombat.js'}};
 const misses=[];
 for(const r of catalogue){let loc='';let world={galaxy:1,universe:2,higher:3,both:1}[r.world];if(r.mode==='main')loc=r.world==='galaxy'?String((r.region-1)*10+r.mapIndex-1)+':'+(r.slot-1):r.world==='universe'?String(Number(r.id.slice(-3))-1):String(r.bossIndex);if(r.mode==='calamity')loc=r.bossId;if(r.mode==='special')loc=r.specialId;if(r.mode==='alternate')loc=String(r.depth);if(r.mode==='arena')loc=String(r.arenaStage??0);if(r.mode==='void')loc=String(r.isBossFloor?(r.bossCycle*10+10):1);
  const c={world,mode:r.mode,owner:owners[r.mode][r.world],location:loc},e={name:r.name,kind:r.kind,id:r.id,calamityId:r.bossId};const resolved=resolveMonsterCodexEncounter(c,e);if(resolved?.id!==r.id)misses.push({id:r.id,c,e});
  check('fixture excluded '+r.id,resolveMonsterCodexEncounter({...c,fixture:true},e)===null);
 }
 check('all canonical identity contexts',misses.length===0,misses.slice(0,12));
 const e=monsterObj(0,0),c={mode:'main',world:1,owner:'combatcore.js',location:'0:0'};
 const before=JSON.stringify(state.monsterCodex);runCombatCore({hp:1,atk:1,def:0,crit:0,dodge:0},e,1,{maxTurns:1,logs:false,preparePresentation:false,visualContext:{...c,fixture:true}});check('fixture cannot register',JSON.stringify(state.monsterCodex)===before);
 runCombatCore({hp:1,atk:1,def:0,crit:0,dodge:0},e,1,{maxTurns:1,logs:false,preparePresentation:false,visualContext:c});check('headless loss unlocks',state.monsterCodex.encountered.includes('galaxy-map-001'));recordMonsterCodexEncounter(c,e);check('duplicate suppressed',state.monsterCodex.encountered.length===1);
 const serialized=JSON.stringify(state);normalizeMonsterCodex(state);check('JSON roundtrip',JSON.stringify(normalizeMonsterCodex(JSON.parse(serialized)).monsterCodex)===JSON.stringify(state.monsterCodex));
 const old={level:2000,secondWorld:{entered:true},thirdWorld:{entered:true}};normalizeMonsterCodex(old);check('legacy no fabricated unlocks',old.monsterCodex.encountered.length===0);
 const invalid={monsterCodex:{version:1,encountered:['galaxy-map-001','galaxy-map-001','bad',{},'__proto__']}};normalizeMonsterCodex(invalid);check('normalizer validation',invalid.monsterCodex.encountered.join()==='galaxy-map-001');
 const retired=['startGalaxyReviewBattle','openGalaxyReviewMap','startSecondWorldBossReview','startThirdWorldBossReviewFromPlayerUi','startGalaxyCalamityReview','startUniverseCalamityReview','setAdventureReviewBattleActive'];check('retired APIs absent',retired.every(n=>window[n]===undefined));
 for(const w of [1,2,3]){state=newState();if(w>=2)state.secondWorld.entered=true;if(w===3)state.thirdWorld.entered=true;
 const home=homePage();check('home ten options world '+w,(home.match(/class="menu-card"/g)||[]).length===10);check('home label '+w,w===3?home.includes('文明傳承'):home.includes('文明災厄'));
 const html=w===1?civilizationCalamityPageHtml():secondWorldCivilizationCalamityPageHtml();check('civilization rendered '+w,!html.includes('回顧戰')&&!html.includes('單場重打'));if(w>=2)check('galaxy marks visible '+w,html.includes('銀河十種印記'));
 }
 state=newState();const d=getCivilizationCalamityDefinitions()[0];state.bossKilled[d.mapIndex]=true;state.marks.entries[d.markId]={acquired:true,level:10,progress:0};const maxBefore=JSON.stringify(state);check('galaxy MAX battle guard',runCivilizationCalamityBattle(d.id).ok===false);check('galaxy MAX headless guard',runCivilizationCalamityHeadlessCombat(d.id).ok===false);check('galaxy MAX UI guard',startCivilizationCalamityUI(d.id)===false);check('MAX guard no mutation',JSON.stringify(state)===maxBefore);
 state=newState();state.secondWorld.entered=true;state.secondWorld.civilizationLevel=1;state.secondWorld.mainline.bossKilled[9]=true;const sd=getSecondWorldCalamityDefinitions()[0];check('universe complete authorization',!canChallengeSecondWorldCalamity(sd.id));check('universe complete UI',startSecondWorldCalamityUI(sd.id)===false);check('universe complete battle',runSecondWorldCalamityBattle(sd.id).ok===false);
 state=newState();state.introSeen=true;state.storyProgress={pendingStory:null,completedStories:['earth-prologue'],introCompleted:true,starterGearReceived:true};view='storyrecord';setFrontlineRecordTab('codex');check('locked catalogue no images',!monsterCodexPageHtml().includes('<canvas'));check('locked details denied',openMonsterCodexDetail('galaxy-map-001')===false);recordMonsterCodexEncounter(c,e);check('detail opens after encounter',openMonsterCodexDetail('galaxy-map-001')===true);
 return {failures,checks:checks.length,errors:[],catalogue:catalogue.length};
});await p.waitForFunction(()=>{const c=document.getElementById('monsterCodexImage');return c&&c.nextElementSibling.textContent==='';});const image=await p.evaluate(()=>{const c=document.getElementById('monsterCodexImage');return c.getContext('2d').getImageData(0,0,512,512).data.some((v,i)=>i%4===3&&v>16)});assert.equal(image,true,'SHA verified static image has visible pixels');
const readonlyBefore=await p.evaluate(()=>JSON.stringify(state.monsterCodex));
await p.evaluate(()=>dispatchEvent(new Event('civilization-resource-cache-cleared')));
await p.route('**/assets/monsters/**',r=>r.abort());await p.evaluate(()=>openMonsterCodexDetail('galaxy-map-001'));
await p.waitForFunction(()=>document.getElementById('monsterCodexImageStatus')?.textContent.includes('暫時無法載入'));
await p.unroute('**/assets/monsters/**');await p.evaluate(()=>openMonsterCodexDetail('galaxy-map-001'));
await p.waitForFunction(()=>document.getElementById('monsterCodexImageStatus')?.textContent==='');
assert.equal(await p.evaluate(()=>JSON.stringify(state.monsterCodex)),readonlyBefore,'reading and image failure cannot register encounters');
console.log(JSON.stringify({...result,pageErrors:errors},null,2));await b.close();assert.deepEqual(result.failures,[]);assert.deepEqual(errors,[]);})();
