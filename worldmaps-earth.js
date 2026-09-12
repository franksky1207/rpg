(function(){
 const EARTH_MAPS=[
  {chapter:"地球戰爭",name:"城市淪陷區",min:1,max:5,gear:["破門短刃","巷戰防護盔","城防插板甲","街區突進靴","戰場識別牌"],enemies:[["武裝暴徒",1,"normal","attack"],["偵察無人機",2,"normal","balanced"],["突擊士兵",3,"normal","balanced"],["重裝鎮壓兵",4,"elite","tank"],["城區佔領者",5,"boss","balanced"]]},
  {chapter:"地球戰爭",name:"郊區防衛線",min:6,max:10,gear:["壕溝軍刀","哨戒戰盔","防線重甲","越野作戰靴","前線測距儀"],enemies:[["戰地獵犬",6,"normal","attack"],["自律機槍兵",7,"normal","balanced"],["裝甲步兵",8,"normal","tank"],["重型機甲兵",9,"elite","tank"],["前線指揮官",10,"boss","balanced"]]},
  {chapter:"地球戰爭",name:"地下軍事設施",min:11,max:15,gear:["試作振動刃","地堡密封盔","實驗型護甲","封鎖區戰靴","軍規解碼器"],enemies:[["維修戰鬥機器",11,"normal","balanced"],["地堡守衛",12,"normal","tank"],["生化突擊兵",13,"normal","attack"],["地堡強襲機甲",14,"elite","tank"],["設施防衛核心",15,"boss","balanced"]]},
  {chapter:"地球戰爭",name:"荒漠戰區",min:16,max:20,gear:["沙暴斬刀","防砂戰術盔","沙地複合甲","荒漠疾行靴","熱源追獵器"],enemies:[["沙地偵察兵",16,"normal","attack"],["輕型戰車",17,"normal","tank"],["火力支援兵",18,"normal","balanced"],["主戰攻堅機甲",19,"elite","tank"],["荒漠戰區統帥",20,"boss","balanced"]]},
  {chapter:"地球戰爭",name:"污染禁區",min:21,max:25,gear:["蝕毒軍刃","全罩防化面盔","生化隔離甲","污染區封閉靴","異變偵測器"],enemies:[["異變感染者",21,"normal","attack"],["防化突擊兵",22,"normal","balanced"],["污染獵殺獸",23,"normal","attack"],["生化鎮壓兵",24,"elite","tank"],["污染母體",25,"boss","tank"]]},
  {chapter:"地球戰爭",name:"極地戰線",min:26,max:30,gear:["霜鋼長刃","極寒封閉盔","冰原保溫甲","雪地抓地靴","熱源定位器"],enemies:[["雪域哨兵",26,"normal","balanced"],["霜牙獵殺機",27,"normal","attack"],["白原裝甲兵",28,"normal","tank"],["冰脊攻城獸",29,"elite","tank"],["極寒戰爭巨像",30,"boss","tank"]]},
  {chapter:"地球戰爭",name:"古代科技遺址",min:31,max:35,gear:["古代光刃","遺物守衛盔","自律護衛甲","遺跡浮行靴","古文明鑰印"],enemies:[["遺址守衛機",31,"normal","balanced"],["古代自律兵器",32,"normal","tank"],["能量防衛體",33,"normal","attack"],["遠古戰爭機甲",34,"elite","tank"],["遺址中樞核心",35,"boss","balanced"]]},
  {chapter:"地球戰爭",name:"火山兵器基地",min:36,max:40,gear:["熔蝕重刃","高熱隔離盔","熔核耐熱甲","熱區推進靴","反應爐調節器"],enemies:[["熔爐守衛",36,"normal","tank"],["赤熱獵兵",37,"normal","attack"],["熔蝕突擊體",38,"normal","balanced"],["火山攻城兵器",39,"elite","tank"],["熔核殲滅者",40,"boss","attack"]]},
  {chapter:"地球戰爭",name:"全球指揮中心",min:41,max:45,gear:["禁衛脈衝刃","中樞禁衛盔","指揮級複合甲","戰略機動靴","戰場指揮模組"],enemies:[["中樞警衛兵",41,"normal","balanced"],["戰術無人機群",42,"normal","attack"],["精銳動力甲兵",43,"normal","tank"],["黑甲執行官",44,"elite","attack"],["全球戰區司令",45,"boss","balanced"]]},
  {chapter:"地球戰爭",name:"地球決戰區",min:46,max:50,gear:["終戰斷界刃","終戰主控盔","征服者重甲","最終突擊靴","地球主控權限"],enemies:[["終戰突擊兵",46,"normal","attack"],["高階戰鬥機甲",47,"normal","balanced"],["戰爭人工智慧體",48,"normal","tank"],["終局戰區將軍",49,"elite","balanced"],["地球征服核心",50,"boss","tank"]]}
 ];
 MAPS.splice(0,Math.min(10,MAPS.length),...EARTH_MAPS);
})();