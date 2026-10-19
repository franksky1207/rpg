'use strict';
const sdk=`window.supabase={createClient(){return{auth:{onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}},async getSession(){return{data:{session:{user:{id:'t1a-snapshot-test'}}},error:null}}},from(){return{select(){return this},eq(){return this},single(){return Promise.resolve({data:null,error:null})}}}}}};`;
async function finishIntro(page){
 await page.waitForFunction(()=>document.querySelector('#civilizationStoryModal.open')||document.querySelector('#gameIntroModal.show'),null,{timeout:60000});
 if(await page.locator('#gameIntroModal.show').count()&&!await page.locator('#civilizationStoryModal.open').count()){
  await page.locator('#gameIntroModal').getByRole('button',{name:'踏上征途',exact:true}).click();return;
 }
 await page.locator("#civilizationStoryModal.open").waitFor({state:"visible",timeout:60000});
 const actions=page.locator("#civilizationStoryModal #storyActions");
 for(let i=0;i<100;i++){
  const end=actions.getByRole("button",{name:"結束",exact:true});
  if(await end.count()){
   await end.click();await page.locator("#civilizationStoryModal.open").waitFor({state:"hidden"});
   await page.locator("#civilizationStarterGearModal").getByRole("button",{name:"領取裝備",exact:true}).click();
   await page.locator("#civilizationStarterGearModal").waitFor({state:"hidden"});
   await page.locator("#gameIntroModal").getByRole("button",{name:"踏上征途",exact:true}).click();
   await page.locator("#gameIntroModal.show").waitFor({state:"hidden"});return;
  }
  await actions.getByRole("button",{name:"下一頁",exact:true}).click();
 }
 throw Error("Intro did not finish through its formal controls");
}
module.exports={sdk,finishIntro};

// Idle warming replaces the historical zero-sprite-startup contract. Keep strict
// identity, download, memory, lease and no-engine bounds on the real game page.
async function assertStartupSprites(page,requests){
 const assert=require('node:assert/strict');
 const proof=await page.evaluate(async()=>{
  const warmed=await CivilizationFormalBRenderer.warmSprites();
  return {enabled:CivilizationPresentationMode.combatAnimationEnabled(),warmed,stats:CivilizationFormalBRenderer.spriteStats(),entry:CivilizationFormalBEntry.diagnostics(),canvases:document.querySelectorAll('.formal-b-whole-suit,.formal-b-enemy-sprite').length};
 });
 if(!proof.enabled){assert.equal(proof.warmed,false);assert.equal(requests.length,0,'disabled animations never warm sprites');assert.equal(proof.stats.bytes,0);return;}
 assert.equal(proof.warmed,true,'current appearance can warm before battle');
 assert.equal(requests.length,2,'only current appearance fallback and attack atlas');
 assert.equal(new Set(requests).size,2,'no duplicate startup fetch');
 assert(requests.every(u=>/assets\/era-player\/v1\/era-galaxy(?:-attack-atlas)?\.webp\?sha=[a-f0-9]{64}$/.test(u)),JSON.stringify(requests));
 assert.equal(proof.stats.bytes,2*512*512*4);assert.equal(proof.stats.refs,0);assert.equal(proof.stats.pending,0);
 assert.equal(proof.entry.engines,0);assert.equal(proof.canvases,0);
}
module.exports.assertStartupSprites=assertStartupSprites;
