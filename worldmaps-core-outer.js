(function(){
 const REGION_MAPS=[
  {chapter:"銀河核心外圍",name:"高密度星區",min:351,max:355,gear:["星壓切界刃","星壓戰盔","核心外圍甲","重力穩定靴","星密度控制核"],enemies:[["高密度星兵",351,"normal","attack"],["重力巡弋體",352,"normal","balanced"],["核心外圍機",353,"normal","tank"],["星壓堡壘艦",354,"elite","tank"],["高密度星區執政官",355,"boss","balanced"]]},
  {chapter:"銀河核心外圍",name:"引力異常帶",min:356,max:360,gear:["引力斷裂刃","重力抑制盔","引力防護甲","重力偏移靴","引力穩定器"],enemies:[["引力獵兵",356,"normal","balanced"],["重力扭曲體",357,"normal","attack"],["引力測界機",358,"normal","tank"],["引力崩解巨兵",359,"elite","attack"],["引力異常中樞",360,"boss","tank"]]},
  {chapter:"銀河核心外圍",name:"黑洞採能區",min:361,max:365,gear:["黑洞切界刃","視界戰盔","奇點防護甲","事件視界靴","黑洞採能節點"],enemies:[["採能警戒兵",361,"normal","balanced"],["視界採能機",362,"normal","tank"],["奇點戰爭單元",363,"normal","attack"],["視界重力艦",364,"elite","tank"],["採能區主控體",365,"boss","balanced"]]},
  {chapter:"銀河核心外圍",name:"奇點兵器工廠",min:366,max:370,gear:["奇點震裂刃","兵器核心盔","奇點主戰甲","空間折躍靴","奇點兵器節點"],enemies:[["奇點守衛機",366,"normal","attack"],["兵器工廠戰兵",367,"normal","balanced"],["空間壓縮體",368,"normal","attack"],["奇點攻城兵器",369,"elite","tank"],["奇點鑄造核心",370,"boss","tank"]]},
  {chapter:"銀河核心外圍",name:"時空擾動區",min:371,max:375,gear:["時空切割刃","時間穩定盔","時空防護甲","相位機動靴","時空校準器"],enemies:[["時空獵兵",371,"normal","balanced"],["相位巡弋體",372,"normal","attack"],["時間扭曲機",373,"normal","balanced"],["時空重裝艦",374,"elite","tank"],["擾動區主控者",375,"boss","attack"]]},
  {chapter:"銀河核心外圍",name:"核心文明邊界",min:376,max:380,gear:["核域斷光刃","文明冠盔","核域文明甲","核域穿行靴","核心文明權印"],enemies:[["核心文明兵",376,"normal","attack"],["文明監察體",377,"normal","balanced"],["核心禁衛",378,"normal","tank"],["文明重裝巨艦",379,"elite","tank"],["核心文明執政官",380,"boss","balanced"]]},
  {chapter:"銀河核心外圍",name:"黑洞防衛圈",min:381,max:385,gear:["黑洞戰刃","視界禁衛盔","黑洞防衛甲","引力推進靴","視界防衛節點"],enemies:[["黑洞禁衛",381,"normal","balanced"],["視界攔截機",382,"normal","attack"],["引力炮衛",383,"normal","tank"],["黑洞鎮界體",384,"elite","attack"],["黑洞守望者",385,"boss","tank"]]},
  {chapter:"銀河核心外圍",name:"奇點研究區",min:386,max:390,gear:["奇點解析刃","研究密封盔","實驗時空甲","相位實驗靴","奇點研究模組"],enemies:[["實驗區警衛體",386,"normal","balanced"],["實驗戰鬥機",387,"normal","tank"],["奇點試驗兵",388,"normal","attack"],["研究區巨型兵器",389,"elite","tank"],["奇點解析中樞",390,"boss","balanced"]]},
  {chapter:"銀河核心外圍",name:"核心戰爭前哨",min:391,max:395,gear:["核心裂星刃","前哨禁衛盔","核心主戰甲","核心相位靴","核心戰術模組"],enemies:[["核心星兵",391,"normal","attack"],["前哨巡弋艦",392,"normal","balanced"],["核心戰術體",393,"normal","attack"],["重裝核心艦",394,"elite","tank"],["核心戰爭司令",395,"boss","tank"]]},
  {chapter:"銀河核心外圍",name:"銀河核心門戶",min:396,max:400,gear:["核心門斷界刃","銀河門衛盔","門域重裝甲","時空穿越靴","銀河核心門鑰"],enemies:[["核心門守衛",396,"normal","balanced"],["時空攔截體",397,"normal","attack"],["銀河門禁衛",398,"normal","balanced"],["核心門堡壘體",399,"elite","tank"],["銀河核心守門者",400,"boss","attack"]]}
 ];
 registerRegionMaps("core-outer",REGION_MAPS);
})();