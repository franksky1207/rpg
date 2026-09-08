(function(){
 const SOLAR_MAPS=[
  {chapter:"太陽系戰爭",name:"月面登陸區",min:51,max:55,gear:["月塵振動刃","低重力作戰盔","月面複合甲","真空磁吸靴","月面導航晶片"],enemies:[["月塵斥候",51,"normal","attack"],["低重力獵兵",52,"normal","balanced"],["月面自律炮台",53,"normal","tank"],["銀灰重裝兵",54,"elite","tank"],["月面封鎖者",55,"boss","balanced"]]},
  {chapter:"太陽系戰爭",name:"月球軌道站",min:56,max:60,gear:["軌道切割刃","真空密封盔","軌道作戰甲","艙外推進靴","軌道定位模組"],enemies:[["軌道巡弋機",56,"normal","attack"],["真空突擊兵",57,"normal","balanced"],["艙段防衛體",58,"normal","tank"],["軌道鎮壓機",59,"elite","attack"],["環月戰站主控體",60,"boss","tank"]]},
  {chapter:"太陽系戰爭",name:"火星殖民區",min:61,max:65,gear:["赤原脈衝刃","火星戰術盔","殖民防衛甲","赤塵機動靴","火星環境核心"],enemies:[["赤塵巡邏兵",61,"normal","balanced"],["殖民區暴走機",62,"normal","attack"],["火星工程戰體",63,"normal","tank"],["赤原鎮壓者",64,"elite","balanced"],["火星殖民總督",65,"boss","tank"]]},
  {chapter:"太陽系戰爭",name:"火星赤原戰場",min:66,max:70,gear:["赤星重刃","沙暴戰盔","火星重型甲","赤原突進靴","戰區火控模組"],enemies:[["赤原突擊兵",66,"normal","attack"],["沙暴獵殺機",67,"normal","balanced"],["火星重裝車",68,"normal","tank"],["赤色攻城機",69,"elite","tank"],["火星戰爭領主",70,"boss","attack"]]},
  {chapter:"太陽系戰爭",name:"小行星採礦帶",min:71,max:75,gear:["礦脈震裂刃","採礦重盔","工業強化甲","零重力磁靴","礦帶掃描器"],enemies:[["採礦護衛機",71,"normal","balanced"],["漂移海盜兵",72,"normal","attack"],["爆破無人機",73,"normal","attack"],["重型採掘戰機",74,"elite","tank"],["小行星掠奪王",75,"boss","balanced"]]},
  {chapter:"太陽系戰爭",name:"木衛戰區",min:76,max:80,gear:["冰月能量刃","冰殼戰盔","低溫動力甲","冰面推進靴","木衛導航核心"],enemies:[["冰月哨兵",76,"normal","balanced"],["木衛獵殺體",77,"normal","attack"],["低溫戰鬥機",78,"normal","attack"],["冰殼攻城獸",79,"elite","tank"],["木衛戰區霸主",80,"boss","tank"]]},
  {chapter:"太陽系戰爭",name:"木星軌道圈",min:81,max:85,gear:["重力脈衝刃","軌道重戰盔","高壓戰鬥甲","引力修正靴","重力控制模組"],enemies:[["重力攔截機",81,"normal","attack"],["軌道槍兵",82,"normal","balanced"],["風暴突擊體",83,"normal","attack"],["巨引力戰機",84,"elite","tank"],["木星軌道執政官",85,"boss","balanced"]]},
  {chapter:"太陽系戰爭",name:"土星環防線",min:86,max:90,gear:["環帶光刃","碎冰防衛盔","環軌防護甲","環帶機動靴","土星環定位器"],enemies:[["環帶偵察機",86,"normal","attack"],["碎冰突擊兵",87,"normal","balanced"],["環軌炮衛",88,"normal","tank"],["土星環重裝艦",89,"elite","tank"],["環帶防線統帥",90,"boss","balanced"]]},
  {chapter:"太陽系戰爭",name:"外太陽系邊境",min:91,max:95,gear:["深空切界刃","遠域探勘盔","深空生存甲","遠日推進靴","深空導航核心"],enemies:[["邊境巡弋者",91,"normal","balanced"],["深空獵兵",92,"normal","attack"],["遠日戰鬥體",93,"normal","tank"],["黑域追擊艦",94,"elite","attack"],["外域守門者",95,"boss","tank"]]},
  {chapter:"太陽系戰爭",name:"太陽系終極戰線",min:96,max:100,gear:["日耀終戰刃","恆星戰術盔","太陽系主戰甲","終極躍遷靴","太陽系主控核心"],enemies:[["終戰星兵",96,"normal","attack"],["高階殲滅機",97,"normal","balanced"],["太陽系主控戰體",98,"normal","tank"],["恆星級重裝將",99,"elite","balanced"],["太陽系征服中樞",100,"boss","tank"]]}
 ];
 MAPS.splice(10,Math.max(0,MAPS.length-10),...SOLAR_MAPS);
})();