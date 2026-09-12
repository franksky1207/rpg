(function(){
  const RULES={
    version:2,
    mapLevelSpan:5,
    regionLevelSpan:50,
    mapsPerRegion:10,
    gearSlots:["weapon","helmet","armor","boots","accessory"],
    slotPatterns:{
      weapon:/(刃|刀|劍|鋒|槍|砲|弓|錘|斧)$/,
      helmet:/(盔|冠)$/,
      armor:/(甲|衣|裝)$/,
      boots:/靴$/
    },
    densityRules:[
      {kind:"gear",terms:["裁決刃"],label:"裁決刃",window:100,max:1},
      {kind:"gear",terms:["終戰刃"],label:"終戰刃",window:100,max:1},
      {kind:"gear",terms:["躍遷靴"],label:"躍遷靴",window:100,max:3},
      {kind:"gear",terms:["主控核心"],label:"主控核心",window:100,max:1},
      {kind:"enemy",terms:["戰鬥體","戰體"],label:"戰體詞族",window:100,max:3},
      {kind:"enemy",terms:["巡弋"],label:"巡弋詞族",window:100,max:4},
      {kind:"enemy",terms:["巨像"],label:"巨像詞族",window:100,max:3},
      {kind:"enemy",terms:["統帥"],label:"統帥",window:100,max:3},
      {kind:"enemy",terms:["霸主"],label:"霸主",window:100,max:2},
      {kind:"enemy",terms:["最高執政官"],label:"最高執政官",window:100,max:1},
      {kind:"enemy",terms:["重裝","重型"],label:"重裝／重型詞族",window:50,max:4}
    ],
    accessoryCoreMaxPerRegion:3,
    recommendedCoverageMin:2,
    reservedBefore501:["高維","多宇宙","概念生命","法則兵器"],
    regionLexicon:{
      earth:{recommended:["軍事","機甲","生化","戰區"],avoid:["曲率","星門","銀河","奇點","高維"]},
      solar:{recommended:["軌道","真空","重力","深空"],avoid:["銀河","星門","奇點","高維"]},
      nearstar:{recommended:["星航","光譜","曲率","近星"],avoid:["銀河","宇宙","高維"]},
      frontier:{recommended:["邊疆","傭兵","殖民","遠征"],avoid:["銀河核心","奇點","高維"]},
      orion:{recommended:["星門","旋臂","文明","星區"],avoid:["銀河核心","多宇宙","高維"]},
      "galactic-frontier":{recommended:["遺跡","失落","星海","邊境"],avoid:["宇宙終極","多宇宙","高維"]},
      "galactic-mid":{recommended:["帝國","聯邦","軍團","霸權"],avoid:["多宇宙","高維"]},
      "core-outer":{recommended:["黑洞","奇點","引力","時空"],avoid:["多宇宙","概念","法則"]},
      "core-war":{recommended:["巨構","裁決","王座","終結"],avoid:["多宇宙","概念法則"]},
      "galactic-unification":{recommended:["統合","聯軍","權柄","銀河"],avoid:["多宇宙","概念法則"]}
    }
  };

  function levenshtein(a,b){
    const m=a.length,n=b.length,dp=Array.from({length:m+1},()=>Array(n+1).fill(0));
    for(let i=0;i<=m;i++) dp[i][0]=i;
    for(let j=0;j<=n;j++) dp[0][j]=j;
    for(let i=1;i<=m;i++) for(let j=1;j<=n;j++){
      dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
    }
    return dp[m][n];
  }

  function similarity(a,b){
    const max=Math.max(a.length,b.length);
    return max?1-levenshtein(a,b)/max:1;
  }

  function sortedChars(s){return Array.from(s).sort().join("");}
  function containsAny(name,terms){return terms.some(term=>name.includes(term));}

  function validateWorldNaming(options){
    const strict=options?.strict!==false;
    const errors=[];
    const warnings=[];
    const maps=Array.isArray(MAPS)?MAPS:[];
    const regions=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[];
    const gearEntries=[];
    const enemyEntries=[];
    const mapEntries=[];
    const pushError=(code,message,data)=>errors.push({code,message,data:data||null});
    const pushWarning=(code,message,data)=>warnings.push({code,message,data:data||null});

    if(!maps.length) pushError("NO_MAPS","MAPS 尚未載入。",null);
    if(!regions.length) pushError("NO_REGIONS","WORLD_REGIONS 尚未載入。",null);

    let previousMax=0;
    maps.forEach((map,index)=>{
      mapEntries.push({name:map.name,level:map.min,index,chapter:map.chapter});
      if(map.max-map.min+1!==RULES.mapLevelSpan) pushError("MAP_SPAN",`${map.name} 等級範圍不是 ${RULES.mapLevelSpan} 級。`,{index,min:map.min,max:map.max});
      if(index===0&&map.min!==1) pushError("MAP_START","第一張地圖應從 Lv1 開始。",{min:map.min});
      if(index>0&&map.min!==previousMax+1) pushError("MAP_GAP",`${map.name} 與前一張地圖等級不連續。`,{index,min:map.min,expected:previousMax+1});
      previousMax=map.max;
      if(!Array.isArray(map.gear)||map.gear.length!==5) pushError("GEAR_COUNT",`${map.name} 必須剛好有 5 件裝備。`,{index,count:map.gear?.length});
      if(!Array.isArray(map.enemies)||map.enemies.length!==5) pushError("ENEMY_COUNT",`${map.name} 必須剛好有 5 隻怪。`,{index,count:map.enemies?.length});
      (map.gear||[]).forEach((name,slot)=>gearEntries.push({name,level:map.min+slot,index,slot,chapter:map.chapter,map:map.name}));
      (map.enemies||[]).forEach((enemy,slot)=>{
        const [name,level,rank]=enemy;
        enemyEntries.push({name,level,index,slot,rank,chapter:map.chapter,map:map.name});
        const expected=map.min+slot;
        const expectedRank=slot<3?"normal":slot===3?"elite":"boss";
        if(level!==expected) pushError("ENEMY_LEVEL",`${map.name} 的 ${name} 等級應為 Lv${expected}。`,{level,expected});
        if(rank!==expectedRank) pushError("ENEMY_RANK_ORDER",`${map.name} 的 ${name} 應為 ${expectedRank}。`,{rank,expectedRank,slot});
      });
    });

    regions.forEach((region,regionIndex)=>{
      if(region.max-region.min+1!==RULES.regionLevelSpan) pushError("REGION_SPAN",`${region.name} 必須是 ${RULES.regionLevelSpan} 級大區域。`,region);
      if(region.mapEnd-region.mapStart+1!==RULES.mapsPerRegion) pushError("REGION_MAP_COUNT",`${region.name} 必須包含 ${RULES.mapsPerRegion} 張地圖。`,region);
      if(region.mapStart!==regionIndex*RULES.mapsPerRegion) pushError("REGION_INDEX",`${region.name} 的 mapStart 與區域順序不一致。`,region);
      const subset=maps.slice(region.mapStart,region.mapEnd+1);
      if(subset.length!==RULES.mapsPerRegion) pushError("REGION_MAP_MISSING",`${region.name} 實際地圖數不足。`,{expected:RULES.mapsPerRegion,actual:subset.length});
      if(subset[0]&&subset[0].min!==region.min) pushError("REGION_LEVEL_START",`${region.name} 第一張地圖未從 Lv${region.min} 開始。`,{actual:subset[0].min});
      if(subset.at(-1)&&subset.at(-1).max!==region.max) pushError("REGION_LEVEL_END",`${region.name} 最後一張地圖未在 Lv${region.max} 結束。`,{actual:subset.at(-1).max});
      subset.forEach(map=>{
        if(map.chapter!==region.name) pushError("REGION_CHAPTER",`${map.name} 的 chapter 與大區域 ${region.name} 不一致。`,{chapter:map.chapter});
      });

      const coreCount=subset.reduce((sum,map)=>sum+(map.gear?.[4]?.includes("核心")?1:0),0);
      if(strict&&coreCount>RULES.accessoryCoreMaxPerRegion) pushWarning("ACCESSORY_CORE_DENSITY",`${region.name} 有 ${coreCount} 件飾品使用「核心」，建議分散成模組／權印／節點／校準器等。`,{region:region.name,count:coreCount});

      const lexical=RULES.regionLexicon[region.id];
      if(strict&&lexical){
        const names=subset.flatMap(map=>[map.name,...(map.gear||[]),...(map.enemies||[]).map(e=>e[0])]);
        lexical.avoid.forEach(term=>names.filter(n=>n.includes(term)).forEach(name=>pushWarning("REGION_VOCAB",`${region.name} 的「${name}」使用了應避免的詞「${term}」。`,{region:region.name,name,term})));
        const covered=lexical.recommended.filter(term=>names.some(name=>name.includes(term)));
        if(covered.length<RULES.recommendedCoverageMin) pushWarning("REGION_IDENTITY",`${region.name} 的核心語彙辨識度不足，只覆蓋 ${covered.length}/${lexical.recommended.length} 個推薦詞。`,{region:region.name,covered,recommended:lexical.recommended});
      }
    });

    function checkDuplicates(entries,kind){
      const seen=new Map();
      entries.forEach(entry=>{
        if(seen.has(entry.name)) pushError("DUPLICATE_NAME",`${kind}名稱「${entry.name}」重複。`,{first:seen.get(entry.name),second:entry});
        else seen.set(entry.name,entry);
      });
    }
    checkDuplicates(mapEntries,"地圖");
    checkDuplicates(gearEntries,"裝備");
    checkDuplicates(enemyEntries,"怪物");

    const mapNameSet=new Set(mapEntries.map(x=>x.name));
    const gearNameSet=new Set(gearEntries.map(x=>x.name));
    gearEntries.forEach(x=>{if(mapNameSet.has(x.name)) pushError("MAP_GEAR_COLLISION",`裝備「${x.name}」與地圖同名。`,x);});
    enemyEntries.forEach(x=>{
      if(mapNameSet.has(x.name)) pushError("MAP_ENEMY_COLLISION",`怪物「${x.name}」與地圖同名。`,x);
      if(gearNameSet.has(x.name)) pushError("GEAR_ENEMY_COLLISION",`怪物「${x.name}」與裝備同名。`,x);
    });

    if(strict){
      gearEntries.forEach(entry=>{
        const slotName=RULES.gearSlots[entry.slot];
        const pattern=RULES.slotPatterns[slotName];
        if(pattern&&!pattern.test(entry.name)) pushWarning("GEAR_SLOT_STYLE",`${entry.name} 的名稱不像 ${slotName} 部位。`,entry);
      });

      const namedGroups=[
        gearEntries.map(x=>({...x,kind:"gear"})),
        enemyEntries.map(x=>({...x,kind:"enemy"}))
      ];
      namedGroups.forEach(group=>{
        for(let i=0;i<group.length;i++) for(let j=i+1;j<group.length;j++){
          const a=group[i],b=group[j];
          if(a.name===b.name||Math.abs(a.level-b.level)>150) continue;
          if(a.kind==="gear"&&a.slot!==b.slot) continue;
          if(a.name.length>=4&&a.name.length===b.name.length&&sortedChars(a.name)===sortedChars(b.name)){
            pushWarning("REORDERED_NAME",`「${a.name}」與「${b.name}」使用幾乎相同字詞重新排列。`,{a,b});
            continue;
          }
          if(Math.min(a.name.length,b.name.length)>=5&&similarity(a.name,b.name)>=0.86){
            pushWarning("SIMILAR_NAME",`「${a.name}」與「${b.name}」過度相似。`,{a,b});
          }
        }
      });

      RULES.densityRules.forEach(rule=>{
        const source=rule.kind==="gear"?gearEntries:enemyEntries;
        const hits=source.filter(x=>containsAny(x.name,rule.terms)).sort((a,b)=>a.level-b.level);
        for(let i=0;i<hits.length;i++){
          const windowHits=hits.filter(x=>x.level>=hits[i].level&&x.level<hits[i].level+rule.window);
          if(windowHits.length>rule.max){
            pushWarning("ROOT_DENSITY",`「${rule.label}」在 ${rule.window} 級範圍內出現 ${windowHits.length} 次，超過建議上限 ${rule.max}。`,{rule,levels:windowHits.map(x=>x.level),names:windowHits.map(x=>x.name)});
            break;
          }
        }
      });

      [...gearEntries,...enemyEntries,...mapEntries].forEach(entry=>{
        if(entry.level<=500) RULES.reservedBefore501.forEach(term=>{
          if(entry.name.includes(term)) pushWarning("SCALE_TOO_EARLY",`Lv${entry.level}「${entry.name}」過早使用保留詞「${term}」。`,entry);
        });
      });

      for(let r=0;r<regions.length-1;r++){
        const left=maps[regions[r].mapEnd];
        const right=maps[regions[r+1].mapEnd];
        if(!left||!right) continue;
        for(let slot=0;slot<5;slot++){
          const a=left.gear?.[slot],b=right.gear?.[slot];
          if(a&&b&&similarity(a,b)>=0.72) pushWarning("CHAPTER_END_TEMPLATE",`${regions[r].name} 與 ${regions[r+1].name} 的章末同部位裝備過度相似：「${a}」／「${b}」。`,{leftRegion:regions[r].name,rightRegion:regions[r+1].name,slot,a,b});
        }
      }
    }

    return {
      version:RULES.version,
      strict,
      passed:errors.length===0,
      clean:errors.length===0&&warnings.length===0,
      mapCount:maps.length,
      regionCount:regions.length,
      gearCount:gearEntries.length,
      enemyCount:enemyEntries.length,
      errors,
      warnings
    };
  }

  window.WORLD_NAMING_RULES=RULES;
  window.validateWorldNaming=validateWorldNaming;
  window.WORLD_NAMING_REPORT=validateWorldNaming({strict:true});
  if(window.WORLD_NAMING_REPORT.errors.length) console.error("[文明戰線] 世界命名硬錯誤",window.WORLD_NAMING_REPORT.errors);
  if(window.WORLD_NAMING_REPORT.warnings.length) console.warn("[文明戰線] 世界命名嚴格警告",window.WORLD_NAMING_REPORT.warnings);
})();