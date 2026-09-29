(function(){
 const VERSION=7;
 const STORY_REFERENCE_RECOVERY_VERSION=1;
 const THIRD_WORLD_STORY_CONTENT_MIGRATION_VERSION=1;
 const THIRD_WORLD_STORY_CONTENT_VERSION=1;
 const THIRD_WORLD_STORY_PREFIX="higher-dimensional-";
 const LEGACY_FIELDS=["historyBackfillRegions"];

 function isObject(v){return !!v&&typeof v==="object"&&!Array.isArray(v);}
 function uniqueStrings(values){return Array.from(new Set((Array.isArray(values)?values:[]).filter(v=>typeof v==="string"&&v)));}
 function finiteWhole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function freshProgress(){return {pendingStory:null,completedStories:[],introCompleted:false,starterGearReceived:false,thirdWorldContentVersion:THIRD_WORLD_STORY_CONTENT_VERSION};}
 function legacyProgress(introStoryId){return {pendingStory:null,completedStories:[introStoryId],introCompleted:true,starterGearReceived:true,thirdWorldContentVersion:THIRD_WORLD_STORY_CONTENT_VERSION};}
 function thirdWorldStoryId(id){
  const key=typeof id==="string"?id:"";
  if(!key)return false;
  if(typeof window.thirdWorldStoryTriggerDescriptor==="function")return !!window.thirdWorldStoryTriggerDescriptor(key);
  return key.startsWith(THIRD_WORLD_STORY_PREFIX);
 }
 function reconcileThirdWorldContentVersion(target){
  if(!isObject(target)||!isObject(target.storyProgress)||!isObject(target.thirdWorld))return {changed:false,applied:false,reason:"unavailable"};
  const p=target.storyProgress,raw=Math.max(0,finiteWhole(p.thirdWorldContentVersion,0));
  if(raw>THIRD_WORLD_STORY_CONTENT_VERSION){
   const report={version:THIRD_WORLD_STORY_CONTENT_MIGRATION_VERSION,applied:false,changed:false,reason:"future-content-version",fromVersion:raw,toVersion:THIRD_WORLD_STORY_CONTENT_VERSION,removedCompleted:[],removedPending:null};
   window.LAST_STORY_CONTENT_MIGRATION_REPORT=report;return report;
  }
  if(raw===THIRD_WORLD_STORY_CONTENT_VERSION){
   const report={version:THIRD_WORLD_STORY_CONTENT_MIGRATION_VERSION,applied:false,changed:false,reason:"current",fromVersion:raw,toVersion:THIRD_WORLD_STORY_CONTENT_VERSION,removedCompleted:[],removedPending:null};
   window.LAST_STORY_CONTENT_MIGRATION_REPORT=report;return report;
  }
  const completed=uniqueStrings(p.completedStories),removedCompleted=completed.filter(thirdWorldStoryId),keptCompleted=completed.filter(id=>!thirdWorldStoryId(id)),pending=typeof p.pendingStory==="string"&&thirdWorldStoryId(p.pendingStory)?p.pendingStory:null;
  let changed=false;
  if(JSON.stringify(keptCompleted)!==JSON.stringify(completed)){p.completedStories=keptCompleted;changed=true;}
  if(pending){p.pendingStory=null;changed=true;}
  if(p.thirdWorldContentVersion!==THIRD_WORLD_STORY_CONTENT_VERSION){p.thirdWorldContentVersion=THIRD_WORLD_STORY_CONTENT_VERSION;changed=true;}
  const report={version:THIRD_WORLD_STORY_CONTENT_MIGRATION_VERSION,applied:true,changed,reason:"legacy-w3-story-history-reset",fromVersion:raw,toVersion:THIRD_WORLD_STORY_CONTENT_VERSION,removedCompleted,removedPending:pending};
  window.LAST_STORY_CONTENT_MIGRATION_REPORT=report;return report;
 }

 function ensureContainer(target,options){
  if(!isObject(target))return {changed:false,created:false};
  if(isObject(target.storyProgress))return {changed:false,created:false};
  const introStoryId=String(options?.introStoryId||"earth-prologue");
  const useLegacy=options?.fresh===true?false:options?.legacy===true;
  target.storyProgress=useLegacy?legacyProgress(introStoryId):freshProgress();
  return {changed:true,created:true};
 }

 function normalizeFields(target,options){
  if(!isObject(target)||!isObject(target.storyProgress))return false;
  const introStoryId=String(options?.introStoryId||"earth-prologue");
  const p=target.storyProgress;
  let changed=false;

  const stories=options?.stories&&typeof options.stories==="object"?options.stories:{},knownIds=Object.keys(stories),canValidateReferences=knownIds.length>0;
  const pendingRaw=typeof p.pendingStory==="string"&&p.pendingStory?p.pendingStory:null;
  const pending=pendingRaw&&(!canValidateReferences||Object.prototype.hasOwnProperty.call(stories,pendingRaw))?pendingRaw:null;
  if(p.pendingStory!==pending){p.pendingStory=pending;changed=true;}

  let completed=uniqueStrings(p.completedStories);
  if(canValidateReferences)completed=completed.filter(id=>Object.prototype.hasOwnProperty.call(stories,id));
  if(JSON.stringify(completed)!==JSON.stringify(p.completedStories)){p.completedStories=completed;changed=true;}

  const introCompleted=p.introCompleted===true;
  if(p.introCompleted!==introCompleted){p.introCompleted=introCompleted;changed=true;}

  const starterGearReceived=p.starterGearReceived===true;
  if(p.starterGearReceived!==starterGearReceived){p.starterGearReceived=starterGearReceived;changed=true;}

  // Retired legacy field. Repair/backfill is derived from bossKilled,
  // pendingStory and completedStories, so the old region marker is no longer persisted.
  if(Object.prototype.hasOwnProperty.call(p,"historyBackfillRegions")){
   delete p.historyBackfillRegions;
   changed=true;
  }

  const w3Content=reconcileThirdWorldContentVersion(target);
  if(w3Content.changed===true)changed=true;

  if(p.introCompleted&&!p.completedStories.includes(introStoryId)){p.completedStories.unshift(introStoryId);changed=true;}
  if(target.introSeen!==p.introCompleted){target.introSeen=p.introCompleted;changed=true;}
  return changed;
 }

 function backfillAvailableHistory(target,options){
  if(!isObject(target)||!isObject(target.storyProgress))return false;
  const p=target.storyProgress;
  const regions=Array.isArray(options?.regions)?options.regions:[];
  const stories=options?.stories&&typeof options.stories==="object"?options.stories:{};
  const bossMapIndexForStory=typeof options?.bossMapIndexForStory==="function"?options.bossMapIndexForStory:null;
  if(!bossMapIndexForStory)return false;

  let changed=false;
  for(const region of regions){
   const ids=(Array.isArray(region?.stories)?region.stories:[])
    .map(x=>x?.id)
    .filter(id=>typeof id==="string"&&/-boss-\d+$/.test(id));
   if(!ids.length||ids.some(id=>!stories[id]))continue;

   ids.forEach(id=>{
    const mapIdx=bossMapIndexForStory(id);
    if(mapIdx==null)return;
    if(target.bossKilled?.[mapIdx]!==true)return;
    if(p.pendingStory===id)return;
    if(p.completedStories.includes(id))return;
    p.completedStories.push(id);
    changed=true;
   });
  }

  const completed=uniqueStrings(p.completedStories);
  if(JSON.stringify(completed)!==JSON.stringify(p.completedStories)){p.completedStories=completed;changed=true;}
  return changed;
 }

 function migrate(target,options={}){
  if(!isObject(target))return {changed:false,created:false,backfilled:false};
  const ensured=ensureContainer(target,options);
  let changed=ensured.changed;
  if(normalizeFields(target,options))changed=true;
  const backfilled=options?.skipBackfill===true?false:backfillAvailableHistory(target,options);
  if(backfilled)changed=true;
  return {changed,created:ensured.created,backfilled};
 }

 window.civilizationStoryMigration={
  version:VERSION,
  referenceRecoveryVersion:STORY_REFERENCE_RECOVERY_VERSION,
  thirdWorldStoryContentMigrationVersion:THIRD_WORLD_STORY_CONTENT_MIGRATION_VERSION,
  thirdWorldStoryContentVersion:THIRD_WORLD_STORY_CONTENT_VERSION,
  legacyFields:LEGACY_FIELDS.slice(),
  migrate,
  normalizeFields,
  backfillAvailableHistory,
  reconcileThirdWorldContentVersion
 };
 window.STORY_MIGRATION_VERSION=VERSION;
 window.STORY_REFERENCE_RECOVERY_VERSION=STORY_REFERENCE_RECOVERY_VERSION;
 window.THIRD_WORLD_STORY_CONTENT_MIGRATION_VERSION=THIRD_WORLD_STORY_CONTENT_MIGRATION_VERSION;
 window.THIRD_WORLD_STORY_CONTENT_VERSION=THIRD_WORLD_STORY_CONTENT_VERSION;
})();
