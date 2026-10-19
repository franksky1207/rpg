'use strict';
// Real audio owner, media and disposable storage. No gameplay or remote writes.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {sdk,finishIntro}=require('../equipment-formal/helpers.cjs');
(async()=>{
 const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']});
 try{
  const page=await browser.newPage(),requests=[],errors=[];
  page.on('request',r=>{if(r.url().includes('/common-sfx/'))requests.push(r.url());});
  page.on('pageerror',e=>errors.push(String(e)));
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
  await page.goto(process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html');
  await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==='ready');
  assert.equal(requests.length,0,'startup never preloads SFX');
  await finishIntro(page);
  await page.evaluate(()=>CivilizationAudioScenes.notify('combat-start',{era:'higher',mode:'alternateBattle',runId:'lazy-audio-test'}));
  assert.equal(await page.evaluate(()=>CivilizationAudio.sfxDiagnostics().prepared),0,'gesture and battle start never warm SFX');
  assert.equal(requests.length,0);
  assert.equal(await page.evaluate(()=>CivilizationAudio.playSfx('normal-attack')),true);
  await page.waitForFunction(()=>CivilizationAudio.sfxDiagnostics().started===1);
  assert.equal(new Set(requests).size,1,'only requested sample is fetched');
  const visible=await page.evaluate(()=>CivilizationAudio.sfxDiagnostics());
  assert.equal(visible.prepared,1);assert.equal(visible.failed,0);
  await page.evaluate(()=>{
   Object.defineProperty(document,'hidden',{configurable:true,value:true});
   document.dispatchEvent(new Event('visibilitychange'));
  });
  const hidden=await page.evaluate(()=>({sfx:CivilizationAudio.sfxDiagnostics(),runtime:CivilizationAudio.runtimeStats()}));
  assert.equal(hidden.sfx.prepared,0);assert.equal(hidden.sfx.active,0);assert.equal(hidden.sfx.gmActive,0);assert.equal(hidden.runtime.formalMusicVoices,0);
  await page.evaluate(()=>{
   Object.defineProperty(document,'hidden',{configurable:true,value:false});
   document.dispatchEvent(new Event('visibilitychange'));
  });
  assert.equal(await page.evaluate(()=>CivilizationAudio.sfxDiagnostics().prepared),0,'foreground does not warm the bank');
  await page.evaluate(()=>{document.body.classList.add('main-minimal-mode-open');CivilizationAudio.update();});
  assert.equal(await page.evaluate(()=>CivilizationAudio.playSfx('critical')),false,'minimal blocks sound');
  assert.equal(await page.evaluate(()=>CivilizationAudio.runtimeStats().formalMusicVoices),0);
  await page.evaluate(()=>{
   document.body.classList.remove('main-minimal-mode-open');
   CivilizationAudio.setLevel('musicEnabled',false);CivilizationAudio.setLevel('effectsEnabled',false);
   CivilizationAudio.setLevel('music',.23);CivilizationAudio.setLevel('battle',.37);
  });
  await page.reload();await page.waitForFunction(()=>!!window.CivilizationAudio);
  const prefs=await page.evaluate(()=>CivilizationAudio.settings());
  assert.equal(prefs.musicEnabled,false);assert.equal(prefs.effectsEnabled,false);assert.equal(prefs.music,.23);assert.equal(prefs.battle,.37);
  assert.equal(await page.evaluate(()=>CivilizationAudio.playSfx('critical')),false);
  assert.deepEqual(errors,[]);
  fs.writeFileSync('/tmp/batch11-audio-lazy-browser.json',JSON.stringify({passed:true,visible,hidden,prefs,requestedSamples:[...new Set(requests)],realDevice:false},null,2));
  console.log('PASS native lazy SFX, background release, minimal silence and preferences across reload');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
