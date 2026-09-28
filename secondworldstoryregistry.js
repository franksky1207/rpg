(function(){
 const VERSION=2;
 const SHARED_ERA_REGISTRY_VERSION=1;
 const THIRD_WORLD_TRIGGER_REGISTRY_VERSION=1;
 const THIRD_WORLD_TRIGGER_POLICY_VERSION=1;
 const ERA_ID="universe";
 const eraDefinitions=new Map();

 function freeze(value){return Object.freeze(value);}
 function refreshEraSnapshot(){window.CIVILIZATION_STORY_ERAS=freeze(Object.fromEntries(Array.from(eraDefinitions.entries())));return window.CIVILIZATION_STORY_ERAS;}
 function registerStoryEra(definition){
  if(!definition||typeof definition!=="object")return null;
  const id=String(definition.id||"").trim();
  if(!id||typeof definition.regions!=="function")return null;
  const normalized=freeze({...definition,id,name:String(definition.name||id),regions:definition.regions});
  eraDefinitions.set(id,normalized);
  refreshEraSnapshot();
  return normalized;
 }
 function storyEraDefinition(id){return eraDefinitions.get(String(id||""))||null;}
 function storyEraIds(){return freeze(Array.from(eraDefinitions.keys()));}

 registerStoryEra({id:"galaxy",name:"銀河紀元",regions:()=>Array.isArray(window.CIVILIZATION_STORY_REGIONS)?window.CIVILIZATION_STORY_REGIONS:[]});

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
  return regions().map(region=>freeze({
   id:String(region.id),
   name:String(region.name),
   era:ERA_ID,
   stories:freeze(bosses().filter(boss=>Number(boss.regionIndex)===Number(region.index)).map(boss=>freeze({
    id:storyIdForBossIndex(boss.index),
    label:String(boss.name),
    bossIndex:Number(boss.index),
    bossLevel:Number(boss.level),
    finale:Number(boss.index)===Number(region.lastBossIndex)
   })))
  }));
 }

 const registry=freeze(buildRegistry());
 window.CIVILIZATION_UNIVERSE_STORY_REGIONS=registry;
 registerStoryEra({id:ERA_ID,name:"宇宙紀元",regions:()=>registry});

 function titleThreshold(stage){
  const value=Math.max(1,Math.min(10,Math.floor(Number(stage)||0)));
  const def=typeof window.thirdWorldTitleDefinition==="function"?window.thirdWorldTitleDefinition(value):null;
  const threshold=Number(def?.thresholdRemainingPercentSum);
  return Number.isFinite(threshold)?threshold:null;
 }
 const thirdWorldTriggers=freeze([
  freeze({id:"higher-dimensional-intro",storyId:"higher-dimensional-intro",kind:"intro",stage:0,thresholdRemainingPercentSum:null,contentReady:true}),
  ...Array.from({length:9},(_,index)=>{
   const stage=index+1;
   const storyId=`higher-dimensional-milestone-${String(stage).padStart(2,"0")}`;
   return freeze({id:storyId,storyId,kind:"milestone",stage,thresholdRemainingPercentSum:titleThreshold(stage),contentReady:true});
  }),
  freeze({id:"higher-dimensional-final",storyId:"higher-dimensional-final",kind:"final",stage:10,thresholdRemainingPercentSum:titleThreshold(10),completionGate:"all-bosses-defeated",contentReady:true})
 ]);
 function thirdWorldStoryTriggerDescriptors(){return thirdWorldTriggers;}
 function thirdWorldStoryTriggerForStage(value){const stage=Math.floor(Number(value));return thirdWorldTriggers.find(row=>row.stage===stage&&row.kind!=="intro")||null;}
 function thirdWorldStoryTriggerDescriptor(value){
  if(typeof value==="number")return thirdWorldStoryTriggerForStage(value);
  const id=String(value||"");
  return thirdWorldTriggers.find(row=>row.id===id||row.storyId===id)||null;
 }
 registerStoryEra({id:"higher-dimensional",name:"高維紀元",regions:()=>[],triggers:thirdWorldStoryTriggerDescriptors});

 function validateSharedRegistry(){
  const errors=[];
  const ids=storyEraIds();
  if(JSON.stringify(ids)!==JSON.stringify(["galaxy","universe","higher-dimensional"]))errors.push("ERA_ORDER");
  if(registry.length!==10||registry.some(row=>row.stories.length!==10))errors.push("UNIVERSE_REGISTRY");
  if(thirdWorldTriggers.length!==11)errors.push("THIRD_WORLD_TRIGGER_COUNT");
  const milestones=thirdWorldTriggers.filter(row=>row.kind==="milestone"),finals=thirdWorldTriggers.filter(row=>row.kind==="final"),intros=thirdWorldTriggers.filter(row=>row.kind==="intro");
  if(intros.length!==1||milestones.length!==9||finals.length!==1)errors.push("THIRD_WORLD_TRIGGER_TYPES");
  const expectedThresholds=Array.from({length:9},(_,index)=>titleThreshold(index+1));
  if(JSON.stringify(milestones.map(row=>row.stage))!==JSON.stringify([1,2,3,4,5,6,7,8,9]))errors.push("THIRD_WORLD_MILESTONE_STAGES");
  if(JSON.stringify(milestones.map(row=>row.thresholdRemainingPercentSum))!==JSON.stringify(expectedThresholds))errors.push("THIRD_WORLD_MILESTONE_THRESHOLDS");
  if(finals[0]?.stage!==10||finals[0]?.thresholdRemainingPercentSum!==titleThreshold(10)||milestones.some(row=>row.stage===10))errors.push("THIRD_WORLD_FINAL_STAGE10");
  const readyIds=thirdWorldTriggers.filter(row=>row.contentReady===true).map(row=>row.storyId);
  const expectedReady=["higher-dimensional-intro","higher-dimensional-milestone-01","higher-dimensional-milestone-02","higher-dimensional-milestone-03","higher-dimensional-milestone-04","higher-dimensional-milestone-05","higher-dimensional-milestone-06","higher-dimensional-milestone-07","higher-dimensional-milestone-08","higher-dimensional-milestone-09","higher-dimensional-final"];
  if(JSON.stringify(readyIds)!==JSON.stringify(expectedReady))errors.push("THIRD_WORLD_CONTENT_READY_BATCH13_7");
  return freeze({version:SHARED_ERA_REGISTRY_VERSION,passed:errors.length===0,eraIds:ids,thirdWorldTriggerCount:thirdWorldTriggers.length,errors:freeze(errors)});
 }

 window.registerCivilizationStoryEra=registerStoryEra;
 window.getCivilizationStoryEra=storyEraDefinition;
 window.getCivilizationStoryEraIds=storyEraIds;
 window.thirdWorldStoryTriggerDescriptors=thirdWorldStoryTriggerDescriptors;
 window.thirdWorldStoryTriggerForStage=thirdWorldStoryTriggerForStage;
 window.thirdWorldStoryTriggerDescriptor=thirdWorldStoryTriggerDescriptor;
 window.CIVILIZATION_STORY_ERA_REGISTRY_VERSION=SHARED_ERA_REGISTRY_VERSION;
 window.THIRD_WORLD_STORY_TRIGGER_REGISTRY_VERSION=THIRD_WORLD_TRIGGER_REGISTRY_VERSION;
 window.THIRD_WORLD_STORY_TRIGGER_POLICY_VERSION=THIRD_WORLD_TRIGGER_POLICY_VERSION;
 window.THIRD_WORLD_STORY_TRIGGER_DESCRIPTORS=thirdWorldTriggers;
 window.CIVILIZATION_STORY_ERA_REGISTRY_INTEGRITY=validateSharedRegistry();
 window.universeStoryIdForBossIndex=storyIdForBossIndex;
 window.universeBossIndexForStoryId=bossIndexForStoryId;
 window.UNIVERSE_STORY_REGISTRY_VERSION=VERSION;
 window.UNIVERSE_STORY_REGISTRY_READY=registry.length===10&&registry.every(region=>region.stories.length===10)&&new Set(registry.flatMap(region=>region.stories.map(row=>row.id))).size===100;
})();
