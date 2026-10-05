const {chromium}=require("playwright");
const assert=require("assert");
const fs=require("fs");

(async()=>{
 const equipmentCore=fs.readFileSync("equipmentrewardcore.js","utf8");
 const equipmentLock=fs.readFileSync("equipmentlock.js","utf8");
 const playerSemantics=fs.readFileSync("playersemanticsui.js","utf8");
 assert(/SHARED_EQUIPMENT_WORLD_SEMANTICS_VERSION=WORLD_SEMANTICS_VERSION/.test(equipmentCore),"Shared equipment world semantics owner missing.");
 assert(/const world=equipmentWorld\(item\);/.test(equipmentLock),"Lost-gear normalization must consume canonical three-world semantics.");
 assert(!/Number\(item\.world\)===2\?2:1/.test(equipmentLock),"equipmentlock must not collapse W3 gear into W1.");
 assert(/window\.sharedEquipmentWorld\(item\)/.test(playerSemantics),"Player character semantics must consume canonical equipment world owner.");
 assert(/CHARACTER_WORLD_SNAPSHOT_OWNER="playersemanticsui"/.test(playerSemantics),"Player semantics must own the canonical three-world character snapshot.");
 assert(/CHARACTER_WORLD_SNAPSHOT_CANONICAL_PHASE_VERSION=1/.test(playerSemantics),"Character snapshot canonical phase contract missing.");

 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on("pageerror",error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const url=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 try{
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>window.SHARED_EQUIPMENT_WORLD_SEMANTICS_VERSION===1&&window.EQUIPMENT_WORLD_SEMANTICS_VERSION===1&&window.PLAYER_SEMANTICS_UI_VERSION===15&&window.CHARACTER_WORLD_SNAPSHOT_OWNER==="playersemanticsui"&&window.CHARACTER_WORLD_SNAPSHOT_CANONICAL_PHASE_VERSION===1&&typeof window.sharedEquipmentWorld==="function"&&typeof window.characterWorldSnapshot==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const worlds=[window.sharedEquipmentWorld({world:1}),window.sharedEquipmentWorld({world:2}),window.sharedEquipmentWorld({world:3}),window.sharedEquipmentWorld({world:99})];
   const labels=[window.sharedEquipmentWorldLabel(1),window.sharedEquipmentWorldLabel(2),window.sharedEquipmentWorldLabel(3)];
   const item3=window.makeEquipmentRewardItem({world:3,level:1350,q:5,type:"weapon",name:"W3語意測試",sell:0,buy:0,rng:()=>.42});
   const w1=newState();w1.level=500;
   const w2=newState();w2.secondWorld=createBlankSecondWorldState();w2.secondWorld.entered=true;w2.level=600;w2.equipment.weapon=window.makeEquipmentRewardItem({world:2,level:600,q:4,type:"weapon",name:"W2語意測試",sell:0,buy:0,rng:()=>.42});
   const w3=newState();w3.secondWorld=createBlankSecondWorldState();w3.secondWorld.entered=true;w3.thirdWorld=createBlankThirdWorldState();w3.thirdWorld.entered=true;w3.thirdWorld.dimensionalStrings=321;w3.level=1350;w3.equipment.weapon=item3;
   const w1Snapshot=window.characterWorldSnapshot(w1),w2Snapshot=window.characterWorldSnapshot(w2),w3Snapshot=window.characterWorldSnapshot(w3);
   return {worlds,labels,item3:{world:item3.world,level:item3.level},w1:{world:w1Snapshot.world,label:w1Snapshot.worldLabel,cap:w1Snapshot.cap},w2:{world:w2Snapshot.world,label:w2Snapshot.worldLabel,equipped:w2Snapshot.equippedWorlds.weapon,cap:w2Snapshot.cap},w3:{world:w3Snapshot.world,label:w3Snapshot.worldLabel,equipped:w3Snapshot.equippedWorlds.weapon,resourceLabel:w3Snapshot.resourceLabel,resourceAmount:w3Snapshot.resourceAmount,cap:w3Snapshot.cap}};
  });
  assert.deepEqual(report.worlds,[1,2,3,1],"Canonical equipment world owner must preserve W1/W2/W3 and fail malformed values to W1.");
  assert.deepEqual(report.labels,["銀河紀元","宇宙紀元","高維紀元"]);
  assert.deepEqual(report.item3,{world:3,level:1350},"W3 reward factory must preserve world:3 metadata.");
  assert.deepEqual(report.w1,{world:1,label:"銀河紀元",cap:500});
  assert.deepEqual(report.w2,{world:2,label:"宇宙紀元",equipped:2,cap:1000});
  assert.equal(report.w3.world,3);assert.equal(report.w3.label,"高維紀元");assert.equal(report.w3.equipped,3);assert.equal(report.w3.resourceLabel,"維度之弦");assert.equal(report.w3.resourceAmount,321);assert.equal(report.w3.cap,2000);
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Equipment three-world semantics Batch2 integrity passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});