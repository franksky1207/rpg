(function(){
 const ALTERNATE_UNIVERSE_DATA_VERSION=2;
 const ALTERNATE_UNIVERSE_TITLE_DATA_VERSION=1;
 const ALTERNATE_UNIVERSE_UNIVERSE_COUNT=200;
 const ALTERNATE_UNIVERSE_DEPTHS_PER_UNIVERSE=5;
 const ALTERNATE_UNIVERSE_DATA_MAX_DEPTH=1000;
 const ALTERNATE_UNIVERSE_BASE_CRIT=20;
 const ALTERNATE_UNIVERSE_BASE_DODGE=20;
 const ALTERNATE_UNIVERSE_TITLE_ROWS=Object.freeze([
  Object.freeze({id:"alternate-universe-title-01",name:"異界凌越",tier:1,depthThreshold:100,series:"alternate-universe"}),
  Object.freeze({id:"alternate-universe-title-02",name:"萬界破境",tier:2,depthThreshold:200,series:"alternate-universe"}),
  Object.freeze({id:"alternate-universe-title-03",name:"異律掌御",tier:3,depthThreshold:300,series:"alternate-universe"}),
  Object.freeze({id:"alternate-universe-title-04",name:"諸宇錯序",tier:4,depthThreshold:400,series:"alternate-universe"}),
  Object.freeze({id:"alternate-universe-title-05",name:"萬律凌駕",tier:5,depthThreshold:500,series:"alternate-universe"}),
  Object.freeze({id:"alternate-universe-title-06",name:"諸界超脫",tier:6,depthThreshold:600,series:"alternate-universe"}),
  Object.freeze({id:"alternate-universe-title-07",name:"萬宇無疆",tier:7,depthThreshold:700,series:"alternate-universe"}),
  Object.freeze({id:"alternate-universe-title-08",name:"諸界歸一",tier:8,depthThreshold:800,series:"alternate-universe"}),
  Object.freeze({id:"alternate-universe-title-09",name:"宇外凌絕",tier:9,depthThreshold:900,series:"alternate-universe"}),
  Object.freeze({id:"alternate-universe-title-10",name:"宇外無極",tier:10,depthThreshold:1000,series:"alternate-universe"})
 ]);
 const ALTERNATE_UNIVERSE_DEPTH_LABELS=Object.freeze(["外環","神庭","聖域","天座","主宰"]);
 const ALTERNATE_UNIVERSE_CULTURES=Object.freeze(["冰霜神系","太陽火焰","雷霆天穹","冥界死亡","海洋深淵","自然生命","龍族神權","機械神性","命運時間","星辰宇宙","戰爭兵器","秩序審判","混沌虛無","夢境心靈","光明聖界","黑暗血月","巨人泰坦","沙漠古文明","蟲群生體","超維法則"]);
 const ALTERNATE_UNIVERSE_NAMES=Object.freeze(["幽都宇宙","血月宇宙","霜冠宇宙","雷冠宇宙","龍庭宇宙","星神宇宙","命輪宇宙","光庭宇宙","蟲巢宇宙","夢庭宇宙","機神宇宙","戰庭宇宙","赤曜宇宙","界律宇宙","巨庭宇宙","虛空宇宙","律庭宇宙","黃沙宇宙","深潮宇宙","森皇宇宙","海皇宇宙","幻月宇宙","聖輝宇宙","群生宇宙","維庭宇宙","鋼皇宇宙","聖律宇宙","古樹宇宙","暗庭宇宙","沙皇宇宙","冥河宇宙","永冬宇宙","炎皇宇宙","兵皇宇宙","織命宇宙","天罰宇宙","山皇宇宙","混沌宇宙","萬星宇宙","天龍宇宙","星墓宇宙","噬界宇宙","生命宇宙","黎明宇宙","熾陽宇宙","淵海宇宙","寒神宇宙","黃泉宇宙","古墓宇宙","蒼雷宇宙","無相宇宙","古龍宇宙","天秤宇宙","超域宇宙","泰坦宇宙","神機宇宙","黑潮宇宙","赤鋒宇宙","時庭宇宙","靈夢宇宙","龍皇宇宙","鐵血宇宙","岩神宇宙","天光宇宙","雷帝宇宙","鐵庭宇宙","日輪宇宙","翠庭宇宙","母巢宇宙","夜皇宇宙","白夜宇宙","死境宇宙","高維宇宙","心界宇宙","黑日宇宙","審判宇宙","焚天宇宙","空寂宇宙","潮神宇宙","永時宇宙","軍神宇宙","神耀宇宙","萬木宇宙","械心宇宙","龍墓宇宙","巨靈宇宙","月蝕宇宙","寂魂宇宙","法則宇宙","虛界宇宙","輪迴宇宙","法皇宇宙","冰座宇宙","萬蟲宇宙","烈冠宇宙","金庭宇宙","蒼海宇宙","震霄宇宙","闇神宇宙","幻神宇宙","天柱宇宙","深淵宇宙","赤日宇宙","沙神宇宙","靈森宇宙","界皇宇宙","夢皇宇宙","神律宇宙","因果宇宙","蟲皇宇宙","血獄宇宙","神雷宇宙","零號宇宙","萬龍宇宙","凍星宇宙","星庭宇宙","聖皇宇宙","無序宇宙","萬軍宇宙","冥庭宇宙","海庭宇宙","神樹宇宙","太虛宇宙","燼神宇宙","天河宇宙","生化宇宙","亡界宇宙","量子宇宙","電皇宇宙","宿命宇宙","雪皇宇宙","神兵宇宙","玄龍宇宙","萬光宇宙","神碑宇宙","公理宇宙","巨王宇宙","超越宇宙","黑星宇宙","萬夢宇宙","原巢宇宙","無名宇宙","炎獄宇宙","祖巨宇宙","翠皇宇宙","裁決宇宙","永夜宇宙","戰獄宇宙","晶核宇宙","純白宇宙","時皇宇宙","風雷宇宙","聖龍宇宙","曜辰宇宙","玄冰宇宙","萬墓宇宙","無限宇宙","無眠宇宙","萬潮宇宙","幽冥宇宙","龍海宇宙","暴穹宇宙","寂滅宇宙","曜火宇宙","萬刻宇宙","極霜宇宙","暗滅宇宙","永機宇宙","秩序宇宙","古王宇宙","森羅宇宙","萬岳宇宙","天災宇宙","歸零宇宙","至聖宇宙","至高界宇宙","星皇宇宙","始龍宇宙","終戰宇宙","真幻宇宙","零界冰皇宇宙","永晝神域宇宙","永夢主宰宇宙","終焰天陽宇宙","永恆法老宇宙","世界巨神宇宙","終極母神宇宙","萬維主宰宇宙","終死冥皇宇宙","祖龍天界宇宙","終夜魔神宇宙","原生神域宇宙","萬霆天主宇宙","萬象星主宇宙","終極機神宇宙","原初虛無宇宙","終時神座宇宙","至高裁定宇宙","無雙戰神宇宙","無盡海神宇宙"]);
 const ALTERNATE_UNIVERSE_NAME_CULTURES=Object.freeze(["冥界死亡","黑暗血月","冰霜神系","雷霆天穹","龍族神權","星辰宇宙","命運時間","光明聖界","蟲群生體","夢境心靈","機械神性","戰爭兵器","太陽火焰","超維法則","巨人泰坦","混沌虛無","秩序審判","沙漠古文明","海洋深淵","自然生命","海洋深淵","夢境心靈","光明聖界","蟲群生體","超維法則","機械神性","秩序審判","自然生命","黑暗血月","沙漠古文明","冥界死亡","冰霜神系","太陽火焰","戰爭兵器","命運時間","雷霆天穹","巨人泰坦","混沌虛無","星辰宇宙","龍族神權","星辰宇宙","蟲群生體","自然生命","光明聖界","太陽火焰","海洋深淵","冰霜神系","冥界死亡","沙漠古文明","雷霆天穹","混沌虛無","龍族神權","秩序審判","超維法則","巨人泰坦","機械神性","黑暗血月","戰爭兵器","命運時間","夢境心靈","龍族神權","戰爭兵器","巨人泰坦","光明聖界","雷霆天穹","機械神性","沙漠古文明","自然生命","蟲群生體","黑暗血月","冰霜神系","冥界死亡","超維法則","夢境心靈","星辰宇宙","秩序審判","太陽火焰","混沌虛無","海洋深淵","命運時間","戰爭兵器","光明聖界","自然生命","機械神性","龍族神權","巨人泰坦","星辰宇宙","冥界死亡","超維法則","混沌虛無","命運時間","秩序審判","冰霜神系","蟲群生體","太陽火焰","沙漠古文明","海洋深淵","雷霆天穹","黑暗血月","夢境心靈","巨人泰坦","海洋深淵","太陽火焰","沙漠古文明","自然生命","超維法則","夢境心靈","秩序審判","命運時間","蟲群生體","黑暗血月","雷霆天穹","機械神性","龍族神權","冰霜神系","星辰宇宙","光明聖界","混沌虛無","戰爭兵器","冥界死亡","海洋深淵","自然生命","混沌虛無","太陽火焰","星辰宇宙","蟲群生體","冥界死亡","機械神性","雷霆天穹","命運時間","冰霜神系","戰爭兵器","龍族神權","光明聖界","沙漠古文明","秩序審判","巨人泰坦","超維法則","黑暗血月","夢境心靈","蟲群生體","混沌虛無","太陽火焰","巨人泰坦","自然生命","秩序審判","黑暗血月","戰爭兵器","機械神性","光明聖界","命運時間","雷霆天穹","龍族神權","星辰宇宙","冰霜神系","沙漠古文明","超維法則","夢境心靈","海洋深淵","冥界死亡","海洋深淵","雷霆天穹","冥界死亡","太陽火焰","命運時間","冰霜神系","黑暗血月","機械神性","秩序審判","沙漠古文明","自然生命","巨人泰坦","蟲群生體","混沌虛無","光明聖界","超維法則","星辰宇宙","龍族神權","戰爭兵器","夢境心靈","冰霜神系","光明聖界","夢境心靈","太陽火焰","沙漠古文明","巨人泰坦","蟲群生體","超維法則","冥界死亡","龍族神權","黑暗血月","自然生命","雷霆天穹","星辰宇宙","機械神性","混沌虛無","命運時間","秩序審判","戰爭兵器","海洋深淵"]);

 function alternateUniverseClampDepth(value){
  const n=Math.floor(Number(value));
  if(!Number.isFinite(n))return 0;
  return Math.max(0,Math.min(ALTERNATE_UNIVERSE_DATA_MAX_DEPTH,n));
 }
 function alternateUniverseEnemyStats(depth){
  const u=alternateUniverseClampDepth(depth);
  if(u<1)return null;
  return Object.freeze({
   depth:u,
   hp:320000+30000*u+1500*u*u,
   atk:26000+600*u,
   def:12000+250*u,
   crit:ALTERNATE_UNIVERSE_BASE_CRIT,
   dodge:ALTERNATE_UNIVERSE_BASE_DODGE
  });
 }
 function alternateUniverseDepthInfo(depth){
  const u=alternateUniverseClampDepth(depth);
  if(u<1)return null;
  const universeIndex=Math.floor((u-1)/ALTERNATE_UNIVERSE_DEPTHS_PER_UNIVERSE);
  const stageIndex=(u-1)%ALTERNATE_UNIVERSE_DEPTHS_PER_UNIVERSE;
  const universeNumber=universeIndex+1;
  const universeName=ALTERNATE_UNIVERSE_NAMES[universeIndex];
  const culture=ALTERNATE_UNIVERSE_NAME_CULTURES[universeIndex];
  const stageName=ALTERNATE_UNIVERSE_DEPTH_LABELS[stageIndex];
  return Object.freeze({
   depth:u,
   universeNumber,
   universeIndex,
   universeName,
   culture,
   stageIndex,
   stageNumber:stageIndex+1,
   stageName,
   displayName:`${universeName}・${stageName}`,
   enemy:alternateUniverseEnemyStats(u)
  });
 }
 function alternateUniverseDepthFromUniverse(universeNumber,stageNumber){
  const universe=Math.floor(Number(universeNumber));
  const stage=Math.floor(Number(stageNumber));
  if(!Number.isFinite(universe)||!Number.isFinite(stage)||universe<1||universe>ALTERNATE_UNIVERSE_UNIVERSE_COUNT||stage<1||stage>ALTERNATE_UNIVERSE_DEPTHS_PER_UNIVERSE)return 0;
  return (universe-1)*ALTERNATE_UNIVERSE_DEPTHS_PER_UNIVERSE+stage;
 }
 function alternateUniverseUniverseInfo(universeNumber){
  const universe=Math.floor(Number(universeNumber));
  if(!Number.isFinite(universe)||universe<1||universe>ALTERNATE_UNIVERSE_UNIVERSE_COUNT)return null;
  const index=universe-1;
  const firstDepth=alternateUniverseDepthFromUniverse(universe,1);
  return Object.freeze({
   universeNumber:universe,
   universeIndex:index,
   name:ALTERNATE_UNIVERSE_NAMES[index],
   culture:ALTERNATE_UNIVERSE_NAME_CULTURES[index],
   firstDepth,
   lastDepth:firstDepth+ALTERNATE_UNIVERSE_DEPTHS_PER_UNIVERSE-1
  });
 }
 function runAlternateUniverseDataIntegrity(){
  const errors=[];
  if(ALTERNATE_UNIVERSE_NAMES.length!==ALTERNATE_UNIVERSE_UNIVERSE_COUNT)errors.push({code:"UNIVERSE_COUNT",actual:ALTERNATE_UNIVERSE_NAMES.length});
  if(ALTERNATE_UNIVERSE_NAME_CULTURES.length!==ALTERNATE_UNIVERSE_UNIVERSE_COUNT)errors.push({code:"CULTURE_ROW_COUNT",actual:ALTERNATE_UNIVERSE_NAME_CULTURES.length});
  if(new Set(ALTERNATE_UNIVERSE_CULTURES).size!==20)errors.push({code:"CULTURE_COUNT",actual:new Set(ALTERNATE_UNIVERSE_CULTURES).size});
  const cultureCounts=Object.fromEntries(ALTERNATE_UNIVERSE_CULTURES.map(culture=>[culture,ALTERNATE_UNIVERSE_NAME_CULTURES.filter(row=>row===culture).length]));
  if(Object.values(cultureCounts).some(count=>count!==10))errors.push({code:"CULTURE_DISTRIBUTION",actual:cultureCounts});
  if(new Set(ALTERNATE_UNIVERSE_NAMES).size!==ALTERNATE_UNIVERSE_UNIVERSE_COUNT)errors.push({code:"DUPLICATE_UNIVERSE_NAME",actual:ALTERNATE_UNIVERSE_NAMES.length-new Set(ALTERNATE_UNIVERSE_NAMES).size});
  if(ALTERNATE_UNIVERSE_DEPTH_LABELS.join("|")!=="外環|神庭|聖域|天座|主宰")errors.push({code:"DEPTH_LABELS",actual:ALTERNATE_UNIVERSE_DEPTH_LABELS.slice()});
  if(ALTERNATE_UNIVERSE_TITLE_ROWS.length!==10||ALTERNATE_UNIVERSE_TITLE_ROWS.some((row,index)=>row.tier!==index+1||row.depthThreshold!==(index+1)*100||String(row.name||"").length!==4||row.series!=="alternate-universe")||new Set(ALTERNATE_UNIVERSE_TITLE_ROWS.map(row=>row.id)).size!==10||new Set(ALTERNATE_UNIVERSE_TITLE_ROWS.map(row=>row.name)).size!==10)errors.push({code:"TITLE_ROWS",actual:ALTERNATE_UNIVERSE_TITLE_ROWS});
  const invalidCultures=ALTERNATE_UNIVERSE_NAME_CULTURES.filter(row=>!ALTERNATE_UNIVERSE_CULTURES.includes(row));
  if(invalidCultures.length)errors.push({code:"UNKNOWN_CULTURE",actual:[...new Set(invalidCultures)]});
  const first=alternateUniverseDepthInfo(1),fifth=alternateUniverseDepthInfo(5),sixth=alternateUniverseDepthInfo(6),last=alternateUniverseDepthInfo(1000);
  if(first?.displayName!=="幽都宇宙・外環"||first?.culture!=="冥界死亡")errors.push({code:"FIRST_DEPTH_MAPPING",actual:first});
  if(fifth?.displayName!=="幽都宇宙・主宰")errors.push({code:"FIFTH_DEPTH_MAPPING",actual:fifth});
  if(sixth?.displayName!=="血月宇宙・外環")errors.push({code:"SIXTH_DEPTH_MAPPING",actual:sixth});
  if(last?.displayName!=="無盡海神宇宙・主宰"||last?.culture!=="海洋深淵")errors.push({code:"LAST_DEPTH_MAPPING",actual:last});
  const u1=alternateUniverseEnemyStats(1),u1000=alternateUniverseEnemyStats(1000);
  if(u1?.hp!==351500||u1?.atk!==26600||u1?.def!==12250||u1?.crit!==20||u1?.dodge!==20)errors.push({code:"U1_STATS",actual:u1});
  if(u1000?.hp!==1530320000||u1000?.atk!==626000||u1000?.def!==262000||u1000?.crit!==20||u1000?.dodge!==20)errors.push({code:"U1000_STATS",actual:u1000});
  if(alternateUniverseDepthFromUniverse(200,5)!==1000)errors.push({code:"REVERSE_MAPPING"});
  return {ok:errors.length===0,version:ALTERNATE_UNIVERSE_DATA_VERSION,errors};
 }

 window.ALTERNATE_UNIVERSE_DATA_VERSION=ALTERNATE_UNIVERSE_DATA_VERSION;
 window.ALTERNATE_UNIVERSE_UNIVERSE_COUNT=ALTERNATE_UNIVERSE_UNIVERSE_COUNT;
 window.ALTERNATE_UNIVERSE_DEPTHS_PER_UNIVERSE=ALTERNATE_UNIVERSE_DEPTHS_PER_UNIVERSE;
 window.ALTERNATE_UNIVERSE_BASE_CRIT=ALTERNATE_UNIVERSE_BASE_CRIT;
 window.ALTERNATE_UNIVERSE_BASE_DODGE=ALTERNATE_UNIVERSE_BASE_DODGE;
 window.ALTERNATE_UNIVERSE_TITLE_DATA_VERSION=ALTERNATE_UNIVERSE_TITLE_DATA_VERSION;
 window.ALTERNATE_UNIVERSE_TITLE_ROWS=ALTERNATE_UNIVERSE_TITLE_ROWS;
 window.ALTERNATE_UNIVERSE_DEPTH_LABELS=ALTERNATE_UNIVERSE_DEPTH_LABELS;
 window.ALTERNATE_UNIVERSE_CULTURES=ALTERNATE_UNIVERSE_CULTURES;
 window.ALTERNATE_UNIVERSE_NAMES=ALTERNATE_UNIVERSE_NAMES;
 window.ALTERNATE_UNIVERSE_NAME_CULTURES=ALTERNATE_UNIVERSE_NAME_CULTURES;
 window.alternateUniverseEnemyStats=alternateUniverseEnemyStats;
 window.alternateUniverseDepthInfo=alternateUniverseDepthInfo;
 window.alternateUniverseDepthFromUniverse=alternateUniverseDepthFromUniverse;
 window.alternateUniverseUniverseInfo=alternateUniverseUniverseInfo;
 window.runAlternateUniverseDataIntegrity=runAlternateUniverseDataIntegrity;
})();
