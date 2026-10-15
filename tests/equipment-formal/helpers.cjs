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
