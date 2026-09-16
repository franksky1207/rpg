(function(){
 let selectedRegion="earth";
 let selectedStory="earth-prologue";

 function regions(){return Array.isArray(window.CIVILIZATION_STORY_REGIONS)?window.CIVILIZATION_STORY_REGIONS:[];}
 function currentRegion(){return regions().find(x=>x.id===selectedRegion)||regions()[0]||null;}
 function normalizeSelection(){
  const region=currentRegion();
  if(!region)return;
  selectedRegion=region.id;
  if(!Array.isArray(region.stories)||!region.stories.some(x=>x.id===selectedStory))selectedStory=region.stories?.[0]?.id||"";
 }
 function regionOptions(){normalizeSelection();return regions().map(r=>`<option value="${r.id}" ${r.id===selectedRegion?"selected":""}>${r.name}</option>`).join("");}
 function storyOptions(){normalizeSelection();const region=currentRegion();return (region?.stories||[]).map(s=>`<option value="${s.id}" ${s.id===selectedStory?"selected":""}>${s.label}</option>`).join("");}

 window.gmStoryTestHtml=function(){
  normalizeSelection();
  return `<div class="muted gm-hub-note">直接以正式劇情視窗預覽指定劇情；不修改角色進度、不記錄已讀狀態。</div><div class="controls" style="align-items:end"><label>區域<br><select id="gmStoryRegion" class="btn" onchange="gmStoryChangeRegion(this.value)">${regionOptions()}</select></label><label>劇情<br><select id="gmStoryEntry" class="btn" onchange="gmStoryChangeEntry(this.value)">${storyOptions()}</select></label><button class="btn blue" onclick="gmPreviewStory()">預覽劇情</button></div>`;
 };
 window.gmStoryChangeRegion=function(id){
  selectedRegion=String(id||"");
  const region=currentRegion();
  selectedStory=region?.stories?.[0]?.id||"";
  if(typeof render==="function")render();
 };
 window.gmStoryChangeEntry=function(id){selectedStory=String(id||"");};
 window.gmPreviewStory=function(){
  normalizeSelection();
  if(!selectedStory||typeof window.openStory!=="function"){alert("劇情預覽模組尚未載入。");return false;}
  if(!window.openStory(selectedStory)){alert("找不到這段劇情。");return false;}
  return true;
 };

 if(typeof window.registerGmHubSection==="function")window.registerGmHubSection("test","劇情測試",window.gmStoryTestHtml,{id:"gm-story-test",open:true,position:"prepend"});
 window.GM_STORY_TEST_VERSION=1;
})();