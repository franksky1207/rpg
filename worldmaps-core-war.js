(function(){
 const REGION_MAPS=[
  {chapter:"銀河核心戰爭",name:"核心文明戰區",min:401,max:405,gear:["星河戰刃","核心冠盔","文明核心甲","星河跨域靴","文明核心權限"],enemies:[["星河核心禁衛",401,"normal","attack"],["星河突擊體",402,"normal","balanced"],["文明禁衛",403,"normal","tank"],["核心戰艦",404,"elite","tank"],["核心文明總司令",405,"boss","balanced"]]},
  {chapter:"銀河核心戰爭",name:"恆星兵器陣列",min:406,max:410,gear:["恆星灼刃","日核戰盔","恆星防護甲","光壓推進靴","恆星兵器節點"],enemies:[["恆星守衛體",406,"normal","balanced"],["日核戰兵",407,"normal","attack"],["恆星炮機",408,"normal","tank"],["恆星攻城巨兵",409,"elite","attack"],["兵器陣列主控體",410,"boss","tank"]]},
  {chapter:"銀河核心戰爭",name:"星河艦隊戰場",min:411,max:415,gear:["星河艦刃","艦隊統帥盔","星河艦戰甲","艦橋躍遷靴","星河艦隊權印"],enemies:[["星河艦兵",411,"normal","balanced"],["星河攔截機",412,"normal","tank"],["星河艦戰單元",413,"normal","attack"],["核心戰列艦",414,"elite","tank"],["星河艦隊統帥",415,"boss","balanced"]]},
  {chapter:"銀河核心戰爭",name:"文明終結區",min:416,max:420,gear:["滅界執行刃","滅文明戰盔","終結主戰甲","毀滅相位靴","終結協議權限"],enemies:[["終結星兵",416,"normal","attack"],["記憶清除機",417,"normal","balanced"],["終結執行體",418,"normal","attack"],["文明終結巨構",419,"elite","tank"],["終結協議主腦",420,"boss","tank"]]},
  {chapter:"銀河核心戰爭",name:"核心巨構帶",min:421,max:425,gear:["巨構切界刃","巨構控制盔","星河巨構甲","巨構機動靴","巨構控制節點"],enemies:[["巨構鎮界兵",421,"normal","balanced"],["巨構監巡體",422,"normal","attack"],["巨構防衛單元",423,"normal","balanced"],["星河戰爭要塞",424,"elite","tank"],["巨構控制中樞",425,"boss","attack"]]},
  {chapter:"銀河核心戰爭",name:"銀河禁衛領域",min:426,max:430,gear:["禁衛鎮界刃","銀河禁衛冠","禁衛主戰甲","銀河相位靴","禁衛權印"],enemies:[["銀河禁衛",426,"normal","attack"],["核心禁衛機",427,"normal","balanced"],["星河護衛體",428,"normal","tank"],["禁衛戰爭巨艦",429,"elite","tank"],["銀河禁衛長",430,"boss","balanced"]]},
  {chapter:"銀河核心戰爭",name:"星河裁決區",min:431,max:435,gear:["星河裁決刃","裁決官冠盔","星河審判甲","裁決追跡靴","星河裁決權柄"],enemies:[["裁決星兵",431,"normal","balanced"],["審判執行體",432,"normal","attack"],["星河執行機",433,"normal","tank"],["裁決審判巨兵",434,"elite","attack"],["星河裁決官",435,"boss","tank"]]},
  {chapter:"銀河核心戰爭",name:"銀河核心王座區",min:436,max:440,gear:["王權星刃","核心王冠盔","王座統御甲","王權相位靴","銀河王座權印"],enemies:[["王座禁衛",436,"normal","balanced"],["核心王權兵",437,"normal","tank"],["王座統御衛",438,"normal","attack"],["王座巨艦",439,"elite","tank"],["銀河王座執政者",440,"boss","balanced"]]},
  {chapter:"銀河核心戰爭",name:"星河霸權決戰線",min:441,max:445,gear:["霸權斷界刃","星河統御盔","星河征服甲","霸權征途靴","星河霸權權柄"],enemies:[["霸權禁衛兵",441,"normal","attack"],["星河征戰體",442,"normal","balanced"],["銀河戰爭機",443,"normal","attack"],["星河征服母艦",444,"elite","tank"],["星河霸權司令",445,"boss","tank"]]},
  {chapter:"銀河核心戰爭",name:"銀河核心王戰區",min:446,max:450,gear:["核心王戰刃","銀河主控盔","核心終戰甲","王座決戰靴","銀河核心權柄"],enemies:[["終戰核心兵",446,"normal","balanced"],["星河王權戰體",447,"normal","attack"],["銀河核心巨構體",448,"normal","balanced"],["核心重裝元帥",449,"elite","tank"],["銀河核心支配中樞",450,"boss","attack"]]}
 ];
 registerRegionMaps("core-war",REGION_MAPS);
})();