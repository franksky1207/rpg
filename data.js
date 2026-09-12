const SAVE_KEY="frank_text_rpg_save";
const SAVE_VERSION=9;
const GM_PASSWORD=atob("ZnJhbmtza3k=");
const QUALITY=[
  {k:"common",n:"普通",m:1,sm:1},
  {k:"uncommon",n:"優良",m:1.15,sm:1.4},
  {k:"rare",n:"稀有",m:1.35,sm:2},
  {k:"epic",n:"史詩",m:1.6,sm:3.2},
  {k:"legendary",n:"傳說",m:1.95,sm:5},
  {k:"mythic",n:"神話",m:2.4,sm:8}
];

const WORLD_REGIONS=[
  {id:"earth",name:"地球戰爭",min:1,max:50,mapStart:0,mapEnd:9},
  {id:"solar",name:"太陽系戰爭",min:51,max:100,mapStart:10,mapEnd:19},
  {id:"nearstar",name:"近星戰爭",min:101,max:150,mapStart:20,mapEnd:29},
  {id:"frontier",name:"星際邊疆",min:151,max:200,mapStart:30,mapEnd:39},
  {id:"orion",name:"獵戶臂戰爭",min:201,max:250,mapStart:40,mapEnd:49},
  {id:"galactic-frontier",name:"銀河邊境",min:251,max:300,mapStart:50,mapEnd:59},
  {id:"galactic-mid",name:"銀河中域",min:301,max:350,mapStart:60,mapEnd:69},
  {id:"core-outer",name:"銀河核心外圍",min:351,max:400,mapStart:70,mapEnd:79},
  {id:"core-war",name:"銀河核心戰爭",min:401,max:450,mapStart:80,mapEnd:89},
  {id:"galactic-unification",name:"銀河統合戰爭",min:451,max:500,mapStart:90,mapEnd:99}
];

// 正式世界地圖依 WORLD_REGIONS 順序由各 worldmaps-*.js 載入。
const MAPS=[];
