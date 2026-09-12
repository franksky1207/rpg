(function(){
 const REGION_MAPS=[
  {chapter:"近星戰爭",name:"比鄰星前哨區",min:101,max:105,gear:["比鄰星航刃","紅矮星作戰盔","近星複合甲","光帆推進靴","比鄰座標核心"],enemies:[["星航斥候",101,"normal","attack"],["紅矮星巡邏兵",102,"normal","balanced"],["近星偵察機",103,"normal","tank"],["前哨重裝體",104,"elite","tank"],["比鄰星守備官",105,"boss","balanced"]]},
  {chapter:"近星戰爭",name:"半人馬座航道",min:106,max:110,gear:["星路切割刃","航道導航盔","星航防護甲","曲率機動靴","半人馬導航核"],enemies:[["航道巡弋機",106,"normal","balanced"],["星路突擊兵",107,"normal","attack"],["曲率攔截體",108,"normal","tank"],["星航重甲兵",109,"elite","attack"],["半人馬航道統帥",110,"boss","tank"]]},
  {chapter:"近星戰爭",name:"巴納德星殖民區",min:111,max:115,gear:["殖民震盪刃","紅星殖民盔","遠星防衛甲","殖民疾行靴","巴納德環境核"],enemies:[["殖民巡邏兵",111,"normal","balanced"],["紅星工程體",112,"normal","tank"],["遠星獵兵",113,"normal","attack"],["殖民重裝機",114,"elite","tank"],["巴納德殖民總督",115,"boss","balanced"]]},
  {chapter:"近星戰爭",name:"沃夫359防線",min:116,max:120,gear:["沃夫光刃","近星戰術盔","防線動力甲","恆星機動靴","沃夫防衛模組"],enemies:[["防線星兵",116,"normal","attack"],["恆星攔截機",117,"normal","balanced"],["近星戰鬥體",118,"normal","attack"],["沃夫重裝艦",119,"elite","tank"],["沃夫359守門者",120,"boss","tank"]]},
  {chapter:"近星戰爭",name:"天狼星外圍",min:121,max:125,gear:["天狼裂光刃","高亮星戰盔","星際強化甲","光譜推進靴","天狼定位核心"],enemies:[["天狼斥候",121,"normal","balanced"],["光譜獵兵",122,"normal","attack"],["高亮星戰體",123,"normal","balanced"],["天狼攻城機",124,"elite","tank"],["天狼星戰區霸主",125,"boss","attack"]]},
  {chapter:"近星戰爭",name:"天狼星殖民環",min:126,max:130,gear:["星環脈衝刃","殖民環戰盔","天狼環軌甲","環域推進靴","星環控制模組"],enemies:[["星環巡邏兵",126,"normal","attack"],["殖民環守衛",127,"normal","balanced"],["環軌炮衛",128,"normal","tank"],["天狼環戰艦",129,"elite","tank"],["殖民環執政官",130,"boss","balanced"]]},
  {chapter:"近星戰爭",name:"南河三星港",min:131,max:135,gear:["星港光刃","深港作戰盔","星港重甲","港區磁靴","星港調度核心"],enemies:[["星港護衛兵",131,"normal","balanced"],["港區攔截機",132,"normal","attack"],["星航工程體",133,"normal","tank"],["星港鎮壓艦",134,"elite","attack"],["南河三港務統帥",135,"boss","tank"]]},
  {chapter:"近星戰爭",name:"織女星觀測區",min:136,max:140,gear:["織女光譜刃","觀測戰盔","高能屏蔽甲","光譜浮行靴","織女觀測核心"],enemies:[["觀測哨兵",136,"normal","balanced"],["光譜獵殺體",137,"normal","tank"],["高能巡弋機",138,"normal","attack"],["織女守衛艦",139,"elite","tank"],["觀測區主控體",140,"boss","balanced"]]},
  {chapter:"近星戰爭",name:"近星文明遺址",min:141,max:145,gear:["遠古星刃","遺址密封盔","近星遺物甲","遺跡躍遷靴","古星文明鑰核"],enemies:[["遺址守衛體",141,"normal","attack"],["古星自律兵器",142,"normal","balanced"],["文明防衛機",143,"normal","attack"],["遠古戰鬥巨像",144,"elite","tank"],["近星遺址中樞",145,"boss","tank"]]},
  {chapter:"近星戰爭",name:"近星封鎖航域",min:146,max:150,gear:["近星終戰刃","星航主控盔","近星主戰甲","終戰曲率靴","近星主控核心"],enemies:[["近星決戰兵",146,"normal","balanced"],["高階星航機",147,"normal","attack"],["近星主控戰體",148,"normal","balanced"],["星航重裝將",149,"elite","tank"],["近星航域支配者",150,"boss","attack"]]}
 ];
 MAPS.push(...REGION_MAPS);
})();