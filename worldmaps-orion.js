(function(){
 const REGION_MAPS=[
  {chapter:"獵戶臂戰爭",name:"獵戶臂前線",min:201,max:205,gear:["獵戶星刃","旋臂戰盔","星區主戰甲","獵戶躍遷靴","旋臂導航核心"],enemies:[["獵戶星兵",201,"normal","attack"],["旋臂巡弋機",202,"normal","balanced"],["星區突擊體",203,"normal","tank"],["獵戶重裝艦",204,"elite","tank"],["旋臂前線司令",205,"boss","balanced"]]},
  {chapter:"獵戶臂戰爭",name:"星門防衛區",min:206,max:210,gear:["星門切割刃","門衛戰盔","星門防護甲","空間穿越靴","星門控制核心"],enemies:[["星門守衛兵",206,"normal","balanced"],["空間攔截機",207,"normal","attack"],["門區炮衛",208,"normal","tank"],["星門重裝體",209,"elite","attack"],["星門防衛中樞",210,"boss","tank"]]},
  {chapter:"獵戶臂戰爭",name:"跨星航道",min:211,max:215,gear:["航道裂光刃","跨星導航盔","航路複合甲","超光速推進靴","跨星座標核"],enemies:[["航道巡弋艦",211,"normal","balanced"],["跨星突擊兵",212,"normal","tank"],["航路獵殺體",213,"normal","attack"],["高速攔截艦",214,"elite","tank"],["跨星航道統帥",215,"boss","balanced"]]},
  {chapter:"獵戶臂戰爭",name:"文明邊境線",min:216,max:220,gear:["文明戰刃","邊境冠盔","文明防衛甲","星區機動靴","文明識別核心"],enemies:[["文明星兵",216,"normal","attack"],["邊境守衛機",217,"normal","balanced"],["文明戰鬥體",218,"normal","attack"],["星區重裝艦",219,"elite","tank"],["文明邊境執政官",220,"boss","tank"]]},
  {chapter:"獵戶臂戰爭",name:"獵戶臂殖民群",min:221,max:225,gear:["星群光刃","殖民群戰盔","群星防護甲","群域推進靴","殖民群主控核"],enemies:[["星群巡邏兵",221,"normal","balanced"],["殖民群護衛",222,"normal","attack"],["群星戰機",223,"normal","balanced"],["殖民重艦",224,"elite","tank"],["星群殖民總督",225,"boss","attack"]]},
  {chapter:"獵戶臂戰爭",name:"星際聯盟戰區",min:226,max:230,gear:["聯盟脈衝刃","聯軍戰盔","聯盟主戰甲","聯合作戰靴","聯盟指揮核心"],enemies:[["聯盟星兵",226,"normal","attack"],["聯軍突擊艦",227,"normal","balanced"],["聯盟戰鬥體",228,"normal","tank"],["聯軍攻城艦",229,"elite","tank"],["星際聯盟統帥",230,"boss","balanced"]]},
  {chapter:"獵戶臂戰爭",name:"星區軍械庫",min:231,max:235,gear:["軍械震裂刃","兵器庫戰盔","軍規重甲","武裝推進靴","軍械主控核心"],enemies:[["軍械守衛機",231,"normal","balanced"],["兵器庫巡邏兵",232,"normal","attack"],["武裝戰鬥體",233,"normal","tank"],["重型兵器平台",234,"elite","attack"],["星區軍械中樞",235,"boss","tank"]]},
  {chapter:"獵戶臂戰爭",name:"獵戶臂要塞",min:236,max:240,gear:["要塞重刃","堡壘戰盔","要塞重裝甲","堡區機動靴","要塞控制核心"],enemies:[["要塞守衛兵",236,"normal","balanced"],["堡壘炮衛",237,"normal","tank"],["重裝星兵",238,"normal","attack"],["要塞攻城巨像",239,"elite","tank"],["獵戶臂要塞主腦",240,"boss","balanced"]]},
  {chapter:"獵戶臂戰爭",name:"星區霸權領域",min:241,max:245,gear:["霸權裁決刃","統御戰盔","星區霸權甲","主宰躍遷靴","霸權權限核心"],enemies:[["霸權星兵",241,"normal","attack"],["統御戰鬥機",242,"normal","balanced"],["星區禁衛",243,"normal","attack"],["霸權重裝艦",244,"elite","tank"],["星區霸主",245,"boss","tank"]]},
  {chapter:"獵戶臂戰爭",name:"獵戶臂主戰場",min:246,max:250,gear:["獵戶終戰刃","旋臂主控盔","獵戶主戰甲","終戰星躍靴","獵戶主控核心"],enemies:[["獵戶決戰兵",246,"normal","balanced"],["高階星區戰體",247,"normal","attack"],["獵戶戰爭巨像",248,"normal","balanced"],["旋臂重裝將",249,"elite","tank"],["獵戶臂最高統帥",250,"boss","attack"]]}
 ];
 MAPS.push(...REGION_MAPS);
})();