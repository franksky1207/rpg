(function(){
  let regionOpenState=Object.create(null);
  let lastActiveRegionId=null;

  function clampUnlockedMap(){
    const max=Math.max(0,MAPS.length-1);
    return Math.max(0,Math.min(max,Math.floor(Number(state?.unlockedMap)||0)));
  }

  function activeRegionIndex(){
    const unlocked=clampUnlockedMap();
    let found=0;
    for(let i=0;i<WORLD_REGIONS.length;i++){
      if(unlocked>=WORLD_REGIONS[i].mapStart)found=i;
      else break;
    }
    return Math.max(0,Math.min(WORLD_REGIONS.length-1,found));
  }

  function syncRegionOpenState(){
    const active=WORLD_REGIONS[activeRegionIndex()];
    if(!active)return;
    if(lastActiveRegionId!==active.id){
      regionOpenState=Object.create(null);
      regionOpenState[active.id]=true;
      lastActiveRegionId=active.id;
      return;
    }
    if(typeof regionOpenState[active.id]!=="boolean")regionOpenState[active.id]=true;
  }

  function regionUnlocked(region){
    return clampUnlockedMap()>=region.mapStart;
  }

  function unlockedMapsInRegion(region){
    const unlocked=clampUnlockedMap();
    if(unlocked<region.mapStart)return 0;
    return Math.max(0,Math.min(region.mapEnd,unlocked)-region.mapStart+1);
  }

  function regionCleared(region){
    return !!state?.bossKilled?.[region.mapEnd]||clampUnlockedMap()>region.mapEnd;
  }

  function regionCardsHtml(region){
    const end=Math.min(region.mapEnd,clampUnlockedMap());
    const cards=[];
    for(let i=region.mapStart;i<=end;i++){
      const map=MAPS[i];
      if(!map)continue;
      const status=typeof mapStatusText==="function"?mapStatusText(i):"";
      const cleared=!!state?.bossKilled?.[i];
      cards.push(`<button class="map-card ${cleared?"cleared":""}" onclick="enterMap(${i})"><b>${i+1}. ${map.name}</b><div class="muted">Lv.${map.min}～${map.max}</div><div class="map-status">${status}</div></button>`);
    }
    return cards.join("");
  }

  function regionHtml(region,activeIndex,regionIndex){
    const open=!!regionOpenState[region.id];
    const count=unlockedMapsInRegion(region);
    const cleared=regionCleared(region);
    const current=regionIndex===activeIndex;
    const progressText=cleared?"10 / 10・已完成":`已探索 ${count} / 10`;
    return `<section class="world-region ${current?"current":""} ${cleared?"completed":""}">
      <button class="world-region-header" type="button" aria-expanded="${open?"true":"false"}" onclick="toggleAdventureRegion('${region.id}')">
        <span class="world-region-title-wrap"><b class="world-region-title">${region.name}</b><span class="world-region-level">Lv.${region.min}～${region.max}</span></span>
        <span class="world-region-meta"><span>${progressText}</span><span class="world-region-toggle">${open?"▲":"▼"}</span></span>
      </button>
      ${open?`<div class="world-region-body"><div class="map-grid">${regionCardsHtml(region)}</div></div>`:""}
    </section>`;
  }

  window.toggleAdventureRegion=function(id){
    syncRegionOpenState();
    regionOpenState[id]=!regionOpenState[id];
    render();
  };

  window.resetAdventureRegionFolds=function(){
    regionOpenState=Object.create(null);
    lastActiveRegionId=null;
  };

  window.adventureMapPage=function(){
    syncRegionOpenState();
    const activeIndex=activeRegionIndex();
    const visible=WORLD_REGIONS.filter(regionUnlocked);
    return `<section class="map-screen"><div class="page-top"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button><h2 class="page-title">冒險地圖</h2><span></span></div><div class="world-region-list">${visible.map(region=>regionHtml(region,activeIndex,WORLD_REGIONS.indexOf(region))).join("")}</div></section>`;
  };


  // 宇宙紀元冒險 UI：正式世界預設宇宙；銀河回顧只保留本次頁面生命週期，不寫正式 save/localStorage。
  let secondWorldAdventureView="universe";
  let galaxyReviewSelectedMap=0;
  let galaxyReviewSelectedEnemy=4;
  let galaxyReviewBattleActive=false;
  const reviewRegionOpenState=Object.create(null);
  let reviewRegionInitialized=false;

  function adventureEraTabsHtml(){
    return `<div class="era-view-tabs" role="tablist" aria-label="冒險紀元">
      <button class="era-view-tab ${secondWorldAdventureView==="universe"?"active":""}" type="button" role="tab" aria-selected="${secondWorldAdventureView==="universe"?"true":"false"}" onclick="setSecondWorldAdventureView('universe')">宇宙紀元</button>
      <button class="era-view-tab ${secondWorldAdventureView==="galaxy-review"?"active":""}" type="button" role="tab" aria-selected="${secondWorldAdventureView==="galaxy-review"?"true":"false"}" onclick="setSecondWorldAdventureView('galaxy-review')">銀河紀元・回顧</button>
    </div>`;
  }

  function initReviewRegions(){
    if(reviewRegionInitialized)return;
    reviewRegionInitialized=true;
    const regions=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[];
    if(regions.length)reviewRegionOpenState[regions[regions.length-1].id]=true;
  }

  function reviewRegionCardsHtml(region){
    const cards=[];
    for(let index=region.mapStart;index<=region.mapEnd;index++){
      const map=MAPS[index];
      if(!map)continue;
      cards.push(`<div class="map-card cleared galaxy-review-map-card"><b>${index+1}. ${map.name}</b><div class="muted">Lv.${map.min}～${map.max}</div><div class="map-status">已完成・可回顧</div><button class="btn blue galaxy-review-action" type="button" onclick="openGalaxyReviewMap(${index})">回顧挑戰</button></div>`);
    }
    return cards.join("");
  }

  function reviewRegionHtml(region){
    const open=!!reviewRegionOpenState[region.id];
    return `<section class="world-region completed galaxy-review-region">
      <button class="world-region-header" type="button" aria-expanded="${open?"true":"false"}" onclick="toggleGalaxyReviewAdventureRegion('${region.id}')">
        <span class="world-region-title-wrap"><b class="world-region-title">${region.name}</b><span class="world-region-level">Lv.${region.min}～${region.max}</span></span>
        <span class="world-region-meta"><span>10 / 10・已完成</span><span class="world-region-toggle">${open?"▲":"▼"}</span></span>
      </button>
      ${open?`<div class="world-region-body"><div class="map-grid">${reviewRegionCardsHtml(region)}</div></div>`:""}
    </section>`;
  }

  function galaxyReviewAdventureHtml(){
    initReviewRegions();
    const regions=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[];
    return `<section class="map-screen universe-adventure-screen galaxy-review-adventure-screen"><div class="page-top"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button><h2 class="page-title">冒險</h2><span></span></div>${adventureEraTabsHtml()}<div class="notice galaxy-review-notice"><b>銀河紀元・回顧</b><div class="muted" style="margin-top:6px">第一紀元已完成的 10 大區、100 張地圖均可回顧。回顧戰為純挑戰，不影響宇宙紀元正式進度。</div></div><div class="world-region-list galaxy-review-region-list">${regions.map(reviewRegionHtml).join("")}</div></section>`;
  }

  window.openGalaxyReviewMap=function(mapIndex){
    galaxyReviewSelectedMap=Math.max(0,Math.min((MAPS.length||1)-1,Math.floor(Number(mapIndex)||0)));
    galaxyReviewSelectedEnemy=4;
    if(typeof window.enterGalaxyReviewMap==="function")window.enterGalaxyReviewMap();
  };
  window.getGalaxyReviewSelectedMap=function(){return galaxyReviewSelectedMap;};
  window.getGalaxyReviewSelectedEnemy=function(){return galaxyReviewSelectedEnemy;};
  window.setGalaxyReviewSelectedEnemy=function(value){
    galaxyReviewSelectedEnemy=Math.max(0,Math.min(4,Math.floor(Number(value)||0)));
    return galaxyReviewSelectedEnemy;
  };
  window.setGalaxyReviewBattleActive=function(value){galaxyReviewBattleActive=value===true;};
  window.isGalaxyReviewBattleActive=function(){return galaxyReviewBattleActive===true;};

  window.setSecondWorldAdventureView=function(value){
    const next=value==="galaxy-review"?"galaxy-review":"universe";
    if(secondWorldAdventureView===next)return;
    if(next!=="universe"&&typeof window.cancelSecondWorldAdventureProgressFocus==="function")window.cancelSecondWorldAdventureProgressFocus();
    secondWorldAdventureView=next;
    render();
  };
  window.toggleGalaxyReviewAdventureRegion=function(id){
    initReviewRegions();
    reviewRegionOpenState[id]=!reviewRegionOpenState[id];
    render();
  };
  window.getSecondWorldAdventureView=function(){return secondWorldAdventureView;};

  const secondWorldRegionOpenState=Object.create(null);
  let lastSecondWorldActiveRegionId=null;
  let secondWorldAdventureFocusPending=false;

  function secondWorldRegions(){
    return Array.isArray(window.SECOND_WORLD_REGIONS)?window.SECOND_WORLD_REGIONS:[];
  }

  function secondWorldBosses(){
    return Array.isArray(window.SECOND_WORLD_BOSSES)?window.SECOND_WORLD_BOSSES:[];
  }

  function secondWorldLatestProgressBossIndex(){
    const bosses=secondWorldBosses();
    if(!bosses.length)return -1;
    const highest=typeof window.secondWorldHighestUnlockedBossIndex==="function"?Number(window.secondWorldHighestUnlockedBossIndex()):-1;
    if(Number.isFinite(highest)&&highest>=0)return Math.max(0,Math.min(bosses.length-1,Math.floor(highest)));
    return 0;
  }

  window.requestSecondWorldAdventureProgressFocus=function(){
    secondWorldAdventureFocusPending=true;
    return true;
  };
  window.cancelSecondWorldAdventureProgressFocus=function(){
    secondWorldAdventureFocusPending=false;
    return true;
  };
  window.applySecondWorldAdventureProgressFocus=function(){
    if(!secondWorldAdventureFocusPending||typeof document==="undefined")return false;
    const screen=document.querySelector(".universe-adventure-screen:not(.galaxy-review-adventure-screen)");
    if(!screen){secondWorldAdventureFocusPending=false;return false;}
    const index=secondWorldLatestProgressBossIndex();
    const target=index>=0?screen.querySelector(`[data-second-world-boss="${index}"]`):null;
    if(!target){secondWorldAdventureFocusPending=false;return false;}
    secondWorldAdventureFocusPending=false;
    const run=()=>{
      if(!target.isConnected)return;
      target.scrollIntoView({block:"center",inline:"nearest",behavior:"auto"});
    };
    if(typeof requestAnimationFrame==="function")requestAnimationFrame(()=>requestAnimationFrame(run));
    else setTimeout(run,0);
    return true;
  };

  function secondWorldActiveRegionIndex(){
    const regions=secondWorldRegions();
    if(!regions.length)return -1;
    const highest=secondWorldLatestProgressBossIndex();
    if(highest<0)return 0;
    const boss=secondWorldBosses()[highest];
    return Math.max(0,Math.min(regions.length-1,Math.floor(Number(boss?.regionIndex)||0)));
  }

  function syncSecondWorldRegionOpenState(){
    const regions=secondWorldRegions(),activeIndex=secondWorldActiveRegionIndex(),active=regions[activeIndex];
    if(!active)return;
    if(lastSecondWorldActiveRegionId!==active.id){
      Object.keys(secondWorldRegionOpenState).forEach(key=>delete secondWorldRegionOpenState[key]);
      secondWorldRegionOpenState[active.id]=true;
      lastSecondWorldActiveRegionId=active.id;
      return;
    }
    if(typeof secondWorldRegionOpenState[active.id]!=="boolean")secondWorldRegionOpenState[active.id]=true;
  }

  function secondWorldRegionVisible(region){
    return !!region&&typeof window.secondWorldRegionVisible==="function"&&window.secondWorldRegionVisible(region.index);
  }

  function secondWorldVisibleBosses(region){
    if(!region||typeof window.secondWorldBossesForRegion!=="function")return [];
    return window.secondWorldBossesForRegion(region.index).filter(boss=>typeof window.secondWorldBossVisible==="function"&&window.secondWorldBossVisible(boss.index));
  }

  function secondWorldRegionKilledCount(region){
    if(!region||typeof window.secondWorldBossesForRegion!=="function")return 0;
    return window.secondWorldBossesForRegion(region.index).filter(boss=>typeof window.secondWorldBossKilled==="function"&&window.secondWorldBossKilled(boss.index)).length;
  }

  function secondWorldBossCardHtml(boss){
    const killed=typeof window.secondWorldBossKilled==="function"&&window.secondWorldBossKilled(boss.index);
    const canChallenge=typeof window.canChallengeSecondWorldBoss==="function"&&window.canChallengeSecondWorldBoss(boss.index);
    const latestProgress=Number(boss.index)===secondWorldLatestProgressBossIndex();
    const stats=typeof window.secondWorldBossBaseStats==="function"?window.secondWorldBossBaseStats(boss.index):null;
    const status=killed?"已擊敗":canChallenge?"可挑戰":"尚未開放";
    const statLine=stats?`<div class="universe-boss-stats">HP ${stats.hp.toLocaleString()}　ATK ${stats.atk.toLocaleString()}　DEF ${stats.def.toLocaleString()}</div>`:"";
    const active=window.activeSecondWorldMainlineContext;
    const activeHere=active?.continuous===true&&Number(active.bossIndex)===Number(boss.index);
    let action="";
    if(activeHere)action=`<button class="btn danger universe-boss-action" type="button" onclick="requestSecondWorldContinuousStop()">本場結束後停止</button>`;
    else{
      const buttons=[];
      if(canChallenge&&window.SECOND_WORLD_COMBAT_SETTLEMENT_READY===true&&typeof window.startSecondWorldBossBattle==="function"){
        buttons.push(`<button class="btn blue universe-boss-action" type="button" onclick="startSecondWorldBossBattle(${boss.index})">${killed?"再次挑戰":"挑戰 Boss"}</button>`);
        buttons.push(`<button class="btn universe-boss-action" type="button" onclick="startSecondWorldBossContinuous(${boss.index})">連續戰鬥</button>`);
      }
      if(latestProgress)buttons.push(`<button class="btn universe-boss-action" type="button" data-universe-contextual-inventory="1" onclick="openAdventureInventory()">背包</button>`);
      if(buttons.length)action=`<div class="universe-boss-actions">${buttons.join("")}</div>`;
    }
    return `<div class="map-card universe-boss-card ${killed?"cleared":""}" data-second-world-boss="${boss.index}" aria-label="${boss.name} Lv.${boss.level}，${status}"><b>${boss.name}</b><div class="muted">Lv.${boss.level}</div>${statLine}<div class="map-status">${activeHere?"連續戰鬥中":status}</div>${action}</div>`;
  }

  function secondWorldRegionHtml(region,activeIndex){
    const open=!!secondWorldRegionOpenState[region.id];
    const visibleBosses=secondWorldVisibleBosses(region);
    const killed=secondWorldRegionKilledCount(region);
    const completed=killed>=10;
    const current=region.index===activeIndex;
    const progressText=completed?"10 / 10・已完成":`已擊敗 ${killed} / 10`;
    return `<section class="world-region universe-region ${current?"current":""} ${completed?"completed":""}">
      <button class="world-region-header" type="button" aria-expanded="${open?"true":"false"}" onclick="toggleSecondWorldAdventureRegion('${region.id}')">
        <span class="world-region-title-wrap"><b class="world-region-title">${region.name}</b><span class="world-region-level">Lv.${region.minLevel}～${region.maxLevel}</span></span>
        <span class="world-region-meta"><span>${progressText}</span><span class="world-region-toggle">${open?"▲":"▼"}</span></span>
      </button>
      ${open?`<div class="world-region-body"><div class="map-grid universe-boss-grid">${visibleBosses.map(secondWorldBossCardHtml).join("")}</div></div>`:""}
    </section>`;
  }

  window.toggleSecondWorldAdventureRegion=function(id){
    syncSecondWorldRegionOpenState();
    secondWorldRegionOpenState[id]=!secondWorldRegionOpenState[id];
    render();
  };

  window.resetSecondWorldAdventureRegionFolds=function(){
    Object.keys(secondWorldRegionOpenState).forEach(key=>delete secondWorldRegionOpenState[key]);
    lastSecondWorldActiveRegionId=null;
  };

  function secondWorldCombatPageHtml(ctx){
    const encounter=ctx?.currentEncounter||ctx?.lastCombat?.e||null;
    const boss=ctx?.boss||encounter;
    if(!encounter||!boss)return "";
    const s=typeof playerCombatStats==="function"?playerCombatStats():{hp:1};
    const progress=typeof window.levelProgressSnapshot==="function"?window.levelProgressSnapshot(state):{atCap:false,exp:Number(state.exp)||0,need:1,percent:0};
    const hpPct=s.hp?Math.max(0,Math.min(100,(Number(state.hp)||0)/s.hp*100)):0;
    const traits=typeof combatTraitBadgesHtml==="function"?combatTraitBadgesHtml(encounter.traits):"";
    const round=Math.max(1,Math.floor(Number(ctx.completed)||0)+1);
    const continuous=ctx.continuous===true;
    const requested=ctx.stopRequested===true;
    const speed=typeof window.effectiveCombatSpeed==="function"?Number(window.effectiveCombatSpeed()):1;
    const speedText=[1,1.5,2].includes(speed)?speed:1;
    const head=continuous?`連續戰鬥・第 ${round} 場`:"單場戰鬥";
    const stop=continuous?`<div class="continuous-stop-wrap"><button class="btn danger" onclick="requestSecondWorldContinuousStop()" ${requested?"disabled":""}>${requested?"本場結束後停止":"停止連續戰鬥"}</button></div>`:"";
    return `<section class="combat-screen universe-combat-screen">
      <div class="combat-head">${head}<span class="universe-combat-speed">${speedText}×</span></div>
      <div class="combat-arena">
       <div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${typeof playerNameHtml==="function"?playerNameHtml():"玩家"} Lv.${state.level}</h2><div class="muted">暗物質 ${Math.max(0,Math.floor(Number(state.secondWorld?.darkMatter)||0)).toLocaleString()}　暗能量 ${Math.max(0,Math.floor(Number(state.secondWorld?.darkEnergy)||0)).toLocaleString()}</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${Math.max(0,Math.floor(Number(state.hp)||0))} / ${s.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${hpPct}%"></span></div></div><div class="xp-block"><div class="status-label"><span>EXP</span><span>${progress.atCap?"MAX":progress.exp+" / "+progress.need}</span></div><div class="bar"><span class="xp" style="width:${progress.percent}%"></span></div></div></div>
       <div class="combat-vs">VS</div>
       <div class="combatant enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><h2 id="combatEnemyName">${encounter.name} Lv.${encounter.level}</h2>${traits}<div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${encounter.hp} / ${encounter.hp}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div>
      </div>
      <div class="combat-message" id="combatMessage">準備戰鬥</div>${stop}
    </section>`;
  }

  window.secondWorldCombatPageHtml=secondWorldCombatPageHtml;

  window.secondWorldAdventurePageHtml=function(){
    const entered=typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered();
    if(!entered)return `<section class="map-screen"><div class="page-top"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button><h2 class="page-title">宇宙紀元主線</h2><span></span></div><div class="notice"><b>尚未正式進入宇宙紀元。</b></div></section>`;
    const active=window.activeSecondWorldMainlineContext;
    if(active?.currentEncounter){
      const combatHtml=secondWorldCombatPageHtml(active);
      if(combatHtml)return combatHtml;
    }
    const regions=secondWorldRegions();
    if(!regions.length)return `<section class="map-screen"><div class="page-top"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button><h2 class="page-title">宇宙紀元主線</h2><span></span></div><div class="notice"><b>宇宙紀元主線資料尚未載入。</b></div></section>`;
    syncSecondWorldRegionOpenState();
    const activeIndex=secondWorldActiveRegionIndex();
    const visible=regions.filter(secondWorldRegionVisible);
    if(secondWorldAdventureView==="galaxy-review")return galaxyReviewAdventureHtml();
    return `<section class="map-screen universe-adventure-screen"><div class="page-top"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button><h2 class="page-title">冒險</h2><span></span></div>${adventureEraTabsHtml()}<div class="notice universe-adventure-notice"><b>宇宙主線戰線</b><div class="muted" style="margin-top:6px">宇宙主線正式開放：擊敗 Boss 可獲得 EXP、暗物質、暗能量與 1 件專屬裝備。</div></div><div class="world-region-list universe-region-list">${visible.map(region=>secondWorldRegionHtml(region,activeIndex)).join("")}</div></section>`;
  };

  window.SECOND_WORLD_ADVENTURE_AUTO_FOCUS_VERSION=2;
  window.SECOND_WORLD_ADVENTURE_UI_VERSION=4;
  window.SECOND_WORLD_ADVENTURE_REVIEW_VIEW_VERSION=3;
  window.GALAXY_REVIEW_SELECTION_OWNER_VERSION=1;
  window.PLAYER_SECOND_WORLD_BOSS_NUMBER_HIDDEN_VERSION=1;
})();
