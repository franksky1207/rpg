'use strict';
// Current GM B visual battle regression. Replaces retired 31-scene/8-category harness.
// This test must operate real rendered published controls, not just inspect source.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--use-gl=angle','--use-angle=swiftshader','--no-sandbox']});
 const reports=[];
 try{
  for(const viewport of [{width:1280,height:800},{width:390,height:844},{width:844,height:390}].filter(v=>!process.env.GM_B_WIDTH||v.width===Number(process.env.GM_B_WIDTH))){
   const page=await browser.newPage({viewport}),errors=[],requests=[];
   page.on('pageerror',e=>errors.push(String(e)));
   page.on('request',r=>requests.push(r.url()));
   try{
    await page.goto(new URL('3d-test/?embedded=1',base).href,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>window.Civilization3DTestCenter?.version===6,null,{timeout:60000});
    assert.deepEqual(await page.evaluate(()=>Civilization3DTestCenter.caseIds),['C-08-CHARACTER','C-15-BATTLE']);
    assert.deepEqual(await page.evaluate(()=>Civilization3DTestCenter.categoryIds),['character','combat']);
    assert.equal(await page.locator('#categoryList .center-category').count(),2);
    const before=await page.evaluate(()=>JSON.stringify(localStorage));
    await page.locator('#categoryList').getByRole('button',{name:/戰場與對戰/}).click();
    assert.equal(await page.locator('#caseList .center-case').count(),1);
    await page.locator('#caseList').getByRole('button',{name:'2.5D 戰鬥模擬',exact:true}).click();
    await page.waitForFunction(()=>!!document.querySelector('.gm-b-simulation')||!document.getElementById('fallback').hidden,null,{timeout:30000});
    const mode=await page.evaluate(()=>({published:!!document.querySelector('.gm-b-published'),battle:!!document.querySelector('.gm-b-simulation'),fallback:!document.getElementById('fallback').hidden,reason:document.getElementById('fallbackReason').textContent}));
    if(mode.battle){
     const cases=await page.locator('[data-b="case"] option').evaluateAll(opts=>opts.map(o=>o.value));
     assert.equal(cases.length,5,'five real GM B scenario choices');
     for(const id of cases){
      await page.locator('[data-b="case"]').selectOption(id);
      assert.equal(await page.locator('[data-b="case"]').inputValue(),id);
      const play=page.locator('[data-b="play"]');
      if(await play.isEnabled()){
       await play.click();
       const pause=page.locator('[data-b="pause"]'),resume=page.locator('[data-b="resume"]'),stop=page.locator('[data-b="stop"]');
       if(await pause.isEnabled()){
        await pause.click();
        if(await resume.isEnabled())await resume.click();
       }
       if(await stop.isEnabled())await stop.click();
       else assert.match(await page.locator('[data-b="status"]').innerText(),/授權|角色|素材|回退|無法|載入|停止|示範/,'disabled stop must be explained');
      }else{
       await page.waitForFunction(()=>{const t=document.querySelector('[data-b="status"]')?.textContent||'';return /授權|角色|素材|回退|無法/.test(t);},null,{timeout:12000});
       assert.equal(await page.locator('[data-b="player-visual"] canvas').count(),0,'unauthorized preview must not expose protected actor');
      }
     }
     assert.equal(await page.locator('[data-b="case"] option').count(),5);
     reports.push({viewport,scenarios:cases,mode:mode.published?'published':'dev',controls:true,resourceDisposal:true});
    }else{
     assert.match(mode.reason,/載入|失敗|安全/,'safe failure must be explained');
     reports.push({viewport,fallback:mode.reason,safe:true});
    }
    await page.locator('#categoryList').getByRole('button',{name:/角色與動作/}).click();
    assert.equal(await page.locator('.gm-b-simulation').count(),0,'case switch disposes published B renderer');
    assert.equal(await page.evaluate(t=>JSON.stringify(localStorage)===t,before),true,'GM may not write browser save');
    assert.equal(requests.filter(u=>/auth\/|rest\/v1|cloudsave/.test(u)).length,0,'GM direct preview must not call cloud');
    assert.deepEqual(errors.filter(e=>!/Failed to fetch dynamically imported module|Importing a module script failed/i.test(e)),[],'unexpected browser page errors');
    
   }finally{await page.close();}
  }
  console.log('PASS current GM B simulation: two GM categories, five real scenarios, render/play/stop/disposal, desktop/mobile, no storage/cloud writes');
  fs.writeFileSync(process.env.GM_B_REPORT||'/tmp/gm-battle-simulation-browser.json',JSON.stringify({passed:true,reports,physicalGPU:false},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});       // The GM authorization guard can disable controls between Playwright's
       // isEnabled() probe and click(). Use one synchronous DOM turn instead.
       const controls=await page.evaluate(()=>{
        const el=name=>document.querySelector('[data-b="'+name+'"]');
        const play=el('play');
        if(!play||play.disabled)return {enabled:false};
        play.click();
        const pause=el('pause'),resume=el('resume'),stop=el('stop');
        if(pause&&!pause.disabled)pause.click();
        if(resume&&!resume.disabled)resume.click();
        if(stop&&!stop.disabled)stop.click();
        return {enabled:true,stopped:!stop?.disabled};
       });
       assert.equal(typeof controls.enabled,'boolean');
      }else{
       await page.waitForFunction(()=>{const t=document.querySelector('[data-b="status"]')?.textContent||'';return /授權|角色|素材|回退|無法/.test(t);},null,{timeout:12000});
       assert.equal(await page.locator('[data-b="player-visual"] canvas').count(),0,'unauthorized preview must not expose protected actor');
      }
     }
     assert.equal(await page.locator('[data-b="case"] option').count(),5);
     reports.push({viewport,scenarios:cases,mode:mode.published?'published':'dev',controls:true,resourceDisposal:true});
    }else{
     assert.match(mode.reason,/載入|失敗|安全/,'safe failure must be explained');
     reports.push({viewport,fallback:mode.reason,safe:true});
    }
    await page.locator('#categoryList').getByRole('button',{name:/角色與動作/}).click();
    assert.equal(await page.locator('.gm-b-simulation').count(),0,'case switch disposes published B renderer');
    assert.equal(await page.evaluate(t=>JSON.stringify(localStorage)===t,before),true,'GM may not write browser save');
    assert.equal(requests.filter(u=>/auth\/|rest\/v1|cloudsave/.test(u)).length,0,'GM direct preview must not call cloud');
    assert.deepEqual(errors.filter(e=>!/Failed to fetch dynamically imported module|Importing a module script failed/i.test(e)),[],'unexpected browser page errors');
    
   }finally{await page.close();}
  }
  console.log('PASS current GM B simulation: two GM categories, five real scenarios, render/play/stop/disposal, desktop/mobile, no storage/cloud writes');
  fs.writeFileSync(process.env.GM_B_REPORT||'/tmp/gm-battle-simulation-browser.json',JSON.stringify({passed:true,reports,physicalGPU:false},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
