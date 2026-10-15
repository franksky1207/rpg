'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
let time=0,p={token:7,index:0,playerHp:10,enemyHp:10},session={battleId:'b',presentation:{token:7},background:false,pacing:{combatSpeed:1,impactDelay:180,stepDelay:120,endDelay:200}};
const w={document:{hidden:false}};w.window=w;vm.runInNewContext(fs.readFileSync('3d-test/t3b-formal-owner-clock.js','utf8'),{window:w,Set,Map,Number,Math,JSON,Object,Error});
const clock=w.CivilizationFormalBOwnerClock.create({now:()=>time,read:()=>p,snapshot:()=>session});
const action=(sourceIndex,data)=>({lane:'formal',availability:'authoritative',expired:false,battleId:'b',type:'combat-action',sourceIndex,data});
clock.observe(action(0,{sourceType:'attack',actor:'player',target:'enemy',damage:3,actualDamage:2,crit:true}));
assert.equal(clock.sample().player.clip,'idle','Computed arrival cannot start an attack');p.index=1;assert.equal(clock.sample().player.elapsedMs,0);time=90;assert.equal(clock.sample().player.elapsedMs,150);assert.equal(clock.sample().enemy.clip,'idle');time=180;let frame=clock.sample();assert.equal(frame.player.clip,'return');assert.equal(frame.enemy.clip,'hit');assert.equal(frame.cue.type,'crit');assert.equal(frame.cue.actualDamage,2);assert.equal(frame.hpAfterAction,undefined);
clock.observe(action(1,{sourceType:'dodge',actor:'enemy',target:'player'}));p.index=2;time=300;assert.equal(clock.sample().player.clip,'dodge');time=390;assert.equal(clock.sample().enemy.elapsedMs,150);
clock.observe(action(2,{sourceType:'drain',actor:'player',healed:4}));p.index=3;assert.equal(clock.sample().cue.healed,4);
clock.observe(action(3,{sourceType:'battleEnd'}));p.index=4;p.enemyHp=0;assert.equal(clock.sample().enemy.clip,'defeat');time+=100;assert.equal(clock.sample().enemy.elapsedMs,350);assert.equal(clock.sample().player.clip,'idle');
clock.reset({resume:true});assert.equal(clock.sample().enemy.clip,'defeat','Foreground uses current zero-HP endpoint');assert.equal(clock.sample().enemy.elapsedMs,700,'No old death animation replay');assert.equal(clock.sample().cue,null);session.background=true;assert.equal(clock.sample(),null);session.background=false;
const resumable=w.CivilizationFormalBOwnerClock.create({now:()=>time,read:()=>p,snapshot:()=>session});p.index=1;p.enemyHp=10;
resumable.observe(action(0,{sourceType:'attack',actor:'player',target:'enemy'}));resumable.observe(action(1,{sourceType:'attack',actor:'enemy',target:'player'}));resumable.reset({resume:true});assert.equal(resumable.sample().player.clip,'idle');assert.equal(resumable.sample().cue,null,'Current old action suppressed');p.index=2;assert.equal(resumable.sample().enemy.clip,'attack','Future owner action uses preserved computed metadata');
clock.observe({...action(0,{sourceType:'attack',actor:'player',target:'enemy'}),battleId:'next'});session.battleId='next';p.index=1;time=1000;session.pacing.combatSpeed=2;session.pacing.impactDelay=90;session.pacing.stepDelay=60;assert.equal(clock.sample().player.elapsedMs,0);time+=45;assert.equal(clock.sample().player.elapsedMs,150,'Uses actual GM 2x owner pacing, no recalculated damage');
clock.observe({...action(1,{sourceType:'attack',actor:'enemy',target:'player'}),battleId:'next',lane:'gm-fixture'});p.index=2;assert.throws(()=>clock.sample(),/unavailable-authoritative/);
assert.equal(clock.snapshot().canCommit,false);console.log('PASS one formal visual clock: owner token/index/pacing, no computed replay, real cue fields, zero-HP death, foreground suppression, GM speed and missing history fail-closed');

// Standard core ends without a battleEnd row: the presentation zero-HP snapshot owns death.
p.index=1;p.playerHp=0;time+=10;assert.equal(clock.sample().player.clip,'defeat');p.playerHp=10;
// First renderer sample may arrive after the actual presentation impact. It must
// catch up to the owner timestamp instead of restarting the attack at frame zero.
p.playerHp=10;p.enemyHp=10;p.index=1;p.action={sourceType:'attack',actor:'player',target:'enemy'};p.actionStartedAt=2000;time=2095;
const delayed=w.CivilizationFormalBOwnerClock.create({now:()=>time,read:()=>p,snapshot:()=>session});delayed.observe({...action(0,p.action),battleId:'next'});
assert.equal(delayed.sample().player.clip,'return');assert.ok(delayed.sample().weaponAttack.elapsedMs>336);assert.equal(delayed.sample().enemy.clip,'hit');
