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

// 正式世界地圖由 worldmaps-earth.js 與 worldmaps-solar.js 載入。
const MAPS=[];
