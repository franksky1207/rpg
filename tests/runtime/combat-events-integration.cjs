"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=f=>fs.readFileSync(f,'utf8'),plain=x=>JSON.parse(JSON.stringify(x));
function rng(seed){let n=seed;return()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);}
function boot(consumer){
 const w={console:{warn(){},error(){}},Math,JSON,ceil:Math.ceil,CRIT_DAMAGE_MULTIPLIER:1.5,AbortController,state:{hp:100,playerName:'p',worldPhase:1,equipment:{}},MARK_KEYS:[],EQUIPMENT_TYPES:['weapon','helmet','armor','shoes','accessory'],specializationPercentBonus:k=>({initiative:20,combo:20,penetration:10,counter:10,drain:10}[k]||0),currentWorldPhase:s=>(s||w.state).worldPhase,document:{hidden:false,addEventListener(){}}};
 w.window=w;vm.createContext(w);
 for(const f of ['combatmath.js','combatcore.js','mirrorconfig.js','mirrorcombatcore.js'])vm.runInContext(read(f),w);
 if(consumer){vm.runInContext(read('combat-events.js'),w);w.CivilizationCombatEvents.subscribe(consumer);}
 return w;
}
const actor={hp:100,atk:17,def:8,crit:20,dodge:12},enemy={name:'Owner enemy',id:'owner-enemy',kind:'boss',hp:120,atk:16,def:8,crit:20,dodge:8};
const modes=[['main',1],['main',2],['main',3],['bounty',1],['bounty',2],['arena',1],['arena',2],['arena',3],['void',1],['void',2],['void',3],['calamity',1],['calamity',2],['alternate',1],['alternate',2],['alternate',3],['special',1],['special',2],['review',1],['review',2],['review',3],['gm-benchmark',1],['gm-benchmark',2],['gm-benchmark',3]];
test('actual core RNG/results and complete State identical without Bridge / throw / reject / never consumer',async()=>{
 let checked=0;
 for(const [mode,world] of modes)for(let seed=1;seed<=8;seed++){
  const owner=mode==='main'||mode==='review'?({main:['combatcore.js','secondworldcombat.js','thirdworldcombat.js'],review:['ui.js','secondworldcombat.js','thirdworldcombat.js']}[mode][world-1]):({bounty:'dungeoncore.js',arena:world===3?'thirdworldarena.js':'dungeonarena.js',void:'dungeonvoid.js',calamity:world===1?'calamitycore.js':'secondworldcalamityrun.js',alternate:'alternateuniversecombat.js',special:'specialcore.js','gm-benchmark':'gmpowerbenchmark.js'}[mode]);const context={mode,world,owner,playerName:'p',fixture:mode==='gm-benchmark'},options={rng:rng(seed),preparePresentation:false,visualContext:context,maxActions:10000,enemyAbilityProfile:{comboRate:20,counterRate:10,drainRate:10}};
  const base=boot(),expected=plain(base.runCombatCore(actor,enemy,100,options)),state=JSON.stringify(base.state);
  for(const consumer of [()=>{throw Error('renderer');},()=>Promise.reject(Error('renderer')),()=>new Promise(()=>{})]){
   const w=boot(consumer),actual=w.runCombatCore(actor,enemy,100,{...options,rng:rng(seed)});
   assert.deepEqual(plain(actual),expected,mode+' W'+world+' seed '+seed);assert.equal(JSON.stringify(w.state),state);assert.equal(w.CivilizationCombatEvents.snapshot(mode==='gm-benchmark'?'gm-fixture':'formal').world,world);checked++;
  }
 }
 await Promise.resolve();console.log('PASS identical standard core results / complete State:',checked,'comparisons');
});
test('actual mirror core output, symmetry and RNG are unchanged by a broken consumer',async()=>{
 for(const world of [1,2,3])for(let seed=1;seed<=16;seed++){
  const snapshot={world,level:100,playerName:'p',stats:actor,specializations:{combo:20,counter:20,drain:20},marks:{},civilizationLevel:0,breakthroughLevel:0},options={rng:rng(seed),visualContext:{mode:'mirror',world,owner:'mirrordungeonrun.js',playerName:'p',enemyName:'鏡像・p'}};
  const a=boot(),b=boot(()=>{throw Error('renderer');});assert.deepEqual(plain(a.runMirrorCombatCore(snapshot,options)),plain(b.runMirrorCombatCore(snapshot,{...options,rng:rng(seed)})));
 }
 await Promise.resolve();
});
test('mode producer hooks are present in each actual owner, not guessed from DOM',()=>{
 const wires={main:['combatcore.js','secondworldcombat.js','thirdworldcombat.js'],bounty:['dungeoncore.js'],arena:['dungeonarena.js','thirdworldarena.js'],void:['dungeonvoid.js'],calamity:['calamitycore.js','secondworldcalamityrun.js'],alternate:['alternateuniversecombat.js'],special:['specialcore.js'],mirror:['mirrordungeonrun.js'],'gm-benchmark':['gmpowerbenchmark.js','gmalternateuniversebenchmark.js']};
 for(const [mode,files] of Object.entries(wires))for(const f of files){assert.ok(read(f).includes('visualContext:'),f);assert.ok(read(f).includes('"'+mode+'"'),f+' mode');}
 for(const f of ['ui.js','secondworldcalamityui.js'])assert.ok(!read(f).includes('visualContext:{mode:"review"'),'retired review producer '+f);
 assert.ok(read('thirdworldcombat.js').includes('CivilizationCombatEvents?.associate?.(result,combat)'),'frozen W3 result must retain its own computed reference');
 assert.ok(read('alternateuniversecombat.js').includes('CivilizationCombatEvents?.associate?.(output.combat,combat)'),'AU clone must retain correct reference');
 assert.ok(read('combatfx.js').includes('CivilizationCombatEvents?.updatePresentation?.'),'real onUpdate/HP sync source is observed');
});
test('Bridge never calls audio, storage, combat calculation, or a long-running timer',()=>{
 const source=read('combat-events.js');for(const token of ['CivilizationAudio','localStorage','sessionStorage','setInterval(','setTimeout(','runCombatCore(','runWorldCombatCore(','fetch('])assert.ok(!source.includes(token),token);
 assert.ok(read('index.html').indexOf('src="combat-events.js')<read('index.html').indexOf('src="combatcore.js'));
});
