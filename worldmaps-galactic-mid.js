(function(){
 const REGION_MAPS=[
  {chapter:"銀河中域",name:"帝國外環領地",min:301,max:305,gear:["帝國御鋒","外環禁衛盔","帝國主戰甲","領域躍遷靴","帝國權印"],enemies:[["帝國星兵",301,"normal","attack"],["外環巡弋艦",302,"normal","balanced"],["帝國作戰單元",303,"normal","tank"],["帝國禁衛艦",304,"elite","tank"],["帝國外環總督",305,"boss","balanced"]]},
  {chapter:"銀河中域",name:"聯邦星域",min:306,max:310,gear:["聯邦制式刃","星域戰盔","聯邦防護甲","聯邦航躍靴","聯邦戰術模組"],enemies:[["聯邦星兵",306,"normal","balanced"],["星域護衛機",307,"normal","attack"],["聯邦突擊體",308,"normal","tank"],["聯邦重艦",309,"elite","attack"],["星域聯邦司令",310,"boss","tank"]]},
  {chapter:"銀河中域",name:"星域軍團前線",min:311,max:315,gear:["軍團重刃","軍團戰盔","星域軍團甲","戰線機動靴","軍團指揮節點"],enemies:[["軍團星兵",311,"normal","balanced"],["戰線突擊機",312,"normal","tank"],["星域重裝兵",313,"normal","attack"],["軍團攻城艦",314,"elite","tank"],["星域軍團長",315,"boss","balanced"]]},
  {chapter:"銀河中域",name:"帝國工業世界",min:316,max:320,gear:["帝國工業刃","重工禁衛盔","工業主戰甲","磁軌戰靴","帝國生產權限"],enemies:[["工業守衛兵",316,"normal","attack"],["帝國工程機",317,"normal","balanced"],["帝國重工兵器",318,"normal","attack"],["工業戰爭平台",319,"elite","tank"],["帝國生產中樞",320,"boss","tank"]]},
  {chapter:"銀河中域",name:"聯邦首都圈",min:321,max:325,gear:["首都禁衛刃","聯邦冠盔","首都防衛甲","首都機動靴","聯邦中樞權印"],enemies:[["首都禁衛兵",321,"normal","balanced"],["首都衛戍機",322,"normal","attack"],["精銳星兵",323,"normal","balanced"],["首都重裝艦",324,"elite","tank"],["聯邦最高執政官",325,"boss","attack"]]},
  {chapter:"銀河中域",name:"星域競爭帶",min:326,max:330,gear:["星域裂光刃","霸權戰盔","競爭主戰甲","區域躍遷靴","星域爭霸權印"],enemies:[["星域爭霸兵",326,"normal","attack"],["星域傭兵",327,"normal","balanced"],["競爭武裝體",328,"normal","tank"],["區域戰艦",329,"elite","tank"],["星域戰爭領主",330,"boss","balanced"]]},
  {chapter:"銀河中域",name:"銀河帝國艦隊區",min:331,max:335,gear:["帝國艦刃","艦隊禁衛盔","帝國艦戰甲","艦橋機動靴","艦隊火控中樞"],enemies:[["帝國艦兵",331,"normal","balanced"],["艦隊攔截機",332,"normal","attack"],["重裝艦衛",333,"normal","tank"],["帝國戰列艦",334,"elite","attack"],["帝國艦隊提督",335,"boss","tank"]]},
  {chapter:"銀河中域",name:"文明議會星區",min:336,max:340,gear:["議政戒律刃","文明議冠","議會防護甲","議政通行靴","文明議政權限"],enemies:[["議會守衛兵",336,"normal","balanced"],["文明監察機",337,"normal","tank"],["議會戰鬥體",338,"normal","attack"],["議會護衛艦",339,"elite","tank"],["文明議長",340,"boss","balanced"]]},
  {chapter:"銀河中域",name:"霸權核心領地",min:341,max:345,gear:["霸權斷星刃","主宰冠盔","主宰王權甲","霸域穿梭靴","霸域統御中樞"],enemies:[["霸權禁衛",341,"normal","attack"],["主宰戰機",342,"normal","balanced"],["霸權執行體",343,"normal","attack"],["霸權巨艦",344,"elite","tank"],["霸權主宰者",345,"boss","tank"]]},
  {chapter:"銀河中域",name:"中域霸權核心",min:346,max:350,gear:["中域統御刃","銀河統帥盔","中域主戰甲","中域統御靴","中域統御權限"],enemies:[["終戰軍團兵",346,"normal","balanced"],["帝國霸權禁衛",347,"normal","attack"],["中域霸權要塞",348,"normal","balanced"],["銀河重裝統帥",349,"elite","tank"],["中域霸權執政官",350,"boss","attack"]]}
 ];
 MAPS.push(...REGION_MAPS);
})();