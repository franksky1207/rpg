'use strict';
// Current GM, refined assets and compound poses. No retired formal UI is used.
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const base=process.env.BATCH28_BASE_URL||'http://127.0.0.1:4175/',out=process.env.BATCH28_EVIDENCE||'/tmp/batch28-consolidated';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const errors=[],report={source:'current GM C-08 free fixture; isolated catalog receiver, not formal account acceptance',physicalGPU:false,realIPhone:false,tiers:[]};
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'3d-test/?embedded=1');await page.waitForFunction(()=>window.Civilization3DTestCenter?.version===5);
  await page.locator('#caseList').getByRole('button',{name:'角色全身展示',exact:true}).click();await page.locator('#appearanceDetails summary').click();await page.locator('#appearanceFree').click();
  const rows=JSON.parse(fs.readFileSync('development/3d-source/equipment/concepts/_concept-index.json')).sets.slice(0,10);
  const catalog={1:[{name:'地球戰爭',entries:rows.map(r=>({name:r.regionOrBoss.split(' → ')[1],level:r.level.max,names:Object.values(r.equipmentNames)}))}]};
  await page.evaluate(catalog=>window.postMessage({type:'civilization3d:appearance-response',appearance:{version:2,source:'formal',world:1,equipment:{},specializations:{},markLevels:{}},catalog},location.origin),catalog);
  await page.waitForFunction(()=>document.querySelector('#appearanceRegion option'));
  await page.locator('#appearanceWorld').selectOption('1');await page.locator('#appearanceRegion').selectOption('0');await page.locator('#appearanceSet').selectOption('6');
  await page.locator('#caseList').getByRole('button',{name:'強化鍛造台',exact:true}).click();await page.locator('#appearanceStage').selectOption('0');await page.locator('#caseList').getByRole('button',{name:'角色全身展示',exact:true}).click();
  await page.locator('#maximizePreview').click();
  for(const quality of ['low','medium','high']){
   await page.locator('#quality').selectOption(quality);
   await page.waitForFunction(q=>{const s=window.BABYLON?.EngineStore.Instances.flatMap(e=>e.scenes).find(s=>s.metadata?.civilization3dCharacter);return s?.isReady()&&s.metadata.civilization3dCharacter.quality===q&&Object.keys(s.metadata.civilization3dCharacter.equipmentAssets||{}).length===5;},quality,{timeout:90000});
   const poseRows=[];
   // Actual shared-bone geometric poses, not invented combat calculations.
   const poses={idle:{},headTurn:{head:[0,35,0]},headPitch:{head:[25,0,0]},deepSquat:{'thigh.L':[-50,0,0],'thigh.R':[-50,0,0],'shin.L':[90,0,0],'shin.R':[90,0,0],'foot.L':[-20,0,0],'foot.R':[-20,0,0]},stride:{'thigh.L':[-35,0,0],'thigh.R':[25,0,0],'shin.L':[40,0,0],'foot.L':[-20,0,0]}};
   for(const [name,changes] of Object.entries(poses)){
    const pose=await page.evaluate(async({changes,name})=>{
     const s=BABYLON.EngineStore.Instances.flatMap(e=>e.scenes).find(s=>s.metadata?.civilization3dCharacter);for(const g of s.animationGroups){g.pause();g.goToFrame(0);}s.render();
     const originals=[];for(const [bone,rotation] of Object.entries(changes)){const n=s.getTransformNodeByName(bone);if(!n)throw Error('Missing original bone '+bone);originals.push([n,n.rotationQuaternion.clone()]);for(let i=0;i<3;i++){if(!rotation[i])continue;const inv=n.parent.computeWorldMatrix(true).clone().invert();const axis=BABYLON.Vector3.TransformNormal([BABYLON.Axis.X,BABYLON.Axis.Y,BABYLON.Axis.Z][i],inv).normalize();n.rotationQuaternion=BABYLON.Quaternion.RotationAxis(axis,rotation[i]*Math.PI/180).multiply(n.rotationQuaternion);}n.computeWorldMatrix(true);}
     s.render();const visible=s.meshes.filter(m=>m.skeleton&&m.getTotalVertices()>0);for(const m of visible){const p=m.getPositionData(true);if(!p.every(Number.isFinite))throw Error('Invalid posed vertices');}
     s.activeCamera.alpha=Math.PI/2;s.activeCamera.beta=Math.PI/2;s.render();window.__b28Restore=()=>{for(const[n,q]of originals)n.rotationQuaternion=q;s.render();};
     return {name,bones:s.skeletons[0].bones.length,assets:s.metadata.civilization3dCharacter.equipmentAssets,finiteMeshes:visible.length};
    },{changes,name});
    assert.equal(pose.bones,53);assert.equal(Object.keys(pose.assets).length,5);poseRows.push(pose);
    await page.screenshot({clip:await page.locator('#prototypeHost canvas').boundingBox(),path:`${out}/${quality}-${name}.png`});
    if(name==='deepSquat'||name==='stride'){
     await page.evaluate(()=>{const s=BABYLON.EngineStore.Instances.flatMap(e=>e.scenes).find(s=>s.metadata?.civilization3dCharacter);s.activeCamera.alpha=0;s.render();});
     await page.screenshot({clip:await page.locator('#prototypeHost canvas').boundingBox(),path:`${out}/${quality}-${name}-side.png`});
    }
    await page.evaluate(()=>window.__b28Restore());
   }
   const slots=await page.evaluate(async()=>{
    const s=BABYLON.EngineStore.Instances.flatMap(e=>e.scenes).find(s=>s.metadata?.civilization3dCharacter),ds=s.metadata.civilization3dCharacter.modelDescriptors;
    await Civilization3DCharacterAssets.updateEquipment(s,ds.map(d=>({...d,present:false})));s.render();const original=s.meshes.filter(m=>m.name.startsWith('CW_Player_Foundation')&&m.getTotalVertices()>0).map(m=>[m,Array.from(m.getIndices())]);const checked=[];
    for(const slot of ['weapon','helmet','armor','shoes','accessory']){
     await Civilization3DCharacterAssets.updateEquipment(s,ds.map(d=>({...d,present:d.type===slot})));s.render();if(Object.keys(s.metadata.civilization3dCharacter.equipmentAssets).length!==1)throw Error('single slot');
     await Civilization3DCharacterAssets.updateEquipment(s,ds.map(d=>({...d,present:false})));for(const[m,indices]of original)if(JSON.stringify(Array.from(m.getIndices()))!==JSON.stringify(indices))throw Error('mask restore');checked.push(slot);
    }
    await Civilization3DCharacterAssets.updateEquipment(s,ds);s.activeCamera.alpha=-Math.PI/2;s.render();return checked;
   });
   assert.equal(slots.length,5);await page.screenshot({clip:await page.locator('#prototypeHost canvas').boundingBox(),path:`${out}/${quality}-back.png`});report.tiers.push({quality,poses:poseRows,singleSlots:slots,maskRestored:true});
  }
  await page.evaluate(()=>dispatchEvent(new Event('pagehide')));assert.equal(await page.evaluate(()=>BABYLON.EngineStore.Instances.length),0);assert.deepEqual(errors,[]);report.passed=true;report.remainingEngines=0;
 }finally{report.errors=errors;fs.writeFileSync(out+'/gm-pose-validation.json',JSON.stringify(report,null,2));await browser.close();}
 console.log('PASS current GM three refined LODs, five single slots/empty/mask restoration, head turn/pitch, squat/stride/knee/ankle, dispose');
})().catch(e=>{console.error(e);process.exitCode=1;});
