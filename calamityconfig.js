(function(){
 const CONFIG_VERSION=2;
 const ROWS=[
  {calamityName:"灰潮母巢",markId:"ward",markName:"護界印記",titleId:"calamity_title_01",titleName:"灰潮餘燼"},
  {calamityName:"日蝕王座",markId:"suppression",markName:"壓制印記",titleId:"calamity_title_02",titleName:"蝕日王冠"},
  {calamityName:"星骸迴廊",markId:"composure",markName:"鎮心印記",titleId:"calamity_title_03",titleName:"星骸殘響"},
  {calamityName:"黑域牧者",markId:"indomitable",markName:"不屈印記",titleId:"calamity_title_04",titleName:"黑域孤星"},
  {calamityName:"滅世天環",markId:"resilience",markName:"韌性印記",titleId:"calamity_title_05",titleName:"天環墜落"},
  {calamityName:"寂滅方舟",markId:"battleSpirit",markName:"戰意印記",titleId:"calamity_title_06",titleName:"寂滅遠航"},
  {calamityName:"萬域蝕潮",markId:"absorption",markName:"吸收印記",titleId:"calamity_title_07",titleName:"萬域寂滅"},
  {calamityName:"深核奇點",markId:"revenge",markName:"復仇印記",titleId:"calamity_title_08",titleName:"黑核權柄"},
  {calamityName:"無聲裁決",markId:"backlash",markName:"反噬印記",titleId:"calamity_title_09",titleName:"無聲王權"},
  {calamityName:"終末之眼",markId:"ignore",markName:"無視印記",titleId:"calamity_title_10",titleName:"萬星終寂"}
 ];
 const regions=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[];
 if(regions.length!==ROWS.length)throw new Error("Civilization Calamity config requires exactly 10 WORLD_REGIONS.");
 const CONFIG=Object.freeze(ROWS.map((row,index)=>{
  const region=regions[index];
  if(!region?.id)throw new Error(`Civilization Calamity config missing region at index ${index}.`);
  return Object.freeze({
   index,
   id:String(region.id),
   regionId:String(region.id),
   regionName:String(region.name||""),
   unlockLevel:Math.max(1,Math.floor(Number(region.max)||((index+1)*50))),
   mapIndex:Math.max(0,Math.floor(Number(region.mapEnd)||(index*10+9))),
   calamityName:row.calamityName,
   markId:row.markId,
   markName:row.markName,
   titleId:row.titleId,
   titleName:row.titleName
  });
 }));
 window.CIVILIZATION_CALAMITY_CONFIG_VERSION=CONFIG_VERSION;
 window.CIVILIZATION_CALAMITY_CONFIG=CONFIG;
 window.CIVILIZATION_CALAMITY_IDS=Object.freeze(CONFIG.map(entry=>entry.id));
 window.CIVILIZATION_MARK_IDS=Object.freeze(CONFIG.map(entry=>entry.markId));
})();
