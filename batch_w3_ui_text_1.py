from pathlib import Path

TAG='20260928-thirdworld-ui-text-batch1'

def replace(path, old, new, count=1):
    p=Path(path); s=p.read_text(encoding='utf-8')
    actual=s.count(old)
    if actual!=count:
        raise SystemExit(f'{path}: expected {count} matches, got {actual}: {old[:120]}')
    p.write_text(s.replace(old,new,count),encoding='utf-8')

# playersemanticsui.js: W3 home + character semantics only.
replace('playersemanticsui.js','const VERSION=11;','const VERSION=12;')
replace('playersemanticsui.js',
'''   if(title==="強化"&&current===3)desc.textContent="查看已完成的 +40 裝備欄位強化";
   if(title==="專精"&&current===3)desc.textContent="查看已完成並持續生效的 Lv.60 專精";
   if(title==="副本")desc.textContent=current===3?"競技場、虛空幻境與鏡像戰保留；懸賞戰已關閉":"挑戰懸賞、競技場、虛空幻境與鏡像戰";
   if(title==="文明災厄")desc.textContent=current===3?"回顧舊紀元文明災厄":current===2?"討伐宇宙文明級威脅並提升文明等級":"討伐文明級威脅並培養永久印記";''',
'''   if(title==="背包"&&current===3)desc.textContent="整理、裝備與處理裝備";
   if(title==="強化"&&current===3)desc.textContent="查看已完成的 +40 裝備欄位強化";
   if(title==="專精"&&current===3)desc.textContent="查看已完成並持續生效的 Lv.60 專精";
   if(title==="副本")desc.textContent=current===3?"競技場、虛空幻境與鏡像戰":"挑戰懸賞、競技場、虛空幻境與鏡像戰";
   if(title==="文明災厄"){
    if(current===3){const heading=card.querySelector("b");if(heading)heading.textContent="災厄回顧";desc.textContent="回顧銀河紀元與宇宙紀元文明災厄";}
    else desc.textContent=current===2?"討伐宇宙文明級威脅並提升文明等級":"討伐文明級威脅並培養永久印記";
   }
   if(title==="設定"&&current===3)desc.textContent="裝備自動處理、存檔與遊戲設定";''')
replace('playersemanticsui.js',
'''   ensureCharacterStat(grid,"文明等級",`Lv.${snap.civilizationLevel} / ${snap.civilizationMax}`);
   ensureCharacterStat(grid,"最終傷害",`+${snap.civilizationDamageBonusPercent}%`);
   ensureCharacterStat(grid,"界弦核心",`Lv.${snap.coreLevel} / ${snap.coreMax}`);
   let info=card.querySelector(".third-world-character-info");
   if(!info){
    info=document.createElement("div");
    info.className="notice third-world-character-info";
    info.style.marginTop="12px";
    grid.insertAdjacentElement("afterend",info);
   }
   info.innerHTML=`<b>高維紀元完成態</b><div class="muted" style="margin-top:5px">文明 Lv.${snap.civilizationLevel} 的既有效果持續生效；裝備強化維持 +40、8 項專精維持 Lv.60、10 項印記維持 Lv.10。界弦核心只影響高維連戰死亡壓制，不增加一般戰鬥能力。</div>`;''',
'''   ensureCharacterStat(grid,"界弦核心",`Lv.${snap.coreLevel} / ${snap.coreMax}`);''')
replace('playersemanticsui.js','window.CHARACTER_WORLD_PHASE_SEMANTICS_VERSION=2;','window.CHARACTER_WORLD_PHASE_SEMANTICS_VERSION=3;')
replace('playersemanticsui.js','window.THIRD_WORLD_COMPLETED_SYSTEM_UI_VERSION=2;','window.THIRD_WORLD_COMPLETED_SYSTEM_UI_VERSION=3;')

# enhancementui.js: describe current W3 state, not retired W2 resources/future +41.
replace('enhancementui.js','window.ENHANCEMENT_UI_VERSION=7;','window.ENHANCEMENT_UI_VERSION=8;')
replace('enhancementui.js','window.ENHANCEMENT_CURRENT_PHASE_UI_VERSION=1;','window.ENHANCEMENT_CURRENT_PHASE_UI_VERSION=2;')
replace('enhancementui.js',
'高維紀元沿用宇宙紀元完成的 +40 裝備欄位強化；第三紀元不開放 +41 以上強化，也不再消耗暗物質或暗能量。',
'高維紀元沿用已完成的 +40 裝備欄位強化；第三紀元不再開放強化升級。')

# specialization.js: current W3 effects only; no retired economy narrative.
replace('specialization.js',
'高維紀元的正式資源由對高維存在造成的有效永久削血結算為維度之弦；搜刮技巧不再額外放大此資源。',
'高維紀元不再提供此項額外效果。')
replace('specialization.js','高維紀元不再提供直接資源加成','高維紀元無額外效果',1)
replace('specialization.js',
'高維紀元裝備不建立新的出售貨幣循環，因此鑑價技巧不再產生第三紀元貨幣售價加成。',
'高維紀元不再提供此項額外效果。')
replace('specialization.js','高維紀元不建立裝備貨幣售價','高維紀元無額外效果',1)
replace('specialization.js','第三紀元無直接資源加成','高維紀元無額外效果',3)
replace('specialization.js','第三紀元無裝備貨幣售價','高維紀元無額外效果',3)
replace('specialization.js','高維正式資源由永久削血結算為維度之弦。','高維紀元不再提供此項額外效果。')
replace('specialization.js','高維裝備不建立新的出售貨幣循環。','高維紀元不再提供此項額外效果。')
replace('specialization.js',
'8 項專精維持 Lv.${SPECIALIZATION_MAX_LEVEL}；實戰訓練與戰鬥類專精持續生效。第三紀元不再開放專精升級，也不建立新的金幣／暗物質售價循環。',
'8 項專精維持 Lv.${SPECIALIZATION_MAX_LEVEL}；實戰訓練與戰鬥類專精持續生效。第三紀元不再開放專精升級。')
replace('specialization.js','window.SPECIALIZATION_WORLD_SEMANTICS_VERSION=2;','window.SPECIALIZATION_WORLD_SEMANTICS_VERSION=3;')
replace('specialization.js','window.SPECIALIZATION_PLAYER_WORLD_UI_VERSION=2;','window.SPECIALIZATION_PLAYER_WORLD_UI_VERSION=3;')
replace('specialization.js','window.SPECIALIZATION_GM_WORLD_SEMANTICS_VERSION=2;','window.SPECIALIZATION_GM_WORLD_SEMANTICS_VERSION=3;')

# storyrecordtabs.js: W2 becomes review while current phase is W3.
replace('storyrecordtabs.js','let selectedRegionId=null,storyRecordEraView="universe";const INTRO_STORY_ID="earth-prologue";',
'''let selectedRegionId=null,storyRecordEraView="universe";const INTRO_STORY_ID="earth-prologue";
 function thirdWorldEntered(){return typeof window.isThirdWorldEntered==="function"?window.isThirdWorldEntered()===true:state?.thirdWorld?.entered===true;}''')
replace('storyrecordtabs.js',
'''function eraTabsHtml(){if(!(typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered()))return "";return `<div class="era-view-tabs story-record-era-tabs" role="tablist" aria-label="戰線紀錄紀元"><button class="era-view-tab ${storyRecordEraView==="universe"?"active":""}" onclick="setStoryRecordEraView('universe')">宇宙紀元</button><button class="era-view-tab ${storyRecordEraView==="galaxy-review"?"active":""}" onclick="setStoryRecordEraView('galaxy-review')">銀河紀元・回顧</button></div>`;}''',
'''function eraTabsHtml(){if(!(typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered()))return "";const universeLabel=thirdWorldEntered()?"宇宙紀元・回顧":"宇宙紀元";return `<div class="era-view-tabs story-record-era-tabs" role="tablist" aria-label="戰線紀錄紀元"><button class="era-view-tab ${storyRecordEraView==="universe"?"active":""}" onclick="setStoryRecordEraView('universe')">${universeLabel}</button><button class="era-view-tab ${storyRecordEraView==="galaxy-review"?"active":""}" onclick="setStoryRecordEraView('galaxy-review')">銀河紀元・回顧</button></div>`;}''')
replace('storyrecordtabs.js',
'''const text=storyRecordEraView==="universe"?"查看宇宙紀元已完成的正式劇情；重播不會給予獎勵或改變進度。":"回顧銀河紀元已完成的正式劇情；重播不會給予獎勵或改變進度。";''',
'''const text=storyRecordEraView==="universe"?(thirdWorldEntered()?"回顧宇宙紀元已完成的正式劇情；重播不會給予獎勵或改變進度。":"查看宇宙紀元已完成的正式劇情；重播不會給予獎勵或改變進度。") : "回顧銀河紀元已完成的正式劇情；重播不會給予獎勵或改變進度。";''')
replace('storyrecordtabs.js','window.STORY_RECORD_TABS_VERSION=7;window.STORY_RECORD_WORLD_REVIEW_VERSION=2;',
'window.STORY_RECORD_TABS_VERSION=8;window.STORY_RECORD_WORLD_REVIEW_VERSION=3;')

# specialguide.js: W3 formal UI must never inject old special encounter guide.
replace('specialguide.js',
''' adventurePreparePage=function(){
  let html=sgBaseAdventurePreparePage();''',
''' adventurePreparePage=function(){
  const current=typeof window.currentWorldPhase==="function"?Number(window.currentWorldPhase(state)):state?.thirdWorld?.entered===true?3:state?.secondWorld?.entered===true?2:1;
  if(current===3)return sgBaseAdventurePreparePage();
  let html=sgBaseAdventurePreparePage();''')
replace('specialguide.js','window.SPECIAL_GUIDE_WORLD_AWARE_VERSION=1;','window.SPECIAL_GUIDE_WORLD_AWARE_VERSION=2;')

# Permanent static tests follow the player-facing owner/cache changes.
replace('tests/story/flow.js','STORY_RECORD_TABS_VERSION=7','STORY_RECORD_TABS_VERSION=8')
replace('tests/runtime/js-integrity.js',
'''assert(index.includes('src="worldmapui.js?v=20260928-thirdworld-batch11-o2"')&&index.includes('src="thirdworldui.js?v=20260928-thirdworld-batch11-4"')&&index.includes('src="playersemanticsui.js?v=20260928-thirdworld-batch11-3"'),"index.html 必須同步載入第 11-1 批三紀元共用冒險視圖 owner cache-bust。");''',
'''assert(index.includes('src="worldmapui.js?v=20260928-thirdworld-batch11-o2"')&&index.includes('src="thirdworldui.js?v=20260928-thirdworld-batch11-4"')&&index.includes('src="playersemanticsui.js?v=20260928-thirdworld-ui-text-batch1"'),"index.html 必須同步載入三紀元共用冒險視圖與目前第三紀元玩家語意 owner cache-bust。");''')

# Cache bust all touched player JS owners.
cache={
 'playersemanticsui.js?v=20260928-thirdworld-batch11-3':f'playersemanticsui.js?v={TAG}',
 'enhancementui.js?v=20260927-thirdworld-ui-opt9-1':f'enhancementui.js?v={TAG}',
 'specialization.js?v=20260927-thirdworld-ui-opt9-1':f'specialization.js?v={TAG}',
 'storyrecordtabs.js?v=20260922-review-batch4':f'storyrecordtabs.js?v={TAG}',
 'specialguide.js?v=20260923-guide-batch2':f'specialguide.js?v={TAG}',
}
for old,new in cache.items(): replace('index.html',old,new)

print('batch 1 W3 UI text patch applied')
