const SAVE_KEY="frank_text_rpg_save";
const SAVE_VERSION=2;
const GM_PASSWORD="franksky";
const QUALITY=[
  {k:"common",n:"普通",m:1,sm:1},
  {k:"uncommon",n:"優良",m:1.15,sm:1.4},
  {k:"rare",n:"稀有",m:1.35,sm:2},
  {k:"epic",n:"史詩",m:1.6,sm:3.2},
  {k:"legendary",n:"傳說",m:1.95,sm:5},
  {k:"mythic",n:"神話",m:2.4,sm:8}
];
const MAPS=[
 {name:"新手平原",min:1,max:5,gear:["短鐵劍","粗布皮甲","青草護符"],enemies:[["軟泥怪",1,"normal","tank"],["草原角兔",2,"normal","balanced"],["灰鬃野犬",3,"normal","attack"],["獨眼蠻豬",4,"elite","balanced"],["大地巨角獸",5,"boss","tank"]]},
 {name:"幽暗森林",min:6,max:10,gear:["獵狼長劍","荊棘皮甲","森靈項鍊"],enemies:[["夜光菇怪",6,"normal","tank"],["黑牙狼",7,"normal","attack"],["木面哥布林",8,"normal","balanced"],["荊棘獵殺者",9,"elite","attack"],["千年森熊",10,"boss","tank"]]},
 {name:"廢棄礦坑",min:11,max:15,gear:["黑鐵戰斧","礦鋼鎧甲","晶礦戒指"],enemies:[["礦穴蝙蝠",11,"normal","attack"],["鐵殼甲蟲",12,"normal","tank"],["狂暴礦工亡魂",13,"normal","balanced"],["地底碎岩獸",14,"elite","tank"],["深礦巨魔",15,"boss","balanced"]]},
 {name:"荒蕪沙漠",min:16,max:20,gear:["流沙彎刀","赤砂戰甲","烈日墜飾"],enemies:[["沙穴毒蠍",16,"normal","balanced"],["赤背蜥蜴",17,"normal","attack"],["流沙亡者",18,"normal","tank"],["風暴獵蠍",19,"elite","attack"],["黃金沙蟲王",20,"boss","tank"]]},
 {name:"毒霧沼澤",min:21,max:25,gear:["毒牙短刃","腐藤護甲","瘴氣寶珠"],enemies:[["腐泥蛙",21,"normal","tank"],["毒牙水蛇",22,"normal","attack"],["沼行屍",23,"normal","balanced"],["腐蝕鱷獸",24,"elite","tank"],["瘴氣九眼蟾",25,"boss","balanced"]]},
 {name:"冰封山脈",min:26,max:30,gear:["寒霜巨劍","冰晶重鎧","雪魄護符"],enemies:[["雪原巨鼠",26,"normal","attack"],["冰牙狼",27,"normal","balanced"],["寒晶魔像",28,"normal","tank"],["白峰雪怪",29,"elite","balanced"],["極寒猛獁王",30,"boss","tank"]]},
 {name:"遠古遺跡",min:31,max:35,gear:["古文明戰刃","遺跡守護甲","失落王印"],enemies:[["失落守衛",31,"normal","balanced"],["石棺亡靈",32,"normal","tank"],["古代機關獸",33,"normal","attack"],["黃金戰像",34,"elite","tank"],["遺跡守門者",35,"boss","balanced"]]},
 {name:"火焰山谷",min:36,max:40,gear:["熔火戰劍","炎核鎧甲","赤焰魔石"],enemies:[["熔岩蜥",36,"normal","balanced"],["火羽惡鳥",37,"normal","attack"],["焦骨戰士",38,"normal","tank"],["熔核巨人",39,"elite","tank"],["赤炎飛龍",40,"boss","attack"]]},
 {name:"黑暗城堡",min:41,max:45,gear:["闇夜斬刃","黑王戰鎧","血月戒指"],enemies:[["無首騎士",41,"normal","balanced"],["血翼惡魔",42,"normal","attack"],["黑鎧守衛",43,"normal","tank"],["深紅處刑者",44,"elite","attack"],["不死領主",45,"boss","balanced"]]},
 {name:"魔王領域",min:46,max:50,gear:["終焉魔劍","深淵魔鎧","魔王之眼"],enemies:[["深淵獵犬",46,"normal","attack"],["虛空魔眼",47,"normal","balanced"],["墮落戰將",48,"normal","tank"],["魔界大將軍",49,"elite","balanced"],["終焉魔王",50,"boss","tank"]]}
];
