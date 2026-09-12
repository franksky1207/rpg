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

// 正式世界地圖由固定 region id 註冊到 WORLD_REGIONS 指定位置。
// 不依賴 push / splice 或 script 載入先後決定 map index；同一區重複註冊只覆寫自己的固定區段。
const MAPS=[];
const WORLD_MAP_REGISTRY=new Map();

function registerRegionMaps(regionId,regionMaps){
  const region=WORLD_REGIONS.find(x=>x.id===regionId);
  if(!region)throw new Error(`[世界地圖] 找不到區域 id：${regionId}`);
  const expectedCount=region.mapEnd-region.mapStart+1;
  if(!Array.isArray(regionMaps)||regionMaps.length!==expectedCount){
    throw new Error(`[世界地圖] ${region.name} 必須註冊 ${expectedCount} 張地圖，實際 ${Array.isArray(regionMaps)?regionMaps.length:"非陣列"}`);
  }
  regionMaps.forEach((map,offset)=>{
    if(!map||typeof map!=="object")throw new Error(`[世界地圖] ${region.name} 第 ${offset+1} 張資料無效`);
    const expectedMin=region.min+offset*5,expectedMax=expectedMin+4;
    if(map.min!==expectedMin||map.max!==expectedMax){
      throw new Error(`[世界地圖] ${region.name} 第 ${offset+1} 張等級應為 Lv${expectedMin}～${expectedMax}`);
    }
    if(map.chapter!==region.name){
      throw new Error(`[世界地圖] ${map.name||`第 ${offset+1} 張`} chapter 應為「${region.name}」`);
    }
    const targetIndex=region.mapStart+offset;
    const existing=MAPS[targetIndex];
    if(existing&&existing.chapter!==region.name){
      throw new Error(`[世界地圖] index ${targetIndex} 已被「${existing.chapter||"未知區域"}」占用`);
    }
    MAPS[targetIndex]=map;
  });
  WORLD_MAP_REGISTRY.set(region.id,regionMaps.slice());
  return {id:region.id,name:region.name,start:region.mapStart,end:region.mapEnd,count:expectedCount};
}

function validateWorldMapRegistration(){
  const errors=[];
  const registered=[];
  WORLD_REGIONS.forEach(region=>{
    const expected=region.mapEnd-region.mapStart+1;
    const source=WORLD_MAP_REGISTRY.get(region.id);
    if(!source){errors.push({code:"REGION_NOT_REGISTERED",region:region.id,message:`${region.name} 尚未註冊`});return;}
    registered.push(region.id);
    if(source.length!==expected)errors.push({code:"REGION_COUNT",region:region.id,message:`${region.name} 地圖數 ${source.length}/${expected}`});
    for(let i=region.mapStart;i<=region.mapEnd;i++){
      const map=MAPS[i];
      if(!map)errors.push({code:"MAP_SLOT_EMPTY",region:region.id,index:i,message:`${region.name} 第 ${i-region.mapStart+1} 張地圖缺失`});
      else if(map.chapter!==region.name)errors.push({code:"MAP_SLOT_REGION",region:region.id,index:i,message:`index ${i} chapter 不屬於 ${region.name}`});
    }
  });
  const expectedTotal=WORLD_REGIONS.reduce((max,region)=>Math.max(max,region.mapEnd+1),0);
  const populated=Array.from({length:expectedTotal},(_,i)=>MAPS[i]).filter(Boolean).length;
  if(populated!==expectedTotal)errors.push({code:"WORLD_MAP_TOTAL",message:`世界地圖實際 ${populated}/${expectedTotal}`});
  return {passed:errors.length===0,expectedTotal,populated,registered,errors};
}
