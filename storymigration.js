(function(){
 const VERSION=5;
 const LEGACY_FIELDS=["historyBackfillRegions"];

 function isObject(v){return !!v&&typeof v==="object"&&!Array.isArray(v);}
 function uniqueStrings(values){return Array.from(new Set((Array.isArray(values)?values:[]).filter(v=>typeof v==="string"&&v)));}
 function freshProgress(){return {pendingStory:null,completedStories:[],introCompleted:false,starterGearReceived:false};}
 function legacyProgress(introStoryId){return {pendingStory:null,completedStories:[introStoryId],introCompleted:true,starterGearReceived:true};}

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

  // Retired legacy field. Repair/backfill is derived from bossKilled,
  // pendingStory and completedStories, so the old region marker is no longer persisted.
  if(Object.prototype.hasOwnProperty.call(p,"historyBackfillRegions")){
   delete p.historyBackfillRegions;
   changed=true;
  }

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
  legacyFields:LEGACY_FIELDS.slice(),
  migrate,
  normalizeFields,
  backfillAvailableHistory
 };
 window.STORY_MIGRATION_VERSION=VERSION;
})();