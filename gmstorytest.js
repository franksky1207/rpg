(function(){
 let selectedRegion="earth";
 let selectedStory="earth-prologue";

 function esc(v){return String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));}
 function regions(){return Array.isArray(window.CIVILIZATION_STORY_REGIONS)?window.CIVILIZATION_STORY_REGIONS:[];}
 function stories(){return window.CIVILIZATION_STORIES||{};}
 function currentRegion(){return regions().find(x=>x.id===selectedRegion)||regions()[0]||null;}
 function regionStories(region=currentRegion()){return Array.isArray(region?.stories)?region.stories:[];}
 function normalizeSelection(){
  const region=currentRegion();
  if(!region){selectedRegion="";selectedStory="";return;}
  selectedRegion=region.id;
  const rows=regionStories(region);
  if(!rows.some(x=>x.id===selectedStory))selectedStory=rows[0]?.id||"";
 }
 function currentStoryRow(){normalizeSelection();return regionStories().find(x=>x.id===selectedStory)||null;}
 function currentStory(){return stories()[selectedStory]||null;}
 function regionOptions(){normalizeSelection();return regions().map(r=>`<option value="${esc(r.id)}" ${r.id===selectedRegion?"selected":""}>${esc(r.name)}</option>`).join("");}
 function storyOptions(){normalizeSelection();return regionStories().map(s=>`<option value="${esc(s.id)}" ${s.id===selectedStory?"selected":""}>${esc(s.label)}</option>`).join("");}
 function currentPositions(){
  normalizeSelection();
  const rs=regions();
  const ri=rs.findIndex(r=>r.id===selectedRegion);
  const rows=regionStories(rs[ri]);
  const si=rows.findIndex(s=>s.id===selectedStory);
  return {regions:rs,regionIndex:ri,rows,storyIndex:si};
 }
 function integrityHtml(){
  const data=window.STORY_INTEGRITY_REPORT;
  const runtime=window.STORY_RUNTIME_INTEGRITY_REPORT;
  const dataText=data?.passed===true?`資料完整性通過・${Number(data.totalStories)||0}/101 篇`:(data?`資料完整性失敗・${data.errors?.length||0} 項錯誤`:"資料完整性尚未執行");
  const runtimeText=runtime?.passed===true?"執行期完整性通過":(runtime?`執行期完整性失敗・${runtime.errors?.length||0} 項錯誤`:"執行期完整性尚未執行");
  return `<div class="muted" style="line-height:1.65">${esc(dataText)}<br>${esc(runtimeText)}</div>`;
 }
 function metaHtml(){
  const story=currentStory();
  const p=currentPositions();
  const row=currentStoryRow();
  if(!story||!row)return `<div class="muted">目前沒有可預覽劇情。</div>`;
  return `<div class="muted" style="line-height:1.65">劇情編號：${esc(story.id)}<br>本區第 ${p.storyIndex+1} / ${p.rows.length} 篇・共 ${Array.isArray(story.pages)?story.pages.length:0} 頁</div>`;
 }
 function navButton(label,fn,disabled){return `<button class="btn" onclick="${fn}" ${disabled?"disabled":""}>${label}</button>`;}

 window.gmStoryTestHtml=function(){
  normalizeSelection();
  const p=currentPositions();
  return `<div class="muted gm-hub-note">直接以正式劇情視窗預覽指定劇情；不修改角色進度、不記錄已讀狀態。</div>
   <div class="card" style="margin-top:10px;padding:12px">${integrityHtml()}<div style="margin-top:8px"><button class="btn" onclick="gmStoryRunIntegrity()">重新檢查完整性</button></div></div>
   <div class="controls" style="align-items:end;margin-top:10px"><label>區域<br><select id="gmStoryRegion" class="btn" onchange="gmStoryChangeRegion(this.value)">${regionOptions()}</select></label><label>劇情<br><select id="gmStoryEntry" class="btn" onchange="gmStoryChangeEntry(this.value)">${storyOptions()}</select></label><button class="btn blue" onclick="gmPreviewStory()">預覽劇情</button></div>
   <div class="card" style="margin-top:10px;padding:12px">${metaHtml()}<div class="controls" style="margin-top:10px">${navButton("← 上一區","gmStoryMoveRegion(-1)",p.regionIndex<=0)}${navButton("下一區 →","gmStoryMoveRegion(1)",p.regionIndex<0||p.regionIndex>=p.regions.length-1)}${navButton("← 上一篇","gmStoryMoveEntry(-1)",p.storyIndex<=0)}${navButton("下一篇 →","gmStoryMoveEntry(1)",p.storyIndex<0||p.storyIndex>=p.rows.length-1)}</div></div>`;
 };
 window.gmStoryChangeRegion=function(id){
  selectedRegion=String(id||"");
  const region=currentRegion();
  selectedStory=region?.stories?.[0]?.id||"";
  if(typeof render==="function")render();
 };
 window.gmStoryChangeEntry=function(id){selectedStory=String(id||"");if(typeof render==="function")render();};
 window.gmStoryMoveRegion=function(delta){
  const p=currentPositions();
  const next=p.regionIndex+Number(delta||0);
  if(next<0||next>=p.regions.length)return false;
  selectedRegion=p.regions[next].id;
  selectedStory=regionStories(p.regions[next])[0]?.id||"";
  if(typeof render==="function")render();
  return true;
 };
 window.gmStoryMoveEntry=function(delta){
  const p=currentPositions();
  const next=p.storyIndex+Number(delta||0);
  if(next<0||next>=p.rows.length)return false;
  selectedStory=p.rows[next].id;
  if(typeof render==="function")render();
  return true;
 };
 window.gmStoryRunIntegrity=function(){
  if(typeof window.runCivilizationStoryIntegrity==="function")window.runCivilizationStoryIntegrity();
  if(typeof window.runCivilizationStoryRuntimeIntegrity==="function")window.runCivilizationStoryRuntimeIntegrity();
  if(typeof render==="function")render();
  return true;
 };
 window.gmPreviewStory=function(){
  normalizeSelection();
  if(!selectedStory||typeof window.openStory!=="function"){alert("劇情預覽模組尚未載入。");return false;}
  if(!window.openStory(selectedStory)){alert("找不到這段劇情。");return false;}
  return true;
 };

 if(typeof window.registerGmHubSection==="function")window.registerGmHubSection("test","劇情測試",window.gmStoryTestHtml,{id:"gm-story-test",open:true,position:"prepend"});
 window.GM_STORY_TEST_VERSION=2;
})();