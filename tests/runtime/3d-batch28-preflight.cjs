'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
function boot(file,extra={}){
 const window={...extra};window.window=window;
 const context={window,console,URL,Map,Set,Promise,...extra};
 vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
 return window;
}
(async()=>{
 const a=boot('3d-test/appearance-snapshot.js').Civilization3DAppearance;
 const slots=['weapon','helmet','armor','shoes','accessory'];
 const equipment=Object.fromEntries(slots.map(slot=>[slot,{low:'test.'+slot+'.low'}]));
 const assets=slots.map(slot=>({id:'test.'+slot+'.low',slot,type:'equipment',quality:'low',preload:false,sha256:'a'.repeat(64),mount:'rigid'}));
 const present=slots.map(type=>a.modelDescriptor(type,{present:true,name:'test '+type,world:2,quality:5},2,40));
 const result=a.resolveEquipment(present,{assets,equipment},'low');
 assert.equal(result.length,5);
 for(const x of result){assert.equal(x.assetKind,'equipment-glb');assert.equal(x.name,'test '+x.type);}
 assert.equal(a.resolveEquipment(present,{assets:[],equipment},'low')[0].assetKind,'geometry-fallback');
 assert.equal(a.resolveEquipment([a.modelDescriptor('helmet',null)],{assets,equipment},'low')[1].assetKind,'none');
 assert.equal(a.resolveEquipment(present,{assets,equipment},'high')[0].assetKind,'geometry-fallback');
 assert.equal(present[0].assetId,null,'resolver does not mutate original descriptors');
 let close;
 const scene={isDisposed:false,onDisposeObservable:{addOnce(fn){close=fn;}}};
 const w=boot('3d-test/character-assets.js',{document:{currentScript:{src:'https://example.invalid/3d-test/character-assets.js'}}});
 const session=w.Civilization3DCharacterAssets.equipmentSession(scene);
 let resolveOld,oldDisposed=0,latestDisposed=0;
 const pending=new Promise(resolve=>{resolveOld=resolve;});
 const first=session.update([{type:'weapon',present:true,assetId:'old'}],async()=>pending);
 const second=session.update([{type:'weapon',present:true,assetId:'new'}],async()=>({dispose(){latestDisposed++;}}));
 resolveOld({dispose(){oldDisposed++;}});
 assert.equal(await first,false);
 assert.equal(await second,true);
 assert.equal(oldDisposed,1,'stale load disposed');
 assert.equal(session.snapshot().slots[0],'weapon');
 await session.update([],async()=>{throw Error('empty never loads');});
 assert.equal(latestDisposed,1,'unequip releases GPU container');
 assert.equal(session.snapshot().slots.length,0);
 close();assert.equal(session.snapshot().disposed,true);
 assert.equal(await session.update([{type:'weapon',present:true,assetId:'late'}],async()=>{throw Error('closed scene must not load');}),false);
 const runtime=fs.readFileSync(path.join(root,'3d-test/character-assets.js'),'utf8');
 assert.match(runtime,/async function prepareEquipment\(/,'real equipment mounting entrypoint');
 assert.match(runtime,/verified\(a\)/,'registered SHA verified bytes');
 assert.match(runtime,/a\.mount!=='rigid'/,'skinned equipment cannot silently bind incorrect joints');
 assert.match(runtime,/no-hide-without-verified-region-mesh/,'base mesh remains visible before segmentation');
 assert.match(runtime,/equipmentSession\(scene\)/,'per-scene lifecycle');
 console.log('PASS Batch28 preflight: five-slot resolver, missing/empty LOD fallback, stale async disposal, unequip, scene close');
})().catch(error=>{console.error(error);process.exitCode=1;});
