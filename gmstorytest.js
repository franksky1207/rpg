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
 function issueRows(items,type){
  const rows=Array.isArray(items)?items:[];
  if(!rows.length)return "";
  const title=type==="error"?`錯誤明細（${rows.length}）`:`警告明細（${rows.length}）`;
  const color=type==="error"?"#ff9b9b":"#f1d38b";
  return `<div style="margin-top:8px"><b style="color:${color}">${title}</b><div style="margin-top:5px;display:grid;gap:5px">${rows.map((item,index)=>`<div style="padding:7px 9px;border:1px solid #334153;border-radius:8px;background:#0d141e;line-height:1.5"><span style="color:${color};font-weight:800">${index+1}. ${esc(item?.code||"UNKNOWN")}</span><br><span class="muted">${esc(item?.message||"")}</span></div>`).join("")}</div></div>`;
 }
 function integrityBlock(title,report,passedText,pendingText){
  if(!report)return `<div><b>${esc(title)}</b><div class="muted" style="margin-top:4px">${esc(pendingText)}</div></div>`;
  const passed=report.passed===true;
  const status=passed?passedText:`失敗・${report.errors?.length||0} 項錯誤`;
  const statusColor=passed?"#9fd3a8":"#ff9b9b";
  return `<div><b>${esc(title)}</b><div style="margin-top:4px;color:${statusColor};font-weight:800">${esc(status)}</div>${issueRows(report.errors,"error")}${issueRows(report.warnings,"warning")}</div>`;
 }
 function integrityHtml(){
  const data=window.STORY_INTEGRITY_REPORT;
  const runtime=window.STORY_RUNTIME_INTEGRITY_REPORT;
  const dataPassed=`通過・${Number(data?.totalStories)||0}/101 篇`;
  return `<div style="display:grid;gap:12px">${integrityBlock("資料完整性",data,dataPassed,"尚未執行")}${integrityBlock("執行期完整性",runtime,"通過","尚未執行")}</div>`;
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
   <div class="card" style="margin-top:10px;padding:12px">${integrityHtml()}<div style="margin-top:10px"><button class="btn" onclick="gmStoryRunIntegrity()">重新檢查完整性</button></div></div>
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

 if(typeof window.registerGmHubSection==="function")window.registerGmHubSection("test","劇情測試",window.gmStoryTestHtml,{id:"gm-story-test",position:"prepend"});
 window.GM_STORY_TEST_VERSION=3;
})();