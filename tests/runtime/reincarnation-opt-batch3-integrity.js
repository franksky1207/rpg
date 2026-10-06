const {chromium}=require("playwright");
const assert=require("assert");

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on("pageerror",error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const url=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 try{
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>window.BREAKTHROUGH_PLAYER_UI_VERSION===1&&window.BREAKTHROUGH_PLAYER_NOTICE_BRIDGE_VERSION===1&&window.CHARACTER_BREAKTHROUGH_UI_VERSION===3&&typeof window.queueBreakthroughPlayerNotice==="function"&&typeof window.breakthroughPlayerNoticeSnapshot==="function"&&typeof window.gainEffectiveExpForState==="function",{timeout:30000});

  const snapshot=await page.evaluate(()=>window.breakthroughPlayerNoticeSnapshot({awarded:3,milestones:[100,200,300],permanentBefore:7,permanentAfter:10,currentLifeBefore:0,currentLifeAfter:3}));
  assert.equal(snapshot.title,"突破成功！");
  assert.equal(snapshot.milestoneText,"Lv.100、Lv.200、Lv.300");
  assert.equal(snapshot.levelText,"突破等級提升 3 級");
  assert.equal(snapshot.currentText,"目前突破等級 Lv.10");
  assert.equal(snapshot.equipmentBonusPercent,25);
  assert.equal(snapshot.finalDamageBonusPercent,50);
  assert.ok(!/(?:^|\s)B(?:\+|\d)/.test(JSON.stringify(snapshot)),"Player breakthrough notice must not expose internal B notation.");

  const modal=await page.evaluate(()=>{
   window.openBreakthroughPlayerNotice({awarded:3,milestones:[100,200,300],permanentBefore:7,permanentAfter:10,currentLifeBefore:0,currentLifeAfter:3});
   const node=document.getElementById("breakthroughPlayerModal");
   const result={exists:!!node,shown:node?.classList.contains("show")===true,title:node?.querySelector("h3")?.textContent||"",text:node?.textContent||""};
   window.closeBreakthroughPlayerNotice();
   return result;
  });
  assert.equal(modal.exists,true);assert.equal(modal.shown,true);assert.equal(modal.title,"突破成功！");
  assert.ok(modal.text.includes("突破等級提升 3 級")&&modal.text.includes("目前突破等級 Lv.10"));
  assert.ok(modal.text.includes("+25%")&&modal.text.includes("+50%"));
  assert.ok(!/(?:^|\s)B(?:\+|\d)/.test(modal.text),"Visible breakthrough modal must not expose internal B notation.");

  const bridge=await page.evaluate(()=>{
   const clone=v=>JSON.parse(JSON.stringify(v));
   const originalState=clone(state),originalQueue=window.queueBreakthroughPlayerNotice;
   const milestones=()=>Object.fromEntries((window.BREAKTHROUGH_MILESTONE_LEVELS||[]).map(v=>[String(v),false]));
   const expToReach=(from,to,target)=>{let total=0;for(let level=from;level<to;level++)total+=window.effectiveExpNeed(level,target);return total;};
   const makeState=(count,permanent,level)=>{
    const s=newState();
    s.level=level;s.exp=0;
    s.reincarnation={count,breakthrough:{permanent,milestoneLifeId:count,milestones:milestones()},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}};
    return s;
   };
   const calls=[];
   window.queueBreakthroughPlayerNotice=result=>{calls.push(clone(result));return result;};
   try{
    state=makeState(2,7,73);
    const logs=[];
    const ups=window.gainEffectiveExpForState(expToReach(73,312,state),state,logs);
    const reincarnated={ups,level:state.level,permanent:state.reincarnation.breakthrough.permanent,calls:clone(calls),logs:logs.slice()};
    calls.length=0;
    state=makeState(0,0,99);
    const firstLogs=[];
    const firstUps=window.gainEffectiveExpForState(expToReach(99,100,state),state,firstLogs);
    const first={ups:firstUps,level:state.level,permanent:state.reincarnation.breakthrough.permanent,calls:clone(calls),logs:firstLogs.slice()};
    return {reincarnated,first};
   }finally{window.queueBreakthroughPlayerNotice=originalQueue;state=originalState;}
  });
  assert.equal(bridge.reincarnated.ups,239);assert.equal(bridge.reincarnated.level,312);assert.equal(bridge.reincarnated.permanent,10);
  assert.equal(bridge.reincarnated.calls.length,1,"A multi-milestone natural level gain must queue exactly one summarized popup.");
  assert.equal(bridge.reincarnated.calls[0].awarded,3);assert.deepEqual(bridge.reincarnated.calls[0].milestones,[100,200,300]);
  assert.ok(bridge.reincarnated.logs.some(line=>line.includes("突破等級提升 3 級")&&line.includes("目前為 Lv.10")));
  assert.equal(bridge.first.ups,1);assert.equal(bridge.first.level,100);assert.equal(bridge.first.permanent,0);assert.equal(bridge.first.calls.length,0,"First run must not queue breakthrough UI.");

  const character=await page.evaluate(()=>{
   const clone=v=>JSON.parse(JSON.stringify(v));
   const originalState=clone(state),originalView=typeof view!=="undefined"?view:"home";
   const milestones=()=>Object.fromEntries((window.BREAKTHROUGH_MILESTONE_LEVELS||[]).map(v=>[String(v),false]));
   const rowText=label=>Array.from(document.querySelectorAll(".character-stats-grid .stat")).find(row=>String(row.textContent||"").trim().startsWith(label))?.textContent||"";
   try{
    const s=newState();s.reincarnation={count:3,breakthrough:{permanent:7,milestoneLifeId:3,milestones:milestones()},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:3,failures:{}}}};
    state=s;view="character";render();
    const reincarnation7=rowText("轉生次數"),lv7=rowText("突破等級"),equipment7=rowText("突破裝備加成"),damage7=rowText("突破最終傷害"),note7=document.querySelector('[data-character-breakthrough-note="1"]')?.textContent||"",snapshot7=window.characterWorldSnapshot(state);
    state.reincarnation={count:0,breakthrough:{permanent:0,milestoneLifeId:0,milestones:milestones()},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:0,failures:{}}}};
    render();
    const reincarnation0=rowText("轉生次數"),lv0=rowText("突破等級"),equipment0=rowText("突破裝備加成"),damage0=rowText("突破最終傷害"),note0=document.querySelector('[data-character-breakthrough-note="1"]')?.textContent||"";
    return {reincarnation7,lv7,equipment7,damage7,note7,reincarnation0,lv0,equipment0,damage0,note0,snapshot7};
   }finally{state=originalState;view=originalView;render();}
  });
  assert.ok(character.reincarnation7.replace(/\s+/g,"").includes("轉生次數3次"),"Reincarnated character page must show reincarnation count.");
  assert.ok(character.lv7.replace(/\s+/g,"").includes("突破等級Lv.7"),"Character page must show permanent breakthrough level.");
  assert.ok(character.equipment7.replace(/\s+/g,"").includes("突破裝備加成+17.5%"),"Character page must show breakthrough equipment bonus with explicit breakthrough wording.");
  assert.ok(character.damage7.replace(/\s+/g,"").includes("突破最終傷害+35%"),"Character page must show breakthrough final damage bonus with explicit breakthrough wording.");
  assert.equal(character.note7.trim(),"突破每級：裝備原始 HP／攻擊／防禦 +2.5%，最終傷害 +5%。");
  assert.ok(character.reincarnation0.replace(/\s+/g,"").includes("轉生次數尚未轉生"),"First-run character page must explicitly show not yet reincarnated.");
  assert.ok(character.lv0.replace(/\s+/g,"").includes("突破等級Lv.0"),"First-run character page must explicitly show breakthrough Lv.0.");
  assert.ok(character.equipment0.replace(/\s+/g,"").includes("突破裝備加成+0%")&&character.damage0.replace(/\s+/g,"").includes("突破最終傷害+0%"),"First-run character page must show zero breakthrough bonuses.");
  assert.equal(character.note0.trim(),"突破每級：裝備原始 HP／攻擊／防禦 +2.5%，最終傷害 +5%。");
  assert.equal(character.snapshot7.breakthroughLevel,7);
  assert.equal(character.snapshot7.reincarnationCount,3);
  assert.ok(!/(?:^|\s)B(?:\+|\d)/.test(character.reincarnation7+character.lv7+character.equipment7+character.damage7+character.reincarnation0+character.lv0+character.equipment0+character.damage0),"Character page must not expose internal B notation.");
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Reincarnation optimization batch 3 integrity passed:",JSON.stringify({snapshot,modal,bridge,character}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});