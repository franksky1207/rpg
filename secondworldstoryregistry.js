(function(){
 const VERSION=1;
 const ERA_ID="universe";

 function regions(){return Array.isArray(window.SECOND_WORLD_REGIONS)?window.SECOND_WORLD_REGIONS:[];}
 function bosses(){return Array.isArray(window.SECOND_WORLD_BOSSES)?window.SECOND_WORLD_BOSSES:[];}
 function storyIdForBossIndex(value){
  const index=Math.floor(Number(value));
  const boss=bosses()[index];
  if(!boss)return null;
  const region=regions().find(row=>Number(row.index)===Number(boss.regionIndex));
  if(!region)return null;
  const offset=index-Number(region.firstBossIndex);
  if(offset<0||offset>9)return null;
  return `universe-${region.id}-boss-${offset+1}`;
 }
 function bossIndexForStoryId(id){
  if(typeof id!=="string"||!id)return null;
  for(let index=0;index<bosses().length;index++)if(storyIdForBossIndex(index)===id)return index;
  return null;
 }
 function buildRegistry(){
  return regions().map(region=>Object.freeze({
   id:String(region.id),
   name:String(region.name),
   era:ERA_ID,
   stories:Object.freeze(bosses().filter(boss=>Number(boss.regionIndex)===Number(region.index)).map(boss=>Object.freeze({
    id:storyIdForBossIndex(boss.index),
    label:String(boss.name),
    bossIndex:Number(boss.index),
    bossLevel:Number(boss.level),
    finale:Number(boss.index)===Number(region.lastBossIndex)
   })))
  }));
 }

 const registry=Object.freeze(buildRegistry());
 window.CIVILIZATION_UNIVERSE_STORY_REGIONS=registry;
 window.CIVILIZATION_STORY_ERAS=Object.freeze({
  galaxy:Object.freeze({id:"galaxy",name:"銀河紀元",regions:()=>Array.isArray(window.CIVILIZATION_STORY_REGIONS)?window.CIVILIZATION_STORY_REGIONS:[]}),
  universe:Object.freeze({id:ERA_ID,name:"宇宙紀元",regions:()=>registry})
 });
 window.universeStoryIdForBossIndex=storyIdForBossIndex;
 window.universeBossIndexForStoryId=bossIndexForStoryId;
 window.UNIVERSE_STORY_REGISTRY_VERSION=VERSION;
 window.UNIVERSE_STORY_REGISTRY_READY=registry.length===10&&registry.every(region=>region.stories.length===10)&&new Set(registry.flatMap(region=>region.stories.map(row=>row.id))).size===100;
})();