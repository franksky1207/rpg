import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {webcrypto} from 'node:crypto';
import {release} from '../../3d-test/era-player-sprites.mjs';import {createSpritePool} from '../../3d-test/equipment-sprites-v1/assets.mjs';
const source=fs.readFileSync('3d-test/t3b-formal-renderer.js','utf8').replaceAll('import(', '__import(');
function setup(){
 const doc=new EventTarget(),win=new EventTarget();let phase=1,choice=null,enabled=true,fetches=[],decodes=0,hold=null,fault=false;
 Object.assign(doc,{readyState:'complete',hidden:false,body:{classList:{contains:()=>false}}});
 Object.assign(win,{document:doc,navigator:{connection:{}},currentWorldPhase:()=>phase,CivilizationPresentationMode:{combatAnimationEnabled:()=>enabled},CivilizationEraAppearanceContract:{resolve:({world})=>({ready:[1,2,3].includes(world),visualId:choice||['','galaxy','universe','higher'][world]})},requestIdleCallback:()=>1,cancelIdleCallback:()=>{}});
 const __import=async path=>path.includes('era-player-sprites')?{release}:path.includes('actor.mjs')?{}:{createSpritePool:opts=>createSpritePool({...opts,subtle:webcrypto.subtle,fetcher:async(url,{signal})=>{fetches.push(String(url));if(hold)await hold(signal);if(fault)return new Response('',{status:503});return new Response(fs.readFileSync(new URL(url)));},decode:async()=>{decodes++;return {width:512,height:512,close(){}};}})};
 vm.runInNewContext(source,{window:win,__import,AbortController,setTimeout,clearTimeout});
 return {win,doc,api:win.CivilizationFormalBRenderer,setPhase:n=>phase=n,setChoice:n=>choice=n,setEnabled:n=>enabled=n,setFault:n=>fault=n,setHold:n=>hold=n,stats:()=>({fetches:[...fetches],decodes})};
}
test('real release export and shared pool: current era only, deduplicated warmup, 2 MiB, no actors or GPU',async()=>{
 const f=setup();for(const [phase,id] of [[1,'galaxy'],[2,'universe'],[3,'higher']]){
 f.api.clearSpriteCache();f.setPhase(phase);const start=f.stats().fetches.length;
 assert.deepEqual(await Promise.all([f.api.warmSprites(),f.api.warmSprites()]),[true,true]);
 assert.equal(f.stats().fetches.length-start,2);assert(f.stats().fetches.slice(start).every(p=>p.includes('era-'+id)));
 const s=f.api.spriteStats();assert.equal(s.bytes,2*512*512*4);assert.equal(s.refs,0);assert.equal(s.pending,0);
 await f.api.warmSprites();assert.equal(f.stats().fetches.length-start,2,'cached warm does not refetch/decode');
 }
 f.api.clearSpriteCache();f.setPhase(1);f.setChoice('higher');await f.api.warmSprites();assert(f.stats().fetches.at(-1).includes('era-higher'),'reincarnation appearance is authoritative');
 f.api.clearSpriteCache();assert.equal(f.api.spriteStats().bytes,0);
});
test('disabled, hidden, data saver and unknown phase never download; HTTP failure retries',async()=>{
 const f=setup();f.setEnabled(false);assert.equal(await f.api.warmSprites(),false);f.setEnabled(true);
 f.doc.hidden=true;assert.equal(await f.api.warmSprites(),false);f.doc.hidden=false;
 f.win.navigator.connection.saveData=true;assert.equal(await f.api.warmSprites(),false);f.win.navigator.connection.saveData=false;
 f.setPhase(0);assert.equal(await f.api.warmSprites(),false);assert.equal(f.stats().fetches.length,0);f.setPhase(1);
 f.setFault(true);assert.equal(await f.api.warmSprites(),false);assert.equal(f.api.spriteStats().refs,0);assert.equal(f.api.spriteStats().bytes,0);
 f.setFault(false);assert.equal(await f.api.warmSprites(),true);f.api.clearSpriteCache();
});
test('clear and visibility abort in-flight work without stale pool repopulation; recovery uses same pool',async()=>{
 const f=setup();let entered;const began=new Promise(r=>entered=r);
 f.setHold(signal=>new Promise((_,reject)=>{entered();signal.addEventListener('abort',()=>reject(Error('aborted')),{once:true});}));
 const warming=f.api.warmSprites();await began;f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));assert.equal(await warming,false);
 assert.equal(f.api.spriteStats().pending,0);assert.equal(f.api.spriteStats().refs,0);assert.equal(f.api.spriteStats().bytes,0);
 f.doc.hidden=false;f.setHold(null);assert.equal(await f.api.warmSprites(),true);f.api.clearSpriteCache();assert.equal(f.api.spriteStats().entries,0);
});
