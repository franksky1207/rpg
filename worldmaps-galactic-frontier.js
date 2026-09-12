(function(){
 const REGION_MAPS=[
  {chapter:"銀河邊境",name:"銀河邊境帶",min:251,max:255,gear:["邊境星河刃","銀河遠域盔","邊境文明甲","星海推進靴","邊境航標"],enemies:[["銀河邊境兵",251,"normal","attack"],["邊境探巡機",252,"normal","balanced"],["遠域文明體",253,"normal","tank"],["邊境重裝艦",254,"elite","tank"],["邊境星域監督者",255,"boss","balanced"]]},
  {chapter:"銀河邊境",name:"古文明遺跡群",min:256,max:260,gear:["古星遺刃","遺物冠盔","遠古文明甲","遺跡浮躍靴","古文明鑰核"],enemies:[["古文明守衛",256,"normal","balanced"],["遺跡自律兵",257,"normal","attack"],["遠古戰爭單元",258,"normal","tank"],["文明守護泰坦",259,"elite","attack"],["古文明中樞",260,"boss","tank"]]},
  {chapter:"銀河邊境",name:"失落星系殖民地",min:261,max:265,gear:["失落光刃","流亡戰盔","廢墟殖民甲","流亡航跡靴","失落殖民刻印"],enemies:[["流亡星兵",261,"normal","balanced"],["廢墟巡邏體",262,"normal","tank"],["失落文明兵",263,"normal","attack"],["殖民地守護艦",264,"elite","tank"],["失落殖民總督",265,"boss","balanced"]]},
  {chapter:"銀河邊境",name:"銀河海盜領域",min:266,max:270,gear:["星海劫掠刃","海盜王戰盔","掠奪主戰甲","星海漂移靴","劫掠航標"],enemies:[["銀河海盜",266,"normal","attack"],["星海掠奪兵",267,"normal","balanced"],["劫掠戰機",268,"normal","attack"],["海盜破城艦",269,"elite","tank"],["銀河海盜王",270,"boss","tank"]]},
  {chapter:"銀河邊境",name:"遺跡兵器墓場",min:271,max:275,gear:["遺兵斷裂刃","墓場戰盔","殘骸戰甲","殘星推進靴","兵器殘骸索引"],enemies:[["殘骸守衛體",271,"normal","balanced"],["遺跡戰兵",272,"normal","attack"],["廢棄戰鬥機",273,"normal","balanced"],["遠古殘骸巨兵",274,"elite","tank"],["墓場回收核心",275,"boss","attack"]]},
  {chapter:"銀河邊境",name:"星海流亡區",min:276,max:280,gear:["流亡星刃","漂泊者戰盔","星海生存甲","遠漂躍遷靴","流亡航標"],enemies:[["流亡傭兵",276,"normal","attack"],["漂泊護航體",277,"normal","balanced"],["星海獵兵",278,"normal","tank"],["遠域戰艦",279,"elite","tank"],["流亡文明首領",280,"boss","balanced"]]},
  {chapter:"銀河邊境",name:"銀河商路樞紐",min:281,max:285,gear:["商路護衛刃","交易戰盔","商隊防護甲","高速航運靴","商路交易節點"],enemies:[["商路護衛兵",281,"normal","balanced"],["交易站警戒機",282,"normal","attack"],["商隊護衛單元",283,"normal","tank"],["護航重艦",284,"elite","attack"],["商路執政官",285,"boss","tank"]]},
  {chapter:"銀河邊境",name:"古代星門網",min:286,max:290,gear:["古門切界刃","星門遺盔","空間遺甲","古門穿界靴","遠古星門遺核"],enemies:[["古門守衛機",286,"normal","balanced"],["星門遺兵",287,"normal","tank"],["空間防衛體",288,"normal","attack"],["古代門神兵器",289,"elite","tank"],["星門網中樞",290,"boss","balanced"]]},
  {chapter:"銀河邊境",name:"邊境文明戰場",min:291,max:295,gear:["文明裂星刃","邊境王冠盔","文明重戰甲","星域突進靴","邊境統御核"],enemies:[["文明聯軍兵",291,"normal","attack"],["邊境征戰體",292,"normal","balanced"],["星海戰機群",293,"normal","attack"],["文明攻城艦",294,"elite","tank"],["邊境文明霸主",295,"boss","tank"]]},
  {chapter:"銀河邊境",name:"銀河邊境裁決區",min:296,max:300,gear:["邊境裁決刃","銀河遠征盔","邊境裁定甲","裁決航行靴","邊境裁決權限"],enemies:[["終戰文明兵",296,"normal","balanced"],["遠古星海禁衛",297,"normal","attack"],["銀河邊境鎮壓體",298,"normal","balanced"],["遠域霸權將軍",299,"elite","tank"],["銀河邊境裁定者",300,"boss","attack"]]}
 ];
 MAPS.push(...REGION_MAPS);
})();