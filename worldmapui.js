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
})();
