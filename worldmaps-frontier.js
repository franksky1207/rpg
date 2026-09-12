(function(){
 const REGION_MAPS=[
  {chapter:"星際邊疆",name:"邊疆殖民帶",min:151,max:155,gear:["邊疆戰刃","殖民戰術盔","遠域殖民甲","邊境推進靴","殖民指揮模組"],enemies:[["邊疆巡邏兵",151,"normal","attack"],["殖民防衛機",152,"normal","balanced"],["遠域傭兵",153,"normal","tank"],["殖民重裝體",154,"elite","tank"],["邊疆殖民領主",155,"boss","balanced"]]},
  {chapter:"星際邊疆",name:"星際傭兵港",min:156,max:160,gear:["傭兵脈衝刃","私軍戰盔","雇傭重甲","星港突進靴","傭兵識別核心"],enemies:[["星際傭兵",156,"normal","balanced"],["私軍突擊兵",157,"normal","attack"],["賞金獵兵",158,"normal","tank"],["重裝傭兵機",159,"elite","attack"],["傭兵港霸主",160,"boss","tank"]]},
  {chapter:"星際邊疆",name:"遠征補給線",min:161,max:165,gear:["遠征切割刃","補給戰盔","遠征防護甲","航線推進靴","補給調度核心"],enemies:[["補給護衛兵",161,"normal","balanced"],["航線巡弋機",162,"normal","tank"],["遠征戰鬥體",163,"normal","attack"],["重型補給艦",164,"elite","tank"],["遠征補給司令",165,"boss","balanced"]]},
  {chapter:"星際邊疆",name:"異星叢林殖民地",min:166,max:170,gear:["異星獵刃","生態戰盔","殖民適應甲","叢林機動靴","異星生態核心"],enemies:[["異星獵獸",166,"normal","attack"],["殖民偵察兵",167,"normal","balanced"],["生態戰鬥體",168,"normal","attack"],["叢林重裝獸",169,"elite","tank"],["異星殖民母巢",170,"boss","tank"]]},
  {chapter:"星際邊疆",name:"邊境海盜星域",min:171,max:175,gear:["海盜裂星刃","掠奪戰盔","黑市戰甲","漂移推進靴","海盜導航核"],enemies:[["星際海盜",171,"normal","balanced"],["漂移掠奪兵",172,"normal","attack"],["黑市戰鬥機",173,"normal","balanced"],["重裝劫掠艦",174,"elite","tank"],["邊境海盜王",175,"boss","attack"]]},
  {chapter:"星際邊疆",name:"外文明接觸區",min:176,max:180,gear:["接觸光刃","異文明觀測盔","跨種族防護甲","外交機動靴","文明翻譯核心"],enemies:[["外文明斥候",176,"normal","attack"],["異星衛兵",177,"normal","balanced"],["接觸戰鬥體",178,"normal","tank"],["文明護衛艦",179,"elite","tank"],["外文明使節長",180,"boss","balanced"]]},
  {chapter:"星際邊疆",name:"邊疆工業星",min:181,max:185,gear:["工業震裂刃","重工戰盔","重工強化甲","磁軌作業靴","工業控制核心"],enemies:[["工業護衛機",181,"normal","balanced"],["採掘戰兵",182,"normal","attack"],["帝國重工兵器",183,"normal","tank"],["工業攻城機",184,"elite","attack"],["邊疆工業主腦",185,"boss","tank"]]},
  {chapter:"星際邊疆",name:"遠域軍閥領地",min:186,max:190,gear:["軍閥戰刃","領主禁衛盔","遠域主戰甲","突襲躍遷靴","軍閥指揮核心"],enemies:[["軍閥星兵",186,"normal","balanced"],["領地巡邏艦",187,"normal","tank"],["遠域精銳兵",188,"normal","attack"],["軍閥重裝艦",189,"elite","tank"],["遠域軍閥",190,"boss","balanced"]]},
  {chapter:"星際邊疆",name:"星際難民航路",min:191,max:195,gear:["護航光刃","難民艦戰盔","長航生存甲","遠航推進靴","航路導航核心"],enemies:[["航路掠奪兵",191,"normal","attack"],["追擊無人機",192,"normal","balanced"],["流亡戰鬥體",193,"normal","attack"],["封鎖戰艦",194,"elite","tank"],["航路封鎖者",195,"boss","tank"]]},
  {chapter:"星際邊疆",name:"邊疆霸權戰場",min:196,max:200,gear:["邊疆終戰刃","遠征主控盔","邊疆霸權甲","終戰躍遷靴","邊疆主控核心"],enemies:[["終戰遠征兵",196,"normal","balanced"],["高階殖民戰體",197,"normal","attack"],["邊疆戰爭巨像",198,"normal","balanced"],["遠域重裝將",199,"elite","tank"],["邊疆戰爭霸主",200,"boss","attack"]]}
 ];
 MAPS.push(...REGION_MAPS);
})();