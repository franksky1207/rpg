(function(){
 const VERSION=1;
 const replacements=[
  ["Boss 戰","首領戰"],
  ["Boss戰","首領戰"],
  ["最後Boss","最後首領"],
  ["因Boss倒下","因首領倒下"],
  ["Boss","首領"]
 ];
 function normalizeText(value){
  let text=String(value??"");
  replacements.forEach(([from,to])=>{text=text.replaceAll(from,to);});
  return text;
 }
 function normalizeValue(value){
  if(typeof value==="string")return normalizeText(value);
  if(Array.isArray(value))return value.map(normalizeValue);
  if(value&&typeof value==="object"){
   const copy={};
   Object.entries(value).forEach(([key,item])=>{copy[key]=normalizeValue(item);});
   return copy;
  }
  return value;
 }
 function run(){
  const stories=window.CIVILIZATION_STORIES||{};
  Object.keys(stories).forEach(id=>{
   const story=stories[id];
   if(!story||typeof story!=="object")return;
   story.chapter=normalizeText(story.chapter);
   story.location=normalizeText(story.location);
   story.title=normalizeText(story.title);
   story.pages=normalizeValue(story.pages);
  });
  const regions=Array.isArray(window.CIVILIZATION_STORY_REGIONS)?window.CIVILIZATION_STORY_REGIONS:[];
  regions.forEach(region=>{
   if(!region||typeof region!=="object")return;
   region.name=normalizeText(region.name);
   if(Array.isArray(region.stories))region.stories.forEach(row=>{if(row&&typeof row==="object")row.label=normalizeText(row.label);});
  });
  window.STORY_TEXT_NORMALIZE_REPORT={version:VERSION,storyCount:Object.keys(stories).length,regionCount:regions.length,ranAt:Date.now()};
  return window.STORY_TEXT_NORMALIZE_REPORT;
 }
 window.STORY_TEXT_NORMALIZE_VERSION=VERSION;
 window.normalizeCivilizationStoryText=run;
 run();
})();
