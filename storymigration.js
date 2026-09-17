(function(){
 const VERSION=4;
 const LEGACY_FIELDS=["historyBackfillRegions"];

 function isObject(v){return !!v&&typeof v==="object"&&!Array.isArray(v);}
 function uniqueStrings(values){return Array.from(new Set((Array.isArray(values)?values:[]).filter(v=>typeof v==="string"&&v)));}
 function freshProgress(){return {pendingStory:null,completedStories:[],introCompleted:false,starterGearReceived:false,historyBackfillRegions:[]};}
 function legacyProgress(introStoryId){return {pendingStory:null,completedStories:[introStoryId],introCompleted:true,starterGearReceived:true,historyBackfillRegions:[]};}

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

  const pending=typeof p.pendingStory==="string"&&p.pendingStory?p.pendingStory:null;
  if(p.pendingStory!==pending){p.pendingStory=pending;changed=true;}

  const completed=uniqueStrings(p.completedStories);
  if(JSON.stringify(completed)!==JSON.stringify(p.completedStories)){p.completedStories=completed;changed=true;}

  const introCompleted=p.introCompleted===true;
  if(p.introCompleted!==introCompleted){p.introCompleted=introCompleted;changed=true;}

  const starterGearReceived=p.starterGearReceived===true;
  if(p.starterGearReceived!==starterGearReceived){p.starterGearReceived=starterGearReceived;changed=true;}

  // Legacy save compatibility only. This field is informational and never
  // controls whether repair/backfill is allowed to run.
  const history=uniqueStrings(p.historyBackfillRegions);
  if(JSON.stringify(history)!==JSON.stringify(p.historyBackfillRegions)){p.historyBackfillRegions=history;changed=true;}

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
   const regionId=typeof region?.id==="string"?region.id:"";
   if(!regionId)continue;
   const ids=(Array.isArray(region?.stories)?region.stories:[])
    .map(x=>x?.id)
    .filter(id=>typeof id==="string"&&/-boss-\d+$/.test(id));
   if(!ids.length||ids.some(id=>!stories[id]))continue;

   let regionHasClearedBoss=false;
   ids.forEach(id=>{
    const mapIdx=bossMapIndexForStory(id);
    if(mapIdx==null)return;
    if(target.bossKilled?.[mapIdx]!==true)return;
    regionHasClearedBoss=true;
    if(p.pendingStory===id)return;
    if(p.completedStories.includes(id))return;
    p.completedStories.push(id);
    changed=true;
   });

   // Legacy compatibility field only: historyBackfillRegions is informational.
   // It must never suppress repair passes or decide whether a story is completed.
   if(regionHasClearedBoss&&!p.historyBackfillRegions.includes(regionId)){
    p.historyBackfillRegions.push(regionId);
    changed=true;
   }
  }

  const completed=uniqueStrings(p.completedStories);
  if(JSON.stringify(completed)!==JSON.stringify(p.completedStories)){p.completedStories=completed;changed=true;}
  const history=uniqueStrings(p.historyBackfillRegions);
  if(JSON.stringify(history)!==JSON.stringify(p.historyBackfillRegions)){p.historyBackfillRegions=history;changed=true;}
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
  legacyFields:LEGACY_FIELDS.slice(),
  migrate,
  normalizeFields,
  backfillAvailableHistory
 };
 window.STORY_MIGRATION_VERSION=VERSION;
})();