'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const sdk=`window.supabase={createClient(){return{auth:{onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}},async getSession(){return{data:{session:{user:{id:'batch27-preview-test'}}},error:null}}},from(){return{select(){return this},eq(){return this},single(){return Promise.resolve({data:null,error:null})}}}}}};`;
async function finishIntro(page){
 await page.locator('#civilizationStoryModal.open').waitFor({state:'visible',timeout:60000});
 const actions=page.locator('#civilizationStoryModal #storyActions');
 for(let i=0;i<100;i++){
  const end=actions.getByRole('button',{name:'結束',exact:true});
  if(await end.count()){
   await end.click();await page.locator('#civilizationStoryModal.open').waitFor({state:'hidden'});
   await page.locator('#civilizationStarterGearModal').getByRole('button',{name:'領取裝備',exact:true}).click();
   await page.locator('#civilizationStarterGearModal').waitFor({state:'hidden'});
   await page.locator('#gameIntroModal.show').waitFor({state:'visible'});
   await page.locator('#gameIntroModal').getByRole('button',{name:'踏上征途',exact:true}).click();
   await page.locator('#gameIntroModal.show').waitFor({state:'hidden'});return;
  }
  await actions.getByRole('button',{name:'下一頁',exact:true}).click();
 }
 throw new Error('Intro did not reach its actual completion button');
}
const root=new URL('./',process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html');
const registry=JSON.parse(fs.readFileSync('assets/3d/asset-registry.json'));
const slots=['weapon','helmet','armor','shoes','accessory'];
const names=Object.fromEntries(slots.map(s=>[s,registry.assets.find(a=>a.type==='equipment'&&a.slot===s).names[0]]));
const report={commit:process.env.GITHUB_SHA||null,realIPhone:false,cases:[],errors:[]};
const scene=()=>BABYLON.EngineStore.Instances.flatMap(e=>e.scenes).find(s=>s.metadata?.civilization3dCharacter);
const meta=p=>p.evaluate(()=>BABYLON.EngineStore.Instances.flatMap(e=>e.scenes).find(s=>s.metadata?.civilization3dCharacter)?.metadata.civilization3dCharacter);
async function ready(p,q,count=5,source=null){await p.waitForFunction(({q,count,source})=>{const s=window.BABYLON?.EngineStore.Instances.flatMap(e=>e.scenes).find(s=>s.metadata?.civilization3dCharacter);const m=s?.metadata.civilization3dCharacter;return m?.assetKind==='skinned-glb'&&m.quality===q&&(!source||m.appearanceSource===source)&&Object.keys(m.equipmentAssets||{}).length===count&&s.isReady();},{q,count,source},{timeout:60000});}
const truth=p=>p.evaluate(()=>JSON.stringify({equipment:state.equipment,inventory:state.inventory,enhancement:state.enhancement,level:state.level,gm:state.gm,audio:localStorage.getItem('civilization.audio.preferences.v1')}));
async function views(p,prefix){
 for(const [name,alpha] of [['front',Math.PI/2],['side',0],['back',-Math.PI/2]]){
  await p.evaluate(a=>{const s=BABYLON.EngineStore.Instances.flatMap(e=>e.scenes).find(s=>s.metadata?.civilization3dCharacter);s.activeCamera.alpha=a;s.render();},alpha);
  await p.locator('canvas').last().screenshot({path:`/tmp/b28c-${prefix}-${name}.png`,timeout:60000});
 }
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const context=await browser.newContext({viewport:{width:1280,height:800}});
  await context.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({status:200,contentType:'text/javascript',body:sdk}));
  await context.addInitScript(()=>{localStorage.setItem('civilization-war-gm-authorized-v2-account-batch27-preview-test','1');});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(String(e)));let glbRequests=0;
  page.on('request',r=>{if(/\.glb(?:\?|$)/.test(r.url()))glbRequests++;});
  await page.goto(new URL('index.html',root).href,{waitUntil:'load'});
  await page.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready',null,{timeout:60000});
  await page.locator('#civilizationModeChooseText').click();await finishIntro(page);
  assert.equal(glbRequests,0,'text startup never fetches equipment');
  // Isolated fixture only; never a production account/cloud save. Exercise the
  // real state.equipment -> capture -> formal preview -> GM message path.
  await page.evaluate(names=>{for(const [slot,name] of Object.entries(names))state.equipment[slot]={...state.equipment[slot],name,visualKey:name,world:1,q:3,level:31};go('character');},names);
  const baseline=await truth(page);const cold=Date.now();await page.locator('#civilization3dCharacterToggle').click();
  await ready(page,'medium');report.coldReadyMs=Date.now()-cold;report.formal=await meta(page);
  assert.equal(report.formal.appearanceSource,'formal');assert.equal(report.formal.bones,53);assert.equal(Object.keys(report.formal.equipmentAssets).length,5);
  await views(page,'formal-desktop');
  const native=await page.evaluate(async()=>{
   const s=BABYLON.EngineStore.Instances.flatMap(e=>e.scenes).find(s=>s.metadata?.civilization3dCharacter);
   const ds=s.metadata.civilization3dCharacter.modelDescriptors,baseMeshes=s.meshes.filter(m=>m.name.startsWith('CW_Player_Foundation')&&m.getTotalVertices()>0);
   const update=async chosen=>{const d=ds.map(x=>({...x,present:chosen.includes(x.type)}));if(!await Civilization3DCharacterAssets.updateEquipment(s,d))throw Error('update failed');s.render();return s.metadata.civilization3dCharacter;};
   await update([]);const indices=baseMeshes.map(m=>Array.from(m.getIndices()));const emptyMeshes=s.meshes.length;
   const finger=s.getTransformNodeByName('middle_02.R'),unheld=finger.rotationQuaternion.clone();
   const checks=[];
   for(const slot of ['weapon','helmet','armor','shoes','accessory']){
    const m=await update([slot]);if(Object.keys(m.equipmentAssets).length!==1||!m.equipmentAssets[slot])throw Error('single-slot '+slot);
    if(slot==='weapon'&&Math.abs(BABYLON.Quaternion.Dot(finger.rotationQuaternion,unheld))>.999)throw Error('weapon grasp not applied');
    if(slot==='shoes'){const meshes=s.meshes.filter(m=>m.name.startsWith('CW_Relic_shoes'));if(!meshes.length||!meshes.every(m=>m.skeleton===baseMeshes[0].skeleton))throw Error('paired shoes bind');}
    await update([]);if(baseMeshes.some((m,i)=>JSON.stringify(Array.from(m.getIndices()))!==JSON.stringify(indices[i])))throw Error('mask restore '+slot);
    if(Math.abs(BABYLON.Quaternion.Dot(finger.rotationQuaternion,unheld))<.99999)throw Error('weapon grasp not restored');
    if(s.meshes.length!==emptyMeshes)throw Error('single-slot mesh leak '+slot);checks.push(slot);
   }
   const all=['weapon','helmet','armor','shoes','accessory'];await update(all);
   const helmet=s.meshes.filter(m=>m.name.startsWith('CW_Relic_helmet')&&m.getTotalVertices()>0),head=s.getTransformNodeByName('head');let opaqueRays=0;
   for(const height of [-.015,.065,.13])for(const [x,z,y] of [[0,1,0],[.8,.6,0],[-.8,.6,0],[1,0,0],[-1,0,0],[0,-1,0],[0,.7,.7],[0,.7,-.7]]){
    const target=BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0,height,.05),head.getWorldMatrix()),dir=new BABYLON.Vector3(x,y,z).normalize();
    const ray=new BABYLON.Ray(target.add(dir.scale(.8)),dir.negate(),.8),hits=ray.intersectsMeshes(helmet);
    if(!hits.length||hits[0].distance>=.8)throw Error('helmet exposes face ray');opaqueRays++;
   }

   for(const slot of all){const m=await update(all.filter(x=>x!==slot));if(Object.keys(m.equipmentAssets).length!==4||m.equipmentAssets[slot])throw Error('independent unequip');await update(all);}
   for(let i=0;i<30;i++){await update(i%2?all:[]);if(Civilization3DCharacterAssets.snapshot().equipmentContainers!==(i%2?5:0))throw Error('container leak on toggle');}
   await update(all);
   const group=s.animationGroups[0];group.pause();group.goToFrame(0);s.render();
   const meshes=s.meshes.filter(m=>m.skeleton&&m.getTotalVertices()>0),poses=[];
   for(const [name,degrees] of [['head',25],['upper_arm.L',35],['forearm.L',70],['spine_01',15],['thigh.L',35],['shin.L',60],['foot.L',20],['hand.R',15]]){
    const node=s.getTransformNodeByName(name),q=node.rotationQuaternion.clone(),before=meshes.map(m=>Array.from(m.getPositionData(true)));
    node.rotationQuaternion=q.multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X,degrees*Math.PI/180));s.render();meshes[0].skeleton.prepare();
    let movement=0;
    for(let j=0;j<meshes.length;j++){const after=meshes[j].getPositionData(true);if(!after.every(Number.isFinite))throw Error('nonfinite pose');movement=Math.max(movement,...after.map((v,k)=>Math.abs(v-before[j][k])));}
    if(movement<.001)throw Error('pose does not deform '+name);poses.push({name,movement});node.rotationQuaternion=q;s.render();
   }
   group.play(true);
   return {checks,poses,opaqueRays,maskRestored:true,cycles:30,stats:Civilization3DCharacterAssets.snapshot(),meshes:s.meshes.length};
  });
  report.native=native;report.cases.push('empty, all five singles, all equipped, every independent unequip, exact index restoration, 30 cycles, 8 native joint poses');
  assert.equal(await truth(page),baseline,'preview never writes formal fixture state');
  await page.locator('#civilization3dFormalHost').getByRole('button',{name:'放大 3D 預覽',exact:true}).click();
  await page.locator('#civilization3dFormalHost').getByRole('button',{name:'還原 3D 預覽',exact:true}).click();
  await page.locator('#civilization3dFormalHost').getByRole('button',{name:'關閉 3D 預覽',exact:true}).click();
  assert.equal(await page.evaluate(()=>Civilization3DCharacterAssets.snapshot().equipmentContainers),0);
  const before=glbRequests,start=Date.now();await page.locator('#civilization3dCharacterToggle').click();await ready(page,'medium');report.hotReadyMs=Date.now()-start;
  assert.equal(glbRequests,before,'warm full set uses verified CPU buffers');report.hotGLBRequests=glbRequests-before;
  await page.evaluate(()=>civilization3dToggleCharacter());
  await page.setViewportSize({width:390,height:844});await page.locator('#civilization3dCharacterToggle').click();await ready(page,'low');await views(page,'formal-mobile');
  await page.locator('#civilization3dFormalHost').getByRole('button',{name:'放大 3D 預覽',exact:true}).click();await views(page,'formal-mobile-max');await page.locator('#civilization3dFormalHost').getByRole('button',{name:'還原 3D 預覽',exact:true}).click();
  report.mobile=await meta(page);await page.evaluate(()=>civilization3dToggleCharacter());
  assert.equal(await page.evaluate(()=>Civilization3DCharacterAssets.snapshot().equipmentContainers),0);
  await page.setViewportSize({width:1280,height:800});
  assert.equal(await page.evaluate(()=>openGm3DPrototype()),true);
  await page.waitForFunction(()=>document.querySelector('#gm3dPrototypeOverlay iframe')?.contentWindow?.Civilization3DTestCenter?.version===5,null,{timeout:60000});
  const frame=page.frames().find(f=>f.url().includes('/3d-test/'));
  await frame.locator('#categoryList .center-category').filter({hasText:'玩家、裝備與養成'}).click();await frame.locator('#caseList').getByRole('button',{name:'角色全身展示',exact:true}).click();await ready(frame,'medium');
  assert.deepEqual((await meta(frame)).equipmentAssets,report.formal.equipmentAssets,'formal/GM exact same asset identities');await views(frame,'gm');
  await frame.locator('#quality').selectOption('high');await ready(frame,'high');report.high=await meta(frame);
  await frame.locator('#appearanceDetails summary').click();await frame.locator('#appearanceFree').click();
  await frame.locator('#appearanceWorld').selectOption('1');await frame.locator('#appearanceRegion').selectOption('0');await frame.locator('#appearanceSet').selectOption('6');
  await ready(frame,'high',5,'fixture');assert.equal((await meta(frame)).appearanceSource,'fixture');
  await frame.locator('#caseList').getByRole('button',{name:'五槽裝備陳列',exact:true}).click();
  await frame.waitForFunction(()=>{const m=BABYLON.EngineStore.Instances.flatMap(e=>e.scenes).find(s=>s.metadata?.civilization3dEquipment)?.metadata.civilization3dEquipment;return Object.values(m?.equipmentStatus||{}).filter(x=>x==='equipment-glb').length===5;},null,{timeout:60000});
  await frame.locator('canvas').last().screenshot({path:'/tmp/b28c-gm-equipment-display.png',timeout:60000});
  await page.locator('#gm3dPrototypeOverlay').getByRole('button',{name:'← 返回原本畫面',exact:true}).click();assert.equal(await truth(page),baseline);
  report.cases.push('formal/GM identity, free catalog Ancient Ruins, low/medium/high, real equipment display, maximize/restore, warm reuse and close');
  await context.close();
  // Slot fault injection (missing model, SHA corruption), real Babylon loader.
  for(const fault of ['missing','sha']){
   const ctx=await browser.newContext();await ctx.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({status:200,contentType:'text/javascript',body:sdk}));
   await ctx.route('**/helmet-*.glb*',r=>r.fulfill(fault==='missing'?{status:404,body:'fixture missing'}:{status:200,body:Buffer.alloc(registry.assets.find(a=>a.slot==='helmet'&&a.quality==='medium').bytes)}));
   const p=await ctx.newPage();await p.goto(new URL('index.html',root).href);await p.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready',null,{timeout:60000});await p.locator('#civilizationModeChooseText').click();await finishIntro(p);
   await p.evaluate(names=>{for(const [slot,name] of Object.entries(names))state.equipment[slot]={...state.equipment[slot],name,world:1,q:3,level:31};go('character');},names);
   await p.locator('#civilization3dCharacterToggle').click();await ready(p,'medium',4);const m=await meta(p);assert.equal(m.equipmentStatus.helmet,'fallback');assert.ok(!m.hiddenRegions.includes('face-covered'));assert.equal(m.assetKind,'skinned-glb');await ctx.close();report.cases.push(fault+' helmet: other four slots and original face survive');
  }
  assert.deepEqual(report.errors,[]);report.passed=true;console.log('PASS Batch28C actual formal/GM wearables, masks, joints, LOD, hot reuse, faults and release');
 }catch(e){report.error=String(e.stack);report.passed=false;throw e;}
 finally{fs.writeFileSync('3d-equipment-browser-report.json',JSON.stringify(report,null,2)+'\n');await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
