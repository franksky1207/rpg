(function(){
 const baseRender=render;
 const baseHomePage=homePage;
 homePage=function(){
  return `<section class="home-screen"><div class="home-title"><h2>文明戰線</h2><div class="muted">打怪、升級、換裝，前往更強的地圖。</div></div><div class="menu-grid"><button class="menu-card" onclick="go('adventure')"><b>冒險</b><span>選擇地圖並挑戰怪物</span></button><button class="menu-card" onclick="go('character')"><b>角色</b><span>查看能力與目前裝備</span></button><button class="menu-card" onclick="go('inventory')"><b>背包</b><span>整理、裝備、出售與贖回遺失裝備</span></button><button class="menu-card" onclick="go('enhancement')"><b>強化</b><span>永久提升裝備欄位主能力</span></button><button class="menu-card" onclick="go('specialization')"><b>專精</b><span>消耗金幣提升永久能力</span></button><button class="menu-card" onclick="go('dungeon')"><b>副本</b><span>挑戰懸賞、競技場與虛空幻境</span></button><button class="menu-card" onclick="go('guide')"><b>遊戲說明</b><span>查看玩法與規則</span></button><button class="menu-card" onclick="go('settings')"><b>設定</b><span>自動出售、存檔與遊戲設定</span></button></div></section>`;
 };
 window.homePage=homePage;
 render=function(){
  if(view!=="enhancement")return baseRender();
  renderNav();normalizeHP();ensureSpecializationState();normalizeEnhancementState(state);
  document.getElementById("main").innerHTML=enhancementPage();
  wireSettings();setTimeout(compactMobileDom,0);
 };
 window.render=render;
 if(view==="home")render();
})();
